import { type CSSProperties, type MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { router } from '../routes';
import { createFeedback, deleteFeedbackComment, feedbackVisitorKey, listAllFeedback, type FeedbackComment } from './api';
import { captureFeedbackScreenshot } from './screenshot';
import './feedback.css';

const visitorKey = 'heroma-feedback-visitor-id';

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
  query.delete('feedbackDialog');
  return `${window.location.pathname}${query.size ? `?${query}` : ''}`;
}

function currentViewKey() {
  const dialog = activeDialog();
  if (dialog) return `dialog:${dialog.type}`;
  return document.querySelector('[data-feedback-view-context]')?.getAttribute('data-feedback-view-context') || routeViewKey();
}

interface FeedbackDialog { element: Element; surface: Element; type: string }

function visibleDialog(element: Element) {
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 && !element.closest('[aria-hidden="true"]')
    && getComputedStyle(element).visibility !== 'hidden';
}

function feedbackDialog(element: Element): FeedbackDialog | null {
  if (element.closest('.feedback-root') || !visibleDialog(element)) return null;
  if (element.matches('.dx-overlay-wrapper') && !element.querySelector('.dx-popup-content')) return null;
  const type = element.getAttribute('data-feedback-dialog-type')
    || Array.from(element.classList).find(name => !name.startsWith('dx-') && name !== 'open')
    || element.getAttribute('aria-label')?.trim();
  if (!type) return null;
  const surface = element.matches('.dx-overlay-wrapper')
    ? element.querySelector('.dx-overlay-content') ?? element
    : element;
  return { element, surface, type: type.slice(0, 100) };
}

function openDialogs() {
  return Array.from(document.querySelectorAll('.dx-overlay-wrapper, [role="dialog"]'))
    .filter(element => !element.matches('[role="dialog"]') || !element.closest('.dx-overlay-wrapper'))
    .map(feedbackDialog)
    .filter((dialog): dialog is FeedbackDialog => dialog !== null);
}

function activeDialog() {
  const dialogs = openDialogs();
  return dialogs[dialogs.length - 1] ?? null;
}

function dialogForTarget(target: Element) {
  const element = target.closest('.dx-overlay-wrapper') ?? target.closest('[role="dialog"]');
  const dialog = element ? feedbackDialog(element) : null;
  return dialog?.surface.contains(target) ? dialog : null;
}

function tagOpenDialogs() {
  openDialogs().forEach(({ surface, type }) => {
    surface.setAttribute('data-feedback-anchor', `dialog:${type}`);
  });
}

function commentMatchesView(comment: FeedbackComment, path: string, viewKey: string) {
  if (viewKey.startsWith('dialog:')) return comment.viewKey === viewKey;
  return comment.path === path && (comment.viewKey === viewKey || comment.viewKey === routeViewKey());
}

function selectorFor(element: Element): string {
  if (element.id === 'root') return '#root';
  if (element === document.body) return 'body';
  const segments: string[] = [];
  let node: Element | null = element;
  while (node && node !== document.body && node.id !== 'root') {
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
  const base = node?.id === 'root' ? '#root' : 'body';
  return segments.length ? `${base} > ${segments.join(' > ')}` : base;
}

function anchorAt(target: EventTarget | null) {
  const node = target instanceof Element ? target : null;
  const anchor = node?.closest('[data-feedback-anchor], td, th, button, a, input, textarea, select') ?? node;
  return anchor instanceof Element ? anchor : null;
}

function anchorElement(selector: string) {
  try { return Array.from(document.querySelectorAll(selector)).find(element => {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }) ?? null; }
  catch { return null; }
}

function anchorRect(selector: string) { return anchorElement(selector)?.getBoundingClientRect() ?? null; }

interface DraftPoint { anchor: string; x: number; y: number; clientX: number; clientY: number; path: string; viewKey: string; }

export function FeedbackOverlay() {
  const [visitorId] = useState(savedVisitorId);
  const [active, setActive] = useState(false);
  const [comments, setComments] = useState<FeedbackComment[]>([]);
  const [reviewComment, setReviewComment] = useState<FeedbackComment | null>(null);
  const [draftPoint, setDraftPoint] = useState<DraftPoint | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [visitorOwnershipKey, setVisitorOwnershipKey] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [openPin, setOpenPin] = useState<string | null>(null);
  const [location, setLocation] = useState(() => window.location.pathname);
  const [viewKey, setViewKey] = useState(currentViewKey);
  const [positionVersion, setPositionVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    feedbackVisitorKey(visitorId).then(key => {
      if (!cancelled) setVisitorOwnershipKey(key);
    });
    return () => { cancelled = true; };
  }, [visitorId]);

  useEffect(() => {
    const update = () => { tagOpenDialogs(); setLocation(window.location.pathname); setViewKey(currentViewKey()); };
    const unsubscribe = router.subscribe(() => requestAnimationFrame(update));
    const observer = new MutationObserver(records => {
      if (records.some(record => !(record.target instanceof Element) || !record.target.closest('.feedback-root'))) {
        update();
        setPositionVersion(value => value + 1);
      }
    });
    observer.observe(document.body, {
      subtree: true, childList: true, attributes: true, attributeFilter: ['data-feedback-view-context'],
    });
    return () => { unsubscribe(); observer.disconnect(); };
  }, []);

  useEffect(() => {
    if (!active) return;
    tagOpenDialogs();
    setPositionVersion(value => value + 1);
  }, [active]);

  useEffect(() => {
    try { localStorage.removeItem('heroma-feedback-display-name'); } catch { /* Private browsing. */ }
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => setPositionVersion(value => value + 1)); };
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', update, true); window.removeEventListener('resize', update); };
  }, []);

  const refreshComments = useCallback(async () => {
    setError('');
    try {
      const result = await listAllFeedback();
      setComments(current => {
        const byId = new Map(result.comments.map(comment => [comment.id, comment]));
        current.forEach(comment => { if (!byId.has(comment.id)) byId.set(comment.id, comment); });
        return [...byId.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Kommentarer kunde inte läsas.');
    }
  }, []);

  useEffect(() => {
    if (active) void refreshComments();
  }, [active, refreshComments]);

  useEffect(() => {
    if (location === '/kommentarer/sammanstallning') {
      setActive(false);
      setDraftPoint(null);
    }
  }, [location]);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('feedbackId');
    if (!id) return;
    let cancelled = false;
    listAllFeedback().then(result => {
      if (cancelled) return;
      const found = result.comments.find(comment => comment.id === id);
      if (found) { setReviewComment(found); setActive(true); setOpenPin(id); }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [location]);

  useEffect(() => {
    if (!reviewComment || !commentMatchesView(reviewComment, location, viewKey)) return;
    let attempts = 0;
    const timer = window.setInterval(() => {
      let anchor: Element | null = null;
      anchor = anchorElement(reviewComment.anchor);
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
    // Keep application actions reachable in comment mode. A regular click can still place feedback on these rows.
    if (event.type === 'contextmenu' && target.closest('[data-native-context-menu="true"]')) return;
    if (event.type === 'click' && target.closest('.schema-sub-context-menu, .dx-context-menu, .schema-resource-context-menu')) return;
    tagOpenDialogs();
    const dialog = dialogForTarget(target);
    if (!dialog && target.closest('.case-activity-overlay, .dx-overlay-wrapper')) return;
    const anchor = dialog?.surface ?? anchorAt(event.target);
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
      viewKey: dialog ? `dialog:${dialog.type}` : anchor.closest('[data-feedback-view-context]')?.getAttribute('data-feedback-view-context') || routeViewKey(),
    });
    setMessage('');
    setError('');
  }, []);

  useEffect(() => {
    if (!active) return;
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
    if (!active) return [];
    const all = reviewComment ? [...comments.filter(comment => comment.id !== reviewComment.id), reviewComment] : comments;
    return all.filter(comment => commentMatchesView(comment, location, viewKey));
  }, [active, comments, reviewComment, location, viewKey]);

  async function save(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (!draftPoint || saving) return;
    if (!message.trim()) { setError('Skriv en kommentar.'); return; }
    setSaving(true);
    setError('');
    try {
      // A failed capture must never prevent the comment itself from being saved.
      const screenshot = await captureFeedbackScreenshot(draftPoint.clientX, draftPoint.clientY).catch(() => undefined);
      const result = await createFeedback({
        visitorId, text: message.trim(),
        path: draftPoint.path, viewKey: draftPoint.viewKey,
        anchor: draftPoint.anchor, x: draftPoint.x, y: draftPoint.y,
        screenshot,
      });
      setComments(current => [result.comment, ...current]);
      setDraftPoint(null);
      setOpenPin(result.comment.id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Kommentaren kunde inte sparas.');
    } finally { setSaving(false); }
  }

  const isOwnComment = (comment: FeedbackComment) => comment.visitorId === visitorId
    || Boolean(visitorOwnershipKey && comment.visitorId === visitorOwnershipKey);

  async function removeComment(comment: FeedbackComment) {
    if (!isOwnComment(comment) || deletingCommentId) return;
    if (!window.confirm('Ta bort din kommentar och eventuell skärmbild? Åtgärden går inte att ångra.')) return;
    setDeletingCommentId(comment.id);
    setDeleteError('');
    try {
      await deleteFeedbackComment(comment.id, visitorId);
      setComments(current => current.filter(item => item.id !== comment.id));
      setReviewComment(current => current?.id === comment.id ? null : current);
      setOpenPin(current => current === comment.id ? null : current);
    } catch (cause) {
      setDeleteError(cause instanceof Error ? cause.message : 'Kommentaren kunde inte tas bort.');
    } finally {
      setDeletingCommentId(null);
    }
  }

  const currentCommentCount = comments.filter(comment => commentMatchesView(comment, location, viewKey)).length;
  void positionVersion;
  const modalOpen = Boolean(activeDialog());
  const searchRect = document.querySelector('.person-search-container')?.getBoundingClientRect();
  const headerButtonStyle: CSSProperties = modalOpen
    ? { right: 16, top: 8 }
    : searchRect && searchRect.width > 0 && searchRect.left > 180
    ? { left: searchRect.left - 8, top: searchRect.top + searchRect.height / 2, transform: 'translate(-100%, -50%)' }
    : { right: 16, top: searchRect && searchRect.width > 0 ? Math.max(8, searchRect.top - 44) : 84 };
  const selectMode = (nextActive: boolean) => {
    if (nextActive === active) return;
    setActive(nextActive);
    setDraftPoint(null);
    setOpenPin(null);
    setError('');
  };
  return createPortal(<div className="feedback-ui feedback-root">
    <div className={`feedback-mode-switch${modalOpen ? ' is-over-modal' : ''}`} style={headerButtonStyle} role="group" aria-label="Välj kommentarläge">
      <button type="button" className="feedback-mode-option" aria-pressed={!active} onClick={() => selectMode(false)} title="Växla till vanligt läge">
        <i className="fa-solid fa-arrow-pointer" aria-hidden="true" />
        <span>Vanligt läge</span>
      </button>
      <button type="button" className="feedback-mode-option feedback-mode-option-comment" aria-pressed={active} onClick={() => selectMode(true)} title={active ? 'Klicka för att kommentera. Högerklick på objekt med meny visar åtgärder.' : 'Växla till kommentarsläge'}>
        <i className="fa-regular fa-comment" aria-hidden="true" />
        <span>Kommentarsläge</span>
        {currentCommentCount > 0 && <span className="feedback-header-count">{currentCommentCount}</span>}
      </button>
    </div>
    {active && <div className="feedback-mode-tint" aria-hidden="true" />}
    {visible.map((comment, index) => {
      const rect = anchorRect(comment.anchor);
      if (!rect) return null;
      const left = rect.left + rect.width * comment.x;
      const top = rect.top + rect.height * comment.y;
      if (left < 0 || left > window.innerWidth || top < 0 || top > window.innerHeight) return null;
      return <div key={comment.id} className="feedback-pin-wrap" style={{ left, top }}>
        <button type="button" className="feedback-pin" aria-label={`Kommentar ${index + 1}`} onClick={() => { setDeleteError(''); setOpenPin(openPin === comment.id ? null : comment.id); }}>{index + 1}</button>
        {openPin === comment.id && <div className="feedback-pin-card" style={{ left: left > window.innerWidth - 300 ? -282 : 16, top: top > window.innerHeight - 190 ? -200 : 19 }}>
          <strong>Kommentar</strong><time>{new Date(comment.createdAt).toLocaleString('sv-SE')}</time>
          <p>{comment.text}</p>
          {deleteError && <p className="feedback-pin-card-error" role="alert">{deleteError}</p>}
          <div className="feedback-pin-card-actions">
            {isOwnComment(comment) && <button type="button" className="feedback-pin-delete" disabled={deletingCommentId !== null} onClick={() => void removeComment(comment)}>
              {deletingCommentId === comment.id ? 'Tar bort…' : 'Ta bort'}
            </button>}
            <button type="button" className="feedback-pin-close" onClick={() => setOpenPin(null)}>Stäng</button>
          </div>
        </div>}
      </div>;
    })}

    {draftPoint && <div className="feedback-composer" style={{
      left: Math.max(12, Math.min(draftPoint.clientX + 12, window.innerWidth - 372)),
      top: Math.max(12, Math.min(draftPoint.clientY + 12, window.innerHeight - 280)),
    }} role="dialog" aria-modal="false" aria-label="Skriv kommentar">
      <div className="feedback-composer-heading"><strong>Kommentar på denna plats</strong><button type="button" aria-label="Stäng" onClick={() => setDraftPoint(null)}>×</button></div>
      <label>Kommentar<textarea autoFocus maxLength={2000} rows={4} value={message} onChange={event => setMessage(event.target.value)} placeholder="Vad tycker du?" /></label>
      <span className="feedback-char-count">{message.length}/2000</span>
      {error && <p className="feedback-error" role="alert">{error}</p>}
      <div className="feedback-composer-actions"><button type="button" onClick={() => setDraftPoint(null)}>Avbryt</button><button type="button" disabled={saving} onClick={save}>{saving ? 'Sparar…' : 'Spara kommentar'}</button></div>
    </div>}

    {active && error && !draftPoint && <p className="feedback-load-error" role="alert">{error}</p>}
  </div>, document.body);
}
