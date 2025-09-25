import type { Position } from "../GameState";
import { ActiveEntity, activeEntities } from "../core/entity/ActiveEntity";
import { CircleRenderComponent } from "../render/RenderComponent";
import { BallPhysicsComponent } from "../physics/PhysicsComponent";

export class Ball extends ActiveEntity {
  private radius: number = 8;
  private color: number = 0x4880ee; // 토스 블루

  constructor(position: Position) {
    super(`ball-${Date.now()}`);

    // 컴포넌트 직접 할당
    this.renderComponent = new CircleRenderComponent(this.radius, this.color);
    this.physicsComponent = new BallPhysicsComponent(
      position.x,
      position.y,
      this.radius
    );
  }

  public moveTowards(targetX: number, targetY: number): void {
    (this.physicsComponent as BallPhysicsComponent).moveTowards(
      targetX,
      targetY
    );
  }

  public getGraphics(): any {
    return this.renderComponent.getGraphics();
  }

  public getPhysicsBody(): any {
    return this.physicsComponent.getBody();
  }

  public getPosition(): Position {
    return this.physicsComponent.getPosition();
  }

  public setPosition(pos: Position) {
    this.getGraphics().x = pos.x;
    this.getGraphics().y = pos.y;
    this.physicsComponent.setPosition(pos.x, pos.y);
  }

  public destroy(): void {
    // activeEntities 배열에서 제거
    const index = activeEntities.indexOf(this);
    if (index > -1) {
      activeEntities.splice(index, 1);
    }

    // 부모 destroy 호출
    super.destroy();
  }
}
