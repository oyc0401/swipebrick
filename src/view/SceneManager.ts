import type { FederatedPointerEvent } from "pixi.js";
import { Events, World } from "matter-js";
import { DisplayManager } from "../render/DisplayManager";
import { GameBoundary } from "../entity/GameBoundary";
import { Ball } from "../entity/Ball";
import { PhysicsEngine } from "../physics/PhysicsEngine";
import { GameState } from "../GameState";

const GAME_WIDTH = 360;
const GAME_HEIGHT = 360;

export class SceneManager {
  private renderer: DisplayManager;
  private physics: PhysicsEngine;
  private gameState: GameState;
  private balls: Ball[] = []; // 여러 공을 관리하기 위한 배열
  private firstLandedBall: Ball | null = null; // 첫 번째로 바닥에 도착한 공

  private topBoundary!: GameBoundary;
  private bottomBoundary!: GameBoundary;
  private leftBoundary!: GameBoundary;
  private rightBoundary!: GameBoundary;

  constructor(
    renderer: DisplayManager,
    physics: PhysicsEngine,
    gameState: GameState
  ) {
    this.renderer = renderer;
    this.physics = physics;
    this.gameState = gameState;
  }

  public init(): void {
    this.addGameBoundaries();
    this.addClickListener();
    this.setupPhysicsEventListeners();
    this.renderer.addDebugGuide();
  }

  private addGameBoundaries(): void {
    const world = this.physics.getWorld();
    const centerLayer = this.renderer.getCenterLayer();

    this.topBoundary = new GameBoundary(0, -5, GAME_WIDTH, 5, 0x000000);
    World.add(this.physics.getWorld(), this.topBoundary.getPhysicsBody());
    centerLayer.addChild(this.topBoundary.getGraphics());

    this.bottomBoundary = new GameBoundary(
      0,
      GAME_HEIGHT,
      GAME_WIDTH,
      5,
      0x000000,
      "bottom"
    );
    World.add(this.physics.getWorld(), this.bottomBoundary.getPhysicsBody());
    centerLayer.addChild(this.bottomBoundary.getGraphics());

    this.leftBoundary = new GameBoundary(-5, 0, 5, GAME_HEIGHT, 0x000000);
    World.add(this.physics.getWorld(), this.leftBoundary.getPhysicsBody());
    centerLayer.addChild(this.leftBoundary.getGraphics());

    this.rightBoundary = new GameBoundary(
      GAME_WIDTH,
      0,
      5,
      GAME_HEIGHT,
      0x000000
    );
    World.add(this.physics.getWorld(), this.rightBoundary.getPhysicsBody());
    centerLayer.addChild(this.rightBoundary.getGraphics());
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

      // 공 2개 생성
      this.createNewBalls();

      // 공들을 목표 지점으로 발사
      this.launchBalls(localPosition.x, localPosition.y);
    });
  }

  private createNewBalls(): void {
    // 공 2개 생성
    for (let i = 0; i < 2; i++) {
      const ball = new Ball(this.gameState.ballStartPosition);
      World.add(this.physics.getWorld(), ball.getPhysicsBody());
      this.renderer.getGameViewport().addChild(ball.getGraphics());

      this.balls.push(ball);
    }

    // 첫 번째 도착 공 초기화
    this.firstLandedBall = null;
  }

  private launchBalls(targetX: number, targetY: number): void {
    // 공들을 100ms 간격으로 발사
    this.balls.forEach((ball, index) => {
      setTimeout(() => {
        ball.moveTowards(targetX, targetY);
      }, index * 100);
    });
  }

  private setupPhysicsEventListeners(): void {
    Events.on(this.physics.getEngine(), "collisionStart", (event: any) => {
      event.pairs.forEach((pair: any) => {
        const { bodyA, bodyB } = pair;

        // 바닥과의 충돌 감지
        if (bodyA.label === "bottom" || bodyB.label === "bottom") {
          const ballBody =
            bodyA.label === "ball"
              ? bodyA
              : bodyB.label === "ball"
              ? bodyB
              : null;
          if (ballBody) {
            this.handleBallLanding(ballBody);
          }
        }
      });
    });
  }

  private handleBallLanding(ballBody: any): void {
    // 해당 body를 가진 Ball 엔티티 찾기
    const landedBall = this.balls.find(
      (ball) => ball.getPhysicsBody() === ballBody
    );
    if (!landedBall) return;

    if (!this.firstLandedBall) {
      // 첫 번째 도착한 공 설정 및 시작 위치 업데이트
      this.firstLandedBall = landedBall;
      const position = landedBall.getPosition();
      this.gameState.setBallStartPosition(position.x, position.y);
      console.log("First ball landed at:", position.x, position.y);

      // 첫 번째 공도 제거
      this.removeBall(landedBall);
    } else {
      // 두 번째부터 도착하는 공들 제거
      this.removeBall(landedBall);
    }

    // 모든 공이 제거되었는지 확인
    this.checkAllBallsRemoved();
  }

  private checkAllBallsRemoved(): void {
    // 모든 공이 제거되었으면 대기 상태로 전환
    if (this.balls.length === 0) {
      setTimeout(() => {
        this.gameState.setWaiting(true);
        console.log("All balls removed. Ready for next shot.");
      }, 100); // 약간의 딜레이 후 대기 상태로 전환
    }
  }

  private removeBall(ball: Ball): void {
    // 렌더링에서 제거
    this.renderer.getGameViewport().removeChild(ball.getGraphics());
    // 물리에서 제거
    World.remove(this.physics.getWorld(), ball.getPhysicsBody());

    ball.destroy();

    // 배열에서 제거
    const index = this.balls.indexOf(ball);
    if (index > -1) {
      this.balls.splice(index, 1);
    }
  }
}
