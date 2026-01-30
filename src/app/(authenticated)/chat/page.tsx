'use client';

import { useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { ChatContainer } from '@/components/chat/chat-container';
import { ChatInput } from '@/components/chat/chat-input';
import { useChatPersistence } from '@/hooks/useChatPersistence';

// AI SDK 6.x UIMessage에서 텍스트 추출 헬퍼
function extractTextContent(parts: Array<{ type: string; text?: string }>): string {
  return parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

export default function ChatPage() {
  const { saveMessages, loadMessages } = useChatPersistence();
  const isInitializedRef = useRef(false);

  // AI SDK 6.x: useChat 훅
  const { messages, sendMessage, status, setMessages } = useChat();

  const isLoading = status === 'streaming' || status === 'submitted';

  // 초기화 시 저장된 메시지 복원 (한 번만 실행)
  useEffect(() => {
    if (!isInitializedRef.current && typeof window !== 'undefined') {
      isInitializedRef.current = true;
      const savedMessages = loadMessages();
      if (savedMessages.length > 0) {
        setMessages(savedMessages);
      }
    }
  }, [loadMessages, setMessages]);

  // 메시지 변경 시 저장
  useEffect(() => {
    if (messages.length > 0 && isInitializedRef.current) {
      saveMessages(messages);
    }
  }, [messages, saveMessages]);

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
