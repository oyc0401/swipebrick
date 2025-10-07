import { Application, Container, Graphics } from "pixi.js";
import { EntityManager } from "../core/entity/EntityManager";
import { LayerManager } from "./LayerManager";
// @ts-ignore
import { ShatterEffect } from "./ShatterEffect.js";
import { CircleRenderComponent } from "./RenderComponent";

/**
 * 반응형 UI 가로 크기
 */
function getSize() {
  const containerElement = document.getElementById("container");
  const containerRect = containerElement?.getBoundingClientRect();

  return {
    width: containerRect?.width ?? 0,
    height: containerRect?.height ?? 0,
  };
}

export class GraphicEngine {
  private static instance: GraphicEngine | null = null;

  private app: Application;
  private layerManager: LayerManager;
  private gameWidth: number;
  private gameHeight: number;
  private debugGuide: Graphics | null = null;
  private aimLine: Graphics | null = null;
  public shatterEffect: any = null; // ShatterEffect 인스턴스

  private constructor(gameWidth: number, gameHeight: number) {
    this.app = new Application();
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.layerManager = new LayerManager(this.app, gameWidth, gameHeight);
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
    const startTime = performance.now();

    await this.app.init({
      width,
      height,
      autoDensity: true,
      backgroundAlpha: 0,
      antialias: true,
      resolution: Math.ceil(window.devicePixelRatio),
    });

    const container = document.getElementById("container");
    if (container) container.appendChild(this.app.canvas);
    this.app.canvas.style.display = "block";

    this.layerManager.setupLayers(this.app.stage);

    // ShatterEffect 초기화 (gameViewport에 렌더링)
    this.shatterEffect = new ShatterEffect(
      this.app,
      this.layerManager.getGameViewport()
    );

    const endTime = performance.now();
    const initDuration = Math.round(endTime - startTime);

    console.log(`GraphicEngine initialized (${initDuration} ms)`);
  }

  public addDebugGuide(): void {
    this.layerManager.addDebugGuide();
  }

  public getCenterLayer(): Container {
    return this.layerManager.getCenterLayer();
  }

  public getGameViewport(): Container {
    return this.layerManager.getGameViewport();
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
    const centerLayer = this.layerManager.getCenterLayer();
    const scale = centerLayer.scale.x; // scale.x와 scale.y는 동일
    const centerX = centerLayer.position.x;
    const centerY = centerLayer.position.y;
    const pivotX = centerLayer.pivot.x;
    const pivotY = centerLayer.pivot.y;

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
      this.layerManager.getGameViewport().addChildAt(this.aimLine, 0);
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
    // LayerManager 정리
    this.layerManager.destroy();

    // Graphics 객체들 정리
    if (this.debugGuide) {
      this.debugGuide.destroy(true);
      this.debugGuide = null;
    }

    if (this.aimLine) {
      this.aimLine.destroy(true);
      this.aimLine = null;
    }

    // ShatterEffect 정리
    if (this.shatterEffect) {
      this.shatterEffect.destroy();
      this.shatterEffect = null;
    }

    // CircleRenderComponent 텍스처 캐시 정리
    CircleRenderComponent.clearTextureCache();

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
