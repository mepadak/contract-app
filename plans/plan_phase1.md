# Phase 1: 기반 구축 실행 계획

## 목표
프로젝트 설정 및 인증 시스템 구현

## 현재 상태
- Git 저장소 초기화됨
- 환경변수 설정됨 (.env): DATABASE_URL, DIRECT_URL, AUTH_SECRET, NEXT_PUBLIC_APP_URL
- Vercel + Neon DB 연동 완료
- Next.js 프로젝트 미초기화

---

## 구현 단계

### Step 1: 프로젝트 초기화
1. Next.js 15 프로젝트 생성 (App Router, TypeScript, src 디렉토리)
2. Tailwind CSS v4 설정
3. 추가 의존성 설치 (Prisma, Lucide React, Zod, clsx, tailwind-merge)
4. ESLint/Prettier 설정

### Step 2: 데이터베이스 설정
1. Prisma 스키마 정의
   - Contract: 계약 정보
   - Note: 계약 메모
   - ChangeLog: 변경 이력
   - Config: 앱 설정
   - Auth: PIN 인증
2. Edge Runtime용 Prisma 클라이언트 설정 (@prisma/adapter-neon)
3. 마이그레이션 실행 (npx prisma db push)

### Step 3: 인증 시스템 구현
1. 인증 유틸리티 (src/lib/auth.ts)
   - hashPin: Web Crypto API 기반 SHA-256 해싱
   - verifyPin: PIN 검증
   - createSession/getSession/clearSession: 세션 관리
2. 미들웨어 (src/middleware.ts)
   - 공개 경로 허용 (/login, /setup, /api/auth/*)
   - 세션 쿠키 체크
   - 미인증 시 /login 리다이렉트
3. PIN 설정 API (/api/auth/setup)
   - POST: PIN 해싱 후 저장, 세션 생성
   - GET: PIN 설정 여부 확인
4. PIN 인증 API (/api/auth/verify)
   - Rate Limiting (5회 실패 시 15분 잠금)
   - PIN 검증 후 세션 생성

### Step 4: 기본 레이아웃 구현 (frontend-design 스킬 적용)
1. 전역 스타일 (src/app/globals.css)
   - Tailwind v4 테마 설정
   - 화이트톤 색상 팔레트
   - 상태별 색상 정의
2. 모바일 레이아웃 컴포넌트
3. 헤더 컴포넌트 (44px 높이)
4. 하단 네비게이션 (채팅, 대시보드, 목록, 설정)

### Step 5: 인증 UI 페이지
1. PIN 입력 컴포넌트
   - 4자리 숫자 입력
   - 자동 포커스 이동
   - 붙여넣기 지원
   - 에러 애니메이션
2. PIN 설정 페이지 (/setup)
   - 2단계: 입력 → 확인
   - 불일치 시 재입력
3. 로그인 페이지 (/login)
   - PIN 설정 여부 체크
   - 실패 시 남은 시도 횟수 표시
4. 채팅 페이지 스텁 (/chat)

### Step 6: 테스트 및 검증
1. `npm run dev` - 개발 서버 실행
2. `npx prisma studio` - DB 연결 확인
3. PIN 설정 플로우 테스트
4. PIN 인증 플로우 테스트
5. `npm run build` - 빌드 성공 확인
6. Git 커밋 및 푸시

---

## 디렉토리 구조

```
contract_MVP/
├── .env                          # 환경변수
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── .prettierrc
├── prisma/
│   └── schema.prisma
└── src/
    ├── app/
    │   ├── layout.tsx            # 루트 레이아웃
    │   ├── globals.css           # Tailwind v4 테마
    │   ├── page.tsx              # 루트 (리다이렉트)
    │   ├── setup/
    │   │   └── page.tsx          # PIN 설정
    │   ├── login/
    │   │   └── page.tsx          # 로그인
    │   ├── (authenticated)/
    │   │   ├── layout.tsx        # 인증 레이아웃
    │   │   └── chat/
    │   │       └── page.tsx      # 채팅 (스텁)
    │   └── api/
    │       └── auth/
    │           ├── setup/route.ts
    │           └── verify/route.ts
    ├── components/
    │   ├── ui/
    │   │   ├── button.tsx
    │   │   ├── input.tsx
    │   │   └── card.tsx
    │   ├── layout/
    │   │   ├── mobile-layout.tsx
    │   │   ├── header.tsx
    │   │   └── bottom-nav.tsx
    │   └── auth/
    │       └── pin-input.tsx
    ├── lib/
    │   ├── prisma.ts             # Edge 호환 Prisma
    │   ├── auth.ts               # 인증 유틸리티
    │   ├── utils.ts              # 공통 함수
    │   └── constants.ts          # 상수 정의
    ├── middleware.ts             # 인증 미들웨어
    └── types/
        └── index.ts
```

---

## 핵심 파일 설명

### prisma/schema.prisma
- 5개 모델: Contract, Note, ChangeLog, Config, Auth
- Enum: Category, Method, Status, Action
- Edge 호환: previewFeatures = ["driverAdapters"]

### src/lib/prisma.ts
```typescript
// @neondatabase/serverless + @prisma/adapter-neon 사용
// neonConfig.fetchConnectionCache = true 설정
```

### src/lib/auth.ts
```typescript
// Web Crypto API 기반 (Edge Runtime 호환)
// SHA-256 해싱 (AUTH_SECRET 솔트)
// httpOnly 쿠키 세션 (7일 만료)
```

### src/middleware.ts
```typescript
// 공개 경로: /login, /setup, /api/auth/*
// 세션 쿠키 없으면 /login 리다이렉트
```

---

## 인증 플로우

```
최초 접속 → auth 테이블 확인
  ├── 레코드 없음 → /setup (PIN 설정)
  └── 레코드 있음 → 세션 확인
        ├── 세션 없음 → /login (PIN 인증)
        └── 세션 있음 → /chat
```

---

## 검증 체크리스트

- [ ] Next.js 15 프로젝트 초기화
- [ ] Tailwind CSS v4 동작
- [ ] Prisma DB 연결 성공
- [ ] PIN 설정 API 동작
- [ ] PIN 인증 API 동작
- [ ] Rate Limiting 동작
- [ ] 미들웨어 리다이렉트 동작
- [ ] 모바일 레이아웃 표시
- [ ] 빌드 성공
- [ ] Git 커밋/푸시 완료

---

## 완료 기준
- 인증된 사용자만 접근 가능한 기본 앱 셸
- PIN 설정 및 인증 기능 완전 동작
- 모바일 최적화 레이아웃 (360px~428px)
- 화이트톤 세련된 UI

---

## 참고 사항
- GOOGLE_GENERATIVE_AI_API_KEY는 Phase 2 시작 전 추가 예정
- UI 제작 시 frontend-design 스킬 적용
- 모든 API 라우트는 Edge Runtime 사용
