// 계약 단계 정의
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
  ] as const,
  // 비공개수의 (4단계)
  PRIVATE: ['계약준비', '계약완료', '지출준비', '집행완료'] as const,
} as const;

export const METHOD_STAGES: Record<string, readonly string[]> = {
  일반경쟁: STAGES.COMPETITIVE,
  제한경쟁: STAGES.COMPETITIVE,
  지명경쟁: STAGES.COMPETITIVE,
  공개수의: STAGES.COMPETITIVE,
  비공개수의: STAGES.PRIVATE,
};

// 상태 레이블
export const STATUS_LABELS = {
  BEFORE_START: '시작 전',
  IN_PROGRESS: '진행 중',
  WAITING: '대기',
  DELAYED: '지연',
  COMPLETED: '완료',
  DELETED: '삭제',
} as const;

// 상태 색상
export const STATUS_COLORS = {
  BEFORE_START: 'bg-gray-100 text-gray-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-600',
  WAITING: 'bg-amber-100 text-amber-600',
  DELAYED: 'bg-red-100 text-red-600',
  COMPLETED: 'bg-green-100 text-green-600',
  DELETED: 'bg-gray-200 text-gray-500',
} as const;

// 카테고리 레이블
export const CATEGORY_LABELS = {
  GOODS_PURCHASE: '물품(구매)',
  GOODS_MANUFACTURE: '물품(제조)',
  SERVICE: '용역',
  CONSTRUCTION: '공사',
} as const;

// 계약 방법 레이블
export const METHOD_LABELS = {
  OPEN_BID: '일반경쟁',
  RESTRICTED_BID: '제한경쟁',
  NOMINATED_BID: '지명경쟁',
  OPEN_NEGOTIATION: '공개수의',
  PRIVATE_NEGOTIATION: '비공개수의',
} as const;

// 주의 계약 판정 기준
export const ALERT_THRESHOLDS = {
  CRITICAL_DAYS: 3, // D-3 이내: 경고
  WARNING_DAYS: 7, // D-7 이내: 주의
  WAITING_DAYS: 7, // 대기 상태 7일 이상: 주의
} as const;
