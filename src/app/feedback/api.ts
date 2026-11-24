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
}

export type FeedbackDraft = Pick<FeedbackComment, 'visitorId' | 'displayName' | 'text' | 'path' | 'viewKey' | 'anchor' | 'x' | 'y'>;

const localKey = 'heroma-feedback-local-demo';
export const localDemo = import.meta.env.DEV;

function localComments(): FeedbackComment[] {
  try { return JSON.parse(localStorage.getItem(localKey) || '[]') as FeedbackComment[]; }
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

export async function listMyFeedback(visitorId: string) {
  if (localDemo) return { comments: localComments().filter(comment => comment.visitorId === visitorId), truncated: false };
  return request<{ comments: FeedbackComment[]; truncated: boolean }>(`feedback?visitorId=${encodeURIComponent(visitorId)}`);
}

export async function createFeedback(draft: FeedbackDraft) {
  if (localDemo) {
    const comment: FeedbackComment = { ...draft, id: crypto.randomUUID(), createdAt: new Date().toISOString(), status: 'open' };
    saveLocal([comment, ...localComments()]);
    return { comment };
  }
  return request<{ comment: FeedbackComment }>('feedback', { method: 'POST', ...jsonBody(draft) });
}

export async function listFeedbackSummary() {
  if (localDemo) return { comments: localComments(), truncated: false };
  return request<{ comments: FeedbackComment[]; truncated: boolean }>('feedback-summary');
}
