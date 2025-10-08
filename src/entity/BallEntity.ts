import { BALL_RADIUS, type Position } from "../GameState";
import { ActiveEntity } from "../core/entity/ActiveEntity";
import { CircleRenderComponent } from "../render/RenderComponent";
import { BallPhysicsComponent } from "../physics/PhysicsComponent";
import { EntityManager } from "../core/entity/EntityManager";
import { getTheme } from "../Setting";

export class BallEntity extends ActiveEntity {
  private radius: number = BALL_RADIUS;
  private color: number = getTheme().ballColor;

  constructor(
    id: string,
    position: Position,
    registerToPhysics: boolean = true
  ) {
    super(id);

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
      // CRITICAL: position 상태를 내부적으로 관리하여 setPosition/getPosition 동작
      let currentPosition = { x: position.x, y: position.y };
      this.physicsComponent = {
        getBody: () => ({ position: currentPosition }),
        setPosition: (x: number, y: number) => {
          currentPosition.x = x;
          currentPosition.y = y;
        },
        getPosition: () => ({ ...currentPosition }),
        destroy: () => {},
      } as any;
    }

    // 초기 위치 동기화
    this.updateGraphics();
  }

  // 물리 엔진에 등록하지 않는 Ball 생성 (프리뷰용)
  public static createWithoutPhysics(
    id: string,
    position: Position
  ): BallEntity {
    return new BallEntity(id, position, false);
  }

  public moveAtAngle(angleDeg: number, delayMs: number): void {
    (this.physicsComponent as BallPhysicsComponent).moveAtAngle(
      angleDeg,
      delayMs
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
