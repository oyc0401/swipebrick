import { Graphics, Container, Text, TextStyle } from "pixi.js";
import type { IRenderComponent } from "../core/components/IComponent";
import { GraphicEngine } from "./GraphicEngine";

export abstract class RenderComponent implements IRenderComponent {
  protected graphics: Graphics;
  protected container: Container;
  private parentContainer: Container | null = null;

  constructor() {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
    this.addToViewport();
  }

  public getGraphics(): Container {
    return this.container;
  }

  public setPosition(x: number, y: number): void {
    if (this.container && !this.container.destroyed) {
      this.container.x = x;
      this.container.y = y;
    }
  }

  public setVisible(visible: boolean): void {
    if (this.container && !this.container.destroyed) {
      this.container.visible = visible;
    }
  }

  public addToViewport(): void {
    if (!this.parentContainer) {
      this.parentContainer = GraphicEngine.getInstance().getGameViewport();
      this.parentContainer.addChild(this.container);
    }
  }

  public removeFromViewport(): void {
    if (this.parentContainer && this.container.parent) {
      this.parentContainer.removeChild(this.container);
      this.parentContainer = null;
    }
  }

  public destroy(): void {
    this.removeFromViewport();
    this.container.destroy();
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
      // 마진이 있으면 내부에 더 작은 사각형 그리기 (중심점 기준)
      const innerWidth = this.width - this.innerMargin * 2;
      const innerHeight = this.height - this.innerMargin * 2;
      this.graphics.rect(
        -innerWidth / 2,
        -innerHeight / 2,
        innerWidth,
        innerHeight
      );
    } else {
      // 마진이 없으면 전체 크기로 그리기 (중심점 기준)
      this.graphics.rect(
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );
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
      this.container.removeChild(this.healthText);
      this.healthText.destroy();
    }

    // 새 텍스트 생성
    const textStyle = new TextStyle({
      fontFamily: "Arial",
      fontSize: 16,
      fill: 0xffffff, // 흰색
      fontWeight: "bold",
      align: "center",
    });

    this.healthText = new Text({
      text: health.toString(),
      style: textStyle,
    });

    // 텍스트를 사각형 중앙에 배치 (중심점 기준)
    this.healthText.anchor.set(0.5, 0.5);
    this.healthText.x = 0;
    this.healthText.y = 0;

    // 컨테이너에 텍스트 추가
    this.container.addChild(this.healthText);
  }

  public destroy(): void {
    if (this.healthText) {
      this.healthText.destroy();
      this.healthText = null;
    }
    super.destroy();
  }
}

export class RoundedRectangleRenderComponent extends RenderComponent {
  private width: number;
  private height: number;
  private color: number;
  private innerMargin: number;
  private borderRadius: number;
  private healthText: Text | null = null;

  constructor(
    width: number,
    height: number,
    color: number = 0x000000,
    innerMargin: number = 0,
    borderRadius: number = 6
  ) {
    super();
    this.width = width;
    this.height = height;
    this.color = color;
    this.innerMargin = innerMargin;
    this.borderRadius = borderRadius;
    this.createRoundedRectangle();
  }

  private createRoundedRectangle(): void {
    this.graphics.clear();

    if (this.innerMargin > 0) {
      // 마진이 있으면 내부에 더 작은 라운드 사각형 그리기 (중심점 기준)
      const innerWidth = this.width - this.innerMargin * 2;
      const innerHeight = this.height - this.innerMargin * 2;
      this.graphics.roundRect(
        -innerWidth / 2,
        -innerHeight / 2,
        innerWidth,
        innerHeight,
        this.borderRadius
      );
    } else {
      // 마진이 없으면 전체 크기로 그리기 (중심점 기준)
      this.graphics.roundRect(
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height,
        this.borderRadius
      );
    }

    this.graphics.fill({ color: this.color });
  }

  public updateColor(newColor: number): void {
    this.color = newColor;
    this.createRoundedRectangle();
    // 색상 변경 시 텍스트도 다시 그리기
    if (this.healthText) {
      const currentHealth = parseInt(this.healthText.text);
      this.updateHealthText(currentHealth);
    }
  }

  public updateHealthText(health: number): void {
    // 기존 텍스트 제거
    if (this.healthText) {
      this.container.removeChild(this.healthText);
      this.healthText.destroy();
    }

    // 새 텍스트 생성
    const textStyle = new TextStyle({
      fontFamily: "Arial",
      fontSize: 16,
      fill: 0xffffff, // 흰색
      fontWeight: "normal",
      align: "center",
    });

    this.healthText = new Text({
      text: health.toString(),
      style: textStyle,
    });

    // 텍스트를 사각형 중앙에 배치 (중심점 기준)
    this.healthText.anchor.set(0.5, 0.5);
    this.healthText.x = 0;
    this.healthText.y = 0;

    // 컨테이너에 텍스트 추가
    this.container.addChild(this.healthText);
  }

  public destroy(): void {
    if (this.healthText) {
      this.healthText.destroy();
      this.healthText = null;
    }
    super.destroy();
  }
}

export class ItemRenderComponent extends RenderComponent {
  private radius: number;
  private color: number;

  constructor(radius: number = 11, color: number = 0xffb433) {
    super();
    this.radius = radius;
    this.color = color;
    this.createItem();
  }

  private createItem(): void {
    this.graphics.clear();

    // 외곽 원 (테두리만, 채우기 투명)
    this.graphics.circle(0, 0, this.radius);
    this.graphics.stroke({ width: 1, color: this.color });

    // 내부 원 (가득찬 원)
    this.graphics.circle(0, 0, 8);
    this.graphics.fill({ color: this.color });
  }
}
