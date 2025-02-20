# English Learning Assistant Frontend

영어 학습을 위한 종합 플랫폼의 프론트엔드 애플리케이션입니다. AI 기반의 대화형 학습, 문법 학습, 단어장, 영어 일기 작성 등 다양한 기능을 제공합니다.

## 주요 기능

### 1. Practice & Learn

- 영어 문장 연습 (Practice)
- 문장별 상세 설명과 예문 제공
- 답변 관리 및 학습 진도 추적

### 2. AI Chat

- GPT 기반의 대화형 영어 학습
- 커스터마이즈 가능한 프롬프트 템플릿
- 실시간 스트리밍 응답
- 대화 내역 저장 및 관리

### 3. Grammar Study

- 문법 강의 영상 및 설명 제공
- 마크다운 기반의 상세한 문법 설명
- YouTube 영상 연동

### 4. Vocabulary Management

- 단어장 기능
- 단어별 다중 의미 관리
- 예문 및 부가 설명 추가
- 품사 정보 관리

### 5. English Diary

- 영어 일기 작성
- AI 기반의 피드백 제공
- 날짜별 일기 관리

### 6. OPIc Practice

- OPIc 시험 준비를 위한 문제 관리
- General Topics / Role Play 카테고리 구분
- TTS(Text-to-Speech) 기능 제공

## 기술 스택

- React 18
- TypeScript
- TanStack Query (React Query)
- Zustand (상태 관리)
- Tailwind CSS
- Vite
- Axios
- React Router DOM

## 프로젝트 구조

```
src/
├── api/          # API 통신 관련 모듈
├── components/   # 재사용 가능한 컴포넌트
├── config/       # 환경 설정
├── pages/        # 페이지 컴포넌트
├── store/        # 상태 관리
└── types/        # TypeScript 타입 정의
```

## 주요 환경 변수

- `VITE_API_URL`: API 서버 주소

## 개발 환경 설정

1. 저장소 클론

```bash
git clone [repository-url]
cd english_bot_fe
```

2. 의존성 설치

```bash
npm install
```

3. 환경 변수 설정

```bash
cp .env.example .env
# .env 파일에서 VITE_API_URL 설정
```

4. 개발 서버 실행

```bash
npm run dev
```

## Docker 지원

개발 및 프로덕션 환경을 위한 Docker 설정이 포함되어 있습니다.

### 개발 환경

```bash
docker-compose up dev
```

### 프로덕션 환경

```bash
docker-compose up prod
```

## 주요 기능별 구현 설명

### 1. 인증 관리

- Zustand를 사용한 상태 관리
- JWT 토큰 기반 인증
- 영구 저장소를 통한 세션 유지

### 2. API 통신

- Axios 인스턴스 커스터마이징
- 인터셉터를 통한 토큰 관리
- 에러 핸들링

### 3. 상태 관리

- TanStack Query를 활용한 서버 상태 관리
- 캐시 및 동기화 최적화
- 실시간 업데이트

### 4. UI/UX

- Tailwind CSS를 활용한 반응형 디자인
- 다크 모드 지원 (예정)
- 로딩 및 에러 상태 처리

## 라이센스

MIT License
