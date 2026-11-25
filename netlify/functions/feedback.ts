import { randomUUID } from 'node:crypto';
import { commentKey, feedbackStore, imageKey, json, sameOrigin, visitorIdPattern, type FeedbackComment } from '../lib/feedbackStore';

export const config = { path: '/api/feedback', rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] } };

export default async (request: Request) => {
  try {
    if (request.method !== 'POST') return json({ error: 'Metoden stöds inte.' }, 405, { Allow: 'POST' });
    if (!sameOrigin(request)) return json({ error: 'Förfrågan kommer från fel webbplats.' }, 403);
    if (!(request.headers.get('content-type') ?? '').startsWith('application/json')) return json({ error: 'JSON krävs.' }, 415);
    if (Number(request.headers.get('content-length') || 0) > 130_000) return json({ error: 'Kommentaren eller bilden är för stor.' }, 413);

    const rawBody = await request.text();
    if (rawBody.length > 130_000) return json({ error: 'Kommentaren eller bilden är för stor.' }, 413);
    const body = JSON.parse(rawBody) as Partial<FeedbackComment> & { screenshot?: unknown };
    const visitorId = typeof body.visitorId === 'string' ? body.visitorId : '';
    const text = typeof body.text === 'string' ? body.text.trim() : '';
    const path = typeof body.path === 'string' ? body.path : '';
    const viewKey = typeof body.viewKey === 'string' ? body.viewKey : '';
    const anchor = typeof body.anchor === 'string' ? body.anchor : '';
    const x = Number(body.x);
    const y = Number(body.y);
    const screenshot = typeof body.screenshot === 'string' ? body.screenshot : '';
    if (!visitorIdPattern.test(visitorId) || !text || text.length > 2000
      || !path.startsWith('/') || path.startsWith('//') || /[\\\r\n?#]/.test(path) || path.length > 240 || viewKey.length > 240 || anchor.length > 500
      || !Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 1 || y < 0 || y > 1) {
      return json({ error: 'Kontrollera kommentar och placering.' }, 400);
    }
    if (screenshot && (screenshot.length > 110_000 || !/^data:image\/webp;base64,[A-Za-z0-9+/]+={0,2}$/.test(screenshot))) {
      return json({ error: 'Skärmbilden har fel format eller är för stor.' }, 400);
    }
    const imageBytes = screenshot ? Buffer.from(screenshot.slice('data:image/webp;base64,'.length), 'base64') : null;
    if (imageBytes && (imageBytes.length > 80_000 || imageBytes.toString('ascii', 0, 4) !== 'RIFF'
      || imageBytes.toString('ascii', 8, 12) !== 'WEBP')) {
      return json({ error: 'Skärmbilden kunde inte läsas.' }, 400);
    }

    const comment: FeedbackComment = {
      id: randomUUID(), visitorId, displayName: 'Anonym', text, path, viewKey, anchor, x, y,
      createdAt: new Date().toISOString(), status: 'open', hasScreenshot: Boolean(imageBytes),
    };
    const store = feedbackStore();
    if (imageBytes) await store.set(imageKey(request, comment.id), Uint8Array.from(imageBytes).buffer as ArrayBuffer, { onlyIfNew: true });
    await store.setJSON(commentKey(request, visitorId, comment.id), comment, { onlyIfNew: true });
    return json({ comment }, 201);
  } catch (error) {
    console.error('Feedback request failed', error);
    return json({ error: 'Det gick inte att spara eller läsa kommentarer. Försök igen.' }, 500);
  }
};
