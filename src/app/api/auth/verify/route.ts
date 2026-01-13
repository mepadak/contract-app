import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPin, createSession } from '@/lib/auth';
import { z } from 'zod';

export const runtime = 'edge';

const VerifySchema = z.object({
  pin: z.string().length(4).regex(/^\d+$/, 'PIN은 4자리 숫자여야 합니다'),
});

// 간단한 Rate Limiting (메모리 기반)
// Edge Runtime에서는 전역 상태가 인스턴스별로 유지되므로
// 완벽한 Rate Limiting은 아니지만 기본적인 보호 제공
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15분

function cleanupOldAttempts() {
  const now = Date.now();
  for (const [key, value] of failedAttempts.entries()) {
    if (now - value.lastAttempt > LOCKOUT_DURATION) {
      failedAttempts.delete(key);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // 주기적으로 오래된 기록 정리
    cleanupOldAttempts();

    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

    // Rate limiting 확인
    const attempts = failedAttempts.get(clientIP);
    if (attempts && attempts.count >= MAX_ATTEMPTS) {
      const elapsed = Date.now() - attempts.lastAttempt;
      if (elapsed < LOCKOUT_DURATION) {
        const remaining = Math.ceil((LOCKOUT_DURATION - elapsed) / 60000);
        return NextResponse.json(
          {
            error: {
              code: 'TOO_MANY_ATTEMPTS',
              message: `${remaining}분 후에 다시 시도해주세요`,
            },
          },
          { status: 429 }
        );
      }
      failedAttempts.delete(clientIP);
    }

    const body = await request.json();
    const { pin } = VerifySchema.parse(body);

    // PIN 확인
    const auth = await prisma.auth.findFirst();
    if (!auth) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'PIN이 설정되지 않았습니다' } },
        { status: 404 }
      );
    }

    const isValid = await verifyPin(pin, auth.pinHash);

    if (!isValid) {
      // 실패 횟수 기록
      const current = failedAttempts.get(clientIP) || { count: 0, lastAttempt: 0 };
      failedAttempts.set(clientIP, {
        count: current.count + 1,
        lastAttempt: Date.now(),
      });

      const remaining = MAX_ATTEMPTS - current.count - 1;
      return NextResponse.json(
        {
          success: false,
          error: 'PIN이 일치하지 않습니다',
          remaining: Math.max(0, remaining),
        },
        { status: 401 }
      );
    }

    // 성공 시 실패 기록 초기화
    failedAttempts.delete(clientIP);

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
    console.error('PIN verify error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' } },
      { status: 500 }
    );
  }
}
