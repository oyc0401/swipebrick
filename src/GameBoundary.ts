import * as PIXI from "pixi.js";

export class GameBoundary {
  private graphics: PIXI.Graphics;
  private isDestroyed: boolean = false;

  constructor(x: number, y: number, width: number, height: number, color: number = 0x000000) {
    this.graphics = new PIXI.Graphics();
    this.createBoundary(x, y, width, height, color);
  }

  private createBoundary(x: number, y: number, width: number, height: number, color: number): void {
    this.graphics.rect(x, y, width, height);
    this.graphics.fill({ color });
  }

  public getGraphics(): PIXI.Graphics {
    return this.graphics;
  }

  public destroy(): void {
    if (!this.isDestroyed) {
      this.isDestroyed = true;
      this.graphics.destroy();
    }
  }

  public playDestroyAnimation(): Promise<void> {
    return new Promise((resolve) => {
      // 나중에 부서지는 애니메이션 구현
      // 지금은 즉시 제거
      this.destroy();
      resolve();
    });
  }

  public isVisible(): boolean {
    return !this.isDestroyed;
  }
}