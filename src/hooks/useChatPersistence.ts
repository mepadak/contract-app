'use client';

import { useCallback } from 'react';

const STORAGE_KEY = 'chat-messages';

// 메시지를 any 타입으로 처리 (AI SDK 버전 호환성)
export function useChatPersistence() {
  // sessionStorage에 메시지 저장
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const saveMessages = useCallback((messages: any[]) => {
    if (typeof window === 'undefined') return;

    try {
      // 최근 50개 메시지만 저장 (메모리 절약)
      const messagesToSave = messages.slice(-50);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messagesToSave));
    } catch (error) {
      console.error('Failed to save chat messages:', error);
    }
  }, []);

  // sessionStorage에서 메시지 복원
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loadMessages = useCallback((): any[] => {
    if (typeof window === 'undefined') return [];

    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (!saved) return [];

      const messages = JSON.parse(saved);
      return messages;
    } catch (error) {
      console.error('Failed to load chat messages:', error);
      return [];
    }
  }, []);

  // 메시지 초기화
  const clearMessages = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear chat messages:', error);
    }
  }, []);

  return {
    saveMessages,
    loadMessages,
    clearMessages,
  };
}
