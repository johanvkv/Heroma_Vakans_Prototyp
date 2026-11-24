import { createHash } from 'node:crypto';
import { json, readComments } from '../lib/feedbackStore';

export const config = {
  path: '/api/feedback-summary',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};

export default async (request: Request) => {
  if (request.method !== 'GET') return json({ error: 'Metoden stöds inte.' }, 405, { Allow: 'GET' });

  try {
    const { comments, truncated } = await readComments(request);
    return json({
      comments: comments.map(comment => ({
        ...comment,
        // The visitor ID also identifies a person's own comments in /api/feedback.
        // A stable hash preserves grouping in the summary without exposing that ID.
        visitorId: createHash('sha256').update(comment.visitorId).digest('hex'),
      })),
      truncated,
    });
  } catch (error) {
    console.error('Failed to read feedback summary', error);
    return json({ error: 'Kommentarerna kunde inte hämtas.' }, 500);
  }
};
