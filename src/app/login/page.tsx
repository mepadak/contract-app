'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PinInput } from '@/components/auth/pin-input';
import { FileText } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);

  useEffect(() => {
    // PIN 설정 여부 확인
    fetch('/api/auth/setup')
      .then((res) => res.json())
      .then((data) => {
        if (!data.isSetup) {
          router.replace('/setup');
        }
      })
      .catch(() => {
        // 에러 시에도 로그인 페이지 표시
      })
      .finally(() => setCheckingSetup(false));
  }, [router]);

  const handlePin = async (pin: string) => {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setError(data.error?.message || '잠시 후 다시 시도해주세요');
        } else if (data.remaining !== undefined) {
          setError(`PIN이 일치하지 않습니다 (${data.remaining}회 남음)`);
        } else {
          setError(data.error?.message || 'PIN 확인 중 오류가 발생했습니다');
        }
        return;
      }

      router.push('/chat');
    } catch {
      setError('서버와 연결할 수 없습니다');
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSetup) {
    return (
      <div className="flex min-h-screen-safe items-center justify-center bg-surface-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-accent-200 border-t-accent-600" />
          <p className="text-sm text-text-tertiary">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen-safe flex-col bg-surface-primary">
      {/* Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center gap-8 animate-scale-in">
          {/* Logo */}
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-surface-tertiary to-surface-secondary shadow-lg">
              <FileText className="h-12 w-12 text-text-secondary" strokeWidth={1.5} />
            </div>
            {/* Decorative ring */}
            <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/5" />
          </div>

          {/* Title */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Contract Manager
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              계속하려면 PIN을 입력하세요
            </p>
          </div>

          {/* PIN Input */}
          <PinInput
            onComplete={handlePin}
            disabled={isLoading}
            error={error}
          />

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-text-secondary animate-fade-in">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-200 border-t-accent-600" />
              <span>확인 중...</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-8 text-center">
        <p className="text-xs text-text-tertiary">
          국가계약 업무 관리 시스템
        </p>
      </div>
    </div>
  );
}
