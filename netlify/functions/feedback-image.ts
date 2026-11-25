import { feedbackStore, imageKey, visitorIdPattern } from '../lib/feedbackStore';

export const config = {
  path: '/api/feedback-image',
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};

export default async (request: Request) => {
  if (request.method !== 'GET') return new Response(null, { status: 405, headers: { Allow: 'GET' } });
  const id = new URL(request.url).searchParams.get('id') ?? '';
  if (!visitorIdPattern.test(id)) return new Response(null, { status: 400 });
  try {
    const image = await feedbackStore().get(imageKey(request, id), { type: 'arrayBuffer' });
    if (!image) return new Response(null, { status: 404 });
    return new Response(image, {
      headers: { 'Content-Type': 'image/webp', 'Cache-Control': 'public, max-age=86400', 'X-Content-Type-Options': 'nosniff' },
    });
  } catch (error) {
    console.error('Feedback image request failed', error);
    return new Response(null, { status: 500 });
  }
};
