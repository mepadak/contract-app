'use client';

import { useState, useRef, useEffect, KeyboardEvent, FormEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({
  onSend,
  isLoading = false,
  placeholder = '메시지를 입력하세요...',
  disabled = false,
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 텍스트 영역 높이 자동 조절
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [value]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isLoading && !disabled) {
      onSend(value.trim());
      setValue('');
      // 높이 리셋
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter로 전송 (Shift+Enter는 줄바꿈)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-surface-tertiary bg-surface-primary/80 backdrop-blur-lg">
      <form onSubmit={handleSubmit} className="p-3">
        <div className="flex items-end gap-2">
          {/* 입력 영역 */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              rows={1}
              className={cn(
                'w-full resize-none rounded-2xl px-4 py-3 pr-12',
                'bg-surface-secondary border border-surface-tertiary',
                'text-text-primary placeholder:text-text-tertiary',
                'focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50',
                'transition-all duration-200',
                'text-[15px] leading-relaxed',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'scrollbar-thin scrollbar-thumb-surface-tertiary'
              )}
              style={{ maxHeight: '120px' }}
            />
          </div>

          {/* 전송 버튼 */}
          <button
            type="submit"
            disabled={!value.trim() || isLoading || disabled}
            className={cn(
              'flex-shrink-0 w-11 h-11 rounded-full',
              'flex items-center justify-center',
              'transition-all duration-200',
              value.trim() && !isLoading && !disabled
                ? 'bg-gradient-to-br from-accent-primary to-accent-primary/90 text-white shadow-lg shadow-accent-primary/25 hover:shadow-xl hover:shadow-accent-primary/30 active:scale-95'
                : 'bg-surface-secondary text-text-tertiary',
              'disabled:cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* 안내 문구 */}
        <div className="mt-2 text-center">
          <span className="text-[11px] text-text-tertiary">
            Enter로 전송, Shift+Enter로 줄바꿈
          </span>
        </div>
      </form>
    </div>
  );
}
