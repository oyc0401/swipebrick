export const BALL_SPEED = 8;
export const BALL_LAUNCH_DELAY_MS = 50; // 공 발사 간격 (밀리초)
export const BOUNDARY_THICKNESS = 15; // 경계벽 두께

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
