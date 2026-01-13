'use client';

import { useChat } from '@ai-sdk/react';
import { useRef } from 'react';
import { ChatContainer } from '@/components/chat/chat-container';
import { ChatInput } from '@/components/chat/chat-input';

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput } = useChat({
    api: '/api/chat',
  });

  const formRef = useRef<HTMLFormElement>(null);

  // 메시지 변환: Vercel AI SDK 형식 -> 컴포넌트 형식
  const formattedMessages = messages.map((m) => ({
    id: m.id,
    role: m.role as 'user' | 'assistant',
    content: m.content,
    createdAt: m.createdAt,
  }));

  // 메시지 전송 핸들러
  const handleSend = (message: string) => {
    setInput(message);
    // 다음 틱에서 폼 제출
    setTimeout(() => {
      formRef.current?.requestSubmit();
    }, 0);
  };

  return (
    <div className="flex flex-1 flex-col h-full">
      {/* 채팅 메시지 영역 */}
      <ChatContainer
        messages={formattedMessages}
        isLoading={isLoading}
        className="flex-1"
        onQuickAction={handleSend}
      />

      {/* 입력 영역 */}
      <form ref={formRef} onSubmit={handleSubmit} className="hidden">
        <input
          value={input}
          onChange={handleInputChange}
        />
      </form>
      <ChatInput
        onSend={handleSend}
        isLoading={isLoading}
        placeholder="무엇을 도와드릴까요?"
      />
    </div>
  );
}
