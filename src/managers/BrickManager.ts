import type { PhysicsEngine } from "../physics/PhysicsEngine";
import { BrickEntity } from "../entity/BrickEntity";
import type { SwipeBrick } from "../SwipeBrick";

interface BrickCollisionCallback {
  (brick: BrickEntity): void;
}

interface BrickDestroyCallback {
  (brick: BrickEntity): void;
}

export class BrickManager {
  private physics: PhysicsEngine;
  private brickEntities: Map<string, BrickEntity> = new Map();
  private brickCollisionCallbacks: BrickCollisionCallback[] = [];
  private brickDestroyCallbacks: BrickDestroyCallback[] = [];

  private swipeBrick: SwipeBrick;

  constructor(physics: PhysicsEngine, swipeBrick: SwipeBrick) {
    this.physics = physics;
    this.swipeBrick = swipeBrick;
    this.setupCollisionListener();
  }

  public createBricks(): void {
    // CRITICAL: SwipeBrick에서 논리적 상태 생성 후 BrickEntity로 시각화
    const elements = this.swipeBrick.createNewRow();

    const BRICK_WIDTH = 60;
    const BRICK_Y = 40;

    elements.forEach((element, index) => {
      if (element !== null && element.type === "brick") {
        const x = index * BRICK_WIDTH + BRICK_WIDTH / 2;
        const y = BRICK_Y + 20; // 40px 높이의 절반

        // CRITICAL: SwipeBrick의 ID를 BrickEntity에 전달하여 동기화
        const brick = new BrickEntity({ x, y }, element.health, element.id);
        this.brickEntities.set(brick.id, brick);
      }
    });

    this.updateAllBrickColors();
  }

  private setupCollisionListener(): void {
    this.physics.onCollisionBrick((brickBody) => {
      const brick = this.findBrickByBody(brickBody);
      if (!brick) return;

      this.handleBrickCollision(brick);
    });
  }

  private findBrickByBody(body: Matter.Body): BrickEntity | null {
    for (const brick of this.brickEntities.values()) {
      if (brick.getPhysicsBody() === body) {
        return brick;
      }
    }
    return null;
  }

  private handleBrickCollision(brick: BrickEntity): void {
    // CRITICAL: SwipeBrick ID 파싱 - brick-{stage}-{index} 형식 의존
    const idParts = brick.id.split("-");
    const stage = parseInt(idParts[1]);
    const index = parseInt(idParts[2]);

    // CRITICAL: SwipeBrick이 논리적 상태 관리, BrickEntity는 시각적 동기화만
    const hitResult = this.swipeBrick.damageBrick(stage, index);

    if (hitResult === null) {
      // SwipeBrick에서 파괴됨 - BrickEntity도 제거
      this.destroyBrick(brick);
      return;
    } else {
      // CRITICAL: SwipeBrick → BrickEntity 상태 동기화
      const remainingHealth = hitResult.health;
      brick.setHealth(remainingHealth);
      brick.calculateBrickColor(this.swipeBrick.getLevel());
    }

    this.brickCollisionCallbacks.forEach((callback) => {
      callback(brick);
    });
  }

  private destroyBrick(brick: BrickEntity): void {
    // 외부 파괴 콜백 호출 (벽돌이 실제로 파괴되기 전에)
    this.brickDestroyCallbacks.forEach((callback) => {
      callback(brick);
    });

    // 내부 맵에서 제거
    this.brickEntities.delete(brick.id);

    // 벽돌 파괴
    brick.destroy();
  }

  public shift(): void {
    // SwipeBrick에서 shift 수행하고 마지막 행 요소들 확인
    const lastRowElements = this.swipeBrick.shiftRowsDown();

    // 마지막 행에 있던 아이템들 자동 수집
    lastRowElements.forEach((element, index) => {
      if (element !== null && element.type === "item") {
        const idParts = element.id.split("-");
        const stage = parseInt(idParts[1]);
        this.swipeBrick.collectItem(stage, index);
      }
    });

    // 기존 BrickEntity들의 물리적 위치 업데이트
    const SHIFT_AMOUNT = 40;
    for (const brick of this.brickEntities.values()) {
      brick.shift(SHIFT_AMOUNT);
    }

    // 게임 오버 체크
    if (this.swipeBrick.isGameOver()) {
      console.log("Game Over - Brick reached bottom!");
    }
  }

  public updateAllBrickColors(): void {
    const currentStage = this.swipeBrick.getLevel();

    for (const brick of this.brickEntities.values()) {
      brick.calculateBrickColor(currentStage);
    }
  }

  public onBrickCollision(callback: BrickCollisionCallback): void {
    this.brickCollisionCallbacks.push(callback);
  }

  public onBrickDestroy(callback: BrickDestroyCallback): void {
    this.brickDestroyCallbacks.push(callback);
  }

  public destroy(): void {
    // 모든 벽돌 파괴
    for (const brick of this.brickEntities.values()) {
      this.destroyBrick(brick);
    }
    this.brickEntities.clear();
    this.brickCollisionCallbacks = [];
    this.brickDestroyCallbacks = [];
  }
}
