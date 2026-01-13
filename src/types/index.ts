import type { Contract, Note, ChangeLog, Config } from '@prisma/client';

// Re-export Prisma types
export type { Contract, Note, ChangeLog, Config };

// API 응답 타입
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: ApiError;
}

// 대시보드 타입
export interface BudgetSummary {
  total: number;
  allocated: number;
  executed: number;
  remaining: number;
  executionRate: number;
}

export interface StatusSummary {
  count: number;
  amount: number;
}

export interface AlertContract {
  contractId: string;
  title: string;
  level: 'critical' | 'warning';
  reason: string;
  deadline?: string;
}

export interface DashboardData {
  budget: BudgetSummary;
  statusSummary: Record<string, StatusSummary>;
  alerts: AlertContract[];
}

// 계약 상세 타입
export interface ContractDetail extends Contract {
  notes: Note[];
  history: ChangeLog[];
  progress: number;
}
