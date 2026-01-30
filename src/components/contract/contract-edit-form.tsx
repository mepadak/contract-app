'use client';

import { useState } from 'react';
import { parseKoreanAmount, formatAmountShort } from '@/lib/utils';
import { CATEGORY_LABELS, METHOD_LABELS, STATUS_LABELS, METHOD_STAGES } from '@/lib/constants';
import { Save, X, Loader2 } from 'lucide-react';
import type { Status, Category, Method } from '@prisma/client';

export interface ContractEditData {
  title?: string;
  category?: Category;
  method?: Method;
  status?: Status;
  stage?: string;
  budget?: number;
  contractAmount?: number;
  executionAmount?: number;
  requester?: string;
  contractor?: string;
  deadline?: string;
  requestDate?: string;
  announcementStart?: string;
  announcementEnd?: string;
  openingDate?: string;
  contractStart?: string;
  contractEnd?: string;
  paymentDate?: string;
}

interface ContractEditFormProps {
  initialData: {
    title: string;
    category: Category;
    method: Method;
    status: Status;
    stage: string;
    stages: string[];
    budget?: number;
    contractAmount?: number;
    executionAmount?: number;
    requester: string | null;
    contractor: string | null;
    deadline: string | null;
    requestDate?: string | null;
    announcementStart?: string | null;
    announcementEnd?: string | null;
    openingDate?: string | null;
    contractStart?: string | null;
    contractEnd?: string | null;
    paymentDate?: string | null;
  };
  onSave: (data: ContractEditData) => Promise<void>;
  onCancel: () => void;
}

export function ContractEditForm({
  initialData,
  onSave,
  onCancel,
}: ContractEditFormProps) {
  const [formData, setFormData] = useState<ContractEditData>({
    title: initialData.title,
    category: initialData.category,
    method: initialData.method,
    status: initialData.status,
    stage: initialData.stage,
    budget: initialData.budget ?? 0,
    contractAmount: initialData.contractAmount ?? 0,
    executionAmount: initialData.executionAmount ?? 0,
    requester: initialData.requester || '',
    contractor: initialData.contractor || '',
    deadline: initialData.deadline || '',
    requestDate: initialData.requestDate || '',
    announcementStart: initialData.announcementStart || '',
    announcementEnd: initialData.announcementEnd || '',
    openingDate: initialData.openingDate || '',
    contractStart: initialData.contractStart || '',
    contractEnd: initialData.contractEnd || '',
    paymentDate: initialData.paymentDate || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 금액 입력 핸들러 (한국어 금액 파싱 지원)
  const handleAmountChange = (field: 'budget' | 'contractAmount' | 'executionAmount', value: string) => {
    // 숫자만 있으면 그대로 사용, 한국어 금액이면 파싱
    const numValue = value.match(/^[\d,]+$/)
      ? parseInt(value.replace(/,/g, ''), 10)
      : parseKoreanAmount(value) ?? formData[field];

    setFormData((prev) => ({ ...prev, [field]: numValue }));
  };

  // 현재 method에 맞는 stages
  const methodLabel = METHOD_LABELS[formData.method || initialData.method];
  const availableStages = METHOD_STAGES[methodLabel] || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      await onSave(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 기본 정보 */}
      <section className="space-y-4">
        <h4 className="text-sm font-medium text-text-secondary">기본 정보</h4>

        {/* 계약명 */}
        <div>
          <label className="block text-xs text-text-tertiary mb-1">계약명</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 text-sm rounded-lg border border-surface-tertiary bg-surface-primary focus:border-accent-primary focus:outline-none"
            required
          />
        </div>

        {/* 종류/방법 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-text-tertiary mb-1">종류</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value as Category }))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-surface-tertiary bg-surface-primary focus:border-accent-primary focus:outline-none"
            >
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-text-tertiary mb-1">방법</label>
            <select
              value={formData.method}
              onChange={(e) => setFormData((prev) => ({ ...prev, method: e.target.value as Method }))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-surface-tertiary bg-surface-primary focus:border-accent-primary focus:outline-none"
            >
              {Object.entries(METHOD_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 상태/단계 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-text-tertiary mb-1">상태</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as Status }))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-surface-tertiary bg-surface-primary focus:border-accent-primary focus:outline-none"
            >
              {Object.entries(STATUS_LABELS).filter(([key]) => key !== 'DELETED').map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-text-tertiary mb-1">단계</label>
            <select
              value={formData.stage}
              onChange={(e) => setFormData((prev) => ({ ...prev, stage: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-surface-tertiary bg-surface-primary focus:border-accent-primary focus:outline-none"
            >
              {availableStages.map((stage) => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* 금액 정보 */}
      <section className="space-y-4">
        <h4 className="text-sm font-medium text-text-secondary">금액 정보</h4>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-xs text-text-tertiary mb-1">예산 (예: 5천만원, 5억)</label>
            <input
              type="text"
              defaultValue={formatAmountShort(formData.budget || 0)}
              onBlur={(e) => handleAmountChange('budget', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-surface-tertiary bg-surface-primary focus:border-accent-primary focus:outline-none"
              placeholder="예: 5천만원"
            />
          </div>
          <div>
            <label className="block text-xs text-text-tertiary mb-1">계약금액</label>
            <input
              type="text"
              defaultValue={formatAmountShort(formData.contractAmount || 0)}
              onBlur={(e) => handleAmountChange('contractAmount', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-surface-tertiary bg-surface-primary focus:border-accent-primary focus:outline-none"
              placeholder="예: 4천만원"
            />
          </div>
          <div>
            <label className="block text-xs text-text-tertiary mb-1">집행금액</label>
            <input
              type="text"
              defaultValue={formatAmountShort(formData.executionAmount || 0)}
              onBlur={(e) => handleAmountChange('executionAmount', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-surface-tertiary bg-surface-primary focus:border-accent-primary focus:outline-none"
              placeholder="예: 4천만원"
            />
          </div>
        </div>
      </section>

      {/* 관련 정보 */}
      <section className="space-y-4">
        <h4 className="text-sm font-medium text-text-secondary">관련 정보</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-text-tertiary mb-1">요청부서</label>
            <input
              type="text"
              value={formData.requester}
              onChange={(e) => setFormData((prev) => ({ ...prev, requester: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-surface-tertiary bg-surface-primary focus:border-accent-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-text-tertiary mb-1">계약상대방</label>
            <input
              type="text"
              value={formData.contractor}
              onChange={(e) => setFormData((prev) => ({ ...prev, contractor: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-surface-tertiary bg-surface-primary focus:border-accent-primary focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* 일자 정보 */}
      <section className="space-y-4">
        <h4 className="text-sm font-medium text-text-secondary">일자 정보</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-text-tertiary mb-1">요청일</label>
            <input
              type="date"
              value={formData.requestDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, requestDate: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-surface-tertiary bg-surface-primary focus:border-accent-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-text-tertiary mb-1">마감일</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-surface-tertiary bg-surface-primary focus:border-accent-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-text-tertiary mb-1">공고시작일</label>
            <input
              type="date"
              value={formData.announcementStart}
              onChange={(e) => setFormData((prev) => ({ ...prev, announcementStart: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-surface-tertiary bg-surface-primary focus:border-accent-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-text-tertiary mb-1">공고종료일</label>
            <input
              type="date"
              value={formData.announcementEnd}
              onChange={(e) => setFormData((prev) => ({ ...prev, announcementEnd: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-surface-tertiary bg-surface-primary focus:border-accent-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-text-tertiary mb-1">개찰일</label>
            <input
              type="date"
              value={formData.openingDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, openingDate: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-surface-tertiary bg-surface-primary focus:border-accent-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-text-tertiary mb-1">계약시작일</label>
            <input
              type="date"
              value={formData.contractStart}
              onChange={(e) => setFormData((prev) => ({ ...prev, contractStart: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-surface-tertiary bg-surface-primary focus:border-accent-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-text-tertiary mb-1">계약종료일</label>
            <input
              type="date"
              value={formData.contractEnd}
              onChange={(e) => setFormData((prev) => ({ ...prev, contractEnd: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-surface-tertiary bg-surface-primary focus:border-accent-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-text-tertiary mb-1">대금집행일</label>
            <input
              type="date"
              value={formData.paymentDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, paymentDate: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-surface-tertiary bg-surface-primary focus:border-accent-primary focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* 버튼 */}
      <div className="flex gap-3 pt-4 border-t border-surface-tertiary">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-text-secondary bg-surface-secondary rounded-xl hover:bg-surface-tertiary transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
          취소
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-accent-primary rounded-xl hover:bg-accent-primary/90 transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          저장
        </button>
      </div>
    </form>
  );
}
