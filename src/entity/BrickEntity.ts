import { Entity } from "../core/entity/Entity";
import { RoundedRectangleRenderComponent } from "../render/RenderComponent";
import { BoundaryPhysicsComponent } from "../physics/PhysicsComponent";
import type { Position } from "../GameState";
import { getTheme } from "../Setting";

export class BrickEntity extends Entity {
  private width: number = 60;
  private height: number = 40;
  private health: number;

  constructor(id: string, position: Position, health: number = 3) {
    super(id);

    this.health = health;

    this.renderComponent = new RoundedRectangleRenderComponent(
      this.width,
      this.height,
      getTheme().brickColor.max, // 초기 색상은 진한 파란색
      1, // 1px 마진
      4 // 4px 라운드
    );
    this.renderComponent.setPosition(position.x, position.y);

    // 초기 체력 텍스트 표시
    (this.renderComponent as RoundedRectangleRenderComponent).updateHealthText(
      this.getHealth()
    );

    this.physicsComponent = new BoundaryPhysicsComponent(
      position.x,
      position.y,
      this.width,
      this.height,
      id,
      "brick"
    );
  }

  public hit(): void {
    this.health--;
    this.updateHealthText();

    (this.renderComponent as RoundedRectangleRenderComponent).hitEffect();
  }

  public setColor(color: number): void {
    (this.renderComponent as RoundedRectangleRenderComponent).updateColor(
      color
    );
  }

  private updateHealthText(): void {
    // 체력 텍스트만 업데이트 (색상은 BrickManager에서 관리)
    (this.renderComponent as RoundedRectangleRenderComponent).updateHealthText(
      this.getHealth()
    );
  }

  public getPhysicsBody(): Matter.Body {
    return this.physicsComponent.getBody();
  }

  public getHealth(): number {
    return this.health;
  }

  public setHealth(health: number): void {
    this.health = health;
    this.updateHealthText();

    (this.renderComponent as RoundedRectangleRenderComponent).hitEffect();
  }

  public calculateBrickColor(stage: number): void {
    const currentHealth = this.getHealth();
    const theme = getTheme();
    const maxColor = theme.brickColor.max; // 진한 파란색
    const minColor = theme.brickColor.min; // 연한 파란색

    // currentHealth/stage 비율로 색상 보간 (0~1)
    const ratio = Math.min(currentHealth / stage, 1);

    const color = this.interpolateColor(minColor, maxColor, ratio);
    this.setColor(color);
  }

  private interpolateColor(
    color1: number,
    color2: number,
    ratio: number
  ): number {
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

  public shift(amount: number = 40): void {
    // 현재 위치 가져오기
    const currentPos = this.physicsComponent.getPosition();
    const newY = currentPos.y + amount;

    // 물리 바디 위치 이동
    this.physicsComponent.setPosition(currentPos.x, newY);

    // 렌더링 위치 동기화
    // this.renderComponent.setPosition(currentPos.x, newY);

    (this.renderComponent as RoundedRectangleRenderComponent).shift(
      currentPos.x,
      newY
    );
  }

  public destroy(): void {
    super.destroy();
  }
}
