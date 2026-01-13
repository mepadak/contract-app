'use client';

import { LayoutDashboard, TrendingUp, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col p-4">
      <div className="flex flex-col items-center justify-center flex-1 pb-20">
        <div className="flex flex-col items-center gap-6 text-center animate-scale-in">
          {/* Icon */}
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50">
              <LayoutDashboard className="h-10 w-10 text-emerald-600" strokeWidth={1.5} />
            </div>
            <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-blue-100">
              <TrendingUp className="h-4 w-4 text-blue-600" strokeWidth={2} />
            </div>
          </div>

          {/* Text */}
          <div>
            <h2 className="text-xl font-semibold text-text-primary">대시보드</h2>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
              예산 현황과 계약 통계를 확인하세요
              <br />
              <span className="text-text-tertiary">Phase 3에서 구현됩니다</span>
            </p>
          </div>

          {/* Preview Cards */}
          <div className="mt-4 grid gap-3 w-full max-w-xs">
            <div className="px-4 py-4 rounded-xl bg-surface-secondary">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-text-tertiary">예산 집행률</p>
                  <p className="text-lg font-semibold text-text-primary">---%</p>
                </div>
              </div>
            </div>
            <div className="px-4 py-4 rounded-xl bg-surface-secondary">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-text-tertiary">주의 계약</p>
                  <p className="text-lg font-semibold text-text-primary">-건</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
