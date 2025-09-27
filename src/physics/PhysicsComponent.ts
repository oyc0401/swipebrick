import { Body, Bodies, Sleeping } from "matter-js";
import type { IPhysicsComponent } from "../core/components/IComponent";

export abstract class PhysicsComponent implements IPhysicsComponent {
  protected body: Matter.Body;

  constructor() {
    this.body = Bodies.rectangle(0, 0, 1, 1); // 기본값, 하위 클래스에서 재정의
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

  public destroy(): void {}
}

export class BallPhysicsComponent extends PhysicsComponent {
  private radius: number;

  constructor(x: number, y: number, radius: number) {
    super();
    this.radius = radius;
    this.createBallBody(x, y);
  }

  private createBallBody(x: number, y: number): void {
    this.body = Bodies.circle(x, y, this.radius, {
      restitution: 1,
      friction: 0,
      frictionAir: 0,
      frictionStatic: 0,
      inertia: Infinity,
      slop: 0.0,
      label: "ball",
      collisionFilter: {
        category: 0x0001, // 공 카테고리
        mask: 0x0002 | 0x0004, // 벽과만 충돌, 다른 공과는 충돌 안함
      },
    });
  }

  public moveTowards(targetX: number, targetY: number): void {
    if (this.body.isSleeping) {
      Sleeping.set(this.body, false);
    }

    const pos = this.body.position;
    const dx = targetX - pos.x;
    const dy = targetY - pos.y;

    const distance = Math.hypot(dx, dy);
    if (distance === 0) return;

    // 원하는 이동 속도(px/초 단위)
    const SPEED = 10;

    // 방향을 단위 벡터로 만들고 속도 적용
    const vx = (dx / distance) * SPEED;
    const vy = (dy / distance) * SPEED;

    // 현재 바디의 속도를 직접 세팅
    Body.setVelocity(this.body, { x: vx, y: vy });
  }
}

export class BoundaryPhysicsComponent extends PhysicsComponent {
  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string = "boundary"
  ) {
    super();
    this.createBoundaryBody(x, y, width, height, label);
  }

  private createBoundaryBody(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string
  ): void {
    // 벽돌인 경우 다른 카테고리 사용
    const category = label === "brick" ? 0x0004 : 0x0002;

    this.body = Bodies.rectangle(x + width / 2, y + height / 2, width, height, {
      isStatic: true, // 정적 객체
      restitution: 1, // 완전 탄성 반사
      friction: 0, // 마찰 완전 제거
      frictionStatic: 0, // 정적 마찰 완전 제거
      slop: 0.0,
      label: label,
      collisionFilter: {
        category: category, // 벽돌: 0x0004, 벽: 0x0002
        mask: 0x0001, // 공과만 충돌
      },
    });
  }
}
