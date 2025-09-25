import type { Container } from "pixi.js";
import { World, Events } from "matter-js";
import { GameBoundary } from "../entity/GameBoundary";
import type { PhysicsEngine } from "../physics/PhysicsEngine";

interface BoundaryConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
  label: string;
}

interface BottomCollisionCallback {
  (ballBody: Matter.Body): void;
}

export class BoundaryManager {
  private boundaries: Map<string, GameBoundary> = new Map();
  private renderLayer: Container;
  private physicsWorld: Matter.World;
  private physicsEngine: PhysicsEngine;
  private gameWidth: number;
  private gameHeight: number;
  private onBottomCollision?: BottomCollisionCallback;

  constructor(
    renderLayer: Container,
    physics: PhysicsEngine,
    gameWidth: number,
    gameHeight: number
  ) {
    this.renderLayer = renderLayer;
    this.physicsEngine = physics;
    this.physicsWorld = physics.getWorld();
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.setupPhysicsEventListeners();
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

  /** 공이 바닥에 부딫쳤을 때 이벤트 */
  public setBottomCollisionCallback(callback: BottomCollisionCallback): void {
    this.onBottomCollision = callback;
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

    // 물리 엔진에 추가
    World.add(this.physicsWorld, boundary.getPhysicsBody());

    // 렌더링 레이어에 추가
    this.renderLayer.addChild(boundary.getGraphics());

    // 매니저에 등록
    this.boundaries.set(config.label, boundary);
  }

  private setupPhysicsEventListeners(): void {
    Events.on(
      this.physicsEngine.getEngine(),
      "collisionStart",
      (event: Matter.IEventCollision<Matter.Engine>) => {
        event.pairs.forEach((pair) => {
          const { bodyA, bodyB } = pair;

          // 바닥과의 충돌 감지
          if (bodyA.label === "bottom" || bodyB.label === "bottom") {
            const ballBody =
              bodyA.label === "ball"
                ? bodyA
                : bodyB.label === "ball"
                ? bodyB
                : null;
            if (ballBody && this.onBottomCollision) {
              this.onBottomCollision(ballBody);
            }
          }
        });
      }
    );
  }

  public destroy(): void {
    // 이벤트 리스너 제거
    Events.off(this.physicsEngine.getEngine(), "collisionStart");

    this.boundaries.forEach((boundary) => {
      // 렌더링에서 제거
      this.renderLayer.removeChild(boundary.getGraphics());

      // 물리 엔진에서 제거
      World.remove(this.physicsWorld, boundary.getPhysicsBody());

      // 경계벽 객체 정리
      boundary.destroy();
    });

    this.boundaries.clear();
    this.onBottomCollision = undefined;
  }
}
