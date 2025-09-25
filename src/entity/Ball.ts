import { BALL_RADIUS, type Position } from "../GameState";
import { ActiveEntity } from "../core/entity/ActiveEntity";
import { CircleRenderComponent } from "../render/RenderComponent";
import { BallPhysicsComponent } from "../physics/PhysicsComponent";
import { EntityManager } from "../core/entity/EntityManager";
import type { Graphics } from "pixi.js";

export class Ball extends ActiveEntity {
  private radius: number = BALL_RADIUS;
  private color: number = 0x4880ee; // 토스 블루

  constructor(position: Position) {
    super(`ball-${Date.now()}-${Math.random()}`);

    // 컴포넌트 직접 할당
    this.renderComponent = new CircleRenderComponent(this.radius, this.color);
    this.physicsComponent = new BallPhysicsComponent(
      position.x,
      position.y,
      this.radius
    );

    // 초기 위치 동기화
    this.updateGraphics();
  }

  public moveTowards(targetX: number, targetY: number): void {
    (this.physicsComponent as BallPhysicsComponent).moveTowards(
      targetX,
      targetY
    );
  }

  public getGraphics(): Graphics {
    return this.renderComponent.getGraphics();
  }

  public getPhysicsBody(): Matter.Body {
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
    // EntityManager에서 제거
    EntityManager.remove(this);

    // 부모 destroy 호출
    super.destroy();
  }
}
