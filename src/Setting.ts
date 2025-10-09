export const BALL_SPEED = 8;
export const BALL_LAUNCH_DELAY_MS = 50; // 공 발사 간격 (밀리초)
export const BOUNDARY_THICKNESS = 15; // 경계벽 두께

let theme = {
  ballColor: 0x4880ee,
  brickColor: {
    max: 0x1f4ef5, // 진한 파란색 (#1F4EF5)
    min: 0x83b4f9, // 연한 파란색 (#83B4F9)
  },
  itemColor: 0xffb433,
  boundaryColor: 0xf2f4f6,
  shatterColor: {
    brick: 0x83b4f9,
    item: 0xffb433,
  },
  arrowColor: 0x83b4f9,
};

export function getTheme() {
  return theme;
}
