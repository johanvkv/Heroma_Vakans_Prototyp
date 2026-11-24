import { createHmac, timingSafeEqual } from 'node:crypto';
import { commentKey, feedbackStore, json, readComments, sameOrigin, visitorIdPattern, type FeedbackComment, type FeedbackStatus } from '../lib/feedbackStore';

const cookieName = 'heroma-feedback-admin';
const cookiePath = '/api/feedback-admin';
const maxAgeSeconds = 8 * 60 * 60;
const statuses: FeedbackStatus[] = ['open', 'reviewed', 'done'];

export const config = { path: '/api/feedback-admin', rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] } };

function secret() { return process.env.FEEDBACK_SESSION_SECRET ?? ''; }
function password() { return process.env.FEEDBACK_ADMIN_PASSWORD ?? ''; }
function sign(value: string) { return createHmac('sha256', secret()).update(value).digest('base64url'); }
function equal(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
function authorized(request: Request) {
  const cookie = request.headers.get('cookie')?.split(';').map(part => part.trim()).find(part => part.startsWith(`${cookieName}=`));
  const token = cookie?.slice(cookieName.length + 1) ?? '';
  const [expiry, signature] = token.split('.');
  return Boolean(expiry && signature && Number(expiry) > Date.now() && equal(sign(expiry), signature));
}
function sessionCookie() {
  const expiry = String(Date.now() + maxAgeSeconds * 1000);
  return `${cookieName}=${expiry}.${sign(expiry)}; HttpOnly; Secure; SameSite=Strict; Path=${cookiePath}; Max-Age=${maxAgeSeconds}`;
}

export default async (request: Request) => {
  if (!secret() || !password() || secret().length < 32 || password().length < 12) {
    return json({ error: 'Administratörsåtkomst är inte konfigurerad i Netlify.' }, 503);
  }
  if (request.method !== 'GET' && !sameOrigin(request)) return json({ error: 'Förfrågan kommer från fel webbplats.' }, 403);

  try {
    if (request.method === 'POST') {
      if (Number(request.headers.get('content-length') || 0) > 2000) return json({ error: 'Ogiltig förfrågan.' }, 413);
      const body = await request.json() as { action?: string; password?: string };
      if (body.action === 'login') {
        if (typeof body.password !== 'string' || !equal(body.password, password())) {
          return json({ error: 'Fel lösenord.' }, 401);
        }
        return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie() });
      }
      if (body.action === 'logout') {
        return json({ ok: true }, 200, { 'Set-Cookie': `${cookieName}=; HttpOnly; Secure; SameSite=Strict; Path=${cookiePath}; Max-Age=0` });
      }
      return json({ error: 'Okänd åtgärd.' }, 400);
    }

    if (!authorized(request)) return json({ error: 'Logga in som administratör.' }, 401);
    if (request.method === 'GET') return json(await readComments(request));

    if (request.method === 'PATCH' || request.method === 'DELETE') {
      const body = await request.json() as { visitorId?: string; id?: string; status?: FeedbackStatus };
      if (!body.visitorId || !visitorIdPattern.test(body.visitorId) || !body.id || !visitorIdPattern.test(body.id)) {
        return json({ error: 'Ogiltig kommentar.' }, 400);
      }
      const key = commentKey(request, body.visitorId, body.id);
      const store = feedbackStore();
      const current = await store.get(key, { type: 'json' }) as FeedbackComment | null;
      if (!current) return json({ error: 'Kommentaren finns inte.' }, 404);
      if (request.method === 'DELETE') {
        await store.delete(key);
        return json({ ok: true });
      }
      if (!body.status || !statuses.includes(body.status)) return json({ error: 'Ogiltig status.' }, 400);
      const updated = { ...current, status: body.status };
      await store.setJSON(key, updated);
      return json({ comment: updated });
    }

    return json({ error: 'Metoden stöds inte.' }, 405, { Allow: 'GET, POST, PATCH, DELETE' });
  } catch (error) {
    console.error('Feedback admin request failed', error);
    return json({ error: 'Det gick inte att hantera kommentarer. Försök igen.' }, 500);
  }
};
