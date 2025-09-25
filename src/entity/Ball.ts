import type { Position } from "../GameState";
import { ActiveEntity } from "./ActiveEntity";
import { CircleRenderComponent } from "../render/RenderComponent";
import { BallPhysicsComponent } from "../physics/PhysicsComponent";

export class Ball extends ActiveEntity {
  private radius: number = 8;
  private color: number = 0x4880ee; // 토스 블루

  constructor(position: Position, world: any) {
    super(`ball-${Date.now()}`);

    // 컴포넌트 직접 할당
    this.renderComponent = new CircleRenderComponent(this.radius, this.color);
    this.physicsComponent = new BallPhysicsComponent(
      world,
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
}
