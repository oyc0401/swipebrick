import * as PIXI from "pixi.js";
import { GameState } from "./GameState";
import { Ball } from "./Ball";
import { GameBoundary } from "./GameBoundary";
import { GameRenderer } from "./GameRenderer";
import { PhysicsEngine } from "./PhysicsEngine";

const GAME_WIDTH = 360;
const GAME_HEIGHT = 360;

class Game {
  private renderer: GameRenderer;
  private physics: PhysicsEngine;

  private gameState: GameState;
  private ball: Ball;

  private topBoundary!: GameBoundary;
  private bottomBoundary!: GameBoundary;
  private leftBoundary!: GameBoundary;
  private rightBoundary!: GameBoundary;

  constructor() {
    this.renderer = new GameRenderer();
    this.physics = new PhysicsEngine();
    this.gameState = new GameState();
    this.ball = new Ball(
      this.gameState.ballStartPosition,
      this.physics.getWorld()
    );
    this.init();
  }

  private async init(): Promise<void> {
    await this.renderer.init();

    this.addGameBoundaries();
    this.renderer.getGameViewport().addChild(this.ball.getGraphics());

    this.addClickListener();
    this.startGameLoop();
    this.renderer.addDebugGuide();
  }

  private addGameBoundaries(): void {
    const world = this.physics.getWorld();
    const centerLayer = this.renderer.getCenterLayer();

    // 사각형 위쪽에 경계선 (y: -5)
    this.topBoundary = new GameBoundary(0, -5, GAME_WIDTH, 5, 0x000000, world);
    centerLayer.addChild(this.topBoundary.getGraphics());

    // 사각형 아래쪽에 경계선 (y: 360)
    this.bottomBoundary = new GameBoundary(
      0,
      GAME_HEIGHT,
      GAME_WIDTH,
      5,
      0x000000,
      world,
      'bottom'
    );
    centerLayer.addChild(this.bottomBoundary.getGraphics());

    // 왼쪽 벽
    this.leftBoundary = new GameBoundary(
      -5,
      0,
      5,
      GAME_HEIGHT,
      0x000000,
      world
    );
    centerLayer.addChild(this.leftBoundary.getGraphics());

    // 오른쪽 벽
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
    gameViewport.on("pointerdown", (event: PIXI.FederatedPointerEvent) => {
      const localPosition = event.getLocalPosition(gameViewport);
      console.log("Clicked at:", localPosition.x, localPosition.y);
      this.ball.moveTowards(localPosition.x, localPosition.y);
    });
  }

  private startGameLoop(): void {
    this.renderer.getApp().ticker.add(() => {
      this.physics.update(16); // 60fps
      this.ball.updateGraphics();
    });
  }
}

new Game();
