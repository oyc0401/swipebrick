import { GameBoundary } from "../entity/GameBoundary";

interface BoundaryConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
  label: string;
}

const BOUNDARY_THICKNESS = 15;

export class BoundaryManager {
  private boundaries: Map<string, GameBoundary> = new Map();
  private gameWidth: number;
  private gameHeight: number;

  constructor(gameWidth: number, gameHeight: number) {
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
  }

  public createGameBoundaries(): void {
    const color = 0xf2f4f6;
    const boundaryConfigs: BoundaryConfig[] = [
      {
        x: this.gameWidth / 2,
        y: -BOUNDARY_THICKNESS / 2,
        width: this.gameWidth,
        height: BOUNDARY_THICKNESS,
        color,
        label: "top",
      },
      {
        x: this.gameWidth / 2,
        y: this.gameHeight + BOUNDARY_THICKNESS / 2,
        width: this.gameWidth,
        height: BOUNDARY_THICKNESS,
        color,
        label: "bottom",
      },
      {
        x: -BOUNDARY_THICKNESS / 2,
        y: this.gameHeight / 2,
        width: BOUNDARY_THICKNESS,
        height: this.gameHeight,
        color,
        label: "left",
      },
      {
        x: this.gameWidth + BOUNDARY_THICKNESS / 2,
        y: this.gameHeight / 2,
        width: BOUNDARY_THICKNESS,
        height: this.gameHeight,
        color,
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
