import * as PIXI from "pixi.js";
import type { Position } from "./GameState";

export class Ball {
  private graphics: PIXI.Graphics;
  private radius: number = 12;
  private color: number = 0x4a90e2; // 토스 블루

  constructor(position: Position) {
    this.graphics = new PIXI.Graphics();
    this.createBall();
    this.setPosition(position);
  }

  private createBall(): void {
    this.graphics.clear();
    this.graphics.circle(0, 0, this.radius);
    this.graphics.fill({ color: this.color });
  }

  public setPosition(position: Position): void {
    this.graphics.x = position.x;
    this.graphics.y = position.y;
  }

  public getPosition(): Position {
    return { x: this.graphics.x, y: this.graphics.y };
  }

  public getGraphics(): PIXI.Graphics {
    return this.graphics;
  }

  public destroy(): void {
    this.graphics.destroy();
  }
}
