import type { Container } from "pixi.js";
import type { PhysicsEngine } from "../physics/PhysicsEngine";
import { Brick } from "../entity/Brick";

export class BrickManager {
  private container: Container;
  private physics: PhysicsEngine;
  private bricks: Map<string, Brick> = new Map();

  constructor(container: Container, physics: PhysicsEngine) {
    this.container = container;
    this.physics = physics;
    this.setupCollisionListener();
  }

  public createBrick(x: number, y: number, maxHits: number = 3): Brick {
    const brick = new Brick(x, y, maxHits);

    // 렌더링에 추가
    this.container.addChild(brick.getGraphics());

    // 물리 엔진에 추가
    this.physics.addBody(brick.getPhysicsBody());

    // 내부 관리용 맵에 추가
    this.bricks.set(brick.id, brick);

    return brick;
  }

  private generateRandomBrickData(): (number | null)[] {
    // return [8000, 8000, 8000, 8000, 8000, null];
    // 2~5개 사이의 랜덤 개수
    const brickCount = Math.floor(Math.random() * 4) + 2; // 2, 3, 4, 5

    // 모든 벽돌의 동일한 체력
    const hp = 8;

    // 6개 슬롯 배열 생성
    const slots: (number | null)[] = [null, null, null, null, null, null];

    // 랜덤 위치에 벽돌 배치
    const usedIndices = new Set<number>();

    for (let i = 0; i < brickCount; i++) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * 6);
      } while (usedIndices.has(randomIndex));

      usedIndices.add(randomIndex);
      slots[randomIndex] = hp;
    }

    return slots;
  }

  public createBricks(): void {
    const brickData = this.generateRandomBrickData();

    const BRICK_WIDTH = 60;
    const BRICK_Y = 40;

    brickData.forEach((hits, index) => {
      if (hits !== null) {
        const x = index * BRICK_WIDTH;
        this.createBrick(x, BRICK_Y, hits);
      }
    });
  }

  private setupCollisionListener(): void {
    this.physics.onCollision((bodyA, bodyB, pair) => {
      let ballBody: Matter.Body | null = null;
      let brickBody: Matter.Body | null = null;

      // 충돌한 바디 중 공과 벽돌 찾기
      if (bodyA.label === "ball" && bodyB.label === "brick") {
        ballBody = bodyA;
        brickBody = bodyB;
      } else if (bodyA.label === "brick" && bodyB.label === "ball") {
        ballBody = bodyB;
        brickBody = bodyA;
      }

      if (ballBody && brickBody && pair.collision) {
        const hitPoint = pair.collision.supports[0];
        console.log("Ball hit brick!", {
          timestamp: new Date().toISOString(),
          ballId: ballBody.id,
          brickId: brickBody.id,
          ballVelocity: ballBody.velocity.x / ballBody.velocity.y,
          hitPoint: hitPoint ? { x: hitPoint.x, y: hitPoint.y } : null,
        });
        this.handleBrickCollision(brickBody);
      }
    });
  }

  private handleBrickCollision(brickBody: Matter.Body): void {
    // 바디에 해당하는 벽돌 찾기
    const brick = this.findBrickByBody(brickBody);
    if (!brick) return;

    // 벽돌 타격
    const isDestroyed = brick.hit();

    if (isDestroyed) {
      this.destroyBrick(brick);
    }
  }

  private findBrickByBody(body: Matter.Body): Brick | null {
    for (const brick of this.bricks.values()) {
      if (brick.getPhysicsBody() === body) {
        return brick;
      }
    }
    return null;
  }

  private destroyBrick(brick: Brick): void {
    // 렌더링에서 제거
    this.container.removeChild(brick.getGraphics());

    // 물리 엔진에서 제거
    this.physics.removeBody(brick.getPhysicsBody());

    // 내부 맵에서 제거
    this.bricks.delete(brick.id);

    // 벽돌 파괴
    brick.destroy();
  }

  public shift(): void {
    console.log("shift");
    const SHIFT_AMOUNT = 40;

    for (const brick of this.bricks.values()) {
      brick.shift(SHIFT_AMOUNT);
    }
  }

  public destroy(): void {
    // 모든 벽돌 파괴
    for (const brick of this.bricks.values()) {
      this.destroyBrick(brick);
    }
    this.bricks.clear();
  }
}
