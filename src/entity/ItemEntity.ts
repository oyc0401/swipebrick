import { Entity } from "../core/entity/Entity";
import { ItemRenderComponent } from "../render/RenderComponent";
import { ItemPhysicsComponent } from "../physics/PhysicsComponent";
import type { Position } from "../GameState";

export class ItemEntity extends Entity {
  private radius: number = 11;
  private color: number = 0xffb433; // 노란 오렌지 색상

  constructor(id: string, position: Position) {
    super(id);

    this.renderComponent = new ItemRenderComponent(
      this.radius,
      this.color
    );
    this.renderComponent.setPosition(position.x, position.y);

    this.physicsComponent = new ItemPhysicsComponent(
      position.x,
      position.y,
      this.radius,
      id
    );
  }

  public getPhysicsBody(): Matter.Body {
    return this.physicsComponent.getBody();
  }

  public shift(amount: number): void {
    // 현재 위치 가져오기
    const currentPos = this.physicsComponent.getPosition();
    const newY = currentPos.y + amount;

    // 물리 바디 위치 이동
    this.physicsComponent.setPosition(currentPos.x, newY);

    // 렌더링 위치 동기화
    this.renderComponent.setPosition(currentPos.x, newY);
  }

  public destroy(): void {
    super.destroy();
  }
}