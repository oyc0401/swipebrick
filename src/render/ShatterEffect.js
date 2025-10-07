import { Graphics, Sprite } from "pixi.js";

export class ShatterEffect {
  constructor(app, viewport) {
    this.app = app;
    this.shards = [];
    this.tileSize = 7;
    this.cols = 5;
    this.rows = 4;
    this.gravity = 0.35;
    this.drag = 0.99;
    this.duration = 60;
    this.delay = 30;
    this.defaultColor = 0x83b4f9;
    this.viewport = viewport;

    // 텍스처 미리 생성 (모든 파편에서 재사용)
    this.tileTexture = this.createTileTexture();

    // ticker에 물리 업데이트 등록 (바인딩된 핸들러 저장)
    this.updateHandler = (dt) => this.update(dt);
    app.ticker.add(this.updateHandler);
  }

  createTileTexture() {
    const g = new Graphics();
    g.rect(0, 0, this.tileSize, this.tileSize);
    g.fill(this.defaultColor);
    const texture = this.app.renderer.generateTexture(g);
    g.destroy();
    return texture;
  }

  // 특정 좌표에서 사각형 부서짐 효과
  create(x, y) {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const s = new Sprite(this.tileTexture);

        // 위치
        const xOffset = Math.random() * 58; // 60은 사각형 너비
        const yOffset = Math.random() * 38; // 40은 사각형 너비
        s.anchor.set(0, 0);

        s.x = x + xOffset - 30 - 1;
        s.y = y + yOffset - 20 - 1;

        // 물리 속성
        s.vx = (Math.random() - 0.5) * 6;
        s.vy = -1 * Math.random() * 2;
        s.angularVel = (Math.random() - 0.5) * 0.3;
        s.delay = this.delay;
        s.duration = this.duration;
        s.life = s.delay + s.duration;
        s.scale.set(1);
        s.alpha = 1;

        this.viewport.addChild(s);
        this.shards.push(s);
      }
    }
  }

  // ticker에서 호출되는 물리 업데이트
  update(ticker) {
    let dt = ticker.deltaTime;
    // console.log("updated", dt);
    for (let i = this.shards.length - 1; i >= 0; i--) {
      const s = this.shards[i];
      s.vy += this.gravity * dt;
      s.vx *= Math.pow(this.drag, dt);
      s.vy *= Math.pow(this.drag, dt);
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.rotation = 0;
      s.life -= dt;
      if (s.life > s.duration) {
        s.scale.set(1);
        s.alpha = 1;
      } else {
        const t = Math.max(0, s.life / s.duration);
        const eased = t * t; // easeInQuad
        s.scale.set(eased);
        s.alpha = eased; // 투명도 적용
      }
      if (s.life <= 0 || s.y > this.app.renderer.height + 50) {
        this.viewport.removeChild(s);
        s.destroy();
        this.shards.splice(i, 1);
      }
    }
  }

  // 모든 파편 제거
  clear() {
    while (this.shards.length) {
      const s = this.shards.pop();
      this.viewport.removeChild(s);
      s.destroy();
    }
  }

  // 리소스 정리 메서드
  destroy() {
    // ticker 콜백 제거
    this.app.ticker.remove(this.updateHandler);
    // 모든 파편 제거
    this.clear();
    // 텍스처 정리
    this.tileTexture?.destroy(true);
    this.tileTexture = null;
  }
}
