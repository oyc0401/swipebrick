import type { PhysicsEngine } from "../physics/PhysicsEngine";
import { Brick } from "../entity/Brick";

export class BrickManager {
  private physics: PhysicsEngine;
  private bricks: Map<string, Brick> = new Map();

  constructor(physics: PhysicsEngine) {
    this.physics = physics;
    this.setupCollisionListener();
  }

  public createBrick(x: number, y: number, maxHits: number = 3): Brick {
    const brick = new Brick(x, y, maxHits);

    // 내부 관리용 맵에 추가
    this.bricks.set(brick.id, brick);

    return brick;
  }

  private generateRandomBrickData(health: number): (number | null)[] {
    // return [8000, 8000, 8000, 8000, 8000, null];

    // 확률 분포에 따라 벽돌 개수 결정
    const brickCount = this.selectBrickCountByProbability();

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
      slots[randomIndex] = health;
    }

    return slots;
  }

  private selectBrickCountByProbability(): number {
    // 벽돌 개수별 확률 (1개, 2개, 3개, 4개, 5개)
    const BRICK_COUNT_PROBABILITIES = [0.2, 0.3, 0.2, 0.2, 0.1];

    const random = Math.random();
    let cumulativeProbability = 0;

    for (let i = 0; i < BRICK_COUNT_PROBABILITIES.length; i++) {
      cumulativeProbability += BRICK_COUNT_PROBABILITIES[i];
      if (random <= cumulativeProbability) {
        return i + 1; // 1개부터 5개까지
      }
    }

    // 기본값 (확률 합이 1이 아닌 경우 대비)
    return 3;
  }

  public createBricks(health: number): void {
    const brickData = this.generateRandomBrickData(health);

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
    this.physics.onCollisionBrick((brickBody) => {
      const brick = this.findBrickByBody(brickBody);
      if (!brick) return;

      this.handleBrickCollision(brick);
    });
  }

  private findBrickByBody(body: Matter.Body): Brick | null {
    for (const brick of this.bricks.values()) {
      if (brick.getPhysicsBody() === body) {
        return brick;
      }
    }
    return null;
  }

  private handleBrickCollision(brick: Brick): void {
    // 벽돌 타격
    brick.hit();

    if (brick.getHealth() == 0) {
      this.destroyBrick(brick);
    }
  }

  private destroyBrick(brick: Brick): void {
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
