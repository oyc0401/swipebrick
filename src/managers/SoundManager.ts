export class SoundManager {
  private static instance: SoundManager | null = null;
  private audioContext: AudioContext | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private isInitialized = false;
  private isEnabled = true;
  private userInteracted = false;

  private constructor() {
    // 적극적인 오디오 활성화 시도
    this.tryEarlyAudioActivation();
    this.setupUserInteractionListeners();
  }

  private async tryEarlyAudioActivation(): Promise<void> {
    // 즉시 AudioContext 생성 시도 (일부 환경에서 허용됨)
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // 무음 톤 재생으로 AudioContext 사전 활성화
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      gainNode.gain.value = 0; // 무음
      oscillator.frequency.value = 440;
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.001);

      this.userInteracted = true; // 성공하면 활성화로 간주
      console.log("Early audio activation successful");
    } catch (error) {
      console.log("Early audio activation failed, waiting for user interaction");
    }
  }

  private setupUserInteractionListeners(): void {
    const events = ['click', 'touchstart', 'keydown', 'pointerdown'];
    const enableAudio = async () => {
      this.userInteracted = true;

      // AudioContext가 없다면 생성
      if (!this.audioContext) {
        try {
          this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          await this.audioContext.resume();
        } catch (error) {
          console.warn("Failed to create AudioContext on user interaction:", error);
        }
      }

      events.forEach(event => {
        document.removeEventListener(event, enableAudio);
      });
    };

    events.forEach(event => {
      document.addEventListener(event, enableAudio, { once: true, passive: true });
    });
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  private async initializeAudioContext(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Web Audio API 사용 (최신 브라우저 표준)
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // 오디오 파일 로드
      const response = await fetch("/ball_sound.mp3");
      const arrayBuffer = await response.arrayBuffer();
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      this.isInitialized = true;
      console.log("SoundManager initialized with Web Audio API");
    } catch (error) {
      console.warn("Failed to initialize Web Audio API:", error);
      this.isEnabled = false;
    }
  }

  public async playBallSound(): Promise<void> {
    if (!this.isEnabled || !this.userInteracted) {
      console.log("Audio not enabled or user hasn't interacted yet");
      return;
    }

    try {
      // 첫 번째 호출시 초기화
      if (!this.isInitialized) {
        await this.initializeAudioContext();
      }

      if (!this.audioContext || !this.audioBuffer) {
        console.warn("AudioContext or buffer not available");
        return;
      }

      // AudioContext 상태 확인 및 복구
      if (this.audioContext.state === 'suspended') {
        console.log("Resuming suspended AudioContext");
        await this.audioContext.resume();
      }

      if (this.audioContext.state !== 'running') {
        console.warn(`AudioContext state: ${this.audioContext.state}`);
        return;
      }

      // 새로운 source 노드 생성 (재사용 불가)
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = this.audioBuffer;
      gainNode.gain.value = this.volume;

      // 연결: source → gain → destination
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // 재생
      source.start(0);

      console.log("Ball sound played successfully");
    } catch (error) {
      console.warn("Failed to play ball sound:", error);

      // Web Audio API 실패시 fallback으로 HTMLAudioElement 사용
      this.playFallbackSound();
    }
  }

  private playFallbackSound(): void {
    try {
      const audio = new Audio("/ball_sound.mp3");
      audio.volume = this.volume;
      audio.play().catch(error => {
        console.warn("Fallback audio also failed:", error);
      });
    } catch (error) {
      console.warn("Fallback sound creation failed:", error);
    }
  }

  private volume = 0.3;

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  public destroy(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.audioBuffer = null;
    this.isInitialized = false;
  }
}
