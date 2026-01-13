# Contract Manager Mobile

국가기관 계약담당관을 위한 모바일 우선 웹 애플리케이션. 자연어 채팅 인터페이스로 계약 업무를 관리합니다.

## 기술 스택

- **프레임워크**: Next.js 15 (App Router, React Server Components)
- **UI**: React 19, Tailwind CSS 4, Lucide React 아이콘
- **AI**: Vercel AI SDK 4.x + Google Gemini (gemini-1.5-flash)
- **데이터베이스**: Vercel Postgres + Prisma 6.x (Edge 호환)
- **런타임**: Vercel Edge Runtime
- **언어**: TypeScript 5.x

## 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 변수를 설정합니다:

```env
# Database (Neon/Vercel Postgres)
DATABASE_URL="postgres://..."
DIRECT_URL="postgres://..."

# Google Gemini AI
GOOGLE_GENERATIVE_AI_API_KEY="..."

# Authentication
AUTH_SECRET="..."

# App URL
NEXT_PUBLIC_APP_URL="https://..."
```

### 3. 데이터베이스 설정

```bash
npx prisma db push
npx prisma generate
```

### 4. 개발 서버 실행

```bash
npm run dev
```

앱이 `http://localhost:3000`에서 실행됩니다.

### 5. 프로덕션 빌드

```bash
npm run build
npm run start
```

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── (authenticated)/    # 인증 필요 페이지
│   │   ├── chat/          # 채팅 인터페이스
│   │   ├── contracts/     # 계약 목록
│   │   ├── dashboard/     # 대시보드
│   │   └── settings/      # 설정
│   ├── api/               # Edge Runtime API
│   │   ├── chat/          # AI 채팅
│   │   ├── contracts/     # 계약 CRUD
│   │   ├── dashboard/     # 통계
│   │   └── auth/          # 인증
│   ├── login/             # 로그인
│   └── setup/             # 초기 설정
├── components/            # React 컴포넌트
├── lib/                   # 유틸리티 및 설정
└── hooks/                 # React 훅
```

## API 엔드포인트

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/chat` | POST | AI 채팅 (스트리밍) |
| `/api/contracts` | GET | 계약 목록 조회 |
| `/api/contracts` | POST | 계약 생성 |
| `/api/contracts/[id]` | GET | 계약 상세 조회 |
| `/api/contracts/[id]` | PATCH | 계약 수정 |
| `/api/contracts/[id]` | DELETE | 계약 삭제 (Soft Delete) |
| `/api/contracts/[id]/notes` | GET | 메모 목록 |
| `/api/contracts/[id]/notes` | POST | 메모 추가 |
| `/api/dashboard` | GET | 대시보드 통계 |
| `/api/config` | GET/PUT | 설정 조회/수정 |
| `/api/auth/setup` | POST | PIN 설정 |
| `/api/auth/verify` | POST | PIN 인증 |

### 계약 목록 조회 파라미터

```
GET /api/contracts?status=진행중&category=용역&method=일반경쟁&limit=20&offset=0&sortBy=updatedAt&sortOrder=desc
```

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| status | string | 상태 필터 (시작 전, 진행 중, 대기, 지연, 완료) |
| category | string | 종류 필터 (물품(구매), 물품(제조), 용역, 공사) |
| method | string | 방법 필터 (일반경쟁, 제한경쟁, 지명경쟁, 공개수의, 비공개수의) |
| search | string | 키워드 검색 |
| limit | number | 페이지 크기 (기본: 20) |
| offset | number | 오프셋 (기본: 0) |
| sortBy | string | 정렬 기준 (createdAt, updatedAt, deadline, amount) |
| sortOrder | string | 정렬 순서 (asc, desc) |

### 대시보드 응답 예시

```json
{
  "budget": {
    "total": 5000000000,
    "allocated": 1760000000,
    "executed": 820000000,
    "remaining": 3240000000,
    "executionRate": 16.4
  },
  "statusSummary": {
    "시작 전": { "count": 3, "amount": 350000000 },
    "진행 중": { "count": 12, "amount": 1410000000 },
    "대기": { "count": 2, "amount": 180000000 },
    "지연": { "count": 1, "amount": 50000000 },
    "완료": { "count": 8, "amount": 820000000 }
  },
  "alerts": [
    {
      "contractId": "C26-015",
      "title": "네트워크 장비 구매",
      "level": "critical",
      "reason": "마감 D-2",
      "deadline": "2026-01-14"
    }
  ]
}
```

## 자연어 명령어

채팅 인터페이스에서 다음과 같은 자연어 명령을 사용할 수 있습니다:

### 계약 관리

```
"서버 유지보수 용역 5천만원 일반경쟁 등록해줘"
"전체 목록 보여줘"
"진행중인 계약"
"C26-001 상세"
"C26-001 공고중으로 변경"
"C26-001 메모: 규격서 검토 완료"
"C26-001 삭제"
```

### 현황 조회

```
"대시보드"
"예산 현황"
"지연된 계약"
```

### 설정

```
"예산 50억 설정"
```

## 계약 단계

### 경쟁입찰 (일반경쟁, 제한경쟁, 지명경쟁, 공개수의)

```
공고준비 → 공고중 → 개찰완료 → 계약준비 → 계약완료 → 지출준비 → 집행완료
```

### 비공개수의

```
계약준비 → 계약완료 → 지출준비 → 집행완료
```

## 계약 상태

| 상태 | 설명 |
|------|------|
| 시작 전 | 아직 시작하지 않은 계약 |
| 진행 중 | 진행 중인 계약 |
| 대기 | 일시 중지된 계약 |
| 지연 | 지연된 계약 |
| 완료 | 완료된 계약 |
| 삭제 | 소프트 삭제된 계약 |

## 라이선스

MIT License
