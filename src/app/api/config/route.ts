import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const runtime = 'edge';

// GET: 설정값 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key) {
      // 특정 키 조회
      const config = await prisma.config.findUnique({
        where: { key },
      });

      if (!config) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: `설정 '${key}'를 찾을 수 없습니다.` } },
          { status: 404 }
        );
      }

      return NextResponse.json({ key: config.key, value: config.value });
    }

    // 전체 설정 조회
    const configs = await prisma.config.findMany();
    const result: Record<string, string> = {};
    for (const config of configs) {
      result[config.key] = config.value;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Config GET error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '설정을 불러오는 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

// PUT: 설정값 수정
const updateConfigSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = updateConfigSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: '유효하지 않은 요청입니다.', details: validation.error.flatten() } },
        { status: 400 }
      );
    }

    const { key, value } = validation.data;

    // upsert: 있으면 업데이트, 없으면 생성
    const config = await prisma.config.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    // 예산 변경 시 로그 기록
    if (key === 'annual_budget') {
      await prisma.changeLog.create({
        data: {
          action: 'BUDGET',
          detail: '연간 예산 설정',
          toValue: value,
        },
      });
    }

    return NextResponse.json({
      success: true,
      key: config.key,
      value: config.value,
    });
  } catch (error) {
    console.error('Config PUT error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '설정을 저장하는 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
