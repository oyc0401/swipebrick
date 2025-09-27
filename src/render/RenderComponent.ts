import { Graphics } from "pixi.js";
import type { IRenderComponent } from "../core/components/IComponent";

export abstract class RenderComponent implements IRenderComponent {
  protected graphics: Graphics;

  constructor() {
    this.graphics = new Graphics();
  }

  public getGraphics(): Graphics {
    return this.graphics;
  }

  public updatePosition(x: number, y: number): void {
    if (this.graphics && !this.graphics.destroyed) {
      this.graphics.x = x;
      this.graphics.y = y;
    }
  }

  public destroy(): void {
    this.graphics.destroy();
  }
}

export class CircleRenderComponent extends RenderComponent {
  private radius: number;
  private color: number;

  constructor(radius: number, color: number = 0x4880ee) {
    super();
    this.radius = radius;
    this.color = color;
    this.createCircle();
  }

  private createCircle(): void {
    this.graphics.clear();
    this.graphics.circle(0, 0, this.radius);
    this.graphics.fill({ color: this.color });
  }
}

export class RectangleRenderComponent extends RenderComponent {
  private width: number;
  private height: number;
  private color: number;
  private innerMargin: number;

  constructor(width: number, height: number, color: number = 0x000000, innerMargin: number = 0) {
    super();
    this.width = width;
    this.height = height;
    this.color = color;
    this.innerMargin = innerMargin;
    this.createRectangle();
  }

  private createRectangle(): void {
    this.graphics.clear();

    if (this.innerMargin > 0) {
      // 마진이 있으면 내부에 더 작은 사각형 그리기
      this.graphics.rect(
        this.innerMargin,
        this.innerMargin,
        this.width - (this.innerMargin * 2),
        this.height - (this.innerMargin * 2)
      );
    } else {
      // 마진이 없으면 전체 크기로 그리기
      this.graphics.rect(0, 0, this.width, this.height);
    }

    this.graphics.fill({ color: this.color });
  }

  public updateColor(newColor: number): void {
    this.color = newColor;
    this.createRectangle();
  }
}
