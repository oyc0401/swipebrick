type Brick = {
  type: "brick";
  id: string;
  x: number;
  y: number;
  health: number;
};

type Item = {
  type: "item";
  id: string;
  x: number;
  y: number;
};

type GameObject = Brick | Item;

export class SwipeBrick {
  private readonly GRID_WIDTH = 6;
  private readonly GRID_HEIGHT = 8;
  private readonly GAME_CENTER_X = 180; // GAME_WIDTH / 2

  private objects: (GameObject | null)[][];
  private level: number;
  private ballCount: number;
  private ballStartX: number;

  constructor() {
    this.objects = this.initializeGrid();
    this.level = 1;
    this.ballCount = 1;
    this.ballStartX = this.GAME_CENTER_X;
  }

  private initializeGrid(): (GameObject | null)[][] {
    const grid: (GameObject | null)[][] = [];
    for (let y = 0; y < this.GRID_HEIGHT; y++) {
      grid[y] = [];
      for (let x = 0; x < this.GRID_WIDTH; x++) {
        grid[y][x] = null;
      }
    }
    return grid;
  }

  // ===== 게임 상태 관리 =====

  /** 현재 레벨 반환 */
  getLevel(): number {
    return this.level;
  }

  /** 레벨 1 증가 */
  incrementLevel(): void {
    this.level++;
  }

  /** 공 개수 반환 */
  getBallCount(): number {
    return this.ballCount;
  }

  /** 게임 종료 여부 확인 */
  isGameOver(): boolean {
    const lastRowIndex = this.GRID_HEIGHT - 1;
    for (let x = 0; x < this.GRID_WIDTH; x++) {
      const element = this.objects[lastRowIndex][x];
      if (element !== null && element.type === "brick") {
        return true;
      }
    }
    return false;
  }

  // ===== 공 위치 관리 =====

  /** 공 시작 X좌표 반환 */
  getBallStartX(): number {
    return this.ballStartX;
  }

  /** 공 시작 X좌표 설정 */
  setBallStartX(x: number): void {
    this.ballStartX = x;
  }

  // ===== 게임 오브젝트 관리 =====

  /** 새로운 행 생성 */
  createNewRow(): (GameObject | null)[] {
    const createdElements = this.generateRandomElement();
    const y = 0;

    createdElements.forEach((element, index) => {
      if (element !== null) {
        this.objects[y][index] = element;
      }
    });

    return createdElements;
  }

  private generateRandomElement(): (GameObject | null)[] {
    const slots: (GameObject | null)[] = [null, null, null, null, null, null];
    const y = 0;

    const itemIndex = Math.floor(Math.random() * this.GRID_WIDTH);
    const item: Item = {
      type: "item",
      id: `item-${this.level}-${itemIndex}`,
      x: itemIndex,
      y,
    };
    slots[itemIndex] = item;

    const brickCount = this.getRandomBrickCount();
    const usedIndices = new Set<number>([itemIndex]);

    for (let i = 0; i < brickCount; i++) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * 6);
      } while (usedIndices.has(randomIndex));

      usedIndices.add(randomIndex);

      const brick: Brick = {
        type: "brick",
        id: `brick-${this.level}-${randomIndex}`,
        x: randomIndex,
        y,
        health: this.level,
      };
      slots[randomIndex] = brick;
    }

    return slots;
  }

  private getRandomBrickCount(): number {
    const BRICK_COUNT_PROBABILITIES = [0.2, 0.3, 0.2, 0.2, 0.1];
    const random = Math.random();
    let cumulativeProbability = 0;

    for (let i = 0; i < BRICK_COUNT_PROBABILITIES.length; i++) {
      cumulativeProbability += BRICK_COUNT_PROBABILITIES[i];
      if (random <= cumulativeProbability) {
        return i + 1;
      }
    }

    return 3;
  }

  /** 벽돌 데미지 처리 */
  damageBrick(stage: number, index: number): Brick | null {
    const targetId = `brick-${stage}-${index}`;
    // CRITICAL: 스테이지 차이로 현재 행 위치 계산 - 제작(0행) → shift → 제작(0행) 순서 의존
    const y = this.level - stage;

    if (
      y < 0 ||
      y >= this.GRID_HEIGHT ||
      index < 0 ||
      index >= this.GRID_WIDTH
    ) {
      throw new Error(`Invalid position: y=${y}, x=${index}`);
    }

    const element = this.objects[y][index];
    if (element === null) {
      throw new Error(`No element at position y=${y}, x=${index}`);
    }

    if (element.type !== "brick") {
      throw new Error(`Element at position y=${y}, x=${index} is not a brick`);
    }

    if (element.id !== targetId) {
      throw new Error(
        `Brick ID mismatch: expected ${targetId}, got ${element.id}`
      );
    }

    element.health--;
    if (element.health <= 0) {
      this.objects[y][index] = null;
      return null;
    }

    return element;
  }

  /** 아이템 수집 */
  collectItem(stage: number, index: number): Item {
    const targetId = `item-${stage}-${index}`;
    // CRITICAL: hitBrick과 동일한 위치 계산 로직
    const y = this.level - stage;

    if (
      y < 0 ||
      y >= this.GRID_HEIGHT ||
      index < 0 ||
      index >= this.GRID_WIDTH
    ) {
      throw new Error(`Invalid position: y=${y}, x=${index}`);
    }

    const element = this.objects[y][index];
    if (element === null) {
      throw new Error(`No element at position y=${y}, x=${index}`);
    }

    if (element.type !== "item") {
      throw new Error(`Element at position y=${y}, x=${index} is not an item`);
    }

    if (element.id !== targetId) {
      throw new Error(
        `Item ID mismatch: expected ${targetId}, got ${element.id}`
      );
    }

    this.objects[y][index] = null;
    // 아이템 수집 시 볼 개수 증가 - 게임 플레이의 핵심 메커니즘
    this.ballCount++;
    return element;
  }

  /** 모든 행을 아래로 이동 */
  shiftRowsDown(): (GameObject | null)[] {
    // CRITICAL: 반드시 아래(GRID_HEIGHT-1)부터 위(1)로 이동해야 함 - 순서 바뀌면 데이터 덮어씀
    for (let y = this.GRID_HEIGHT - 1; y >= 1; y--) {
      for (let x = 0; x < this.GRID_WIDTH; x++) {
        this.objects[y][x] = this.objects[y - 1][x];
        if (this.objects[y][x] !== null) {
          // CRITICAL: y 좌표 업데이트 필수 - hitBrick/hitItem 위치 계산에 영향
          this.objects[y][x]!.y = y;
        }
      }
    }

    // CRITICAL: 0행 초기화 - 새로운 브릭/아이템 생성을 위한 공간 확보
    for (let x = 0; x < this.GRID_WIDTH; x++) {
      this.objects[0][x] = null;
    }

    const lastRowIndex = this.GRID_HEIGHT - 1;
    return this.objects[lastRowIndex];
  }
}
