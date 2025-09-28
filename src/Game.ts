import { GAME_HEIGHT, GAME_WIDTH, GameState } from "./GameState";
import { GraphicEngine } from "./render/GraphicEngine";
import { PhysicsEngine } from "./physics/PhysicsEngine";

import { BallManager } from "./managers/BallManager";
import { BoundaryManager } from "./managers/BoundaryManager";
import { BrickManager } from "./managers/BrickManager";
import { InputManager } from "./managers/InputManager";

export class Game {
  private renderer: GraphicEngine;
  private physics: PhysicsEngine;
  private gameState: GameState;

  private ballManager: BallManager;
  private boundaryManager: BoundaryManager;
  private brickManager: BrickManager;
  private inputManager: InputManager;

  constructor() {
    this.renderer = GraphicEngine.getInstance(GAME_WIDTH, GAME_HEIGHT);
    this.physics = PhysicsEngine.getInstance();
    this.gameState = new GameState();

    this.ballManager = new BallManager(this.gameState);
    this.boundaryManager = new BoundaryManager(GAME_WIDTH, GAME_HEIGHT);
    this.brickManager = new BrickManager(this.physics, this.gameState);
    this.inputManager = new InputManager(this.renderer, this.gameState);

    this.setupBallManagerCallbacks();
    this.setupInputManagerCallbacks();
    this.setupBrickManagerCallbacks();
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

      // 점선 숨김
      this.renderer.clearAimLine();

      // 공들 생성
      this.ballManager.createBalls(this.gameState.ballCount);

      // 미리보기 공 숨김
      this.ballManager.hidePreviewBall();

      // 공들을 목표 지점으로 발사
      this.ballManager.launchBalls(x, y);
    });

    this.inputManager.onMouseMove((x, y) => {
      // 대기 상태일 때만 점선 표시
      if (this.gameState.isWaiting) {
        const ballPos = this.gameState.ballStartPosition;
        this.renderer.drawAimLine(ballPos.x, ballPos.y, x, y);
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

  // 벽돌 충돌 이벤트
  private setupBrickManagerCallbacks(): void {
    this.brickManager.onBrickCollision((brick) => {
      console.log("Brick hit!", {
        timestamp: new Date().toISOString(),
        brickId: brick.id,
        remainingHealth: brick.getHealth(),
        currentLevel: this.gameState.level,
        position: brick.physicsComponent.getPosition(),
      });
    });
  }
}
