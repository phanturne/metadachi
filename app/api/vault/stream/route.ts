import { vaultCache } from '@/lib/vaultCache';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const onUpdate = () => {
        controller.enqueue(encoder.encode(`data: update\n\n`));
      };

      vaultCache.events.on('update', onUpdate);

      request.signal.addEventListener('abort', () => {
        vaultCache.events.off('update', onUpdate);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
