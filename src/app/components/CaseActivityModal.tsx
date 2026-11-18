import React, { useEffect, useMemo, useState } from 'react';

type ActivityType = 'message' | 'status' | 'assignment' | 'system';
type FilterType = 'all' | ActivityType;
export type CaseActivityStatusTone = 'neutral' | 'positive' | 'warning' | 'negative';

export interface CaseActivityResponse {
  id: string;
  name: string;
  role: string;
  response: 'Ja' | 'Nej' | 'Kanske' | 'Inget svar';
  detail?: string;
}

export interface CaseActivity {
  id: number;
  type: ActivityType;
  author: string;
  initials: string;
  time: string;
  text: string;
  detail?: string;
  isCurrentUser?: boolean;
  recipient?: string;
  question?: { prompt: string; options: string[] };
  responseGroup?: { responses: CaseActivityResponse[] };
}

const defaultActivities: CaseActivity[] = [
  { id: 1, type: 'system', author: 'Systemet', initials: 'S', time: 'Idag 08:42', text: 'Ärendet skapades', detail: 'Frånvaroanmälan för Karin Andersson · 14 juni 2025' },
  { id: 2, type: 'status', author: 'Systemet', initials: 'S', time: 'Idag 08:45', text: 'Status ändrades', detail: 'Nytt → Pågår' },
  { id: 3, type: 'message', author: 'Maja Svensson', initials: 'MS', time: 'Idag 09:10', text: 'Jag har stämt av med avdelningen. Vi behöver en vikarie för hela passet 07:00–16:00.' },
  { id: 4, type: 'assignment', author: 'Oskar Lind', initials: 'OL', time: 'Idag 09:26', text: 'Valde vikarie', detail: 'Erik Johansson · 07:00–16:00' },
  { id: 5, type: 'message', author: 'Du', initials: 'JV', time: 'Idag 09:31', text: 'Toppen, jag skickar bekräftelsen till Erik och uppdaterar schemat.', isCurrentUser: true },
  { id: 6, type: 'status', author: 'Systemet', initials: 'S', time: 'Idag 09:33', text: 'Status ändrades', detail: 'Pågår → Löst' },
  { id: 7, type: 'system', author: 'Systemet', initials: 'S', time: 'Idag 09:35', text: 'Åtgärd behövs', detail: 'Bekräfta nästa steg för ärendet', question: { prompt: 'Kan du bekräfta att Erik Johansson kan ta hela passet 07:00–16:00?', options: ['Ja, bekräfta', 'Nej, välj annan vikarie'] } },
];

const filters: { id: FilterType; label: string; icon: string }[] = [
  { id: 'all', label: 'Alla händelser', icon: 'fa-layer-group' },
  { id: 'message', label: 'Meddelanden', icon: 'fa-comment' },
  { id: 'status', label: 'Statusar', icon: 'fa-arrows-rotate' },
  { id: 'assignment', label: 'Tillsättning', icon: 'fa-user-check' },
  { id: 'system', label: 'System', icon: 'fa-gear' },
];

interface CaseActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  contextKey?: string;
  icon?: string;
  kicker?: string;
  title?: string;
  description?: string;
  status?: { label: string; tone?: CaseActivityStatusTone };
  aboveToolbar?: React.ReactNode;
  details?: React.ReactNode;
  actions?: React.ReactNode;
  activities?: CaseActivity[];
  includeDefaultActivities?: boolean;
  onSelectCandidates?: (candidateIds: string[]) => void;
  onPostMessage?: (activity: Omit<CaseActivity, 'id'>) => void;
}

export const CaseActivityModal: React.FC<CaseActivityModalProps> = ({
  isOpen,
  onClose,
  contextKey,
  icon = 'fa-circle-info',
  kicker = 'Ärende 2025-0614',
  title = 'Händelser och kommunikation',
  description = 'All aktivitet i ärendet samlad på ett ställe',
  status,
  aboveToolbar,
  details,
  actions,
  activities = [],
  includeDefaultActivities = true,
  onSelectCandidates,
  onPostMessage,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [message, setMessage] = useState('');
  const [isPersonal, setIsPersonal] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [postedActivities, setPostedActivities] = useState<CaseActivity[]>([]);
  const [questionAnswer, setQuestionAnswer] = useState<string | null>(null);
  const [expandedResponseIds, setExpandedResponseIds] = useState<number[]>([]);
  const [selectedResponseIds, setSelectedResponseIds] = useState<Record<number, string[]>>({});

  useEffect(() => {
    setActiveFilter('all');
    setMessage('');
    setIsPersonal(false);
    setRecipient('');
    setPostedActivities([]);
    setQuestionAnswer(null);
    setExpandedResponseIds([]);
    setSelectedResponseIds({});
  }, [contextKey]);

  const visibleActivities = useMemo(
    () => [...(includeDefaultActivities ? defaultActivities : []), ...activities, ...postedActivities]
      .filter(activity => activeFilter === 'all' || activity.type === activeFilter),
    [activeFilter, activities, includeDefaultActivities, postedActivities],
  );

  if (!isOpen) return null;

  const postMessage = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;
    const activity: Omit<CaseActivity, 'id'> = {
      type: 'message',
      author: 'Du',
      initials: 'JV',
      time: 'Just nu',
      text: trimmedMessage,
      isCurrentUser: true,
      recipient: isPersonal ? recipient : undefined,
    };
    if (onPostMessage) onPostMessage(activity);
    else setPostedActivities(current => [...current, { ...activity, id: Date.now() }]);
    setMessage('');
    setIsPersonal(false);
    setRecipient('');
  };

  return (
    <div className="case-activity-overlay" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <section className={`case-activity-modal${details ? ' case-activity-modal-details' : ''}`} role="dialog" aria-modal="true" aria-labelledby="case-activity-title">
        <header className="case-activity-header">
          <div className="case-activity-heading-copy">
            <div className="case-activity-kicker"><i className={`fa-solid ${icon}`} aria-hidden="true" /> {kicker}</div>
            <div className="case-activity-title-row">
              <h2 id="case-activity-title">{title}</h2>
              {status && <span className={`case-activity-status case-activity-status-${status.tone ?? 'neutral'}`}>{status.label}</span>}
            </div>
            <p>{description}</p>
          </div>
          <button className="case-activity-close" onClick={onClose} aria-label="Stäng dialogen"><i className="fa-solid fa-xmark" /></button>
        </header>

        {aboveToolbar && <div className="case-activity-above-toolbar">{aboveToolbar}</div>}

        <div className="case-activity-toolbar">
          <span className="case-activity-filter-label">Visa</span>
          <div className="case-activity-filters" role="tablist" aria-label="Filtrera händelser">
            {filters.map(filter => (
              <button
                key={filter.id}
                type="button"
                className={`case-activity-filter ${activeFilter === filter.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter.id)}
                role="tab"
                aria-selected={activeFilter === filter.id}
              >
                <i className={`fa-solid ${filter.icon}`} /> {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className={`case-activity-order-layout${details ? '' : ' case-activity-order-layout-empty'}`}>
          {details && <aside className="case-activity-order-details">{details}</aside>}
          <div className="case-activity-content">
            <div className="case-activity-stream">
              <div className="case-activity-date">Idag</div>
              {visibleActivities.map(activity => {
                const responseGroup = activity.responseGroup;
                const isExpanded = expandedResponseIds.includes(activity.id);
                const selectedIds = selectedResponseIds[activity.id] ?? [];
                const isSystemActivity = activity.author === 'Systemet' || activity.type === 'system';
                const itemClass = [
                  'case-activity-item',
                  activity.type,
                  activity.isCurrentUser ? 'current-user' : '',
                  isSystemActivity ? 'system-origin' : '',
                ].filter(Boolean).join(' ');

                return (
                  <article key={activity.id} className={itemClass}>
                    {activity.type === 'message'
                      ? <div className="case-activity-avatar">{activity.initials}</div>
                      : <div className="case-activity-event-icon"><i className={`fa-solid ${activity.type === 'status' ? 'fa-arrows-rotate' : activity.type === 'assignment' ? 'fa-user-check' : 'fa-gear'}`} /></div>}
                    <div className="case-activity-entry">
                      <div className="case-activity-meta">
                        <strong>{activity.author}</strong>
                        <span>{activity.time}</span>
                        {activity.recipient && <em><i className="fa-solid fa-lock" /> Endast {activity.recipient}</em>}
                      </div>
                      <div className="case-activity-bubble">
                        {activity.text}
                        {activity.detail && <div className="case-activity-detail">{activity.detail}</div>}
                        {activity.question && <div className="case-activity-question">
                          <strong>{activity.question.prompt}</strong>
                          {questionAnswer
                            ? <div className="case-activity-answer"><i className="fa-solid fa-circle-check" /> Frågan besvarad</div>
                            : <div className="case-activity-question-actions">
                                {activity.question.options.map(option => (
                                  <button key={option} type="button" onClick={() => {
                                    setQuestionAnswer(option);
                                    setPostedActivities(current => [...current, { id: Date.now(), type: 'message', author: 'Du', initials: 'JV', time: 'Just nu', text: option, isCurrentUser: true }]);
                                  }}>{option}</button>
                                ))}
                              </div>}
                        </div>}
                        {responseGroup && <div className="case-activity-response-group">
                          <div className="case-activity-response-summary">
                            <span><b>{responseGroup.responses.filter(response => response.response === 'Ja').length}</b> ja</span>
                            <span><b>{responseGroup.responses.filter(response => response.response === 'Nej').length}</b> nej</span>
                            <span><b>{responseGroup.responses.filter(response => response.response === 'Kanske').length}</b> kanske</span>
                            <span><b>{responseGroup.responses.filter(response => response.response === 'Inget svar').length}</b> inget svar</span>
                          </div>
                          <button type="button" className="case-activity-expand-btn" onClick={() => setExpandedResponseIds(current => isExpanded ? current.filter(id => id !== activity.id) : [...current, activity.id])}>
                            <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'}`} /> {isExpanded ? 'Dölj svar' : `Visa svar och välj vikarier (${responseGroup.responses.length})`}
                          </button>
                          {isExpanded && <div className="case-activity-response-list">
                            {responseGroup.responses.map(response => (
                              <label key={response.id} className="case-activity-response-row">
                                <input type="checkbox" checked={selectedIds.includes(response.id)} disabled={response.response === 'Nej'} onChange={() => setSelectedResponseIds(current => ({ ...current, [activity.id]: selectedIds.includes(response.id) ? selectedIds.filter(id => id !== response.id) : [...selectedIds, response.id] }))} />
                                <span><strong>{response.name}</strong><small>{response.role} · {response.response}{response.detail ? ` · ${response.detail}` : ''}</small></span>
                              </label>
                            ))}
                            <button type="button" className="btn-primary case-activity-select-btn" disabled={!selectedIds.length || !onSelectCandidates} onClick={() => onSelectCandidates?.(selectedIds)}>
                              <i className="fa-solid fa-user-check" /> Välj valda vikarier
                            </button>
                          </div>}
                        </div>}
                      </div>
                    </div>
                  </article>
                );
              })}
              {visibleActivities.length === 0 && <div className="case-activity-empty">Inga händelser av den här typen ännu.</div>}
            </div>

            <form className="case-activity-composer" onSubmit={event => { event.preventDefault(); postMessage(); }}>
              <div className="case-activity-composer-heading"><strong>Nytt meddelande</strong><span>Skriv till alla som följer ärendet</span></div>
              {isPersonal && <div className="case-activity-recipient-row">
                <i className="fa-solid fa-lock" />
                <select value={recipient} onChange={event => setRecipient(event.target.value)} aria-label="Välj mottagare">
                  <option value="">Välj mottagare</option>
                  <option value="Maja Svensson">Maja Svensson</option>
                  <option value="Oskar Lind">Oskar Lind</option>
                </select>
                <button type="button" onClick={() => setIsPersonal(false)}>Ta bort</button>
              </div>}
              <textarea value={message} onChange={event => setMessage(event.target.value)} placeholder="Skriv ett meddelande…" rows={2} />
              <div className="case-activity-composer-actions">
                <label className={`case-activity-personal-toggle ${isPersonal ? 'checked' : ''}`}>
                  <input type="checkbox" checked={isPersonal} onChange={event => setIsPersonal(event.target.checked)} />
                  <i className="fa-solid fa-lock" /> Personligt meddelande
                </label>
                <button className="case-activity-send" type="submit" disabled={!message.trim() || (isPersonal && !recipient)}><i className="fa-solid fa-paper-plane" /> Skicka</button>
              </div>
            </form>
          </div>
        </div>

        {actions && <footer className="case-activity-actions">{actions}</footer>}
      </section>
    </div>
  );
};
