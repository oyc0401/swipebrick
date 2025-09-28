import { Graphics, Container, Text, TextStyle } from "pixi.js";
import type { IRenderComponent } from "../core/components/IComponent";
import { GraphicEngine } from "./GraphicEngine";

export abstract class RenderComponent implements IRenderComponent {
  protected graphics: Graphics;
  private parentContainer: Container | null = null;

  constructor() {
    this.graphics = new Graphics();
    this.addToViewport();
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

  public setVisible(visible: boolean): void {
    if (this.graphics && !this.graphics.destroyed) {
      this.graphics.visible = visible;
    }
  }

  public addToViewport(): void {
    if (!this.parentContainer) {
      this.parentContainer = GraphicEngine.getInstance().getGameViewport();
      this.parentContainer.addChild(this.graphics);
    }
  }

  public removeFromViewport(): void {
    if (this.parentContainer && this.graphics.parent) {
      this.parentContainer.removeChild(this.graphics);
      this.parentContainer = null;
    }
  }

  public destroy(): void {
    this.removeFromViewport();
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
  private healthText: Text | null = null;

  constructor(
    width: number,
    height: number,
    color: number = 0x000000,
    innerMargin: number = 0
  ) {
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
        this.width - this.innerMargin * 2,
        this.height - this.innerMargin * 2
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
    // 색상 변경 시 텍스트도 다시 그리기
    if (this.healthText) {
      const currentHealth = parseInt(this.healthText.text);
      this.updateHealthText(currentHealth);
    }
  }

  public updateHealthText(health: number): void {
    // 기존 텍스트 제거
    if (this.healthText) {
      this.graphics.removeChild(this.healthText);
      this.healthText.destroy();
    }

    // 새 텍스트 생성
    const textStyle = new TextStyle({
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0xffffff, // 흰색
      fontWeight: 'bold',
      align: 'center',
    });

    this.healthText = new Text({
      text: health.toString(),
      style: textStyle,
    });

    // 텍스트를 사각형 중앙에 배치
    this.healthText.anchor.set(0.5, 0.5);
    this.healthText.x = this.width / 2;
    this.healthText.y = this.height / 2;

    // Graphics에 텍스트 추가
    this.graphics.addChild(this.healthText);
  }

  public destroy(): void {
    if (this.healthText) {
      this.healthText.destroy();
      this.healthText = null;
    }
    super.destroy();
  }
}
