import { Container, Ticker } from "pixi.js";

interface AnimState {
  startY: number;
  downY: number;
  elapsed: number;
  duration: number;
  phase: "down" | "up";
  onUpdate: (delta: Ticker) => void;
}

// 컨테이너별 애니메이션 상태 Map
const animMap = new Map<Container, AnimState>();

// 글로벌 Ticker 사용
const ticker = Ticker.shared;

export function easeOutBackMove(
  container: Container,
  x: number,
  amount: number,
  duration = 250
) {
  if (!container || container.destroyed) return;

  const easeOutBack = (t: number): number => {
    const c1 = 2.058; // 튀는 정도 조절 가능
    const c3 = c1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  };

  // 기존 애니메이션 종료
  if (animMap.has(container)) {
    const oldState = animMap.get(container)!;
    ticker.remove(oldState.onUpdate);
    animMap.delete(container);
  }

  const startY = container.y;
  const downY = startY + 15;

  const state: AnimState = {
    startY,
    downY,
    elapsed: 0,
    duration,
    phase: "down",
    onUpdate: (delta: Ticker) => {
      state.elapsed += delta.deltaMS;
      const progress = Math.min(state.elapsed / state.duration, 1);
      const eased = easeOutBack(progress);

      container.x = x;

      if (state.phase === "down") {
        container.y = startY + (downY - startY) * eased;
        if (progress >= 1) {
          state.phase = "up";
          state.elapsed = 0;
        }
      } else {
        container.y = downY - (downY - startY) * eased;
        if (progress >= 1) {
          container.y = startY;
          ticker.remove(state.onUpdate);
          animMap.delete(container);
        }
      }
    },
  };

  animMap.set(container, state);
  ticker.add(state.onUpdate);
}