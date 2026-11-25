import { createHash } from 'node:crypto';
import { commentKey, feedbackStore, imageKey, json, readComments, sameOrigin, visitorIdPattern } from '../lib/feedbackStore';

export const config = {
  path: '/api/feedback-public',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};

export default async (request: Request) => {
  if (request.method === 'DELETE') {
    if (!sameOrigin(request)) return json({ error: 'Förfrågan kommer från fel webbplats.' }, 403);
    if (Number(request.headers.get('content-length') || 0) > 1000) return json({ error: 'Ogiltig förfrågan.' }, 413);

    try {
      const body = await request.json() as { id?: string; visitorId?: string };
      if (!body.id || !visitorIdPattern.test(body.id) || !body.visitorId || !visitorIdPattern.test(body.visitorId)) {
        return json({ error: 'Ogiltig kommentar.' }, 400);
      }

      const store = feedbackStore();
      const key = commentKey(request, body.visitorId, body.id);
      const comment = await store.get(key, { type: 'json' });
      if (!comment) return json({ error: 'Kommentaren finns inte längre eller skapades i en annan webbläsare.' }, 404);
      await store.delete(key);
      await store.delete(imageKey(request, body.id));
      return json({ ok: true });
    } catch (error) {
      console.error('Failed to delete public feedback', error);
      return json({ error: 'Kommentaren kunde inte tas bort.' }, 500);
    }
  }

  if (request.method !== 'GET') return json({ error: 'Metoden stöds inte.' }, 405, { Allow: 'GET, DELETE' });

  try {
    const { comments, truncated } = await readComments(request);
    return json({
      comments: comments.map(comment => ({
        ...comment,
        // Keep a stable pseudonym for possible future grouping without exposing the stored ID.
        visitorId: createHash('sha256').update(comment.visitorId).digest('hex'),
        // Older comments may contain names. Never publish them with shared pins.
        displayName: 'Anonym',
      })),
      truncated,
    });
  } catch (error) {
    console.error('Failed to read public feedback', error);
    return json({ error: 'Kommentarerna kunde inte hämtas.' }, 500);
  }
};
