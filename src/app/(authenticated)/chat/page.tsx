'use client';

import { useChat } from '@ai-sdk/react';
import { ChatContainer } from '@/components/chat/chat-container';
import { ChatInput } from '@/components/chat/chat-input';

// AI SDK 6.x UIMessage에서 텍스트 추출 헬퍼
function extractTextContent(parts: Array<{ type: string; text?: string }>): string {
  return parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

export default function ChatPage() {
  // AI SDK 6.x: api 옵션 제거 (기본값 '/api/chat' 사용)
  const { messages, sendMessage, status } = useChat();

  const isLoading = status === 'streaming' || status === 'submitted';

  // 메시지 변환: AI SDK 6.x UIMessage → 컴포넌트 형식
  const formattedMessages = messages.map((m) => ({
    id: m.id,
    role: m.role as 'user' | 'assistant',
    content: extractTextContent(m.parts),
  }));

  // 메시지 전송 핸들러
  // AI SDK 6.x: sendMessage({ text: string }) 형식 사용
  const handleSend = async (message: string) => {
    if (!message.trim()) return;
    await sendMessage({ text: message });
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
