'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface PinInputProps {
  length?: number;
  onComplete: (pin: string) => void;
  disabled?: boolean;
  error?: string;
}

export function PinInput({
  length = 4,
  onComplete,
  disabled = false,
  error,
}: PinInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // 첫 번째 입력에 포커스
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // 에러 발생 시 초기화
    if (error) {
      setValues(Array(length).fill(''));
      setFocusedIndex(0);
      const timer = setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [error, length]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newValues = [...values];
    newValues[index] = value.slice(-1);
    setValues(newValues);

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }

    if (newValues.every((v) => v) && newValues.join('').length === length) {
      onComplete(newValues.join(''));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!values[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        setFocusedIndex(index - 1);
      } else {
        const newValues = [...values];
        newValues[index] = '';
        setValues(newValues);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pastedData) return;

    const newValues = [...values];
    pastedData.split('').forEach((char, i) => {
      if (i < length) newValues[i] = char;
    });
    setValues(newValues);

    const lastFilledIndex = Math.min(pastedData.length - 1, length - 1);
    inputRefs.current[lastFilledIndex]?.focus();
    setFocusedIndex(lastFilledIndex);

    if (newValues.every((v) => v)) {
      onComplete(newValues.join(''));
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
    // 입력값이 있으면 선택
    inputRefs.current[index]?.select();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-3">
        {values.map((value, index) => (
          <div key={index} className="relative">
            <input
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={value}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              onFocus={() => handleFocus(index)}
              disabled={disabled}
              autoComplete="one-time-code"
              className={cn(
                'h-14 w-12 rounded-xl border-2 bg-surface-elevated text-center text-2xl font-semibold',
                'text-text-primary caret-accent-500',
                'transition-all duration-200',
                'focus:outline-none',
                error
                  ? 'border-red-400 animate-shake'
                  : focusedIndex === index
                    ? 'border-accent-500 shadow-md shadow-accent-500/10'
                    : value
                      ? 'border-accent-200 bg-accent-50/30'
                      : 'border-border-default',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            />
            {/* 입력 인디케이터 */}
            {!value && focusedIndex === index && !disabled && (
              <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="w-0.5 h-6 bg-accent-500 animate-pulse rounded-full" />
              </span>
            )}
          </div>
        ))}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <p className="text-sm text-red-500 animate-slide-up font-medium">{error}</p>
      )}

      {/* 힌트 */}
      {!error && (
        <p className="text-xs text-text-tertiary">4자리 숫자를 입력하세요</p>
      )}
    </div>
  );
}
