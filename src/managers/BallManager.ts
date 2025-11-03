import { BallEntity } from "../entity/BallEntity";
import type { Position } from "../GameState";
import { GAME_HEIGHT, BALL_RADIUS } from "../GameState";
import { PhysicsEngine } from "../physics/PhysicsEngine";
import type { SwipeBrick } from "../SwipeBrick";
import { getNextId } from "../utils/IdGenerator";
import { useGameStore } from "../stores/gameStore";

export class BallManager {
  private activeBalls: BallEntity[] = [];
  private previewBall!: BallEntity;
  private landedBall!: BallEntity; // 바닥에 착지한 공 (다음 턴 시작 전까지 유지)

  private swipeBrick: SwipeBrick;

  private onBallLandedCallbacks: Array<(landedBall: BallEntity) => void> = [];
  private onAllBallsSettledCallbacks: Array<() => void> = [];
  private onAllBallsLaunchedCallbacks: Array<() => void> = [];
  private onBallLaunchedCallbacks: Array<() => void> = [];

  private landedBallAnimationPromises: Promise<void>[] = [];

  constructor(swipeBrick: SwipeBrick) {
    this.swipeBrick = swipeBrick;
    this.setupPhysicsEventListeners();
  }

  // ===== Public Event Subscription =====

  public onBallLanded(callback: (landedBall: BallEntity) => void): void {
    this.onBallLandedCallbacks.push(callback);
  }

  public onAllBallsSettled(callback: () => void): void {
    this.onAllBallsSettledCallbacks.push(callback);
  }

  public onAllBallsLaunched(callback: () => void): void {
    this.onAllBallsLaunchedCallbacks.push(callback);
  }
  public onBallLaunched(callback: () => void): void {
    this.onBallLaunchedCallbacks.push(callback);
  }

  // ===== Event Handlers =====

  private setupPhysicsEventListeners(): void {
    const physicsEngine = PhysicsEngine.getInstance();

    physicsEngine.onCollisionBottom((ballBody) => {
      this.handleBallLanding(ballBody);
    });

    physicsEngine.onAllBallsLaunched(() => {
      this.onAllBallsLaunchedCallbacks.forEach((cb) => cb());
    });

    physicsEngine.onBallLaunched(() => {
      this.onBallLaunchedCallbacks.forEach((cb) => cb());
      
      this.decreaseRemainingBalls();
      console.log("공 하나 출발!");
    });
  }

  private handleBallLanding(ballBody: Matter.Body): void {
    const landedBallIndex = this.activeBalls.findIndex(
      (ball) => ball.getPhysicsBody() === ballBody
    );

    if (landedBallIndex === -1) return;

    const [landedBall] = this.activeBalls.splice(landedBallIndex, 1);

    this.onBallLandedCallbacks.forEach((cb) => cb(landedBall));

    const targetX = this.swipeBrick.getBallStartX();
    const movePromise = landedBall.moveTo(targetX).then(() => {
      landedBall.destroy();
    });
    this.landedBallAnimationPromises.push(movePromise);

    if (this.activeBalls.length === 0) {
      Promise.all(this.landedBallAnimationPromises).then(() => {
        this.onAllBallsSettledCallbacks.forEach((cb) => cb());
        this.landedBallAnimationPromises = [];
      });
    }
  }

  // ===== Ball Management =====

  public createBalls(count: number): void {
    useGameStore.getState().setRemainingBalls(count);
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

  public removeBall(ball: BallEntity): void {
    ball.destroy();

    const index = this.activeBalls.indexOf(ball);
    if (index > -1) {
      this.activeBalls.splice(index, 1);
    }
  }
   public decreaseRemainingBalls = () => {
  useGameStore.setState((state) => ({
    remainingBalls: state.remainingBalls - 1,
  }));
  };

  public getActiveBallCount(): number {
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

    if (this.landedBall) {
      this.landedBall.destroy();
    }

    this.activeBalls = [];
    this.onBallLandedCallbacks = [];
    this.onAllBallsLaunchedCallbacks = [];
    this.onBallLaunchedCallbacks = [];
  }
}
