'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  CircleDot,
  AlertCircle,
} from 'lucide-react';
import { formatAmountShort } from '@/lib/utils';

interface BudgetData {
  total: number;
  allocated: number;
  executed: number;
  remaining: number;
  executionRate: number;
}

interface StatusSummary {
  count: number;
  amount: number;
}

interface Alert {
  contractId: string;
  title: string;
  level: 'critical' | 'warning';
  reason: string;
  deadline: string | null;
}

interface DashboardData {
  budget: BudgetData;
  statusSummary: Record<string, StatusSummary>;
  alerts: Alert[];
}

const STATUS_ORDER = ['시작 전', '진행 중', '대기', '지연', '완료'];
const STATUS_COLORS: Record<string, string> = {
  '시작 전': 'bg-gray-400',
  '진행 중': 'bg-blue-500',
  '대기': 'bg-amber-500',
  '지연': 'bg-red-500',
  '완료': 'bg-emerald-500',
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await fetch('/api/dashboard');
      if (!response.ok) throw new Error('데이터를 불러올 수 없습니다');

      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleRefresh = () => {
    fetchDashboard(true);
  };

  const handleAlertClick = (contractId: string) => {
    router.push(`/contracts?highlight=${contractId}`);
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="flex flex-1 flex-col p-4 pb-24">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-secondary rounded-lg w-32" />
          <div className="h-40 bg-surface-secondary rounded-2xl" />
          <div className="h-8 bg-surface-secondary rounded-lg w-32" />
          <div className="h-24 bg-surface-secondary rounded-2xl" />
          <div className="h-8 bg-surface-secondary rounded-lg w-32" />
          <div className="space-y-2">
            <div className="h-16 bg-surface-secondary rounded-xl" />
            <div className="h-16 bg-surface-secondary rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4 pb-24">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <p className="text-lg font-medium text-text-primary">데이터 로드 실패</p>
            <p className="mt-1 text-sm text-text-secondary">{error}</p>
          </div>
          <button
            onClick={() => fetchDashboard()}
            className="mt-2 px-4 py-2 text-sm font-medium text-white bg-accent-600 rounded-lg hover:bg-accent-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { budget, statusSummary, alerts } = data;
  const totalContracts = STATUS_ORDER.reduce(
    (sum, status) => sum + (statusSummary[status]?.count || 0),
    0
  );

  return (
    <div className="flex flex-1 flex-col p-4 pb-24 overflow-y-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-text-primary">대시보드</h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>새로고침</span>
        </button>
      </div>

      {/* 예산 현황 카드 */}
      <section className="mb-6 animate-fade-in">
        <h2 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          예산 현황
        </h2>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-border-primary">
          {/* 프로그레스 바 */}
          <div className="mb-4">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-bold text-text-primary">
                {budget.executionRate}%
              </span>
              <span className="text-sm text-text-tertiary">집행률</span>
            </div>
            <div className="h-3 bg-surface-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(budget.executionRate, 100)}%` }}
              />
            </div>
          </div>

          {/* 예산 상세 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-surface-secondary rounded-xl">
              <p className="text-xs text-text-tertiary mb-1">총 예산</p>
              <p className="text-base font-semibold text-text-primary">
                {budget.total > 0 ? formatAmountShort(budget.total) : '미설정'}
              </p>
            </div>
            <div className="p-3 bg-surface-secondary rounded-xl">
              <p className="text-xs text-text-tertiary mb-1">배정</p>
              <p className="text-base font-semibold text-blue-600">
                {formatAmountShort(budget.allocated)}
              </p>
            </div>
            <div className="p-3 bg-surface-secondary rounded-xl">
              <p className="text-xs text-text-tertiary mb-1">집행</p>
              <p className="text-base font-semibold text-emerald-600">
                {formatAmountShort(budget.executed)}
              </p>
            </div>
            <div className="p-3 bg-surface-secondary rounded-xl">
              <p className="text-xs text-text-tertiary mb-1">잔여</p>
              <p className="text-base font-semibold text-text-primary">
                {budget.total > 0 ? formatAmountShort(budget.remaining) : '-'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 상태별 현황 */}
      <section className="mb-6 animate-fade-in delay-100">
        <h2 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
          <CircleDot className="h-4 w-4" />
          상태별 현황
          <span className="text-xs font-normal text-text-tertiary">
            총 {totalContracts}건
          </span>
        </h2>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-border-primary">
          <div className="space-y-3">
            {STATUS_ORDER.map((status) => {
              const info = statusSummary[status] || { count: 0, amount: 0 };
              const percentage = totalContracts > 0 ? (info.count / totalContracts) * 100 : 0;

              return (
                <div key={status} className="flex items-center gap-3">
                  <div className="w-14 text-sm text-text-secondary">{status}</div>
                  <div className="flex-1 h-6 bg-surface-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${STATUS_COLORS[status]} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-16 text-right">
                    <span className="text-sm font-medium text-text-primary">{info.count}건</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 주의 계약 */}
      <section className="animate-fade-in delay-200">
        <h2 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          주의 필요
          {alerts.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium text-red-600 bg-red-100 rounded-full">
              {alerts.length}건
            </span>
          )}
        </h2>

        {alerts.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border-primary text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <CircleDot className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="text-sm text-text-secondary">주의가 필요한 계약이 없습니다</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <button
                key={alert.contractId}
                onClick={() => handleAlertClick(alert.contractId)}
                className="w-full bg-white rounded-xl p-4 shadow-sm border border-border-primary hover:border-accent-300 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      alert.level === 'critical' ? 'bg-red-100' : 'bg-amber-100'
                    }`}
                  >
                    <AlertTriangle
                      className={`h-5 w-5 ${
                        alert.level === 'critical' ? 'text-red-600' : 'text-amber-600'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-text-tertiary">
                        {alert.contractId}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                          alert.level === 'critical'
                            ? 'text-red-700 bg-red-100'
                            : 'text-amber-700 bg-amber-100'
                        }`}
                      >
                        {alert.reason}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-text-primary truncate mt-0.5">
                      {alert.title}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-text-tertiary flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
