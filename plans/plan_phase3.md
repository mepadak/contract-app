# Phase 3: 대시보드 및 검색 구현 계획

## 개요
PRD 섹션 8에 정의된 Phase 3 기능을 구현합니다.
- 대시보드 API 및 UI
- 예산 관리 기능
- 계약 목록 필터 UI

## 현재 상태
- ✅ 계약 API 필터링 로직 완전 구현 (status, category, method 파라미터)
- ✅ 금액 파싱/포맷팅 유틸리티 완전 구현
- ✅ 상수 정의 (ALERT_THRESHOLDS 등) 완전 구현
- ❌ /api/dashboard 미구현
- ❌ /api/config 미구현
- ❌ 대시보드 페이지 데이터 미연동 (스켈레톤 상태)
- ❌ 계약 목록 필터 UI 미구현

---

## 구현 단계

### Step 1: 대시보드 API 구현
**파일**: `src/app/api/dashboard/route.ts`

기능:
- 예산 현황 집계 (총예산, 배정, 집행, 잔여, 집행률)
- 상태별 계약 통계 (건수, 금액)
- 주의 계약 필터링 (D-3 critical, D-7 warning, 지연, 대기 7일+)

응답 형식:
```typescript
{
  budget: { total, allocated, executed, remaining, executionRate },
  statusSummary: { "시작 전": {count, amount}, ... },
  alerts: [{ contractId, title, level, reason, deadline }]
}
```

### Step 2: Config API 구현
**파일**: `src/app/api/config/route.ts`

기능:
- GET: 설정값 조회 (annual_budget 등)
- PUT: 설정값 수정

### Step 3: 대시보드 UI 업데이트
**파일**: `src/app/(authenticated)/dashboard/page.tsx`

수정 내용:
- API 호출로 실제 데이터 연동
- 예산 프로그레스 바 (집행률)
- 상태별 통계 카드
- 주의 계약 리스트 (클릭 시 상세 이동)
- 풀다운 새로고침 또는 수동 새로고침 버튼
- 로딩/에러 상태 처리

### Step 4: 설정 페이지 기능 추가
**파일**: `src/app/(authenticated)/settings/page.tsx`

수정 내용:
- 연간 예산 설정 모달/폼
- /api/config API 연동
- 저장 성공/실패 피드백

### Step 5: 계약 목록 필터 UI
**파일**: `src/app/(authenticated)/contracts/page.tsx`

추가 기능:
- 필터 버튼 (Filter 아이콘)
- 필터 드롭다운/바텀시트 (상태, 종류, 방법)
- 필터 상태 관리 (useState)
- 활성 필터 표시 (뱃지/칩)
- 필터 초기화 버튼

### Step 6: 퀵 액션 개선
**파일**: `src/components/chat/chat-container.tsx`

기능:
- 빠른 명령 버튼 (전체 목록, 대시보드, 진행중 계약)
- 버튼 클릭 시 해당 메시지 자동 전송

### Step 7: Git 커밋 및 문서화
- 커밋: "Phase 3: 대시보드 및 검색 구현 완료"
- `plans/plan_phase3_completed.md` 작성
- 푸시

---

## 수정/생성 파일 목록

### 신규 생성 (2개)
- `src/app/api/dashboard/route.ts`
- `src/app/api/config/route.ts`

### 수정 (4개)
- `src/app/(authenticated)/dashboard/page.tsx`
- `src/app/(authenticated)/settings/page.tsx`
- `src/app/(authenticated)/contracts/page.tsx`
- `src/components/chat/chat-container.tsx`

---

## 검증 방법

1. **대시보드 검증**
   - `/dashboard` 페이지에서 예산 현황 표시 확인
   - 상태별 통계 정확성 확인
   - 주의 계약 목록 표시 확인

2. **예산 설정 검증**
   - `/settings`에서 예산 설정
   - 채팅으로 "예산 50억 설정" 입력
   - 대시보드에서 변경된 예산 확인

3. **필터 검증**
   - `/contracts`에서 상태 필터 적용
   - 종류/방법 필터 적용
   - 복합 필터 적용
   - 필터 초기화

※ Vercel 배포 및 빌드테스트는 Phase 4 이후 통합 진행 예정
