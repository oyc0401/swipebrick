import * as PIXI from "pixi.js";
import * as Matter from "matter-js";
import type { Position } from "./GameState";

export class Ball {
  private graphics: PIXI.Graphics;
  private body: Matter.Body;
  private radius: number = 8;
  private color: number = 0x4880ee; // 토스 블루

  constructor(position: Position, world: Matter.World) {
    this.graphics = new PIXI.Graphics();
    this.createBall();

    // Matter.js 원형 바디 생성
    this.body = Matter.Bodies.circle(position.x, position.y, this.radius, {
      restitution: 1, // 완전 탄성 충돌
      friction: 0, // 마찰 없음
      frictionAir: 0.0, // 공기저항 없음
    });

    Matter.World.add(world, this.body);
    this.setPosition(position);
  }

  private createBall(): void {
    this.graphics.clear();
    this.graphics.circle(0, 0, this.radius);
    this.graphics.fill({ color: this.color });
  }

  public setPosition(position: Position): void {
    Matter.Body.setPosition(this.body, { x: position.x, y: position.y });
    this.updateGraphics();
  }

  public getPosition(): Position {
    return { x: this.body.position.x, y: this.body.position.y };
  }

  public moveTowards(targetX: number, targetY: number): void {
    const currentPos = this.body.position;
    const dx = targetX - currentPos.x;
    const dy = targetY - currentPos.y;

    // 방향 벡터 정규화
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 0) {
      const force = 0.005; // 힘의 크기
      const forceX = (dx / distance) * force;
      const forceY = (dy / distance) * force;

      Matter.Body.applyForce(this.body, this.body.position, {
        x: forceX,
        y: forceY,
      });
    }
  }

  public updateGraphics(): void {
    this.graphics.x = this.body.position.x;
    this.graphics.y = this.body.position.y;
  }

  public getGraphics(): PIXI.Graphics {
    return this.graphics;
  }

  public destroy(): void {
    this.graphics.destroy();
  }
}
