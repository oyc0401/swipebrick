import { activeEntities } from "./../entity/Entity";
import type { FederatedPointerEvent } from "pixi.js";
import { DisplayManager } from "../render/DisplayManager";
import { GameBoundary } from "../entity/GameBoundary";
import { Ball } from "../entity/Ball";
import { PhysicsEngine } from "../physics/PhysicsEngine";
import { GameState } from "../GameState";

const GAME_WIDTH = 360;
const GAME_HEIGHT = 360;

export class SceneManager {
  private renderer: DisplayManager;
  private physics: PhysicsEngine;
  private gameState: GameState;
  private ball!: Ball;

  private topBoundary!: GameBoundary;
  private bottomBoundary!: GameBoundary;
  private leftBoundary!: GameBoundary;
  private rightBoundary!: GameBoundary;

  constructor(
    renderer: DisplayManager,
    physics: PhysicsEngine,
    gameState: GameState
  ) {
    this.renderer = renderer;
    this.physics = physics;
    this.gameState = gameState;
  }

  public init(): void {
    this.addBall();
    this.addGameBoundaries();
    this.addClickListener();
    this.renderer.addDebugGuide();
  }

  private addBall(): void {
    const ball = new Ball(
      this.gameState.ballStartPosition,
      this.physics.getWorld()
    );
    this.ball = ball;
    // 렌더링 대상 엔티티 등록
    activeEntities.push(ball);

    this.renderer.getGameViewport().addChild(ball.getGraphics());
  }

  private addGameBoundaries(): void {
    const world = this.physics.getWorld();
    const centerLayer = this.renderer.getCenterLayer();

    this.topBoundary = new GameBoundary(0, -5, GAME_WIDTH, 5, 0x000000, world);
    centerLayer.addChild(this.topBoundary.getGraphics());

    this.bottomBoundary = new GameBoundary(
      0,
      GAME_HEIGHT,
      GAME_WIDTH,
      5,
      0x000000,
      world,
      "bottom"
    );
    centerLayer.addChild(this.bottomBoundary.getGraphics());

    this.leftBoundary = new GameBoundary(
      -5,
      0,
      5,
      GAME_HEIGHT,
      0x000000,
      world
    );
    centerLayer.addChild(this.leftBoundary.getGraphics());

    this.rightBoundary = new GameBoundary(
      GAME_WIDTH,
      0,
      5,
      GAME_HEIGHT,
      0x000000,
      world
    );
    centerLayer.addChild(this.rightBoundary.getGraphics());
  }

  private addClickListener(): void {
    const gameViewport = this.renderer.getGameViewport();
    gameViewport.eventMode = "static";
    gameViewport.on("pointerdown", (event: FederatedPointerEvent) => {
      const localPosition = event.getLocalPosition(gameViewport);
      console.log("Clicked at:", localPosition.x, localPosition.y);
      this.ball.moveTowards(localPosition.x, localPosition.y);
    });
  }

  public getBall(): Ball {
    return this.ball;
  }
}
