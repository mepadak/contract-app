# PRD: 국가계약 업무 관리 모바일 웹앱

**Product Requirements Document - Mobile Web Application**

**버전**: 1.0
**작성일**: 2026-01-12
**문서 유형**: MVP (Minimum Viable Product)

---

## 1. 개요 (Overview)

### 1.1 제품명
**Contract Manager Mobile** - 국가계약 업무 관리 모바일 웹앱

### 1.2 제품 비전
국가기관 계약담당관이 모바일 환경에서 자연어 채팅을 통해 계약업무를 직관적으로 관리할 수 있는 웹 애플리케이션

### 1.3 MVP 범위
본 문서는 MVP(최소 기능 제품) 구현을 위한 요구사항을 정의합니다.

**MVP 포함 기능:**
- 자연어 기반 계약 생성/조회/수정/삭제
- 계약 단계 및 상태 관리
- 대시보드 (예산 현황, 상태별 분포)
- PIN 기반 간편 인증
- 메모 추가 기능

**MVP 제외 기능 (향후 버전):**
- RAG 기반 문서/법령 검색
- 알림 푸시 (PWA)
- 다중 사용자 및 권한 관리
- 데이터 내보내기/가져오기

### 1.4 대상 사용자
| 구분 | 설명 |
|------|------|
| Primary | 국가기관 계약담당관 (계약업무 담당 공무원) |
| Secondary | 계약요청부서 담당자 |

### 1.5 사용 환경
- **디바이스**: 스마트폰 (iOS, Android)
- **브라우저**: Chrome, Safari, Samsung Internet
- **화면 크기**: 360px ~ 428px (모바일 최적화)
- **네트워크**: LTE/5G, WiFi

### 1.6 핵심 가치 제안
1. **자연어 인터랙션**: "서버 유지보수 5천만원 등록해줘"와 같은 자연스러운 대화
2. **모바일 우선**: 이동 중에도 계약 현황 확인 및 업무 처리
3. **실시간 현황**: 예산 집행률, 주의 필요 계약 즉시 파악
4. **빠른 응답**: Edge Runtime 기반 저지연 응답

---

## 2. 시스템 아키텍처

### 2.1 전체 구성도

```
┌─────────────────────────────────────────────────────────────────────┐
│                         사용자 (모바일 브라우저)                        │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │ HTTPS
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Vercel Edge Network                          │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                     Next.js 15 (App Router)                    │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │  │
│  │  │   Pages     │  │ Components  │  │     Server Actions      │ │  │
│  │  │  (RSC)      │  │  (Client)   │  │                         │ │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                  │                                   │
│  ┌───────────────────────────────┴───────────────────────────────┐  │
│  │                    API Routes (Edge Runtime)                   │  │
│  │  ┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌───────────┐  │  │
│  │  │/api/chat │  │/api/contracts│  │/api/dash │  │/api/auth  │  │  │
│  │  │(Gemini)  │  │   (CRUD)     │  │ board    │  │  (PIN)    │  │  │
│  │  └────┬─────┘  └──────┬───────┘  └────┬─────┘  └─────┬─────┘  │  │
│  └───────┼───────────────┼───────────────┼──────────────┼────────┘  │
└──────────┼───────────────┼───────────────┼──────────────┼───────────┘
           │               │               │              │
           ▼               └───────────────┴──────────────┘
┌──────────────────┐                       │
│  Google Gemini   │                       ▼
│  (gemini-1.5-    │       ┌───────────────────────────────┐
│   flash)         │       │      Vercel Postgres          │
└──────────────────┘       │  (Neon Serverless Driver)     │
                           │  ┌─────────┐ ┌─────────────┐  │
                           │  │contracts│ │ change_logs │  │
                           │  ├─────────┤ ├─────────────┤  │
                           │  │ notes   │ │   configs   │  │
                           │  ├─────────┤ ├─────────────┤  │
                           │  │  auth   │ │             │  │
                           │  └─────────┘ └─────────────┘  │
                           └───────────────────────────────┘
```

### 2.2 데이터 흐름

#### 2.2.1 자연어 계약 생성 흐름
```
1. 사용자 입력: "서버 유지보수 용역 5천만원 일반경쟁 등록"
       │
       ▼
2. /api/chat (Edge)
   - Gemini로 의도 파싱
   - 구조화된 데이터 추출
       │
       ▼
3. 미리보기 응답 생성
   - 파싱된 정보 확인 요청
   - 사용자에게 스트리밍 응답
       │
       ▼
4. 사용자 확인: "확인"
       │
       ▼
5. /api/contracts (Edge)
   - Vercel Postgres에 계약 저장
   - 변경 로그 기록
       │
       ▼
6. 완료 응답: "C26-0001 계약이 생성되었습니다."
```

#### 2.2.2 대시보드 조회 흐름
```
1. 사용자 입력: "대시보드"
       │
       ▼
2. /api/chat (Edge)
   - 의도 파악: 대시보드 조회
       │
       ▼
3. /api/dashboard (Edge)
   - 예산 현황 집계
   - 상태별 계약 건수/금액
   - 주의 필요 계약 필터링
       │
       ▼
4. 대시보드 UI 컴포넌트 렌더링
```

### 2.3 Edge Runtime 아키텍처

모든 API가 Edge Runtime에서 실행됩니다.

```
┌─────────────────────────────────────────────────────────┐
│                    Edge Runtime 특성                     │
├─────────────────────────────────────────────────────────┤
│ 장점                          │ 제약사항                  │
├───────────────────────────────┼─────────────────────────┤
│ • 글로벌 저지연 (~50ms)        │ • 실행시간 제한 (30초)   │
│ • 콜드스타트 거의 없음         │ • 메모리 128MB          │
│ • 자동 스케일링               │ • Node.js 일부 API 제한  │
│ • 비용 효율적                 │ • 특수 DB 어댑터 필요    │
└───────────────────────────────┴─────────────────────────┘

대응 전략:
• Prisma + @prisma/adapter-neon 사용
• @neondatabase/serverless 드라이버
• 복잡한 쿼리는 단일 SQL로 최적화
• 스트리밍 응답으로 체감 속도 향상
```

---

## 3. 기술 스택

### 3.1 프론트엔드

| 기술 | 버전 | 용도 | 선택 이유 |
|------|------|------|----------|
| Next.js | 15.x | 프레임워크 | App Router, RSC, Vercel 최적화 |
| React | 19.x | UI 라이브러리 | 최신 기능 (use, Actions) |
| Tailwind CSS | 4.x | 스타일링 | 유틸리티 기반, 빠른 개발 |
| TypeScript | 5.x | 타입 시스템 | 타입 안정성, 개발 생산성 |
| Lucide React | latest | 아이콘 | 경량, 트리쉐이킹 지원 |

### 3.2 백엔드

| 기술 | 버전 | 용도 | 선택 이유 |
|------|------|------|----------|
| Vercel AI SDK | 4.x | AI 통합 | 스트리밍, 다중 모델 지원 |
| @ai-sdk/google | latest | Gemini 연동 | 공식 SDK |
| Edge Runtime | - | 서버 런타임 | 저지연, 글로벌 배포 |

### 3.3 데이터베이스

| 기술 | 버전 | 용도 | 선택 이유 |
|------|------|------|----------|
| Vercel Postgres | - | 데이터 저장 | Vercel 통합, Edge 호환 |
| Prisma | 6.x | ORM | 타입 안정성, 마이그레이션 |
| @prisma/adapter-neon | latest | Edge 어댑터 | Edge Runtime 호환 |
| @neondatabase/serverless | latest | DB 드라이버 | HTTP 기반 연결 |

### 3.4 LLM

| 기술 | 모델 | 용도 | 선택 이유 |
|------|------|------|----------|
| Google Gemini | gemini-1.5-flash | 자연어 처리 | 빠른 응답, 비용 효율 |

### 3.5 인프라

| 기술 | 용도 | 선택 이유 |
|------|------|----------|
| Vercel | 호스팅/배포 | Next.js 최적화, Edge Network |
| GitHub | 소스 관리 | Vercel 자동 배포 연동 |

### 3.6 패키지 의존성

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@ai-sdk/google": "^1.0.0",
    "ai": "^4.0.0",
    "@prisma/client": "^6.0.0",
    "@prisma/adapter-neon": "^6.0.0",
    "@neondatabase/serverless": "^0.10.0",
    "lucide-react": "^0.400.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.0.0",
    "prisma": "^6.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0"
  }
}
```

### 3.7 환경 변수

```env
# Database
DATABASE_URL="postgres://..."
DIRECT_URL="postgres://..."

# LLM
GOOGLE_GENERATIVE_AI_API_KEY="..."

# Auth
AUTH_SECRET="..."  # PIN 해싱용

# App
NEXT_PUBLIC_APP_URL="https://..."
```

---

## 4. 기능 요구사항 (Functional Requirements)

### 4.1 인증 (Authentication)

#### FR-4.1.1 PIN 설정
- **설명**: 최초 접속 시 4자리 PIN 설정
- **입력**: 4자리 숫자
- **처리**:
  - PIN 해싱 (bcrypt)
  - DB에 저장
- **출력**: 설정 완료 메시지

#### FR-4.1.2 PIN 인증
- **설명**: 앱 접속 시 PIN 입력으로 인증
- **입력**: 4자리 숫자
- **처리**:
  - 해시 비교
  - 세션 토큰 발급 (httpOnly 쿠키)
  - 실패 시 재시도 (최대 5회)
- **출력**: 메인 화면 이동 또는 오류 메시지

### 4.2 자연어 채팅 인터페이스

#### FR-4.2.1 메시지 전송
- **설명**: 사용자가 자연어로 명령 입력
- **입력**: 텍스트 메시지
- **처리**:
  - Gemini로 의도 파싱
  - 적절한 액션 실행
- **출력**: 스트리밍 응답

#### FR-4.2.2 의도 분류
Gemini가 다음 의도를 분류합니다:

| 의도 | 예시 입력 | 실행 액션 |
|------|----------|----------|
| CREATE_CONTRACT | "서버 유지보수 5천만원 등록" | 계약 생성 플로우 |
| LIST_CONTRACTS | "전체 목록", "진행중인 계약" | 계약 목록 조회 |
| VIEW_CONTRACT | "C26-001 상세", "서버 계약 보여줘" | 계약 상세 조회 |
| UPDATE_STAGE | "C26-001 공고중으로 변경" | 단계 변경 |
| UPDATE_STATUS | "C26-001 지연으로 변경" | 상태 변경 |
| ADD_NOTE | "C26-001에 메모 추가" | 메모 추가 |
| DELETE_CONTRACT | "C26-001 삭제" | 계약 삭제 |
| VIEW_DASHBOARD | "대시보드", "현황" | 대시보드 조회 |
| SET_BUDGET | "예산 50억 설정" | 연간 예산 설정 |
| HELP | "도움말", "뭐할 수 있어?" | 사용법 안내 |
| UNKNOWN | 분류 불가 | 재질문 |

#### FR-4.2.3 컨텍스트 유지
- **설명**: 대화 맥락 유지
- **처리**:
  - 최근 10개 메시지 컨텍스트 유지
  - "그거" → 마지막 언급 계약 참조
- **예시**:
  ```
  사용자: "C26-001 보여줘"
  시스템: [C26-001 상세 표시]
  사용자: "공고중으로 변경해줘"  ← "C26-001" 생략 가능
  시스템: [C26-001 단계 변경]
  ```

### 4.3 계약 관리

#### FR-4.3.1 계약 생성
- **설명**: 새로운 계약 등록
- **입력 (자연어에서 추출)**:

| 필드 | 필수 | 추출 예시 |
|------|------|----------|
| 계약명 | Y | "서버 유지보수" |
| 계약종류 | Y | "용역", "물품", "공사" |
| 계약방법 | Y | "일반경쟁", "수의계약" |
| 금액 | N | "5천만원" → 50,000,000 |
| 요청부서 | N | "정보화담당관실" |
| 마감일 | N | "3월말까지" → 2026-03-31 |

- **처리**:
  1. 자연어 파싱
  2. 필수 정보 누락 시 추가 질문
  3. 미리보기 표시
  4. 사용자 확인 후 저장
  5. ID 자동 생성: C{YY}-{NNN}
  6. 초기 상태: "시작 전"
  7. 초기 단계: 계약방법에 따라 결정

- **계약방법별 초기 단계**:
  | 계약방법 | 초기 단계 |
  |---------|----------|
  | 일반경쟁, 제한경쟁, 지명경쟁, 공개수의 | 공고준비 |
  | 비공개수의 | 계약준비 |

#### FR-4.3.2 계약 목록 조회
- **설명**: 계약 목록 표시
- **필터 옵션**:
  - 상태: 시작 전, 진행 중, 대기, 지연, 완료
  - 종류: 물품(구매), 물품(제조), 용역, 공사
  - 방법: 일반경쟁, 제한경쟁, 지명경쟁, 공개수의, 비공개수의
  - 기간: 마감일 기준
- **정렬**: 최신순 (기본), 마감일순, 금액순
- **출력**: 계약 카드 리스트

#### FR-4.3.3 계약 상세 조회
- **설명**: 특정 계약의 전체 정보 표시
- **입력**: 계약 ID 또는 계약명 (부분 일치)
- **출력**:
  - 기본 정보 (ID, 계약명, 종류, 방법, 금액)
  - 진행 정보 (상태, 현재 단계, 진행률)
  - 관련 정보 (요청부서, 계약상대방, 마감일)
  - 메모 목록 (최신순)
  - 변경 이력

#### FR-4.3.4 계약 단계 변경
- **설명**: 계약의 진행 단계 변경
- **입력**: 계약 ID, 변경할 단계
- **처리**:
  1. 현재 단계 확인
  2. 계약방법에 맞는 유효 단계 검증
  3. 미리보기 표시
  4. 사용자 확인 후 변경
  5. 변경 로그 기록
  6. 상태 자동 업데이트 (필요 시)

- **단계 진행 규칙**:
  ```
  경쟁입찰 (일반/제한/지명) 및 공개수의:
  공고준비 → 공고중 → 개찰완료 → 계약준비 → 계약완료 → 지출준비 → 집행완료

  비공개수의:
  계약준비 → 계약완료 → 지출준비 → 집행완료
  ```

- **상태 자동 변경 규칙**:
  | 단계 변경 | 상태 변경 |
  |----------|----------|
  | → 공고준비/계약준비 | 시작 전 → 진행 중 |
  | → 집행완료 | → 완료 |

#### FR-4.3.5 계약 상태 변경
- **설명**: 계약의 상태 수동 변경
- **유효 상태**: 시작 전, 진행 중, 대기, 지연, 완료
- **처리**:
  1. 미리보기 표시
  2. 사용자 확인 후 변경
  3. 변경 로그 기록

#### FR-4.3.6 계약상대방 설정
- **설명**: 낙찰업체 정보 입력
- **입력**: 계약 ID, 업체명
- **처리**: 미리보기 → 확인 → 저장 → 로그 기록

#### FR-4.3.7 메모 추가
- **설명**: 계약에 메모 기록
- **입력**: 계약 ID, 메모 내용
- **처리**:
  1. 타임스탬프 자동 생성
  2. 키워드 자동 추출 (Gemini)
  3. 미리보기 표시
  4. 사용자 확인 후 저장

#### FR-4.3.8 계약 삭제
- **설명**: 계약 삭제 (Soft Delete)
- **처리**:
  1. 삭제 확인 요청
  2. status를 "삭제"로 변경
  3. 목록에서 제외 (데이터는 유지)
  4. 변경 로그 기록

#### FR-4.3.9 계약 검색
- **설명**: 조건에 맞는 계약 검색
- **검색 조건**:
  - 키워드 (계약명, 요청부서, 계약상대방)
  - 상태/단계
  - 금액 범위
  - 마감일 범위

### 4.4 예산 관리

#### FR-4.4.1 연간 예산 설정
- **설명**: 연간 총 예산 설정/수정
- **입력**: 금액 (자연어)
- **파싱 예시**:
  | 입력 | 변환 결과 |
  |------|----------|
  | "50억" | 5,000,000,000 |
  | "5000만원" | 50,000,000 |
  | "1.5억" | 150,000,000 |
- **처리**: 미리보기 → 확인 → 저장 → 로그 기록

#### FR-4.4.2 예산 현황 조회
- **출력 항목**:
  | 항목 | 계산 방법 |
  |------|----------|
  | 연간 총 예산 | configs 테이블에서 조회 |
  | 배정 예산 | 진행 중 계약 금액 합계 |
  | 집행 예산 | 완료 계약 금액 합계 |
  | 잔여 예산 | 총 예산 - 배정 예산 |

### 4.5 대시보드

#### FR-4.5.1 대시보드 조회
- **출력 구성**:

```
┌─────────────────────────────────────┐
│         예산 집행 현황               │
│  ███████████░░░░░░░░░  35.2%       │
│  배정: 17.6억 / 집행: 8.2억          │
│  잔여: 32.4억                       │
├─────────────────────────────────────┤
│         상태별 현황                  │
│  ┌─────┬─────┬─────┬─────┬─────┐  │
│  │시작전│진행중│대기 │지연 │완료 │  │
│  │  3  │  12 │  2  │  1  │  8  │  │
│  └─────┴─────┴─────┴─────┴─────┘  │
├─────────────────────────────────────┤
│         주의 필요 계약               │
│  🔴 C26-015 마감 D-2               │
│  🟡 C26-012 마감 D-5               │
│  🔴 C26-008 상태: 지연              │
└─────────────────────────────────────┘
```

#### FR-4.5.2 주의 계약 판정
| 조건 | 레벨 | 표시 |
|------|------|------|
| 마감일 D-3 이내 | 경고 | 🔴 |
| 마감일 D-7 이내 | 주의 | 🟡 |
| 상태 "지연" | 경고 | 🔴 |
| 상태 "대기" 7일 이상 | 주의 | 🟡 |

### 4.6 도움말

#### FR-4.6.1 사용법 안내
```markdown
사용 가능한 명령어:

📝 계약 관리
• "서버 유지보수 용역 5천만원 일반경쟁 등록"
• "전체 목록" / "진행중인 계약"
• "C26-001 상세"
• "C26-001 공고중으로 변경"
• "C26-001 메모: 규격서 검토 완료"
• "C26-001 삭제"

📊 현황 조회
• "대시보드"
• "예산 현황"

⚙️ 설정
• "예산 50억 설정"
```

---

## 5. 데이터 모델

### 5.1 ER 다이어그램

```
┌─────────────────┐       ┌─────────────────┐
│    contracts    │       │      notes      │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │───┐   │ id (PK)         │
│ title           │   │   │ contract_id(FK) │──┐
│ category        │   │   │ content         │  │
│ method          │   └──▶│ tags            │  │
│ requester       │       │ created_at      │  │
│ requester_contact       └─────────────────┘  │
│ budget_year     │                            │
│ amount          │       ┌─────────────────┐  │
│ contractor      │       │  change_logs    │  │
│ deadline        │       ├─────────────────┤  │
│ status          │       │ id (PK)         │  │
│ stage           │       │ contract_id     │◀─┘
│ created_at      │       │ action          │
│ updated_at      │       │ detail          │
└─────────────────┘       │ from_value      │
                          │ to_value        │
┌─────────────────┐       │ created_at      │
│     configs     │       └─────────────────┘
├─────────────────┤
│ id (PK)         │       ┌─────────────────┐
│ key (UNIQUE)    │       │      auth       │
│ value           │       ├─────────────────┤
│ updated_at      │       │ id (PK)         │
└─────────────────┘       │ pin_hash        │
                          │ created_at      │
                          └─────────────────┘
```

### 5.2 Prisma 스키마

```prisma
// prisma/schema.prisma

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Contract {
  id               String    @id // C26-001 형식
  title            String
  category         Category
  method           Method
  requester        String?
  requesterContact String?   @map("requester_contact")
  budgetYear       Int       @default(2026) @map("budget_year")
  amount           BigInt    @default(0)
  contractor       String?
  deadline         DateTime? @db.Date
  status           Status    @default(BEFORE_START)
  stage            String    @default("공고준비")
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")

  notes Note[]

  @@map("contracts")
}

model Note {
  id         Int      @id @default(autoincrement())
  contractId String   @map("contract_id")
  content    String
  tags       String[] @default([])
  createdAt  DateTime @default(now()) @map("created_at")

  contract Contract @relation(fields: [contractId], references: [id], onDelete: Cascade)

  @@map("notes")
}

model ChangeLog {
  id         Int      @id @default(autoincrement())
  contractId String?  @map("contract_id")
  action     Action
  detail     String?
  fromValue  String?  @map("from_value")
  toValue    String?  @map("to_value")
  createdAt  DateTime @default(now()) @map("created_at")

  @@map("change_logs")
}

model Config {
  id        Int      @id @default(autoincrement())
  key       String   @unique
  value     String
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("configs")
}

model Auth {
  id        Int      @id @default(1)
  pinHash   String   @map("pin_hash")
  createdAt DateTime @default(now()) @map("created_at")

  @@map("auth")
}

// Enums
enum Category {
  GOODS_PURCHASE   @map("물품(구매)")
  GOODS_MANUFACTURE @map("물품(제조)")
  SERVICE          @map("용역")
  CONSTRUCTION     @map("공사")
}

enum Method {
  OPEN_BID         @map("일반경쟁")
  RESTRICTED_BID   @map("제한경쟁")
  NOMINATED_BID    @map("지명경쟁")
  OPEN_NEGOTIATION @map("공개수의")
  PRIVATE_NEGOTIATION @map("비공개수의")
}

enum Status {
  BEFORE_START @map("시작 전")
  IN_PROGRESS  @map("진행 중")
  WAITING      @map("대기")
  DELAYED      @map("지연")
  COMPLETED    @map("완료")
  DELETED      @map("삭제")
}

enum Action {
  CREATE
  UPDATE
  STAGE
  STATUS
  NOTE
  DELETE
  BUDGET
}
```

### 5.3 Edge Runtime용 Prisma 설정

```typescript
// lib/prisma.ts
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';

// Edge Runtime에서 WebSocket 대신 fetch 사용
neonConfig.fetchConnectionCache = true;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaNeon(pool);

export const prisma = new PrismaClient({ adapter });
```

### 5.4 계약 단계 정의

```typescript
// lib/constants.ts
export const STAGES = {
  // 경쟁입찰 및 공개수의 (7단계)
  COMPETITIVE: [
    '공고준비',
    '공고중',
    '개찰완료',
    '계약준비',
    '계약완료',
    '지출준비',
    '집행완료',
  ],
  // 비공개수의 (4단계)
  PRIVATE: [
    '계약준비',
    '계약완료',
    '지출준비',
    '집행완료',
  ],
} as const;

export const METHOD_STAGES: Record<string, readonly string[]> = {
  '일반경쟁': STAGES.COMPETITIVE,
  '제한경쟁': STAGES.COMPETITIVE,
  '지명경쟁': STAGES.COMPETITIVE,
  '공개수의': STAGES.COMPETITIVE,
  '비공개수의': STAGES.PRIVATE,
};
```

---

## 6. API 설계

### 6.1 API 개요

| 엔드포인트 | 메서드 | 설명 | Runtime |
|-----------|--------|------|---------|
| /api/chat | POST | AI 채팅 | Edge |
| /api/contracts | GET | 계약 목록 | Edge |
| /api/contracts | POST | 계약 생성 | Edge |
| /api/contracts/[id] | GET | 계약 상세 | Edge |
| /api/contracts/[id] | PATCH | 계약 수정 | Edge |
| /api/contracts/[id] | DELETE | 계약 삭제 | Edge |
| /api/contracts/[id]/notes | POST | 메모 추가 | Edge |
| /api/dashboard | GET | 대시보드 | Edge |
| /api/config | GET/PUT | 설정 조회/수정 | Edge |
| /api/auth/verify | POST | PIN 인증 | Edge |
| /api/auth/setup | POST | PIN 설정 | Edge |

### 6.2 /api/chat

#### 요청
```typescript
POST /api/chat
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "서버 유지보수 5천만원 등록해줘" }
  ],
  "context": {
    "lastContractId": "C26-001"  // 최근 참조 계약 (optional)
  }
}
```

#### 응답 (Streaming)
```typescript
// Vercel AI SDK 스트리밍 응답
data: {"type": "text", "content": "다음 내용으로 계약을 등록할까요?\n\n"}
data: {"type": "text", "content": "- 계약명: 서버 유지보수\n"}
data: {"type": "text", "content": "- 종류: 용역\n"}
data: {"type": "tool_call", "name": "createContractPreview", "args": {...}}
data: [DONE]
```

#### Gemini 시스템 프롬프트
```typescript
const systemPrompt = `
당신은 국가기관 계약 관리 시스템의 AI 어시스턴트입니다.

## 역할
- 사용자의 자연어 입력을 이해하고 적절한 계약 관리 작업을 수행
- 불명확한 입력에 대해 친절하게 추가 질문
- 모든 변경 작업 전 미리보기 제공

## 사용 가능한 도구
1. createContract: 계약 생성
2. listContracts: 계약 목록 조회
3. getContract: 계약 상세 조회
4. updateStage: 단계 변경
5. updateStatus: 상태 변경
6. addNote: 메모 추가
7. deleteContract: 계약 삭제
8. getDashboard: 대시보드 조회
9. setBudget: 예산 설정

## 금액 파싱 규칙
- "5천만원" → 50,000,000
- "5000만" → 50,000,000
- "0.5억" → 50,000,000
- "5억" → 500,000,000

## 계약 종류 매핑
- "물품", "구매" → 물품(구매)
- "제조", "제작" → 물품(제조)
- "용역", "서비스" → 용역
- "공사", "시설" → 공사

## 계약 방법 매핑
- "경쟁입찰", "공개입찰", "일반경쟁" → 일반경쟁
- "제한", "제한경쟁" → 제한경쟁
- "지명", "지명경쟁" → 지명경쟁
- "공개수의" → 공개수의
- "수의계약", "수의", "비공개수의" → 비공개수의
`;
```

### 6.3 /api/contracts

#### GET - 목록 조회
```typescript
GET /api/contracts?status=진행중&limit=20&offset=0

// 응답
{
  "contracts": [
    {
      "id": "C26-001",
      "title": "서버 유지보수 용역",
      "category": "용역",
      "method": "일반경쟁",
      "amount": 50000000,
      "status": "진행 중",
      "stage": "공고중",
      "deadline": "2026-03-31",
      "updatedAt": "2026-01-12T09:00:00Z"
    }
  ],
  "total": 26,
  "hasMore": true
}
```

#### POST - 계약 생성
```typescript
POST /api/contracts
Content-Type: application/json

{
  "title": "서버 유지보수 용역",
  "category": "용역",
  "method": "일반경쟁",
  "amount": 50000000,
  "requester": "정보화담당관실",
  "deadline": "2026-03-31"
}

// 응답
{
  "id": "C26-001",
  "title": "서버 유지보수 용역",
  ...
  "createdAt": "2026-01-12T09:00:00Z"
}
```

### 6.4 /api/contracts/[id]

#### GET - 상세 조회
```typescript
GET /api/contracts/C26-001

// 응답
{
  "contract": {
    "id": "C26-001",
    "title": "서버 유지보수 용역",
    "category": "용역",
    "method": "일반경쟁",
    "amount": 50000000,
    "status": "진행 중",
    "stage": "공고중",
    "progress": 28,  // 진행률 (%)
    ...
  },
  "notes": [
    {
      "id": 1,
      "content": "규격서 검토 완료",
      "tags": ["규격서", "검토"],
      "createdAt": "2026-01-11T15:00:00Z"
    }
  ],
  "history": [
    {
      "action": "STAGE",
      "detail": "단계 변경",
      "from": "공고준비",
      "to": "공고중",
      "createdAt": "2026-01-12T09:00:00Z"
    }
  ]
}
```

#### PATCH - 수정
```typescript
PATCH /api/contracts/C26-001
Content-Type: application/json

{
  "stage": "개찰완료"
  // 또는
  "status": "지연"
  // 또는
  "contractor": "ABC 주식회사"
}

// 응답
{
  "success": true,
  "contract": { ... }
}
```

### 6.5 /api/dashboard

```typescript
GET /api/dashboard

// 응답
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

### 6.6 /api/auth

#### POST /api/auth/setup - PIN 설정
```typescript
POST /api/auth/setup
Content-Type: application/json

{ "pin": "1234" }

// 응답
{ "success": true }
```

#### POST /api/auth/verify - PIN 인증
```typescript
POST /api/auth/verify
Content-Type: application/json

{ "pin": "1234" }

// 성공 응답 (Set-Cookie 포함)
{ "success": true }

// 실패 응답
{ "success": false, "error": "PIN이 일치하지 않습니다", "remaining": 4 }
```

### 6.7 에러 응답 형식

```typescript
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "필수 필드가 누락되었습니다",
    "details": {
      "field": "title",
      "reason": "required"
    }
  }
}
```

| 에러 코드 | HTTP 상태 | 설명 |
|----------|----------|------|
| VALIDATION_ERROR | 400 | 입력값 검증 실패 |
| UNAUTHORIZED | 401 | 인증 필요 |
| NOT_FOUND | 404 | 리소스 없음 |
| CONFLICT | 409 | 중복/충돌 |
| INTERNAL_ERROR | 500 | 서버 오류 |

---

## 7. UI/UX 설계

### 7.1 디자인 원칙

1. **모바일 퍼스트**: 360px 기준 설계, 터치 친화적
2. **원핸드 UX**: 주요 버튼은 하단 배치
3. **채팅 중심**: 자연스러운 대화 흐름
4. **즉각적 피드백**: 로딩, 성공, 오류 상태 명확히
5. **컨텍스트 유지**: 이전 대화 맥락 시각화

[중요] UI 제작 시 반드시 클로드 스킬인 frontend-design을 적용하여 제작할 것. 전반적으로 화이트톤의 세련된 느낌으로 UI 구성

### 7.2 화면 구성

```
┌─────────────────────────────────────┐
│  📋 Contract Manager          [≡]  │  ← 헤더 (44px)
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🤖 안녕하세요! 무엇을 도와   │   │
│  │    드릴까요?                 │   │
│  └─────────────────────────────┘   │
│                                     │
│         ┌─────────────────────────┐ │
│         │ 서버 유지보수 5천만원   │ │  ← 채팅 영역
│         │ 등록해줘               │ │     (스크롤)
│         └─────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 다음 내용으로 등록할까요?    │   │
│  │ ┌─────────────────────────┐ │   │  ← 계약 카드
│  │ │ 📄 서버 유지보수         │ │   │
│  │ │ 용역 | 일반경쟁 | 5천만원 │ │   │
│  │ └─────────────────────────┘ │   │
│  │ [확인]  [수정]  [취소]      │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│ [전체목록] [대시보드] [예산]        │  ← 퀵 액션 (선택적)
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 메시지 입력...            [➤] │ │  ← 입력 영역
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│   💬      📊      📋      ⚙️      │  ← 하단 네비게이션
│  채팅   대시보드  목록    설정     │
└─────────────────────────────────────┘
```

### 7.3 주요 컴포넌트

#### 7.3.1 채팅 메시지 버블
```
사용자 메시지 (오른쪽 정렬):
┌─────────────────────────────────────┐
│                    ┌──────────────┐ │
│                    │ 메시지 내용  │ │
│                    │ 여러 줄 가능 │ │
│                    └──────────────┘ │
│                           12:30 PM  │
└─────────────────────────────────────┘

AI 메시지 (왼쪽 정렬):
┌─────────────────────────────────────┐
│ 🤖 ┌──────────────────────────┐    │
│    │ AI 응답 내용              │    │
│    │ 마크다운 지원             │    │
│    └──────────────────────────┘    │
│    12:31 PM                         │
└─────────────────────────────────────┘
```

#### 7.3.2 계약 카드
```
┌─────────────────────────────────────┐
│ C26-001                    [진행중] │
│ 서버 유지보수 용역                   │
├─────────────────────────────────────┤
│ 용역 | 일반경쟁 | ₩50,000,000       │
├─────────────────────────────────────┤
│ 📍 공고중  ━━━━━━━░░░░░░░  28%     │
│ 📅 마감: 2026-03-31 (D-78)          │
└─────────────────────────────────────┘
```

#### 7.3.3 대시보드 위젯
```
┌─────────────────────────────────────┐
│ 💰 예산 집행 현황                    │
├─────────────────────────────────────┤
│ ████████████░░░░░░░░░░░  35.2%     │
│                                     │
│ 총 예산    ₩5,000,000,000          │
│ 배정      ₩1,760,000,000           │
│ 집행      ₩  820,000,000           │
│ 잔여      ₩3,240,000,000           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 📊 상태별 현황                       │
├─────────────────────────────────────┤
│ 시작 전   ██░░░░░░░░    3건        │
│ 진행 중   ████████░░   12건        │
│ 대기      █░░░░░░░░░    2건        │
│ 지연      █░░░░░░░░░    1건   ⚠️   │
│ 완료      █████░░░░░    8건        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ⚠️ 주의 필요                        │
├─────────────────────────────────────┤
│ 🔴 C26-015 네트워크 장비      D-2  │
│ 🔴 C26-008 보안 솔루션      지연   │
│ 🟡 C26-012 사무용품         D-5   │
└─────────────────────────────────────┘
```

### 7.4 인터랙션 패턴

#### 7.4.1 확인이 필요한 작업
```
1. 사용자 입력
      ↓
2. AI가 미리보기 생성
   ┌────────────────────────┐
   │ 다음과 같이 처리할까요?  │
   │ [미리보기 카드]         │
   │                        │
   │ [확인]  [수정]  [취소]  │
   └────────────────────────┘
      ↓ (확인 클릭)
3. 작업 실행 & 결과 표시
```

#### 7.4.2 추가 정보 요청
```
사용자: "계약 등록해줘"
      ↓
AI: "어떤 계약을 등록할까요?
    계약명을 알려주세요."
      ↓
사용자: "서버 유지보수"
      ↓
AI: "계약 종류를 선택해주세요:
    [물품(구매)] [물품(제조)] [용역] [공사]"
      ↓
...
```

### 7.5 반응형 브레이크포인트

| 브레이크포인트 | 너비 | 레이아웃 |
|--------------|------|----------|
| Mobile S | < 360px | 최소 지원 |
| Mobile M | 360-390px | 기본 레이아웃 |
| Mobile L | 390-428px | 여유 있는 레이아웃 |
| Tablet | > 428px | 2컬럼 가능 (선택적) |

### 7.6 색상 팔레트

```css
:root {
  /* Primary */
  --primary-50: #eff6ff;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;

  /* Status */
  --status-before: #9ca3af;    /* 시작 전: Gray */
  --status-progress: #3b82f6;  /* 진행 중: Blue */
  --status-waiting: #f59e0b;   /* 대기: Amber */
  --status-delayed: #ef4444;   /* 지연: Red */
  --status-complete: #10b981;  /* 완료: Green */

  /* Alert */
  --alert-warning: #f59e0b;
  --alert-critical: #ef4444;

  /* Background */
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-chat-user: #3b82f6;
  --bg-chat-ai: #f3f4f6;
}
```

### 7.7 타이포그래피

```css
:root {
  /* Font Family */
  --font-sans: 'Pretendard', -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Font Sizes */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
}
```

---

## 8. 구현 단계 (Implementation Phases)

### Phase 1: 기반 구축

**목표**: 프로젝트 설정 및 인증 시스템 구현

**작업 항목**:

1. **프로젝트 초기화**
   - Next.js 15 프로젝트 생성
   - Tailwind CSS v4 설정
   - TypeScript 설정
   - ESLint/Prettier 설정

2. **데이터베이스 설정**
   - Vercel Postgres 프로비저닝
   - Prisma 스키마 정의
   - Edge 어댑터 설정
   - 마이그레이션 실행

3. **인증 시스템**
   - PIN 설정 페이지 (`/setup`)
   - PIN 입력 페이지 (`/login`)
   - 세션 관리 (httpOnly 쿠키)
   - 미들웨어 (인증 체크)

4. **기본 레이아웃**
   - 모바일 레이아웃 컴포넌트
   - 헤더 컴포넌트
   - 하단 네비게이션

**산출물**:
- 인증된 사용자만 접근 가능한 기본 앱 셸

---

### Phase 2: 핵심 기능 (계약 CRUD + 채팅)

**목표**: 자연어 기반 계약 관리 핵심 기능 구현

**작업 항목**:

1. **AI 채팅 시스템**
   - Vercel AI SDK 설정
   - Gemini 연동
   - 스트리밍 응답 구현
   - 시스템 프롬프트 작성
   - Tool 정의 (계약 관리 함수들)

2. **채팅 UI**
   - 채팅 컨테이너 컴포넌트
   - 메시지 버블 컴포넌트
   - 입력 영역 컴포넌트
   - 스크롤 관리
   - 로딩 상태 표시

3. **계약 CRUD API**
   - `/api/contracts` (목록, 생성)
   - `/api/contracts/[id]` (상세, 수정, 삭제)
   - 입력 검증 (Zod)
   - 변경 로그 기록

4. **계약 UI 컴포넌트**
   - 계약 카드 컴포넌트
   - 계약 상세 모달
   - 미리보기 컴포넌트
   - 확인/취소 버튼

5. **메모 기능**
   - `/api/contracts/[id]/notes`
   - 메모 목록 표시
   - 태그 자동 추출

**산출물**:
- 자연어로 계약 생성/조회/수정/삭제 가능한 채팅 인터페이스

---

### Phase 3: 대시보드 및 검색

**목표**: 대시보드 및 고급 조회 기능 구현

**작업 항목**:

1. **대시보드 API**
   - `/api/dashboard`
   - 예산 현황 집계
   - 상태별 통계
   - 주의 계약 필터링

2. **대시보드 UI**
   - 예산 프로그레스 바
   - 상태별 차트
   - 주의 계약 리스트
   - 풀다운 새로고침

3. **예산 관리**
   - `/api/config` (예산 설정)
   - 금액 파싱 유틸리티
   - 예산 설정 UI

4. **검색 및 필터**
   - 필터 UI 컴포넌트
   - 검색 API 쿼리 파라미터
   - 정렬 옵션

5. **퀵 액션**
   - 빠른 명령 버튼
   - 자주 쓰는 명령 숏컷

**산출물**:
- 현황 파악이 가능한 대시보드
- 효율적인 계약 검색/필터

---

### Phase 4: 최적화 및 배포

**목표**: 성능 최적화 및 프로덕션 배포

**작업 항목**:

1. **성능 최적화**
   - 이미지 최적화
   - 코드 스플리팅
   - 번들 사이즈 분석
   - Lighthouse 점수 개선

2. **UX 개선**
   - 스켈레톤 로딩
   - 에러 바운더리
   - 오프라인 상태 처리
   - 터치 피드백

3. **테스트**
   - API 엔드포인트 테스트
   - 컴포넌트 테스트
   - E2E 테스트 (핵심 플로우)

4. **배포**
   - Vercel 프로젝트 설정
   - 환경 변수 설정
   - 도메인 연결
   - 모니터링 설정

5. **문서화**
   - API 문서
   - 사용자 가이드
   - 운영 가이드

**산출물**:
- 프로덕션 배포된 MVP
- 운영 문서

---

## 9. 테스트 및 검증

### 9.1 기능 테스트 체크리스트

#### 인증
- [ ] PIN 최초 설정
- [ ] PIN 로그인 성공
- [ ] PIN 로그인 실패 (5회 제한)
- [ ] 세션 만료 처리

#### 계약 생성
- [ ] 자연어로 계약 생성 (모든 필드)
- [ ] 필수 필드 누락 시 추가 질문
- [ ] 미리보기 확인 후 저장
- [ ] 미리보기에서 취소
- [ ] ID 자동 생성 확인

#### 계약 조회
- [ ] 전체 목록 조회
- [ ] 상태별 필터링
- [ ] 계약 상세 조회
- [ ] 메모 목록 표시
- [ ] 변경 이력 표시

#### 계약 수정
- [ ] 단계 변경 (유효한 단계)
- [ ] 단계 변경 (무효한 단계 → 오류)
- [ ] 상태 변경
- [ ] 계약상대방 설정
- [ ] 변경 로그 기록 확인

#### 메모
- [ ] 메모 추가
- [ ] 태그 자동 추출
- [ ] 메모 목록 최신순 정렬

#### 계약 삭제
- [ ] 삭제 확인 요청
- [ ] Soft Delete (목록에서 제외)
- [ ] 삭제된 계약 복구 불가

#### 대시보드
- [ ] 예산 현황 표시
- [ ] 상태별 통계 정확성
- [ ] 주의 계약 필터링

#### 예산 관리
- [ ] 예산 설정 (다양한 금액 표현)
- [ ] 예산 현황 계산 정확성

### 9.2 모바일 디바이스 테스트

| 디바이스 | OS | 브라우저 | 테스트 항목 |
|---------|-----|---------|------------|
| iPhone 12 | iOS 15+ | Safari | 전체 기능 |
| iPhone SE | iOS 15+ | Safari | 작은 화면 레이아웃 |
| Galaxy S21 | Android 12+ | Chrome | 전체 기능 |
| Galaxy A52 | Android 11+ | Samsung Internet | 전체 기능 |

**테스트 항목**:
- [ ] 터치 반응성
- [ ] 스크롤 부드러움
- [ ] 키보드 올라올 때 레이아웃
- [ ] 가로/세로 모드 전환
- [ ] PWA 설치 (홈 화면 추가)

### 9.3 Edge Runtime 호환성 테스트

- [ ] 모든 API 라우트 Edge에서 실행 확인
- [ ] Prisma 쿼리 정상 동작
- [ ] 스트리밍 응답 정상 동작
- [ ] 콜드스타트 시간 측정 (< 100ms)
- [ ] 응답 시간 측정 (< 500ms)

### 9.4 성능 기준

| 메트릭 | 목표 |
|--------|------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3.0s |
| Cumulative Layout Shift | < 0.1 |
| API 응답 시간 (P95) | < 500ms |
| Lighthouse Performance | > 90 |

### 9.5 에러 시나리오 테스트

- [ ] 네트워크 오프라인
- [ ] API 타임아웃
- [ ] 잘못된 입력값
- [ ] 동시 요청 처리
- [ ] DB 연결 실패

---

## 10. 부록

### 10.1 ID 규칙

#### 계약 ID 형식
```
C{YY}-{NNN}
```
- `C`: Contract 접두사
- `YY`: 연도 2자리 (예: 26)
- `NNN`: 3자리 순번 (예: 001)

예시: `C26-001`, `C26-002`, `C27-001`

#### 연도별 순번 관리
- 각 연도마다 순번은 001부터 시작
- `configs` 테이블에서 `id_counter_{year}` 키로 관리

### 10.2 상태 전이 다이어그램

```
                 ┌─────────┐
      생성 ────▶│ 시작 전 │
                 └────┬────┘
                      │ 단계 진행
                      ▼
┌────────────────────────────────────┐
│            ┌──────────┐            │
│  ┌────────▶│ 진행 중  │◀────────┐  │
│  │         └─┬─────┬──┘         │  │
│  │           │     │            │  │
│  │재개  일시중지   이슈발생   해결│  │
│  │           │     │            │  │
│  │     ┌─────▼──┐ ┌▼─────┐      │  │
│  └─────│  대기  │ │ 지연 │──────┘  │
│        └────────┘ └──────┘         │
└────────────────────────────────────┘
                      │ 집행완료
                      ▼
                 ┌─────────┐
                 │  완료   │
                 └─────────┘
```

### 10.3 용어 정의

| 용어 | 정의 |
|------|------|
| 계약담당관 | 국가기관에서 계약 체결 업무를 담당하는 공무원 |
| 경쟁입찰 | 다수의 입찰자가 경쟁하여 낙찰자를 결정하는 방식 |
| 수의계약 | 경쟁 없이 특정 상대방과 직접 계약하는 방식 |
| 공고준비 | 입찰 공고를 위한 사전 준비 단계 |
| 개찰 | 입찰서를 개봉하여 낙찰자를 결정하는 행위 |
| 지출 | 계약 이행 후 대금을 지급하는 행위 |
| 집행 | 예산을 실제로 사용하는 것 |
| Soft Delete | 데이터를 물리적으로 삭제하지 않고 상태만 변경하는 방식 |
| Edge Runtime | CDN 엣지에서 실행되는 서버리스 런타임 |

### 10.4 버전 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0 | 2026-01-12 | Claude | 초안 작성 (MVP) |

---

## 11. 참고 자료

### 11.1 기술 문서 링크

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Prisma with Edge Functions](https://www.prisma.io/docs/guides/deployment/edge)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Google Gemini API](https://ai.google.dev/docs)

### 11.2 관련 문서

- `PRD.md` - Claude 스킬 기반 원본 PRD
- `CLAUDE.md` - 프로젝트 기본 설정
