import { GAME_HEIGHT, GAME_WIDTH, BALL_RADIUS, GameState } from "./GameState";
import { GraphicEngine } from "./render/GraphicEngine";
import { PhysicsEngine } from "./physics/PhysicsEngine";
import { useGameStore } from "./stores/gameStore";

import { BallManager } from "./managers/BallManager";
import { BoundaryManager } from "./managers/BoundaryManager";
import { BrickManager } from "./managers/BrickManager";
import { InputManager } from "./managers/InputManager";
import { SwipeBrick } from "./SwipeBrick";

export class Game {
  private renderer: GraphicEngine;
  private physics: PhysicsEngine;
  private gameState: GameState;

  private ballManager: BallManager;
  private boundaryManager: BoundaryManager;
  private brickManager: BrickManager;
  private inputManager: InputManager;

  private swipeBrick: SwipeBrick;

  constructor() {
    this.renderer = GraphicEngine.getInstance(GAME_WIDTH, GAME_HEIGHT);
    this.physics = PhysicsEngine.getInstance();
    this.gameState = new GameState();

    this.swipeBrick = new SwipeBrick();

    this.ballManager = new BallManager(this.swipeBrick);
    this.boundaryManager = new BoundaryManager(GAME_WIDTH, GAME_HEIGHT);
    this.brickManager = new BrickManager(this.physics, this.swipeBrick);
    this.inputManager = new InputManager(
      this.renderer,

      this.swipeBrick
    );

    this.setupBallManagerCallbacks();
    this.setupInputManagerCallbacks();
    this.setupBrickManagerCallbacks();
  }

  public async init(): Promise<void> {
    await this.renderer.init();

    this.boundaryManager.createGameBoundaries();
    this.brickManager.createBricks();
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
      // 실행 중이면 클릭 무시
      if (this.swipeBrick.getIsRunning()) {
        return;
      }

      // 실행 상태로 변경
      this.swipeBrick.setIsRunning(true);

      // 점선 숨김
      this.renderer.clearAimLine();

      // 공들 생성
      this.ballManager.createBalls(this.swipeBrick.getBallCount());

      // 미리보기 공 숨김
      this.ballManager.hidePreviewBall();

      // 공들을 목표 지점으로 발사
      this.ballManager.launchBalls(x, y);
    });

    this.inputManager.onMouseMove((x, y) => {
      // 실행 중이 아닐 때만 점선 표시
      if (!this.swipeBrick.getIsRunning()) {
        const ballStartX = this.swipeBrick.getBallStartX();
        this.renderer.drawAimLine(ballStartX, GAME_HEIGHT - BALL_RADIUS, x, y);
      }
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
        this.swipeBrick.setBallStartX(position.x);
        this.ballManager.showPreviewBall();
        console.log("First ball landed at:", position.x, position.y);
      }

      // 모든 공이 도착했을 때 이벤트 (이벤트가 발생한 이후에 공이 삭제됨, 그래서 1이 도착임)
      if (this.ballManager.getActiveBallCount() === 1) {
        setTimeout(() => {
          this.gameState.setIsBallLanded(false);
          this.swipeBrick.incrementLevel();
          this.brickManager.shift();
          this.brickManager.createBricks();

          this.swipeBrick.setIsRunning(false);
          console.log("All balls removed. Ready for next shot.");

          useGameStore.getState().incrementScore(1);
        }, 30);
      }
    });
  }

  // 벽돌 충돌 이벤트
  private setupBrickManagerCallbacks(): void {
    this.brickManager.onBrickCollision((brick) => {
      console.log("Brick hit!", {
        timestamp: new Date().toISOString(),
        brickId: brick.id,
        remainingHealth: brick.getHealth(),
        currentLevel: this.swipeBrick.getLevel(),
        position: brick.physicsComponent.getPosition(),
      });
    });

    this.brickManager.onItemCollision((item) => {
      console.log("Item collected!", {
        timestamp: new Date().toISOString(),
        itemId: item.id,
        currentLevel: this.swipeBrick.getLevel(),
        newBallCount: this.swipeBrick.getBallCount(),
        position: item.physicsComponent.getPosition(),
      });
    });
  }
}
