export interface Position {
  x: number;
  y: number;
}

export const GAME_WIDTH = 360;
export const GAME_HEIGHT = 360;
export const BALL_RADIUS = 8;

export class GameState {
  public isBallLanded = false; // 공이 하나라도 바닥에 도착했는지 여부

  constructor() {
  }

  public setIsBallLanded(isBallLanded: boolean) {
    this.isBallLanded = isBallLanded;
  }
}
