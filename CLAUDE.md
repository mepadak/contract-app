# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소에서 작업할 때 참고하는 가이드입니다.

## 프로젝트 개요

Contract Manager Mobile - 국가기관 계약담당관을 위한 모바일 우선 웹 애플리케이션. 자연어 채팅 인터페이스로 계약 업무를 관리합니다. Next.js 15, React 19, Google Gemini AI 기반.

## 기술 스택

- **프레임워크**: Next.js 15 (App Router, React Server Components)
- **UI**: React 19, Tailwind CSS 4, Lucide React 아이콘
- **AI**: Vercel AI SDK 6.x + Google Gemini (gemini-1.5-flash)
- **데이터베이스**: Vercel Postgres + Prisma 6.x (Edge 호환: @prisma/adapter-neon)
- **런타임**: 모든 API 라우트에 Vercel Edge Runtime 사용
- **언어**: TypeScript 5.x

## 빌드 명령어

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# Prisma 마이그레이션 실행
npx prisma migrate dev

# Prisma 클라이언트 생성
npx prisma generate

# 스키마를 데이터베이스에 푸시
npx prisma db push
```

## 아키텍처

### Edge Runtime 설정

모든 API 라우트는 Edge Runtime에서 실행됩니다. Prisma는 Edge 호환 설정이 필요합니다:

```typescript
// lib/prisma.ts
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';

neonConfig.fetchConnectionCache = true;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaNeon(pool);
export const prisma = new PrismaClient({ adapter });
```

### API 라우트

| 라우트 | 용도 |
|--------|------|
| `/api/chat` | Gemini AI 채팅, 의도 파싱, 스트리밍 응답 |
| `/api/contracts` | 계약 CRUD 작업 |
| `/api/contracts/[id]` | 단일 계약 조회/수정/삭제 |
| `/api/contracts/[id]/notes` | 계약 메모 추가 |
| `/api/dashboard` | 예산 현황, 상태별 통계, 주의 계약 |
| `/api/config` | 앱 설정 (연간 예산 등) |
| `/api/auth/verify` | PIN 인증 |
| `/api/auth/setup` | 최초 PIN 설정 |

### 데이터 모델

- **Contract**: 계약 정보. ID 형식은 `C{YY}-{NNN}` (예: C26-001)
- **Note**: 계약에 첨부되는 메모. 태그 자동 추출
- **ChangeLog**: 모든 계약 변경 이력
- **Config**: 키-값 설정 (연간 예산, ID 카운터)
- **Auth**: PIN 해시 저장

### 계약 단계

경쟁입찰 (일반경쟁, 제한경쟁, 지명경쟁, 공개수의):
`공고준비 → 공고중 → 개찰완료 → 계약준비 → 계약완료 → 지출준비 → 집행완료`

비공개수의:
`계약준비 → 계약완료 → 지출준비 → 집행완료`

### 계약 상태

- **시작 전** (BEFORE_START): 아직 시작하지 않은 계약
- **진행 중** (IN_PROGRESS): 진행 중인 계약
- **대기** (WAITING): 일시 중지된 계약
- **지연** (DELAYED): 지연된 계약
- **완료** (COMPLETED): 완료된 계약
- **삭제** (DELETED): 소프트 삭제된 계약

## 환경 변수

```env
DATABASE_URL="postgres://..."      # Neon 풀링 연결 문자열
DIRECT_URL="postgres://..."        # Neon 직접 연결 문자열
GOOGLE_GENERATIVE_AI_API_KEY="..." # Gemini API 키
AUTH_SECRET="..."                  # PIN 해싱용 시크릿
NEXT_PUBLIC_APP_URL="https://..."  # 앱 URL
```

## 구현 시 주의사항

- 모바일 우선 설계: 360px~428px 뷰포트 기준
- 모든 변경 작업은 미리보기 후 사용자 확인 필요
- 한국어 금액 파싱: "5천만원" → 50,000,000, "5억" → 500,000,000
- 채팅은 최근 10개 메시지 컨텍스트 유지 (대명사 참조 해결용)
- 계약 삭제는 Soft Delete (상태만 "삭제"로 변경, 데이터 유지)
- 모든 계약 변경 시 ChangeLog 기록 필수
