import { GameState } from "./GameState";
import { DisplayManager } from "./render/DisplayManager";
import { PhysicsEngine } from "./physics/PhysicsEngine";
import { SceneManager } from "./view/SceneManager";

export class Game {
  private renderer: DisplayManager;
  private physics: PhysicsEngine;
  private gameState: GameState;
  private sceneManager: SceneManager;

  constructor() {
    this.renderer = new DisplayManager();
    this.physics = new PhysicsEngine();
    this.gameState = new GameState();
    this.sceneManager = new SceneManager(
      this.renderer,
      this.physics,
      this.gameState
    );
  }

  public async init(): Promise<void> {
    await this.renderer.init();
    this.sceneManager.init();

    this.startGameLoop();
  }

  private startGameLoop(): void {
    // 물리 엔진 시작
    this.physics.startLoop();

    // 렌더링 시작 (엔티티 배열 전달)
    this.renderer.startRenderLoop();
  }
}
