import { Container, Ticker } from "pixi.js";

interface AnimState {
  elapsed: number;
  duration: number;
  onUpdate: () => void;
}

// 컨테이너별 애니메이션 상태 Map
const animMap = new WeakMap<Container, AnimState>();

// 글로벌 Ticker 사용
const ticker = Ticker.shared;

/**
 * beforeY 에서 toY 로 부드럽게 이동하되,
 * 도착 지점을 살짝 넘어갔다가 되돌아와 toY 에 정착합니다.
 *
 * @param container 대상 컨테이너
 * @param fromY     시작 Y (이전 Y)
 * @param toY       도착 Y (새로운 Y)
 * @param duration  전체 지속 시간(ms) 기본 150
 * @param overshoot 튀는 강도(기본 0.85, 더 크게 하면 더 많이 튑니다)
 */
export function easeOutBackMove(
  container: Container,
  fromY: number,
  toY: number,
  duration = 300,
  overshoot = 3
) {
  if (!container || container.destroyed) return;

  // 표준 easeOutBack: 1 + (s+1)*(t-1)^3 + s*(t-1)^2
  const easeOutBack = (t: number, s: number): number => {
    const u = t - 1;
    return 1 + (s + 1) * (u * u * u) + s * (u * u);
  };

  // 기존 애니메이션 종료
  if (animMap.has(container)) {
    const old = animMap.get(container)!;
    ticker.remove(old.onUpdate);
    animMap.delete(container);
  }

  container.y = fromY;

  const state: AnimState = {
    elapsed: 0,
    duration,
    onUpdate: () => {
      state.elapsed += ticker.deltaMS;
      const progress = Math.min(state.elapsed / state.duration, 1);

      // fromY -> toY 로 이동하면서 오버슈트 후 복귀
      const eased = easeOutBack(progress, overshoot);
      container.y = fromY + (toY - fromY) * eased;

      if (progress >= 1) {
        container.y = toY;
        ticker.remove(state.onUpdate);
        animMap.delete(container);
      }
    },
  };

  animMap.set(container, state);
  ticker.add(state.onUpdate);
}
