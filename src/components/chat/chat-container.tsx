'use client';

import { useRef, useEffect } from 'react';
import { MessageBubble, TypingIndicator } from './message-bubble';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date;
}

interface ChatContainerProps {
  messages: Message[];
  isLoading?: boolean;
  className?: string;
}

export function ChatContainer({ messages, isLoading, className }: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 새 메시지 시 자동 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        'flex-1 overflow-y-auto',
        'scrollbar-thin scrollbar-thumb-surface-tertiary scrollbar-track-transparent',
        className
      )}
    >
      <div className="p-4 space-y-4">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              role={message.role}
              content={message.content}
              timestamp={message.createdAt}
            />
          ))
        )}

        {/* 로딩 인디케이터 */}
        {isLoading && <TypingIndicator />}

        {/* 스크롤 앵커 */}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

// 빈 상태 컴포넌트
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-6">
      {/* 로고/아이콘 */}
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent-primary/10 to-accent-primary/5 flex items-center justify-center mb-6 animate-in zoom-in duration-500">
        <svg
          className="w-10 h-10 text-accent-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>

      {/* 인사말 */}
      <h2 className="text-xl font-semibold text-text-primary mb-2 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
        안녕하세요!
      </h2>
      <p className="text-text-secondary mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
        계약 관리 AI 어시스턴트입니다
      </p>

      {/* 예시 명령어 */}
      <div className="w-full max-w-sm space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        <QuickAction text="서버 유지보수 용역 5천만원 등록해줘" />
        <QuickAction text="전체 계약 목록 보여줘" />
        <QuickAction text="대시보드 현황" />
      </div>
    </div>
  );
}

// 퀵 액션 버튼
function QuickAction({ text }: { text: string }) {
  return (
    <button
      type="button"
      className={cn(
        'w-full px-4 py-3 rounded-xl',
        'bg-surface-secondary/50 border border-surface-tertiary',
        'text-left text-sm text-text-secondary',
        'hover:bg-surface-secondary hover:border-accent-primary/20',
        'transition-all duration-200',
        'group'
      )}
    >
      <span className="text-accent-primary/60 group-hover:text-accent-primary transition-colors">
        &quot;
      </span>
      {text}
      <span className="text-accent-primary/60 group-hover:text-accent-primary transition-colors">
        &quot;
      </span>
    </button>
  );
}
