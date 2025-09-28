import { GAME_HEIGHT, GAME_WIDTH, GameState } from "./GameState";
import { DisplayManager } from "./render/DisplayManager";
import { PhysicsEngine } from "./physics/PhysicsEngine";

import { BallManager } from "./managers/BallManager";
import { BoundaryManager } from "./managers/BoundaryManager";
import { BrickManager } from "./managers/BrickManager";
import { InputManager } from "./managers/InputManager";

export class Game {
  private renderer: DisplayManager;
  private physics: PhysicsEngine;
  private gameState: GameState;

  private ballManager: BallManager;
  private boundaryManager: BoundaryManager;
  private brickManager: BrickManager;
  private inputManager: InputManager;

  constructor() {
    this.renderer = new DisplayManager(GAME_WIDTH, GAME_HEIGHT);
    this.physics = PhysicsEngine.getInstance();
    this.gameState = new GameState();

    this.ballManager = new BallManager(
      this.renderer.getGameViewport(),
      this.gameState
    );
    this.boundaryManager = new BoundaryManager(
      this.renderer.getCenterLayer(),
      GAME_WIDTH,
      GAME_HEIGHT
    );
    this.brickManager = new BrickManager(
      this.renderer.getGameViewport(),
      this.physics
    );
    this.inputManager = new InputManager(this.renderer.getCenterLayer());

    this.setupBallManagerCallbacks();
    this.setupInputManagerCallbacks();
  }

  public async init(): Promise<void> {
    await this.renderer.init();

    this.boundaryManager.createGameBoundaries();
    this.brickManager.createBricks(this.gameState.level);
    // this.renderer.addDebugGuide();
    this.ballManager.showPreviewBall();

    const startGameLoop = (): void => {
      // 물리 엔진 시작
      this.physics.startLoop();
      // 렌더링 시작
      this.renderer.startLoop();
    };

    startGameLoop();
  }

  // 사용자 입력 이벤트
  private setupInputManagerCallbacks(): void {
    this.inputManager.onClick((x, y) => {
      // 대기 상태가 아니면 클릭 무시
      if (!this.gameState.isWaiting) {
        return;
      }

      // 대기 상태 해제
      this.gameState.setWaiting(false);

      // 공들 생성
      this.ballManager.createBalls(this.gameState.ballCount);

      // 미리보기 공 숨김
      this.ballManager.hidePreviewBall();

      // 공들을 목표 지점으로 발사
      this.ballManager.launchBalls(x, y);
    });
  }

  // 게임 진행시 공 이벤트
  private setupBallManagerCallbacks(): void {
    // 공이 도착했을 때 이벤트
    this.ballManager.onBallLanded((landedBall) => {
      // 첫번째 공이 도착했을 때
      if (!this.gameState.isBallLanded) {
        this.gameState.setIsBallLanded(true);
        const position = landedBall.getPosition();
        this.gameState.setBallStartPosition(position.x, position.y);
        this.ballManager.showPreviewBall();
        console.log("First ball landed at:", position.x, position.y);
      }

      // 모든 공이 도착했을 때 이벤트 (이벤트가 발생한 이후에 공이 삭제됨, 그래서 1이 도착임)
      if (this.ballManager.getActiveBallCount() === 1) {
        setTimeout(() => {
          this.gameState.setIsBallLanded(false);
          this.gameState.level++;
          this.gameState.ballCount++;
          this.brickManager.shift();
          this.brickManager.createBricks(this.gameState.level);
          this.gameState.setWaiting(true);
          console.log("All balls removed. Ready for next shot.");
        }, 30);
      }
    });
  }
}
