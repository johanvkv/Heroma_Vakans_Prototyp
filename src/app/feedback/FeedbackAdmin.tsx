import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { deleteFeedback, listAdminFeedback, localDemo, loginFeedbackAdmin, logoutFeedbackAdmin, updateFeedbackStatus, type FeedbackComment, type FeedbackStatus } from './api';
import './feedback.css';

const statusNames: Record<FeedbackStatus, string> = { open: 'Öppen', reviewed: 'Granskad', done: 'Klar' };

function downloadCsv(comments: FeedbackComment[]) {
  const columns = ['Datum', 'Namn', 'Sida', 'Vy', 'Status', 'Kommentar', 'ID'];
  const quote = (value: unknown) => {
    const cell = String(value ?? '');
    const safe = /^[\s]*[=+\-@]/.test(cell) ? `'${cell}` : cell;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const rows = comments.map(comment => [comment.createdAt, comment.displayName, comment.path, comment.viewKey, statusNames[comment.status], comment.text, comment.id]);
  const csv = '\uFEFF' + [columns, ...rows].map(row => row.map(quote).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `prototypkommentarer-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function FeedbackAdmin() {
  const [auth, setAuth] = useState<'loading' | 'login' | 'ready' | 'missing'>('loading');
  const [password, setPassword] = useState('');
  const [comments, setComments] = useState<FeedbackComment[]>([]);
  const [truncated, setTruncated] = useState(false);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState('alla');
  const [person, setPerson] = useState('alla');
  const [status, setStatus] = useState<'alla' | FeedbackStatus>('alla');

  const reload = useCallback(async () => {
    try {
      const result = await listAdminFeedback();
      setComments(result.comments);
      setTruncated(result.truncated);
      setAuth('ready');
      setError('');
    } catch (cause) {
      const failure = cause as Error & { status?: number };
      if (failure.status === 401) setAuth('login');
      else if (failure.status === 503) { setAuth('missing'); setError(failure.message); }
      else { setAuth('login'); setError(failure.message || 'Kommentarerna kunde inte hämtas.'); }
    }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    try { await loginFeedbackAdmin(password); setPassword(''); await reload(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Inloggningen misslyckades.'); }
  }

  async function changeStatus(comment: FeedbackComment, next: FeedbackStatus) {
    setBusyId(comment.id); setError('');
    try {
      const { comment: updated } = await updateFeedbackStatus(comment, next);
      setComments(current => current.map(item => item.id === comment.id ? updated : item));
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Status kunde inte sparas.'); }
    finally { setBusyId(null); }
  }

  async function remove(comment: FeedbackComment) {
    if (!window.confirm(`Ta bort kommentaren från ${comment.displayName} permanent?`)) return;
    setBusyId(comment.id); setError('');
    try { await deleteFeedback(comment); setComments(current => current.filter(item => item.id !== comment.id)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Kommentaren kunde inte tas bort.'); }
    finally { setBusyId(null); }
  }

  const pages = useMemo(() => [...new Set(comments.map(comment => comment.path))].sort(), [comments]);
  const people = useMemo(() => {
    const grouped = new Map<string, { name: string; count: number }>();
    for (const comment of comments) {
      const current = grouped.get(comment.visitorId);
      grouped.set(comment.visitorId, { name: current?.name ?? comment.displayName, count: (current?.count ?? 0) + 1 });
    }
    return [...grouped.entries()].sort((a, b) => a[1].name.localeCompare(b[1].name, 'sv-SE'));
  }, [comments]);
  const filtered = useMemo(() => comments.filter(comment => {
    if (page !== 'alla' && comment.path !== page) return false;
    if (person !== 'alla' && comment.visitorId !== person) return false;
    if (status !== 'alla' && comment.status !== status) return false;
    const needle = search.trim().toLocaleLowerCase('sv-SE');
    return !needle || [comment.text, comment.displayName, comment.path, comment.viewKey].some(value => value.toLocaleLowerCase('sv-SE').includes(needle));
  }), [comments, page, person, search, status]);
  const counts = useMemo(() => ({
    all: comments.length,
    open: comments.filter(comment => comment.status === 'open').length,
    reviewed: comments.filter(comment => comment.status === 'reviewed').length,
    done: comments.filter(comment => comment.status === 'done').length,
    people: new Set(comments.map(comment => comment.visitorId)).size,
  }), [comments]);
  const byPage = useMemo(() => pages.map(path => ({ path, count: comments.filter(comment => comment.path === path).length })), [comments, pages]);

  return <main className="feedback-admin-page">
    <div className="feedback-admin-shell">
      <header className="feedback-admin-header">
        <div><a href="/vikariehantering/schema">← Till prototypen</a><h1>Kommentarer från testpersoner</h1><p>Sammanställning av platsbundna kommentarer över tid.</p></div>
        {auth === 'ready' && <button type="button" onClick={async () => { await logoutFeedbackAdmin(); setAuth('login'); setComments([]); }}>Logga ut</button>}
      </header>

      {localDemo && <p className="feedback-admin-demo">Lokal förhandsvisning: kommentarer sparas bara i den här webbläsaren. På Netlify sparas de gemensamt.</p>}
      {auth === 'loading' && <p>Hämtar kommentarer…</p>}
      {auth === 'missing' && <div className="feedback-admin-login"><h2>Administratörsåtkomst saknas</h2><p>{error}</p><p>Lägg till <code>FEEDBACK_ADMIN_PASSWORD</code> och <code>FEEDBACK_SESSION_SECRET</code> i Netlifys miljövariabler för Functions och publicera grenen på nytt.</p></div>}
      {auth === 'login' && <form className="feedback-admin-login" onSubmit={login}>
        <h2>Administratörsinloggning</h2><p>Kommentarsammanställningen kräver ett separat lösenord.</p>
        <label>Lösenord<input type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} autoFocus /></label>
        {error && <p className="feedback-error" role="alert">{error}</p>}
        <button type="submit">Logga in</button>
      </form>}

      {auth === 'ready' && <>
        {error && <p className="feedback-error" role="alert">{error}</p>}
        {truncated && <p className="feedback-admin-warning">Listan visar de första 5 000 kommentarerna. Exporten omfattar bara de laddade kommentarerna.</p>}
        <section className="feedback-admin-stats" aria-label="Sammanfattning">
          <button type="button" onClick={() => setStatus('alla')}><strong>{counts.all}</strong><span>Kommentarer</span></button>
          <button type="button" onClick={() => setStatus('open')}><strong>{counts.open}</strong><span>Öppna</span></button>
          <button type="button" onClick={() => setStatus('reviewed')}><strong>{counts.reviewed}</strong><span>Granskade</span></button>
          <button type="button" onClick={() => setStatus('done')}><strong>{counts.done}</strong><span>Klara</span></button>
          <div><strong>{counts.people}</strong><span>Testpersoner</span></div>
        </section>
        <section className="feedback-admin-pages" aria-label="Kommentarer per sida">
          <button type="button" className={page === 'alla' ? 'selected' : ''} onClick={() => setPage('alla')}>Alla sidor</button>
          {byPage.map(item => <button type="button" key={item.path} className={page === item.path ? 'selected' : ''} onClick={() => setPage(item.path)}>{item.path} <span>{item.count}</span></button>)}
        </section>
        <section className="feedback-admin-controls" aria-label="Filtrera kommentarer">
          <label>Sök<input type="search" placeholder="Namn, kommentar eller sida" value={search} onChange={event => setSearch(event.target.value)} /></label>
          <label>Testperson<select value={person} onChange={event => setPerson(event.target.value)}><option value="alla">Alla testpersoner</option>{people.map(([id, item]) => <option key={id} value={id}>{item.name} ({item.count})</option>)}</select></label>
          <label>Status<select value={status} onChange={event => setStatus(event.target.value as typeof status)}><option value="alla">Alla statusar</option><option value="open">Öppna</option><option value="reviewed">Granskade</option><option value="done">Klara</option></select></label>
          <button type="button" onClick={() => downloadCsv(filtered)} disabled={filtered.length === 0}>Exportera CSV ({filtered.length})</button>
          <button type="button" onClick={() => void reload()}>Uppdatera</button>
        </section>
        <p className="feedback-admin-result-count">Visar {filtered.length} av {comments.length} kommentarer</p>
        <div className="feedback-admin-list">
          {filtered.length === 0 && <p className="feedback-admin-empty">Inga kommentarer matchar urvalet.</p>}
          {filtered.map(comment => <article key={comment.id} className="feedback-admin-comment">
            <div className="feedback-admin-comment-top"><strong>{comment.displayName}</strong><time>{new Date(comment.createdAt).toLocaleString('sv-SE')}</time><span className={`feedback-admin-status status-${comment.status}`}>{statusNames[comment.status]}</span></div>
            <p>{comment.text}</p>
            <div className="feedback-admin-location"><a href={`${comment.path}?feedbackId=${encodeURIComponent(comment.id)}&feedbackView=${encodeURIComponent(comment.viewKey)}${comment.anchor.includes('candidate-') ? '&feedbackTarget=candidate' : ''}`}>Visa på sidan ↗</a><span>{comment.path}</span><span title={comment.viewKey}>{comment.viewKey}</span></div>
            <div className="feedback-admin-comment-actions"><label>Status <select disabled={busyId === comment.id} value={comment.status} onChange={event => void changeStatus(comment, event.target.value as FeedbackStatus)}><option value="open">Öppen</option><option value="reviewed">Granskad</option><option value="done">Klar</option></select></label><button type="button" disabled={busyId === comment.id} onClick={() => void remove(comment)}>Ta bort</button></div>
          </article>)}
        </div>
      </>}
    </div>
  </main>;
}
