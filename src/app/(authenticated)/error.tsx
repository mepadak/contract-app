'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function AuthenticatedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Authenticated area error:', error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4 pb-24">
      <div className="flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl bg-surface-primary p-6 shadow-md">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>

        <div className="text-center">
          <h2 className="text-lg font-semibold text-text-primary">
            오류가 발생했습니다
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            페이지를 불러오는 중 문제가 발생했습니다.
          </p>
          {error.digest && (
            <p className="mt-2 font-mono text-xs text-text-muted">
              {error.digest}
            </p>
          )}
        </div>

        <div className="flex w-full flex-col gap-2">
          <button
            onClick={reset}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-primary px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-accent-primary/90 active:scale-[0.98]"
          >
            <RefreshCw className="h-4 w-4" />
            다시 시도
          </button>

          <Link
            href="/chat"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-surface-secondary px-4 py-2.5 text-sm font-medium text-text-primary transition-all hover:bg-surface-tertiary active:scale-[0.98]"
          >
            <MessageCircle className="h-4 w-4" />
            채팅으로 이동
          </Link>
        </div>
      </div>
    </div>
  );
}
