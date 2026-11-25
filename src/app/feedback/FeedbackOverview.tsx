import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Layout } from '../components/Layout';
import { listAllFeedback, type FeedbackComment } from './api';
import { feedbackContext, feedbackLink, feedbackOpensInPlace } from './context';
import './overview.css';

type Group = { key: string; title: string; detail: string; comments: FeedbackComment[] };

function ScreenshotThumbnail({ comment }: { comment: FeedbackComment }) {
  const [failed, setFailed] = useState(false);
  return <div className="feedback-overview-thumbnail">
    {comment.hasScreenshot && !failed
      ? <img src={comment.screenshotUrl ?? `/api/feedback-image?id=${encodeURIComponent(comment.id)}`} alt="Skärmbild av platsen där kommentaren skrevs" loading="lazy" onError={() => setFailed(true)} />
      : <span>{failed ? 'Bild kunde inte hämtas' : 'Ingen bild sparad'}</span>}
  </div>;
}

export function FeedbackOverview() {
  const [comments, setComments] = useState<FeedbackComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [truncated, setTruncated] = useState(false);
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState<'all' | 'page' | 'dialog'>('all');

  useEffect(() => {
    let cancelled = false;
    listAllFeedback().then(result => {
      if (cancelled) return;
      setComments(result.comments);
      setTruncated(result.truncated);
      setLoading(false);
    }).catch(cause => {
      if (cancelled) return;
      setError(cause instanceof Error ? cause.message : 'Kommentarerna kunde inte hämtas.');
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const groups = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('sv-SE');
    const byContext = new Map<string, Group>();
    comments.forEach(comment => {
      const isDialog = comment.viewKey.startsWith('dialog:');
      if (kind !== 'all' && (kind === 'dialog') !== isDialog) return;
      const context = feedbackContext(comment);
      if (query && !`${comment.text} ${context.title} ${context.detail}`.toLocaleLowerCase('sv-SE').includes(query)) return;
      let group = byContext.get(context.group);
      if (!group) {
        group = { key: context.group, title: context.title, detail: context.detail, comments: [] };
        byContext.set(context.group, group);
      }
      group.comments.push(comment);
    });
    return [...byContext.values()].sort((a, b) => b.comments[0].createdAt.localeCompare(a.comments[0].createdAt));
  }, [comments, search, kind]);
  const visibleCount = groups.reduce((sum, group) => sum + group.comments.length, 0);

  return <Layout title="Kommentarer" breadcrumbItems={[{ label: 'Heroma', href: '/' }, { label: 'Nämnder', isActive: true }]}>
    <main className="feedback-overview">
      <header className="feedback-overview-intro">
        <div>
          <p className="feedback-overview-eyebrow">Nämnder</p>
          <h1>Alla kommentarer</h1>
          <p>Kommentarerna är samlade efter vy och dialogtyp. Öppna en kommentar på plats för att se dess markering i prototypen.</p>
        </div>
        <Link className="feedback-overview-back" to="/vikariehantering/schema">Till schemat</Link>
      </header>
      <div className="feedback-overview-toolbar">
        <label htmlFor="feedback-overview-search">Sök kommentarer</label>
        <input id="feedback-overview-search" type="search" placeholder="Sök i text eller sammanhang" value={search} onChange={event => setSearch(event.target.value)} />
        <div className="feedback-overview-tabs" role="group" aria-label="Filtrera typ">
          {([['all', 'Alla'], ['page', 'Vyer'], ['dialog', 'Dialoger']] as const).map(([value, label]) =>
            <button key={value} type="button" aria-pressed={kind === value} onClick={() => setKind(value)}>{label}</button>)}
        </div>
        <span className="feedback-overview-count">{visibleCount} {visibleCount === 1 ? 'kommentar' : 'kommentarer'}</span>
      </div>
      {loading && <p className="feedback-overview-state" role="status">Hämtar kommentarer…</p>}
      {error && <p className="feedback-overview-state feedback-overview-error" role="alert">{error}</p>}
      {truncated && <p className="feedback-overview-state">Visar de senaste 5 000 kommentarerna.</p>}
      {!loading && !error && groups.length === 0 && <p className="feedback-overview-state">{comments.length ? 'Inga kommentarer matchar filtret.' : 'Det finns inga kommentarer ännu.'}</p>}
      <div className="feedback-overview-groups">
        {groups.map(group => <section className="feedback-overview-group" key={group.key}>
          <div className="feedback-overview-group-heading"><div><h2>{group.title}</h2><p>{group.detail}</p></div><span>{group.comments.length}</span></div>
          <div className="feedback-overview-cards">
            {group.comments.map(comment => <article className="feedback-overview-card" key={comment.id}>
              <ScreenshotThumbnail comment={comment} />
              <div className="feedback-overview-card-main">
                <p className="feedback-overview-card-text">{comment.text}</p>
                <div className="feedback-overview-card-meta">
                  <time dateTime={comment.createdAt}>{new Date(comment.createdAt).toLocaleString('sv-SE')}</time>
                  <span>{group.title} · {group.detail}</span>
                </div>
                <Link to={feedbackLink(comment)}>{feedbackOpensInPlace(comment) ? 'Visa på plats' : 'Öppna vyn'} <span aria-hidden="true">↗</span></Link>
                {!feedbackOpensInPlace(comment) && <p className="feedback-overview-reopen-note">Öppna sedan en dialog av typen {group.title.toLocaleLowerCase('sv-SE')} för att se markeringen.</p>}
              </div>
            </article>)}
          </div>
        </section>)}
      </div>
    </main>
  </Layout>;
}
