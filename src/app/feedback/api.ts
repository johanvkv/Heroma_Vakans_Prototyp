export type FeedbackStatus = 'open' | 'reviewed' | 'done';

export interface FeedbackComment {
  id: string;
  visitorId: string;
  displayName: string;
  text: string;
  createdAt: string;
  path: string;
  viewKey: string;
  anchor: string;
  x: number;
  y: number;
  status: FeedbackStatus;
  hasScreenshot?: boolean;
  screenshotUrl?: string;
}

export type FeedbackDraft = Pick<FeedbackComment, 'visitorId' | 'text' | 'path' | 'viewKey' | 'anchor' | 'x' | 'y'> & { screenshot?: string };

const localKey = 'heroma-feedback-local-demo';
const visitorKey = 'heroma-feedback-visitor-id';
export const localDemo = import.meta.env.DEV;

export function savedFeedbackVisitorId() {
  try { return localStorage.getItem(visitorKey); }
  catch { return null; }
}

export async function feedbackVisitorKey(visitorId: string) {
  if (localDemo) return visitorId;
  try {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(visitorId));
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  } catch { return null; }
}

function localComments(): FeedbackComment[] {
  try {
    const stored = JSON.parse(localStorage.getItem(localKey) || '[]') as FeedbackComment[];
    const anonymous = stored.map(comment => ({ ...comment, displayName: 'Anonym' }));
    if (stored.some(comment => comment.displayName !== 'Anonym')) saveLocal(anonymous);
    return anonymous;
  }
  catch { return []; }
}
function saveLocal(comments: FeedbackComment[]) { localStorage.setItem(localKey, JSON.stringify(comments)); }

async function request<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/${endpoint}`, { credentials: 'same-origin', ...init });
  let data: T & { error?: string };
  try { data = await response.json() as T & { error?: string }; }
  catch { throw new Error('Servern svarade inte. Kontrollera att Netlify Functions är aktiverat.'); }
  if (!response.ok) throw Object.assign(new Error(data.error || 'Ett fel uppstod.'), { status: response.status });
  return data;
}
const jsonBody = (body: unknown) => ({ headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

export async function createFeedback(draft: FeedbackDraft) {
  if (localDemo) {
    const { screenshot, ...fields } = draft;
    const comment: FeedbackComment = { ...fields, displayName: 'Anonym', id: crypto.randomUUID(), createdAt: new Date().toISOString(), status: 'open', hasScreenshot: Boolean(screenshot), screenshotUrl: screenshot };
    saveLocal([comment, ...localComments()]);
    return { comment };
  }
  return request<{ comment: FeedbackComment }>('feedback', { method: 'POST', ...jsonBody(draft) });
}

export async function listAllFeedback() {
  if (localDemo) return { comments: localComments(), truncated: false };
  return request<{ comments: FeedbackComment[]; truncated: boolean }>('feedback-public');
}

export async function deleteFeedbackComment(id: string, visitorId: string) {
  if (localDemo) {
    const comments = localComments();
    if (!comments.some(comment => comment.id === id && comment.visitorId === visitorId)) {
      throw new Error('Du kan bara ta bort kommentarer som skapats i den här webbläsaren.');
    }
    saveLocal(comments.filter(comment => comment.id !== id));
    return { ok: true };
  }
  return request<{ ok: boolean }>('feedback-public', { method: 'DELETE', ...jsonBody({ id, visitorId }) });
}
