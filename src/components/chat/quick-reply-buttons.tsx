'use client';

import { cn } from '@/lib/utils';

export interface QuickReplyOption {
  label: string;
  value: string;
}

interface QuickReplyButtonsProps {
  options: QuickReplyOption[];
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export function QuickReplyButtons({ options, onSelect, disabled }: QuickReplyButtonsProps) {
  if (options.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {options.map((option, index) => (
        <button
          key={index}
          onClick={() => onSelect(option.value)}
          disabled={disabled}
          className={cn(
            'px-3 py-1.5 text-sm rounded-full border transition-all',
            'bg-accent-primary/10 border-accent-primary/30 text-accent-primary',
            'hover:bg-accent-primary hover:text-white hover:border-accent-primary',
            'active:scale-95',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

// 메시지에서 선택지 파싱
export function parseQuickReplyOptions(content: string): QuickReplyOption[] {
  const options: QuickReplyOption[] = [];

  // 패턴 1: [선택] 헤더 이후의 번호 목록
  // 예: "[선택] 계약 종류를 선택해주세요:\n1. 물품(구매)\n2. 용역"
  const selectMatch = content.match(/\[선택\][^\n]*\n((?:\d+\.\s+[^\n]+\n?)+)/);
  if (selectMatch) {
    const listText = selectMatch[1];
    const itemMatches = listText.matchAll(/(\d+)\.\s+([^\n]+)/g);
    for (const match of itemMatches) {
      options.push({
        label: match[2].trim(),
        value: match[1], // 숫자로 응답
      });
    }
    return options;
  }

  // 패턴 2: 단순 번호 목록 (마지막 5줄 이내)
  // 예: "다음 중 선택해주세요:\n1. 일반경쟁\n2. 수의계약"
  const lines = content.split('\n');
  const lastLines = lines.slice(-10);
  const numberedItems: QuickReplyOption[] = [];

  for (const line of lastLines) {
    const match = line.match(/^(\d+)\.\s+(.+)$/);
    if (match) {
      numberedItems.push({
        label: match[2].trim(),
        value: match[1],
      });
    }
  }

  // 2개 이상의 연속된 번호 목록이면 선택지로 판단
  if (numberedItems.length >= 2) {
    return numberedItems;
  }

  return options;
}
