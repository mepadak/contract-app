export default function ChatLoading() {
  return (
    <div className="flex flex-1 flex-col p-4 pb-24">
      <div className="flex flex-1 flex-col gap-4">
        {/* AI 메시지 스켈레톤 */}
        <div className="flex gap-2">
          <div className="h-8 w-8 animate-pulse rounded-full bg-surface-secondary" />
          <div className="flex max-w-[80%] flex-col gap-2">
            <div className="h-20 w-64 animate-pulse rounded-2xl bg-surface-secondary" />
            <div className="h-3 w-16 animate-pulse rounded bg-surface-secondary" />
          </div>
        </div>

        {/* 사용자 메시지 스켈레톤 */}
        <div className="flex justify-end">
          <div className="flex flex-col items-end gap-2">
            <div className="h-12 w-48 animate-pulse rounded-2xl bg-accent-primary/20" />
            <div className="h-3 w-12 animate-pulse rounded bg-surface-secondary" />
          </div>
        </div>

        {/* AI 응답 스켈레톤 */}
        <div className="flex gap-2">
          <div className="h-8 w-8 animate-pulse rounded-full bg-surface-secondary" />
          <div className="flex max-w-[80%] flex-col gap-2">
            <div className="h-32 w-72 animate-pulse rounded-2xl bg-surface-secondary" />
            <div className="h-3 w-16 animate-pulse rounded bg-surface-secondary" />
          </div>
        </div>
      </div>

      {/* 입력 영역 스켈레톤 */}
      <div className="fixed bottom-20 left-0 right-0 bg-gradient-to-t from-surface-secondary via-surface-secondary to-transparent px-4 pb-4 pt-6">
        <div className="h-12 animate-pulse rounded-xl bg-surface-tertiary" />
      </div>
    </div>
  );
}
