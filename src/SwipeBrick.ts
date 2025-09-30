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

type GridElement = Brick | Item;

export class SwipeBrick {
  private readonly GRID_WIDTH = 6;
  private readonly GRID_HEIGHT = 8;
  private bricks: (GridElement | null)[][];
  private level: number;
  private ballCount: number;
  private ballStartPosition: number;

  constructor() {
    this.bricks = this.initializeGrid();
    this.level = 1;
    this.ballCount = 1;
    // CRITICAL: 게임 영역 중앙 x좌표 - 공 발사 시작점
    this.ballStartPosition = 180; // GAME_WIDTH / 2
  }

  private initializeGrid(): (GridElement | null)[][] {
    const grid: (GridElement | null)[][] = [];
    for (let y = 0; y < this.GRID_HEIGHT; y++) {
      grid[y] = [];
      for (let x = 0; x < this.GRID_WIDTH; x++) {
        grid[y][x] = null;
      }
    }
    return grid;
  }

  createRow(): GridElement[] {
    const createdElements = this.generateRandomElement();
    const y = 0;

    createdElements.forEach((element, index) => {
      if (element !== null) {
        this.bricks[y][index] = element;
      }
    });

    return createdElements.filter(
      (element) => element !== null
    ) as GridElement[];
  }

  private generateRandomElement(): (GridElement | null)[] {
    const slots: (GridElement | null)[] = [null, null, null, null, null, null];
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

  hitBrick(stage: number, index: number): Brick | null {
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

    const element = this.bricks[y][index];
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
      this.bricks[y][index] = null;
      return null;
    }

    return element;
  }

  hitItem(stage: number, index: number): Item {
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

    const element = this.bricks[y][index];
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

    this.bricks[y][index] = null;
    // CRITICAL: 아이템 수집 시 볼 개수 증가 - 게임 플레이의 핵심 메커니즘
    this.ballCount++;
    return element;
  }

  incrementLevel(): void {
    this.level++;
  }

  getLevel(): number {
    return this.level;
  }

  incrementBallCount(): void {
    this.ballCount++;
  }

  getBallCount(): number {
    return this.ballCount;
  }

  setBallStartPosition(x: number): void {
    this.ballStartPosition = x;
  }

  getBallStartPosition(): number {
    return this.ballStartPosition;
  }

  isEndGame(): boolean {
    const lastRowIndex = this.GRID_HEIGHT - 1;
    for (let x = 0; x < this.GRID_WIDTH; x++) {
      const element = this.bricks[lastRowIndex][x];
      if (element !== null && element.type === "brick") {
        return true;
      }
    }
    return false;
  }

  shiftBrick(): (GridElement | null)[] {
    // CRITICAL: 반드시 아래(GRID_HEIGHT-1)부터 위(1)로 이동해야 함 - 순서 바뀌면 데이터 덮어씀
    for (let y = this.GRID_HEIGHT - 1; y >= 1; y--) {
      for (let x = 0; x < this.GRID_WIDTH; x++) {
        this.bricks[y][x] = this.bricks[y - 1][x];
        if (this.bricks[y][x] !== null) {
          // CRITICAL: y 좌표 업데이트 필수 - hitBrick/hitItem 위치 계산에 영향
          this.bricks[y][x]!.y = y;
        }
      }
    }

    // CRITICAL: 0행 초기화 - 새로운 브릭/아이템 생성을 위한 공간 확보
    for (let x = 0; x < this.GRID_WIDTH; x++) {
      this.bricks[0][x] = null;
    }

    const lastRowIndex = this.GRID_HEIGHT - 1;
    return this.bricks[lastRowIndex];
  }
}
