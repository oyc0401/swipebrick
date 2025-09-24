# SwipeBrick – 기술 스택 및 제약사항

## 기술 스택

- **바닐라 TypeScript** (React 사용 금지)
- **PixiJS** (WebGL 렌더링)
- **Matter.js** (물리 엔진)

## 개발 원칙

- React 절대 사용 금지
- 순수 바닐라 JavaScript/TypeScript만 사용
- PixiJS와 Matter.js로만 게임 구현

## 현재 코드 구조

### 핵심 클래스
- **`Game`** (`main.ts`) - 게임 진입점 및 오브젝트 조합
- **`GameRenderer`** - PixiJS 렌더링, 화면 관리, 리사이즈 처리
- **`PhysicsEngine`** - Matter.js 물리 엔진 관리
- **`Ball`** - 공 객체 (Matter.js Body + PixiJS Graphics)
- **`GameBoundary`** - 경계벽 (Matter.js Body + PixiJS Graphics)
- **`GameState`** - 게임 상태 관리

### 구현된 기능
- 360×360 게임 영역 반응형 렌더링
- 클릭 시 공이 해당 방향으로 이동
- 벽 충돌 시 완전 탄성 반사 (영구 운동)
- 중력 비활성화된 2D 물리 시뮬레이션
