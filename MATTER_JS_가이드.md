# Matter.js 완전 초보 가이드 (SwipeBrick 기준)

> **고등학생도 100% 이해 가능!** for문, 배열만 알면 끝!

## 🤔 Matter.js가 뭔가요?

**한 줄 요약**: 물리 법칙을 자동으로 계산해주는 도우미

### 🎮 게임에서 이런 일들이 일어나죠:
- 공이 벽에 부딪히면 → **튕겨나간다**
- 공이 떨어지면 → **중력 때문에 아래로**
- 두 물체가 만나면 → **충돌해서 밀려난다**

### 😱 원래는 이런 계산을 직접 해야 했어요:
```javascript
// 벽 충돌 검사를 직접 하려면...
if (ball.x + ball.radius > wall.x) {
  ball.x = wall.x - ball.radius;
  ball.speedX = -ball.speedX; // 반대 방향으로
}
// 이런 코드를 수백 줄 작성... 😵‍💫
```

### 🎉 Matter.js를 쓰면:
```javascript
// 이게 끝!
Matter.Bodies.circle(x, y, radius); // 공 만들기
Matter.Bodies.rectangle(x, y, width, height); // 벽 만들기
// 충돌, 반사, 물리 계산 → 모두 자동! ✨
```

**결론**: Matter.js = 물리 계산하는 똑똑한 로봇 🤖

## 🧠 핵심 개념 3가지 (외우세요!)

> **암기 팁**: 엔진(두뇌) → 월드(게임판) → 바디(게임 말)

### 1️⃣ Engine (엔진) - 🧠 게임의 두뇌

**쉬운 설명**: 물리 계산하는 컴퓨터 (CPU 같은 것)
**하는 일**: 매 순간 "공이 어디로 갈까?" "부딪혔나?" 계산

```typescript
// PhysicsEngine.ts 파일에서:
this.engine = Matter.Engine.create(); // 🧠 두뇌 만들기

// main.ts에서 매 프레임마다:
this.physics.update(16); // 16ms = 1/60초마다 계산
```

**실제 코드 위치**: `src/PhysicsEngine.ts:8`

### 2️⃣ World (월드) - 🌍 게임판

**쉬운 설명**: 바둑판 같은 곳, 모든 게임 말(공, 벽)이 올라가는 곳
**하는 일**: 게임 오브젝트들을 보관하고 관리

```typescript
// PhysicsEngine.ts에서:
this.world = this.engine.world; // 엔진에 붙어있는 게임판 가져오기

// Ball.ts에서:
Matter.World.add(world, this.body); // 게임판에 공 올리기

// GameBoundary.ts에서:
Matter.World.add(world, this.body); // 게임판에 벽 올리기
```

**실제 코드 위치**: `src/PhysicsEngine.ts:9`
**핵심**: 모든 게임 오브젝트는 반드시 World에 add해야 함!

### 3️⃣ Body (바디) - 📦 게임 말

**쉬운 설명**: 게임판 위의 실제 말 (공, 벽, 상자 등)
**하는 일**: 물리 법칙의 영향을 받는 모든 것

```typescript
// 공 만들기 (Ball.ts:16에서)
this.body = Matter.Bodies.circle(
  position.x,  // 공의 x 위치
  position.y,  // 공의 y 위치
  this.radius, // 공의 반지름 (8)
  { 옵션들... }
);

// 벽 만들기 (GameBoundary.ts:13에서)
this.body = Matter.Bodies.rectangle(
  x + width / 2,   // 벽의 중심 x
  y + height / 2,  // 벽의 중심 y
  width,           // 벽의 가로
  height,          // 벽의 세로
  { isStatic: true } // 움직이지 않는 벽
);
```

**중요한 차이점**:
- **공의 Body**: 움직임 (dynamic)
- **벽의 Body**: 고정됨 (static)

**실제 코드 위치**:
- 공: `src/Ball.ts:16`
- 벽: `src/GameBoundary.ts:13`

### 단계 2: 공 만들기 (Ball.ts)

📂 **파일**: `src/Ball.ts`
🎯 **목적**: 튕기는 공 만들기 (영구 운동)

```typescript
// 라인 16-27: 공의 물리 모델 만들기
this.body = Matter.Bodies.circle(
  position.x,      // 공의 시작 x 좌표
  position.y,      // 공의 시작 y 좌표
  this.radius,     // 공 크기 (반지름 8px)
  {
    restitution: 1,    // 튕김 = 100% (에너지 손실 없음)
    friction: 0,       // 마찰 = 0% (얼음판처럼 미끄러움)
    frictionAir: 0,    // 공기저항 = 0% (진공상태)
    frictionStatic: 0, // 정지마찰 = 0% (달라붙지 않음)
    inertia: Infinity  // 회전 방지 (회전하지 않는 공)
  }
);

// 라인 29: 게임 월드에 공 추가
Matter.World.add(world, this.body);
```

🤓 **옵션 선택 이유**:
- `restitution: 1` = 슈퍼볼 효과! ⚽ → 💪
- `friction: 0` = 얼음판 효과! ❄️ → 🚀
- `frictionAir: 0` = 우주 효과! 🚀 → 🌌
- `inertia: Infinity` = 빙글빙글 돌지 않는 공 🚫🌀

**결과**: 한 번 움직이면 영원히 움직이는 마법의 공! ✨

### 🧱 벽 만들기 (GameBoundary.ts)

```typescript
// 벽 = 사각형 물체
this.body = Matter.Bodies.rectangle(
  x + width / 2,   // 사각형의 중심 x 좌표
  y + height / 2,  // 사각형의 중심 y 좌표
  width,           // 가로 길이
  height,          // 세로 길이
  {
    isStatic: true // 정적 물체 = 절대 움직이지 않음
  }
);
```

**중요**: Matter.js는 사각형의 **중심점**으로 위치를 설정합니다!
- PixiJS: 왼쪽 위 모서리가 기준
- Matter.js: 정중앙이 기준

### 🎯 공에 힘 가하기 (클릭으로 이동)

```typescript
moveTowards(targetX, targetY) {
  const currentPos = this.body.position; // 현재 공 위치
  const dx = targetX - currentPos.x;     // x 방향 거리
  const dy = targetY - currentPos.y;     // y 방향 거리

  // 방향과 거리 계산 (피타고라스 정리)
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > 0) {
    const force = 0.005; // 힘의 크기
    const forceX = (dx / distance) * force; // x 방향 힘
    const forceY = (dy / distance) * force; // y 방향 힘

    // 공에 힘 가하기
    Matter.Body.applyForce(
      this.body,                    // 어떤 물체에
      this.body.position,           // 어느 지점에 (물체 중심)
      { x: forceX, y: forceY }      // 어떤 힘을
    );
  }
}
```

### 🔄 물리와 그래픽 동기화

```typescript
// Matter.js에서 계산한 위치를 PixiJS 그래픽에 반영
updateGraphics() {
  this.graphics.x = this.body.position.x; // Matter.js x → PixiJS x
  this.graphics.y = this.body.position.y; // Matter.js y → PixiJS y
}
```

## 4. 전체 동작 흐름

1. **초기화**: Engine, World 생성
2. **물체 생성**: 공(원형), 벽들(사각형) 만들기
3. **게임 루프**:
   ```
   클릭 → 공에 힘 가하기 → 물리 계산 → 그래픽 위치 업데이트 → 반복
   ```

## 5. 자주 하는 실수

❌ **잘못된 생각**: "코드가 복잡해 보인다"
✅ **올바른 생각**: Matter.js가 모든 물리를 자동 처리해줘서 오히려 간단!

❌ **잘못된 생각**: "충돌 처리를 직접 코딩해야 한다"
✅ **올바른 생각**: Matter.js가 자동으로 충돌, 반사, 튕김 모두 계산!

❌ **잘못된 생각**: "벽 모서리 충돌이 복잡하다"
✅ **올바른 생각**: 원형 vs 사각형 충돌을 Matter.js가 완벽 처리!

## 6. 정리

**SwipeBrick에서 Matter.js 역할:**
- 🎯 클릭하면 공이 그 방향으로 이동
- 🏓 벽에 부딪히면 자동으로 반사
- ⚽ 물리법칙에 맞는 자연스러운 움직임
- 🔄 영구 운동 (마찰/저항 없음)

**결론**: Matter.js 덕분에 복잡한 물리 계산 없이 몇 줄의 코드로 리얼한 물리 게임을 만들 수 있습니다!