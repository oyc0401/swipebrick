# SwipeBrick – 기술 스택 및 제약사항

## 기술 스택
- **바닐라 TypeScript** (React 사용 금지)
- **PixiJS** (WebGL 렌더링)
- **Matter.js** (물리 엔진)

## 좌표계 및 화면 설정
- 게임 좌표계: **1000x2000** (가로 1000, 세로 2000)
- 반응형: 화면 크기에 관계없이 **패딩 없이 스케일링**하여 전체화면 사용
- 캔버스: 항상 **화면 중앙**에 배치

## 개발 원칙
- React 절대 사용 금지
- 순수 바닐라 JavaScript/TypeScript만 사용
- PixiJS와 Matter.js로만 게임 구현