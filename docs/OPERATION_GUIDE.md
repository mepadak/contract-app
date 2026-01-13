# Contract Manager Mobile - 운영 가이드

## 목차

1. [배포](#배포)
2. [환경 변수](#환경-변수)
3. [데이터베이스](#데이터베이스)
4. [모니터링](#모니터링)
5. [문제 해결](#문제-해결)
6. [보안](#보안)

---

## 배포

### Vercel 배포

이 프로젝트는 Vercel에 최적화되어 있습니다.

#### 1. Vercel 프로젝트 생성

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 연결
vercel link

# 배포
vercel --prod
```

#### 2. GitHub 연동 자동 배포

1. Vercel 대시보드에서 프로젝트 생성
2. GitHub 리포지토리 연결
3. main 브랜치 푸시 시 자동 배포

#### 3. 빌드 설정

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

### 빌드 명령어

```bash
# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버
npm run start

# 린트 검사
npm run lint
```

---

## 환경 변수

### 필수 환경 변수

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `DATABASE_URL` | Neon 풀링 연결 문자열 | `postgres://user:pass@host/db?sslmode=require` |
| `DIRECT_URL` | Neon 직접 연결 문자열 | `postgres://user:pass@host/db?sslmode=require` |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google Gemini API 키 | `AIza...` |
| `AUTH_SECRET` | PIN 해싱용 시크릿 | 32자 이상 랜덤 문자열 |

### 선택 환경 변수

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `NEXT_PUBLIC_APP_URL` | 앱 URL | `http://localhost:3000` |

### Vercel 환경 변수 설정

1. Vercel 대시보드 → Settings → Environment Variables
2. 각 환경 변수 추가 (Production, Preview, Development)
3. 재배포하여 적용

### 로컬 개발 환경

`.env` 파일 생성:

```env
DATABASE_URL="postgres://..."
DIRECT_URL="postgres://..."
GOOGLE_GENERATIVE_AI_API_KEY="..."
AUTH_SECRET="your-secret-key-at-least-32-characters"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 데이터베이스

### Vercel Postgres (Neon) 설정

#### 1. 프로비저닝

1. Vercel 대시보드 → Storage → Create Database
2. Postgres 선택
3. 리전 선택 (권장: 사용자와 가까운 리전)

#### 2. 연결 문자열 확인

- **DATABASE_URL**: Pooled connection (Edge 호환)
- **DIRECT_URL**: Direct connection (마이그레이션용)

### Prisma 설정

#### 스키마 푸시

```bash
npx prisma db push
```

#### 클라이언트 생성

```bash
npx prisma generate
```

#### 마이그레이션 (개발)

```bash
npx prisma migrate dev --name migration_name
```

#### 마이그레이션 (프로덕션)

```bash
npx prisma migrate deploy
```

### 데이터베이스 관리

#### Prisma Studio (로컬)

```bash
npx prisma studio
```

브라우저에서 `http://localhost:5555` 접속

#### SQL 직접 실행

Vercel 대시보드 또는 Neon 콘솔에서 SQL 쿼리 실행

### 데이터 모델

```
contracts     - 계약 정보
notes         - 계약 메모
change_logs   - 변경 이력
configs       - 설정 (예산, ID 카운터)
auth          - 인증 (PIN 해시)
```

---

## 모니터링

### Vercel Analytics

1. Vercel 대시보드 → Analytics
2. Web Vitals (LCP, FID, CLS) 확인
3. 페이지별 성능 분석

### Edge Function 로그

1. Vercel 대시보드 → Functions
2. Real-time Logs 확인
3. 에러 및 지연 시간 모니터링

### 성능 지표

| 지표 | 목표 |
|------|------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3.0s |
| Cumulative Layout Shift | < 0.1 |
| API 응답 시간 (P95) | < 500ms |

### 알림 설정

Vercel 대시보드에서 다음 알림 설정:

- 배포 실패
- 빌드 에러
- 함수 에러율 증가

---

## 문제 해결

### 일반적인 문제

#### 빌드 실패

```bash
# 캐시 삭제 후 재빌드
rm -rf .next node_modules
npm install
npm run build
```

#### Prisma 클라이언트 에러

```bash
# 클라이언트 재생성
npx prisma generate
```

#### 데이터베이스 연결 실패

1. `DATABASE_URL` 확인
2. IP 허용 목록 확인 (Neon)
3. SSL 설정 확인 (`?sslmode=require`)

### Edge Runtime 에러

#### "Dynamic server usage" 에러

- 서버 컴포넌트에서 `cookies()`, `headers()` 사용 시 발생
- `'use client'` 추가 또는 API 라우트로 분리

#### 타임아웃

- Edge 함수 제한: 30초
- 복잡한 쿼리 최적화 필요

### AI 관련 에러

#### "API key invalid"

- `GOOGLE_GENERATIVE_AI_API_KEY` 확인
- API 키 활성화 상태 확인

#### "Rate limit exceeded"

- Gemini API 할당량 확인
- 요청 빈도 제한 구현

### 인증 에러

#### PIN 입력 5회 실패

- 잠금 해제까지 대기 (1분)
- 데이터베이스에서 실패 카운트 초기화

#### 세션 만료

- 쿠키 설정 확인
- `AUTH_SECRET` 변경 여부 확인

---

## 보안

### 보안 헤더

`next.config.ts`에 설정된 보안 헤더:

```typescript
headers: [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]
```

### 인증

- PIN은 bcrypt로 해싱하여 저장
- 세션 토큰은 httpOnly 쿠키로 관리
- 5회 연속 실패 시 일시 잠금

### 데이터 보호

- 모든 API 통신은 HTTPS
- 데이터베이스 연결은 SSL/TLS
- 민감 정보는 환경 변수로 관리

### 접근 제어

- 미들웨어로 인증 체크
- API 엔드포인트별 권한 검증
- Soft Delete로 데이터 보존

### 권장 사항

1. `AUTH_SECRET`은 정기적으로 교체
2. API 키는 최소 권한 원칙 적용
3. 프로덕션 환경에서 디버그 로그 비활성화
4. 정기적인 보안 업데이트

---

## 백업 및 복구

### 데이터베이스 백업

Neon/Vercel Postgres는 자동 백업 제공:

- Point-in-time Recovery (PITR)
- 일일 스냅샷

### 수동 백업

```bash
# pg_dump 사용 (DIRECT_URL 필요)
pg_dump $DIRECT_URL > backup.sql
```

### 복구

```bash
# SQL 파일 복원
psql $DIRECT_URL < backup.sql
```

---

## 지원

문제가 지속되면 다음을 확인하세요:

1. [Vercel 상태 페이지](https://www.vercel-status.com/)
2. [Neon 상태 페이지](https://neonstatus.com/)
3. [Google AI 상태](https://status.cloud.google.com/)

기술 지원이 필요하면 프로젝트 관리자에게 문의하세요.
