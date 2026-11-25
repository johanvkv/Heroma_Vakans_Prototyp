import type { FeedbackComment } from './api';

export const dialogNames: Record<string, string> = {
  'employee-detail': 'Medarbetardetaljer',
  'pass-detail': 'Passdetaljer',
  'candidate-detail': 'Kandidatdetaljer',
  'resource-need-detail': 'Resursbehovsdetaljer',
  'order-detail': 'Beställningsdetaljer',
  'candidate-match': 'Kandidatmatchning',
  'confirm-assignment': 'Bekräfta tillsättning',
  'open-request': 'Skicka förfrågan',
  'resource-order': 'Beställ resurs',
  'choose-substitute': 'Välj vikarie',
  'create-absence': 'Skapa frånvaro',
  'organisation-settings': 'Organisationsinställningar',
  'mega-menu-overlay': 'Huvudmeny',
  'accessibility-panel': 'Tillgänglighetsinställningar',
  'user-profile-panel': 'Profil',
  'header-activity': 'Händelser och kommunikation',
};

export function feedbackContext(comment: FeedbackComment) {
  if (comment.viewKey.startsWith('dialog:')) {
    const type = comment.viewKey.slice(7);
    return { group: `dialog:${type}`, title: dialogNames[type] ?? 'Dialog', detail: 'Gäller alla dialoger av denna typ' };
  }
  const match = comment.viewKey.match(/^(schema|orders|resource-needs):([^:]+):(\d{4}-\d{2}-\d{2})$/);
  if (match) {
    const view = { schema: 'Schema', orders: 'Beställningar', 'resource-needs': 'Resursbehov' }[match[1]];
    return { group: `${match[1]}:${match[2]}:${match[3]}`, title: view ?? 'Vy', detail: `${match[2]} · från ${match[3]}` };
  }
  if (comment.anchor.includes('candidate-panel')) return { group: 'candidate-panel', title: 'Kandidatpanelen', detail: 'Kandidater' };
  return { group: `page:${comment.path}`, title: comment.path.includes('installningar') ? 'Inställningar' : 'Sida', detail: comment.path };
}

export function feedbackLink(comment: FeedbackComment) {
  const safePath = comment.path.startsWith('/') && !comment.path.startsWith('//') ? comment.path : '/vikariehantering/schema';
  const query = new URLSearchParams();
  query.set('feedbackId', comment.id);
  if (comment.viewKey.startsWith('dialog:')) query.set('feedbackDialog', comment.viewKey.slice(7));
  else if (/^(schema|orders|resource-needs):/.test(comment.viewKey)) query.set('feedbackView', comment.viewKey);
  if (comment.anchor.includes('candidate-panel')) query.set('feedbackTarget', 'candidate');
  return `${safePath}?${query}`;
}

const autoOpenDialogs = new Set([
  'employee-detail', 'pass-detail', 'candidate-detail', 'resource-need-detail', 'order-detail',
  'mega-menu-overlay', 'accessibility-panel', 'user-profile-panel', 'header-activity',
]);

export function feedbackOpensInPlace(comment: FeedbackComment) {
  return !comment.viewKey.startsWith('dialog:') || autoOpenDialogs.has(comment.viewKey.slice(7));
}
