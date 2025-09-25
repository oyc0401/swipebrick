import { GameState } from "./GameState";
import { Ball } from "./entity/Ball";
import { GameRenderer } from "./render/GameRenderer";
import { PhysicsEngine } from "./physics/PhysicsEngine";
import { GameView } from "./view/GameView";

export class Game {
  private renderer: GameRenderer;
  private physics: PhysicsEngine;
  private gameState: GameState;
  private ball: Ball;
  private gameView: GameView;

  constructor() {
    this.renderer = new GameRenderer();
    this.physics = new PhysicsEngine();
    this.gameState = new GameState();
    this.ball = new Ball(
      this.gameState.ballStartPosition,
      this.physics.getWorld()
    );
    this.gameView = new GameView(this.renderer, this.physics, this.ball);
  }

  public async init(): Promise<void> {
    await this.renderer.init();
    this.gameView.init();
    this.startGameLoop();
  }

  private startGameLoop(): void {
    this.renderer.getApp().ticker.add(() => {
      this.physics.update(16);
      this.ball.updateGraphics();
    });
  }
}
