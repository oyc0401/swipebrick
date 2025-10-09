# SwipeBrick – 기술 스택 및 제약사항

## 기술 스택

- **바닐라 TypeScript** (React 사용 금지)
- **PixiJS** (WebGL 렌더링)
- **Matter.js** (물리 엔진)

## 아키텍처 개요

하이브리드 아키텍처: 바닐라 TypeScript 게임 엔진 + React UI 오버레이

- 게임 엔진: 순수 TypeScript + PixiJS + Matter.js
- UI 계층: React + TDS (토스 디자인 시스템)
- 상태 관리: Zustand

## 개발 원칙

- 순수 바닐라 JavaScript/TypeScript만 사용
- PixiJS와 Matter.js로만 게임 구현
- React는 무조건 UI를 담당하는 곳 에만 적용하고, 게임 로직은 React 절대 사용 금지.

## **🚨 프로젝트 품질 표준 (CRITICAL)**

**이 프로젝트는 100만 명의 사용자를 대상으로 하는 프로덕션 급 프로젝트입니다.**

### 절대 금지사항

- ❌ **토이 프로젝트 마인드**: "대충", "일단", "나중에 수정" 등의 임시방편
- ❌ **근본적 문제 회피**: 증상만 가리는 핫픽스나 임시 조치
- ❌ **성능 최적화 미뤄두기**: 모든 코드는 처음부터 최적화된 상태로 작성
- ❌ **정밀도 무시**: 소수점 오차, floating point 정밀도 문제 등 수치적 불안정성
- ❌ **타입 안전성 무시**: `any` 타입 사용, 타입 체크 생략
- ❌ **동적 import 사용**: `import()`, `require()` 등 런타임 모듈 로딩 금지

### 필수 준수사항

- ✅ **근본적 해결**: 모든 문제는 원인부터 제대로 분석하여 완벽히 해결
- ✅ **엔터프라이즈급 안정성**: 물리 시뮬레이션 jitter, 수치 오차 등 완벽 제거
- ✅ **최고 성능**: 60fps 보장, 메모리 누수 없음, 최적화된 알고리즘 사용
- ✅ **완벽한 타입 안전성**: 모든 타입 명시, 컴파일 타임 오류 방지
- ✅ **확장 가능한 아키텍처**: 새 기능 추가 시에도 기존 코드 변경 최소화

### 코드 품질 기준

- **물리 엔진**: Position-Based Dynamics, CCD 등 산업 표준 기법 적용
- **렌더링**: 프레임 드롭 없는 부드러운 60fps+ 렌더링
- **메모리 관리**: 가비지 컬렉션 최소화, 객체 풀링 등 최적화 기법
- **수치 정밀도**: floating point 오차 완벽 대응
- **에러 처리**: 모든 예외 상황에 대한 완벽한 대응
- **애니메이션**: 반드시 deltaTime 또는 실제 시간 기반으로 구현 (프레임률 독립적)

## 코딩 컨벤션

### 애니메이션 구현 규칙

- **deltaTime 기반**: `ticker.deltaTime`을 사용하여 프레임률 독립적 애니메이션
- **실제 시간 기반**: `ticker.lastTime` 또는 `performance.now()` 사용
- **프레임 기반 금지**: `animationTime += 0.06` 같은 프레임 의존적 구현 금지

```typescript
// ✅ 올바른 방법 (deltaTime 기반)
update(ticker) {
  const dt = ticker.deltaTime;
  this.velocity += this.gravity * dt;
  this.position += this.velocity * dt;
}

// ✅ 올바른 방법 (실제 시간 기반)
updateAnimation() {
  const globalTime = ticker.lastTime * this.animationSpeed;
  const offset = Math.sin(globalTime);
}

// ❌ 잘못된 방법 (프레임 기반)
updateAnimation() {
  this.animationTime += 0.06; // 프레임률에 의존
}
```

### Import 규칙

- **네임스페이스 import 금지**: `import * as PIXI from "pixi.js"` 사용 금지
- **명시적 import 사용**: `import type { FederatedPointerEvent } from "pixi.js"` 권장
- **필요한 것만 import**: `import { Application, Graphics } from "pixi.js"`
- **타입/인터페이스는 반드시 type import**: `import type { IComponent } from "./IComponent"`

### ID 생성 규칙

- **엔티티 ID 생성**: `${prefix}-${Date.now()}-${Math.random()}` 형식 사용
- **충돌 방지**: Date.now()와 Math.random() 조합으로 고유성 보장
- **예시**: `super(\`ball-${Date.now()}-${Math.random()}\`)`

### 다이어그램 표기법

- **외부 라이브러리 타입**: 구체적인 클래스명 대신 라이브러리명 사용
- **PixiJS**: `Container`, `Graphics`, `Application` → `PixiJS`
- **Matter.js**: `World`, `Body`, `Engine` → `MatterJS`
- **예시**: `private world: MatterJS` (not `private world: World`)

## 현재 코드 구조

### 핵심 클래스

- **`Game`** (`main.ts`) - 게임 진입점 및 오브젝트 조합
- **`GameRenderer`** - PixiJS 렌더링, 화면 관리, 리사이즈 처리
- **`PhysicsEngine`** - Matter.js 물리 엔진 관리
- **`Ball`** - 공 객체 (Matter.js Body + PixiJS Graphics)
- **`GameBoundary`** - 경계벽 (Matter.js Body + PixiJS Graphics)
- **`GameState`** - 게임 상태 관리

### 핵심 상태 동기화

SwipeBrick (논리) ←→ BrickEntity/ItemEntity (시각)

1. SwipeBrick: 6x8 그리드에서 게임 오브젝트 논리적 관리
2. BrickManager: SwipeBrick ↔ Entity 동기화 담당
3. 물리 충돌: Matter.js → BrickManager → SwipeBrick → Entity 업데이트

게임 사이클

클릭 → 공 발사 → 충돌 처리 → 벽돌 제거/데미지 →
공 착지 → 행 시프트 → 새 행 생성 → 게임오버 체크

### 기능

- 360×360 게임 영역 반응형 렌더링
- 클릭 시 공이 해당 방향으로 이동
- 벽 충돌 시 완전 탄성 반사 (영구 운동)
- 중력 비활성화된 2D 물리 시뮬레이션

## 🚨 크리티컬 패턴 (필수!)

### 상태 동기화 철칙

```typescript
// SwipeBrick(논리) → Entity(시각) 단방향만!
const result = swipeBrick.damageBrick(stage, index);
brickEntity.setHealth(result.health); // 동기화만
```

### ID 파싱 생명선

```typescript
// 형식: brick-{stage}-{index} (절대 변경 금지!)
const [type, stage, index] = entity.id.split("-");
```

### 이중 충돌 버그 방지

```typescript
// beforeUpdate에서 속도 저장 필수
(body as any).previousVelocity = { x: body.velocity.x, y: body.velocity.y };
```

## 개발 프로세스 규칙

- **Claude는 `npm run dev`, `npm run build`, `npm run lint`, `vite` 등 빌드/테스트/개발서버 명령어를 실행하지 않음**
- **BashOutput으로 실행 중인 셸 출력 읽기는 허용됨**

# 요청이 들어올때마다 비슷한 몇개의 파일을 꼭 확인하고 코드스타일 통일해서 코드 작성하기
