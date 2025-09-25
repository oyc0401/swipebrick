import * as PIXI from "pixi.js";
import * as Matter from "matter-js";

export class GameBoundary {
  private graphics: PIXI.Graphics;
  private body!: Matter.Body;
  private isDestroyed: boolean = false;

  constructor(x: number, y: number, width: number, height: number, color: number = 0x000000, world?: Matter.World, label?: string) {
    this.graphics = new PIXI.Graphics();
    this.createBoundary(x, y, width, height, color);

    if (world) {
      // Matter.js 정적 바디 생성 (벽은 움직이지 않음)
      this.body = Matter.Bodies.rectangle(
        x + width / 2,  // 중심 x좌표
        y + height / 2, // 중심 y좌표
        width,
        height,
        {
          isStatic: true, // 정적 바디 (움직이지 않음)
          label: label || 'boundary'
        }
      );

      Matter.World.add(world, this.body);
    }
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