import type { Container } from "pixi.js";
import { Ball } from "../entity/Ball";
import type { GameState } from "../GameState";

interface BallLandingCallback {
  (landedBall: Ball): void;
}

export class BallManager {
  private activeBalls: Ball[] = [];
  private previewBall!: Ball;
  private gameViewport: Container;
  private gameState: GameState;

  private onBallLanding?: BallLandingCallback;

  constructor(
    gameViewport: Container,
    gameState: GameState
  ) {
    this.gameViewport = gameViewport;
    this.gameState = gameState;
    this.createPreviewBall();
  }

  /** 공이 도착했을 때 이벤트 */
  public onBallLanded(callback: BallLandingCallback): void {
    this.onBallLanding = callback;
  }

  public createBalls(count: number): void {
    for (let i = 0; i < count; i++) {
      const ball = new Ball(this.gameState.ballStartPosition);
      // PhysicsEngine에 자동 등록되므로 World.add 제거
      this.gameViewport.addChild(ball.getGraphics());
      this.activeBalls.push(ball);
    }
  }

  public launchBalls(
    targetX: number,
    targetY: number,
    delayMs: number = 100
  ): void {
    this.activeBalls.forEach((ball, index) => {
      setTimeout(() => {
        ball.moveTowards(targetX, targetY);
      }, index * delayMs);
    });
  }

  public handleBallLanding(ballBody: Matter.Body): void {
    const landedBall = this.activeBalls.find(
      (ball) => ball.getPhysicsBody() === ballBody
    );

    if (!landedBall) return;

    if (this.onBallLanding) {
      this.onBallLanding(landedBall);
    }

    this.removeBall(landedBall);
  }

  public showPreviewBall(): void {
    this.previewBall.getGraphics().visible = true;
    this.previewBall.setPosition(this.gameState.ballStartPosition);
  }

  public hidePreviewBall(): void {
    this.previewBall.getGraphics().visible = false;
  }

  private createPreviewBall(): void {
    this.previewBall = Ball.createWithoutPhysics(this.gameState.ballStartPosition);

    this.gameViewport.addChild(this.previewBall.getGraphics());
  }
  private removeBall(ball: Ball): void {
    this.gameViewport.removeChild(ball.getGraphics());
    // PhysicsEngine에서 자동 제거되므로 World.remove 제거
    ball.destroy();

    const index = this.activeBalls.indexOf(ball);
    if (index > -1) {
      this.activeBalls.splice(index, 1);
    }
  }

  public getActiveBallCount() {
    return this.activeBalls.length;
  }

  public destroy(): void {
    this.activeBalls.forEach((ball) => {
      this.removeBall(ball);
    });

    if (this.previewBall) {
      this.gameViewport.removeChild(this.previewBall.getGraphics());
      this.previewBall.destroy();
    }

    this.activeBalls = [];
  }
}
