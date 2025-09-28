import { Application, Container, Graphics, Rectangle } from "pixi.js";
import { EntityManager } from "../core/entity/EntityManager";

/**
 * 반응형 UI 가로 크기
 */
function getSize() {
  const size = { width: window.innerWidth, height: window.innerHeight };
  // -> 세로 / 가로
  const RATIO = 1.8; // 2도 좋음
  let innerWidth = size.width;
  if (size.height / size.width < RATIO) {
    innerWidth = size.height / RATIO;
  }
  return {
    width: innerWidth,
    height: size.height,
  };
}

export class GraphicEngine {
  private static instance: GraphicEngine | null = null;

  private app: Application;
  private centerLayer: Container;
  private gameViewport: Container;
  private gameWidth: number;
  private gameHeight: number;
  private background: Graphics | null = null;
  private debugGuide: Graphics | null = null;
  private aimLine: Graphics | null = null;
  private cleanupTasks: (() => void)[] = [];

  private constructor(gameWidth: number, gameHeight: number) {
    this.app = new Application();
    this.centerLayer = new Container();
    this.gameViewport = new Container();
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
  }

  public static getInstance(
    gameWidth?: number,
    gameHeight?: number
  ): GraphicEngine {
    if (!GraphicEngine.instance) {
      if (gameWidth === undefined || gameHeight === undefined) {
        throw new Error(
          "GraphicEngine: gameWidth and gameHeight are required for first initialization"
        );
      }
      GraphicEngine.instance = new GraphicEngine(gameWidth, gameHeight);
    }
    return GraphicEngine.instance;
  }

  public static destroy(): void {
    if (GraphicEngine.instance) {
      GraphicEngine.instance.destroy();
      GraphicEngine.instance = null;
    }
  }

  public async init(): Promise<void> {
    const { width, height } = getSize();
    await this.app.init({
      width,
      height,
      autoDensity: true,
      backgroundColor: 0xeeeeee,
      antialias: true,
      resolution: Math.ceil(window.devicePixelRatio),
    });

    console.log("dpr:", window.devicePixelRatio);

    const container = document.getElementById("container");
    if (container) container.appendChild(this.app.canvas);
    this.app.canvas.style.display = "block";

    this.setupLayers();
    this.setupEventListeners();
  }

  private setupLayers(): void {
    // 중앙 고정 레이어
    this.centerLayer.pivot.set(this.gameWidth / 2, this.gameWidth / 2);

    this.app.stage.addChild(this.centerLayer);

    // // 게임 뷰포트
    // this.centerLayer.hitArea = new Rectangle(0, -200, this.gameWidth, 800);
    this.gameViewport.hitArea = new Rectangle(
      0,
      0,
      this.gameWidth,
      this.gameHeight
    );
    this.centerLayer.addChild(this.gameViewport);

    // // 중앙 정렬 & 리사이즈 대응
    this.updateCenterPosition();
  }

  private setupEventListeners(): void {
    window.addEventListener("resize", this.onResize);
    this.cleanupTasks.push(() =>
      window.removeEventListener("resize", this.onResize)
    );
  }

  private onResize = (): void => {
    const { width, height } = getSize();
    this.app.renderer.resize(width, height);
    this.updateCenterPosition();
  };

  private updateCenterPosition(): void {
    const screenWidth = this.app.renderer.width;
    const screenHeight = this.app.renderer.height;

    // 화면 가로 크기에 맞춰 스케일 계산
    const scale = Math.min(
      screenWidth / this.gameWidth,
      screenHeight / this.gameHeight
    );

    // centerLayer에 스케일 적용
    this.centerLayer.scale.set(scale);

    // 화면 중앙에 배치
    this.centerLayer.position.set(screenWidth / 2, screenHeight / 2);

    this.drawBackground(scale);
  }

  private drawBackground(scale: number) {
    const canvasSize = getSize();
    const scaledCanvasHeight = canvasSize.height / scale;
    const h = (this.gameHeight - scaledCanvasHeight) / 2;

    if (!this.background) {
      // 최초 생성
      this.background = new Graphics();
      this.centerLayer.addChildAt(this.background, 0);
    }

    // 기존 Graphics 재활용 (clear 후 새로 그리기)
    this.background.clear();
    this.background
      .rect(0, h, this.gameWidth, scaledCanvasHeight)
      .fill(0xececec); // 하늘색
  }

  public addDebugGuide(): void {
    if (!this.debugGuide) {
      // 최초 생성
      this.debugGuide = new Graphics();
      this.centerLayer.addChild(this.debugGuide);
    }

    // 기존 Graphics 재활용 (clear 후 새로 그리기)
    this.debugGuide.clear();
    this.debugGuide.rect(0, 0, this.gameWidth, this.gameHeight).stroke({
      width: 2,
      color: 0x00aa00,
    });
    this.debugGuide
      .moveTo(this.gameWidth / 2, 0)
      .lineTo(this.gameWidth / 2, this.gameHeight);
    this.debugGuide
      .moveTo(0, this.gameHeight / 2)
      .lineTo(this.gameWidth, this.gameHeight / 2);
    this.debugGuide.stroke({ width: 1, color: 0xaa0000 });
  }

  public getCenterLayer(): Container {
    return this.centerLayer;
  }

  public getGameViewport(): Container {
    return this.gameViewport;
  }

  public getApp(): Application {
    return this.app;
  }

  public screenToGameCoordinates(
    clientX: number,
    clientY: number
  ): { x: number; y: number } {
    try {
      this.app.canvas;
    } catch (e) {
      return { x: 0, y: 0 };
    }
    // 캔버스의 DOM 위치 정보 가져오기
    const canvasRect = this.app.canvas.getBoundingClientRect();

    // 클라이언트 좌표를 캔버스 상대 좌표로 변환
    // devicePixelRatio와 PixiJS resolution 고려
    const resolution = this.app.renderer.resolution;
    const canvasX =
      (clientX - canvasRect.left) * (resolution / window.devicePixelRatio);
    const canvasY =
      (clientY - canvasRect.top) * (resolution / window.devicePixelRatio);

    // centerLayer의 현재 transform 정보 가져오기
    const scale = this.centerLayer.scale.x; // scale.x와 scale.y는 동일
    const centerX = this.centerLayer.position.x;
    const centerY = this.centerLayer.position.y;
    const pivotX = this.centerLayer.pivot.x;
    const pivotY = this.centerLayer.pivot.y;

    // 캔버스 좌표를 centerLayer 로컬 좌표로 역변환
    const localX = (canvasX - centerX) / scale + pivotX;
    const localY = (canvasY - centerY) / scale + pivotY;

    return { x: localX, y: localY };
  }

  public drawAimLine(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ): void {
    if (!this.aimLine) {
      this.aimLine = new Graphics();
      this.gameViewport.addChildAt(this.aimLine, 0);
    }

    this.aimLine.clear();

    // 이쁜 점선 스타일
    const dashLength = 8;
    const gapLength = 6;
    const lineWidth = 2;
    const color = 0x4a90e2; // 파란색

    // 방향 벡터 계산
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    // 게임 뷰포트 경계까지 직선을 연장
    const endPoint = this.calculateLineEndPoint(fromX, fromY, angle);
    const distance = Math.sqrt(
      (endPoint.x - fromX) ** 2 + (endPoint.y - fromY) ** 2
    );

    // 점선 패턴 그리기
    let currentDistance = 0;
    let isDash = true;

    while (currentDistance < distance) {
      const segmentLength = isDash ? dashLength : gapLength;
      const endDistance = Math.min(currentDistance + segmentLength, distance);

      if (isDash) {
        // 선분 그리기
        const startX = fromX + Math.cos(angle) * currentDistance;
        const startY = fromY + Math.sin(angle) * currentDistance;
        const endX = fromX + Math.cos(angle) * endDistance;
        const endY = fromY + Math.sin(angle) * endDistance;

        this.aimLine
          .moveTo(startX, startY)
          .lineTo(endX, endY)
          .stroke({ width: lineWidth, color });
      }

      currentDistance = endDistance;
      isDash = !isDash;
    }
  }

  private calculateLineEndPoint(
    startX: number,
    startY: number,
    angle: number
  ): { x: number; y: number } {
    // 게임 뷰포트 경계 (0, 0, gameWidth, gameHeight)
    const minX = 0;
    const minY = 0;
    const maxX = this.gameWidth;
    const maxY = this.gameHeight;

    // 방향 벡터
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);

    // 각 경계와의 교점 계산
    let endX = startX;
    let endY = startY;
    let minDistance = Infinity;

    // 좌측 경계 (x = 0)
    if (dx < 0) {
      const t = (minX - startX) / dx;
      const y = startY + dy * t;
      if (y >= minY && y <= maxY && t > 0) {
        const distance = Math.abs(t);
        if (distance < minDistance) {
          minDistance = distance;
          endX = minX;
          endY = y;
        }
      }
    }

    // 우측 경계 (x = gameWidth)
    if (dx > 0) {
      const t = (maxX - startX) / dx;
      const y = startY + dy * t;
      if (y >= minY && y <= maxY && t > 0) {
        const distance = Math.abs(t);
        if (distance < minDistance) {
          minDistance = distance;
          endX = maxX;
          endY = y;
        }
      }
    }

    // 상단 경계 (y = 0)
    if (dy < 0) {
      const t = (minY - startY) / dy;
      const x = startX + dx * t;
      if (x >= minX && x <= maxX && t > 0) {
        const distance = Math.abs(t);
        if (distance < minDistance) {
          minDistance = distance;
          endX = x;
          endY = minY;
        }
      }
    }

    // 하단 경계 (y = gameHeight)
    if (dy > 0) {
      const t = (maxY - startY) / dy;
      const x = startX + dx * t;
      if (x >= minX && x <= maxX && t > 0) {
        const distance = Math.abs(t);
        if (distance < minDistance) {
          minDistance = distance;
          endX = x;
          endY = maxY;
        }
      }
    }

    return { x: endX, y: endY };
  }

  public clearAimLine(): void {
    if (this.aimLine) {
      this.aimLine.clear();
    }
  }

  public startLoop(): void {
    const renderLoop = () => {
      // 모든 MovingEntity 업데이트
      EntityManager.forEach((entity) => {
        entity.updateGraphics();
      });

      requestAnimationFrame(renderLoop);
    };

    renderLoop();
  }

  private destroy(): void {
    // 이벤트 리스너 정리
    this.cleanupTasks.forEach((cleanup) => cleanup());
    this.cleanupTasks = [];

    // Graphics 객체들 정리
    if (this.background) {
      this.background.destroy(true);
      this.background = null;
    }

    if (this.debugGuide) {
      this.debugGuide.destroy(true);
      this.debugGuide = null;
    }

    if (this.aimLine) {
      this.aimLine.destroy(true);
      this.aimLine = null;
    }

    // PixiJS 애플리케이션 완전 정리
    if (this.app) {
      this.app.destroy(true, {
        children: true,
        texture: true,
        textureSource: true,
      });
    }
  }
}
