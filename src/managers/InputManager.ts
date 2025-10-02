import type { GraphicEngine } from "../render/GraphicEngine";
import type { GameState } from "../GameState";
import { GAME_HEIGHT, BALL_RADIUS } from "../GameState";
import type { SwipeBrick } from "../SwipeBrick";

interface ClickCallback {
  (x: number, y: number): void;
}

interface MouseMoveCallback {
  (x: number, y: number): void;
}

export class InputManager {
  private renderer: GraphicEngine;

  private swipeBrick: SwipeBrick;
  private onGameClick?: ClickCallback;
  private onMouseMoveCallback?: MouseMoveCallback;
  private clickHandler: (event: MouseEvent) => void;
  private mouseMoveHandler: (event: MouseEvent) => void;

  private readonly MIN_ANGLE = 10; // 최소 각도 (도)
  private readonly MAX_ANGLE = 180 - 10; // 최대 각도 (도)

  constructor(renderer: GraphicEngine, swipeBrick: SwipeBrick) {
    this.renderer = renderer;
    this.swipeBrick = swipeBrick;
    this.clickHandler = this.handleClick.bind(this);
    this.mouseMoveHandler = this.handleMouseMove.bind(this);
    this.setupEventListeners();
  }

  /** 게임 영역 클릭 시 이벤트 */
  public onClick(callback: ClickCallback): void {
    this.onGameClick = callback;
  }

  /** 마우스 이동 시 이벤트 */
  public onMouseMove(callback: MouseMoveCallback): void {
    this.onMouseMoveCallback = callback;
  }

  private setupEventListeners(): void {
    // DOM 전체에서 클릭 이벤트 수신
    document.addEventListener("pointerup", this.clickHandler);
    // DOM 전체에서 마우스 이동 이벤트 수신
    document.addEventListener("pointermove", this.mouseMoveHandler);
  }

  private toGameCoords(event: MouseEvent) {
    const containerElement = document.getElementById("container");
    const containerRect = containerElement?.getBoundingClientRect()!;

    let scale = 360 / containerRect.width;
    // DOM 좌표를 게임 좌표로 변환

    const gameCoords = {
      x: event.clientX * scale - containerRect.left,
      y: event.clientY * scale - (containerRect.height * scale - 360) / 2,
    };

    return gameCoords;
  }
  private handleClick(event: MouseEvent): void {
    // DOM 좌표를 게임 좌표로 변환
    const gameCoords = this.toGameCoords(event);

    console.log("Clicked at:", gameCoords.x, gameCoords.y);
    // 349.38704182330827 93.55791823308269
    let testX = 349.38704182330827;
    let testY = 93.55791823308269;

    // 각도 제한: 가장 가까운 유효 각도로 보정
    const validCoords = this.applyAngleLimit(gameCoords.x, gameCoords.y);

    if (this.onGameClick) {
      // this.onGameClick(testX, testY);
      this.onGameClick(validCoords.x, validCoords.y);
    }
  }

  private handleMouseMove(event: MouseEvent): void {
    // DOM 좌표를 게임 좌표로 변환
    const gameCoords = this.toGameCoords(event);

    // 각도 제한: 마우스 위치 보정
    const validCoords = this.applyAngleLimit(gameCoords.x, gameCoords.y);

    if (this.onMouseMoveCallback) {
      this.onMouseMoveCallback(validCoords.x, validCoords.y);
    }
  }

  private applyAngleLimit(
    targetX: number,
    targetY: number
  ): { x: number; y: number } {
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

      return { x: newX, y: newY };
    }

    // 유효한 각도면 원래 좌표 반환
    return { x: targetX, y: targetY };
  }

  public destroy(): void {
    document.removeEventListener("pointerup", this.clickHandler);
    document.removeEventListener("pointermove", this.mouseMoveHandler);
    this.onGameClick = undefined;
    this.onMouseMoveCallback = undefined;
  }
}
