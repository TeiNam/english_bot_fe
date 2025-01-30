
# English Learning Bot Frontend

## 프로젝트 소개
이 프로젝트는 영어 학습을 위한 웹 애플리케이션의 프론트엔드입니다. React와 TypeScript를 기반으로 구축되었으며, 사용자가 영어 문장을 학습하고 관리할 수 있는 인터페이스를 제공합니다.

## 주요 기능
- **학습 모드 (Learn)**: 영어 문장을 선택하고 학습할 수 있는 인터페이스 제공
- **관리 모드 (Manage)**: 영어 문장과 답변을 추가, 수정, 삭제할 수 있는 관리 인터페이스
- **사용자 인증**: 로그인 기능을 통한 보안 관리

## 기술 스택
- **프레임워크**: React 18.3
- **언어**: TypeScript
- **빌드 도구**: Vite
- **상태 관리**: 
  - Zustand (전역 상태 관리)
  - @tanstack/react-query (서버 상태 관리)
- **스타일링**: TailwindCSS
- **라우팅**: React Router DOM
- **HTTP 클라이언트**: Axios
- **아이콘**: Lucide React

## 시작하기

### 필수 조건
- Node.js (최신 LTS 버전 권장)
- npm 또는 yarn

### 설치
```bash
# 의존성 설치
npm install
# 또는
yarn install
```

### 개발 서버 실행
```bash
npm run dev
# 또는
yarn dev
```

### 프로덕션 빌드
```bash
npm run build
# 또는
yarn build
```

## 프로젝트 구조
```
src/
├── api/          # API 통신 관련 모듈
├── components/   # 재사용 가능한 컴포넌트
├── pages/        # 페이지 컴포넌트
├── store/        # 상태 관리 (Zustand)
├── types/        # TypeScript 타입 정의
└── App.tsx       # 메인 애플리케이션 컴포넌트
```

## 주요 페이지
- **/learn**: 영어 문장 학습 페이지
- **/manage**: 영어 문장 및 답변 관리 페이지
- **/login**: 로그인 페이지

## 개발 도구
- ESLint: 코드 품질 관리
- TypeScript: 정적 타입 검사
- Vite: 빠른 개발 환경과 빌드 최적화
- TailwindCSS: 유틸리티 기반 CSS 프레임워크

## 라이센스
이 프로젝트는 private 라이센스로 제공됩니다.
