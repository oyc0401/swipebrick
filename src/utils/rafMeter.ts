// -----------------------------------------------------------------------------
// FpsMeter (startFpsMeter / stopFpsMeter / getCurrentFps 전용)
// -----------------------------------------------------------------------------

type FpsListener = (fps: number) => void;

class FpsMeter {
  private frames = 0;
  private lastFpsUpdateTime = 0;
  private _fps = 0;
  private rafId: number | null = null;
  private listener?: FpsListener;

  private handleFrame = () => {
    this.frames++;
    const now = performance.now();

    if (now - this.lastFpsUpdateTime >= 1000) {
      this._fps = Math.round(
        (this.frames * 1000) / (now - this.lastFpsUpdateTime)
      );
      this.frames = 0;
      this.lastFpsUpdateTime = now;

      if (this.listener) {
        this.listener(this._fps);
      }
    }

    this.rafId = requestAnimationFrame(this.handleFrame);
  };

  start(listener?: FpsListener) {
    // 리스너 갱신 (옵션)
    if (listener) {
      this.listener = listener;
    }

    // 이미 동작 중이면 재시작하지 않음
    if (this.rafId !== null) return;

    this.frames = 0;
    this._fps = 0;
    this.lastFpsUpdateTime = performance.now();
    this.rafId = requestAnimationFrame(this.handleFrame);
  }

  stop() {
    if (this.rafId === null) return;
    cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }
}

// FpsMeter 싱글톤
let _fpsMeterSingleton: FpsMeter | null = null;

function getFpsMeterSingleton(): FpsMeter {
  if (!_fpsMeterSingleton) {
    _fpsMeterSingleton = new FpsMeter();
  }
  return _fpsMeterSingleton;
}

// 외부용 함수형 API
export function startFpsMeter(listener?: FpsListener) {
  getFpsMeterSingleton().start(listener);
}

export function stopFpsMeter() {
  getFpsMeterSingleton().stop();
}
