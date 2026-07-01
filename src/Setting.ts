export const BALL_SPEED = 8;
export const BALL_LAUNCH_DELAY_MS = 50; // 공 발사 간격 (밀리초)
export const BOUNDARY_THICKNESS = 15; // 경계벽 두께

// ===== 턴 종료 보장 워치독(failsafe) =====
// 공이 물리 엣지케이스로 착지에 실패해 턴이 영구 정지하는 것을 방지한다.
// 정상 플레이(공 속도 ≈ BALL_SPEED, 경계 내부, 수백 ms 비행)에는 전혀 개입하지 않는다.
export const WATCHDOG_OOB_MARGIN = 100; // 경계 밖 유실 판정 여유 (px)
export const WATCHDOG_MIN_SPEED_RATIO = 0.2; // 저속 판정 임계 = BALL_SPEED * 이 비율
export const WATCHDOG_SLOW_MS = 700; // 저속 상태 지속 허용 시간 (밀리초)
export const WATCHDOG_MAX_FLIGHT_MS = 10000; // 개별 공 최대 비행 시간 백스톱 (밀리초)

let theme = {
  ballColor: 0x5be1eb, //초록: 0x3fd599, 빨강: 0xf66571,
  brickColor: {
    max: 0x1f4ef5, // 진한 파란색 (#1F4EF5)
    min: 0x83b4f9, // 연한 파란색 (#83B4F9) CEE1FD
  },
  itemColor: 0x3fd599,
  boundaryColor: 0xf2f4f6,
  shatterColor: {
    brick: 0x83b4f9,
    item: 0x3fd599,
  },
  arrowColor: 0x68e4ee, // 초록: 0x77E4B8,  빨강: 0xfb8990
};

export function getTheme() {
  return theme;
}
