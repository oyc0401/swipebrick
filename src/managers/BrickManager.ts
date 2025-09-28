import type { PhysicsEngine } from "../physics/PhysicsEngine";
import type { GameState } from "../GameState";
import { Brick } from "../entity/Brick";

export class BrickManager {
  private physics: PhysicsEngine;
  private gameState: GameState;
  private bricks: Map<string, Brick> = new Map();

  constructor(physics: PhysicsEngine, gameState: GameState) {
    this.physics = physics;
    this.gameState = gameState;
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

    // 새 스테이지마다 모든 벽돌 색상 업데이트
    this.updateAllBrickColors();
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

    // 벽돌 색상 업데이트 (체력 변화 반영)
    const brickHealth = brick.getHealth();
    const color = this.calculateBrickColor(brickHealth, this.gameState.level);
    brick.setColor(color);

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

  public updateAllBrickColors(): void {
    const currentLevel = this.gameState.level;

    for (const brick of this.bricks.values()) {
      const brickHealth = brick.getHealth();
      const color = this.calculateBrickColor(brickHealth, currentLevel);
      brick.setColor(color);
    }
  }

  private calculateBrickColor(currentHealth: number, stage: number): number {
    // stage를 기준으로 색상 계산
    // 체력이 높을수록 진한 파란색, 낮을수록 연한 파란색
    const maxColor = 0x1f4ef5; // 진한 파란색 (#1F4EF5)
    const minColor = 0x83b4f9; // 연한 파란색 (#83B4F9)

    // currentHealth/stage 비율로 색상 보간 (0~1)
    const ratio = Math.min(currentHealth / stage, 1);

    return this.interpolateColor(minColor, maxColor, ratio);
  }

  private interpolateColor(color1: number, color2: number, ratio: number): number {
    // color1에서 color2로 ratio만큼 보간 (ratio: 0~1)
    const r1 = (color1 >> 16) & 0xff;
    const g1 = (color1 >> 8) & 0xff;
    const b1 = color1 & 0xff;

    const r2 = (color2 >> 16) & 0xff;
    const g2 = (color2 >> 8) & 0xff;
    const b2 = color2 & 0xff;

    const r = Math.floor(r1 + (r2 - r1) * ratio);
    const g = Math.floor(g1 + (g2 - g1) * ratio);
    const b = Math.floor(b1 + (b2 - b1) * ratio);

    return (r << 16) | (g << 8) | b;
  }

  public destroy(): void {
    // 모든 벽돌 파괴
    for (const brick of this.bricks.values()) {
      this.destroyBrick(brick);
    }
    this.bricks.clear();
  }
}
