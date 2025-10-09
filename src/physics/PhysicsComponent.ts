import { Body, Bodies, Sleeping } from "matter-js";
import type { IPhysicsComponent } from "../core/components/IComponent";
import { PhysicsEngine } from "./PhysicsEngine";
import { BALL_SPEED } from "../Setting";

const enum CollisionCategories {
  BALL = 0x0001, // 공
  BOUNDARY = 0x0002, // 경계벽
  BRICK = 0x0004, // 벽돌
  ITEM = 0x0008, // 아이템
}

export abstract class MatterJSComponent implements IPhysicsComponent {
  protected body: Matter.Body;

  constructor() {
    this.body = Bodies.rectangle(0, 0, 1, 1); // 기본값, 하위 클래스에서 재정의
  }

  protected registerToPhysics(): void {
    PhysicsEngine.getInstance().addBody(this.body);
  }
  public getBody(): Matter.Body {
    return this.body;
  }

  public setPosition(x: number, y: number): void {
    Body.setPosition(this.body, { x, y });
  }

  public getPosition(): { x: number; y: number } {
    return { x: this.body.position.x, y: this.body.position.y };
  }

  public destroy(): void {
    PhysicsEngine.getInstance().removeBody(this.body);
  }
}

export class BallPhysicsComponent extends MatterJSComponent {
  private radius: number;

  constructor(x: number, y: number, radius: number) {
    super();
    this.radius = radius;
    this.createBallBody(x, y);
    this.registerToPhysics();
  }

  private createBallBody(x: number, y: number): void {
    this.body = Bodies.circle(x, y, this.radius, {
      restitution: 1,
      friction: 0,
      frictionAir: 0,
      frictionStatic: 0,
      inertia: Infinity,
      isSensor: true,
      slop: 0.0,
      label: "ball",
      collisionFilter: {
        category: CollisionCategories.BALL,
        mask:
          CollisionCategories.BOUNDARY |
          CollisionCategories.BRICK |
          CollisionCategories.ITEM,
      },
    });
  }

  public moveAtAngle(angleDeg: number, index: number): void {
    // 서로 32만큼 떨어져있음.
    const delayDistance = 32 * index;

    // 발사 각도의 반대 방향으로 delayDistance만큼 뒤에서 시작
    const angleRad = (-angleDeg * Math.PI) / 180; // PixiJS 좌표계에 맞춤
    const startX = this.body.position.x - Math.cos(angleRad) * delayDistance;
    const startY = this.body.position.y - Math.sin(angleRad) * delayDistance;

    // 새 위치로 이동
    Body.setPosition(this.body, { x: startX, y: startY });

    // 즉시 발사
    this.launchImmediately(angleDeg, BALL_SPEED);

    // 일정 시간 후 body.start = true 설정
    this.body.isSensor = true;

    // setTimeout(() => {
    //   (this.body as any).started = true;
    //   this.body.isSensor = false;
    //   console.log("변화");
    // }, delayMs * 2 + 10);
  }

  private launchImmediately(targetAngle: number, speed: number): void {
    if (this.body.isSleeping) {
      Sleeping.set(this.body, false);
    }

    const angleRad = (-targetAngle * Math.PI) / 180;
    const unitX = Math.cos(angleRad);
    const unitY = Math.sin(angleRad);

    // 즉시 속도 적용
    Body.setVelocity(this.body, {
      x: unitX * speed,
      y: unitY * speed,
    });
  }
}

export class BoundaryPhysicsComponent extends MatterJSComponent {
  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    entityId: string,
    label: string = "boundary"
  ) {
    super();
    this.createBoundaryBody(x, y, width, height, label, entityId);
    this.registerToPhysics();
  }

  private createBoundaryBody(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    entityId: string
  ): void {
    // 벽돌인 경우 다른 카테고리 사용
    const category =
      label === "brick"
        ? CollisionCategories.BRICK
        : CollisionCategories.BOUNDARY;

    this.body = Bodies.rectangle(x, y, width, height, {
      isStatic: true, // 정적 객체
      restitution: 1, // 완전 탄성 반사
      friction: 0, // 마찰 완전 제거
      frictionStatic: 0, // 정적 마찰 완전 제거
      slop: 0.0,
      label: label,
      plugin: { entityId }, // 엔티티 ID 저장
      collisionFilter: {
        category: category,
        mask: CollisionCategories.BALL,
      },
    });
  }
}

export class ItemPhysicsComponent extends MatterJSComponent {
  private radius: number;

  constructor(x: number, y: number, radius: number, entityId: string) {
    super();
    this.radius = radius;
    this.createItemBody(x, y, entityId);
    this.registerToPhysics();
  }

  private createItemBody(x: number, y: number, entityId: string): void {
    this.body = Bodies.circle(x, y, this.radius, {
      isStatic: true, // 정적 객체 (아이템은 움직이지 않음)
      isSensor: true, // 센서로 설정 - 물리적 충돌 없음, 감지만
      restitution: 0, // 아이템은 반사하지 않음
      friction: 0, // 마찰 완전 제거
      frictionStatic: 0, // 정적 마찰 완전 제거
      slop: 0.0,
      label: "item",
      plugin: { entityId }, // 엔티티 ID 저장
      collisionFilter: {
        category: CollisionCategories.ITEM,
        mask: CollisionCategories.BALL,
      },
    });
  }
}
