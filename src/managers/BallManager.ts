import { BallEntity } from "../entity/BallEntity";
import type { GameState } from "../GameState";
import { PhysicsEngine } from "../physics/PhysicsEngine";

interface BallLandingCallback {
  (landedBall: BallEntity): void;
}

export class BallManager {
  private activeBalls: BallEntity[] = [];
  private previewBall!: BallEntity;
  private gameState: GameState;

  private onBallLanding?: BallLandingCallback;

  constructor(gameState: GameState) {
    this.gameState = gameState;
    this.createPreviewBall();
    this.setupPhysicsEventListeners();
  }

  /** 공이 도착했을 때 이벤트 */
  public onBallLanded(callback: BallLandingCallback): void {
    this.onBallLanding = callback;
  }

  public createBalls(count: number): void {
    for (let i = 0; i < count; i++) {
      const ball = new BallEntity(this.gameState.ballStartPosition);
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
    this.previewBall.setVisible(true);
    this.previewBall.setPosition(this.gameState.ballStartPosition);
  }

  public hidePreviewBall(): void {
    this.previewBall.setVisible(false);
  }

  private setupPhysicsEventListeners(): void {
    PhysicsEngine.getInstance().onCollisionBottom((ballBody) => {
      this.handleBallLanding(ballBody);
    });
  }

  private createPreviewBall(): void {
    this.previewBall = BallEntity.createWithoutPhysics(
      this.gameState.ballStartPosition
    );
  }
  private removeBall(ball: BallEntity): void {
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
      this.previewBall.destroy();
    }

    this.activeBalls = [];
  }
}
