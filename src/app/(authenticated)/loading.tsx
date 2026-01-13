export default function AuthenticatedLoading() {
  return (
    <div className="flex flex-1 items-center justify-center p-4 pb-24">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-surface-tertiary border-t-accent-primary" />
        </div>
        <p className="text-sm text-text-secondary">로딩 중...</p>
      </div>
    </div>
  );
}
