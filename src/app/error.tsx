'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-secondary p-4">
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-3xl bg-surface-primary p-8 shadow-lg">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>

        <div className="text-center">
          <h1 className="text-xl font-semibold text-text-primary">
            문제가 발생했습니다
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            일시적인 오류가 발생했습니다. 다시 시도해 주세요.
          </p>
          {error.digest && (
            <p className="mt-2 font-mono text-xs text-text-muted">
              오류 코드: {error.digest}
            </p>
          )}
        </div>

        <div className="flex w-full flex-col gap-3">
          <button
            onClick={reset}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-primary px-4 py-3 font-medium text-white transition-all hover:bg-accent-primary/90 active:scale-[0.98]"
          >
            <RefreshCw className="h-4 w-4" />
            다시 시도
          </button>

          <Link
            href="/chat"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-surface-secondary px-4 py-3 font-medium text-text-primary transition-all hover:bg-surface-tertiary active:scale-[0.98]"
          >
            <Home className="h-4 w-4" />
            홈으로 이동
          </Link>
        </div>
      </div>
    </div>
  );
}
