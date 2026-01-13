'use client';

import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  isStreaming?: boolean;
}

export function MessageBubble({ role, content, timestamp, isStreaming }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser
            ? 'bg-gradient-to-br from-accent-primary to-accent-primary/80 text-white'
            : 'bg-surface-secondary text-text-secondary'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3',
          isUser
            ? 'bg-gradient-to-br from-accent-primary to-accent-primary/90 text-white rounded-tr-sm'
            : 'bg-surface-secondary text-text-primary rounded-tl-sm border border-surface-tertiary'
        )}
      >
        {/* Content */}
        <div className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
          {content}
          {isStreaming && (
            <span className="inline-flex ml-1">
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse ml-1" style={{ animationDelay: '0.2s' }} />
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse ml-1" style={{ animationDelay: '0.4s' }} />
            </span>
          )}
        </div>

        {/* Timestamp */}
        {timestamp && (
          <div
            className={cn(
              'text-[11px] mt-1.5',
              isUser ? 'text-white/70' : 'text-text-tertiary'
            )}
          >
            {timestamp.toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// 로딩 인디케이터 컴포넌트
export function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-in fade-in duration-300">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-secondary text-text-secondary flex items-center justify-center">
        <Bot className="w-4 h-4" />
      </div>
      <div className="bg-surface-secondary rounded-2xl rounded-tl-sm px-4 py-3 border border-surface-tertiary">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce" />
          <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>
    </div>
  );
}
