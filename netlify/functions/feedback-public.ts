import { createHash } from 'node:crypto';
import { json, readComments } from '../lib/feedbackStore';

export const config = {
  path: '/api/feedback-public',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};

export default async (request: Request) => {
  if (request.method !== 'GET') return json({ error: 'Metoden stöds inte.' }, 405, { Allow: 'GET' });

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
