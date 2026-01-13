export default function ContractsLoading() {
  return (
    <div className="flex flex-1 flex-col p-4 pb-24">
      <div className="animate-pulse space-y-4">
        {/* 헤더 스켈레톤 */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-28 rounded-lg bg-surface-secondary" />
          <div className="h-8 w-8 rounded-lg bg-surface-secondary" />
        </div>

        {/* 검색 바 스켈레톤 */}
        <div className="h-12 w-full rounded-xl bg-surface-secondary" />

        {/* 필터 칩 스켈레톤 */}
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-20 rounded-full bg-surface-secondary" />
          ))}
        </div>

        {/* 계약 카드 스켈레톤 */}
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-surface-tertiary bg-surface-primary p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="h-5 w-16 rounded bg-surface-secondary" />
              <div className="h-6 w-16 rounded-full bg-surface-secondary" />
            </div>
            <div className="mb-3 h-5 w-40 rounded bg-surface-secondary" />
            <div className="mb-3 flex gap-2">
              <div className="h-4 w-12 rounded bg-surface-secondary" />
              <div className="h-4 w-16 rounded bg-surface-secondary" />
              <div className="h-4 w-24 rounded bg-surface-secondary" />
            </div>
            <div className="mb-2 flex items-center gap-2">
              <div className="h-3 w-12 rounded bg-surface-secondary" />
              <div className="h-2 flex-1 rounded-full bg-surface-secondary" />
              <div className="h-3 w-8 rounded bg-surface-secondary" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-surface-secondary" />
              <div className="h-3 w-32 rounded bg-surface-secondary" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
