import type { GraphicEngine } from "../render/GraphicEngine";
import { GAME_HEIGHT, BALL_RADIUS } from "../GameState";
import type { SwipeBrick } from "../SwipeBrick";

interface ClickCallback {
  (x: number, y: number, angle: number): void;
}

interface MouseMoveCallback {
  (x: number, y: number): void;
}

interface PointerdownCallback {
  (x: number, y: number): void;
}

export class InputManager {
  private static instance: InputManager;

  private swipeBrick: SwipeBrick;
  private onPointerUpCallbacks: ClickCallback[] = [];
  private onPointerMoveCallbacks: MouseMoveCallback[] = [];
  private onPointerDownCallbacks: PointerdownCallback[] = [];

  private isPointerDown = false;

  private readonly MIN_ANGLE = 10; // 최소 각도 (도)
  private readonly MAX_ANGLE = 180 - 10; // 최대 각도 (도)

  constructor(swipeBrick: SwipeBrick) {
    this.swipeBrick = swipeBrick;
    this.setupEventListeners();
    InputManager.instance = this;
  }

  public static triggerPointerDown(event: PointerEvent) {
    InputManager.instance?.pointerdownHandler(event);
  }

  /** 마우스 다운 시 이벤트 */
  public onPointerDown(callback: PointerdownCallback): void {
    this.onPointerDownCallbacks.push(callback);
  }

  /** 마우스 이동 시 이벤트 */
  public onPointerMove(callback: MouseMoveCallback): void {
    this.onPointerMoveCallbacks.push(callback);
  }

  /** 게임 영역 포인터 업 이벤트 */
  public onPointerUp(callback: ClickCallback): void {
    this.onPointerUpCallbacks.push(callback);
  }

  private pointerdownHandler = (e: PointerEvent) => {
    this.isPointerDown = true;
    const gameCoords = this.toGameCoords(e);
    this.onPointerDownCallbacks.forEach((callback) =>
      callback(gameCoords.x, gameCoords.y)
    );
  };

  private pointermoveHandler = (e: PointerEvent) => {
    if (!this.isPointerDown) return;

    // DOM 좌표를 게임 좌표로 변환
    const gameCoords = this.toGameCoords(e);

    // console.log(`Clicked at (${fixed(gameCoords.x, 4)}, ${fixed(gameCoords.y, 4)})`);
    // 349.38704182330827 93.55791823308269
    let testX = 349.38704182330827;
    let testY = 93.55791823308269;

    // 각도 제한: 마우스 위치 보정
    const validCoords = this.applyAngleLimit(gameCoords.x, gameCoords.y);

    this.onPointerMoveCallbacks.forEach((callback) =>
      callback(validCoords.x, validCoords.y)
    );
  };

  private pointerupHandler = (e: PointerEvent) => {
    if (!this.isPointerDown) return;

    this.isPointerDown = false;

    // DOM 좌표를 게임 좌표로 변환
    const gameCoords = this.toGameCoords(e);

    // 각도 제한: 가장 가까운 유효 각도로 보정
    const validCoords = this.applyAngleLimit(gameCoords.x, gameCoords.y);

    this.onPointerUpCallbacks.forEach((callback) =>
      callback(validCoords.x, validCoords.y, validCoords.angle)
    );
  };

  private setupEventListeners(): void {
    // DOM 전체에서 이벤트 수신
    document.addEventListener("pointermove", this.pointermoveHandler);
    document.addEventListener("pointerup", this.pointerupHandler);
  }

  private toGameCoords(event: MouseEvent) {
    const containerElement = document.getElementById("container");
    const containerRect = containerElement?.getBoundingClientRect()!;

    let scale = 360 / containerRect.width;
    // DOM 좌표를 게임 좌표로 변환

    const gameCoords = {
      x: event.clientX * scale - containerRect.left,
      y:
        event.clientY * scale -
        (containerRect.height * scale - 360) / 2 -
        containerRect.top * scale,
    };

    return gameCoords;
  }

  private applyAngleLimit(
    targetX: number,
    targetY: number
  ): { x: number; y: number; angle: number } {
    //*추가** angle
    // SwipeBrick에서 공의 시작 위치 가져오기
    const ballX = this.swipeBrick.getBallStartX();
    const ballY = GAME_HEIGHT - BALL_RADIUS;

    // 벡터 계산
    const dx = targetX - ballX;
    const dy = targetY - ballY;

    // 각도 계산 (라디안에서 도로 변환)
    let angle = Math.atan2(-dy, dx) * (180 / Math.PI);

    // 각도를 0-360 범위로 정규화
    if (angle < 0) angle += 360;

    // 유효한 각도 범위 확인 (30도~150도)
    if (angle < this.MIN_ANGLE || angle > this.MAX_ANGLE) {
      // 가장 가까운 유효 각도로 클램핑
      let clampedAngle: number;

      if (angle < this.MIN_ANGLE) {
        // 30도 미만이면 30도로
        clampedAngle = this.MIN_ANGLE;
      } else if (angle > this.MAX_ANGLE && angle <= 180) {
        // 150도 초과 180도 이하면 150도로
        clampedAngle = this.MAX_ANGLE;
      } else if (angle > 180 && angle < 360 - this.MIN_ANGLE) {
        // 180도 초과 330도 미만이면 150도로 (더 가까운 쪽)
        clampedAngle = this.MAX_ANGLE;
      } else {
        // 330도 이상이면 30도로 (더 가까운 쪽)
        clampedAngle = this.MIN_ANGLE;
      }

      const clampedAngleRad = clampedAngle * (Math.PI / 180);

      // 거리는 원래 마우스 위치와 동일하게 유지
      const distance = Math.sqrt(dx * dx + dy * dy);

      // 제한된 각도로 새로운 좌표 계산
      const newX = ballX + Math.cos(clampedAngleRad) * distance;
      const newY = ballY - Math.sin(clampedAngleRad) * distance;

      return { x: newX, y: newY, angle: clampedAngle };
    }

    // 유효한 각도면 원래 좌표 반환
    return { x: targetX, y: targetY, angle };
  }

  public destroy(): void {
    // document 이벤트 제거
    document.removeEventListener("pointerup", this.pointerupHandler);
    document.removeEventListener("pointermove", this.pointermoveHandler);

    this.onPointerDownCallbacks = [];
    this.onPointerUpCallbacks = [];
    this.onPointerMoveCallbacks = [];

    InputManager.instance = null as any;
  }
}
