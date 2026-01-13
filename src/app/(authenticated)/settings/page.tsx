'use client';

import { Settings, User, Bell, Shield, Info, ChevronRight } from 'lucide-react';

const settingsItems = [
  { icon: User, label: '계정 정보', description: 'PIN 변경', disabled: true },
  { icon: Bell, label: '알림 설정', description: '알림 관리', disabled: true },
  { icon: Shield, label: '보안', description: '보안 설정', disabled: true },
  { icon: Info, label: '앱 정보', description: 'v0.1.0 (Phase 1)', disabled: false },
];

export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col">
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
        <div className="rounded-2xl bg-surface-primary overflow-hidden divide-y divide-border-subtle">
          {settingsItems.map(({ icon: Icon, label, description, disabled }) => (
            <button
              key={label}
              type="button"
              disabled={disabled}
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
          <p className="text-xs text-text-tertiary">
            Contract Manager Mobile
          </p>
          <p className="text-xs text-text-tertiary mt-1">
            Phase 1 - 기반 구축
          </p>
        </div>
      </div>
    </div>
  );
}
