import type { Container } from "pixi.js";
import type { PhysicsEngine } from "../physics/PhysicsEngine";
import { Brick } from "../entity/Brick";
import { Body } from "matter-js";

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
    this.physics.onCollisionBall((ball, bodies) => {
      // 공이 충돌한 바디들 중 벽돌들만 필터링
      const brickBodies = bodies.filter((body) => body.label === "brick");

      if (brickBodies.length > 0) {
        console.log("Ball hit bricks!", {
          timestamp: new Date().toISOString(),
          ballId: ball.id,
          ballVelocity: ball.velocity,
          brickCount: brickBodies.length,
          brickIds: brickBodies.map((body) => body.id),
        });

        // 벽돌 충돌 처리
        if (brickBodies.length === 2) {
          const brick1 = brickBodies[0];
          const brick2 = brickBodies[1];

          // 두 벽돌의 ID가 모두 "brick"으로 시작하는지 확인
          const bothAreBricks =
            brick1.label.startsWith("brick") &&
            brick2.label.startsWith("brick");
          const sameYPosition =
            Math.abs(brick1.position.y - brick2.position.y) < 1;
          const sameXPosition =
            Math.abs(brick1.position.x - brick2.position.x) < 1;

          if (bothAreBricks && (sameYPosition || sameXPosition)) {
            // 속도 조작: 이전 속도 가져오기
            const previousVelocity = (ball as any).previousVelocity;

            if (previousVelocity) {
              if (sameYPosition) {
                // y좌표가 같으면: vx = 이전속도.x, vy = -이전속도.y
                Body.setVelocity(ball, {
                  x: previousVelocity.x,
                  y: -previousVelocity.y,
                });
              } else if (sameXPosition) {
                // x좌표가 같으면: vx = -이전속도.x, vy = 이전속도.y
                Body.setVelocity(ball, {
                  x: -previousVelocity.x,
                  y: previousVelocity.y,
                });
              }
            }

            // 공과 더 가까운 벽돌만 처리
            const ballPos = ball.position;
            const distance1 = Math.sqrt(
              Math.pow(ballPos.x - brick1.position.x, 2) +
                Math.pow(ballPos.y - brick1.position.y, 2)
            );
            const distance2 = Math.sqrt(
              Math.pow(ballPos.x - brick2.position.x, 2) +
                Math.pow(ballPos.y - brick2.position.y, 2)
            );

            const closestBrick = distance1 <= distance2 ? brick1 : brick2;
            this.handleBrickCollision(closestBrick);

            console.log("Velocity manipulated and hit closest brick:", {
              previousVelocity,
              newVelocity: ball.velocity,
              sameY: sameYPosition,
              sameX: sameXPosition,
              brick1Distance: distance1,
              brick2Distance: distance2,
              chosenBrick: closestBrick.id,
            });
          } else {
            // x, y가 다른 경우 모든 벽돌 처리
            brickBodies.forEach((brickBody) => {
              this.handleBrickCollision(brickBody);
            });
          }
        } else {
          // 벽돌이 2개가 아닌 경우 모든 벽돌 처리
          brickBodies.forEach((brickBody) => {
            this.handleBrickCollision(brickBody);
          });
        }
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
