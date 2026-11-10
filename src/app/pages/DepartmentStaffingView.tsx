import React, { useMemo, useState } from 'react';
import { PageLayout } from '../components/ui-kit';
import { fullName, persons } from '../../data';
import { PRESCHOOL_SUBSTITUTE_PROFILES, SUBSTITUTE_ROSTER } from '../../data/substituteRoster';
import '../../styles/department-staffing.css';

type ViewMode = 'week' | 'month';

interface DepartmentOption {
  id: string;
  preschool: string;
  name: string;
  employeeStart: number;
}

interface DepartmentEmployee {
  id: string;
  personIndex: number;
  name: string;
  role: string;
  department: string;
}

interface DayAssignment {
  employee: DepartmentEmployee;
  start: string;
  end: string;
  activities: string[];
  substitute?: {
    name: string;
    role: string;
    initials: string;
    category: string;
  };
}

const DEPARTMENTS: DepartmentOption[] = [
  { id: 'solglantan-ekorren', preschool: 'Förskolan Solgläntan', name: 'Ekorren', employeeStart: 0 },
  { id: 'solglantan-fjarilen', preschool: 'Förskolan Solgläntan', name: 'Fjärilen', employeeStart: 5 },
  { id: 'skogsbrynet-myran', preschool: 'Förskolan Skogsbrynet', name: 'Myran', employeeStart: 10 },
  { id: 'skogsbrynet-kotten', preschool: 'Förskolan Skogsbrynet', name: 'Kotten', employeeStart: 15 },
];

const SCHOOL_ROLES = [
  'Förskollärare', 'Barnskötare', 'Barnskötare', 'Förskollärare', 'Barnskötare',
  'Förskollärare', 'Barnskötare', 'Barnskötare', 'Förskollärare', 'Barnskötare',
  'Förskollärare', 'Barnskötare', 'Barnskötare', 'Förskollärare', 'Barnskötare',
  'Förskollärare', 'Barnskötare', 'Barnskötare', 'Förskollärare', 'Barnskötare',
];

const SHIFT_TIMES: Array<[string, string]> = [
  ['07:00', '15:30'],
  ['07:30', '16:00'],
  ['08:00', '16:30'],
  ['08:30', '17:00'],
  ['07:30', '16:30'],
];

const ACTIVITY_PATTERNS = [
  ['Pedagogisk verksamhet', 'Utevistelse'],
  ['Måltider', 'Pedagogisk verksamhet'],
  ['Utevistelse', 'Vila och återhämtning'],
  ['Pedagogisk verksamhet', 'Måltider'],
  ['Utevistelse', 'Pedagogisk verksamhet'],
];

const ACTIVITY_CLASS: Record<string, string> = {
  'Pedagogisk verksamhet': 'department-activity-pedagogical',
  'Utevistelse': 'department-activity-outdoors',
  'Måltider': 'department-activity-meals',
  'Vila och återhämtning': 'department-activity-rest',
};

const SUBSTITUTE_BY_DEPARTMENT = ['sub9', 'sub10', 'sub33', 'sub34'];
const AVATAR_COLORS = ['lilac', 'coral', 'mint', 'blue', 'sand', 'rose'];

function atMidnight(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function mondayOf(date: Date): Date {
  const day = date.getDay();
  return addDays(atMidnight(date), -(day === 0 ? 6 : day - 1));
}

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toLocaleUpperCase('sv-SE');
}

function timeLabel(time: string): string {
  return time.replace(':', '.');
}

function formatDay(date: Date, options: Intl.DateTimeFormatOptions = {}): string {
  return new Intl.DateTimeFormat('sv-SE', options).format(date);
}

function formatLongDay(date: Date): string {
  const value = formatDay(date, { weekday: 'long', day: 'numeric', month: 'long' });
  return value.charAt(0).toLocaleUpperCase('sv-SE') + value.slice(1);
}

function getDepartmentEmployees(department: DepartmentOption): DepartmentEmployee[] {
  return persons.slice(department.employeeStart, department.employeeStart + 5).map((person, localIndex) => {
    const personIndex = department.employeeStart + localIndex;
    return {
      id: person.id,
      personIndex,
      name: fullName(person),
      role: SCHOOL_ROLES[personIndex] ?? 'Barnskötare',
      department: department.name,
    };
  });
}

function getAssignment(employee: DepartmentEmployee, department: DepartmentOption, date: Date): DayAssignment {
  const patternIndex = (employee.personIndex + date.getDate() + date.getMonth()) % SHIFT_TIMES.length;
  const [start, end] = SHIFT_TIMES[patternIndex];
  const activities = ACTIVITY_PATTERNS[(employee.personIndex + date.getDate()) % ACTIVITY_PATTERNS.length];
  const departmentIndex = DEPARTMENTS.findIndex(item => item.id === department.id);
  const expectedAbsenceDay = departmentIndex + 1;
  const absentEmployeeIndex = department.employeeStart + 1;
  const isAbsent = employee.personIndex === absentEmployeeIndex && date.getDay() === expectedAbsenceDay;
  const substituteId = SUBSTITUTE_BY_DEPARTMENT[departmentIndex];
  const source = SUBSTITUTE_ROSTER.find(candidate => candidate.id === substituteId);
  const schoolProfile = source ? PRESCHOOL_SUBSTITUTE_PROFILES[source.id] : undefined;
  const substitute = isAbsent && source ? {
    name: source.name,
    role: schoolProfile?.role ?? source.role,
    initials: initials(source.name),
    category: schoolProfile?.category ?? source.category,
  } : undefined;

  return {
    employee,
    start,
    end,
    activities,
    substitute,
  };
}

function Avatar({ name, tone, small = false, absent = false }: { name: string; tone: string; small?: boolean; absent?: boolean }) {
  return <span className={`department-avatar department-avatar-${tone}${small ? ' department-avatar-small' : ''}${absent ? ' department-avatar-absent' : ''}`} aria-hidden="true">{initials(name)}</span>;
}

function AssignmentCard({ assignment, colorIndex }: { assignment: DayAssignment; colorIndex: number }) {
  const { employee, substitute, start, end, activities } = assignment;
  return (
    <article className={`department-assignment-card${substitute ? ' is-covered' : ''}`}>
      <div className="department-assignment-person">
        <Avatar name={employee.name} tone={AVATAR_COLORS[colorIndex % AVATAR_COLORS.length]} absent={Boolean(substitute)} />
        <div className="department-person-copy">
          <strong>{employee.name}</strong>
          <span>{employee.role}</span>
        </div>
        <span className={`department-presence-state${substitute ? ' is-away' : ''}`}>
          <i className={`fa-solid ${substitute ? 'fa-calendar-xmark' : 'fa-circle-check'}`} aria-hidden="true" />
          {substitute ? 'Frånvarande' : 'På plats'}
        </span>
      </div>
      {substitute ? (
        <div className="department-cover-row">
          <div className="department-cover-label">Ersätts av</div>
          <div className="department-cover-person">
            <Avatar name={substitute.name} tone="teal" small />
            <span><strong>{substitute.name}</strong><small>{substitute.role} · {substitute.category}</small></span>
          </div>
          <div className="department-cover-time"><strong>Kommer {timeLabel(start)}</strong><small>Arbetstid {timeLabel(start)}–{timeLabel(end)}</small></div>
        </div>
      ) : (
        <div className="department-working-hours"><i className="fa-regular fa-clock" aria-hidden="true" /> Arbetstid {timeLabel(start)}–{timeLabel(end)}</div>
      )}
      <div className="department-activities" aria-label="Aktiviteter">
        {activities.map(activity => <span key={activity} className={`department-activity-chip ${ACTIVITY_CLASS[activity]}`}>{activity}</span>)}
      </div>
    </article>
  );
}

function getMonthGrid(anchor: Date): Date[] {
  const firstDay = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const gridStart = mondayOf(firstDay);
  const lastDay = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
  const lastGridDay = addDays(lastDay, (7 - lastDay.getDay()) % 7);
  const totalDays = Math.round((lastGridDay.getTime() - gridStart.getTime()) / 86400000) + 1;
  return Array.from({ length: totalDays }, (_, index) => addDays(gridStart, index));
}

export const DepartmentStaffingView = () => {
  const [mode, setMode] = useState<ViewMode>('week');
  const [anchorDate, setAnchorDate] = useState<Date>(() => atMidnight(new Date()));
  const [departmentId, setDepartmentId] = useState(DEPARTMENTS[0].id);
  const [selectedMonthDay, setSelectedMonthDay] = useState<Date>(() => atMidnight(new Date()));

  const department = DEPARTMENTS.find(item => item.id === departmentId) ?? DEPARTMENTS[0];
  const departmentEmployees = useMemo(() => getDepartmentEmployees(department), [department]);
  const weekDates = useMemo(() => {
    const monday = mondayOf(anchorDate);
    return Array.from({ length: 5 }, (_, index) => addDays(monday, index));
  }, [anchorDate]);
  const monthDays = useMemo(() => getMonthGrid(anchorDate), [anchorDate]);
  const monthLabel = formatDay(anchorDate, { month: 'long', year: 'numeric' });
  const periodLabel = mode === 'week'
    ? `${formatDay(weekDates[0], { day: 'numeric', month: 'short' })}–${formatDay(weekDates[4], { day: 'numeric', month: 'short', year: 'numeric' })}`
    : monthLabel.charAt(0).toLocaleUpperCase('sv-SE') + monthLabel.slice(1);
  const todayKey = toDateKey(new Date());

  const movePeriod = (direction: -1 | 1) => {
    const nextDate = mode === 'week'
      ? addDays(anchorDate, direction * 7)
      : new Date(anchorDate.getFullYear(), anchorDate.getMonth() + direction, 1);
    setAnchorDate(nextDate);
    if (mode === 'month') setSelectedMonthDay(atMidnight(nextDate));
  };

  const selectedDayAssignments = departmentEmployees.map((employee, index) => getAssignment(employee, department, selectedMonthDay));

  return (
    <PageLayout
      title="Bemanning på avdelningen"
      breadcrumbItems={[{ label: 'Heroma', href: '/' }, { label: 'Admin' }, { label: 'Bemanning på avdelningen', isActive: true }]}
    >
      <div className="col-12">
        <div className="department-staffing-page">
          <header className="department-staffing-heading">
            <div>
              <div className="department-staffing-eyebrow"><i className="fa-solid fa-people-roof" /> Rektorsområde Väster</div>
              <h1>Bemanning på avdelningen</h1>
              <p>Se vem som arbetar, vilka aktiviteter som är planerade och vem som ersätter vid frånvaro.</p>
            </div>
            <div className="department-live-note"><span className="department-live-dot" /> Planerad bemanning <span>·</span> visas för arbetslaget</div>
          </header>

          <section className="department-view-controls" aria-label="Välj avdelning och tidsvy">
            <label className="department-select-label" htmlFor="department-choice">Avdelning</label>
            <select id="department-choice" value={departmentId} onChange={event => setDepartmentId(event.target.value)}>
              {DEPARTMENTS.map(item => <option key={item.id} value={item.id}>{item.preschool} · {item.name}</option>)}
            </select>
            <div className="department-control-spacer" />
            <div className="department-period-nav" aria-label="Byt period">
              <button type="button" aria-label="Föregående period" onClick={() => movePeriod(-1)}><i className="fa-solid fa-chevron-left" /></button>
              <strong>{periodLabel}</strong>
              <button type="button" aria-label="Nästa period" onClick={() => movePeriod(1)}><i className="fa-solid fa-chevron-right" /></button>
            </div>
            <div className="department-mode-switch" role="tablist" aria-label="Välj schemavy">
              <button type="button" role="tab" aria-selected={mode === 'week'} className={mode === 'week' ? 'is-active' : ''} onClick={() => setMode('week')}><i className="fa-solid fa-calendar-week" /> Vecka</button>
              <button type="button" role="tab" aria-selected={mode === 'month'} className={mode === 'month' ? 'is-active' : ''} onClick={() => setMode('month')}><i className="fa-regular fa-calendar" /> Månad</button>
            </div>
          </section>

          <div className="department-context-line">
            <div><strong>{department.name}</strong><span>{department.preschool}</span></div>
            <span className="department-people-count"><i className="fa-solid fa-users" /> {departmentEmployees.length} medarbetare i arbetslaget</span>
          </div>

          {mode === 'week' ? (
            <section className="department-week-view" aria-label={`Veckoschema för ${department.name}`}>
              {weekDates.map((date, dayIndex) => {
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                const assignments = departmentEmployees.map(employee => getAssignment(employee, department, date));
                const absentCount = assignments.filter(assignment => assignment.substitute).length;
                return (
                  <div className={`department-day-column${toDateKey(date) === todayKey ? ' is-today' : ''}${isWeekend ? ' is-weekend' : ''}`} key={toDateKey(date)}>
                    <div className="department-day-heading">
                      <span>{formatDay(date, { weekday: 'short' }).replace('.', '')}</span>
                      <strong>{formatDay(date, { day: 'numeric' })}</strong>
                      <small>{departmentEmployees.length - absentCount} inne{absentCount ? ` · ${absentCount} ersättare` : ''}</small>
                    </div>
                    <div className="department-day-assignments">
                      {isWeekend ? <div className="department-closed-day">Förskolan är stängd</div> : assignments.map((assignment, index) => <AssignmentCard key={assignment.employee.id} assignment={assignment} colorIndex={index + dayIndex} />)}
                    </div>
                  </div>
                );
              })}
            </section>
          ) : (
            <>
              <section className="department-month-calendar" aria-label={`Månadsschema för ${department.name}`}>
                <div className="department-month-weekdays">{['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'].map(day => <span key={day}>{day}</span>)}</div>
                <div className="department-month-grid">
                  {monthDays.map(date => {
                    const isCurrentMonth = date.getMonth() === anchorDate.getMonth();
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    const assignments = isWeekend ? [] : departmentEmployees.map(employee => getAssignment(employee, department, date));
                    const coverage = assignments.find(assignment => assignment.substitute);
                    const activeCount = assignments.length - (coverage ? 1 : 0);
                    const isSelected = toDateKey(date) === toDateKey(selectedMonthDay);
                    return (
                      <button
                        type="button"
                        className={`department-month-day${!isCurrentMonth ? ' is-outside-month' : ''}${isWeekend ? ' is-weekend' : ''}${isSelected ? ' is-selected' : ''}${toDateKey(date) === todayKey ? ' is-today' : ''}`}
                        key={toDateKey(date)}
                        onClick={() => { setSelectedMonthDay(date); setAnchorDate(date); }}
                        aria-pressed={isSelected}
                      >
                        <span className="department-month-date">{date.getDate()}</span>
                        {!isWeekend && <>
                          <span className="department-month-count">{activeCount} inne{coverage ? ' · 1 frånvaro' : ''}</span>
                          <span className="department-month-avatars">
                            {assignments.map((assignment, index) => <React.Fragment key={assignment.employee.id}>
                              <Avatar name={assignment.employee.name} tone={AVATAR_COLORS[index % AVATAR_COLORS.length]} small absent={Boolean(assignment.substitute)} />
                              {assignment.substitute && <Avatar name={assignment.substitute.name} tone="teal" small />}
                            </React.Fragment>)}
                          </span>
                          {coverage?.substitute && <span className="department-month-cover"><i className="fa-solid fa-arrow-right-arrow-left" /> {coverage.substitute.name.split(' ')[0]} ersätter {coverage.employee.name.split(' ')[0]} · kommer {timeLabel(coverage.start)}</span>}
                        </>}
                        {isWeekend && <span className="department-month-closed">Stängt</span>}
                      </button>
                    );
                  })}
                </div>
              </section>
              <section className="department-selected-day-detail">
                <div className="department-selected-day-heading"><div><span>Dagsschema</span><h2>{formatLongDay(selectedMonthDay)}</h2></div><span>{selectedDayAssignments.length - selectedDayAssignments.filter(item => item.substitute).length} inne · {selectedDayAssignments.filter(item => item.substitute).length} frånvaro</span></div>
                {selectedMonthDay.getDay() === 0 || selectedMonthDay.getDay() === 6
                  ? <div className="department-closed-detail">Förskolan är stängd den här dagen.</div>
                  : <div className="department-selected-day-list">{selectedDayAssignments.map((assignment, index) => <AssignmentCard key={assignment.employee.id} assignment={assignment} colorIndex={index} />)}</div>}
              </section>
            </>
          )}

          <footer className="department-staffing-footer">
            <div className="department-legend"><span><i className="department-legend-dot is-present" /> På plats</span><span><i className="department-legend-dot is-absent" /> Frånvarande</span><span><i className="department-legend-dot is-cover" /> Ersättare</span></div>
            <span>Initialer används där porträtt saknas</span>
          </footer>
        </div>
      </div>
    </PageLayout>
  );
};
