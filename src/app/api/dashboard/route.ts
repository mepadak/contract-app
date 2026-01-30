import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ALERT_THRESHOLDS, STATUS_LABELS } from '@/lib/constants';

export const runtime = 'nodejs';

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
        stage: true,
        amount: true,
        budget: true,
        contractAmount: true,
        executionAmount: true,
        deadline: true,
        contractEnd: true,
        updatedAt: true,
      },
    });

    // 상태별 통계 계산
    const statusSummary: Record<string, StatusSummary> = {};
    const statusKeys = ['BEFORE_START', 'IN_PROGRESS', 'WAITING', 'DELAYED', 'COMPLETED'];

    for (const key of statusKeys) {
      statusSummary[STATUS_LABELS[key]] = { count: 0, amount: 0 };
    }

    let allocatedAmount = BigInt(0); // 배정 예산 (진행 중 + 대기 + 지연의 예산 합계)
    let contractedAmount = BigInt(0); // 계약 금액 합계
    let executedAmount = BigInt(0);  // 집행 금액 합계 (완료된 계약)

    for (const contract of contracts) {
      const label = STATUS_LABELS[contract.status] || contract.status;
      // 새 금액 구조 사용: budget > 0이면 budget 사용, 아니면 amount 사용 (하위호환)
      const displayAmount = Number(contract.budget) > 0 ? Number(contract.budget) : Number(contract.amount);

      if (statusSummary[label]) {
        statusSummary[label].count += 1;
        statusSummary[label].amount += displayAmount;
      }

      // 예산 집계
      if (['IN_PROGRESS', 'WAITING', 'DELAYED'].includes(contract.status)) {
        allocatedAmount += contract.budget > 0 ? contract.budget : contract.amount;
        contractedAmount += contract.contractAmount;
      }
      if (contract.status === 'COMPLETED') {
        executedAmount += contract.executionAmount > 0 ? contract.executionAmount : contract.amount;
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

      // 계약종료일 기준 판정 (계약완료 단계인 경우)
      if (contract.stage === '계약완료' && contract.contractEnd) {
        const contractEnd = new Date(contract.contractEnd);
        const diffTime = contractEnd.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          // 계약종료일 경과 → 경고
          alerts.push({
            contractId: contract.id,
            title: contract.title,
            level: 'critical',
            reason: `계약종료 ${Math.abs(diffDays)}일 경과`,
            deadline: contract.contractEnd.toISOString().split('T')[0],
          });
          continue;
        }

        if (diffDays <= ALERT_THRESHOLDS.CONTRACT_END_WARNING) {
          // 계약종료 5일 이내 → 주의
          alerts.push({
            contractId: contract.id,
            title: contract.title,
            level: 'warning',
            reason: `계약종료 D-${diffDays}`,
            deadline: contract.contractEnd.toISOString().split('T')[0],
          });
          continue;
        }
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
        contracted: Number(contractedAmount),
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
