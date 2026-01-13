'use client';

import { useChat } from '@ai-sdk/react';
import { ChatContainer } from '@/components/chat/chat-container';
import { ChatInput } from '@/components/chat/chat-input';

export default function ChatPage() {
  const { messages, sendMessage, status } = useChat({
    api: '/api/chat',
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  // 메시지 변환: Vercel AI SDK 형식 -> 컴포넌트 형식
  const formattedMessages = messages.map((m) => ({
    id: m.id,
    role: m.role as 'user' | 'assistant',
    content: m.content,
    createdAt: m.createdAt,
  }));

  // 메시지 전송 핸들러
  const handleSend = async (message: string) => {
    if (!message.trim()) return;
    await sendMessage(message);
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
      <ChatInput
        onSend={handleSend}
        isLoading={isLoading}
        placeholder="무엇을 도와드릴까요?"
      />
    </div>
  );
}
