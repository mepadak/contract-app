export default function DashboardLoading() {
  return (
    <div className="flex flex-1 flex-col p-4 pb-24">
      <div className="animate-pulse space-y-4">
        {/* 헤더 스켈레톤 */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 rounded-lg bg-surface-secondary" />
          <div className="h-8 w-8 rounded-lg bg-surface-secondary" />
        </div>

        {/* 예산 카드 스켈레톤 */}
        <div className="rounded-2xl bg-surface-primary p-5 shadow-sm">
          <div className="mb-4 h-5 w-28 rounded bg-surface-secondary" />
          <div className="mb-4 h-3 w-full rounded-full bg-surface-secondary" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl bg-surface-secondary p-3">
                <div className="mb-2 h-3 w-12 rounded bg-surface-tertiary" />
                <div className="h-5 w-20 rounded bg-surface-tertiary" />
              </div>
            ))}
          </div>
        </div>

        {/* 상태별 현황 스켈레톤 */}
        <div className="rounded-2xl bg-surface-primary p-5 shadow-sm">
          <div className="mb-4 h-5 w-24 rounded bg-surface-secondary" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-4 w-12 rounded bg-surface-secondary" />
                <div className="h-4 flex-1 rounded-full bg-surface-secondary" />
                <div className="h-4 w-8 rounded bg-surface-secondary" />
              </div>
            ))}
          </div>
        </div>

        {/* 주의 계약 스켈레톤 */}
        <div className="rounded-2xl bg-surface-primary p-5 shadow-sm">
          <div className="mb-4 h-5 w-20 rounded bg-surface-secondary" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl bg-surface-secondary p-3"
              >
                <div className="h-6 w-6 rounded-full bg-surface-tertiary" />
                <div className="flex-1">
                  <div className="mb-1 h-4 w-32 rounded bg-surface-tertiary" />
                  <div className="h-3 w-20 rounded bg-surface-tertiary" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
