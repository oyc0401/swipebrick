import { BallEntity } from "../entity/BallEntity";
import type { GameState, Position } from "../GameState";
import { GAME_HEIGHT, BALL_RADIUS } from "../GameState";
import { PhysicsEngine } from "../physics/PhysicsEngine";
import type { SwipeBrick } from "../SwipeBrick";

interface BallLandingCallback {
  (landedBall: BallEntity): void;
}

export class BallManager {
  private activeBalls: BallEntity[] = [];
  private previewBall!: BallEntity;

  private swipeBrick: SwipeBrick;

  private onBallLanding?: BallLandingCallback;

  constructor(swipeBrick: SwipeBrick) {
    this.swipeBrick = swipeBrick;
    this.createPreviewBall();
    this.setupPhysicsEventListeners();
  }

  /** 공이 도착했을 때 이벤트 */
  public onBallLanded(callback: BallLandingCallback): void {
    this.onBallLanding = callback;
  }

  public createBalls(count: number): void {
    for (let i = 0; i < count; i++) {
      const ballStartX = this.swipeBrick.getBallStartPosition();
      const ballStartPosition: Position = {
        x: ballStartX,
        y: GAME_HEIGHT - BALL_RADIUS,
      };
      const ball = new BallEntity(ballStartPosition);
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
    const ballStartX = this.swipeBrick.getBallStartPosition();
    console.log("ballStartX", ballStartX);
    this.previewBall.setPosition({
      x: ballStartX,
      y: GAME_HEIGHT - BALL_RADIUS,
    });
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
    const ballStartX = this.swipeBrick.getBallStartPosition();
    this.previewBall = BallEntity.createWithoutPhysics({
      x: ballStartX,
      y: GAME_HEIGHT - BALL_RADIUS,
    });
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
