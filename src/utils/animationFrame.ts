/**
 * requestAnimationFrame을 여러 번 중첩하여 실행을 지연시키는 유틸리티
 * @param callback 실행할 콜백 함수
 * @param frames 지연시킬 프레임 수
 */
export function requestAnimationFrames(callback: () => void, frames: number): void {
  if (frames <= 0) {
    callback();
    return;
  }

  requestAnimationFrame(() => {
    requestAnimationFrames(callback, frames - 1);
  });
}