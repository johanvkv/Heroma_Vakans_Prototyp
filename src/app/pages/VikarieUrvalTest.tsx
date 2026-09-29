import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { PageLayout, Card } from '../components/ui-kit';
import { BreadcrumbItem } from '../components/Breadcrumbs';

type PriorityGroup = 1 | 2 | 3 | 4;

type Candidate = {
  id: number;
  name: string;
  role: string;
  workplace: string;
  resourcePass: boolean;
  available: boolean;
  bookedPass: boolean;
  atlHours: number;
  competence: string[];
  restWithExtra: boolean;
  restNextDay: boolean;
  compensationLeave: boolean;
  objectiveMark: boolean;
  priorityGroup: PriorityGroup;
};

type SimulationState = {
  dateStr: string;
  shift: { type: string; start: string; end: string };
  employeeName: string;
  employeeRole: string;
  workplace: string;
  passInfo?: string;
};

const firstNames = ['Anna', 'Erik', 'Fatima', 'Johan', 'Karin', 'Linnea', 'Mikael', 'Nora', 'Oskar', 'Sara'];
const lastNames = ['Andersson', 'Berg', 'Dahl', 'Ek', 'Friberg', 'Holm', 'Lind', 'Nilsson', 'Persson', 'Sjöberg'];
const roles = ['Undersköterska', 'Vårdbiträde', 'Sjuksköterska', 'Stödassistent'];
const workplaces = ['Ängsgården', 'Björkbacken', 'Centrum hemtjänst', 'Lindens korttidsboende'];
const competenceOptions = ['Demens', 'Läkemedel', 'Lyftteknik', 'HLR', 'Psykiatri'];

const makeCandidates = (): Candidate[] => Array.from({ length: 100 }, (_, index) => {
  const n = index + 1;
  const resourcePass = n % 5 <= 2;
  const available = n % 3 !== 0;
  const bookedPass = n % 4 === 0;
  const priorityGroup: PriorityGroup = resourcePass ? 1 : available ? 2 : !bookedPass ? 3 : 4;
  const competence = competenceOptions.filter((_, competenceIndex) => (n + competenceIndex) % 3 === 0);

  return {
    id: n,
    name: `${firstNames[index % firstNames.length]} ${lastNames[Math.floor(index / firstNames.length)]}`,
    role: roles[index % roles.length],
    workplace: workplaces[index % workplaces.length],
    resourcePass,
    available,
    bookedPass,
    atlHours: (n * 17) % 221,
    competence: competence.length ? competence : [competenceOptions[n % competenceOptions.length]],
    restWithExtra: n % 5 !== 0,
    restNextDay: n % 7 !== 0,
    compensationLeave: n % 4 === 1 || n % 6 === 0,
    objectiveMark: n % 11 === 0,
    priorityGroup,
  };
});

const groupLabels: Record<PriorityGroup, string> = {
  1: 'Resurspass',
  2: 'Tillgänglig',
  3: 'Inget bokat pass',
  4: 'Övriga',
};

const getFlowScore = (candidate: Candidate) => [
  candidate.restWithExtra,
  candidate.restNextDay,
  candidate.compensationLeave,
  candidate.objectiveMark,
].reduce((score, value, index) => score + (value ? [1000, 700, 400, 100][index] : 0), 0);

export const VikarieUrvalTest = () => {
  const location = useLocation();
  const simulatedPass = location.state as SimulationState | null;
  const [search, setSearch] = useState('');
  const [competence, setCompetence] = useState('Alla');
  const [onlyEligible, setOnlyEligible] = useState(true);
  const [selectedDate, setSelectedDate] = useState(simulatedPass?.dateStr ?? '2026-09-24');
  const candidates = useMemo(makeCandidates, []);

  const filteredCandidates = useMemo(() => candidates
    .filter((candidate) => !onlyEligible || candidate.atlHours <= 190)
    .filter((candidate) => competence === 'Alla' || candidate.competence.includes(competence))
    .filter((candidate) => `${candidate.name} ${candidate.role} ${candidate.workplace}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.priorityGroup - b.priorityGroup || getFlowScore(b) - getFlowScore(a) || a.atlHours - b.atlHours),
  [candidates, competence, onlyEligible, search]);

  const groupCount = (group: PriorityGroup) => filteredCandidates.filter((candidate) => candidate.priorityGroup === group).length;
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Heroma', href: '/' },
    { label: 'Vikariehantering' },
    { label: 'Urvalstest', isActive: true },
  ];

  return (
    <PageLayout title="Testa vikarieurval" breadcrumbItems={breadcrumbItems}>
      <div className="col-12">
        <div className="vikarie-test-intro">
          <div>
            <p className="vikarie-eyebrow">Resurscentrum · Simuleringsvy</p>
            <h1>Urval och prioritering av vikarier</h1>
            <p>Testdata med 100 fiktiva medarbetare. Filtrera fram möjliga resurser och jämför sedan prioriteringen från flödesschemat.</p>
            {simulatedPass && <div className="vikarie-simulation-context"><strong>Simulerar aktuellt pass</strong><span>{simulatedPass.dateStr} · {simulatedPass.shift.start}–{simulatedPass.shift.end} · {simulatedPass.employeeName} · {simulatedPass.workplace}</span>{simulatedPass.passInfo && <span>Passinformation: {simulatedPass.passInfo}</span>}</div>}
          </div>
          <div className="vikarie-test-date">
            <label htmlFor="shift-date">Datum för vakans</label>
            <input id="shift-date" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
          </div>
        </div>
      </div>

      <div className="col-12 col-xl-4">
        <Card title="1. Filtrera möjliga resurser">
          <div className="vikarie-filter-stack">
            <label htmlFor="candidate-search">Sök person, roll eller arbetsplats</label>
            <input id="candidate-search" className="form-control" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Exempel: Anna eller Demens" />
            <label htmlFor="competence-filter">Kompetens</label>
            <select id="competence-filter" className="form-select" value={competence} onChange={(event) => setCompetence(event.target.value)}>
              <option>Alla</option>
              {competenceOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
            <label className="vikarie-checkbox"><input type="checkbox" checked={onlyEligible} onChange={(event) => setOnlyEligible(event.target.checked)} /> Visa bara ATL-godkända (≤ 190 timmar)</label>
          </div>
          <div className="vikarie-filter-note">Urvalet speglar gemensamma sökkriterier och tillgängliga resurser. Tillgänglighet och bokade pass används sedan i prioriteringen.</div>
        </Card>
      </div>

      <div className="col-12 col-xl-8">
        <Card title="2. Prioriteringsordning" actions={<span className="vikarie-result-count">{filteredCandidates.length} av 100 visas</span>}>
          <div className="vikarie-priority-list">
            {[1, 2, 3].map((group) => <div className="vikarie-priority-item" key={group}>
              <span className="vikarie-priority-number">{group}</span>
              <span><strong>{groupLabels[group as PriorityGroup]}</strong><small>{group === 1 ? 'Fulltidsanställd och tillgänglig för tillsättning' : group === 2 ? 'Har gjort sig tillgänglig' : 'Har inget pass bokat'}</small></span>
              <b>{groupCount(group as PriorityGroup)}</b>
            </div>)}
          </div>
          <div className="vikarie-rule-summary"><strong>Därefter:</strong> dygnsvila med extrapass → dygnsvila kommande dygn → kompensationsledighet → Objektiva skäl.</div>
        </Card>
      </div>

      <div className="col-12">
        <Card title="Prioriterad lista över personer">
          <div className="table-responsive">
            <table className="table table-hover align-middle vikarie-table">
              <thead><tr><th>#</th><th>Medarbetare</th><th>Urvalsgrupp</th><th>Kompetens</th><th>ATL</th><th>Dygnsvila</th><th>Kompletterande underlag</th></tr></thead>
              <tbody>{filteredCandidates.map((candidate, index) => <tr key={candidate.id}>
                <td><span className={`vikarie-rank vikarie-rank-${candidate.priorityGroup}`}>{index + 1}</span></td>
                <td><strong>{candidate.name}</strong><small>{candidate.role} · {candidate.workplace}</small></td>
                <td><span className={`vikarie-badge vikarie-badge-${candidate.priorityGroup}`}>{candidate.priorityGroup}. {groupLabels[candidate.priorityGroup]}</span>{candidate.bookedPass && <small className="vikarie-muted">Har bokat pass</small>}</td>
                <td>{candidate.competence.join(', ')}</td>
                <td><span className={candidate.atlHours > 190 ? 'vikarie-danger' : ''}>{candidate.atlHours} h</span></td>
                <td><span className={candidate.restWithExtra ? 'vikarie-ok' : 'vikarie-danger'}>{candidate.restWithExtra ? 'Ja' : 'Nej'}</span><small>{candidate.restNextDay ? 'Kommande dygn: ja' : 'Kommande dygn: nej'}</small></td>
                <td><small>{candidate.compensationLeave ? 'Komp. ledighet' : '—'}{candidate.objectiveMark ? ' · Objektiva skäl' : ''}</small></td>
              </tr>)}</tbody>
            </table>
          </div>
          {!filteredCandidates.length && <div className="vikarie-empty-state">Inga medarbetare matchar filtren.</div>}
        </Card>
      </div>
    </PageLayout>
  );
};
