import type { Position } from "../GameState";
import { Entity } from "./Entity";
import { CircleRenderComponent } from "../components/RenderComponent";
import { BallPhysicsComponent } from "../components/PhysicsComponent";

export class Ball extends Entity {
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

  public setPosition(position: Position): void {
    this.physicsComponent.setPosition(position.x, position.y);
    this.updateGraphics();
  }

  public getPosition(): Position {
    return this.physicsComponent.getPosition();
  }

  public moveTowards(targetX: number, targetY: number): void {
    (this.physicsComponent as BallPhysicsComponent).moveTowards(
      targetX,
      targetY
    );
  }

  public updateGraphics(): void {
    const position = this.physicsComponent.getPosition();
    this.renderComponent.updatePosition(position.x, position.y);
  }

  public getGraphics(): any {
    return this.renderComponent.getGraphics();
  }
}
