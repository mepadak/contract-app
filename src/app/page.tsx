import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const runtime = 'edge';

export default async function Home() {
  // PIN 설정 여부 확인
  const auth = await prisma.auth.findFirst();

  if (!auth) {
    redirect('/setup');
  }

  // 세션 확인
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // 인증된 사용자는 채팅 페이지로
  redirect('/chat');
}
