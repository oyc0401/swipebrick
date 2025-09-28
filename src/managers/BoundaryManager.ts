import { GameBoundary } from "../entity/GameBoundary";

interface BoundaryConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
  label: string;
}

export class BoundaryManager {
  private boundaries: Map<string, GameBoundary> = new Map();
  private gameWidth: number;
  private gameHeight: number;

  constructor(gameWidth: number, gameHeight: number) {
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
  }

  public createGameBoundaries(): void {
    const boundaryConfigs: BoundaryConfig[] = [
      {
        x: 0,
        y: -5,
        width: this.gameWidth,
        height: 5,
        color: 0x000000,
        label: "top",
      },
      {
        x: 0,
        y: this.gameHeight,
        width: this.gameWidth,
        height: 5,
        color: 0x000000,
        label: "bottom",
      },
      {
        x: -5,
        y: 0,
        width: 5,
        height: this.gameHeight,
        color: 0x000000,
        label: "left",
      },
      {
        x: this.gameWidth,
        y: 0,
        width: 5,
        height: this.gameHeight,
        color: 0x000000,
        label: "right",
      },
    ];

    boundaryConfigs.forEach((config) => {
      this.createBoundary(config);
    });
  }

  public getBoundary(
    type: "top" | "bottom" | "left" | "right"
  ): GameBoundary | undefined {
    return this.boundaries.get(type);
  }

  public getAllBoundaries(): GameBoundary[] {
    return Array.from(this.boundaries.values());
  }

  public hasBoundary(type: "top" | "bottom" | "left" | "right"): boolean {
    return this.boundaries.has(type);
  }

  private createBoundary(config: BoundaryConfig): void {
    const boundary = new GameBoundary(
      config.x,
      config.y,
      config.width,
      config.height,
      config.color,
      config.label
    );

    // 매니저에 등록
    this.boundaries.set(config.label, boundary);
  }

  public destroy(): void {
    this.boundaries.forEach((boundary) => {
      // 경계벽 객체 정리
      boundary.destroy();
    });

    this.boundaries.clear();
  }
}
