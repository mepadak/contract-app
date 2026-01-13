import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ALERT_THRESHOLDS, STATUS_LABELS } from '@/lib/constants';

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

export async function GET() {
  try {
    // 연간 예산 조회
    const budgetConfig = await prisma.config.findUnique({
      where: { key: 'annual_budget' },
    });
    const totalBudget = budgetConfig ? BigInt(budgetConfig.value) : BigInt(0);

    // 모든 계약 조회 (삭제된 것 제외)
    const contracts = await prisma.contract.findMany({
      where: {
        status: { not: 'DELETED' },
      },
      select: {
        id: true,
        title: true,
        status: true,
        amount: true,
        deadline: true,
        updatedAt: true,
      },
    });

    // 상태별 통계 계산
    const statusSummary: Record<string, StatusSummary> = {};
    const statusKeys = ['BEFORE_START', 'IN_PROGRESS', 'WAITING', 'DELAYED', 'COMPLETED'];

    for (const key of statusKeys) {
      statusSummary[STATUS_LABELS[key]] = { count: 0, amount: 0 };
    }

    let allocatedAmount = BigInt(0); // 배정 예산 (진행 중 + 대기 + 지연)
    let executedAmount = BigInt(0);  // 집행 예산 (완료)

    for (const contract of contracts) {
      const label = STATUS_LABELS[contract.status] || contract.status;
      if (statusSummary[label]) {
        statusSummary[label].count += 1;
        statusSummary[label].amount += Number(contract.amount);
      }

      // 예산 집계
      if (['IN_PROGRESS', 'WAITING', 'DELAYED'].includes(contract.status)) {
        allocatedAmount += contract.amount;
      }
      if (contract.status === 'COMPLETED') {
        executedAmount += contract.amount;
      }
    }

    // 예산 현황 계산
    const remaining = totalBudget - allocatedAmount - executedAmount;
    const executionRate = totalBudget > 0
      ? Number((executedAmount * BigInt(1000) / totalBudget)) / 10
      : 0;

    // 주의 계약 필터링
    const now = new Date();
    const alerts: Alert[] = [];

    for (const contract of contracts) {
      // 완료/시작 전 계약은 제외
      if (['COMPLETED', 'BEFORE_START'].includes(contract.status)) {
        continue;
      }

      // 지연 상태
      if (contract.status === 'DELAYED') {
        alerts.push({
          contractId: contract.id,
          title: contract.title,
          level: 'critical',
          reason: '상태: 지연',
          deadline: contract.deadline?.toISOString().split('T')[0] || null,
        });
        continue;
      }

      // 마감일 기준 판정
      if (contract.deadline) {
        const deadline = new Date(contract.deadline);
        const diffTime = deadline.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= ALERT_THRESHOLDS.CRITICAL_DAYS && diffDays >= 0) {
          alerts.push({
            contractId: contract.id,
            title: contract.title,
            level: 'critical',
            reason: `마감 D-${diffDays}`,
            deadline: contract.deadline.toISOString().split('T')[0],
          });
          continue;
        }

        if (diffDays <= ALERT_THRESHOLDS.WARNING_DAYS && diffDays > ALERT_THRESHOLDS.CRITICAL_DAYS) {
          alerts.push({
            contractId: contract.id,
            title: contract.title,
            level: 'warning',
            reason: `마감 D-${diffDays}`,
            deadline: contract.deadline.toISOString().split('T')[0],
          });
          continue;
        }
      }

      // 대기 상태 장기화 판정
      if (contract.status === 'WAITING') {
        const waitingDays = Math.floor(
          (now.getTime() - contract.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (waitingDays >= ALERT_THRESHOLDS.WAITING_DAYS) {
          alerts.push({
            contractId: contract.id,
            title: contract.title,
            level: 'warning',
            reason: `대기 ${waitingDays}일`,
            deadline: contract.deadline?.toISOString().split('T')[0] || null,
          });
        }
      }
    }

    // critical 먼저, 그 다음 warning 순으로 정렬
    alerts.sort((a, b) => {
      if (a.level === 'critical' && b.level === 'warning') return -1;
      if (a.level === 'warning' && b.level === 'critical') return 1;
      return 0;
    });

    return NextResponse.json({
      budget: {
        total: Number(totalBudget),
        allocated: Number(allocatedAmount),
        executed: Number(executedAmount),
        remaining: Number(remaining),
        executionRate: Math.round(executionRate * 10) / 10,
      },
      statusSummary,
      alerts,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '대시보드 데이터를 불러오는 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
