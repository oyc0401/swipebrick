import type { PhysicsEngine } from "../physics/PhysicsEngine";
import { BrickEntity } from "../entity/BrickEntity";
import { ItemEntity } from "../entity/ItemEntity";
import type { SwipeBrick } from "../SwipeBrick";

interface BrickCollisionCallback {
  (brick: BrickEntity): void;
}

interface BrickDestroyCallback {
  (brick: BrickEntity): void;
}

interface ItemCollisionCallback {
  (item: ItemEntity): void;
}

export class BrickManager {
  private physics: PhysicsEngine;
  private brickEntities: Map<string, BrickEntity> = new Map();
  private itemEntities: Map<string, ItemEntity> = new Map();
  private brickCollisionCallbacks: BrickCollisionCallback[] = [];
  private brickDestroyCallbacks: BrickDestroyCallback[] = [];
  private itemCollisionCallbacks: ItemCollisionCallback[] = [];

  private swipeBrick: SwipeBrick;

  constructor(physics: PhysicsEngine, swipeBrick: SwipeBrick) {
    this.physics = physics;
    this.swipeBrick = swipeBrick;
    this.setupCollisionListener();
  }

  public createBricks(): void {
    // CRITICAL: SwipeBrick에서 논리적 상태 생성 후 BrickEntity/ItemEntity로 시각화
    const elements = this.swipeBrick.createNewRow();

    console.log("Entities created:", {
      timestamp: new Date().toISOString(),
      level: this.swipeBrick.getLevel(),
      elements,
    });

    const BRICK_WIDTH = 60;
    const BRICK_Y = 40;

    elements.forEach((element, index) => {
      if (element !== null) {
        const x = index * BRICK_WIDTH + BRICK_WIDTH / 2;
        const y = BRICK_Y + 20; // 40px 높이의 절반

        if (element.type === "brick") {
          // CRITICAL: SwipeBrick의 ID를 BrickEntity에 전달하여 동기화
          const brick = new BrickEntity(element.id, { x, y }, element.health);
          this.brickEntities.set(brick.id, brick);
        } else if (element.type === "item") {
          // CRITICAL: SwipeBrick의 ID를 ItemEntity에 전달하여 동기화
          const item = new ItemEntity(element.id, { x, y });
          this.itemEntities.set(item.id, item);
        }
      }
    });

    this.updateAllBrickColors();
  }

  private setupCollisionListener(): void {
    this.physics.onCollisionBrick((body) => {
      const brick = this.findBrickByBody(body);
      if (brick) {
        this.handleBrickCollision(brick);
        return;
      }

      const item = this.findItemByBody(body);
      if (item) {
        this.handleItemCollision(item);
        return;
      }

      console.error("Unknown collision body:", {
        timestamp: new Date().toISOString(),
        body: {
          label: body.label,
          id: body.id,
          position: { x: body.position.x, y: body.position.y },
          category: body.collisionFilter.category,
          mask: body.collisionFilter.mask,
          isStatic: body.isStatic,
          isSensor: body.isSensor,
        },
        entities: {
          brickCount: this.brickEntities.size,
          itemCount: this.itemEntities.size,
          brickIds: Array.from(this.brickEntities.keys()),
          itemIds: Array.from(this.itemEntities.keys()),
        },
        level: this.swipeBrick.getLevel(),
      });
    });
  }

  private findBrickByBody(body: Matter.Body): BrickEntity | null {
    const entityId = body.plugin.entityId;
    return this.brickEntities.get(entityId) || null;
  }

  private findItemByBody(body: Matter.Body): ItemEntity | null {
    const entityId = body.plugin.entityId;
    return this.itemEntities.get(entityId) || null;
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

  private handleItemCollision(item: ItemEntity): void {
    // CRITICAL: SwipeBrick ID 파싱 - item-{stage}-{index} 형식 의존
    const idParts = item.id.split("-");
    const stage = parseInt(idParts[1]);
    const index = parseInt(idParts[2]);

    // CRITICAL: SwipeBrick에서 아이템 수집 처리 (공 개수 증가)
    this.swipeBrick.collectItem(stage, index);

    // ItemEntity 제거
    this.destroyItem(item);

    this.itemCollisionCallbacks.forEach((callback) => {
      callback(item);
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

  private destroyItem(item: ItemEntity): void {
    // 내부 맵에서 제거
    this.itemEntities.delete(item.id);

    // 아이템 파괴
    item.destroy();
  }

  public shift(): void {
    // SwipeBrick에서 shift 수행하고 마지막 행 요소들 확인
    const lastRowElements = this.swipeBrick.shiftRowsDown();

    // 마지막 행에 있던 아이템들 자동 수집 및 ItemEntity 제거
    lastRowElements.forEach((element, index) => {
      if (element !== null && element.type === "item") {
        const idParts = element.id.split("-");
        const stage = parseInt(idParts[1]);
        this.swipeBrick.collectItem(stage, index);

        // 해당 ItemEntity 찾아서 제거
        const item = this.itemEntities.get(element.id);
        if (item) {
          this.destroyItem(item);
        }
      }
    });

    // 기존 BrickEntity들과 ItemEntity들의 물리적 위치 업데이트
    const SHIFT_AMOUNT = 40;
    for (const brick of this.brickEntities.values()) {
      brick.shift(SHIFT_AMOUNT);
    }
    for (const item of this.itemEntities.values()) {
      item.shift(SHIFT_AMOUNT);
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

  public onItemCollision(callback: ItemCollisionCallback): void {
    this.itemCollisionCallbacks.push(callback);
  }

  public reset(): void {
    // 모든 벽돌 엔티티 제거
    for (const brick of this.brickEntities.values()) {
      brick.destroy();
    }
    // 모든 아이템 엔티티 제거
    for (const item of this.itemEntities.values()) {
      item.destroy();
    }
    this.brickEntities.clear();
    this.itemEntities.clear();
  }

  public destroy(): void {
    // 모든 벽돌 파괴
    for (const brick of this.brickEntities.values()) {
      this.destroyBrick(brick);
    }
    // 모든 아이템 파괴
    for (const item of this.itemEntities.values()) {
      this.destroyItem(item);
    }
    this.brickEntities.clear();
    this.itemEntities.clear();
    this.brickCollisionCallbacks = [];
    this.brickDestroyCallbacks = [];
    this.itemCollisionCallbacks = [];
  }
}
