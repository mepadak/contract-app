# Phase 2: 핵심 기능 (계약 CRUD + 채팅) 구현 계획

## 개요

**목표**: 자연어 기반 계약 관리 핵심 기능 구현
**예상 산출물**: 자연어로 계약 생성/조회/수정/삭제 가능한 채팅 인터페이스

---

## 구현 단계

### Step 1: 의존성 설치

**필요 패키지:**
```bash
npm install ai @ai-sdk/google
```

- `ai`: Vercel AI SDK 4.x (스트리밍 응답, Tool 정의)
- `@ai-sdk/google`: Google Gemini 연동

---

### Step 2: AI 채팅 시스템 구현

#### 2.1 시스템 프롬프트 작성
- **파일**: `src/lib/ai/system-prompt.ts`
- 역할 정의, 사용 가능한 도구, 금액 파싱 규칙, 계약 종류/방법 매핑

#### 2.2 Tool 정의
- **파일**: `src/lib/ai/tools.ts`
- 계약 관리 함수들:
  - `createContract`: 계약 생성
  - `listContracts`: 계약 목록 조회
  - `getContract`: 계약 상세 조회
  - `updateStage`: 단계 변경
  - `updateStatus`: 상태 변경
  - `addNote`: 메모 추가
  - `deleteContract`: 계약 삭제
  - `getDashboard`: 대시보드 조회 (Phase 3 연계)
  - `setBudget`: 예산 설정

#### 2.3 채팅 API 라우트
- **파일**: `src/app/api/chat/route.ts`
- Edge Runtime
- Gemini gemini-1.5-flash 모델 사용
- 스트리밍 응답 (Vercel AI SDK)
- 최근 10개 메시지 컨텍스트 유지

---

### Step 3: 계약 CRUD API 구현

#### 3.1 계약 목록/생성 API
- **파일**: `src/app/api/contracts/route.ts`
- `GET`: 목록 조회 (필터: status, category, method, 페이지네이션)
- `POST`: 계약 생성 (ID 자동 생성 C{YY}-{NNN})
- Zod 스키마 검증
- ChangeLog 기록

#### 3.2 계약 상세/수정/삭제 API
- **파일**: `src/app/api/contracts/[id]/route.ts`
- `GET`: 상세 조회 (계약 정보 + 메모 + 변경 이력)
- `PATCH`: 수정 (단계, 상태, 계약상대방 등)
- `DELETE`: Soft Delete (status → DELETED)

#### 3.3 메모 추가 API
- **파일**: `src/app/api/contracts/[id]/notes/route.ts`
- `POST`: 메모 추가
- 태그 자동 추출 (Gemini 활용)

#### 3.4 Zod 스키마 정의
- **파일**: `src/lib/validations/contract.ts`
- 계약 생성/수정 스키마
- 메모 스키마

---

### Step 4: 채팅 UI 컴포넌트 구현

#### 4.1 메시지 버블 컴포넌트
- **파일**: `src/components/chat/message-bubble.tsx`
- 사용자 메시지 (오른쪽 정렬, 파란색)
- AI 메시지 (왼쪽 정렬, 회색)
- 타임스탬프 표시
- 마크다운 지원

#### 4.2 채팅 입력 컴포넌트
- **파일**: `src/components/chat/chat-input.tsx`
- 텍스트 입력 영역
- 전송 버튼
- 로딩 상태 (AI 응답 대기 중)

#### 4.3 채팅 컨테이너
- **파일**: `src/components/chat/chat-container.tsx`
- 메시지 리스트 스크롤 관리
- 새 메시지 자동 스크롤
- 로딩 인디케이터

#### 4.4 채팅 페이지 업데이트
- **파일**: `src/app/(authenticated)/chat/page.tsx`
- useChat 훅 사용 (Vercel AI SDK)
- 메시지 상태 관리
- 스트리밍 응답 표시

---

### Step 5: 계약 UI 컴포넌트 구현

#### 5.1 계약 카드 컴포넌트
- **파일**: `src/components/contract/contract-card.tsx`
- ID, 계약명, 상태 배지
- 종류, 방법, 금액 표시
- 진행률 바
- 마감일 D-Day

#### 5.2 계약 상세 모달
- **파일**: `src/components/contract/contract-detail-modal.tsx`
- 전체 계약 정보 표시
- 메모 목록
- 변경 이력

#### 5.3 미리보기 컴포넌트
- **파일**: `src/components/chat/preview-card.tsx`
- 계약 생성/수정 전 미리보기
- 확인/수정/취소 버튼

#### 5.4 계약 목록 페이지 업데이트
- **파일**: `src/app/(authenticated)/contracts/page.tsx`
- 계약 카드 리스트
- 필터/검색 UI

---

### Step 6: 통합 및 테스트

#### 6.1 통합 테스트
- 자연어 계약 생성 플로우
- 계약 조회/수정/삭제 플로우
- 메모 추가 플로우
- 컨텍스트 유지 테스트

#### 6.2 빌드 검증
- `npm run build` 성공 확인
- Edge Runtime 호환성 확인

---

## 생성할 파일 목록

```
src/
├── lib/
│   ├── ai/
│   │   ├── system-prompt.ts      # 시스템 프롬프트
│   │   └── tools.ts              # AI Tool 정의
│   └── validations/
│       └── contract.ts           # Zod 스키마
├── app/
│   └── api/
│       ├── chat/
│       │   └── route.ts          # 채팅 API
│       └── contracts/
│           ├── route.ts          # 목록/생성 API
│           └── [id]/
│               ├── route.ts      # 상세/수정/삭제 API
│               └── notes/
│                   └── route.ts  # 메모 API
└── components/
    ├── chat/
    │   ├── message-bubble.tsx    # 메시지 버블
    │   ├── chat-input.tsx        # 입력 영역
    │   ├── chat-container.tsx    # 채팅 컨테이너
    │   └── preview-card.tsx      # 미리보기 카드
    └── contract/
        ├── contract-card.tsx     # 계약 카드
        └── contract-detail-modal.tsx  # 상세 모달
```

**수정할 파일:**
- `src/app/(authenticated)/chat/page.tsx`
- `src/app/(authenticated)/contracts/page.tsx`

---

## 환경 변수 요구사항

```env
GOOGLE_GENERATIVE_AI_API_KEY="..."  # Gemini API 키 (필수)
```

---

## 검증 방법

1. **개발 서버 실행**: `npm run dev`
2. **채팅 테스트**:
   - "서버 유지보수 용역 5천만원 일반경쟁 등록해줘"
   - "전체 목록 보여줘"
   - "C26-001 상세 보여줘"
   - "C26-001 공고중으로 변경해줘"
   - "C26-001에 메모 추가: 규격서 검토 완료"
3. **빌드 검증**: `npm run build`
4. **API 테스트**: 각 엔드포인트 직접 호출

---

## 주의사항

- 모든 API 라우트는 `export const runtime = 'edge'` 설정
- 모든 변경 작업은 미리보기 후 사용자 확인 필요
- 계약 삭제는 Soft Delete (상태만 "삭제"로 변경)
- 변경 로그(ChangeLog) 기록 필수
- UI는 frontend-design 스킬 적용 (화이트톤, 세련된 느낌)
