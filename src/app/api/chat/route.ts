import { streamText, stepCountIs } from 'ai';
import { google } from '@ai-sdk/google';
import { systemPrompt } from '@/lib/ai/system-prompt';
import { contractTools } from '@/lib/ai/tools';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // 최근 10개 메시지만 유지 (컨텍스트 관리)
    const recentMessages = messages.slice(-10);

    const result = streamText({
      model: google('gemini-1.5-flash'),
      system: systemPrompt,
      messages: recentMessages,
      tools: contractTools,
      // AI SDK 6.x: maxSteps → stopWhen
      stopWhen: stepCountIs(5),
    });

    // AI SDK 6.x: toDataStreamResponse → toUIMessageStreamResponse
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : '채팅 처리 중 오류가 발생했습니다.',
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
