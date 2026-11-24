import { randomUUID } from 'node:crypto';
import { commentKey, feedbackStore, json, sameOrigin, visitorIdPattern, type FeedbackComment } from '../lib/feedbackStore';

export const config = { path: '/api/feedback', rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] } };

export default async (request: Request) => {
  try {
    if (request.method !== 'POST') return json({ error: 'Metoden stöds inte.' }, 405, { Allow: 'POST' });
    if (!sameOrigin(request)) return json({ error: 'Förfrågan kommer från fel webbplats.' }, 403);
    if (!(request.headers.get('content-type') ?? '').startsWith('application/json')) return json({ error: 'JSON krävs.' }, 415);
    if (Number(request.headers.get('content-length') || 0) > 8000) return json({ error: 'Kommentaren är för lång.' }, 413);

    const body = await request.json() as Partial<FeedbackComment>;
    const visitorId = typeof body.visitorId === 'string' ? body.visitorId : '';
    const text = typeof body.text === 'string' ? body.text.trim() : '';
    const path = typeof body.path === 'string' ? body.path : '';
    const viewKey = typeof body.viewKey === 'string' ? body.viewKey : '';
    const anchor = typeof body.anchor === 'string' ? body.anchor : '';
    const x = Number(body.x);
    const y = Number(body.y);
    if (!visitorIdPattern.test(visitorId) || !text || text.length > 2000
      || !path.startsWith('/') || path.startsWith('//') || /[\\\r\n?#]/.test(path) || path.length > 240 || viewKey.length > 240 || anchor.length > 500
      || !Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 1 || y < 0 || y > 1) {
      return json({ error: 'Kontrollera kommentar och placering.' }, 400);
    }

    const comment: FeedbackComment = {
      id: randomUUID(), visitorId, displayName: 'Anonym', text, path, viewKey, anchor, x, y,
      createdAt: new Date().toISOString(), status: 'open',
    };
    await feedbackStore().setJSON(commentKey(request, visitorId, comment.id), comment, { onlyIfNew: true });
    return json({ comment }, 201);
  } catch (error) {
    console.error('Feedback request failed', error);
    return json({ error: 'Det gick inte att spara eller läsa kommentarer. Försök igen.' }, 500);
  }
};
