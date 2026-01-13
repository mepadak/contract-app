# Phase 2: 핵심 기능 (계약 CRUD + 채팅) - 완료

## 완료 일시
2026-01-13

## 완료된 작업 (10/10 단계 - 100%)

### Step 1: 의존성 설치 ✅
- [x] `ai` (Vercel AI SDK 4.x) 설치
- [x] `@ai-sdk/google` (Google Gemini 연동) 설치

### Step 2: AI 채팅 시스템 구현 ✅
- [x] `src/lib/ai/system-prompt.ts` - 시스템 프롬프트 작성
  - 역할 정의, 금액 파싱 규칙
  - 계약 종류/방법 매핑
  - 응답 규칙 및 예시 대화
  - 웰컴 메시지
- [x] `src/lib/ai/tools.ts` - AI Tool 정의
  - createContract: 계약 생성
  - listContracts: 목록 조회
  - getContract: 상세 조회
  - updateContract: 계약 수정
  - addNote: 메모 추가
  - deleteContract: 계약 삭제
  - setBudget: 예산 설정

### Step 3: 채팅 API 라우트 구현 ✅
- [x] `src/app/api/chat/route.ts`
  - Edge Runtime 설정
  - Gemini gemini-1.5-flash 모델 사용
  - 스트리밍 응답 (Vercel AI SDK)
  - 최근 10개 메시지 컨텍스트 유지
  - maxSteps: 5 (최대 5번 tool 호출)

### Step 4: Zod 스키마 정의 ✅
- [x] `src/lib/validations/contract.ts`
  - categorySchema, methodSchema, statusSchema
  - createContractSchema, updateContractSchema
  - createNoteSchema
  - listContractsQuerySchema

### Step 5: 계약 CRUD API 구현 ✅
- [x] `src/app/api/contracts/route.ts`
  - GET: 목록 조회 (필터, 페이지네이션, 정렬)
  - POST: 계약 생성 (ID 자동 생성 C{YY}-{NNN})
- [x] `src/app/api/contracts/[id]/route.ts`
  - GET: 상세 조회 (계약 + 메모 + 변경이력)
  - PATCH: 수정 (단계, 상태, 계약상대방 등)
  - DELETE: Soft Delete
- [x] `src/app/api/contracts/[id]/notes/route.ts`
  - GET: 메모 목록
  - POST: 메모 추가 (태그 자동 추출)

### Step 6: 채팅 UI 컴포넌트 구현 ✅
- [x] `src/components/chat/message-bubble.tsx`
  - 사용자 메시지 (오른쪽, 파란색)
  - AI 메시지 (왼쪽, 회색)
  - 타임스탬프, 스트리밍 인디케이터
  - TypingIndicator 컴포넌트
- [x] `src/components/chat/chat-input.tsx`
  - 텍스트 입력 영역 (자동 높이 조절)
  - 전송 버튼 (로딩 상태)
  - Enter 전송, Shift+Enter 줄바꿈
- [x] `src/components/chat/chat-container.tsx`
  - 메시지 리스트 렌더링
  - 자동 스크롤
  - 빈 상태 (EmptyState)
  - 퀵 액션 버튼
- [x] `src/components/chat/preview-card.tsx`
  - 계약 생성/수정/삭제 미리보기
  - 확인/수정/취소 버튼

### Step 7: 계약 UI 컴포넌트 구현 ✅
- [x] `src/components/contract/contract-card.tsx`
  - ID, 계약명, 상태 배지
  - 종류, 방법, 금액
  - 진행률 바
  - 마감일 D-Day
  - ContractCardSkeleton
- [x] `src/components/contract/contract-detail-modal.tsx`
  - 바텀시트 스타일 모달
  - 진행 현황, 기본 정보
  - 메모 목록, 변경 이력

### Step 8: 채팅/계약 페이지 업데이트 ✅
- [x] `src/app/(authenticated)/chat/page.tsx`
  - useChat 훅 (Vercel AI SDK)
  - 메시지 상태 관리
  - 스트리밍 응답 표시
- [x] `src/app/(authenticated)/contracts/page.tsx`
  - 계약 목록 조회
  - 검색 기능 (디바운스)
  - 상세 모달 연동
  - 로딩/에러/빈 상태 처리

### Step 9: 상수 타입 수정 ✅
- [x] `src/lib/constants.ts`
  - STATUS_LABELS, STATUS_COLORS
  - CATEGORY_LABELS, METHOD_LABELS
  - Record<string, string> 타입으로 통일

### Step 10: ESLint 검증 ✅
- [x] 모든 경고 수정 완료
- [x] 사용하지 않는 import 제거
- [x] useCallback으로 의존성 최적화

---

## 생성된 파일 목록 (14개 신규 파일)

```
src/
├── lib/
│   ├── ai/
│   │   ├── system-prompt.ts      ✅
│   │   └── tools.ts              ✅
│   └── validations/
│       └── contract.ts           ✅
├── app/
│   └── api/
│       ├── chat/
│       │   └── route.ts          ✅
│       └── contracts/
│           ├── route.ts          ✅
│           └── [id]/
│               ├── route.ts      ✅
│               └── notes/
│                   └── route.ts  ✅
└── components/
    ├── chat/
    │   ├── message-bubble.tsx    ✅
    │   ├── chat-input.tsx        ✅
    │   ├── chat-container.tsx    ✅
    │   └── preview-card.tsx      ✅
    └── contract/
        ├── contract-card.tsx     ✅
        └── contract-detail-modal.tsx  ✅
```

**수정된 파일:**
- `src/app/(authenticated)/chat/page.tsx` ✅
- `src/app/(authenticated)/contracts/page.tsx` ✅
- `src/lib/constants.ts` ✅
- `package.json` (의존성 추가) ✅

---

## 디자인 특징 (frontend-design 스킬 적용)

### 채팅 UI
- **메시지 버블**: 사용자(파란색 그라데이션), AI(회색 배경)
- **아바타**: 원형, 사용자(User 아이콘), AI(Bot 아이콘)
- **애니메이션**: fade-in, slide-in-from-bottom-2
- **입력 영역**: 자동 높이 조절, glass effect

### 계약 UI
- **카드**: rounded-2xl, 진행률 바, D-Day 표시
- **모달**: 바텀시트 스타일, slide-in-from-bottom
- **상태 배지**: 색상 코드 (gray/blue/amber/red/emerald)

---

## API 엔드포인트

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| /api/chat | POST | AI 채팅 (스트리밍) |
| /api/contracts | GET | 계약 목록 |
| /api/contracts | POST | 계약 생성 |
| /api/contracts/[id] | GET | 계약 상세 |
| /api/contracts/[id] | PATCH | 계약 수정 |
| /api/contracts/[id] | DELETE | 계약 삭제 |
| /api/contracts/[id]/notes | GET | 메모 목록 |
| /api/contracts/[id]/notes | POST | 메모 추가 |

---

## 다음 단계 (Phase 3)

Phase 3에서 구현할 기능:
1. 대시보드 API (`/api/dashboard`)
2. 대시보드 UI (예산 현황, 상태별 통계, 주의 계약)
3. 예산 관리 (`/api/config`)
4. 검색/필터 UI 개선
5. 퀵 액션 버튼

---

## 테스트 방법

1. **개발 서버 실행**: `npm run dev`
2. **채팅 테스트**:
   - "서버 유지보수 용역 5천만원 일반경쟁 등록해줘"
   - "전체 목록 보여줘"
   - "C26-001 상세"
   - "C26-001 공고중으로 변경"
   - "C26-001에 메모: 규격서 검토 완료"
3. **계약 목록**: `/contracts` 페이지에서 목록/상세 확인
