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

export type GameObject = Brick | Item;

interface SavedGameState {
  level: number;
  ballCount: number;
  ballStartX: number;
  isRunning: boolean;
  shotAngle: number | null;
  objects: (SavedGameObject | null)[][];
}

interface SavedGameObject {
  type: "brick" | "item";
  id: string;
  x: number;
  y: number;
  health?: number; // brick only
}

interface ISwipeBrick {
  getLevel(): number;
  incrementLevel(): void;
  getBallCount(): number;
  isGameOver(): boolean;
  getBallStartX(): number;
  setBallStartX(x: number): void;
  getIsRunning(): boolean;
  setIsRunning(running: boolean): void;
  createNewRow(): (GameObject | null)[];
  damageBrick(stage: number, index: number): Brick | null;
  collectItem(stage: number, index: number): Item;
  shiftRowsDown(): (GameObject | null)[];
  reset(): void;
  toJson(): void;
  fromJson(jsonString: string): void;
}

export class SwipeBrick implements ISwipeBrick {
  private readonly GRID_WIDTH = 6;
  private readonly GRID_HEIGHT = 8;
  private readonly GAME_CENTER_X = 180; // GAME_WIDTH / 2
  private readonly HARD_LEVEL = 100;

  private objects: (GameObject | null)[][];
  private level: number;
  private ballCount: number;
  private ballStartX: number;
  private isRunning: boolean;
  private shotAngle: number | null;

  // private lastLaunchAngle: number | null; // *추가* 각도값

  constructor() {
    this.objects = this.initializeGrid();
    this.level = 1;
    this.ballCount = 1;
    this.ballStartX = this.GAME_CENTER_X;
    this.isRunning = false;
    this.shotAngle = null;
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
    if (this.level == 3) {
      // return true;
    }
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

  /** 실행 상태 반환 */
  getIsRunning(): boolean {
    return this.isRunning;
  }

  /** 발사 시작 (각도와 실행 상태 동시 설정) */
  startShot(angle: number): void {
    this.shotAngle = angle;
    this.isRunning = true;
  }

  /** 발사 완료 (각도와 실행 상태 동시 클리어) */
  endShot(): void {
    this.shotAngle = null;
    this.isRunning = false;
  }

  /** 실행 상태 설정 (하위 호환용) */
  setIsRunning(running: boolean): void {
    this.isRunning = running;
    if (!running) {
      this.shotAngle = null;
    }
  }

  /** 발사 각도 반환 */
  getShotAngle(): number | null {
    return this.shotAngle;
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
    // 아이템 무조건 1개 / brick 랜덤
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

    const brickCount = this.getRandomBrickCount(this.level);
    const usedIndices = new Set<number>([itemIndex]);

    // *추가* - 장지원
    // 벽돌 체력 계산 : HARD_LEVEL 레벨부터 체력 2씩 증가
    let brickHealth = this.level;
    if (this.level > this.HARD_LEVEL) {
      brickHealth = this.HARD_LEVEL + (this.level - this.HARD_LEVEL) * 2;
    }

    // 벽돌 생성
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
        health: brickHealth, // 계산한 체력
      };
      slots[randomIndex] = brick;
    }

    return slots;
  }

  /**
   * 1~5개의 벽돌 개수를 확률적으로 반환하는 함수
   * 확률분포는 [0.2, 0.3, 0.2, 0.2, 0.1] (합계 1.0)
   * 확률분포는 현재 레벨에 따라서 동적으로 변합니다.
   * 0->80라운드까지는 점점 어려워지다가, 80라운드 이상부터는 확률분포가 고정입니다.
   */
  private getRandomBrickCount(currentLevel: number): number {
    // 각 벽돌 개수(1~5)에 대한 확률 가중치
    
    let finalWeights: number[];
    finalWeights = [0.3, 0.45, 0.4, 0, 0];
    
    if (currentLevel >= 10){ 
      const steps = Math.floor((currentLevel-10)/10); //레벨 구간 설정
      
      const prob4 = Math.min(0.4, steps * 0.1);
      const prob5 = Math.min(0.2, steps * 0.05); // 인덱스 4 = 벽돌 5개

      finalWeights = [0.3, 0.45, 0.4, prob4, prob5];

    // baseWeights에서 시작하여, 50레벨마다 벽돌 4,5개는 각각 0.1,0.05씩 확률이 증가한다.
    // 만약 벽돌 4,5개가 각각 0.4,0.2 즉 200레벨에 돌파하게 된다면 더이상 값이 오르지 않는다.
    }

    // 전체 확률 합 (꼭 1일 필요는 없음 — 비율 기준이므로)
    const total = finalWeights.reduce((a, b) => a + b, 0);

    // 0 ~ total 사이의 난수 생성
    // total이 1이면 0~1, total이 10이면 0~10 사이 난수
    const r = Math.random() * total;

    // 누적 확률 합
    let sum = 0;

    // weights를 순회하며 누적합이 난수를 초과하는 지점 찾기
    for (let i = 0; i < finalWeights.length; i++) {
      sum += finalWeights[i]; // 현재까지의 누적 확률
      if (r <= sum) {
        // 난수가 이 구간에 속한다면 해당 인덱스 선택
        return i + 1; // 인덱스 0~4 → 벽돌 개수 1~5
      }
    }

    // 부동소수점 오차 등으로 아무 구간에도 속하지 않을 경우 기본값 반환
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

  /** 게임 상태 초기화 */
  reset(): void {
    this.objects = this.initializeGrid();
    this.level = 1;
    this.ballCount = 1;
    this.ballStartX = this.GAME_CENTER_X;
    this.isRunning = false;
    this.shotAngle = null;
  }

  toJson(): string {
    return JSON.stringify({
      level: this.level,
      ballCount: this.ballCount,
      ballStartX: this.ballStartX,
      isRunning: this.isRunning,
      shotAngle: this.shotAngle,
      objects: this.objects.map((row) =>
        row.map((obj) =>
          obj
            ? {
                type: obj.type,
                id: obj.id,
                x: obj.x,
                y: obj.y,
                ...(obj.type === "brick" ? { health: obj.health } : {}),
              }
            : null
        )
      ),
    });
  }

  fromJson(jsonString: string): void {
    try {
      // 1. JSON 파싱
      const parsedData = JSON.parse(jsonString);

      // 2. 타입 검증 및 변환
      const gameState = this.convertSavedState(parsedData);

      // 3. 게임 상태 업데이트
      this.updateGameStateFromSaved(gameState);
    } catch (error) {
      console.error("Failed to parse game state JSON:", error);
      throw new Error("Invalid game state JSON format");
    }
  }

  private convertSavedState(data: any): SavedGameState {
    // 필수 필드 검증
    if (
      typeof data.level !== "number" ||
      typeof data.ballCount !== "number" ||
      typeof data.ballStartX !== "number" ||
      !Array.isArray(data.objects)
    ) {
      throw new Error("Invalid game state format: missing required fields");
    }

    // 숫자 범위 검증
    if (data.level < 1 || data.ballCount < 1 || data.ballStartX < 0) {
      throw new Error("Invalid game state: negative or zero values not allowed");
    }

    // isRunning과 shotAngle 일관성 검증
    const isRunning = data.isRunning ?? false;
    const shotAngle = data.shotAngle ?? null;

    if (isRunning && shotAngle === null) {
      throw new Error("Invalid game state: isRunning is true but shotAngle is null");
    }

    if (!isRunning && shotAngle !== null) {
      throw new Error("Invalid game state: isRunning is false but shotAngle is not null");
    }

    // objects 배열 구조 검증
    if (data.objects.length !== this.GRID_HEIGHT) {
      throw new Error(`Invalid objects array: expected ${this.GRID_HEIGHT} rows, got ${data.objects.length}`);
    }

    for (let y = 0; y < data.objects.length; y++) {
      if (!Array.isArray(data.objects[y]) || data.objects[y].length !== this.GRID_WIDTH) {
        throw new Error(`Invalid objects row ${y}: expected ${this.GRID_WIDTH} columns`);
      }

      for (let x = 0; x < data.objects[y].length; x++) {
        const obj = data.objects[y][x];
        if (obj !== null) {
          // 객체 필수 필드 검증
          if (
            typeof obj.type !== "string" ||
            typeof obj.id !== "string" ||
            typeof obj.x !== "number" ||
            typeof obj.y !== "number"
          ) {
            throw new Error(`Invalid object at [${y}][${x}]: missing required fields`);
          }

          // 타입별 검증
          if (obj.type === "brick") {
            if (typeof obj.health !== "number" || obj.health < 1) {
              throw new Error(`Invalid brick at [${y}][${x}]: health must be positive number`);
            }
          } else if (obj.type === "item") {
            // 아이템은 health 필드가 없어야 함
            if (obj.health !== undefined) {
              throw new Error(`Invalid item at [${y}][${x}]: should not have health field`);
            }
          } else {
            throw new Error(`Invalid object type at [${y}][${x}]: ${obj.type}`);
          }

          // 좌표 일관성 검증
          if (obj.x !== x || obj.y !== y) {
            throw new Error(`Position mismatch at [${y}][${x}]: object has coordinates (${obj.x}, ${obj.y})`);
          }
        }
      }
    }

    // SavedGameState 형식으로 변환
    return {
      level: data.level,
      ballCount: data.ballCount,
      ballStartX: data.ballStartX,
      isRunning,
      shotAngle,
      objects: data.objects.map((row: any[]) =>
        row.map((obj: any) =>
          obj
            ? ({
                type: obj.type as "brick" | "item",
                id: obj.id,
                x: obj.x,
                y: obj.y,
                ...(obj.type === "brick" ? { health: obj.health } : {}),
              } as SavedGameObject)
            : null
        )
      ),
    };
  }

  private updateGameStateFromSaved(gameState: SavedGameState): void {
    // 기본 상태 업데이트
    this.level = gameState.level;
    this.ballCount = gameState.ballCount;
    this.ballStartX = gameState.ballStartX;
    this.isRunning = gameState.isRunning;
    this.shotAngle = gameState.shotAngle;

    // 객체 배열 복원
    this.objects = gameState.objects.map((row) =>
      row.map((obj) =>
        obj
          ? ({
              type: obj.type,
              id: obj.id,
              x: obj.x,
              y: obj.y,
              ...(obj.type === "brick" ? { health: obj.health! } : {}),
            } as GameObject)
          : null
      )
    );
  }
}
