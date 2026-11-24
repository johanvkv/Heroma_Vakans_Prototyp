import { type MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { router } from '../routes';
import { createFeedback, listFeedbackSummary, listMyFeedback, localDemo, type FeedbackComment } from './api';
import './feedback.css';

const visitorKey = 'heroma-feedback-visitor-id';
const nameKey = 'heroma-feedback-display-name';

function savedVisitorId() {
  try {
    const existing = localStorage.getItem(visitorKey);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(visitorKey, id);
    return id;
  } catch { return crypto.randomUUID(); }
}

function routeViewKey() {
  const query = new URLSearchParams(window.location.search);
  query.delete('feedbackId');
  query.delete('feedbackView');
  query.delete('feedbackTarget');
  return `${window.location.pathname}${query.size ? `?${query}` : ''}`;
}

function currentViewKey() {
  return document.querySelector('[data-feedback-view-context]')?.getAttribute('data-feedback-view-context') || routeViewKey();
}

function selectorFor(element: Element): string {
  if (element.id === 'root') return '#root';
  if (element === document.body) return 'body';
  const segments: string[] = [];
  let node: Element | null = element;
  while (node && node.id !== 'root') {
    const stable = node.getAttribute('data-feedback-anchor');
    if (stable) {
      segments.unshift(`[data-feedback-anchor="${CSS.escape(stable)}"]`);
      return segments.join(' > ');
    }
    const parent: Element | null = node.parentElement;
    const type = node.tagName.toLowerCase();
    const siblings = parent ? Array.from(parent.children).filter(child => child.tagName === node?.tagName) : [];
    const index = siblings.indexOf(node) + 1;
    segments.unshift(`${type}:nth-of-type(${Math.max(index, 1)})`);
    node = parent;
  }
  return `#root > ${segments.join(' > ')}`;
}

function anchorAt(target: EventTarget | null) {
  const node = target instanceof Element ? target : null;
  const anchor = node?.closest('td, th, button, a, input, textarea, select, [data-feedback-anchor]') ?? node?.closest('#root') ?? document.getElementById('root');
  return anchor instanceof Element ? anchor : null;
}

function anchorRect(selector: string) {
  try { return document.querySelector(selector)?.getBoundingClientRect() ?? null; }
  catch { return null; }
}

interface DraftPoint { anchor: string; x: number; y: number; clientX: number; clientY: number; path: string; viewKey: string; }

export function FeedbackOverlay() {
  const [visitorId] = useState(savedVisitorId);
  const [name, setName] = useState(() => { try { return localStorage.getItem(nameKey) || ''; } catch { return ''; } });
  const [active, setActive] = useState(false);
  const [showMine, setShowMine] = useState(true);
  const [showList, setShowList] = useState(false);
  const [comments, setComments] = useState<FeedbackComment[]>([]);
  const [reviewComment, setReviewComment] = useState<FeedbackComment | null>(null);
  const [draftPoint, setDraftPoint] = useState<DraftPoint | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [openPin, setOpenPin] = useState<string | null>(null);
  const [location, setLocation] = useState(() => window.location.pathname);
  const [viewKey, setViewKey] = useState(currentViewKey);
  const [positionVersion, setPositionVersion] = useState(0);

  useEffect(() => {
    const toggle = () => { setActive(value => !value); setDraftPoint(null); setError(''); };
    window.addEventListener('feedback:toggle', toggle);
    return () => window.removeEventListener('feedback:toggle', toggle);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.feedbackActive = String(active);
    window.dispatchEvent(new CustomEvent('feedback:state', { detail: active }));
  }, [active]);

  useEffect(() => {
    if (location === '/kommentarer/sammanstallning') setActive(false);
  }, [location]);

  useEffect(() => {
    const update = () => { setLocation(window.location.pathname); setViewKey(currentViewKey()); };
    const unsubscribe = router.subscribe(() => requestAnimationFrame(update));
    const observer = new MutationObserver(records => {
      if (records.some(record => !(record.target instanceof Element) || !record.target.closest('.feedback-root'))) {
        update();
        setPositionVersion(value => value + 1);
      }
    });
    observer.observe(document.getElementById('root') ?? document.body, {
      subtree: true, childList: true, attributes: true, attributeFilter: ['data-feedback-view-context'],
    });
    return () => { unsubscribe(); observer.disconnect(); };
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => setPositionVersion(value => value + 1)); };
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', update, true); window.removeEventListener('resize', update); };
  }, []);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    listMyFeedback(visitorId).then(result => { if (!cancelled) setComments(result.comments); })
      .catch(cause => { if (!cancelled) setError(cause instanceof Error ? cause.message : 'Kommentarer kunde inte läsas.'); });
    return () => { cancelled = true; };
  }, [active, visitorId]);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('feedbackId');
    if (!id) return;
    let cancelled = false;
    listFeedbackSummary().then(result => {
      if (cancelled) return;
      const found = result.comments.find(comment => comment.id === id);
      if (found) { setReviewComment(found); setActive(true); setOpenPin(id); }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [location]);

  useEffect(() => {
    if (!reviewComment || reviewComment.path !== location || (reviewComment.viewKey !== viewKey && reviewComment.viewKey !== routeViewKey())) return;
    let attempts = 0;
    const timer = window.setInterval(() => {
      let anchor: Element | null = null;
      try { anchor = document.querySelector(reviewComment.anchor); } catch { /* Invalid old selector. */ }
      if (anchor) {
        anchor.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
        setPositionVersion(value => value + 1);
        clearInterval(timer);
      } else if (++attempts >= 50) clearInterval(timer);
    }, 200);
    return () => clearInterval(timer);
  }, [reviewComment, location, viewKey]);

  const placeDraft = useCallback((event: globalThis.MouseEvent) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target || target.closest('.feedback-ui')) return;
    const anchor = anchorAt(event.target);
    if (!anchor) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    const rect = anchor.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    setDraftPoint({
      anchor: selectorFor(anchor),
      x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
      clientX: event.clientX, clientY: event.clientY,
      path: window.location.pathname,
      viewKey: anchor.closest('[data-feedback-view-context]')?.getAttribute('data-feedback-view-context') || routeViewKey(),
    });
    setMessage('');
    setError('');
    setShowList(false);
  }, []);

  useEffect(() => {
    if (!active || location === '/kommentarer/sammanstallning') return;
    const click = (event: globalThis.MouseEvent) => { if (event.button === 0) placeDraft(event); };
    const context = (event: globalThis.MouseEvent) => placeDraft(event);
    const key = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (draftPoint) setDraftPoint(null);
      else setActive(false);
      event.stopPropagation();
    };
    document.addEventListener('click', click, true);
    document.addEventListener('contextmenu', context, true);
    document.addEventListener('keydown', key, true);
    return () => {
      document.removeEventListener('click', click, true);
      document.removeEventListener('contextmenu', context, true);
      document.removeEventListener('keydown', key, true);
    };
  }, [active, draftPoint, location, placeDraft]);

  const visible = useMemo(() => {
    if (!active || !showMine) return [];
    const all = reviewComment ? [...comments.filter(comment => comment.id !== reviewComment.id), reviewComment] : comments;
    return all.filter(comment => comment.path === location && (comment.viewKey === viewKey || comment.viewKey === routeViewKey()));
  }, [active, showMine, comments, reviewComment, location, viewKey]);

  async function save(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (!draftPoint || saving) return;
    if (!name.trim() || !message.trim()) { setError('Fyll i namn och kommentar.'); return; }
    setSaving(true);
    setError('');
    try {
      const result = await createFeedback({
        visitorId, displayName: name.trim(), text: message.trim(),
        path: draftPoint.path, viewKey: draftPoint.viewKey,
        anchor: draftPoint.anchor, x: draftPoint.x, y: draftPoint.y,
      });
      try { localStorage.setItem(nameKey, name.trim()); } catch { /* Private browsing. */ }
      setComments(current => [result.comment, ...current]);
      setDraftPoint(null);
      setOpenPin(result.comment.id);
      setShowMine(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Kommentaren kunde inte sparas.');
    } finally { setSaving(false); }
  }

  const currentComments = comments.filter(comment => comment.path === location);
  void positionVersion;
  if (location === '/kommentarer/sammanstallning') return null;
  return <div className="feedback-ui feedback-root">
    {active && <div className="feedback-mode-tint" aria-hidden="true" />}
    {visible.map((comment, index) => {
      const rect = anchorRect(comment.anchor);
      if (!rect) return null;
      const left = rect.left + rect.width * comment.x;
      const top = rect.top + rect.height * comment.y;
      if (left < 0 || left > window.innerWidth || top < 0 || top > window.innerHeight) return null;
      return <div key={comment.id} className="feedback-pin-wrap" style={{ left, top }}>
        <button type="button" className="feedback-pin" aria-label={`Kommentar ${index + 1} av ${comment.displayName}`} onClick={() => setOpenPin(openPin === comment.id ? null : comment.id)}>{index + 1}</button>
        {openPin === comment.id && <div className="feedback-pin-card" style={{ left: left > window.innerWidth - 300 ? -282 : 16, top: top > window.innerHeight - 150 ? -160 : 19 }}>
          <strong>{comment.displayName}</strong><time>{new Date(comment.createdAt).toLocaleString('sv-SE')}</time>
          <p>{comment.text}</p>
          <button type="button" onClick={() => setOpenPin(null)}>Stäng</button>
        </div>}
      </div>;
    })}

    {active && <div className="feedback-mode-hint" role="status">
      <strong>Kommentarsläge</strong> · Klicka eller högerklicka där du vill kommentera. Tryck Esc för att avsluta.
    </div>}

    {draftPoint && <div className="feedback-composer" style={{
      left: Math.max(12, Math.min(draftPoint.clientX + 12, window.innerWidth - 372)),
      top: Math.max(12, Math.min(draftPoint.clientY + 12, window.innerHeight - 345)),
    }} role="dialog" aria-modal="false" aria-label="Skriv kommentar">
      <div className="feedback-composer-heading"><strong>Kommentar på denna plats</strong><button type="button" aria-label="Stäng" onClick={() => setDraftPoint(null)}>×</button></div>
      <label>Namn<input autoFocus maxLength={80} value={name} onChange={event => setName(event.target.value)} placeholder="Ditt namn" /></label>
      <label>Kommentar<textarea maxLength={2000} rows={4} value={message} onChange={event => setMessage(event.target.value)} placeholder="Vad tycker du?" /></label>
      <span className="feedback-char-count">{message.length}/2000</span>
      {error && <p className="feedback-error" role="alert">{error}</p>}
      <div className="feedback-composer-actions"><button type="button" onClick={() => setDraftPoint(null)}>Avbryt</button><button type="button" disabled={saving} onClick={save}>{saving ? 'Sparar…' : 'Spara kommentar'}</button></div>
    </div>}

    {active && showList && <aside className="feedback-my-list" aria-label="Mina kommentarer">
      <div className="feedback-composer-heading"><strong>Mina kommentarer ({currentComments.length})</strong><button type="button" aria-label="Stäng listan" onClick={() => setShowList(false)}>×</button></div>
      {currentComments.length === 0 ? <p>Du har inte kommenterat den här sidan ännu.</p> : currentComments.map(comment => <button type="button" key={comment.id} className="feedback-my-item" onClick={() => {
        setOpenPin(comment.id);
        setShowList(false);
        anchorRect(comment.anchor) && document.querySelector(comment.anchor)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }}><strong>{comment.text}</strong><span>{new Date(comment.createdAt).toLocaleDateString('sv-SE')} · {comment.status === 'done' ? 'Klart' : comment.status === 'reviewed' ? 'Granskat' : 'Öppet'}</span></button>)}
    </aside>}

    {active && <div className="feedback-toolbar">
      <button type="button" className={showMine ? 'feedback-tool-active' : ''} onClick={() => setShowMine(value => !value)} title="Visa eller dölj dina markeringar">Markeringar {showMine ? 'på' : 'av'}</button>
      <button type="button" onClick={() => setShowList(value => !value)}>Mina kommentarer <span>{comments.length}</span></button>
      {localDemo && active && <span className="feedback-local-label">Lokal förhandsvisning</span>}
      {error && !draftPoint && <span className="feedback-toolbar-error" role="alert">{error}</span>}
    </div>}
  </div>;
}
