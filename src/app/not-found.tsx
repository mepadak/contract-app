import Link from 'next/link';
import { Home, Search, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-secondary p-4">
      <div className="flex w-full max-w-md flex-col items-center gap-8 rounded-3xl bg-surface-primary p-8 shadow-lg">
        {/* 아이콘 */}
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-50">
            <FileQuestion className="h-12 w-12 text-amber-500" />
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-surface-primary shadow-md">
            <span className="text-lg font-bold text-amber-500">?</span>
          </div>
        </div>

        {/* 텍스트 */}
        <div className="text-center">
          <h1 className="text-6xl font-bold text-accent-primary">404</h1>
          <h2 className="mt-2 text-xl font-semibold text-text-primary">
            페이지를 찾을 수 없습니다
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            요청하신 페이지가 존재하지 않거나
            <br />
            이동되었을 수 있습니다.
          </p>
        </div>

        {/* 버튼 */}
        <div className="flex w-full flex-col gap-3">
          <Link
            href="/chat"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-primary px-4 py-3 font-medium text-white transition-all hover:bg-accent-primary/90 active:scale-[0.98]"
          >
            <Home className="h-4 w-4" />
            홈으로 이동
          </Link>

          <Link
            href="/contracts"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-surface-secondary px-4 py-3 font-medium text-text-primary transition-all hover:bg-surface-tertiary active:scale-[0.98]"
          >
            <Search className="h-4 w-4" />
            계약 목록 보기
          </Link>
        </div>

        {/* 도움말 */}
        <p className="text-center text-xs text-text-muted">
          문제가 지속되면 관리자에게 문의해 주세요.
        </p>
      </div>
    </div>
  );
}
