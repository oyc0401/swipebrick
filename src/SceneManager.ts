import type { FederatedPointerEvent } from "pixi.js";
import { DisplayManager } from "./render/DisplayManager";
import { PhysicsEngine } from "./physics/PhysicsEngine";
import { GameState } from "./GameState";
import { BallManager } from "./managers/BallManager";
import { BoundaryManager } from "./managers/BoundaryManager";

const GAME_WIDTH = 360;
const GAME_HEIGHT = 360;

export class SceneManager {
  private renderer: DisplayManager;
  private physics: PhysicsEngine;
  private gameState: GameState;
  private ballManager: BallManager;
  private boundaryManager: BoundaryManager;
  private isBallLanded = false;

  constructor(
    renderer: DisplayManager,
    physics: PhysicsEngine,
    gameState: GameState
  ) {
    this.renderer = renderer;
    this.physics = physics;
    this.gameState = gameState;
    this.ballManager = new BallManager(
      this.renderer.getGameViewport(),
      this.physics,
      this.gameState.ballStartPosition
    );
    this.boundaryManager = new BoundaryManager(
      this.renderer.getCenterLayer(),
      this.physics,
      GAME_WIDTH,
      GAME_HEIGHT
    );
    this.setupBallManagerCallbacks();
    this.setupBoundaryManagerCallbacks();
  }

  public init(): void {
    this.boundaryManager.createGameBoundaries();
    this.addClickListener();
    this.renderer.addDebugGuide();
    this.ballManager.showPreviewBall();
  }

  private addClickListener(): void {
    const gameViewport = this.renderer.getGameViewport();
    gameViewport.eventMode = "static";
    gameViewport.on("pointerdown", (event: FederatedPointerEvent) => {
      // 대기 상태가 아니면 클릭 무시
      if (!this.gameState.isWaiting) {
        return;
      }

      const localPosition = event.getLocalPosition(gameViewport);
      console.log("Clicked at:", localPosition.x, localPosition.y);

      // 대기 상태 해제
      this.gameState.setWaiting(false);

      // 미리보기 공 숨김
      this.ballManager.hidePreviewBall();

      // 공 2개 생성
      this.ballManager.createBalls(2);

      // 공들을 목표 지점으로 발사
      this.ballManager.launchBalls(localPosition.x, localPosition.y);
    });
  }

  // 공과 벽의 충돌 이벤트
  private setupBoundaryManagerCallbacks(): void {
    // 공이 바닥에 부딪쳤을 때 이벤트
    this.boundaryManager.setBottomCollisionCallback((ballBody) => {
      this.ballManager.handleBallLanding(ballBody);
    });
  }

  // 게임 진행시 공 이벤트
  private setupBallManagerCallbacks(): void {
    // 첫번째 공이 도착했을 때 이벤트
    this.ballManager.onFirstBallLanded((landedBall) => {
      if (!this.isBallLanded) {
        this.isBallLanded = true;
        const position = landedBall.getPosition();
        this.gameState.setBallStartPosition(position.x, position.y);
        this.ballManager.setBallStartPosition(position.x, position.y);
        this.ballManager.showPreviewBall();
        console.log("First ball landed at:", position.x, position.y);
      }
    });

    // 모든 공이 도착했을 때 이벤트
    this.ballManager.onAllBallsFinished(() => {
      this.isBallLanded = false;
      this.gameState.setWaiting(true);
      console.log("All balls removed. Ready for next shot.");
    });
  }
}
