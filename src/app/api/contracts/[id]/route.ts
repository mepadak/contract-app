import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateContractSchema } from '@/lib/validations/contract';
import { formatAmountShort } from '@/lib/utils';
import { Status, Action, Method } from '@prisma/client';
import { METHOD_STAGES } from '@/lib/constants';

// 메서드 라벨 가져오기
function getMethodLabel(method: Method): string {
  const labels: Record<Method, string> = {
    [Method.OPEN_BID]: '일반경쟁',
    [Method.RESTRICTED_BID]: '제한경쟁',
    [Method.NOMINATED_BID]: '지명경쟁',
    [Method.OPEN_NEGOTIATION]: '공개수의',
    [Method.PRIVATE_NEGOTIATION]: '비공개수의',
  };
  return labels[method];
}

// GET - 계약 상세 조회
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const contract = await prisma.contract.findFirst({
      where: {
        id,
        status: { not: Status.DELETED },
      },
      include: {
        notes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!contract) {
      return Response.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: `계약을 찾을 수 없습니다: ${id}`,
          },
        },
        { status: 404 }
      );
    }

    // 변경 이력 조회
    const history = await prisma.changeLog.findMany({
      where: { contractId: id },
      orderBy: { createdAt: 'desc' },
    });

    // 진행률 계산
    const methodLabel = getMethodLabel(contract.method);
    const stages = METHOD_STAGES[methodLabel] || [];
    const currentIndex = stages.indexOf(contract.stage);
    const progress = stages.length > 0 ? Math.round(((currentIndex + 1) / stages.length) * 100) : 0;

    return Response.json({
      contract: {
        id: contract.id,
        title: contract.title,
        category: contract.category,
        method: contract.method,
        amount: Number(contract.amount),
        amountFormatted: formatAmountShort(Number(contract.amount)),
        status: contract.status,
        stage: contract.stage,
        progress,
        stages,
        requester: contract.requester,
        requesterContact: contract.requesterContact,
        contractor: contract.contractor,
        deadline: contract.deadline?.toISOString().split('T')[0] || null,
        budgetYear: contract.budgetYear,
        createdAt: contract.createdAt.toISOString(),
        updatedAt: contract.updatedAt.toISOString(),
      },
      notes: contract.notes.map((n) => ({
        id: n.id,
        content: n.content,
        tags: n.tags,
        createdAt: n.createdAt.toISOString(),
      })),
      history: history.map((h) => ({
        id: h.id,
        action: h.action,
        detail: h.detail,
        from: h.fromValue,
        to: h.toValue,
        createdAt: h.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Get contract error:', error);
    return Response.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : '상세 조회 실패',
        },
      },
      { status: 500 }
    );
  }
}

// PATCH - 계약 수정
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const input = updateContractSchema.parse(body);

    const contract = await prisma.contract.findFirst({
      where: {
        id,
        status: { not: Status.DELETED },
      },
    });

    if (!contract) {
      return Response.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: `계약을 찾을 수 없습니다: ${id}`,
          },
        },
        { status: 404 }
      );
    }

    const updates: Record<string, unknown> = {};
    const changes: Array<{ action: Action; field: string; from: string | null; to: string }> = [];

    // 단계 변경
    if (input.stage && input.stage !== contract.stage) {
      const methodLabel = getMethodLabel(contract.method);
      const validStages = METHOD_STAGES[methodLabel] || [];

      if (!validStages.includes(input.stage)) {
        return Response.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: `유효하지 않은 단계입니다. 가능한 단계: ${validStages.join(', ')}`,
            },
          },
          { status: 400 }
        );
      }

      updates.stage = input.stage;
      changes.push({
        action: Action.STAGE,
        field: '단계',
        from: contract.stage,
        to: input.stage,
      });

      // 상태 자동 변경
      if (input.stage === '집행완료') {
        updates.status = Status.COMPLETED;
        changes.push({
          action: Action.STATUS,
          field: '상태',
          from: contract.status,
          to: Status.COMPLETED,
        });
      } else if (contract.status === Status.BEFORE_START) {
        updates.status = Status.IN_PROGRESS;
        changes.push({
          action: Action.STATUS,
          field: '상태',
          from: Status.BEFORE_START,
          to: Status.IN_PROGRESS,
        });
      }
    }

    // 상태 변경
    if (input.status && input.status !== contract.status) {
      updates.status = input.status;
      changes.push({
        action: Action.STATUS,
        field: '상태',
        from: contract.status,
        to: input.status,
      });
    }

    // 기타 필드 변경
    if (input.title && input.title !== contract.title) {
      updates.title = input.title;
      changes.push({
        action: Action.UPDATE,
        field: '계약명',
        from: contract.title,
        to: input.title,
      });
    }

    if (input.contractor !== undefined && input.contractor !== contract.contractor) {
      updates.contractor = input.contractor;
      changes.push({
        action: Action.UPDATE,
        field: '계약상대방',
        from: contract.contractor,
        to: input.contractor || '없음',
      });
    }

    if (input.amount !== undefined && BigInt(input.amount) !== contract.amount) {
      updates.amount = BigInt(input.amount);
      changes.push({
        action: Action.UPDATE,
        field: '금액',
        from: formatAmountShort(Number(contract.amount)),
        to: formatAmountShort(input.amount),
      });
    }

    if (input.requester !== undefined && input.requester !== contract.requester) {
      updates.requester = input.requester;
      changes.push({
        action: Action.UPDATE,
        field: '요청부서',
        from: contract.requester,
        to: input.requester || '없음',
      });
    }

    if (input.deadline !== undefined) {
      const newDeadline = input.deadline ? new Date(input.deadline) : null;
      const oldDeadline = contract.deadline;
      if (newDeadline?.getTime() !== oldDeadline?.getTime()) {
        updates.deadline = newDeadline;
        changes.push({
          action: Action.UPDATE,
          field: '마감일',
          from: oldDeadline?.toISOString().split('T')[0] || null,
          to: newDeadline?.toISOString().split('T')[0] || '없음',
        });
      }
    }

    if (Object.keys(updates).length === 0) {
      return Response.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: '변경할 항목이 없습니다',
          },
        },
        { status: 400 }
      );
    }

    // 업데이트 실행
    const updated = await prisma.contract.update({
      where: { id },
      data: updates,
    });

    // 변경 로그 기록
    for (const change of changes) {
      await prisma.changeLog.create({
        data: {
          contractId: id,
          action: change.action,
          detail: `${change.field} 변경`,
          fromValue: change.from,
          toValue: change.to,
        },
      });
    }

    // 진행률 재계산
    const methodLabel = getMethodLabel(updated.method);
    const stages = METHOD_STAGES[methodLabel] || [];
    const currentIndex = stages.indexOf(updated.stage);
    const progress = stages.length > 0 ? Math.round(((currentIndex + 1) / stages.length) * 100) : 0;

    return Response.json({
      success: true,
      contract: {
        id: updated.id,
        title: updated.title,
        category: updated.category,
        method: updated.method,
        amount: Number(updated.amount),
        amountFormatted: formatAmountShort(Number(updated.amount)),
        status: updated.status,
        stage: updated.stage,
        progress,
        requester: updated.requester,
        contractor: updated.contractor,
        deadline: updated.deadline?.toISOString().split('T')[0] || null,
        updatedAt: updated.updatedAt.toISOString(),
      },
      changes: changes.map((c) => ({
        field: c.field,
        from: c.from,
        to: c.to,
      })),
    });
  } catch (error) {
    console.error('Update contract error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return Response.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: '입력값이 올바르지 않습니다',
            details: error,
          },
        },
        { status: 400 }
      );
    }

    return Response.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : '계약 수정 실패',
        },
      },
      { status: 500 }
    );
  }
}

// DELETE - 계약 삭제 (소프트 삭제)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const contract = await prisma.contract.findFirst({
      where: {
        id,
        status: { not: Status.DELETED },
      },
    });

    if (!contract) {
      return Response.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: `계약을 찾을 수 없습니다: ${id}`,
          },
        },
        { status: 404 }
      );
    }

    // 소프트 삭제
    await prisma.contract.update({
      where: { id },
      data: { status: Status.DELETED },
    });

    // 변경 로그 기록
    await prisma.changeLog.create({
      data: {
        contractId: id,
        action: Action.DELETE,
        detail: '계약 삭제',
        fromValue: contract.status,
        toValue: Status.DELETED,
      },
    });

    return Response.json({
      success: true,
      message: `${id} (${contract.title}) 계약이 삭제되었습니다.`,
    });
  } catch (error) {
    console.error('Delete contract error:', error);
    return Response.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : '계약 삭제 실패',
        },
      },
      { status: 500 }
    );
  }
}
