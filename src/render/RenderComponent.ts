import {
  Graphics,
  Container,
  Text,
  TextStyle,
  Sprite,
  Texture,
  Ticker,
} from "pixi.js";
import type { IRenderComponent } from "../core/components/IComponent";
import { GraphicEngine } from "./GraphicEngine";
import { easeOutBackMove } from "./BounceEffect";

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
  private sprite: Sprite;
  private static textureCache: Map<string, Texture> = new Map();

  constructor(radius: number, color: number = 0x4880ee) {
    super();
    this.radius = radius;
    this.color = color;
    this.sprite = this.createCircleSprite();
    this.container.addChild(this.sprite);
  }

  private createCircleSprite(): Sprite {
    const cacheKey = `circle_${this.radius}_${this.color}`;

    let texture = CircleRenderComponent.textureCache.get(cacheKey);
    if (!texture) {
      // 텍스처가 캐시에 없으면 새로 생성
      const g = new Graphics();
      g.circle(0, 0, this.radius);
      g.fill({ color: this.color });

      texture = GraphicEngine.getInstance()
        .getApp()
        .renderer.generateTexture(g);
      g.destroy();

      CircleRenderComponent.textureCache.set(cacheKey, texture);
    }

    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5, 0.5);
    return sprite;
  }

  public destroy(): void {
    if (this.sprite) {
      this.sprite.destroy();
    }
    super.destroy();
  }

  public static clearTextureCache(): void {
    for (const texture of CircleRenderComponent.textureCache.values()) {
      texture.destroy(true);
    }
    CircleRenderComponent.textureCache.clear();
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
    this.graphics.rect(
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );
    this.graphics.fill({ color: this.color });
  }

  public updateColor(newColor: number): void {
    this.color = newColor;
    this.createRectangle();
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

  public shift(x: number, newY: number): void {
    if (this.container && !this.container.destroyed) {
      this.container.x = x;
      // this.container.y = newY;
      easeOutBackMove(this.container, this.container.y, newY);
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
      fontFamily: "Inter",
      fontSize: 16,
      fill: 0xffffff, // 흰색
      fontWeight: "600",
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
  private baseRadius: number;
  private currentRadius: number;
  private color: number;
  private static globalAnimationSpeed: number = 0.0036;
  private updateHandler: () => void;

  constructor(radius: number = 9, color: number = 0xffb433) {
    super();
    this.baseRadius = radius;
    this.currentRadius = radius;
    this.color = color;
    this.createItem();

    // Ticker에 애니메이션 등록
    this.updateHandler = () => this.updateAnimation();
    const graphicEngine = GraphicEngine.getInstance();
    graphicEngine.getApp().ticker.add(this.updateHandler);
  }

  public updateAnimation(): void {
    // 전역 시간을 사용하여 모든 아이템이 동기화된 애니메이션
    const graphicEngine = GraphicEngine.getInstance();
    const globalTime =
      graphicEngine.getApp().ticker.lastTime *
      ItemRenderComponent.globalAnimationSpeed;

    // 함수로 0 ~ 1 사이 값 생성
    const animationOffset = Math.abs(Math.sin(globalTime)); // 0 ~ 1
    this.currentRadius = this.baseRadius + animationOffset * 3;

    // 매 프레임 업데이트 (계속 반복 애니메이션)
    this.createItem();
  }

  private createItem(): void {
    this.graphics.clear();

    // 외곽 원 (테두리만, 채우기 투명) - 애니메이션 적용
    this.graphics.circle(0, 0, this.currentRadius);
    this.graphics.stroke({ width: 2, color: this.color });

    // 내부 원 (가득찬 원) - 고정 크기
    this.graphics.circle(0, 0, 8);
    this.graphics.fill({ color: this.color });
  }

  public shift(x: number, newY: number): void {
    if (this.container && !this.container.destroyed) {
      this.container.x = x;
      // this.container.y = newY;
      easeOutBackMove(this.container, this.container.y, newY);
    }
  }

  public destroy(): void {
    // Ticker에서 애니메이션 제거
    const graphicEngine = GraphicEngine.getInstance();
    if (graphicEngine && graphicEngine.getApp()) {
      graphicEngine.getApp().ticker.remove(this.updateHandler);
    }
    super.destroy();
  }
}
