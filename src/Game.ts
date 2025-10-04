import { GAME_HEIGHT, GAME_WIDTH, BALL_RADIUS, GameState } from "./GameState";
import { GraphicEngine } from "./render/GraphicEngine";
import { PhysicsEngine } from "./physics/PhysicsEngine";
import { useGameStore } from "./stores/gameStore";

import { BallManager } from "./managers/BallManager";
import { BoundaryManager } from "./managers/BoundaryManager";
import { BrickManager } from "./managers/BrickManager";
import { InputManager } from "./managers/InputManager";
import { SoundManager } from "./managers/SoundManager";
import { SwipeBrick } from "./SwipeBrick";
import type { IScoreRepository } from "./repository/IScoreRepository";
import { ScoreRepositoryFactory } from "./repository/ScoreRepositoryFactory";
import { submitGameCenterLeaderBoardScore } from "@apps-in-toss/web-framework";
import { isTossApp } from "./utils/platform";

export class Game {
  // ===== 의존성 =====
  private renderer: GraphicEngine;
  private physics: PhysicsEngine;
  private gameState: GameState;
  private repository: IScoreRepository;

  // ===== 매니저들 =====
  private ballManager: BallManager;
  private boundaryManager: BoundaryManager;
  private brickManager: BrickManager;
  private inputManager: InputManager;
  private soundManager: SoundManager;

  // ===== 게임 로직 =====
  private swipeBrick: SwipeBrick;

  constructor() {
    // 의존성 초기화
    this.renderer = GraphicEngine.getInstance(GAME_WIDTH, GAME_HEIGHT);
    this.physics = PhysicsEngine.getInstance();
    this.gameState = new GameState();
    this.swipeBrick = new SwipeBrick();
    this.repository = ScoreRepositoryFactory.create();

    // 매니저 초기화
    this.ballManager = new BallManager(this.swipeBrick);
    this.boundaryManager = new BoundaryManager(GAME_WIDTH, GAME_HEIGHT);
    this.brickManager = new BrickManager(this.physics, this.swipeBrick);
    this.inputManager = new InputManager(this.renderer, this.swipeBrick);
    this.soundManager = SoundManager.getInstance();

    // 이벤트 연결
    this.setupEventCallbacks();
  }

  // ===== 🎮 Public API =====

  public async init(): Promise<void> {
    await this.renderer.init();

    // 데이터 로드
    await this.loadInitialBestScore();
    const hasLoadedState = await this.loadGameState();

    // 게임 월드 구성
    this.boundaryManager.createGameBoundaries();
    if (hasLoadedState) {
      this.brickManager.createBricksFromState();
    } else {
      this.brickManager.createBricks();
    }

    // UI 초기화
    this.ballManager.showPreviewBall();
    this.updateScoreUI();

    // 게임 상태 복원
    this.resumeShotIfNeeded();

    // 게임 루프 시작
    this.startGameLoop();
  }

  // ===== 🎯 게임 플레이 핵심 로직 =====

  private executeLaunch(x: number, y: number): void {
    this.renderer.clearAimLine();
    this.ballManager.createBalls(this.swipeBrick.getBallCount());
    this.ballManager.hidePreviewBall();
    this.ballManager.launchBalls(x, y);
  }

  private resumeShotIfNeeded(): void {
    if (this.swipeBrick.getIsRunning()) {
      const shotTarget = this.swipeBrick.getShotTarget();
      if (shotTarget) {
        console.log("Resuming shot from saved state:", shotTarget);
        this.executeLaunch(shotTarget.x, shotTarget.y);
      }
    }
  }

  private onGameOver(): void {
    setTimeout(async () => {
      // UI 업데이트 후 DB에 베스트 스코어 저장
      this.updateScoreUI();
      //await this.updateBestScoreDB();

      const currentScore = this.swipeBrick.getLevel();
      const currentBestScore = await this.repository.getBestScore();

      // 현재 점수가 베스트 점수보다 높으면 랭킹에 반영
      if (currentScore > currentBestScore) {
        await this.repository.setBestScore(currentScore);
        if (isTossApp()) {
          // TODO: 이거 배포 때 열기!!
          // await submitGameCenterLeaderBoardScore({ score: `${currentScore}` });
        }
      }

      const handleRestart = () => {
        this.resetGame();
        console.log("Game restarted");
      };

      useGameStore.getState().setCloseCallback(handleRestart);
      useGameStore.getState().openDialog();
    }, 50);
  }

  private resetGame(): void {
    this.brickManager.reset();
    this.swipeBrick.reset();
    this.brickManager.createBricks();
    this.ballManager.showPreviewBall();
    this.updateScoreUI();
    this.clearGameState();
  }

  // ===== 📊 데이터 관리 =====

  private async loadInitialBestScore(): Promise<void> {
    const initialBestScore = await this.repository.getBestScore();
    useGameStore.getState().setBestScore(initialBestScore);
  }

  private async loadGameState(): Promise<boolean> {
    try {
      const savedGameState = await this.repository.getGameState();
      if (savedGameState && savedGameState.trim() !== "") {
        this.swipeBrick.fromJson(savedGameState);
        console.log("Game state loaded:", {
          level: this.swipeBrick.getLevel(),
          ballCount: this.swipeBrick.getBallCount(),
          ballStartX: this.swipeBrick.getBallStartX(),
        });
        return true;
      }
      console.log("No saved game state found, starting fresh");
      return false;
    } catch (error) {
      console.warn("Failed to load game state, starting fresh:", error);
      return false;
    }
  }

  private async saveGameState(): Promise<void> {
    try {
      const gameStateJson = this.swipeBrick.toJson();
      await this.repository.setGameState(gameStateJson);
      console.log("Game state saved:", {
        level: this.swipeBrick.getLevel(),
        ballCount: this.swipeBrick.getBallCount(),
      });
    } catch (error) {
      console.warn("Failed to save game state:", error);
    }
  }

  private async clearGameState(): Promise<void> {
    try {
      await this.repository.setGameState("");
      console.log("Game state cleared");
    } catch (error) {
      console.warn("Failed to clear game state:", error);
    }
  }

  private async updateScoreUI(): Promise<void> {
    const currentScore = this.swipeBrick.getLevel();
    const currentBestScore = await this.repository.getBestScore();

    useGameStore.getState().setScore(currentScore);

    // 현재 점수가 베스트 점수보다 높으면 UI에서도 즉시 반영
    if (currentScore > currentBestScore) {
      useGameStore.getState().setBestScore(currentScore);
    }
  }

  // ===== 🔧 시스템 초기화 =====

  private startGameLoop(): void {
    this.physics.startLoop();
    this.renderer.startLoop();
  }

  private setupEventCallbacks(): void {
    this.setupInputCallbacks();
    this.setupBallCallbacks();
    this.setupBrickCallbacks();
  }

  // ===== 📡 이벤트 핸들러들 =====

  private setupInputCallbacks(): void {
    this.inputManager.onClick((x, y) => {
      if (this.swipeBrick.getIsRunning()) return;

      this.swipeBrick.startShot(x, y);
      this.saveGameState();
      this.executeLaunch(x, y);
    });

    this.inputManager.onMouseMove((x, y) => {
      if (!this.swipeBrick.getIsRunning()) {
        const ballStartX = this.swipeBrick.getBallStartX();
        this.renderer.drawAimLine(ballStartX, GAME_HEIGHT - BALL_RADIUS, x, y);
      }
    });
  }

  private setupBallCallbacks(): void {
    this.ballManager.onBallLanded((landedBall) => {
      // 첫 번째 공 착지 처리
      if (!this.gameState.isBallLanded) {
        this.gameState.setIsBallLanded(true);
        const position = landedBall.getPosition();
        this.swipeBrick.setBallStartX(position.x);
        this.ballManager.showPreviewBall();
        console.log("First ball landed at:", position.x, position.y);
      }

      // 모든 공 착지 완료 처리
      if (this.ballManager.getActiveBallCount() === 1) {
        setTimeout(() => {
          this.handleAllBallsLanded();
        }, 30);
      }
    });
  }

  private handleAllBallsLanded(): void {
    this.gameState.setIsBallLanded(false);
    this.swipeBrick.incrementLevel();
    this.brickManager.shift();
    this.brickManager.createBricks();
    this.swipeBrick.endShot();

    // UI 즉시 업데이트
    this.updateScoreUI();

    // DB 업데이트 (비동기)
    this.saveGameState();

    if (this.swipeBrick.isGameOver()) {
      this.onGameOver();
      return;
    }

    console.log("All balls removed. Ready for next shot.");
  }

  private setupBrickCallbacks(): void {
    this.brickManager.onBrickCollision((brick) => {
      // 벽돌 충돌 사운드 재생
      this.soundManager.playBallSound();

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
