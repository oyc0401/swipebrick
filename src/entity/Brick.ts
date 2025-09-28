import { Entity } from "../core/entity/Entity";
import { RectangleRenderComponent } from "../render/RenderComponent";
import { BoundaryPhysicsComponent } from "../physics/PhysicsComponent";
import type { Graphics } from "pixi.js";

export class Brick extends Entity {
  private width: number = 60;
  private height: number = 40;
  private originalColor: number = 0xffa500; // 주황색
  private hitCount: number = 0;
  private maxHits: number = 300; // 3번 맞으면 파괴
  private isDestroyed: boolean = false;

  constructor(x: number, y: number, maxHits: number = 3) {
    super(`brick-${Date.now()}-${Math.random()}`);

    this.maxHits = maxHits;

    this.renderComponent = new RectangleRenderComponent(
      this.width,
      this.height,
      this.originalColor,
      1 // 1px 마진
    );
    this.renderComponent.updatePosition(x, y);

    this.physicsComponent = new BoundaryPhysicsComponent(
      x,
      y,
      this.width,
      this.height,
      "brick"
    );
  }

  public hit(): void {
    this.hitCount++;
    this.updateVisuals();
  }

  private updateVisuals(): void {
    // 맞을 때마다 색상을 어둡게 변경
    const darkenFactor = this.hitCount / this.maxHits;
    const newColor = this.darkenColor(this.originalColor, darkenFactor * 0.5);

    // RectangleRenderComponent의 updateColor 메서드 사용 (마진 자동 유지)
    (this.renderComponent as RectangleRenderComponent).updateColor(newColor);
  }

  private darkenColor(color: number, factor: number): number {
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;

    const newR = Math.floor(r * (1 - factor));
    const newG = Math.floor(g * (1 - factor));
    const newB = Math.floor(b * (1 - factor));

    return (newR << 16) | (newG << 8) | newB;
  }

  public getGraphics(): Graphics {
    return this.renderComponent.getGraphics();
  }

  public getPhysicsBody(): Matter.Body {
    return this.physicsComponent.getBody();
  }

  public getHealth(): number {
    return this.maxHits - this.hitCount;
  }

  public shift(amount: number): void {
    // 현재 위치 가져오기
    const currentPos = this.physicsComponent.getPosition();
    const newY = currentPos.y + amount;

    // 물리 바디 위치 이동
    this.physicsComponent.setPosition(currentPos.x, newY);

    // 렌더링 위치 동기화
    this.renderComponent.getGraphics().y += amount;
  }

  public destroy(): void {
    super.destroy();
  }
}
