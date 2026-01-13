import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createContractSchema, listContractsQuerySchema } from '@/lib/validations/contract';
import { formatAmountShort } from '@/lib/utils';
import { Status, Action, Method } from '@prisma/client';
import { METHOD_STAGES } from '@/lib/constants';

export const runtime = 'edge';

// 계약 ID 생성
async function generateContractId(): Promise<string> {
  const year = new Date().getFullYear();
  const yearShort = year.toString().slice(-2);
  const counterKey = `id_counter_${year}`;

  // 현재 카운터 조회
  let config = await prisma.config.findUnique({
    where: { key: counterKey },
  });

  if (!config) {
    config = await prisma.config.create({
      data: { key: counterKey, value: '1' },
    });
  }

  const counter = parseInt(config.value, 10);

  // 카운터 증가
  await prisma.config.update({
    where: { key: counterKey },
    data: { value: (counter + 1).toString() },
  });

  return `C${yearShort}-${counter.toString().padStart(3, '0')}`;
}

// 초기 단계 결정
function getInitialStage(method: Method): string {
  if (method === Method.PRIVATE_NEGOTIATION) {
    return '계약준비';
  }
  return '공고준비';
}

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

// GET - 계약 목록 조회
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = listContractsQuerySchema.parse({
      status: searchParams.get('status') || undefined,
      category: searchParams.get('category') || undefined,
      method: searchParams.get('method') || undefined,
      limit: searchParams.get('limit') || 20,
      offset: searchParams.get('offset') || 0,
      sort: searchParams.get('sort') || 'updatedAt',
      order: searchParams.get('order') || 'desc',
      search: searchParams.get('search') || undefined,
    });

    const where: Record<string, unknown> = {
      status: { not: Status.DELETED },
    };

    if (query.status) {
      where.status = query.status;
    }
    if (query.category) {
      where.category = query.category;
    }
    if (query.method) {
      where.method = query.method;
    }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { requester: { contains: query.search, mode: 'insensitive' } },
        { contractor: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        orderBy: { [query.sort]: query.order },
        skip: query.offset,
        take: query.limit,
      }),
      prisma.contract.count({ where }),
    ]);

    const formattedContracts = contracts.map((c) => {
      const methodLabel = getMethodLabel(c.method);
      const stages = METHOD_STAGES[methodLabel] || [];
      const currentIndex = stages.indexOf(c.stage);
      const progress = stages.length > 0 ? Math.round(((currentIndex + 1) / stages.length) * 100) : 0;

      return {
        id: c.id,
        title: c.title,
        category: c.category,
        method: c.method,
        amount: Number(c.amount),
        amountFormatted: formatAmountShort(Number(c.amount)),
        status: c.status,
        stage: c.stage,
        progress,
        requester: c.requester,
        contractor: c.contractor,
        deadline: c.deadline?.toISOString().split('T')[0] || null,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      };
    });

    return Response.json({
      contracts: formattedContracts,
      total,
      hasMore: query.offset + query.limit < total,
    });
  } catch (error) {
    console.error('List contracts error:', error);
    return Response.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : '목록 조회 실패',
        },
      },
      { status: 500 }
    );
  }
}

// POST - 계약 생성
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = createContractSchema.parse(body);

    const contractId = await generateContractId();
    const initialStage = getInitialStage(input.method);

    const contract = await prisma.contract.create({
      data: {
        id: contractId,
        title: input.title,
        category: input.category,
        method: input.method,
        amount: BigInt(input.amount),
        requester: input.requester || null,
        requesterContact: input.requesterContact || null,
        deadline: input.deadline ? new Date(input.deadline) : null,
        contractor: input.contractor || null,
        stage: initialStage,
        status: Status.BEFORE_START,
      },
    });

    // 변경 로그 기록
    await prisma.changeLog.create({
      data: {
        contractId: contract.id,
        action: Action.CREATE,
        detail: `계약 생성: ${input.title}`,
        toValue: JSON.stringify({
          title: input.title,
          category: input.category,
          method: input.method,
          amount: input.amount,
        }),
      },
    });

    return Response.json(
      {
        id: contract.id,
        title: contract.title,
        category: contract.category,
        method: contract.method,
        amount: Number(contract.amount),
        amountFormatted: formatAmountShort(Number(contract.amount)),
        status: contract.status,
        stage: contract.stage,
        requester: contract.requester,
        deadline: contract.deadline?.toISOString().split('T')[0] || null,
        createdAt: contract.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create contract error:', error);

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
          message: error instanceof Error ? error.message : '계약 생성 실패',
        },
      },
      { status: 500 }
    );
  }
}
