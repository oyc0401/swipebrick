export class SoundManager {
  private static instance: SoundManager | null = null;

  private ctx?: AudioContext;
  private buffer?: AudioBuffer;

  private master?: GainNode;
  private gains: GainNode[] = [];
  private poolSize = 24; // 동시 발음 수
  private nextIndex = 0;

  // 상태
  private unlocked = false; // 실제 running 여부
  private unlocking = false; // resume() 진행 중인지
  private isSettingUp = false; // 그래프/버퍼 준비 중인지

  // 단발 씹힘 방지용 큐
  private pendings = 0; // 준비 전 들어온 "한 번" 요청 수
  private flushScheduled = false;
  private pendingRetry?: number; // rAF id (보조 재시도)

  // 파라미터
  private volume = 0.3;
  private lookahead = 0.008; // 기본 8ms
  private assetUrl = "/ball_sound.wav"; // 짧은 mono WAV 권장(50~200ms)

  // HTMLAudio 폴백(사전 프리로드)
  private htmlAudio?: HTMLAudioElement;

  private constructor() {
    this.installUnlockHandlers();
    this.htmlAudio = new Audio(this.assetUrl);
    this.htmlAudio.preload = "auto";
  }

  public static getInstance(): SoundManager {
    if (!this.instance) this.instance = new SoundManager();
    return this.instance;
  }

  // --- 언락/복구 -------------------------------------------------------------

  private installUnlockHandlers(): void {
    const tryUnlock = async () => {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext ||
          (window as any).webkitAudioContext)({
          latencyHint: "interactive",
        } as any);
      }

      if (this.ctx.state !== "running") {
        this.unlocking = true;
        try {
          await this.ctx.resume();
        } finally {
          this.unlocking = false;
        }
      }

      if (this.ctx.state === "running") {
        this.unlocked = true;
        window.removeEventListener("pointerdown", tryUnlock, true);
        window.removeEventListener("keydown", tryUnlock, true);
        // visibilitychange 핸들러는 유지(복귀 자동 resume)
        if (!this.isSettingUp) {
          await this.setupGraph().catch(console.warn);
        }
        this.flushPending(); // 언락+세팅 완료 직후 대기 중이던 첫 방 보장
      }
    };

    // 성공할 때까지 시도해야 하므로 once:false
    window.addEventListener("pointerdown", tryUnlock, { capture: true });
    window.addEventListener("keydown", tryUnlock, { capture: true });
    document.addEventListener("visibilitychange", this.onVisibilityChange);
  }

  private onVisibilityChange = async () => {
    if (
      document.visibilityState === "visible" &&
      this.ctx?.state === "suspended"
    ) {
      try {
        await this.ctx.resume();
      } catch {}
      // 복귀 직후 대기중 단발이 있었다면 다음 프레임에 비우도록
      this.scheduleFlushPending();
    }
  };

  // --- 그래프 구성/버퍼 디코드 ----------------------------------------------

  private async setupGraph(): Promise<void> {
    if (!this.ctx || this.isSettingUp) return;
    this.isSettingUp = true;

    // 마스터 게인
    this.master = this.ctx.createGain();
    this.master.gain.value = this.volume;
    this.master.connect(this.ctx.destination);

    // 효과음 디코드(한 번만)
    const res = await fetch(this.assetUrl);
    const buf = await res.arrayBuffer();
    this.buffer = await this.ctx.decodeAudioData(buf);

    // 폴리포니 게인 풀 (destination에 미리 연결)
    for (let i = 0; i < this.poolSize; i++) {
      const g = this.ctx.createGain();
      g.gain.value = 0.0001; // 초기 0에 가까운 값
      g.connect(this.master);
      this.gains.push(g);
    }

    this.isSettingUp = false;
  }

  // --- 일반 설정 -------------------------------------------------------------

  public setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.master) this.master.gain.value = this.volume;
  }

  private effectiveLookahead(): number {
    const base = this.ctx?.baseLatency ?? 0;
    // 일부 브라우저는 baseLatency가 10~20ms대일 수 있음
    return Math.max(this.lookahead, base, 0.006);
  }

  // --- 단발 보장 큐 ----------------------------------------------------------

  private scheduleFlushPending() {
    if (this.flushScheduled) return;
    this.flushScheduled = true;
    requestAnimationFrame(() => {
      this.flushScheduled = false;
      this.flushPending();
    });
  }

  private flushPending() {
    if (!this.ctx || !this.master || !this.buffer) return;
    if (!this.unlocked || this.ctx.state !== "running") return;

    const n = this.pendings;
    this.pendings = 0;

    if (n > 0) {
      // 한 번만 보장해서 과도한 버스트 방지
      this.playBallSound();
    }
  }

  private enqueueOneShotRetry(loudness: number) {
    if (this.pendingRetry) return;
    this.pendingRetry = requestAnimationFrame(() => {
      this.pendingRetry && cancelAnimationFrame(this.pendingRetry);
      this.pendingRetry = undefined;
      this.playBallSound(loudness);
    });
  }

  // --- 재생 ------------------------------------------------------------------

  public playBallSound(loudness = 1): void {
    // 준비 전이면 큐에 쌓고, 준비되면 rAF/flush로 한 번 발사
    if (
      !this.unlocked ||
      this.unlocking ||
      !this.ctx ||
      !this.master ||
      this.ctx.state !== "running" ||
      !this.buffer
    ) {
      // 가능한 복구 작업은 미리 시도
      if (this.ctx?.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      if (this.unlocked && !this.buffer && !this.isSettingUp) {
        this.setupGraph().catch(console.warn);
      }
      this.pendings++;
      this.scheduleFlushPending(); // 다음 프레임에 비우기 시도
      this.enqueueOneShotRetry(loudness); // 보조 재시도(안전망)
      return;
    }

    const now = this.ctx.currentTime;
    const la = this.effectiveLookahead();
    const startAt = now + la;
    const duration = Math.min(this.buffer.duration, 0.2);

    // 라운드로빈으로 게인 선택(필요 시 '가장 조용한 채널' 탐색으로 고도화 가능)
    const g = this.gains[this.nextIndex++ % this.poolSize];

    // 기존 램프가 남아있을 수 있으므로 현재값에서 짧게 내려 끊고 시작(클릭 방지)
    g.gain.cancelScheduledValues(now);
    g.gain.setValueAtTime(g.gain.value, now);
    g.gain.linearRampToValueAtTime(0.0001, now + 0.004);

    // 새 소스 생성 및 결선
    const src = this.ctx.createBufferSource();
    src.buffer = this.buffer;
    src.playbackRate.value = 1 + (Math.random() * 0.1 - 0.05); // 위상/톤 겹침 완화
    src.connect(g);

    // 새 엔벨로프(아주 짧은 attack + 빠른 release)
    g.gain.setValueAtTime(0.0001, startAt);
    g.gain.linearRampToValueAtTime(Math.min(1, loudness), startAt + 0.003);
    g.gain.exponentialRampToValueAtTime(
      0.0001,
      startAt + Math.max(0.12, duration - 0.02)
    );

    // 오디오 타임라인 기준 스케줄(메인스레드 지연 흡수)
    src.start(startAt);
    src.stop(startAt + duration);

    // 연결 정리(메모리/그래프 청소)
    src.onended = () => {
      try {
        src.disconnect();
      } catch {}
    };
  }

  // --- 폴백 -------------------------------------------------------------------

  // HTMLAudio 폴백(사전 프리로드 + cloneNode)
  private playFallbackSound(): void {
    try {
      if (!this.htmlAudio) return;
      const el = this.htmlAudio.cloneNode(true) as HTMLAudioElement;
      el.volume = this.volume;
      void el.play();
    } catch {}
  }

  // --- 종료 -------------------------------------------------------------------

  public destroy(): void {
    try {
      this.ctx?.close();
    } catch {}
    this.ctx = undefined;
    this.buffer = undefined;
    this.master = undefined;
    this.gains = [];
    this.unlocked = false;
    this.unlocking = false;
    this.isSettingUp = false;
    this.pendings = 0;
    this.flushScheduled = false;

    if (this.pendingRetry) {
      cancelAnimationFrame(this.pendingRetry);
      this.pendingRetry = undefined;
    }
  }
}
