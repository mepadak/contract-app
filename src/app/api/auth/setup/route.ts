import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPin, createSession } from '@/lib/auth';
import { z } from 'zod';

export const runtime = 'edge';

const SetupSchema = z.object({
  pin: z.string().length(4).regex(/^\d+$/, 'PIN은 4자리 숫자여야 합니다'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pin } = SetupSchema.parse(body);

    // 기존 PIN이 있는지 확인
    const existingAuth = await prisma.auth.findFirst();
    if (existingAuth) {
      return NextResponse.json(
        { error: { code: 'CONFLICT', message: 'PIN이 이미 설정되어 있습니다' } },
        { status: 409 }
      );
    }

    // PIN 해싱 및 저장
    const pinHash = await hashPin(pin);
    await prisma.auth.create({
      data: { pinHash },
    });

    // 세션 생성
    await createSession();

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } },
        { status: 400 }
      );
    }
    console.error('PIN setup error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' } },
      { status: 500 }
    );
  }
}

// PIN 설정 여부 확인
export async function GET() {
  try {
    const auth = await prisma.auth.findFirst();
    return NextResponse.json({ isSetup: !!auth });
  } catch (error) {
    console.error('PIN setup check error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' } },
      { status: 500 }
    );
  }
}
