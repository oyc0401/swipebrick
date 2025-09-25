import { Graphics } from "pixi.js";
import type { IRenderComponent } from "../components/IComponent";

export class RenderComponent implements IRenderComponent {
  protected graphics: Graphics;

  constructor() {
    this.graphics = new Graphics();
  }

  public getGraphics(): Graphics {
    return this.graphics;
  }

  public updatePosition(x: number, y: number): void {
    this.graphics.x = x;
    this.graphics.y = y;
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

  constructor(width: number, height: number, color: number = 0x000000) {
    super();
    this.width = width;
    this.height = height;
    this.color = color;
    this.createRectangle();
  }

  private createRectangle(): void {
    this.graphics.clear();
    this.graphics.rect(0, 0, this.width, this.height);
    this.graphics.fill({ color: this.color });
  }
}
