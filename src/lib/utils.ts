import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 한국어 금액 파싱
export function parseKoreanAmount(text: string): number | null {
  const normalized = text.replace(/\s/g, '').replace(/,/g, '');

  let total = 0;
  let remaining = normalized;

  // 조
  const joMatch = /(\d+(?:\.\d+)?)조/.exec(remaining);
  if (joMatch) {
    total += parseFloat(joMatch[1]) * 1_000_000_000_000;
    remaining = remaining.replace(joMatch[0], '');
  }

  // 억
  const ukMatch = /(\d+(?:\.\d+)?)억/.exec(remaining);
  if (ukMatch) {
    total += parseFloat(ukMatch[1]) * 100_000_000;
    remaining = remaining.replace(ukMatch[0], '');
  }

  // 천만
  const chunmanMatch = /(\d+(?:\.\d+)?)천만/.exec(remaining);
  if (chunmanMatch) {
    total += parseFloat(chunmanMatch[1]) * 10_000_000;
    remaining = remaining.replace(chunmanMatch[0], '');
  }

  // 백만
  const baekmanMatch = /(\d+(?:\.\d+)?)백만/.exec(remaining);
  if (baekmanMatch) {
    total += parseFloat(baekmanMatch[1]) * 1_000_000;
    remaining = remaining.replace(baekmanMatch[0], '');
  }

  // 만
  const manMatch = /(\d+(?:\.\d+)?)만/.exec(remaining);
  if (manMatch) {
    total += parseFloat(manMatch[1]) * 10_000;
    remaining = remaining.replace(manMatch[0], '');
  }

  // 천
  const chunMatch = /(\d+(?:\.\d+)?)천/.exec(remaining);
  if (chunMatch) {
    total += parseFloat(chunMatch[1]) * 1_000;
    remaining = remaining.replace(chunMatch[0], '');
  }

  // 남은 숫자 처리 (원 단위)
  const numMatch = /(\d+)/.exec(remaining);
  if (numMatch) {
    total += parseInt(numMatch[1], 10);
  }

  return total > 0 ? total : null;
}

// 금액 포맷팅
export function formatAmount(amount: number | bigint): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

// 금액 간략 포맷팅 (5억, 5천만원 등)
export function formatAmountShort(amount: number | bigint): string {
  const num = Number(amount);
  if (num >= 100_000_000) {
    const uk = num / 100_000_000;
    return uk % 1 === 0 ? `${uk}억` : `${uk.toFixed(1)}억`;
  }
  if (num >= 10_000_000) {
    const chunman = num / 10_000_000;
    return chunman % 1 === 0 ? `${chunman}천만원` : `${chunman.toFixed(1)}천만원`;
  }
  if (num >= 10_000) {
    const man = num / 10_000;
    return man % 1 === 0 ? `${man}만원` : `${man.toFixed(0)}만원`;
  }
  return formatAmount(num);
}

// 날짜 포맷팅
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

// D-Day 계산 (숫자 반환)
export function getDDay(deadline: Date | string): number {
  const target = typeof deadline === 'string' ? new Date(deadline) : deadline;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// D-Day 포맷팅 (표시용)
export function formatDDay(days: number): string {
  if (days === 0) return 'D-Day';
  if (days > 0) return `D-${days}`;
  return `D+${Math.abs(days)}`;
}
