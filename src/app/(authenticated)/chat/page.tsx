'use client';

import { MessageCircle, Sparkles } from 'lucide-react';

export default function ChatPage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Empty State */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-20">
        <div className="flex flex-col items-center gap-6 text-center animate-scale-in">
          {/* Icon */}
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-100 to-accent-50">
              <MessageCircle className="h-10 w-10 text-accent-600" strokeWidth={1.5} />
            </div>
            <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-100">
              <Sparkles className="h-4 w-4 text-amber-600" strokeWidth={2} />
            </div>
          </div>

          {/* Text */}
          <div>
            <h2 className="text-xl font-semibold text-text-primary">
              AI 어시스턴트
            </h2>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
              자연어로 계약 업무를 관리하세요
              <br />
              <span className="text-text-tertiary">
                Phase 2에서 구현됩니다
              </span>
            </p>
          </div>

          {/* Example Commands */}
          <div className="mt-4 flex flex-col gap-2 w-full max-w-xs">
            <p className="text-xs font-medium text-text-tertiary uppercase tracking-wide">
              예시 명령어
            </p>
            {[
              '"서버 유지보수 5천만원 등록"',
              '"전체 목록 보여줘"',
              '"대시보드"',
            ].map((example, i) => (
              <div
                key={i}
                className="px-4 py-3 rounded-xl bg-surface-secondary text-sm text-text-secondary text-left"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {example}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Input Area Placeholder */}
      <div className="border-t border-border-subtle bg-surface-primary p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 rounded-xl bg-surface-secondary px-4 py-3 text-sm text-text-tertiary">
            메시지를 입력하세요...
          </div>
          <button
            type="button"
            disabled
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500 text-white opacity-50"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
