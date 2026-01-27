import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createNoteSchema } from '@/lib/validations/contract';
import { Status, Action } from '@prisma/client';

export const runtime = 'nodejs';

// 키워드 자동 추출
function extractTags(content: string): string[] {
  const keywords = [
    '검토', '완료', '승인', '요청', '회의', '수정', '확인', '보류', '긴급',
    '규격서', '견적', '계약서', '납품', '검수', '지출', '결재', '공고',
    '입찰', '낙찰', '협상', '조달', '예산', '변경', '연장', '취소'
  ];

  const tags: string[] = [];
  keywords.forEach((keyword) => {
    if (content.includes(keyword) && !tags.includes(keyword)) {
      tags.push(keyword);
    }
  });

  return tags;
}

// GET - 메모 목록 조회
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

    const notes = await prisma.note.findMany({
      where: { contractId: id },
      orderBy: { createdAt: 'desc' },
    });

    return Response.json({
      notes: notes.map((n) => ({
        id: n.id,
        content: n.content,
        tags: n.tags,
        createdAt: n.createdAt.toISOString(),
      })),
      total: notes.length,
    });
  } catch (error) {
    console.error('Get notes error:', error);
    return Response.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : '메모 조회 실패',
        },
      },
      { status: 500 }
    );
  }
}

// POST - 메모 추가
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const input = createNoteSchema.parse(body);

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

    // 태그 처리: 입력된 태그가 있으면 사용, 없으면 자동 추출
    const tags = input.tags && input.tags.length > 0
      ? input.tags
      : extractTags(input.content);

    const note = await prisma.note.create({
      data: {
        contractId: id,
        content: input.content,
        tags,
      },
    });

    // 변경 로그 기록
    await prisma.changeLog.create({
      data: {
        contractId: id,
        action: Action.NOTE,
        detail: '메모 추가',
        toValue: input.content.substring(0, 100), // 최대 100자까지만 로그
      },
    });

    return Response.json(
      {
        id: note.id,
        content: note.content,
        tags: note.tags,
        createdAt: note.createdAt.toISOString(),
        contractId: id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create note error:', error);

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
          message: error instanceof Error ? error.message : '메모 추가 실패',
        },
      },
      { status: 500 }
    );
  }
}
