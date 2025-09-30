export interface Position {
  x: number;
  y: number;
}

export const GAME_WIDTH = 360;
export const GAME_HEIGHT = 360;
export const BALL_RADIUS = 8;

export class GameState {
  public isWaiting: boolean; // 대기 상태 플래그
  public isBallLanded = false; // 공이 하나라도 바닥에 도착했는지 여부

  constructor() {
    this.isWaiting = true; // 초기에는 대기 상태 (공이 준비된 상태)
  }

  public setWaiting(waiting: boolean): void {
    this.isWaiting = waiting;
  }

  public setIsBallLanded(isBallLanded: boolean) {
    this.isBallLanded = isBallLanded;
  }
}
