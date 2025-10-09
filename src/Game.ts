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
import { requestAnimationFrames } from "./utils/animationFrame";
import { fixed } from "./utils/number";
import { Ticker } from "pixi.js";
import type { BallEntity } from "./entity/BallEntity";

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
  // private soundManager: SoundManager;

  // ===== 게임 로직 =====
  private swipeBrick: SwipeBrick;

  // ===== 성능 측정 =====
  private shotStartTime: number = 0;

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
    this.inputManager = new InputManager(this.swipeBrick);
    // this.soundManager = SoundManager.getInstance();

    // 이벤트 연결
    this.setupEventCallbacks();
  }

  // ===== 🎮 Public API =====

  public async init(): Promise<void> {
    await this.renderer.init();

    this.ballManager.createPreviewBall();
    this.ballManager.createLandedBall();
    // 데이터 로드
    const hasLoadedState = await this.loadGameState();

    const startPhysicsTime = performance.now();
    // 게임 월드 구성
    this.boundaryManager.createGameBoundaries();
    if (hasLoadedState) {
      this.brickManager.createBricksFromState();
    } else {
      this.brickManager.createBricks();
    }

    const endPhysicsTime = performance.now();
    const durationPhysics = Math.round(endPhysicsTime - startPhysicsTime);
    console.log(`Physics world built (${durationPhysics} ms)`);

    // UI 초기화
    this.ballManager.showPreviewBall();
    this.ballManager.hideLandedBall();
    this.updateScoreUI();

    // 게임 루프 시작
    this.startGameLoop();

    // HTML 스플래시 화면 숨기기
    const splashScreen = document.getElementById("splash-screen");
    if (splashScreen) {
      splashScreen.style.display = "none";
    }

    console.log(`Stage ${this.swipeBrick.getLevel()} started`);

    // 게임 상태 복원 (물리 엔진 시작 후)
    const resumeShotIfNeeded = () => {
      if (this.swipeBrick.getIsRunning()) {
        const shotAngle = this.swipeBrick.getShotAngle();
        if (shotAngle !== null) {
          this.executeLaunch(shotAngle);
        }
      }
    };

    requestAnimationFrames(resumeShotIfNeeded, 4);
  }

  // ===== 🎯 게임 플레이 핵심 로직 =====

  private executeLaunch(angle: number): void {
    this.shotStartTime = performance.now();

    this.renderer.clearAimLine();
    this.ballManager.createBalls(this.swipeBrick.getBallCount());
    this.ballManager.launchBalls(angle);

    console.log(`Ball shot at ${fixed(angle)}°`);
  }

  private async onGameOver(): Promise<void> {
    const currentScore = this.swipeBrick.getLevel();
    const currentBestScore = useGameStore.getState().bestScore;

    // 현재 점수가 베스트 점수보다 높으면 랭킹에 반영
    if (currentScore > currentBestScore) {
      useGameStore.getState().setBestScore(currentScore);
      await this.repository.setBestScore(currentScore);

      if (isTossApp()) {
        // TODO: 이거 배포 때 열기!! rank
        // await submitGameCenterLeaderBoardScore({ score: `${currentScore}` });
      }
    }

    // 다이얼로그 안눌러도 초기화 되도록
    this.clearGameState();

    const handleRestart = () => {
      this.resetGameUI();
      console.log("Game restarted");
    };

    useGameStore.getState().setCloseCallback(handleRestart);
    useGameStore.getState().openDialog();
  }

  private resetGameUI(): void {
    this.brickManager.reset();
    this.swipeBrick.reset();
    this.brickManager.createBricks();
    this.ballManager.showPreviewBall();
    this.ballManager.hideLandedBall();
    this.updateScoreUI();
  }

  // ===== 📊 데이터 관리 =====

  private async loadGameState(): Promise<boolean> {
    const startTime = performance.now();

    // 최고기록 가져오기
    const initialBestScore = await this.repository.getBestScore();
    useGameStore.getState().setBestScore(initialBestScore);

    try {
      const savedGameState = await this.repository.getGameState();
      if (savedGameState && savedGameState.trim() !== "") {
        this.swipeBrick.fromJson(savedGameState);

        const endTime = performance.now();
        const initDuration = Math.round(endTime - startTime);
        console.log(`Game data loaded (${initDuration} ms)`);
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
      console.log("%cGame state saved", "color: #aaaaaaff;");
    } catch (error) {
      console.warn("Failed to save game state:", error);
    }
  }

  private async clearGameState(): Promise<void> {
    try {
      await this.repository.setGameState("");
      console.log("%cGame state cleared", "color: #aaaaaaff;");
    } catch (error) {
      console.warn("Failed to clear game state:", error);
    }
  }

  private async updateScoreUI(): Promise<void> {
    const currentScore = this.swipeBrick.getLevel();
    useGameStore.getState().setScore(currentScore);
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
    this.inputManager.onClick((x, y, angle) => {
      // 디버그: 터치한 곳에 파편 효과
      // if (this.renderer.shatterItemEffect) {
      //   console.log("Debug: Creating shatter effect at click position:", x, y);
      //   this.renderer.shatterItemEffect.create(x, y);
      // }

      if (this.swipeBrick.getIsRunning()) return;

      this.swipeBrick.startShot(angle);
      this.saveGameState();
      this.executeLaunch(angle);
    });

    this.inputManager.onMouseMove((x, y) => {
      if (!this.swipeBrick.getIsRunning()) {
        const ballStartX = this.swipeBrick.getBallStartX();
        this.renderer.drawAimLine(ballStartX, GAME_HEIGHT - BALL_RADIUS, x, y);
      }
    });
  }

  private setupBallCallbacks(): void {
    this.ballManager.onAllBallsLaunched(() => {
      console.log("모든 공 출발!");
      this.ballManager.hidePreviewBall();
    });

    this.ballManager.onBallLanded(async (landedBall) => {
      // 첫 번째 공 착지 처리
      if (!this.gameState.isBallLanded) {
        this.gameState.setIsBallLanded(true);

        const position = landedBall.getPosition();
        this.swipeBrick.setBallStartX(position.x);

        // 미리보기 공 표시
        this.ballManager.showLandedBall();
        console.log(`First ball landed at (${position.x}, ${position.y})`);
      }

      // 애니메이션이 끝나면
      this.moveBall(landedBall, this.swipeBrick.getBallStartX()).then(() => {
        this.ballManager.removeBall(landedBall);

        // 모든 공 착지 완료 처리
        if (this.ballManager.getActiveBallCount() === 0) {
          // setTimeout은 30ms 후 자동 실행되어 브라우저에서 자동 정리됨 (메모리 누수 없음)
          setTimeout(() => {
            this.handleAllBallsLanded();
          }, 30);
        }
      });
    });
  }

  public moveBall(landedBall: BallEntity, targetX: number): Promise<void> {
    return new Promise<void>((resolve) => {
      const ticker = new Ticker();

      ticker.add(() => {
        const pos = landedBall.getPosition(); // 현재 위치
        const dx = targetX - pos.x;

        if (Math.abs(dx) < 1) {
          landedBall.physicsComponent.setPosition(targetX, pos.y); // 실제 위치 업데이트
          ticker.stop();
          ticker.destroy();
          resolve(); // 이동 완료
        } else {
          landedBall.physicsComponent.setPosition(pos.x + dx * 0.2, pos.y); // 부드럽게 이동
        }
      });

      ticker.start();
    });
  }

  private handleAllBallsLanded(): void {
    this.gameState.setIsBallLanded(false);
    this.swipeBrick.incrementLevel();
    this.brickManager.shift();
    this.brickManager.createBricks();
    this.swipeBrick.endShot();
    this.ballManager.showPreviewBall();
    this.ballManager.hideLandedBall();

    // UI 즉시 업데이트
    this.updateScoreUI();

    if (this.swipeBrick.isGameOver()) {
      const shotDuration = Math.round(performance.now() - this.shotStartTime);
      let level = this.swipeBrick.getLevel();
      let secondText = fixed(shotDuration / 1000);
      console.log(`Game over - Stage ${level} (${secondText} s)`);
      this.onGameOver();
      return;
    }

    // DB 업데이트 (비동기)
    this.saveGameState();

    const shotDuration = Math.round(performance.now() - this.shotStartTime);
    let level = this.swipeBrick.getLevel();
    let secondText = fixed(shotDuration / 1000);
    console.log(`Stage cleared - Stage ${level} started (${secondText} s)`);
  }

  private setupBrickCallbacks(): void {
    this.brickManager.onBrickCollision((brick) => {
      // 벽돌 충돌 사운드 재생
      // this.soundManager.playBallSound();
      // console.log("Brick hit!", {
      //   timestamp: new Date().toISOString(),
      //   brickId: brick.id,
      //   remainingHealth: brick.getHealth(),
      //   currentLevel: this.swipeBrick.getLevel(),
      //   position: brick.physicsComponent.getPosition(),
      // });
    });

    this.brickManager.onBrickDestroy((brick) => {
      // 벽돌 파괴시 파편 효과 생성
      const position = brick.physicsComponent.getPosition();

      // console.log("Brick destroyed!", {
      //   timestamp: new Date().toISOString(),
      //   brickId: brick.id,
      //   position: position,
      //   currentLevel: this.swipeBrick.getLevel(),
      //   hasShatterEffect: !!this.renderer.shatterEffect,
      // });

      // ShatterEffect 접근 (renderer를 통해)
      if (this.renderer.shatterEffect) {
        this.renderer.shatterEffect.create(position.x, position.y);
      } else {
        console.warn("ShatterEffect not available");
      }
    });

    this.brickManager.onItemCollision((item) => {
      // console.log("Item collected!", {
      //   timestamp: new Date().toISOString(),
      //   itemId: item.id,
      //   currentLevel: this.swipeBrick.getLevel(),
      //   newBallCount: this.swipeBrick.getBallCount(),
      //   position: item.physicsComponent.getPosition(),
      // });

      // 아이템 수집 시에 shatterItemEffect 생성
      const position = item.physicsComponent.getPosition();
      if (this.renderer.shatterItemEffect) {
        this.renderer.shatterItemEffect.create(position.x, position.y);
      } else {
        console.warn("shatterItemEffect not available");
      }
    });
  }
}
