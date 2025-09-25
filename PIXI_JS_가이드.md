# PixiJS 완전 초보 가이드 (SwipeBrick 기준)

> **고등학생도 100% 이해 가능!** for문, 배열만 알면 끝!

## 🤔 PixiJS가 뭔가요?

**한 줄 요약**: 화면에 예쁜 그림을 빠르게 그려주는 마법의 붓

### 🎨 일반 화면에 그림 그리기 VS PixiJS

**일반적인 방법** (어려움! 😱):
```javascript
// HTML Canvas API를 직접 사용
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
ctx.beginPath();
ctx.arc(100, 100, 50, 0, 2 * Math.PI);
ctx.fillStyle = 'red';
ctx.fill();
// 이런 코드를 수백 줄... 😵‍💫
```

**PixiJS 사용** (쉬움! 🎉):
```javascript
// 이게 끝!
const graphics = new PIXI.Graphics();
graphics.circle(100, 100, 50);
graphics.fill({ color: 0xff0000 });
// 끝! ✨
```

**추가 장점**:
- 🚀 **빠름**: GPU 가속 (WebGL)
- 📦 **쉬움**: 직관적인 API
- 🌍 **대응**: 모든 디바이스에서 동작

**결론**: PixiJS = 웹에서 예쁜 그림 그리기의 최고 도구! 🎨✨

## 🧠 핵심 개념 4가지 (외우세요!)

> **암기 팁**: 앱(도화지) → 스테이지(무대) → 컨테이너(상자) → 그래픽스(펜)

### 1️⃣ Application (앱) - 📱 도화지 + 붓

**쉬운 설명**: 그림 그릴 도화지와 붓을 한 세트로 만들어주는 것
**하는 일**: 게임 창 전체를 관리하고 설정

```typescript
this.app = new PIXI.Application(); // 도화지 + 붓 세트 준비
await this.app.init({
  width: 800,           // 도화지 가로 크기
  height: 600,          // 도화지 세로 크기
  backgroundColor: 0xeeeeee, // 배경색 (16진수)
});
```

### 🎭 Stage (무대)
**비유**: 연극 무대, 모든 것이 올라가는 최상위 공간

```typescript
this.app.stage // 무대 (자동으로 만들어짐)
this.app.stage.addChild(뭔가); // 무대에 뭔가 올리기
```

### 📦 Container (컨테이너)
**비유**: 투명한 상자, 여러 개 물건을 그룹으로 묶기

```typescript
const container = new PIXI.Container(); // 빈 상자 만들기
container.addChild(그래픽1);     // 상자에 물건1 넣기
container.addChild(그래픽2);     // 상자에 물건2 넣기
무대.addChild(container);       // 상자를 무대에 올리기
```

### 🎨 Graphics (그래픽스)
**비유**: 펜으로 도형 그리기

```typescript
const g = new PIXI.Graphics(); // 펜 준비
g.circle(0, 0, 10);           // 원 그리기 (중심x, 중심y, 반지름)
g.fill({ color: 0xff0000 });  // 빨간색으로 칠하기
```

## 3. SwipeBrick에서 사용하는 방법

### 🏗️ 앱 초기화 (GameRenderer.ts)

```typescript
// 1단계: 앱 만들기
this.app = new PIXI.Application();

// 2단계: 설정하며 초기화
await this.app.init({
  width: getInnerWidth(),              // 화면 가로에 맞춤
  height: window.innerHeight,          // 화면 세로에 맞춤
  autoDensity: true,                   // 고해상도 화면 자동 대응
  backgroundColor: 0xeeeeee,           // 연한 회색 배경
  antialias: true,                     // 부드러운 그래픽
  resolution: Math.ceil(window.devicePixelRatio), // 픽셀 배율
});

// 3단계: HTML에 캔버스 추가
const container = document.getElementById("container");
container.appendChild(this.app.canvas); // 도화지를 웹페이지에 붙이기
```

**색상 코드 이해하기:**
- `0xeeeeee` = 연한 회색 (16진수)
- `0xff0000` = 빨간색
- `0x00ff00` = 초록색
- `0x0000ff` = 파란색

### 📱 반응형 화면 처리

```typescript
// 화면 크기에 맞게 스케일 계산
const scale = Math.min(
  screenWidth / GAME_WIDTH,   // 가로 비율
  screenHeight / GAME_HEIGHT  // 세로 비율
);

// 컨테이너 크기 조정
this.centerLayer.scale.set(scale); // 전체적으로 확대/축소

// 화면 중앙에 배치
this.centerLayer.position.set(
  screenWidth / 2,   // 화면 가로 중앙
  screenHeight / 2   // 화면 세로 중앙
);
```

### 📦 레이어 구조 만들기

```typescript
// 중앙 고정 레이어 (360×360 게임 영역)
this.centerLayer = new PIXI.Container();
this.centerLayer.pivot.set(GAME_WIDTH / 2, GAME_HEIGHT / 2); // 회전 중심점
this.app.stage.addChild(this.centerLayer); // 무대에 올리기

// 게임 뷰포트 (실제 게임 오브젝트들)
this.gameViewport = new PIXI.Container();
this.gameViewport.hitArea = new PIXI.Rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT);
this.centerLayer.addChild(this.gameViewport); // 중앙 레이어에 올리기
```

**레이어 구조:**
```
Stage (무대)
└── centerLayer (중앙 컨테이너)
    ├── gameViewport (게임 영역)
    │   └── ball (공)
    └── boundaries (경계선들)
```

### ⚽ 공 그리기 (Ball.ts)

```typescript
// 1단계: 그래픽스 객체 만들기
this.graphics = new PIXI.Graphics();

// 2단계: 원 그리기
createBall() {
  this.graphics.clear();                    // 이전 그림 지우기
  this.graphics.circle(0, 0, this.radius); // 원점에서 반지름 8인 원
  this.graphics.fill({ color: this.color }); // 토스 블루로 칠하기
}

// 3단계: 위치 설정
setPosition(position) {
  this.graphics.x = position.x; // x 좌표
  this.graphics.y = position.y; // y 좌표
}
```

### 🧱 벽 그리기 (GameBoundary.ts)

```typescript
createBoundary(x, y, width, height, color) {
  this.graphics.rect(x, y, width, height);  // 사각형 그리기
  this.graphics.fill({ color });            // 색칠하기
}

// 예시: 상단 벽 만들기
new GameBoundary(0, -5, 360, 5, 0x000000); // 검정색 가로 벽
```

### 🖱️ 클릭 이벤트 처리

```typescript
// 클릭 가능하게 설정
this.gameViewport.eventMode = 'static'; // 이벤트 받을 준비

// 클릭 이벤트 리스너 등록
this.gameViewport.on('pointerdown', (event) => {
  // 클릭한 위치 가져오기
  const localPosition = event.getLocalPosition(this.gameViewport);

  // 그 위치로 공 이동시키기
  this.ball.moveTowards(localPosition.x, localPosition.y);
});
```

### 🔄 게임 루프 (애니메이션)

```typescript
// 매 프레임마다 실행되는 함수
this.app.ticker.add(() => {
  // 1. 물리 계산 (Matter.js)
  this.physics.update(16);

  // 2. 그래픽 위치 업데이트 (PixiJS)
  this.ball.updateGraphics();
});
```

**ticker**: 초당 60번 실행되는 타이머 (60fps)

## 4. 좌표계 이해하기

### 📍 PixiJS 좌표계
```
(0,0) ─────────── (360,0)
  │                 │
  │                 │
  │                 │
(0,360) ───────── (360,360)
```

- **왼쪽 위**가 (0, 0)
- **오른쪽**으로 갈수록 x 증가
- **아래**로 갈수록 y 증가

### 🎯 pivot (회전 중심점)
```typescript
container.pivot.set(180, 180); // 중심을 (180, 180)으로 설정
container.rotation = Math.PI / 4; // 중심점 기준으로 45도 회전
```

**비유**: 바람개비의 핀이 꽂힌 지점

## 5. 자주 사용하는 PixiJS 메서드

### 📦 Container 관련
```typescript
container.addChild(객체);        // 자식 추가
container.removeChild(객체);     // 자식 제거
container.position.set(x, y);    // 위치 설정
container.scale.set(2);          // 2배 크기로
container.rotation = Math.PI;    // 180도 회전
```

### 🎨 Graphics 관련
```typescript
graphics.clear();                     // 그림 지우기
graphics.circle(x, y, radius);        // 원 그리기
graphics.rect(x, y, width, height);   // 사각형 그리기
graphics.fill({ color: 0xff0000 });   // 색칠하기
graphics.stroke({ width: 2, color: 0x000000 }); // 테두리 그리기
```

### 🖱️ 이벤트 관련
```typescript
객체.eventMode = 'static';           // 이벤트 받을 준비
객체.on('pointerdown', 함수);        // 클릭했을 때
객체.on('pointerover', 함수);        // 마우스 올렸을 때
```

## 6. SwipeBrick 그래픽 구조

### 🏗️ 전체 구조
```
HTML Canvas (도화지)
└── PIXI.Application (앱)
    └── Stage (무대)
        └── centerLayer (중앙 컨테이너) - 360×360 게임 영역
            ├── gameViewport (게임 영역) - 클릭 감지
            │   └── ball.graphics (공 그래픽)
            ├── topBoundary.graphics (상단 벽)
            ├── bottomBoundary.graphics (하단 벽)
            ├── leftBoundary.graphics (좌측 벽)
            ├── rightBoundary.graphics (우측 벽)
            └── debugGuide (디버그 가이드선)
```

### 🎨 색상 구성
- **배경**: `0xeeeeee` (연한 회색)
- **공**: `0x4880ee` (토스 블루)
- **벽**: `0x000000` (검정색)
- **가이드선**: `0x00aa00` (초록색), `0xaa0000` (빨간색)

## 7. 자주 하는 실수

❌ **잘못된 생각**: "PixiJS는 복잡한 3D 엔진이다"
✅ **올바른 생각**: 2D 전용이라 매우 간단! HTML5 Canvas를 쉽게 쓰는 도구

❌ **잘못된 생각**: "좌표계가 수학과 같다"
✅ **올바른 생각**: 컴퓨터 화면은 왼쪽 위가 (0,0), 아래로 갈수록 y가 증가

❌ **잘못된 생각**: "Container와 Graphics가 같다"
✅ **올바른 생각**: Container는 상자, Graphics는 실제 그림

❌ **잘못된 생각**: "색상을 문자열로 써야 한다"
✅ **올바른 생각**: `0x` + 16진수 (0xff0000 = 빨강)

## 8. 정리

**SwipeBrick에서 PixiJS 역할:**
- 🎨 게임 화면 그리기 (공, 벽, 배경)
- 📱 반응형 화면 처리 (모바일 대응)
- 🖱️ 클릭 이벤트 감지
- 🔄 60fps 부드러운 애니메이션
- 📦 레이어별 체계적 관리

**결론**: PixiJS 덕분에 복잡한 Canvas API 없이도 몇 줄의 코드로 화려한 웹 게임 그래픽을 만들 수 있습니다!

## 9. 다음 단계

이 가이드로 SwipeBrick의 PixiJS 코드를 100% 이해했다면:
1. 공 색깔 바꿔보기 (`this.color = 0xff0000`)
2. 벽 두께 조정해보기
3. 배경색 변경해보기
4. 디버그 가이드 on/off 해보기

**실습하며 익히는 것이 최고!** 🚀