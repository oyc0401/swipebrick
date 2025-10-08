# SwipeBrick 파일 구조

프로젝트의 src 폴더 내부 구조입니다.

```
src/
├── Game.ts                           # 게임 메인 클래스
├── GameState.ts                      # 게임 상태 관리
├── SwipeBrick.ts                     # 게임 로직 핵심
├── main.ts                           # 앱 진입점
├── components/                       # React UI 컴포넌트
│   ├── GameOverDialog.tsx
│   ├── GameUI.tsx
│   ├── Header.tsx
│   ├── IconButton.tsx
│   └── ScoreDisplay.tsx
├── core/                            # 엔티티-컴포넌트 시스템
│   ├── components/
│   │   └── IComponent.ts            # 컴포넌트 인터페이스
│   └── entity/
│       ├── ActiveEntity.ts          # 활성 엔티티 베이스
│       ├── Entity.ts                # 엔티티 베이스
│       └── EntityManager.ts         # 엔티티 관리자
├── entity/                          # 게임 오브젝트
│   ├── BallEntity.ts                # 공 엔티티
│   ├── BrickEntity.ts               # 벽돌 엔티티
│   ├── GameBoundary.ts              # 경계벽 엔티티
│   └── ItemEntity.ts                # 아이템 엔티티
├── managers/                        # 시스템 매니저
│   ├── BallManager.ts               # 공 관리
│   ├── BoundaryManager.ts           # 경계 관리
│   ├── BrickManager.ts              # 벽돌 관리
│   ├── InputManager.ts              # 입력 처리
│   └── SoundManager.ts              # 사운드 관리
├── physics/                         # 물리 엔진
│   ├── PhysicsComponent.ts          # 물리 컴포넌트
│   └── PhysicsEngine.ts             # Matter.js 래퍼
├── render/                          # 렌더링 시스템
│   ├── GraphicEngine.ts             # PixiJS 래퍼
│   ├── LayerManager.ts              # 레이어 관리
│   └── RenderComponent.ts           # 렌더 컴포넌트
├── repository/                      # 데이터 저장소
│   ├── IScoreRepository.ts          # 저장소 인터페이스
│   ├── LocalStorageScoreRepository.ts
│   ├── ScoreRepositoryFactory.ts
│   └── TossAppScoreRepository.ts
├── stores/                          # 상태 관리
│   └── gameStore.ts                 # Zustand 스토어
└── utils/                           # 유틸리티
    ├── IdGenerator.ts               # ID 생성기
    ├── animationFrame.ts            # 애니메이션 프레임
    ├── i18n.ts                      # 국제화
    ├── locale.ts                    # 로케일 처리
    ├── number.ts                    # 숫자 포맷팅
    ├── platform.ts                  # 플랫폼 감지
    └── tds-dummy.tsx                # TDS 더미
```

## 아키텍처 특징

### 하이브리드 구조

- **게임 엔진**: 순수 TypeScript + PixiJS + Matter.js
- **UI 계층**: React + TDS (토스 디자인 시스템)
- **상태 관리**: Zustand

### 엔티티-컴포넌트 시스템

- `core/`: ECS 기반 아키텍처
- `entity/`: 게임 오브젝트 구현
- `render/`, `physics/`: 컴포넌트 구현체

### 매니저 패턴

- 각 시스템별 전용 매니저로 책임 분리
- 게임 로직과 시스템 관리 분리

### 레이어 분리

- `components/`: React UI 전용
- `managers/`, `entity/`: 게임 로직 전용
- `utils/`: 공통 유틸리티
