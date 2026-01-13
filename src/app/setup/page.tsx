'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PinInput } from '@/components/auth/pin-input';
import { Shield, ChevronLeft } from 'lucide-react';

type Step = 'create' | 'confirm';

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('create');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFirstPin = (pin: string) => {
    setFirstPin(pin);
    setStep('confirm');
    setError('');
  };

  const handleConfirmPin = async (pin: string) => {
    if (pin !== firstPin) {
      setError('PIN이 일치하지 않습니다');
      setStep('create');
      setFirstPin('');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || '설정 중 오류가 발생했습니다');
      }

      router.push('/chat');
    } catch (err) {
      setError(err instanceof Error ? err.message : '설정 중 오류가 발생했습니다');
      setStep('create');
      setFirstPin('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep('create');
    setFirstPin('');
    setError('');
  };

  return (
    <div className="flex min-h-screen-safe flex-col bg-surface-primary">
      {/* Header */}
      <div className="flex h-11 items-center px-2">
        {step === 'confirm' && (
          <button
            type="button"
            onClick={handleBack}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-tertiary active:scale-95 transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-20">
        <div className="flex flex-col items-center gap-8 animate-scale-in">
          {/* Icon */}
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-accent-100 to-accent-50 shadow-lg shadow-accent-500/10">
              <Shield className="h-12 w-12 text-accent-600" strokeWidth={1.5} />
            </div>
            {/* Step indicator */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              <span
                className={`h-1.5 w-6 rounded-full transition-colors duration-300 ${
                  step === 'create' ? 'bg-accent-500' : 'bg-accent-200'
                }`}
              />
              <span
                className={`h-1.5 w-6 rounded-full transition-colors duration-300 ${
                  step === 'confirm' ? 'bg-accent-500' : 'bg-accent-200'
                }`}
              />
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              {step === 'create' ? 'PIN 설정' : 'PIN 확인'}
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              {step === 'create'
                ? '앱 보안을 위한 PIN을 설정합니다'
                : '같은 PIN을 다시 입력해주세요'}
            </p>
          </div>

          {/* PIN Input */}
          <PinInput
            key={step} // step 변경 시 리렌더링
            onComplete={step === 'create' ? handleFirstPin : handleConfirmPin}
            disabled={isLoading}
            error={error}
          />

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-text-secondary animate-fade-in">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-200 border-t-accent-600" />
              <span>설정 중...</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-8 text-center">
        <p className="text-xs text-text-tertiary">
          PIN은 이 기기에서 앱 접근 시 필요합니다
        </p>
      </div>
    </div>
  );
}
