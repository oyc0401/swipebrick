# SwipeBrick – 기술 스택 및 제약사항

## 기술 스택

- **바닐라 TypeScript** (React 사용 금지)
- **PixiJS** (WebGL 렌더링)
- **Matter.js** (물리 엔진)

## 개발 원칙

- React 절대 사용 금지
- 순수 바닐라 JavaScript/TypeScript만 사용
- PixiJS와 Matter.js로만 게임 구현
- 나중에 React를 추가할건데, 이건 꽤나 나중에 추가할 것이니 의존성은 딱히 안지워도 됨.

## **🚨 프로젝트 품질 표준 (CRITICAL)**

**이 프로젝트는 100만 명의 사용자를 대상으로 하는 프로덕션 급 프로젝트입니다.**

### 절대 금지사항

- ❌ **토이 프로젝트 마인드**: "대충", "일단", "나중에 수정" 등의 임시방편
- ❌ **근본적 문제 회피**: 증상만 가리는 핫픽스나 임시 조치
- ❌ **성능 최적화 미뤄두기**: 모든 코드는 처음부터 최적화된 상태로 작성
- ❌ **정밀도 무시**: 소수점 오차, floating point 정밀도 문제 등 수치적 불안정성
- ❌ **타입 안전성 무시**: `any` 타입 사용, 타입 체크 생략

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

## 코딩 컨벤션

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

### 구현된 기능

- 360×360 게임 영역 반응형 렌더링
- 클릭 시 공이 해당 방향으로 이동
- 벽 충돌 시 완전 탄성 반사 (영구 운동)
- 중력 비활성화된 2D 물리 시뮬레이션
