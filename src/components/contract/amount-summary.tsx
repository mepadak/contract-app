'use client';

import { cn } from '@/lib/utils';
import { Coins, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface AmountSummaryProps {
  budget: number;
  budgetFormatted: string;
  contractAmount: number;
  contractAmountFormatted: string;
  executionAmount: number;
  executionAmountFormatted: string;
  contractBalance: number;
  contractBalanceFormatted: string;
  executionBalance: number;
  executionBalanceFormatted: string;
  // 하위호환: 기존 amount 필드
  amount?: number;
  amountFormatted?: string;
}

export function AmountSummary({
  budget,
  budgetFormatted,
  contractAmount,
  contractAmountFormatted,
  executionAmount,
  executionAmountFormatted,
  contractBalance,
  contractBalanceFormatted,
  executionBalanceFormatted,
  amount,
  amountFormatted,
}: AmountSummaryProps) {
  // 새 금액 구조 사용 여부 확인
  const hasNewAmountStructure = budget > 0 || contractAmount > 0 || executionAmount > 0;

  if (!hasNewAmountStructure && amount && amount > 0) {
    // 하위호환: 기존 amount만 있는 경우
    return (
      <div className="bg-surface-secondary rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Coins className="w-4 h-4 text-accent-primary" />
          <span className="text-sm font-medium text-text-primary">금액</span>
        </div>
        <p className="text-xl font-bold text-text-primary">{amountFormatted}</p>
      </div>
    );
  }

  if (!hasNewAmountStructure) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* 메인 금액 카드 */}
      <div className="grid grid-cols-2 gap-3">
        {/* 예산 */}
        <div className="bg-blue-50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-blue-600 mb-1">
            <Wallet className="w-3.5 h-3.5" />
            <span className="text-xs">예산</span>
          </div>
          <p className="text-sm font-bold text-blue-700">{budgetFormatted}</p>
        </div>

        {/* 계약금액 */}
        <div className="bg-violet-50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-violet-600 mb-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span className="text-xs">계약금액</span>
          </div>
          <p className="text-sm font-bold text-violet-700">{contractAmountFormatted}</p>
        </div>

        {/* 집행금액 */}
        <div className="bg-emerald-50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-xs">집행금액</span>
          </div>
          <p className="text-sm font-bold text-emerald-700">{executionAmountFormatted}</p>
        </div>

        {/* 계약잔액 */}
        <div className={cn(
          'rounded-xl p-3',
          contractBalance >= 0 ? 'bg-gray-50' : 'bg-red-50'
        )}>
          <div className={cn(
            'flex items-center gap-1.5 mb-1',
            contractBalance >= 0 ? 'text-gray-600' : 'text-red-600'
          )}>
            <Coins className="w-3.5 h-3.5" />
            <span className="text-xs">계약잔액</span>
          </div>
          <p className={cn(
            'text-sm font-bold',
            contractBalance >= 0 ? 'text-gray-700' : 'text-red-700'
          )}>
            {contractBalanceFormatted}
          </p>
        </div>
      </div>

      {/* 집행잔액 바 */}
      {contractAmount > 0 && (
        <div className="bg-surface-secondary rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-secondary">집행 진행률</span>
            <span className="text-xs font-medium text-text-primary">
              {executionBalanceFormatted} 남음
            </span>
          </div>
          <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((executionAmount / contractAmount) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-text-tertiary">
            <span>0</span>
            <span>{contractAmountFormatted}</span>
          </div>
        </div>
      )}
    </div>
  );
}
