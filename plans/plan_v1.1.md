# Contract Manager Mobile v1.1 개선 계획서

## 개요
이 문서는 Contract Manager Mobile MVP의 11가지 개선요구사항에 대한 구현 계획을 정리합니다.

---

## Phase 1: 데이터베이스 스키마 변경 (기반 작업)

### 1.1 금액 구조 세분화 (#6)

**현재 상태**: `amount` 필드 하나로 관리

**변경 스키마** (`prisma/schema.prisma`):
```prisma
model Contract {
  // 기존 amount 필드 유지 (하위호환)
  amount           BigInt    @default(0)

  // 신규 금액 필드
  budget           BigInt    @default(0)   // 예산
  contractAmount   BigInt    @default(0)   // 계약금액
  executionAmount  BigInt    @default(0)   // 집행금액
}
```

**계산 로직**:
- 계약잔액 = 예산 - 계약금액
- 집행잔액 = 계약금액 - 집행금액
- 총 예산 집행액 = 집행금액 합계 (완료된 계약)

**마이그레이션**:
```bash
npx prisma migrate dev --name add_amount_fields
```

**영향 파일**:
- `prisma/schema.prisma`
- `src/app/api/contracts/route.ts`
- `src/app/api/contracts/[id]/route.ts`
- `src/app/api/dashboard/route.ts`
- `src/lib/ai/tools.ts`
- `src/lib/validations/contract.ts`

---

### 1.2 일자 구조 세분화 (#7)

**현재 상태**: `deadline`, `createdAt`, `updatedAt`만 존재

**변경 스키마**:
```prisma
model Contract {
  // 기존 유지
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  // 신규 일자 필드
  requestDate         DateTime? @db.Date  // 요청일
  announcementStart   DateTime? @db.Date  // 공고시작일
  announcementEnd     DateTime? @db.Date  // 공고종료일
  openingDate         DateTime? @db.Date  // 개찰일
  contractStart       DateTime? @db.Date  // 계약시작일
  contractEnd         DateTime? @db.Date  // 계약종료일
  paymentDate         DateTime? @db.Date  // 대금집행일

  // deadline → contractEnd로 마이그레이션 후 제거 검토
}
```

**자동화 로직**:
- 공고종료일 = 공고시작일 + 공고기간(일)
- 대금집행일 입력 → 상태='완료', 단계='집행완료' 자동 변경

**영향 파일**:
- `prisma/schema.prisma`
- `src/app/api/contracts/route.ts`
- `src/app/api/contracts/[id]/route.ts`
- `src/lib/ai/tools.ts`
- `src/components/contract/contract-detail-modal.tsx`

---

## Phase 2: API 및 비즈니스 로직

### 2.1 수의계약 기본값 (#9)

**현재 상태**: `mapMethod` 함수에서 순서 문제 가능성

**수정** (`src/lib/ai/tools.ts:50-65`):
```typescript
function mapMethod(input: string): Method {
  const normalized = input.toLowerCase();

  // 공개수의를 먼저 체크 (순서 중요!)
  if (normalized.includes('공개수의')) {
    return Method.OPEN_NEGOTIATION;
  }
  // 그 외 "수의", "비공개" → 비공개수의 (기본값)
  if (normalized.includes('수의') || normalized.includes('비공개')) {
    return Method.PRIVATE_NEGOTIATION;
  }
  // ... 나머지 유지
}
```

**영향 파일**:
- `src/lib/ai/tools.ts` - mapMethod 함수

---

### 2.2 계약종료일 경고 시스템 (#8)

**구현 방안**:

**A. 상수 정의** (`src/lib/constants.ts`):
```typescript
export const ALERT_THRESHOLDS = {
  CRITICAL_DAYS: 3,
  WARNING_DAYS: 7,
  CONTRACT_END_WARNING: 5, // 신규: 계약종료 5일 전 주의
} as const;
```

**B. 경고 판정 로직**:
- 단계='계약완료' + contractEnd 5일 이내 → '주의' 배지
- 단계='계약완료' + contractEnd 경과 → '경고' 배지 + 상태='지연' 자동 변경

**C. Vercel Cron Job** (선택):
```typescript
// src/app/api/cron/check-deadlines/route.ts
export async function GET() {
  // 계약종료일 경과 계약 조회
  // status = DELAYED로 업데이트
  // ChangeLog 기록
}
```

**D. vercel.json 추가**:
```json
{
  "crons": [{
    "path": "/api/cron/check-deadlines",
    "schedule": "0 0 * * *"
  }]
}
```

**영향 파일**:
- `src/lib/constants.ts`
- `src/app/api/cron/check-deadlines/route.ts` (신규)
- `src/components/contract/contract-card.tsx`
- `vercel.json` (신규 또는 수정)

---

## Phase 3: UI 개선 (독립적)

### 3.1 진행률 표시 개선 (#4)

**현재 상태**: 단계명 + 퍼센트 + 진행률 바

**변경 사항**:
1. 퍼센트 제거
2. 단계별 색상 구분

**단계별 색상 정의** (`src/lib/constants.ts`):
```typescript
export const STAGE_COLORS: Record<string, string> = {
  '공고준비': 'slate',
  '공고중': 'blue',
  '개찰완료': 'indigo',
  '계약준비': 'violet',
  '계약완료': 'amber',
  '지출준비': 'orange',
  '집행완료': 'emerald',
};
```

**UI 변경** (`src/components/contract/contract-card.tsx:77-92`):
```tsx
// 기존: 진행률 바 + 퍼센트
// 변경: 단계 배지 (색상 적용)
<StageBadge stage={stage} />
```

**영향 파일**:
- `src/lib/constants.ts` - STAGE_COLORS 추가
- `src/components/contract/contract-card.tsx` - 진행률 표시 변경
- `src/components/contract/contract-detail-modal.tsx` - 동일 적용

---

### 3.2 하단 콘텐츠 가림 문제 (#10)

**현재 상태**: `pb-20` (80px) 패딩, 일부 상황에서 가림

**수정** (`src/components/layout/mobile-layout.tsx:27-35`):
```tsx
<main
  className={cn(
    'flex-1 overflow-auto',
    showNav && 'pb-[calc(5rem+env(safe-area-inset-bottom))]',
    !showHeader && 'pt-safe'
  )}
>
```

**추가 수정 필요 파일**:
- 각 페이지에서 `pb-24` 등 중복 패딩 정리

**영향 파일**:
- `src/components/layout/mobile-layout.tsx`
- `src/app/(authenticated)/contracts/page.tsx`
- `src/app/(authenticated)/chat/page.tsx`
- `src/app/globals.css` - CSS 변수 정의

---

### 3.3 계약 상세 모든 정보 표시 (#11)

**현재 상태**: 일부 필드 미표시 (budgetYear, createdAt, updatedAt 등)

**변경** (`src/components/contract/contract-detail-modal.tsx`):

```tsx
// 1. 기본 정보 섹션 확장
<InfoCard label="예산연도" value={`${contract.budgetYear}년`} />

// 2. 금액 섹션 추가 (Phase 1 이후)
<section>
  <h3>금액 현황</h3>
  <AmountSummary contract={contract} />
</section>

// 3. 일정 섹션 추가 (Phase 1 이후)
<section>
  <h3>일정</h3>
  <DateTimeline contract={contract} />
</section>

// 4. 생성/수정일 표시
<div className="text-xs text-text-tertiary">
  생성: {formatDate(contract.createdAt)} |
  수정: {formatDate(contract.updatedAt)}
</div>
```

**신규 컴포넌트**:
- `src/components/contract/amount-summary.tsx` - 금액 시각화
- `src/components/contract/date-timeline.tsx` - 일정 타임라인

**영향 파일**:
- `src/components/contract/contract-detail-modal.tsx`
- `src/components/contract/amount-summary.tsx` (신규)
- `src/components/contract/date-timeline.tsx` (신규)

---

## Phase 4: 기능 확장

### 4.1 채팅 컨텍스트 유지 (#1)

**현재 상태**: `useChat` 훅으로 클라이언트 메모리에만 저장, 탭 이동 시 유실

**구현 방안**: sessionStorage 활용

**신규 훅** (`src/hooks/useChatPersistence.ts`):
```typescript
import { useEffect, useCallback } from 'react';

const STORAGE_KEY = 'chat-messages';

export function useChatPersistence() {
  // sessionStorage에 메시지 저장
  const saveMessages = useCallback((messages) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, []);

  // sessionStorage에서 메시지 복원
  const loadMessages = useCallback(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  }, []);

  return { saveMessages, loadMessages };
}
```

**채팅 페이지 수정** (`src/app/(authenticated)/chat/page.tsx`):
```typescript
const { saveMessages, loadMessages } = useChatPersistence();
const [initialMessages] = useState(loadMessages);

const { messages, sendMessage, status } = useChat({
  initialMessages,
});

// 메시지 변경 시 저장
useEffect(() => {
  if (messages.length > 0) {
    saveMessages(messages);
  }
}, [messages, saveMessages]);
```

**영향 파일**:
- `src/hooks/useChatPersistence.ts` (신규)
- `src/app/(authenticated)/chat/page.tsx`

---

### 4.2 계약 직접 수정 기능 (#2)

**현재 상태**: ContractDetailModal은 읽기 전용

**구현 방안**:

**A. 수정 모드 토글**:
```tsx
const [isEditMode, setIsEditMode] = useState(false);
const [editData, setEditData] = useState<Partial<ContractDetail>>({});
```

**B. 헤더에 수정 버튼 추가**:
```tsx
<button onClick={() => setIsEditMode(true)}>
  <Pencil className="w-4 h-4" />
</button>
```

**C. 편집 UI** (조건부 렌더링):
- 계약명: `<input type="text" />`
- 종류/방법/단계/상태: `<select />` 드롭다운
- 금액: `<input type="number" />` + 한국어 입력 지원
- 일자: `<input type="date" />`
- 요청부서/계약상대방: `<input type="text" />`

**D. 저장 API 호출**:
```typescript
const handleSave = async () => {
  await fetch(`/api/contracts/${contract.id}`, {
    method: 'PATCH',
    body: JSON.stringify(editData),
  });
  setIsEditMode(false);
  onRefresh?.(); // 목록 새로고침
};
```

**영향 파일**:
- `src/components/contract/contract-detail-modal.tsx`
- `src/components/contract/contract-edit-form.tsx` (신규)
- `src/app/(authenticated)/contracts/page.tsx` - 저장 후 새로고침

---

### 4.3 요청부서 트리 그룹화 (#3)

**현재 상태**: 계약 목록이 단순 리스트로 표시

**구현 방안**:

**A. 뷰 모드 토글**:
```tsx
const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');
```

**B. 그룹화 로직**:
```typescript
const groupedContracts = useMemo(() => {
  const groups: Record<string, Contract[]> = {};
  contracts.forEach(c => {
    const key = c.requester || '미지정';
    if (!groups[key]) groups[key] = [];
    groups[key].push(c);
  });
  return groups;
}, [contracts]);
```

**C. 트리 UI**:
```tsx
// src/components/contract/contract-tree.tsx
function ContractTree({ grouped }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  return Object.entries(grouped).map(([dept, items]) => (
    <div key={dept}>
      <button onClick={() => toggle(dept)}>
        <ChevronRight className={expanded.has(dept) ? 'rotate-90' : ''} />
        <span>{dept}</span>
        <span>({items.length}건, {formatAmount(sum(items))})</span>
      </button>
      {expanded.has(dept) && items.map(c => <ContractCard {...c} />)}
    </div>
  ));
}
```

**영향 파일**:
- `src/app/(authenticated)/contracts/page.tsx` - 뷰 모드 토글, 그룹화 로직
- `src/components/contract/contract-tree.tsx` (신규)
- `src/components/contract/requester-group-header.tsx` (신규)

---

### 4.4 채팅 계약 등록 UX 개선 (#5)

**현재 상태**: 모든 정보를 텍스트로 입력

**구현 방안**:

**A. AI 응답에 선택지 포함**:
시스템 프롬프트 수정 (`src/lib/ai/system-prompt.ts`):
```markdown
## 계약 등록 시 대화형 입력
선택형 항목은 다음 형식으로 응답:
[선택] 계약 종류를 선택해주세요:
1. 물품(구매)
2. 물품(제조)
3. 용역
4. 공사
```

**B. 메시지 버블에서 선택지 감지**:
```typescript
// 패턴: [선택] 또는 숫자 옵션 형식 감지
const hasOptions = /\[선택\]|^\d+\.\s/.test(content);
```

**C. 퀵 리플라이 버튼**:
```tsx
// src/components/chat/quick-reply-buttons.tsx
function QuickReplyButtons({ options, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt, i) => (
        <button key={i} onClick={() => onSelect(opt.value)}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}
```

**D. 버튼 클릭 또는 숫자 입력 지원**:
- 버튼 클릭 → 해당 값 자동 전송
- 숫자 입력 → AI가 파싱

**영향 파일**:
- `src/lib/ai/system-prompt.ts`
- `src/components/chat/message-bubble.tsx`
- `src/components/chat/quick-reply-buttons.tsx` (신규)
- `src/components/chat/chat-input.tsx`

---

## 구현 우선순위

| 순위 | 요구사항 | 난이도 | 의존성 |
|-----|---------|-------|-------|
| 1 | #9 수의계약 기본값 | 낮음 | 없음 |
| 2 | #4 진행률 표시 개선 | 낮음 | 없음 |
| 3 | #10 하단 콘텐츠 가림 | 낮음 | 없음 |
| 4 | #6 금액 구조 세분화 | 중간 | DB 마이그레이션 |
| 5 | #7 일자 구조 세분화 | 중간 | DB 마이그레이션 |
| 6 | #11 상세 모든 정보 표시 | 중간 | #6, #7 |
| 7 | #8 경고 시스템 | 중간 | #7 |
| 8 | #1 채팅 컨텍스트 유지 | 중간 | 없음 |
| 9 | #2 계약 직접 수정 | 높음 | #6, #7 |
| 10 | #3 트리 그룹화 | 중간 | 없음 |
| 11 | #5 채팅 UX 개선 | 높음 | #6, #7 |

---

## 변경 파일 요약

### 신규 파일
- `src/hooks/useChatPersistence.ts`
- `src/components/contract/contract-edit-form.tsx`
- `src/components/contract/contract-tree.tsx`
- `src/components/contract/requester-group-header.tsx`
- `src/components/contract/amount-summary.tsx`
- `src/components/contract/date-timeline.tsx`
- `src/components/chat/quick-reply-buttons.tsx`
- `src/app/api/cron/check-deadlines/route.ts`
- `vercel.json` (cron 설정)

### 수정 파일
- `prisma/schema.prisma` - 금액/일자 필드 추가
- `src/lib/constants.ts` - STAGE_COLORS, 경고 임계값 추가
- `src/lib/validations/contract.ts` - 스키마 업데이트
- `src/lib/ai/tools.ts` - mapMethod, 도구 파라미터 확장
- `src/lib/ai/system-prompt.ts` - 대화형 입력 안내
- `src/app/api/contracts/route.ts` - 금액/일자 처리
- `src/app/api/contracts/[id]/route.ts` - 금액/일자 수정
- `src/app/api/dashboard/route.ts` - 예산 계산 로직
- `src/app/(authenticated)/chat/page.tsx` - 컨텍스트 유지
- `src/app/(authenticated)/contracts/page.tsx` - 트리뷰, 편집
- `src/components/layout/mobile-layout.tsx` - 패딩 조정
- `src/components/contract/contract-card.tsx` - 단계 색상, 경고 배지
- `src/components/contract/contract-detail-modal.tsx` - 편집 모드, 전체 필드
- `src/components/chat/message-bubble.tsx` - 선택지 렌더링
- `src/components/chat/chat-input.tsx` - 퀵 리플라이 핸들러

---

## 검증 방법

### 기능별 테스트
1. **채팅 컨텍스트**: 채팅 → 다른 탭 → 채팅 복귀 → 메시지 유지 확인
2. **계약 직접 수정**: 계약 상세 → 수정 버튼 → 필드 변경 → 저장 → 변경 반영 확인
3. **트리 그룹화**: 목록 → 트리뷰 전환 → 부서별 그룹 확인 → 접기/펼치기
4. **단계 색상**: 각 단계별 색상 적용 확인
5. **금액 구조**: 예산/계약금액/집행금액 입력 → 잔액 계산 확인
6. **일자 구조**: 공고시작일+기간 → 종료일 자동 계산, 대금집행일 → 자동 완료
7. **경고 시스템**: 계약완료 단계 + 종료 5일 이내 → 주의 표시
8. **수의계약**: "수의" 입력 → 비공개수의, "공개수의" → 공개수의
9. **하단 가림**: 긴 목록 스크롤 → 마지막 항목 완전히 표시
10. **상세 정보**: 모든 필드 표시 확인
11. **채팅 UX**: 계약 등록 시 버튼 선택 또는 숫자 입력

### 배포 및 테스트
```bash
# Git 커밋 및 푸시
git add .
git commit -m "feat: v1.1 improvements"
git push

# Vercel에서 자동 배포 후 테스트 수행
# (로컬 빌드 테스트 생략)
```

### Prisma 마이그레이션
```bash
# 로컬에서 마이그레이션 파일 생성
npx prisma migrate dev --name v1.1_improvements
npx prisma generate

# Vercel 배포 시 자동으로 마이그레이션 적용
```
