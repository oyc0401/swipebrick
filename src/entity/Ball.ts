import { BALL_RADIUS, type Position } from "../GameState";
import { ActiveEntity } from "../core/entity/ActiveEntity";
import { CircleRenderComponent } from "../render/RenderComponent";
import { BallPhysicsComponent } from "../physics/PhysicsComponent";
import { EntityManager } from "../core/entity/EntityManager";
import { PhysicsEngine } from "../physics/PhysicsEngine";
import type { Graphics } from "pixi.js";

export class Ball extends ActiveEntity {
  private radius: number = BALL_RADIUS;
  private color: number = 0x4880ee; // 토스 블루
  private isRegisteredToPhysics: boolean;

  constructor(position: Position, registerToPhysics: boolean = true) {
    super(`ball-${Date.now()}-${Math.random()}`);

    this.isRegisteredToPhysics = registerToPhysics;

    // 컴포넌트 직접 할당
    this.renderComponent = new CircleRenderComponent(this.radius, this.color);
    this.physicsComponent = new BallPhysicsComponent(
      position.x,
      position.y,
      this.radius
    );

    // 초기 위치 동기화
    this.updateGraphics();

    // PhysicsEngine 싱글톤의 world에 자동 추가 (옵션에 따라)
    if (this.isRegisteredToPhysics) {
      PhysicsEngine.getInstance().addBody(this.getPhysicsBody());
    }
  }

  // 물리 엔진에 등록하지 않는 Ball 생성 (프리뷰용)
  public static createWithoutPhysics(position: Position): Ball {
    return new Ball(position, false);
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
    // PhysicsEngine에서 바디 제거 (등록된 경우에만)
    if (this.isRegisteredToPhysics) {
      PhysicsEngine.getInstance().removeBody(this.getPhysicsBody());
    }

    // EntityManager에서 제거
    EntityManager.remove(this);

    // 부모 destroy 호출
    super.destroy();
  }
}
