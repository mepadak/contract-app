'use client';

import { cn, getDDay, formatDDay } from '@/lib/utils';
import { STATUS_COLORS, STATUS_LABELS, CATEGORY_LABELS, METHOD_LABELS, STAGE_COLORS } from '@/lib/constants';
import { Calendar, ChevronRight } from 'lucide-react';
import type { Status, Category, Method } from '@prisma/client';

interface ContractCardProps {
  id: string;
  title: string;
  category: Category;
  method: Method;
  amount: number;
  amountFormatted: string;
  status: Status;
  stage: string;
  progress: number;
  deadline?: string | null;
  onClick?: () => void;
}

export function ContractCard({
  id,
  title,
  category,
  method,
  amountFormatted,
  status,
  stage,
  deadline,
  onClick,
}: ContractCardProps) {
  const statusColor = STATUS_COLORS[status] || 'gray';
  const statusLabel = STATUS_LABELS[status] || status;
  const categoryLabel = CATEGORY_LABELS[category] || category;
  const methodLabel = METHOD_LABELS[method] || method;

  const dDay = deadline ? getDDay(new Date(deadline)) : null;
  const isUrgent = dDay !== null && dDay <= 7 && dDay >= 0;
  const isOverdue = dDay !== null && dDay < 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left',
        'bg-surface-primary rounded-2xl',
        'border border-surface-tertiary',
        'p-4',
        'shadow-sm hover:shadow-md',
        'transition-all duration-200',
        'active:scale-[0.99]',
        'group'
      )}
    >
      {/* 헤더: ID + 상태 */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-mono text-accent-primary">{id}</span>
        <StatusBadge color={statusColor} label={statusLabel} />
      </div>

      {/* 계약명 */}
      <h3 className="text-base font-semibold text-text-primary mb-2 line-clamp-2 group-hover:text-accent-primary transition-colors">
        {title}
      </h3>

      {/* 정보: 종류 | 방법 | 금액 */}
      <div className="flex items-center gap-2 text-sm text-text-secondary mb-3">
        <span>{categoryLabel}</span>
        <span className="text-text-tertiary">|</span>
        <span>{methodLabel}</span>
        <span className="text-text-tertiary">|</span>
        <span className="font-medium text-text-primary">{amountFormatted}</span>
      </div>

      {/* 단계 배지 */}
      <div className="mb-3">
        <StageBadge stage={stage} />
      </div>

      {/* 마감일 */}
      {deadline && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-text-tertiary" />
            <span className="text-xs text-text-secondary">{deadline}</span>
          </div>
          {dDay !== null && (
            <span
              className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                isOverdue
                  ? 'bg-red-100 text-red-700'
                  : isUrgent
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-surface-secondary text-text-secondary'
              )}
            >
              {formatDDay(dDay)}
            </span>
          )}
        </div>
      )}

      {/* 화살표 인디케이터 */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight className="w-5 h-5 text-text-tertiary" />
      </div>
    </button>
  );
}

// 상태 배지
function StatusBadge({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  const colorClasses: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-600',
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600',
    red: 'bg-red-100 text-red-600',
    emerald: 'bg-emerald-100 text-emerald-600',
  };

  return (
    <span
      className={cn(
        'text-xs font-medium px-2 py-1 rounded-full',
        colorClasses[color] || colorClasses.gray
      )}
    >
      {label}
    </span>
  );
}

// 단계 배지
function StageBadge({ stage }: { stage: string }) {
  const stageColor = STAGE_COLORS[stage] || 'gray';

  const colorClasses: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
    blue: 'bg-blue-100 text-blue-600 border-blue-200',
    indigo: 'bg-indigo-100 text-indigo-600 border-indigo-200',
    violet: 'bg-violet-100 text-violet-600 border-violet-200',
    amber: 'bg-amber-100 text-amber-600 border-amber-200',
    orange: 'bg-orange-100 text-orange-600 border-orange-200',
    emerald: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    gray: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-lg border',
        colorClasses[stageColor] || colorClasses.gray
      )}
    >
      {stage}
    </span>
  );
}

// 스켈레톤 로딩
export function ContractCardSkeleton() {
  return (
    <div className="bg-surface-primary rounded-2xl border border-surface-tertiary p-4 animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-5 w-16 bg-surface-secondary rounded" />
        <div className="h-6 w-16 bg-surface-secondary rounded-full" />
      </div>
      <div className="h-5 w-3/4 bg-surface-secondary rounded mb-2" />
      <div className="h-4 w-1/2 bg-surface-secondary rounded mb-3" />
      <div className="h-1.5 bg-surface-secondary rounded-full mb-3" />
      <div className="h-4 w-1/3 bg-surface-secondary rounded" />
    </div>
  );
}
