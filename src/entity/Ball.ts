import { BALL_RADIUS, type Position } from "../GameState";
import { ActiveEntity } from "../core/entity/ActiveEntity";
import { CircleRenderComponent } from "../render/RenderComponent";
import { BallPhysicsComponent } from "../physics/PhysicsComponent";
import { EntityManager } from "../core/entity/EntityManager";

export class Ball extends ActiveEntity {
  private radius: number = BALL_RADIUS;
  private color: number = 0x4880ee; // 토스 블루

  constructor(position: Position, registerToPhysics: boolean = true) {
    super(`ball-${Date.now()}-${Math.random()}`);

    // 컴포넌트 직접 할당
    this.renderComponent = new CircleRenderComponent(this.radius, this.color);

    if (registerToPhysics) {
      this.physicsComponent = new BallPhysicsComponent(
        position.x,
        position.y,
        this.radius
      );
    } else {
      // 프리뷰용 더미 physicsComponent (물리 등록 없음)
      this.physicsComponent = {
        getBody: () => ({ position: { x: position.x, y: position.y } }),
        setPosition: (_x: number, _y: number) => {},
        getPosition: () => ({ x: position.x, y: position.y }),
        destroy: () => {},
      } as any;
    }

    // 초기 위치 동기화
    this.updateGraphics();
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

  public getPhysicsBody(): Matter.Body {
    return this.physicsComponent.getBody();
  }

  public getPosition(): Position {
    return this.physicsComponent.getPosition();
  }

  public setPosition(pos: Position) {
    this.renderComponent.getGraphics().x = pos.x;
    this.renderComponent.getGraphics().y = pos.y;
    this.physicsComponent.setPosition(pos.x, pos.y);
  }

  public setVisible(visible: boolean): void {
    this.renderComponent.setVisible(visible);
  }

  public destroy(): void {
    // EntityManager에서 제거
    EntityManager.remove(this);

    // 부모 destroy 호출 (physicsComponent.destroy() 포함)
    super.destroy();
  }
}
