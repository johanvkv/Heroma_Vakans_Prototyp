import { getStore } from '@netlify/blobs';

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

// A site-wide store survives deploys. Runtime BRANCH is not guaranteed by
// Netlify, so the request hostname separates the stable branch URL from main.
export function commentPrefix(request: Request) {
  const scope = (process.env.FEEDBACK_SCOPE || new URL(request.url).hostname)
    .replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 100);
  return `comments/${scope}/`;
}
export const feedbackStore = () => getStore({ name: 'prototype-feedback', region: 'eu-central-1', consistency: 'strong' });
export const commentKey = (request: Request, visitorId: string, id: string) => `${commentPrefix(request)}${visitorId}/${id}`;

export const visitorIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extraHeaders },
  });
}

export function sameOrigin(request: Request) {
  return request.headers.get('origin') === new URL(request.url).origin;
}

export async function readComments(request: Request, prefix = commentPrefix(request), max = 5000) {
  const store = feedbackStore();
  const comments: FeedbackComment[] = [];
  let truncated = false;
  for await (const page of store.list({ prefix, paginate: true })) {
    for (const blob of page.blobs) {
      if (comments.length >= max) { truncated = true; break; }
      const comment = await store.get(blob.key, { type: 'json' }) as FeedbackComment | null;
      if (comment) comments.push(comment);
    }
    if (truncated) break;
  }
  comments.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { comments, truncated };
}
