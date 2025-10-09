import { BallEntity } from "../entity/BallEntity";
import type { Position } from "../GameState";
import { GAME_HEIGHT, BALL_RADIUS } from "../GameState";
import { PhysicsEngine } from "../physics/PhysicsEngine";
import type { SwipeBrick } from "../SwipeBrick";
import { getNextId } from "../utils/IdGenerator";

interface BallLandingCallback {
  (landedBall: BallEntity): void;
}

export class BallManager {
  private activeBalls: BallEntity[] = [];
  private previewBall!: BallEntity;
  private landedBall!: BallEntity;

  private swipeBrick: SwipeBrick;

  // private targetReturnPosition: { x: number; y: number } | null = null;

  private onBallLandingCallbacks: Array<BallLandingCallback> = [];
  private onAllBallsLaunchedCallback: Array<() => void> = [];

  constructor(swipeBrick: SwipeBrick) {
    this.swipeBrick = swipeBrick;
    // this.createPreviewBall();
    this.setupPhysicsEventListeners();
  }

  /** 공이 도착했을 때 이벤트 */
  public onBallLanded(callback: BallLandingCallback): void {
    this.onBallLandingCallbacks.push(callback);
  }

  /** 공이 모두 발사되었을 때 이벤트 */
  public onAllBallsLaunched(callback: () => void): void {
    this.onAllBallsLaunchedCallback.push(callback);
  }

  public createBalls(count: number): void {
    for (let i = 0; i < count; i++) {
      const ballStartX = this.swipeBrick.getBallStartX();
      const ballStartPosition: Position = {
        x: ballStartX,
        y: GAME_HEIGHT - BALL_RADIUS,
      };
      const ball = new BallEntity(`ball-${getNextId()}`, ballStartPosition);

      if (i === count - 1) {
        (ball.getPhysicsBody() as any).isLast = true;
      }

      this.activeBalls.push(ball);
    }
  }

  public launchBalls(angleDeg: number): void {
    this.activeBalls.forEach((ball, index) => {
      ball.moveAtAngle(angleDeg, index);
    });
  }

  public handleBallLanding(ballBody: Matter.Body): void {
    const landedBall = this.activeBalls.find(
      (ball) => ball.getPhysicsBody() === ballBody
    );

    if (!landedBall) return;

    this.onBallLandingCallbacks.forEach((callback) => {
      callback(landedBall);
    });
  }

  public showPreviewBall(): void {
    this.previewBall.setVisible(true);
    const ballStartX = this.swipeBrick.getBallStartX();
    this.previewBall.setPosition({
      x: ballStartX,
      y: GAME_HEIGHT - BALL_RADIUS,
    });
  }

  public hidePreviewBall(): void {
    this.previewBall.setVisible(false);
  }

  public showLandedBall(): void {
    this.landedBall.setVisible(true);
    const ballStartX = this.swipeBrick.getBallStartX();
    this.landedBall.setPosition({
      x: ballStartX,
      y: GAME_HEIGHT - BALL_RADIUS,
    });
  }

  public hideLandedBall(): void {
    this.landedBall.setVisible(false);
  }

  private setupPhysicsEventListeners(): void {
    const physicsEngine = PhysicsEngine.getInstance();
    physicsEngine.onCollisionBottom((ballBody) => {
      this.handleBallLanding(ballBody);
    });

    physicsEngine.onAllBallsLaunched(() => {
      this.onAllBallsLaunchedCallback.forEach((callback) => {
        callback();
      });
    });
  }

  public createPreviewBall(): void {
    const ballStartX = this.swipeBrick.getBallStartX();
    this.previewBall = BallEntity.createWithoutPhysics(
      `ball-preview-${getNextId()}`,
      {
        x: ballStartX,
        y: GAME_HEIGHT - BALL_RADIUS,
      }
    );
  }

  public createLandedBall(): void {
    const ballStartX = this.swipeBrick.getBallStartX();
    this.landedBall = BallEntity.createWithoutPhysics(
      `ball-landed-${getNextId()}`,
      {
        x: ballStartX,
        y: GAME_HEIGHT - BALL_RADIUS,
      }
    );
    this.hideLandedBall();
  }
  public removeBall(ball: BallEntity): void {
    ball.destroy();

    const index = this.activeBalls.indexOf(ball);
    if (index > -1) {
      this.activeBalls.splice(index, 1);
    }
  }

  public getActiveBallCount() {
    return this.activeBalls.length;
  }

  public getActiveBalls(): BallEntity[] {
    return this.activeBalls;
  }

  public destroy(): void {
    this.activeBalls.forEach((ball) => {
      this.removeBall(ball);
    });

    if (this.previewBall) {
      this.previewBall.destroy();
    }

    this.landedBall.destroy();

    this.activeBalls = [];

    this.onBallLandingCallbacks = [];
    this.onAllBallsLaunchedCallback = [];
  }
}
