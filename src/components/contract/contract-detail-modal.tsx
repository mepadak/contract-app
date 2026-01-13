'use client';

import { cn, getDDay, formatDDay } from '@/lib/utils';
import { STATUS_COLORS, STATUS_LABELS, CATEGORY_LABELS, METHOD_LABELS } from '@/lib/constants';
import { X, Calendar, Building2, Coins, FileText, Clock, MessageSquare, History, Tag } from 'lucide-react';
import type { Status, Category, Method, Action } from '@prisma/client';

interface Note {
  id: number;
  content: string;
  tags: string[];
  createdAt: string;
}

interface HistoryItem {
  id: number;
  action: Action;
  detail: string | null;
  from: string | null;
  to: string | null;
  createdAt: string;
}

interface ContractDetail {
  id: string;
  title: string;
  category: Category;
  method: Method;
  amount: number;
  amountFormatted: string;
  status: Status;
  stage: string;
  progress: number;
  stages: string[];
  requester: string | null;
  requesterContact: string | null;
  contractor: string | null;
  deadline: string | null;
  budgetYear: number;
  createdAt: string;
  updatedAt: string;
}

interface ContractDetailModalProps {
  contract: ContractDetail;
  notes: Note[];
  history: HistoryItem[];
  isOpen: boolean;
  onClose: () => void;
}

export function ContractDetailModal({
  contract,
  notes,
  history,
  isOpen,
  onClose,
}: ContractDetailModalProps) {
  if (!isOpen) return null;

  const statusColor = STATUS_COLORS[contract.status] || 'gray';
  const statusLabel = STATUS_LABELS[contract.status] || contract.status;
  const categoryLabel = CATEGORY_LABELS[contract.category] || contract.category;
  const methodLabel = METHOD_LABELS[contract.method] || contract.method;

  const dDay = contract.deadline ? getDDay(new Date(contract.deadline)) : null;

  return (
    <div className="fixed inset-0 z-50">
      {/* 백드롭 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* 모달 */}
      <div className="absolute bottom-0 left-0 right-0 max-h-[90vh] bg-surface-primary rounded-t-3xl animate-in slide-in-from-bottom duration-300 overflow-hidden flex flex-col">
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-surface-tertiary rounded-full" />
        </div>

        {/* 헤더 */}
        <div className="flex items-start justify-between px-5 pb-4 border-b border-surface-tertiary">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-mono text-accent-primary">{contract.id}</span>
              <StatusBadge color={statusColor} label={statusLabel} />
            </div>
            <h2 className="text-lg font-semibold text-text-primary truncate">{contract.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-6">
            {/* 진행률 */}
            <section>
              <h3 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                진행 현황
              </h3>
              <div className="bg-surface-secondary rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-text-primary">{contract.stage}</span>
                  <span className="text-sm text-accent-primary font-medium">{contract.progress}%</span>
                </div>
                <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      contract.progress === 100 ? 'bg-emerald-500' : 'bg-accent-primary'
                    )}
                    style={{ width: `${contract.progress}%` }}
                  />
                </div>
                {/* 단계 표시 */}
                <div className="flex justify-between mt-3 text-[10px] text-text-tertiary">
                  {contract.stages.slice(0, 4).map((s, i) => (
                    <span key={i} className={cn(contract.stage === s && 'text-accent-primary font-medium')}>
                      {s}
                    </span>
                  ))}
                  {contract.stages.length > 4 && <span>...</span>}
                </div>
              </div>
            </section>

            {/* 기본 정보 */}
            <section>
              <h3 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                기본 정보
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <InfoCard icon={FileText} label="종류" value={categoryLabel} />
                <InfoCard icon={Building2} label="방법" value={methodLabel} />
                <InfoCard icon={Coins} label="금액" value={contract.amountFormatted} />
                <InfoCard
                  icon={Calendar}
                  label="마감일"
                  value={contract.deadline || '-'}
                  badge={dDay !== null ? formatDDay(dDay) : undefined}
                  badgeType={dDay !== null && dDay < 0 ? 'danger' : dDay !== null && dDay <= 7 ? 'warning' : 'default'}
                />
              </div>
            </section>

            {/* 관련 정보 */}
            {(contract.requester || contract.contractor) && (
              <section>
                <h3 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  관련 정보
                </h3>
                <div className="space-y-3">
                  {contract.requester && (
                    <div className="bg-surface-secondary rounded-xl p-3">
                      <span className="text-xs text-text-tertiary block mb-1">요청부서</span>
                      <span className="text-sm text-text-primary">{contract.requester}</span>
                      {contract.requesterContact && (
                        <span className="text-xs text-text-tertiary ml-2">({contract.requesterContact})</span>
                      )}
                    </div>
                  )}
                  {contract.contractor && (
                    <div className="bg-surface-secondary rounded-xl p-3">
                      <span className="text-xs text-text-tertiary block mb-1">계약상대방</span>
                      <span className="text-sm text-text-primary">{contract.contractor}</span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* 메모 */}
            {notes.length > 0 && (
              <section>
                <h3 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  메모 ({notes.length})
                </h3>
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div key={note.id} className="bg-surface-secondary rounded-xl p-3">
                      <p className="text-sm text-text-primary whitespace-pre-wrap">{note.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        {note.tags.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap">
                            <Tag className="w-3 h-3 text-text-tertiary" />
                            {note.tags.map((tag, i) => (
                              <span key={i} className="text-[10px] text-accent-primary bg-accent-primary/10 px-1.5 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <span className="text-[10px] text-text-tertiary">
                          {new Date(note.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 변경 이력 */}
            {history.length > 0 && (
              <section>
                <h3 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  변경 이력
                </h3>
                <div className="space-y-2">
                  {history.slice(0, 10).map((item) => (
                    <div key={item.id} className="flex items-start gap-3 py-2 border-b border-surface-tertiary last:border-0">
                      <div className="w-2 h-2 rounded-full bg-accent-primary/50 mt-1.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-primary">{item.detail}</p>
                        {item.from && item.to && (
                          <p className="text-xs text-text-tertiary mt-0.5">
                            {item.from} → {item.to}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] text-text-tertiary flex-shrink-0">
                        {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 상태 배지
function StatusBadge({ color, label }: { color: string; label: string }) {
  const colorClasses: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-600',
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600',
    red: 'bg-red-100 text-red-600',
    emerald: 'bg-emerald-100 text-emerald-600',
  };

  return (
    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', colorClasses[color] || colorClasses.gray)}>
      {label}
    </span>
  );
}

// 정보 카드
function InfoCard({
  icon: Icon,
  label,
  value,
  badge,
  badgeType = 'default',
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  badge?: string;
  badgeType?: 'default' | 'warning' | 'danger';
}) {
  const badgeClasses = {
    default: 'bg-surface-tertiary text-text-secondary',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
  };

  return (
    <div className="bg-surface-secondary rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-text-tertiary mb-1">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-primary">{value}</span>
        {badge && (
          <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded', badgeClasses[badgeType])}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
