export interface Position {
  x: number;
  y: number;
}

export const GAME_WIDTH = 360;
export const GAME_HEIGHT = 360;
export const BALL_RADIUS = 8;

export class GameState {
  public ballStartPosition: Position;
  public ballCount: number;
  public level: number;
  public score: number;
  public isWaiting: boolean; // 대기 상태 플래그
  public isBallLanded = false; // 공이 하나라도 바닥에 도착했는지 여부

  constructor() {
    // 360x360 사각형 영역의 하단에 붙어있도록 위치 설정
    this.ballStartPosition = {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT - BALL_RADIUS,
    }; // 사각형 하단에서 반지름만큼 위
    this.ballCount = 1;
    this.level = 1;
    this.score = 0;
    this.isWaiting = true; // 초기에는 대기 상태 (공이 준비된 상태)
  }

  public setBallStartPosition(x: number, y: number): void {
    this.ballStartPosition.x = x;
    this.ballStartPosition.y = y;
  }

  public incrementBallCount(): void {
    this.ballCount++;
  }

  public incrementLevel(): void {
    this.level++;
  }

  public addScore(points: number): void {
    this.score += points;
  }

  public setWaiting(waiting: boolean): void {
    this.isWaiting = waiting;
  }

  public setIsBallLanded(isBallLanded: boolean) {
    this.isBallLanded = isBallLanded;
  }
}
