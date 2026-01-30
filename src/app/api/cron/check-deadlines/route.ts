import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Status, Action } from '@prisma/client';

export const runtime = 'nodejs';

// Vercel Cron Job: 매일 자정에 실행
// vercel.json에 cron 설정 필요
export async function GET(req: NextRequest) {
  try {
    // Cron 시크릿 검증 (선택적)
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // 1. 계약완료 단계이면서 계약종료일이 경과한 계약 조회
    const overdueContracts = await prisma.contract.findMany({
      where: {
        stage: '계약완료',
        contractEnd: {
          lt: now,
        },
        status: {
          notIn: [Status.COMPLETED, Status.DELETED, Status.DELAYED],
        },
      },
    });

    const updates: string[] = [];

    // 2. 상태를 '지연'으로 변경
    for (const contract of overdueContracts) {
      await prisma.contract.update({
        where: { id: contract.id },
        data: { status: Status.DELAYED },
      });

      // 변경 로그 기록
      await prisma.changeLog.create({
        data: {
          contractId: contract.id,
          action: Action.STATUS,
          detail: '계약종료일 경과로 자동 지연 처리',
          fromValue: contract.status,
          toValue: Status.DELAYED,
        },
      });

      updates.push(contract.id);
    }

    return NextResponse.json({
      success: true,
      message: `${updates.length}건의 계약이 지연 상태로 변경되었습니다.`,
      updatedContracts: updates,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Check deadlines cron error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Cron 작업 실패',
        },
      },
      { status: 500 }
    );
  }
}
