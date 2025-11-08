// rAF 패치 라이브러리
// -----------------------------------------------------------------------------
// - 목적: 전역 window.requestAnimationFrame / cancelAnimationFrame 을 가로채서
//   "모니터 리프레시"가 아니라 "지정한 FPS"로 콜백을 실행시키는 패치 계층.
// - 방식:
//   1) 원래의 requestAnimationFrame / cancelAnimationFrame 을 저장해 둔다.
//   2) enable(fps)를 호출하면:
//      - 내부에서 하나의 driver 루프(native rAF 기반)를 돌리면서
//      - 매 tick마다(고정 step = 1000 / fps ms) pending 큐에 쌓여 있던 콜백들을 한 번에 실행한다.
//      - window.requestAnimationFrame / cancelAnimationFrame 을 patched 버전으로 교체한다.
//   3) disable()을 호출하면:
//      - driver 루프를 중단하고
//      - pending 큐를 비우고
//      - window.requestAnimationFrame / cancelAnimationFrame 을 원래 네이티브로 되돌린다.
//
// - 주의:
//   - 이 클래스는 "전역 rAF 시맨틱을 재정의"하므로, 애플리케이션 전체 애니메이션 타이밍이 바뀐다.
//   - 의도적으로 환경을 통제할 때만 사용해야 한다.
// -----------------------------------------------------------------------------

type RAF = (cb: FrameRequestCallback) => number;
type CAF = (handle: number) => void;

class RafPatch {
  // 패치 대상 window 객체 (기본값: 전역 window)
  private win: Window & typeof globalThis;
  // 원래 네이티브 rAF / cAF 참조
  private nativeRAF: RAF;
  private nativeCAF: CAF;

  // 패치 활성화 여부
  private enabled = false;
  // 현재 타겟 FPS 값
  private fps = 60;
  // 한 프레임 당 시간(ms) = 1000 / fps
  private step = 1000 / this.fps;
  // 고정 스텝 타임라인 기준 시작 시각
  private start = performance.now();
  // 다음 프레임이 "발생해야 하는" 기준 시각
  private nextDue = this.start + this.step;
  // 지금까지 진행된 tick(프레임) 수
  private tick = 0;
  // driver 루프용 requestAnimationFrame 핸들
  private driverId = 0;
  // patchedRAF에서 사용할 id 카운터
  private nextId = 1;
  // rAF 콜백 대기열 (cancelAnimationFrame을 지원하기 위해 id → cb 매핑으로 관리)
  private pending = new Map<number, FrameRequestCallback>();

  constructor(win: Window & typeof globalThis = window) {
    this.win = win;
    const w = this.win as any;

    // 원래 rAF / cAF를 바인딩해 저장해둔다.
    this.nativeRAF = w.requestAnimationFrame.bind(w);
    this.nativeCAF = w.cancelAnimationFrame.bind(w);
  }

  /**
   * 현재 tick에 실행해야 할 pending 콜백들을 모두 꺼내서 호출한다.
   * - 호출 시점의 타임스탬프 t(고정 스텝 타임라인 기준)를 인자로 넘긴다.
   * - 한 번 drain 할 때 pending 큐는 모두 비워진다(다음 tick에서 새로 쌓이게 됨).
   */
  private drain(t: number) {
    if (!this.pending.size) return;

    const tasks = Array.from(this.pending.values());
    this.pending.clear();

    for (const cb of tasks) {
      cb(t);
    }
  }

  /**
   * 네이티브 rAF 위에서 돌아가는 단일 driver 루프.
   * - now: 네이티브 rAF가 넘겨주는 실제 현재 시각(performance.now 기반).
   * - now >= nextDue 인 경우에만 tick을 증가시키고 drain()을 호출한다.
   *   → 모니터 리프레시보다 낮은 FPS로도 콜백 실행 빈도를 떨어뜨릴 수 있다.
   */
  private driver = (now: number) => {
    if (!this.enabled) return;

    const maxLag = this.step * 3; // 3프레임 이상 밀리면 "그동안은 그냥 스킵" 처리
    if (now - this.nextDue > maxLag) {
      this.start = now;
      this.tick = 0;
      this.nextDue = now + this.step;
    }

    if (now >= this.nextDue) {
      this.tick++;
      // 고정 스텝 타임라인 상의 "이론적" 프레임 시간
      const t = this.start + this.tick * this.step;
      this.drain(t);
      this.nextDue += this.step;
    }

    // 다음 루프 예약 (driver는 항상 네이티브 rAF 위에서 돈다)
    this.driverId = this.nativeRAF(this.driver);
  };

  /**
   * 패치된 requestAnimationFrame 구현.
   * - 네이티브와 동일하게 callback을 인자로 받고, number handle을 반환한다.
   * - 내부적으로는 pending 맵에 콜백을 등록만 하고, 실제 실행은 driver에서 관리한다.
   * - enabled가 아직 false라면, 첫 호출 시 자동으로 enable(this.fps)를 호출한다.
   */
  private patchedRAF = (cb: FrameRequestCallback): number => {
    const id = this.nextId++;
    this.pending.set(id, cb);

    if (!this.enabled) {
      // 원래 IIFE 버전과 동일하게:
      // rAF가 처음 호출될 때 enable()을 자동으로 트리거한다.
      this.enable(this.fps);
    }

    return id;
  };

  /**
   * 패치된 cancelAnimationFrame 구현.
   * - pending 큐에서 해당 id의 콜백만 제거한다.
   * - 실제 driver 루프는 계속 돈다.
   */
  private patchedCAF = (id: number) => {
    this.pending.delete(id);
  };

  /**
   * FPS 패치를 활성화하고, window.requestAnimationFrame / cancelAnimationFrame을 교체한다.
   *
   * @param newFPS 목표 FPS (예: 30 → 약 33.333ms마다 drain 수행)
   */
  enable(newFPS: number) {
    this.fps = newFPS;
    this.step = 1000 / this.fps;
    this.start = performance.now();
    this.nextDue = this.start + this.step;
    this.tick = 0;

    if (!this.enabled) {
      this.enabled = true;
      // driver 루프 시작 (이 루프는 네이티브 rAF 위에서 동작한다)
      this.driverId = this.nativeRAF(this.driver);
    }

    // 전역 window의 rAF / cAF 를 패치 버전으로 교체
    const w = this.win as any;
    w.requestAnimationFrame = this.patchedRAF;
    w.cancelAnimationFrame = this.patchedCAF;
  }

  /**
   * FPS 패치를 비활성화하고, window.requestAnimationFrame / cancelAnimationFrame을 원래대로 복구한다.
   * - driver 루프를 중단하고
   * - pending 큐를 비우고
   * - 네이티브 rAF / cAF 를 다시 돌려놓는다.
   */
  disable() {
    if (!this.enabled) return;

    this.enabled = false;
    // driver 루프 중단
    this.nativeCAF(this.driverId);
    this.driverId = 0;
    // 대기 중인 콜백들 제거
    this.pending.clear();

    // 전역 window rAF / cAF 복구
    const w = this.win as any;
    w.requestAnimationFrame = this.nativeRAF;
    w.cancelAnimationFrame = this.nativeCAF;
  }
}

// RafPatch 싱글톤 인스턴스
let _rafPatchSingleton: RafPatch | null = null;

function getRafPatchSingleton(): RafPatch {
  if (!_rafPatchSingleton) {
    _rafPatchSingleton = new RafPatch(window);
  }
  return _rafPatchSingleton;
}

// 외부에서 쓸 함수형 API
export function enableRafPatch(fps: number) {
  getRafPatchSingleton().enable(fps);
}

export function disableRafPatch() {
  getRafPatchSingleton().disable();
}
