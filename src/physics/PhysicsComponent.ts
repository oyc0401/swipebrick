import * as Matter from "matter-js";
import type { IPhysicsComponent } from "../components/IComponent";

export class PhysicsComponent implements IPhysicsComponent {
  protected body: Matter.Body;
  protected world: Matter.World;

  constructor(world: Matter.World) {
    this.world = world;
    this.body = Matter.Bodies.rectangle(0, 0, 1, 1); // 기본값, 하위 클래스에서 재정의
  }

  public getBody(): Matter.Body {
    return this.body;
  }

  public setPosition(x: number, y: number): void {
    Matter.Body.setPosition(this.body, { x, y });
  }

  public getPosition(): { x: number; y: number } {
    return { x: this.body.position.x, y: this.body.position.y };
  }

  public destroy(): void {
    Matter.World.remove(this.world, this.body);
  }
}

export class BallPhysicsComponent extends PhysicsComponent {
  private radius: number;

  constructor(world: Matter.World, x: number, y: number, radius: number) {
    super(world);
    this.radius = radius;
    this.createBallBody(x, y);
    Matter.World.add(this.world, this.body);
  }

  private createBallBody(x: number, y: number): void {
    this.body = Matter.Bodies.circle(x, y, this.radius, {
      restitution: 1,
      friction: 0,
      frictionAir: 0,
      frictionStatic: 0,
      inertia: Infinity,
      label: "ball",
    });
  }

  public moveTowards(targetX: number, targetY: number): void {
    if (this.body.isSleeping) {
      Matter.Sleeping.set(this.body, false);
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

      Matter.Body.applyForce(this.body, this.body.position, {
        x: forceX,
        y: forceY,
      });
    }
  }
}

export class BoundaryPhysicsComponent extends PhysicsComponent {
  constructor(
    world: Matter.World,
    x: number,
    y: number,
    width: number,
    height: number,
    label: string = "boundary"
  ) {
    super(world);
    this.createBoundaryBody(x, y, width, height, label);
    Matter.World.add(this.world, this.body);
  }

  private createBoundaryBody(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string
  ): void {
    this.body = Matter.Bodies.rectangle(
      x + width / 2,
      y + height / 2,
      width,
      height,
      {
        isStatic: true,
        label: label,
      }
    );
  }
}
