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
  private stage: number;
  private ballCount: number;

  constructor() {
    this.bricks = this.initializeGrid();
    this.stage = 1;
    this.ballCount = 1;
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
      id: `item-${this.stage}-${itemIndex}`,
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
        id: `brick-${this.stage}-${randomIndex}`,
        x: randomIndex,
        y,
        health: this.stage,
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
    const y = this.stage - stage;

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
    const y = this.stage - stage;

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
    this.ballCount++;
    return element;
  }

  addStage(): void {
    this.stage++;
  }

  getStage(): number {
    return this.stage;
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
    for (let y = this.GRID_HEIGHT - 1; y >= 1; y--) {
      for (let x = 0; x < this.GRID_WIDTH; x++) {
        this.bricks[y][x] = this.bricks[y - 1][x];
        if (this.bricks[y][x] !== null) {
          this.bricks[y][x]!.y = y;
        }
      }
    }

    for (let x = 0; x < this.GRID_WIDTH; x++) {
      this.bricks[0][x] = null;
    }

    const lastRowIndex = this.GRID_HEIGHT - 1;
    return this.bricks[lastRowIndex];
  }
}
