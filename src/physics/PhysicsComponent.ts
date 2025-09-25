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
      slop: 0.01,
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
      this.body.restitution = 1;
    }

    const currentPos = this.body.position;
    const dx = targetX - currentPos.x;
    const dy = targetY - currentPos.y;

    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 0) {
      const force = 0.005;
      const forceX = (dx / distance) * force;
      const forceY = (dy / distance) * force;

      Body.applyForce(this.body, this.body.position, {
        x: forceX,
        y: forceY,
      });
    }
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
    this.body = Bodies.rectangle(x + width / 2, y + height / 2, width, height, {
      isStatic: true, // 정적 객체
      restitution: 1, // 완전 탄성 반사
      friction: 0, // 마찰 완전 제거
      frictionStatic: 0, // 정적 마찰 완전 제거
      slop: 0.01,
      label: label,
      collisionFilter: {
        category: 0x0002, // 벽 카테고리
        mask: 0x0001, // 공과만 충돌
      },
    });
  }
}
