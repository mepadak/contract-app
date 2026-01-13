'use client';

import { cn } from '@/lib/utils';
import { Check, X, Edit3, FileText, Calendar, Building2, Coins } from 'lucide-react';

interface ContractPreview {
  id?: string;
  title: string;
  category: string;
  method: string;
  amount?: number;
  amountFormatted?: string;
  requester?: string;
  deadline?: string;
  stage?: string;
  status?: string;
}

interface PreviewCardProps {
  type: 'create' | 'update' | 'delete';
  contract: ContractPreview;
  changes?: Array<{ field: string; from: string; to: string }>;
  onConfirm?: () => void;
  onCancel?: () => void;
  onEdit?: () => void;
  isLoading?: boolean;
}

export function PreviewCard({
  type,
  contract,
  changes,
  onConfirm,
  onCancel,
  onEdit,
  isLoading,
}: PreviewCardProps) {
  const typeConfig = {
    create: {
      title: '계약 등록 미리보기',
      icon: FileText,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
    },
    update: {
      title: '변경 미리보기',
      icon: Edit3,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
    },
    delete: {
      title: '삭제 확인',
      icon: X,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div
        className={cn(
          'rounded-2xl border overflow-hidden',
          'bg-surface-primary shadow-lg shadow-black/5',
          config.border
        )}
      >
        {/* 헤더 */}
        <div className={cn('px-4 py-3 flex items-center gap-2', config.bg)}>
          <Icon className={cn('w-4 h-4', config.color)} />
          <span className={cn('text-sm font-medium', config.color)}>
            {config.title}
          </span>
        </div>

        {/* 내용 */}
        <div className="p-4">
          {type === 'delete' ? (
            <DeletePreview contract={contract} />
          ) : type === 'update' && changes ? (
            <UpdatePreview contract={contract} changes={changes} />
          ) : (
            <CreatePreview contract={contract} />
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="px-4 pb-4 flex gap-2">
          {onConfirm && (
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={cn(
                'flex-1 py-2.5 rounded-xl font-medium text-sm',
                'bg-accent-primary text-white',
                'hover:bg-accent-primary/90 active:scale-[0.98]',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'flex items-center justify-center gap-2'
              )}
            >
              <Check className="w-4 h-4" />
              확인
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              disabled={isLoading}
              className={cn(
                'flex-1 py-2.5 rounded-xl font-medium text-sm',
                'bg-surface-secondary text-text-secondary',
                'hover:bg-surface-tertiary active:scale-[0.98]',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'flex items-center justify-center gap-2'
              )}
            >
              <Edit3 className="w-4 h-4" />
              수정
            </button>
          )}
          {onCancel && (
            <button
              onClick={onCancel}
              disabled={isLoading}
              className={cn(
                'flex-1 py-2.5 rounded-xl font-medium text-sm',
                'bg-surface-secondary text-text-secondary',
                'hover:bg-surface-tertiary active:scale-[0.98]',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'flex items-center justify-center gap-2'
              )}
            >
              <X className="w-4 h-4" />
              취소
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// 생성 미리보기
function CreatePreview({ contract }: { contract: ContractPreview }) {
  return (
    <div className="space-y-3">
      {/* 계약명 */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary">{contract.title}</h3>
      </div>

      {/* 정보 그리드 */}
      <div className="grid grid-cols-2 gap-3">
        <InfoItem icon={FileText} label="종류" value={contract.category} />
        <InfoItem icon={Building2} label="방법" value={contract.method} />
        {contract.amountFormatted && (
          <InfoItem icon={Coins} label="금액" value={contract.amountFormatted} />
        )}
        {contract.deadline && (
          <InfoItem icon={Calendar} label="마감일" value={contract.deadline} />
        )}
      </div>

      {/* 요청부서 */}
      {contract.requester && (
        <div className="pt-2 border-t border-surface-tertiary">
          <span className="text-xs text-text-tertiary">요청부서</span>
          <p className="text-sm text-text-primary mt-0.5">{contract.requester}</p>
        </div>
      )}
    </div>
  );
}

// 수정 미리보기
function UpdatePreview({
  contract,
  changes,
}: {
  contract: ContractPreview;
  changes: Array<{ field: string; from: string; to: string }>;
}) {
  return (
    <div className="space-y-3">
      {/* 계약 정보 */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono text-accent-primary">{contract.id}</span>
        <span className="text-sm text-text-primary font-medium">{contract.title}</span>
      </div>

      {/* 변경 내역 */}
      <div className="space-y-2">
        {changes.map((change, index) => (
          <div
            key={index}
            className="bg-surface-secondary rounded-lg p-3"
          >
            <span className="text-xs text-text-tertiary block mb-1">{change.field}</span>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-secondary line-through">{change.from}</span>
              <span className="text-text-tertiary">→</span>
              <span className="text-accent-primary font-medium">{change.to}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 삭제 미리보기
function DeletePreview({ contract }: { contract: ContractPreview }) {
  return (
    <div className="text-center py-2">
      <p className="text-text-secondary mb-2">다음 계약을 삭제하시겠습니까?</p>
      <div className="bg-red-50 rounded-lg p-3 border border-red-200">
        <span className="text-sm font-mono text-red-600">{contract.id}</span>
        <p className="text-sm text-text-primary font-medium mt-1">{contract.title}</p>
      </div>
      <p className="text-xs text-text-tertiary mt-3">
        삭제된 계약은 목록에서 제외됩니다
      </p>
    </div>
  );
}

// 정보 아이템
function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-surface-secondary/50 rounded-lg p-2.5">
      <div className="flex items-center gap-1.5 text-text-tertiary mb-0.5">
        <Icon className="w-3 h-3" />
        <span className="text-[11px]">{label}</span>
      </div>
      <p className="text-sm text-text-primary font-medium">{value}</p>
    </div>
  );
}
