import { Entity } from "../core/entity/Entity";
import { RectangleRenderComponent } from "../render/RenderComponent";
import { BoundaryPhysicsComponent } from "../physics/PhysicsComponent";

export class Brick extends Entity {
  private width: number = 60;
  private height: number = 40;
  private maxColor: number = 0x1f4ef5; // 체력 많을 때: 진한 파란색 (#1F4EF5)
  private minColor: number = 0x83b4f9; // 체력 적을 때: 연한 파란색 (#83B4F9)
  private hitCount: number = 0;
  private maxHits: number = 300; // 3번 맞으면 파괴

  constructor(x: number, y: number, maxHits: number = 3) {
    super(`brick-${Date.now()}-${Math.random()}`);

    this.maxHits = maxHits;

    this.renderComponent = new RectangleRenderComponent(
      this.width,
      this.height,
      this.maxColor, // 초기 색상은 진한 파란색
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
    // 체력에 따른 색상 보간
    const healthRatio = this.getHealth() / this.maxHits; // 1(풀체력) ~ 0(체력없음)
    const newColor = this.interpolateColor(this.minColor, this.maxColor, healthRatio);

    // RectangleRenderComponent의 updateColor 메서드 사용 (마진 자동 유지)
    (this.renderComponent as RectangleRenderComponent).updateColor(newColor);
  }

  private interpolateColor(color1: number, color2: number, ratio: number): number {
    // color1에서 color2로 ratio만큼 보간 (ratio: 0~1)
    const r1 = (color1 >> 16) & 0xff;
    const g1 = (color1 >> 8) & 0xff;
    const b1 = color1 & 0xff;

    const r2 = (color2 >> 16) & 0xff;
    const g2 = (color2 >> 8) & 0xff;
    const b2 = color2 & 0xff;

    const r = Math.floor(r1 + (r2 - r1) * ratio);
    const g = Math.floor(g1 + (g2 - g1) * ratio);
    const b = Math.floor(b1 + (b2 - b1) * ratio);

    return (r << 16) | (g << 8) | b;
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
