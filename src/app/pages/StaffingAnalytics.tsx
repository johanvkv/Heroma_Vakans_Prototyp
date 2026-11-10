import React, { useMemo, useState } from 'react';
import { PageLayout } from '../components/ui-kit';
import { useRole } from '../components/RoleContext';
import {
  createSimulatedStaffingHistory,
  PRESCHOOL_SUBSTITUTE_PROFILES,
  SUBSTITUTE_ROSTER,
  type CompletedStaffingRecord,
  type SubstituteRosterMember,
} from '../../data/substituteRoster';
import '../../styles/staffing-analytics.css';

type AnalyticsTab = 'overview' | 'filling' | 'cost' | 'activity' | 'actions';
type Period = 30 | 90 | 365;

const TABS: Array<{ id: AnalyticsTab; label: string; icon: string }> = [
  { id: 'overview', label: 'Nuläge', icon: 'fa-chart-pie' },
  { id: 'filling', label: 'Tillsättning', icon: 'fa-arrow-trend-up' },
  { id: 'cost', label: 'Kostnader', icon: 'fa-coins' },
  { id: 'activity', label: 'Vikarieaktivitet', icon: 'fa-user-clock' },
  { id: 'actions', label: 'Åtgärdsförslag', icon: 'fa-lightbulb' },
];

const HISTORY = createSimulatedStaffingHistory();
const DAY_MS = 24 * 60 * 60 * 1000;

function formatNumber(value: number): string {
  return new Intl.NumberFormat('sv-SE').format(Math.round(value));
}

function formatCurrency(value: number): string {
  return `${formatNumber(value)} kr`;
}

function formatDate(date: string | null): string {
  if (!date) return 'Ingen historik';
  return new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${date}T12:00:00`));
}

function profileFor(member: SubstituteRosterMember, isSchool: boolean): SubstituteRosterMember {
  return isSchool && PRESCHOOL_SUBSTITUTE_PROFILES[member.id]
    ? { ...member, ...PRESCHOOL_SUBSTITUTE_PROFILES[member.id] }
    : member;
}

function recordsInPeriod(records: CompletedStaffingRecord[], period: Period): CompletedStaffingRecord[] {
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setTime(cutoff.getTime() - period * DAY_MS);
  const cutoffDate = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}-${String(cutoff.getDate()).padStart(2, '0')}`;
  return records.filter(record => record.date >= cutoffDate);
}

function groupByMonth(records: CompletedStaffingRecord[]) {
  const values = new Map<string, number>();
  records.forEach(record => {
    const key = record.date.slice(0, 7);
    values.set(key, (values.get(key) ?? 0) + 1);
  });
  const monthNames = new Intl.DateTimeFormat('sv-SE', { month: 'short' });
  return [...values.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, count]) => ({
    label: monthNames.format(new Date(`${key}-15T12:00:00`)).replace('.', ''),
    count,
  }));
}

function getLatestActivity(records: CompletedStaffingRecord[]): Map<string, string> {
  const latest = new Map<string, string>();
  records.forEach(record => {
    if (!latest.has(record.substituteId) || record.date > latest.get(record.substituteId)!) {
      latest.set(record.substituteId, record.date);
    }
  });
  return latest;
}

function StatCard({ label, value, detail, icon, tone = 'purple' }: { label: string; value: string; detail: string; icon: string; tone?: string }) {
  return (
    <article className={`staff-stat-card staff-stat-${tone}`}>
      <div className="staff-stat-icon"><i className={`fa-solid ${icon}`} aria-hidden="true" /></div>
      <div className="staff-stat-label">{label}</div>
      <div className="staff-stat-value">{value}</div>
      <div className="staff-stat-detail">{detail}</div>
    </article>
  );
}

function SectionTitle({ title, detail }: { title: string; detail?: string }) {
  return <div className="staff-section-title"><div><h2>{title}</h2>{detail && <p>{detail}</p>}</div></div>;
}

export const StaffingAnalytics = () => {
  const { selectedOrganisation } = useRole();
  const isSchool = selectedOrganisation !== 'clinic';
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');
  const [period, setPeriod] = useState<Period>(90);
  const [categoryFilter, setCategoryFilter] = useState('Alla kategorier');

  const candidates = useMemo(() => SUBSTITUTE_ROSTER.map(member => profileFor(member, isSchool)), [isSchool]);
  const filteredRecords = useMemo(() => recordsInPeriod(HISTORY, period), [period]);
  const periodRecords = useMemo(() => categoryFilter === 'Alla kategorier'
    ? filteredRecords
    : filteredRecords.filter(record => candidates.find(candidate => candidate.id === record.substituteId)?.category === categoryFilter),
  [filteredRecords, candidates, categoryFilter]);
  const rosterHistory = useMemo(() => {
    const latest = getLatestActivity(HISTORY);
    const totals = new Map<string, number>();
    HISTORY.forEach(record => totals.set(record.substituteId, (totals.get(record.substituteId) ?? 0) + 1));
    return candidates
      .map(candidate => ({
        candidate,
        count: totals.get(candidate.id) ?? 0,
        latest: latest.get(candidate.id) ?? null,
      }))
      .sort((a, b) => (a.latest ?? '').localeCompare(b.latest ?? '') || a.candidate.name.localeCompare(b.candidate.name, 'sv'));
  }, [candidates]);
  const categoryOptions = useMemo(() => ['Alla kategorier', ...new Set(candidates.map(candidate => candidate.category))], [candidates]);

  const totalPlacements = periodRecords.length;
  const totalHours = periodRecords.reduce((sum, record) => sum + record.hours, 0);
  const totalCost = periodRecords.reduce((sum, record) => sum + record.simulatedCost, 0);
  const averageResponse = totalPlacements
    ? periodRecords.reduce((sum, record) => sum + record.responseMinutes, 0) / totalPlacements
    : 0;
  const poolRecords = periodRecords.filter(record => candidates.find(candidate => candidate.id === record.substituteId)?.category === 'Poolpersonal');
  const externalRecords = periodRecords.filter(record => candidates.find(candidate => candidate.id === record.substituteId)?.category !== 'Samverkanspass');
  const estimatedUnfilled = totalPlacements
    ? Math.max(1, Math.round(totalPlacements * 0.035 + periodRecords.filter(record => record.responseMinutes > 135).length * 0.22))
    : 0;
  const estimatedRequests = totalPlacements + estimatedUnfilled;
  const fillRate = estimatedRequests ? (totalPlacements / estimatedRequests) * 100 : 0;
  const monthlyTrend = groupByMonth(periodRecords);
  const trendMax = Math.max(1, ...monthlyTrend.map(item => item.count));
  const categoryBreakdown = categoryOptions.slice(1).map(category => {
    const records = periodRecords.filter(record => candidates.find(candidate => candidate.id === record.substituteId)?.category === category);
    return { category, count: records.length, cost: records.reduce((sum, record) => sum + record.simulatedCost, 0) };
  }).sort((a, b) => b.count - a.count);
  const inactiveCandidates = rosterHistory.filter(item => !item.latest || (Date.now() - new Date(`${item.latest}T12:00:00`).getTime()) / DAY_MS > 120);
  const poolCostAvoided = periodRecords
    .filter(record => candidates.find(candidate => candidate.id === record.substituteId)?.category === 'Poolpersonal')
    .reduce((sum, record) => sum + ((record.hours / 8) * 2200) - record.simulatedCost, 0);

  const activityTable = (limit = Number.POSITIVE_INFINITY) => rosterHistory
    .filter(({ candidate }) => categoryFilter === 'Alla kategorier' || candidate.category === categoryFilter)
    .slice(0, limit)
    .map(({ candidate, count, latest }) => {
      const days = latest ? (Date.now() - new Date(`${latest}T12:00:00`).getTime()) / DAY_MS : null;
      const status = days === null ? 'Ingen historik' : days > 120 ? 'Följ upp' : 'Aktiv';
      return (
        <tr key={candidate.id}>
          <td><strong>{candidate.name}</strong><small>{candidate.role}</small></td>
          <td><span className="staff-category-pill">{candidate.category}</span></td>
          <td>{formatNumber(count)}</td>
          <td>{formatDate(latest)}</td>
          <td><span className={`staff-status-pill ${status === 'Aktiv' ? 'is-active' : status === 'Följ upp' ? 'is-review' : 'is-empty'}`}>{status}</span></td>
        </tr>
      );
    });

  return (
    <PageLayout
      title="Bemanningsstatistik"
      breadcrumbItems={[{ label: 'Heroma', href: '/' }, { label: 'Vikariehantering' }, { label: 'Statistik', isActive: true }]}
    >
      <div className="col-12">
        <div className="staff-analytics">
          <header className="staff-analytics-heading">
            <div>
              <div className="staff-eyebrow"><i className="fa-solid fa-chart-line" /> Genomförd bemanning</div>
              <h1>Bemanning som går att följa upp</h1>
              <p>Se vad som har genomförts, hur resurserna används och var det finns läge att agera.</p>
            </div>
            <div className="staff-history-note"><i className="fa-solid fa-circle-info" /> Demovy med simulerad historik och kostnader</div>
          </header>

          <div className="staff-analytics-toolbar">
            <div className="staff-analytics-tabs" role="tablist" aria-label="Statistikens undervyer">
              {TABS.map(tab => (
                <button key={tab.id} role="tab" aria-selected={activeTab === tab.id} className={activeTab === tab.id ? 'is-active' : ''} onClick={() => setActiveTab(tab.id)}>
                  <i className={`fa-solid ${tab.icon}`} aria-hidden="true" /> {tab.label}
                </button>
              ))}
            </div>
            <div className="staff-filters">
              <label htmlFor="staff-period">Tidsperiod</label>
              <select id="staff-period" value={period} onChange={event => setPeriod(Number(event.target.value) as Period)}>
                <option value={30}>Senaste 30 dagarna</option>
                <option value={90}>Senaste 90 dagarna</option>
                <option value={365}>Senaste 12 månaderna</option>
              </select>
              <label htmlFor="staff-category">Kategori</label>
              <select id="staff-category" value={categoryFilter} onChange={event => setCategoryFilter(event.target.value)}>
                {categoryOptions.map(category => <option key={category}>{category}</option>)}
              </select>
            </div>
          </div>

          {activeTab === 'overview' && <>
            <section className="staff-stat-grid" aria-label="Nyckeltal för perioden">
              <StatCard label="Genomförda tillsättningar" value={formatNumber(totalPlacements)} detail={`${formatNumber(totalHours)} bemannade timmar`} icon="fa-calendar-check" tone="purple" />
              <StatCard label="Tillsättningsgrad" value={`${Math.round(fillRate)} %`} detail="Beräknad andel tillsatta behov i demohistoriken" icon="fa-circle-check" tone="green" />
              <StatCard label="Svarstid i snitt" value={`${Math.round(averageResponse)} min`} detail="Från förfrågan till svar" icon="fa-stopwatch" tone="blue" />
              <StatCard label="Simulerad kostnad" value={formatCurrency(totalCost)} detail="För genomförda tillsättningar i perioden" icon="fa-coins" tone="orange" />
            </section>
            <div className="staff-overview-grid">
              <section className="staff-panel staff-trend-panel">
                <SectionTitle title="Genomförda tillsättningar" detail="Utveckling månad för månad" />
                {monthlyTrend.length ? <div className="staff-trend-chart" role="img" aria-label="Stapeldiagram över genomförda tillsättningar per månad">
                  {monthlyTrend.map(item => <div className="staff-trend-column" key={item.label}>
                    <span>{item.count}</span><div className="staff-trend-bar-wrap"><div className="staff-trend-bar" style={{ height: `${Math.max(5, item.count / trendMax * 100)}%` }} /></div><small>{item.label}</small>
                  </div>)}
                </div> : <div className="staff-empty-state">Ingen genomförd bemanning i vald period.</div>}
                <div className="staff-panel-footnote">Visar registrerade, genomförda tillsättningar i vald period.</div>
              </section>
              <section className="staff-panel staff-category-panel">
                <SectionTitle title="Bemanning per kategori" detail="Volym och genomsnittlig kostnad per tillsättning" />
                <div className="staff-category-list">
                  {categoryBreakdown.map(item => <div className="staff-category-row" key={item.category}>
                    <div className="staff-category-meta"><span>{item.category}</span><strong>{item.count} pass</strong></div>
                    <div className="staff-category-track"><span style={{ width: `${Math.max(3, item.count / Math.max(1, totalPlacements) * 100)}%` }} /></div>
                    <small>{item.count ? `${formatCurrency(item.cost / item.count)} / tillsättning i snitt` : 'Inga tillsättningar i perioden'}</small>
                  </div>)}
                </div>
              </section>
            </div>
            <section className="staff-panel staff-action-strip">
              <div className="staff-action-icon"><i className="fa-solid fa-user-clock" /></div>
              <div><span className="staff-action-kicker">Att följa upp</span><strong>{inactiveCandidates.length} vikarier har saknat genomförd tillsättning i över 120 dagar eller helt saknar historik.</strong><p>Bekräfta intresse och tillgänglighet innan listan rensas.</p></div>
              <button onClick={() => setActiveTab('actions')}>Se åtgärdsförslag <i className="fa-solid fa-arrow-right" /></button>
            </section>
          </>}

          {activeTab === 'filling' && <>
            <section className="staff-stat-grid staff-stat-grid-three">
              <StatCard label="Genomförda pass" value={formatNumber(totalPlacements)} detail="I vald period och kategori" icon="fa-calendar-check" />
              <StatCard label="Tillsättningsgrad" value={`${Math.round(fillRate)} %`} detail="Beräknad mot uppskattat behov" icon="fa-circle-check" tone="green" />
              <StatCard label="Svarstid i snitt" value={`${Math.round(averageResponse)} min`} detail="Lägre svarstid ger snabbare besked" icon="fa-stopwatch" tone="blue" />
            </section>
            <div className="staff-overview-grid">
              <section className="staff-panel staff-trend-panel"><SectionTitle title="Tillsättningar över tid" detail="Genomförda vikariepass per månad" />
                <div className="staff-trend-chart staff-trend-chart-large" role="img" aria-label="Stapeldiagram över tillsättningar per månad">
                  {monthlyTrend.map(item => <div className="staff-trend-column" key={item.label}><span>{item.count}</span><div className="staff-trend-bar-wrap"><div className="staff-trend-bar" style={{ height: `${Math.max(5, item.count / trendMax * 100)}%` }} /></div><small>{item.label}</small></div>)}
                </div>
              </section>
              <section className="staff-panel staff-insight-card"><div className="staff-insight-symbol"><i className="fa-solid fa-magnifying-glass-chart" /></div><SectionTitle title="Insikt" /><strong>{Math.round(fillRate)} % av behoven fick en vikarie</strong><p>Underlaget uppskattar behovsvolymen från den simulerade historiken. Följ svarstiden tillsammans med tillsättningsgraden för att hitta enheter som behöver fler tillgängliga vikarier.</p></section>
            </div>
          </>}

          {activeTab === 'cost' && <>
            <section className="staff-stat-grid staff-stat-grid-three">
              <StatCard label="Simulerad kostnad" value={formatCurrency(totalCost)} detail="Genomförda tillsättningar" icon="fa-coins" tone="orange" />
              <StatCard label="Kostnad per pass" value={formatCurrency(totalPlacements ? totalCost / totalPlacements : 0)} detail="Viktat genomsnitt i perioden" icon="fa-receipt" />
              <StatCard label="Poolpersonal" value={formatCurrency(poolCostAvoided)} detail="Uppskattad besparing mot timanställd" icon="fa-piggy-bank" tone="green" />
            </section>
            <section className="staff-panel"><SectionTitle title="Kostnad och användning per kategori" detail="Jämför uppskattad kostnad per tillsättning med genomförd volym" />
              <div className="staff-cost-table-wrap"><table className="staff-data-table"><thead><tr><th>Kategori</th><th>Genomförda pass</th><th>Simulerad kostnad</th><th>Snitt per pass</th><th>Andel</th></tr></thead><tbody>
                {categoryBreakdown.map(item => <tr key={item.category}><td><strong>{item.category}</strong></td><td>{formatNumber(item.count)}</td><td>{formatCurrency(item.cost)}</td><td>{item.count ? formatCurrency(item.cost / item.count) : '—'}</td><td>{totalPlacements ? `${Math.round(item.count / totalPlacements * 100)} %` : '0 %'}</td></tr>)}
              </tbody></table></div>
              <div className="staff-panel-footnote">Kostnaderna är påhittade exempelvärden för prototypen och ska inte användas som ekonomiskt beslutsunderlag.</div>
            </section>
            <section className="staff-insight-banner"><i className="fa-solid fa-lightbulb" /><p><strong>Förslag:</strong> pröva poolpersonal först när kompetens och tillgänglighet matchar. Jämför sedan kostnad per tillsatt pass med svarstid och återbud, så att lägre kostnad inte försämrar leveransen.</p></section>
          </>}

          {activeTab === 'activity' && <>
            <section className="staff-stat-grid staff-stat-grid-three">
              <StatCard label="Vikarier i registret" value={formatNumber(rosterHistory.length)} detail={`${candidates.filter(candidate => candidate.category === 'Timanställd').length} timanställda`} icon="fa-users" />
              <StatCard label="Aktiva senaste 120 dagar" value={formatNumber(rosterHistory.filter(item => item.latest && (Date.now() - new Date(`${item.latest}T12:00:00`).getTime()) / DAY_MS <= 120).length)} detail="Minst en genomförd tillsättning" icon="fa-user-check" tone="green" />
              <StatCard label="Behöver följas upp" value={formatNumber(inactiveCandidates.length)} detail="Ingen historik eller inaktiv i över 120 dagar" icon="fa-user-clock" tone="orange" />
            </section>
            <section className="staff-panel"><SectionTitle title="Historik per vikarie" detail="Genomförda pass under de senaste 12 månaderna. Använd listan för att hitta låg aktivitet." />
              <div className="staff-cost-table-wrap"><table className="staff-data-table staff-activity-table"><thead><tr><th>Vikarie</th><th>Kategori</th><th>Genomförda pass</th><th>Senaste pass</th><th>Status</th></tr></thead><tbody>{activityTable()}</tbody></table></div>
            </section>
          </>}

          {activeTab === 'actions' && <>
            <div className="staff-actions-intro"><div className="staff-eyebrow"><i className="fa-solid fa-sparkles" /> Beslutsstöd</div><h2>Förslag att ta vidare</h2><p>Åtgärderna bygger på den simulerade historiken. Använd dem som underlag för uppföljning, inte som automatiska beslut.</p></div>
            <div className="staff-recommendations">
              <article className="staff-recommendation staff-recommendation-priority"><div className="staff-recommendation-top"><span className="staff-priority-badge">Prioritet 1</span><span className="staff-recommendation-type">Vikariepool</span></div><div className="staff-recommendation-icon"><i className="fa-solid fa-user-clock" /></div><h3>Följ upp vikarier med låg aktivitet</h3><p>{inactiveCandidates.length} personer har saknat genomförd tillsättning i mer än 120 dagar eller saknar registrerad historik. Bekräfta att de fortfarande vill arbeta och att deras behörigheter är aktuella innan ni överväger att rangera ned eller ta bort dem ur urvalet.</p>
                <div className="staff-inactive-names">{inactiveCandidates.slice(0, 8).map(item => <span key={item.candidate.id}>{item.candidate.name}<small>{item.latest ? `Senast ${formatDate(item.latest)}` : 'Ingen historik'}</small></span>)}</div>
              </article>
              <article className="staff-recommendation"><div className="staff-recommendation-top"><span className="staff-priority-badge staff-priority-medium">Prioritet 2</span><span className="staff-recommendation-type">Bemanning</span></div><div className="staff-recommendation-icon"><i className="fa-solid fa-people-arrows-left-right" /></div><h3>Öka andelen förbokad poolbemanning</h3><p>Poolpersonal står för {externalRecords.length ? Math.round(poolRecords.length / externalRecords.length * 100) : 0} % av genomförda pass i perioden. Planera poolens tillgänglighet runt återkommande toppar och använd timanställda för den varierande efterfrågan.</p><div className="staff-recommendation-metric"><strong>{formatNumber(poolRecords.length)}</strong><span>genomförda pass med poolpersonal</span></div></article>
              <article className="staff-recommendation"><div className="staff-recommendation-top"><span className="staff-priority-badge staff-priority-medium">Prioritet 2</span><span className="staff-recommendation-type">Kvalitet</span></div><div className="staff-recommendation-icon"><i className="fa-solid fa-stopwatch" /></div><h3>Förstärk urvalet där svarstiden är lång</h3><p>Genomsnittlig svarstid är {Math.round(averageResponse)} minuter. Lägg till fler tillgängliga timanställda där behoven ofta blir sena och följ om snabbare svar också höjer tillsättningsgraden.</p><div className="staff-recommendation-metric"><strong>{Math.round(averageResponse)} min</strong><span>simulerad svarstid i urvalet</span></div></article>
            </div>
            <section className="staff-panel staff-followup-panel"><SectionTitle title="Uppföljningsordning" detail="Ett enkelt arbetsflöde för bemanningsansvarig" /><ol><li><span>1</span><div><strong>Bekräfta intresse och tillgänglighet</strong><small>Kontakta först personer som saknar historik eller har varit inaktiva länge.</small></div></li><li><span>2</span><div><strong>Kontrollera behörighet och kompetens</strong><small>Verifiera att uppgifterna fortfarande passar verksamhetens krav.</small></div></li><li><span>3</span><div><strong>Justera urvalsordningen</strong><small>Rangera ned eller avsluta först efter manuell uppföljning.</small></div></li></ol></section>
          </>}
        </div>
      </div>
    </PageLayout>
  );
};
