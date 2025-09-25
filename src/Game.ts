import { GameState } from "./GameState";
import { GameRenderer } from "./render/GameRenderer";
import { PhysicsEngine } from "./physics/PhysicsEngine";
import { SceneManager } from "./view/SceneManager";

export class Game {
  private renderer: GameRenderer;
  private physics: PhysicsEngine;
  private gameState: GameState;
  private sceneManager: SceneManager;

  constructor() {
    this.renderer = new GameRenderer();
    this.physics = new PhysicsEngine();
    this.gameState = new GameState();
    this.sceneManager = new SceneManager(this.renderer, this.physics, this.gameState);
  }

  public async init(): Promise<void> {
    await this.renderer.init();
    this.sceneManager.init();
    this.startGameLoop();
  }

  private startGameLoop(): void {
    this.renderer.getApp().ticker.add(() => {
      this.physics.update(16);
      this.sceneManager.getBall().updateGraphics();
    });
  }
}
