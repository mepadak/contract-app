'use client';

import { FileText, Search, Filter } from 'lucide-react';

export default function ContractsPage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Search Bar */}
      <div className="p-4 border-b border-border-subtle bg-surface-primary">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-secondary">
            <Search className="h-4 w-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="계약 검색..."
              disabled
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
            />
          </div>
          <button
            type="button"
            disabled
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-secondary text-text-tertiary"
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Empty State */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-20">
        <div className="flex flex-col items-center gap-6 text-center animate-scale-in">
          {/* Icon */}
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-violet-50">
            <FileText className="h-10 w-10 text-violet-600" strokeWidth={1.5} />
          </div>

          {/* Text */}
          <div>
            <h2 className="text-xl font-semibold text-text-primary">계약 목록</h2>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
              등록된 계약을 확인하고 관리하세요
              <br />
              <span className="text-text-tertiary">Phase 2에서 구현됩니다</span>
            </p>
          </div>

          {/* Sample Cards */}
          <div className="mt-4 flex flex-col gap-3 w-full max-w-xs">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="px-4 py-4 rounded-xl bg-surface-secondary animate-pulse"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-surface-tertiary rounded" />
                    <div className="h-3 w-32 bg-surface-tertiary rounded" />
                  </div>
                  <div className="h-6 w-14 bg-surface-tertiary rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
