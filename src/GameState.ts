export interface Position {
  x: number;
  y: number;
}

export class GameState {
  public ballStartPosition: Position;
  public ballCount: number;
  public level: number;
  public score: number;

  constructor() {
    this.ballStartPosition = { x: 180, y: 405 - 12 }; // 하단 검은선 위에 위치 (405 - 반지름)
    this.ballCount = 1;
    this.level = 1;
    this.score = 0;
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
}
