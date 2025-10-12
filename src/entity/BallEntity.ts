import { BALL_RADIUS, type Position } from "../GameState";
import { ActiveEntity } from "../core/entity/ActiveEntity";
import { CircleRenderComponent } from "../render/RenderComponent";
import { BallPhysicsComponent } from "../physics/PhysicsComponent";
import { EntityManager } from "../core/entity/EntityManager";
import { getTheme } from "../Setting";
import { Ticker } from "pixi.js";

export class BallEntity extends ActiveEntity {
  private radius: number = BALL_RADIUS;
  private color: number = getTheme().ballColor;

  private registerToPhysics: boolean;
  constructor(
    id: string,
    position: Position,
    registerToPhysics: boolean = true
  ) {
    super(id);

    this.registerToPhysics = registerToPhysics;

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

  public moveAtAngle(angleDeg: number, index: number): void {
    (this.physicsComponent as BallPhysicsComponent).moveAtAngle(
      angleDeg,
      index
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
    this.visible = visible;
    this.renderComponent.setVisible(visible);
  }

  private visible: boolean = false; //처음에는 false

  public isVisible(): boolean {
    return this.visible; // visible 상태 확인
  }

  public updateGraphics(): void {
    super.updateGraphics();

    // // y가 352를 초과하면 공을 숨김
    const position = this.getPosition();
    if (this.registerToPhysics) {
      if (position.y > 352) {
        this.setVisible(false);
      } else {
        this.setVisible(true); //
      }
    }
  }

  public moveTo(targetX: number): Promise<void> {
    return new Promise<void>((resolve) => {
      const ticker = new Ticker();

      ticker.add(() => {
        const pos = this.getPosition(); // 현재 위치
        const dx = targetX - pos.x;

        if (Math.abs(dx) < 1) {
          this.physicsComponent.setPosition(targetX, pos.y); // 실제 위치 업데이트
          ticker.stop();
          ticker.destroy();
          resolve(); // 이동 완료
        } else {
          this.physicsComponent.setPosition(pos.x + dx * 0.2, pos.y); // 부드럽게 이동
        }
      });

      ticker.start();
    });
  }

  public destroy(): void {
    // EntityManager에서 제거
    EntityManager.remove(this);

    // 부모 destroy 호출 (physicsComponent.destroy() 포함)
    super.destroy();
  }
}
