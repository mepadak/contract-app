import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const runtime = 'edge';

export default async function Home() {
  // [임시 비활성화] 인증 체크 - 테스트용
  // const auth = await prisma.auth.findFirst();
  // if (!auth) {
  //   redirect('/setup');
  // }
  // const session = await getSession();
  // if (!session) {
  //   redirect('/login');
  // }

  // 바로 채팅 페이지로
  redirect('/chat');
}
