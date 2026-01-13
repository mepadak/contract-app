'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Settings,
  User,
  Bell,
  Shield,
  Info,
  ChevronRight,
  Wallet,
  X,
  Check,
  Loader2,
} from 'lucide-react';
import { formatAmountShort, parseKoreanAmount } from '@/lib/utils';

export default function SettingsPage() {
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [currentBudget, setCurrentBudget] = useState<number | null>(null);
  const [budgetInput, setBudgetInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchBudget = useCallback(async () => {
    try {
      const response = await fetch('/api/config?key=annual_budget');
      if (response.ok) {
        const data = await response.json();
        if (data.value) {
          setCurrentBudget(parseInt(data.value, 10));
        }
      }
    } catch (error) {
      console.error('Failed to fetch budget:', error);
    }
  }, []);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget]);

  const handleOpenBudgetModal = () => {
    setBudgetInput(currentBudget ? formatAmountShort(currentBudget) : '');
    setSaveSuccess(false);
    setSaveError(null);
    setBudgetModalOpen(true);
  };

  const handleSaveBudget = async () => {
    const amount = parseKoreanAmount(budgetInput);
    if (!amount) {
      setSaveError('올바른 금액을 입력해주세요');
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const response = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'annual_budget', value: amount.toString() }),
      });

      if (!response.ok) {
        throw new Error('저장에 실패했습니다');
      }

      setCurrentBudget(amount);
      setSaveSuccess(true);
      setTimeout(() => {
        setBudgetModalOpen(false);
        setSaveSuccess(false);
      }, 1000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : '오류가 발생했습니다');
    } finally {
      setSaving(false);
    }
  };

  const settingsItems = [
    {
      icon: Wallet,
      label: '연간 예산',
      description: currentBudget ? formatAmountShort(currentBudget) : '설정 필요',
      disabled: false,
      onClick: handleOpenBudgetModal,
    },
    { icon: User, label: '계정 정보', description: 'PIN 변경', disabled: true },
    { icon: Bell, label: '알림 설정', description: '알림 관리', disabled: true },
    { icon: Shield, label: '보안', description: '보안 설정', disabled: true },
    { icon: Info, label: '앱 정보', description: 'v0.3.0 (Phase 3)', disabled: false },
  ];

  return (
    <div className="flex flex-1 flex-col pb-20">
      {/* Header Section */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-surface-tertiary to-surface-secondary">
            <Settings className="h-8 w-8 text-text-secondary" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">설정</h2>
            <p className="text-sm text-text-tertiary">앱 설정을 관리합니다</p>
          </div>
        </div>
      </div>

      {/* Settings List */}
      <div className="flex-1 px-4">
        <div className="rounded-2xl bg-surface-primary overflow-hidden divide-y divide-border-subtle shadow-sm border border-border-primary">
          {settingsItems.map(({ icon: Icon, label, description, disabled, onClick }) => (
            <button
              key={label}
              type="button"
              disabled={disabled}
              onClick={onClick}
              className={`
                w-full flex items-center gap-4 px-4 py-4
                transition-colors duration-150
                ${disabled ? 'opacity-50' : 'hover:bg-surface-secondary active:bg-surface-tertiary'}
              `}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-secondary">
                <Icon className="h-5 w-5 text-text-secondary" strokeWidth={1.5} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-text-primary">{label}</p>
                <p className="text-xs text-text-tertiary">{description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-text-tertiary" />
            </button>
          ))}
        </div>

        {/* Version Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-text-tertiary">Contract Manager Mobile</p>
          <p className="text-xs text-text-tertiary mt-1">Phase 3 - 대시보드 및 검색</p>
        </div>
      </div>

      {/* Budget Modal */}
      {budgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-text-primary">연간 예산 설정</h3>
              <button
                onClick={() => setBudgetModalOpen(false)}
                className="p-2 rounded-full hover:bg-surface-secondary transition-colors"
              >
                <X className="h-5 w-5 text-text-secondary" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  예산 금액
                </label>
                <input
                  type="text"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  placeholder="예: 50억, 5000만원"
                  className="w-full px-4 py-3 text-base border border-border-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                />
                <p className="mt-2 text-xs text-text-tertiary">
                  한국어 금액 표현 가능 (예: 50억, 5천만원, 1.5억)
                </p>
              </div>

              {saveError && (
                <div className="px-4 py-3 bg-red-50 text-red-600 text-sm rounded-xl">
                  {saveError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setBudgetModalOpen(false)}
                  className="flex-1 px-4 py-3 text-sm font-medium text-text-secondary bg-surface-secondary rounded-xl hover:bg-surface-tertiary transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveBudget}
                  disabled={saving || !budgetInput.trim()}
                  className="flex-1 px-4 py-3 text-sm font-medium text-white bg-accent-600 rounded-xl hover:bg-accent-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : saveSuccess ? (
                    <>
                      <Check className="h-4 w-4" />
                      저장됨
                    </>
                  ) : (
                    '저장'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
