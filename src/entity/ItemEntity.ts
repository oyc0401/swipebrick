import { Entity } from "../core/entity/Entity";
import { ItemRenderComponent } from "../render/RenderComponent";
import { ItemPhysicsComponent } from "../physics/PhysicsComponent";
import type { Position } from "../GameState";
import { getTheme } from "../Setting";

export class ItemEntity extends Entity {
  private radius: number = 9;
  private physicsRadius = 13;
  private color: number = getTheme().itemColor;

  constructor(id: string, position: Position) {
    super(id);

    this.renderComponent = new ItemRenderComponent(this.radius, this.color);
    this.renderComponent.setPosition(position.x, position.y);

    this.physicsComponent = new ItemPhysicsComponent(
      position.x,
      position.y,
      this.physicsRadius,
      id
    );
  }

  public getPhysicsBody(): Matter.Body {
    return this.physicsComponent.getBody();
  }

  public shift(amount: number = 40): void {
    // 현재 위치 가져오기
    const currentPos = this.physicsComponent.getPosition();
    const newY = currentPos.y + amount;

    // 물리 바디 위치 이동
    this.physicsComponent.setPosition(currentPos.x, newY);

    // 렌더링 위치 동기화
    (this.renderComponent as ItemRenderComponent).shift(currentPos.x, newY);
  }

  public updateGraphics(): void {
    // 아이템 애니메이션 업데이트
    if (this.renderComponent instanceof ItemRenderComponent) {
      (this.renderComponent as ItemRenderComponent).updateAnimation();
    }
  }

  public destroy(): void {
    super.destroy();
  }
}
