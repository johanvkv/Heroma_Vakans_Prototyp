/**
 * SCHEMA — Schedule view. Mode B.
 * Substitute panel slides in from bottom on "Hitta vikarie" / "Boka extrapass".
 * Columns align with the main schedule via shared scroll sync.
 */
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { PageLayout } from '../components/ui-kit';
import { BreadcrumbItem } from '../components/Breadcrumbs';
import TagBox    from 'devextreme-react/tag-box';
import SelectBox from 'devextreme-react/select-box';
import TextBox   from 'devextreme-react/text-box';
import TextArea  from 'devextreme-react/text-area';
import Popup     from 'devextreme-react/popup';
import CheckBox  from 'devextreme-react/check-box';
import ContextMenu from 'devextreme-react/context-menu';
import { useNavigate } from 'react-router';
import { persons, getActiveEmployment, fullName } from '../../data';
import { PRESCHOOL_SUBSTITUTE_PROFILES, SUBSTITUTE_ROSTER } from '../../data/substituteRoster';
import { CaseActivityModal } from '../components/CaseActivityModal';
import { useOptionalAutomation } from '../components/AutomationContext';
import { useRole } from '../components/RoleContext';
import type { CaseActivity, CaseActivityResponse } from '../components/CaseActivityModal';

// ─── Types ───────────────────────────────────────────────────────────────────

type ShiftType    = 'morning' | 'day' | 'evening' | 'night';
type PeriodType   = 'dag' | 'arbetsvecka' | 'vecka' | 'sjuDagar' | 'femDagar' | 'manad' | 'period' | 'ar';
type ViewType     = 'day-columns' | 'month-columns' | 'year-columns';
type ColorScheme  = 'normal' | 'past' | 'absence' | 'vacant' | 'filled' | 'ordered';
type OrganisationScenario = 'clinic' | 'school' | 'schoolTimeline';
type ActivityKind = 'pedagogical' | 'outdoors' | 'meals' | 'rest';
type ActivityFilterKind = ActivityKind | 'absence';

interface ScheduleActivity {
  id: string;
  employeeId: string;
  dateStr: string;
  kind: ActivityKind;
  label: string;
  start: string;
  end: string;
}

interface PreschoolDayPattern {
  shift: Shift;
  activities: Array<{ kind: ActivityKind; start: string; end: string }>;
}
interface EmployeeDaySchedule {
  dateStr: string;
  shift: Shift;
  activities: ScheduleActivity[];
  absenceLabel?: string;
}

interface ActivityFill {
  activityId: string;
  dateStr: string;
  shift: Shift;
  substituteId: string;
  substituteName: string;
  substituteRole: string;
}

interface RemainingPass {
  id: string;
  dateStr: string;
  unitId: string;
  unit: string;
  shift: Shift;
  activities: ScheduleActivity[];
  assignedSubstituteId?: string;
  assignedSubstituteName?: string;
}

const EMPLOYEE_COLUMN_WIDTH = 280;
const VIEW_COLUMN_WIDTH: Record<ViewType, number> = {
  'day-columns': 130,
  'month-columns': 48,
  'year-columns': 100,
};

function getScheduleTableMinWidth(viewType: ViewType, columnCount: number): number {
  return EMPLOYEE_COLUMN_WIDTH + VIEW_COLUMN_WIDTH[viewType] * columnCount;
}

interface Shift            { type: ShiftType; start: string; end: string; }
interface EmployeeGroup    { id: string; label: string; category: 'team'|'role'|'department'|'functional'; }
interface OrganisationGroup { id: string; label: string; kind: 'clinic'|'department'|'team'|'activity'; personIds: string[]; parentId?: string; depth?: number; }
type ResourceBoardOrgLevel = 'education' | 'rectorate' | 'preschool' | 'team' | 'department' | 'organisation';
interface ResourceBoardOrgOption { id: string; label: string; level: ResourceBoardOrgLevel; personIds: string[]; }
interface ViewColumn       { date: Date; header: string; subHeader?: string; isWeekend?: boolean; }
interface ShiftFill        { personId: string; dateStr: string; fillType: 'substitute'|'extra'; person: { name: string; role: string }; substituteId?: string; shift?: Shift; }
interface ScheduleEmployee { id: string; name: string; role: string; organisation: string; department: string; fmgGroup: string; }
interface ResourceOrder {
  id: string;
  personId: string;
  personName: string;
  role: string;
  dateStr: string;
  shift: Shift;
  resourceType: 'vikarie' | 'extrapass';
  status: ResourceOrderStatus;
  orderedBy: string;
  handledBy: string;
  invitedSubstitutes: ResourceOrderInvite[];
  acceptedSubstituteId?: string;
}
type ResourceNeedStatus = 'Öppet' | 'Tillsatt' | 'Borttaget';
interface ResourceNeed {
  id: string;
  personId: string;
  personName: string;
  role: string;
  dateStr: string;
  shift: Shift;
  reason?: AbsenceReason;
  source: 'frånvaro' | 'pass';
  status: ResourceNeedStatus;
  workflowStatus?: ResourceOrderStatus;
  createdBy: string;
  handledBy: string;
  assignedSubstituteId?: string;
  assignedSubstituteName?: string;
}
type ResourceOrderStatus = 'Beställd' | 'Under behandling' | 'Förfrågan skickad' | 'Besvarad' | 'Tillsatt' | 'Avbruten';
type ResourceResponseStatus = 'Avvaktar' | 'Tillgänglig' | 'Kan inte';
interface ResourceOrderInvite {
  substituteId: string;
  name: string;
  role: string;
  response: ResourceResponseStatus;
  responseText?: string;
}
type SubstituteCostLevel = 'Gratis' | 'Kostnadsnivå 1' | 'Kostnadsnivå 2' | 'Kostnadsnivå 3';
interface SubstituteCandidate { id: string; name: string; role: string; category: string; costLevel: SubstituteCostLevel; competencies?: string[]; }
interface SubAvailability  { startH: number; startM: number; endH: number; endM: number; }
type SubstituteAvailabilityOverrides = Record<string, SubAvailability | null>;
type SubstituteAbsences = Record<string, AbsenceReason>;
interface SubstituteDetails {
  phone: string;
  email: string;
  competencies: string[];
  atlHours: number;
  maxAtlHours: number;
}
interface SubBookedShift { dateStr: string; start: string; end: string; }
interface DetailState {
  empId: string; empName: string; empRole: string;
  dateStr: string; shift: Shift; color: ColorScheme;
}

interface SubPanelState {
  personId: string;
  dateStr: string;
  shift: Shift;
  fillType: 'substitute' | 'extra';
  targetPersonName: string;
  targetUnit?: string;
  targetType?: 'pass' | 'activity';
  targetActivityId?: string;
  targetActivityLabel?: string;
  targetRemainingPassId?: string;
  unitLocked?: boolean;
}
interface ConfirmState {
  substitutes: SubstituteCandidate[];
  targetPersonId: string;
  targetDateStr: string;
  targetShift: Shift;
  fillType: 'substitute' | 'extra';
  unit: string;
  targetType?: 'pass' | 'activity';
  targetActivityId?: string;
  targetActivityLabel?: string;
  targetRemainingPassId?: string;
  unitLocked?: boolean;
  costApproval?: boolean;
}
interface OpenRequestState {
  substitutes: SubstituteCandidate[];
  dateStr: string;
  shift: Shift;
  role: string;
  unit: string;
}
interface ResourceOrderDialogState {
  personId: string;
  personName: string;
  role: string;
  dateStr: string;
  shift: Shift;
  resourceType: 'vikarie' | 'extrapass';
}
interface SubstituteDetailState { substituteId: string; dateStr: string; }
type AbsenceReason = 'Sjuk' | 'VAB' | 'Tjänstledig' | 'Semester';
interface AbsenceDialogState {
  personId: string;
  personName: string;
  dateStr: string;
  shift: Shift;
  startDate: string;
  endDate: string;
  reason: AbsenceReason;
}
type OrderContextActionId = 'start-processing' | 'send-order' | 'cancel-order' | 'approve-response';
interface OrderContextAction {
  id: OrderContextActionId;
  text: string;
  icon: string;
  substituteId?: string;
  beginGroup?: boolean;
}
type ResourceNeedActionId = 'open' | 'remove' | 'assign' | 'assign-direct' | 'order';
interface ResourceNeedAction { id: ResourceNeedActionId; text: string; icon: string; }

// ─── Constants ───────────────────────────────────────────────────────────────

const TODAY_STR = toDateStr(new Date());

type ContextTargetType = 'absence' | 'vacant' | 'normal';
type ContextActionId = 'find-substitute' | 'make-vacancy' | 'primary' | 'order-resource' | 'show-details' | 'simulate' | 'create-absence' | 'assign-direct';
type OrganisationActionId = 'open' | 'close' | 'settings';
type SubstituteContextActionId = 'show-details' | 'edit-availability' | 'mark-unavailable' | 'restore-availability' | 'report-sick' | 'clear-sickness' | 'send-request';
interface SubstituteContextAction { id: SubstituteContextActionId; text: string; icon: string; beginGroup?: boolean; }
interface SubstituteContextTarget { substituteId: string; dateStr: string; }

interface ContextAction {
  id: ContextActionId;
  text: string;
  icon: string;
  beginGroup?: boolean;
}

function renderSchemaContextMenuItem(item: { id?: string; text?: string; icon?: string }) {
  const icon = item.id === 'assign-direct' ? 'robot' : item.icon ?? 'circle';
  return (
    <span className="schema-context-menu-item">
      <i className={`fa-solid fa-${icon}`} aria-hidden="true" />
      <span>{item.text}</span>
    </span>
  );
}

function getContextActions(type: ContextTargetType, resourceNeedMode = false, isAssigned = false): ContextAction[] {
  const directAssignment = resourceNeedMode && !isAssigned
    ? [{ id: 'assign-direct' as const, text: 'Tillsätt direkt', icon: 'robot', beginGroup: true }]
    : [];
  if (type === 'absence') {
    return [
      { id: 'find-substitute', text: 'Hitta vikarie', icon: 'user' },
      { id: 'order-resource', text: 'Beställ resurs', icon: 'cart-shopping' },
      ...directAssignment,
      { id: 'make-vacancy', text: resourceNeedMode ? 'Skapa resursbehov' : 'Gör till vakans', icon: 'user-clock' },
      { id: 'simulate', text: 'Simulera', icon: 'flask', beginGroup: true },
      { id: 'show-details', text: 'Visa frånvarodetaljer', icon: 'circle-info', beginGroup: true },
    ];
  }
  return [
    {
      id: 'primary',
      text: resourceNeedMode ? 'Skapa resursbehov' : type === 'vacant' ? 'Hitta vikarie' : 'Boka extrapass',
      icon: type === 'vacant' ? 'user' : 'plus',
    },
    { id: 'order-resource', text: 'Beställ resurs', icon: 'cart-shopping' },
    ...directAssignment,
    { id: 'simulate', text: 'Simulera', icon: 'flask', beginGroup: true },
    { id: 'create-absence', text: 'Skapa frånvaro', icon: 'calendar-xmark' },
    { id: 'show-details', text: 'Visa passdetaljer', icon: 'circle-info', beginGroup: true },
  ];
}

const SUBSTITUTE_CANDIDATES: SubstituteCandidate[] = SUBSTITUTE_ROSTER;

const SUB_DETAILS: Record<string, SubstituteDetails> = {
  sub1: { phone: '070-123 45 67', email: 'anna.viksson@vardpool.se',    competencies: ['Demens', 'Palliation', 'Sondmatning'],             atlHours: 145, maxAtlHours: 168 },
  sub2: { phone: '072-234 56 78', email: 'erik.lindqvist@vardpool.se',  competencies: ['Akutvård', 'IV-behandling', 'Insulingivning'],       atlHours: 88,  maxAtlHours: 168 },
  sub3: { phone: '073-345 67 89', email: 'maria.svensson@vardpool.se',  competencies: ['Demens', 'Rehabilitering'],                         atlHours: 160, maxAtlHours: 168 },
  sub4: { phone: '076-456 78 90', email: 'jonas.berg@vardpool.se',      competencies: ['Medicinsk vård', 'Sårbehandling', 'Läkemedel'],      atlHours: 112, maxAtlHours: 168 },
  sub5: { phone: '070-567 89 01', email: 'karin.nilsson@vardpool.se',   competencies: ['Barnomsorg', 'Demens'],                             atlHours: 72,  maxAtlHours: 168 },
  sub6: { phone: '073-678 90 12', email: 'peter.holm@vardpool.se',      competencies: ['Kirurgi', 'Akutvård', 'Smärtlindring'],             atlHours: 130, maxAtlHours: 168 },
  sub7: { phone: '070-789 01 23', email: 'sara.lundberg@vardpool.se',   competencies: ['Rehabilitering', 'Hemtjänst'],                      atlHours: 55,  maxAtlHours: 168 },
  sub8: { phone: '072-890 12 34', email: 'anders.persson@vardpool.se',  competencies: ['Intensivvård', 'Neurologi', 'HLR-instruktör'],       atlHours: 168, maxAtlHours: 168 },
};

// Pre-existing booked shifts for substitutes (date → time range)
const SUB_BOOKED_SHIFTS: Record<string, SubBookedShift[]> = {
  sub1: [{ dateStr: '2026-09-05', start: '08:00', end: '17:00' }],
  sub2: [{ dateStr: '2026-09-04', start: '14:30', end: '22:30' }, { dateStr: '2026-09-07', start: '06:45', end: '15:00' }],
  sub3: [{ dateStr: '2026-09-06', start: '06:45', end: '15:00' }],
  sub5: [{ dateStr: '2026-09-03', start: '22:00', end: '06:00' }],
  sub8: [{ dateStr: '2026-09-05', start: '06:45', end: '15:00' }, { dateStr: '2026-09-06', start: '06:45', end: '15:00' }],
};

const SUBSTITUTE_ROLES = [...new Set(SUBSTITUTE_CANDIDATES.map(s => s.role))].map(r => ({ id: r, label: r }));
const SUBSTITUTE_CATEGORIES = [...new Set(SUBSTITUTE_CANDIDATES.map(s => s.category))].map(category => ({ id: category, label: category }));
const SUBSTITUTE_UNITS = [
  { id: 'medicinmottagningen', label: 'Medicinmottagningen' },
  { id: 'akutmottagningen', label: 'Akutmottagningen' },
  { id: 'hemtjansten', label: 'Hemtjänsten' },
  { id: 'vardavdelning-1', label: 'Vårdavdelning 1' },
];
const ALL_GROUPS: EmployeeGroup[] = [
  { id: 'alla',           label: 'Alla medarbetare',   category: 'team'       },
  { id: 'team1',          label: 'Team 1',             category: 'team'       },
  { id: 'team2',          label: 'Team 2',             category: 'team'       },
  { id: 'sjukskoterskor', label: 'Sjuksköterskor',     category: 'role'       },
  { id: 'underskotare',   label: 'Undersköterskor',    category: 'role'       },
  { id: 'lakare',         label: 'Läkare',             category: 'role'       },
  { id: 'medicin',        label: 'Medicinmottagningen', category: 'department' },
  { id: 'samverkanspass', label: 'Samverkanspass',     category: 'functional' },
];

const PASS_TYPES     = [{ id:'alla',label:'Alla pass'},{id:'morgan',label:'Morgonpass'},{id:'dag',label:'Dagpass'},{id:'kvall',label:'Kvällspass'},{id:'natt',label:'Nattpass'}];
const TIME_FLEXIBILITY = [
  { id: 0, label: 'Ingen avvikelse' },
  { id: 1, label: 'Upp till 1 timme kortare' },
  { id: 2, label: 'Upp till 2 timmar kortare' },
  { id: 3, label: 'Upp till 3 timmar kortare' },
];
const DEFAULT_ORDER_INVITES: ResourceOrderInvite[] = [
  { substituteId: 'sub3', name: 'Maria Svensson', role: 'Undersköterska', response: 'Tillgänglig', responseText: 'Jag kan ta passet.' },
  { substituteId: 'sub2', name: 'Erik Lindqvist', role: 'Sjuksköterska', response: 'Kan inte', responseText: 'Jag är redan bokad.' },
  { substituteId: 'sub7', name: 'Sara Lundberg', role: 'Undersköterska', response: 'Avvaktar' },
];
const TIME_PERIODS   = [{ id:'dag',label:'Dag'},{id:'arbetsvecka',label:'Arbetsvecka'},{id:'vecka',label:'Vecka'},{id:'sjuDagar',label:'Sju dagar'},{id:'femDagar',label:'Fem dagar'},{id:'manad',label:'Månad'},{id:'period',label:'Period'},{id:'ar',label:'År'}];
const SHIFT_DEFS: Record<ShiftType,{start:string;end:string}> = {
  morning:{start:'06:45',end:'15:00'}, day:{start:'08:00',end:'17:00'},
  evening:{start:'14:30',end:'22:30'}, night:{start:'22:00',end:'06:00'},
};
const PASS_TO_SHIFT: Record<string,ShiftType> = { morgan:'morning', dag:'day', kvall:'evening', natt:'night' };
const DAY_NAMES = ['Måndag','Tisdag','Onsdag','Torsdag','Fredag','Lördag','Söndag'];
const DAY_CHARS = ['M','T','O','T','F','L','S'];
const MTH_SHORT = ['Jan','Feb','Mar','Apr','Maj','Jun','Jul','Aug','Sep','Okt','Nov','Dec'];

const _pid0 = persons[0]?.id ?? '';
const _pid1 = persons[1]?.id ?? '';
const _pid2 = persons[2]?.id ?? '';
const _pid3 = persons[3]?.id ?? '';
const _pid4 = persons[4]?.id ?? '';
const _pid5 = persons[5]?.id ?? '';
const _pid6 = persons[6]?.id ?? '';
const _pid10 = persons[10]?.id ?? '';
const _pid12 = persons[12]?.id ?? '';
const _pid14 = persons[14]?.id ?? '';
const _pid16 = persons[16]?.id ?? '';
const _pid18 = persons[18]?.id ?? '';

const ABSENCE_SHIFTS: Record<string,Shift> = {
  [`${_pid0}|${TODAY_STR}`]: { type:'day',     start:'08:00', end:'17:00' },
  [`${_pid1}|${TODAY_STR}`]: { type:'day',     start:'08:00', end:'17:00' },
  [`${_pid1}|2026-09-04`]:   { type:'evening', start:'14:30', end:'22:30' },
  [`${_pid3}|${TODAY_STR}`]: { type:'day',     start:'08:00', end:'17:00' },
  [`${_pid2}|2026-09-05`]:   { type:'morning', start:'06:45', end:'15:00' },
  [`${_pid2}|2026-09-06`]:   { type:'morning', start:'06:45', end:'15:00' },
  [`${_pid2}|2026-09-07`]:   { type:'day',     start:'08:00', end:'17:00' },
  [`${_pid3}|2026-09-05`]:   { type:'night',   start:'22:00', end:'06:00' },
  [`${_pid3}|2026-09-07`]:   { type:'evening', start:'14:30', end:'22:30' },
  [`${_pid4}|${TODAY_STR}`]: { type:'morning', start:'06:45', end:'15:00' },
  [`${_pid5}|${TODAY_STR}`]: { type:'day',     start:'08:00', end:'17:00' },
  [`${_pid6}|${TODAY_STR}`]: { type:'day',     start:'08:00', end:'17:00' },
  [`${_pid4}|2026-09-06`]:   { type:'day',     start:'08:00', end:'17:00' },
  [`${_pid5}|2026-09-04`]:   { type:'night',   start:'22:00', end:'06:00' },
  [`${_pid5}|2026-09-06`]:   { type:'morning', start:'06:45', end:'15:00' },
  [`${_pid10}|2026-09-10`]:  { type:'day',     start:'08:00', end:'17:00' },
  [`${_pid12}|2026-09-11`]:  { type:'evening', start:'14:30', end:'22:30' },
  [`${_pid14}|2026-09-15`]:  { type:'morning', start:'06:45', end:'15:00' },
  [`${_pid16}|2026-09-17`]:  { type:'day',     start:'08:00', end:'17:00' },
  [`${_pid18}|2026-09-22`]:  { type:'night',   start:'22:00', end:'06:00' },
};

// Runtime-created absences are kept alongside the seeded examples so all existing
// schedule helpers (colour, vacancy handling and details) treat them as real absences.
const RUNTIME_ABSENCE_SHIFTS: Record<string, Shift> = { ...ABSENCE_SHIFTS };
const RUNTIME_ABSENCE_REASONS: Record<string, AbsenceReason> = {
  [`${_pid0}|${TODAY_STR}`]: 'Sjuk',
  [`${_pid1}|${TODAY_STR}`]: 'Sjuk',
  [`${_pid1}|2026-09-04`]: 'VAB',
  [`${_pid3}|${TODAY_STR}`]: 'VAB',
  [`${_pid2}|2026-09-05`]: 'Sjuk',
  [`${_pid4}|${TODAY_STR}`]: 'Semester',
  [`${_pid5}|${TODAY_STR}`]: 'Sjuk',
  [`${_pid6}|${TODAY_STR}`]: 'Sjuk',
  [`${_pid10}|2026-09-10`]: 'Sjuk',
  [`${_pid12}|2026-09-11`]: 'Sjuk',
  [`${_pid14}|2026-09-15`]: 'Sjuk',
  [`${_pid16}|2026-09-17`]: 'Sjuk',
  [`${_pid18}|2026-09-22`]: 'Sjuk',
};
function getAbsenceCaption(personId: string, dateStr: string): string | undefined {
  const key = `${personId}|${dateStr}`;
  if (!RUNTIME_ABSENCE_SHIFTS[key]) return undefined;
  const reason = RUNTIME_ABSENCE_REASONS[key];
  return `Frånvaro${reason ? ` · ${reason}` : ''}`;
}
const RUNTIME_SHIFT_OVERRIDES: Record<string, Shift> = {};

// Specific pass info text per shift cell ("Vak", "Bil", etc.)
const CLINIC_SHIFT_PASS_INFO: Record<string, string> = {
  [`${_pid0}|${TODAY_STR}`]: 'Vak',
  [`${_pid2}|2026-09-05`]:   'Bil',
  [`${_pid3}|2026-09-05`]:   'Vak',
  [`${_pid4}|${TODAY_STR}`]: 'Vak',
  [`${_pid5}|2026-09-06`]:   'Bil',
};

const SCHOOL_SHIFT_PASS_INFO: Record<string, string> = {
  [`${_pid0}|${TODAY_STR}`]: 'Morgonöppning',
  [`${_pid1}|${TODAY_STR}`]: 'Samling',
  [`${_pid2}|${TODAY_STR}`]: 'Utevistelse',
  [`${_pid3}|${TODAY_STR}`]: 'Måltider',
  [`${_pid4}|${TODAY_STR}`]: 'Hämtning och lämning',
};

// Akut: same day OR "Vak" task type
function isAkutShift(personId: string, dateStr: string, organisation: OrganisationScenario = 'clinic'): boolean {
  if (isSchoolScenario(organisation)) return false;
  if (dateStr === TODAY_STR) return true;
  return CLINIC_SHIFT_PASS_INFO[`${personId}|${dateStr}`] === 'Vak';
}

function getShiftPassInfo(personId: string, dateStr: string, organisation: OrganisationScenario = 'clinic'): string {
  const passInfo = isSchoolScenario(organisation) ? SCHOOL_SHIFT_PASS_INFO : CLINIC_SHIFT_PASS_INFO;
  return passInfo[`${personId}|${dateStr}`] ?? '';
}

const INITIAL_FILLS: ShiftFill[] = [];

// ─── Date utilities ───────────────────────────────────────────────────────────

function addDays(d: Date, n: number): Date { const r=new Date(d); r.setDate(r.getDate()+n); return r; }
function monWeekStart(d: Date): Date {
  const r=new Date(d), wd=r.getDay();
  r.setDate(r.getDate()+(wd===0?-6:1-wd)); r.setHours(0,0,0,0); return r;
}
function monthStart(d: Date): Date { return new Date(d.getFullYear(),d.getMonth(),1); }
function yearStart(d: Date):  Date { return new Date(d.getFullYear(),0,1); }
function daysInMonth(y: number, m: number): number { return new Date(y,m+1,0).getDate(); }
function isWknd(d: Date): boolean { const w=d.getDay(); return w===0||w===6; }
function dayIdx(d: Date): number  { return (d.getDay()+6)%7; }
function toDateStr(d: Date): string {
  const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), dd=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${dd}`;
}
function parseDate(s: string): Date { const [y,m,d]=s.split('-').map(Number); return new Date(y,m-1,d); }
function fmtMid(d: Date): string { return `${d.getDate()} ${MTH_SHORT[d.getMonth()]}`; }
function fmtLong(d: Date): string { return `${d.getDate()} ${MTH_SHORT[d.getMonth()]} ${d.getFullYear()}`; }
function fmtDay(d: Date):  string { return `${DAY_NAMES[dayIdx(d)]} ${d.getDate()} ${MTH_SHORT[d.getMonth()]} ${d.getFullYear()}`; }
function fmtShort(d: Date): string { return `${d.getDate()}/${d.getMonth()+1}`; }

// ─── View column helpers ──────────────────────────────────────────────────────

function getColumns(viewStart: Date, period: PeriodType): ViewColumn[] {
  if (period==='dag')
    return [{date:viewStart,header:DAY_NAMES[dayIdx(viewStart)],subHeader:fmtShort(viewStart),isWeekend:isWknd(viewStart)}];
  if (period==='arbetsvecka')
    return Array.from({length:5},(_,i)=>{ const d=addDays(viewStart,i); return {date:d,header:DAY_NAMES[dayIdx(d)],subHeader:fmtShort(d),isWeekend:false}; });
  if (period==='sjuDagar')
    return Array.from({length:7},(_,i)=>{ const d=addDays(viewStart,i); return {date:d,header:DAY_NAMES[dayIdx(d)],subHeader:fmtShort(d),isWeekend:isWknd(d)}; });
  if (period==='femDagar') {
    const dates: ViewColumn[] = [];
    for (let date = new Date(viewStart); dates.length < 5; date = addDays(date, 1)) {
      if (!isWknd(date)) dates.push({date,header:DAY_NAMES[dayIdx(date)],subHeader:fmtShort(date),isWeekend:false});
    }
    return dates;
  }
  if (period==='vecka'||period==='period')
    return Array.from({length:7},(_,i)=>{ const d=addDays(viewStart,i); return {date:d,header:DAY_NAMES[dayIdx(d)],subHeader:fmtShort(d),isWeekend:isWknd(d)}; });
  if (period==='manad') {
    const y=viewStart.getFullYear(), m=viewStart.getMonth();
    return Array.from({length:daysInMonth(y,m)},(_,i)=>{ const d=new Date(y,m,i+1); return {date:d,header:DAY_CHARS[dayIdx(d)],subHeader:`${i+1}`,isWeekend:isWknd(d)}; });
  }
  if (period==='ar') {
    const y=viewStart.getFullYear();
    return Array.from({length:12},(_,m)=>({date:new Date(y,m,1),header:MTH_SHORT[m]}));
  }
  return [];
}
function getPeriodDates(viewStart: Date, period: PeriodType, columns: ViewColumn[]): Date[] {
  if (period !== 'ar') return columns.map(column => column.date);
  const start = yearStart(viewStart);
  const nextYear = new Date(start.getFullYear() + 1, 0, 1);
  const dates: Date[] = [];
  for (let date = start; date < nextYear; date = addDays(date, 1)) dates.push(date);
  return dates;
}
function getViewType(period: PeriodType): ViewType {
  if (period==='ar') return 'year-columns';
  if (period==='manad') return 'month-columns';
  return 'day-columns';
}
function navStep(period: PeriodType, dir: 1|-1, from: Date): Date {
  if (period==='manad'){ const d=new Date(from); d.setMonth(d.getMonth()+dir); return monthStart(d); }
  if (period==='ar')   { const d=new Date(from); d.setFullYear(d.getFullYear()+dir); return yearStart(d); }
  if (period==='femDagar') {
    let next = addDays(from, dir);
    while (isWknd(next)) next = addDays(next, dir);
    return next;
  }
  if (period==='sjuDagar') return addDays(from, dir);
  const n: Record<PeriodType,number>={dag:1,arbetsvecka:7,vecka:7,period:7,manad:30,ar:365,sjuDagar:1,femDagar:1};
  return addDays(from, dir*n[period]);
}
function periodLabel(vs: Date, p: PeriodType): string {
  if (p==='dag')   return fmtDay(vs);
  if (p==='manad') return `${MTH_SHORT[vs.getMonth()]} ${vs.getFullYear()}`;
  if (p==='ar')    return `${vs.getFullYear()}`;
  const end=addDays(vs,p==='arbetsvecka'||p==='femDagar'?4:6);
  return `${fmtMid(vs)} – ${fmtLong(end)}`;
}
function initialPeriodStart(period: PeriodType, today: Date): Date {
  if (period==='manad') return monthStart(today);
  if (period==='ar') return yearStart(today);
  if (period==='sjuDagar') return addDays(today, -1);
  if (period==='femDagar') {
    const yesterday = addDays(today, -1);
    while (isWknd(yesterday)) yesterday.setDate(yesterday.getDate() + 1);
    return yesterday;
  }
  if (period==='dag') return new Date(today);
  return monWeekStart(today);
}

// ─── Shift generation ────────────────────────────────────────────────────────

function baseShift(personId: string, date: Date, passFilter: string): Shift|null {
  const cs=personId.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  const h=cs+date.getDate()*7+date.getMonth()*31;
  const wd=date.getDay();
  if ((wd===0||wd===6)&&h%5!==1) return null;
  if (wd!==0&&wd!==6&&h%10===3)  return null;
  const types: ShiftType[]=['morning','day','evening','night'];
  const t=types[h%types.length];
  if (passFilter!=='alla'&&t!==PASS_TO_SHIFT[passFilter]) return null;
  return {type:t,...SHIFT_DEFS[t]};
}
function getCellShift(personId: string, date: Date, passFilter: string): Shift|null {
  const key=`${personId}|${toDateStr(date)}`;
  if (RUNTIME_ABSENCE_SHIFTS[key]) {
    const vs=RUNTIME_ABSENCE_SHIFTS[key];
    if (passFilter!=='alla'&&vs.type!==PASS_TO_SHIFT[passFilter]) return null;
    return vs;
  }
  if (RUNTIME_SHIFT_OVERRIDES[key]) {
    const shift=RUNTIME_SHIFT_OVERRIDES[key];
    if (passFilter!=='alla'&&shift.type!==PASS_TO_SHIFT[passFilter]) return null;
    return shift;
  }
  return baseShift(personId, date, passFilter);
}
function monthShiftCount(personId: string, y: number, m: number, passFilter: string): number {
  let n=0;
  for (let i=1;i<=daysInMonth(y,m);i++) if (getCellShift(personId,new Date(y,m,i),passFilter)) n++;
  return n;
}
function heatCls(count: number, dim: number): string {
  const r=count/Math.max(1,Math.round(dim*5/7));
  if (r<=0)    return '';
  if (r<=0.25) return 'schema-heat-vlow';
  if (r<=0.5)  return 'schema-heat-low';
  if (r<=0.75) return 'schema-heat-mid';
  if (r<=0.9)  return 'schema-heat-high';
  return 'schema-heat-full';
}
function monthAbsenceCount(personId: string, y: number, m: number): number {
  const s=personId.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  const h=(s*7+m*31+y*13)%100;
  if (h<60) return 0;
  if (h<75) return 1+(h%3);
  if (h<90) return 4+(h%3);
  return 7+(h%5);
}
function isMonthPast(y: number, m: number): boolean {
  const t=new Date(TODAY_STR);
  return new Date(y,m,1)<new Date(t.getFullYear(),t.getMonth(),1);
}
function tenths(count: number, dim: number): number {
  return Math.round(Math.min(count/Math.max(1,dim),1)*10);
}
function getColorScheme(personId: string, dateStr: string, fills: ShiftFill[], vacancyKeys: string[]): ColorScheme {
  if (fills.some(f=>f.personId===personId&&f.dateStr===dateStr)) return 'filled';
  const key = `${personId}|${dateStr}`;
  if (vacancyKeys.includes(key)) return 'vacant';
  if (RUNTIME_ABSENCE_SHIFTS[key]) return 'absence';
  if (dateStr<TODAY_STR) return 'past';
  return 'normal';
}
function matchGroup(emp:{role:string;department:string;fmgGroup:string}, gid: string): boolean {
  const r=emp.role.toLowerCase(), dept=emp.department.toLowerCase(), grp=emp.fmgGroup.toLowerCase();
  if (gid==='alla')          return true;
  if (gid==='team1')         return grp.includes('team 1')||grp.includes('team1');
  if (gid==='team2')         return grp.includes('team 2')||grp.includes('team2');
  if (gid==='sjukskoterskor')return r.includes('sjukskötersk');
  if (gid==='underskotare')  return r.includes('underskötersk');
  if (gid==='lakare')        return r.includes('läkar')||r.includes('lakar');
  if (gid==='medicin')       return dept.includes('medicin');
  return false;
}

const ORGANISATION = {
  clinic: { id: 'medicinkliniken', label: 'Medicinkliniken' },
  departments: [
    { id: 'hjarta', label: 'Hjärtavdelningen' },
    { id: 'medicinmottagningen', label: 'Medicinmottagningen' },
  ],
};

const SCHOOL_ORGANISATION = {
  id: 'rektorsomrade', label: 'Rektorsområde Väster',
  preschools: [
    { id: 'solglantan', label: 'Förskolan Solgläntan', departments: ['Ekorren', 'Fjärilen'] },
    { id: 'skogsbrynet', label: 'Förskolan Skogsbrynet', departments: ['Myran', 'Kotten'] },
  ],
};

const ACTIVITIES_BY_ORGANISATION = {
  clinic: ['Patientmottagning', 'Omvårdnad'],
  school: ['Pedagogisk verksamhet', 'Måltider och utevistelse'],
};

const PRESCHOOL_ACTIVITY_TYPES: Record<ActivityKind, { label: string; className: string }> = {
  pedagogical: { label: 'Pedagogisk verksamhet', className: 'schema-activity-type-pedagogical' },
  outdoors: { label: 'Utevistelse', className: 'schema-activity-type-outdoors' },
  meals: { label: 'Måltider', className: 'schema-activity-type-meals' },
  rest: { label: 'Vila och återhämtning', className: 'schema-activity-type-rest' },
};
const PRESCHOOL_ACTIVITY_FILTERS: Array<{ id: ActivityFilterKind; label: string }> = [
  ...Object.entries(PRESCHOOL_ACTIVITY_TYPES).map(([id, type]) => ({ id: id as ActivityKind, label: type.label })),
  { id: 'absence', label: 'Frånvaro' },
];
const INITIAL_REMAINING_PASSES: RemainingPass[] = [
  {
    id: 'remaining-pass-fjarilen',
    dateStr: TODAY_STR,
    unitId: 'solglantan-avdelning-2',
    unit: 'Förskolan Solgläntan · Avdelning Fjärilen',
    shift: { type: 'day', start: '07:00', end: '15:30' },
    activities: [
      { id: 'remaining-pass-fjarilen-activity-1', employeeId: 'remaining-pass-fjarilen', dateStr: TODAY_STR, kind: 'pedagogical', label: PRESCHOOL_ACTIVITY_TYPES.pedagogical.label, start: '07:30', end: '11:30' },
      { id: 'remaining-pass-fjarilen-activity-2', employeeId: 'remaining-pass-fjarilen', dateStr: TODAY_STR, kind: 'outdoors', label: PRESCHOOL_ACTIVITY_TYPES.outdoors.label, start: '12:30', end: '15:30' },
    ],
  },
  {
    id: 'remaining-pass-myran',
    dateStr: TODAY_STR,
    unitId: 'skogsbrynet-avdelning-1',
    unit: 'Förskolan Skogsbrynet · Avdelning Myran',
    shift: { type: 'day', start: '08:00', end: '16:30' },
    activities: [
      { id: 'remaining-pass-myran-activity-1', employeeId: 'remaining-pass-myran', dateStr: TODAY_STR, kind: 'meals', label: PRESCHOOL_ACTIVITY_TYPES.meals.label, start: '11:30', end: '12:30' },
      { id: 'remaining-pass-myran-activity-2', employeeId: 'remaining-pass-myran', dateStr: TODAY_STR, kind: 'pedagogical', label: PRESCHOOL_ACTIVITY_TYPES.pedagogical.label, start: '13:00', end: '16:00' },
    ],
  },
];

function isSchoolScenario(organisation: OrganisationScenario): boolean {
  return organisation !== 'clinic';
}

function internalCandidateId(personId: string): string {
  return `employee:${personId}`;
}

function isSelfAvailablePreschoolEmployee(employeeIndex: number, date: Date): boolean {
  if (isWknd(date)) return false;
  const weekdayIndex = date.getDay() - 1;
  return employeeIndex % 5 === weekdayIndex;
}

function getPreschoolDayPattern(employeeIndex: number, date: Date): PreschoolDayPattern | null {
  if (isWknd(date) || isSelfAvailablePreschoolEmployee(employeeIndex, date)) return null;
  const templates: PreschoolDayPattern[] = [
    {
      shift: { type: 'day', start: '07:00', end: '16:30' },
      activities: [
        { kind: 'pedagogical', start: '07:00', end: '12:00' },
        { kind: 'outdoors', start: '12:00', end: '16:30' },
      ],
    },
    {
      shift: { type: 'day', start: '07:30', end: '17:00' },
      activities: [
        { kind: 'outdoors', start: '07:30', end: '12:30' },
        { kind: 'pedagogical', start: '12:30', end: '17:00' },
      ],
    },
    {
      shift: { type: 'day', start: '08:00', end: '16:30' },
      activities: [
        { kind: 'meals', start: '08:00', end: '12:30' },
        { kind: 'rest', start: '12:30', end: '16:30' },
      ],
    },
    {
      shift: { type: 'day', start: '07:00', end: '15:30' },
      activities: [
        { kind: 'pedagogical', start: '07:00', end: '15:30' },
      ],
    },
  ];
  return templates[(employeeIndex + date.getDate()) % templates.length];
}

function getPreschoolActivities(employeeId: string, employeeIndex: number, date: Date): ScheduleActivity[] {
  const pattern = getPreschoolDayPattern(employeeIndex, date);
  if (!pattern) return [];
  const dateStr = toDateStr(date);
  return pattern.activities.map((activity, index) => ({
    ...activity,
    id: `${employeeId}|${dateStr}|activity-${index + 1}`,
    employeeId,
    dateStr,
    label: PRESCHOOL_ACTIVITY_TYPES[activity.kind].label,
  }));
}

const CARE_ROLES = [
  'Sjuksköterska', 'Undersköterska', 'Läkare', 'Fysioterapeut', 'Vårdadministratör',
  'Sjuksköterska', 'Undersköterska', 'Läkare', 'Medicinsk sekreterare', 'Arbetsterapeut',
  'Sjuksköterska', 'Undersköterska', 'Läkare', 'Sjuksköterska', 'Vårdadministratör',
  'Sjuksköterska', 'Undersköterska', 'Läkare', 'Medicinsk sekreterare', 'Fysioterapeut',
];

const PRESCHOOL_ROLES = [
  'Förskollärare', 'Barnskötare', 'Barnskötare', 'Förskollärare', 'Barnskötare',
  'Förskollärare', 'Barnskötare', 'Barnskötare', 'Förskollärare', 'Barnskötare',
  'Förskollärare', 'Barnskötare', 'Barnskötare', 'Förskollärare', 'Barnskötare',
  'Förskollärare', 'Barnskötare', 'Barnskötare', 'Förskollärare', 'Barnskötare',
];

const ROLE_COMPETENCIES: Record<string, string[]> = {
  'Sjuksköterska': ['Läkemedel', 'HLR', 'Medicinsk omvårdnad'],
  'Undersköterska': ['Omvårdnad', 'Förflyttning', 'Demens'],
  'Läkare': ['Akut bedömning', 'Läkemedel', 'HLR'],
  'Fysioterapeut': ['Rehabilitering', 'Förflyttning', 'Fallprevention'],
  'Arbetsterapeut': ['Rehabilitering', 'Hjälpmedel', 'Aktivitetsbedömning'],
  'Vårdadministratör': ['Patientadministration', 'Journalsystem', 'Vårddokumentation'],
  'Medicinsk sekreterare': ['Patientadministration', 'Journalsystem', 'Medicinsk terminologi'],
};

function getEmployeeCompetencies(role: string): string[] {
  return ROLE_COMPETENCIES[role] ?? ['Grundkompetens'];
}

// A small, stable pool of employees used by the prototype to illustrate pool staffing.
const POOL_PERSON_INDICES = new Set([1, 6, 12, 17]);

function hasPoolDuty(personIndex: number, date: Date): boolean {
  if (!POOL_PERSON_INDICES.has(personIndex)) return false;
  return (date.getDate() + date.getMonth() + personIndex) % 3 !== 1;
}

// ─── Substitute availability ──────────────────────────────────────────────────

function genSubAvailability(subId: string, date: Date): SubAvailability|null {
  const h=subId.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  const dv=h+date.getDate()*17+date.getMonth()*31+(date.getDay()||7)*5;
  const wd=date.getDay();
  const isWkd=wd===0||wd===6;
  if (isWkd&&dv%5!==0) return null;
  if (!isWkd&&dv%7===3) return null;
  return {
    startH: 6+(dv%5),
    startM: (dv%4)*15,
    endH:   14+((dv*3)%9),
    endM:   ((dv*11)%4)*15,
  };
}
function substituteAvailabilityKey(subId: string, dateStr: string): string {
  return `${subId}|${dateStr}`;
}
function getSubAvailability(
  subId: string,
  date: Date,
  overrides: SubstituteAvailabilityOverrides = {},
  absences: SubstituteAbsences = {},
): SubAvailability | null {
  const key = substituteAvailabilityKey(subId, toDateStr(date));
  if (absences[key]) return null;
  if (Object.prototype.hasOwnProperty.call(overrides, key)) return overrides[key];
  return genSubAvailability(subId, date);
}
function normalizeFilterValues(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(item => typeof item === 'string' ? item : (item as { id?: unknown })?.id)
    .filter((item): item is string => typeof item === 'string');
}
function preserveStringArrayWhenUnchanged(current: string[], next: string[]): string[] {
  return current.length === next.length && current.every((value, index) => value === next[index]) ? current : next;
}
function isSubstituteBooked(subId: string, dateStr: string): boolean {
  return (SUB_BOOKED_SHIFTS[subId] ?? []).some(booking => booking.dateStr === dateStr);
}
function subAvailPct(avail: SubAvailability, shift: Shift): number {
  const [sH,sM]=shift.start.split(':').map(Number);
  const [eH,eM]=shift.end.split(':').map(Number);
  const shiftStart=sH*60+sM;
  const shiftEnd=(eH*60+eM) <= shiftStart ? eH*60+eM+1440 : eH*60+eM;
  const dur=shiftEnd-shiftStart;
  if (dur<=0) return 0;
  const aStart=avail.startH*60+avail.startM;
  const aEnd=(avail.endH*60+avail.endM) <= aStart ? avail.endH*60+avail.endM+1440 : avail.endH*60+avail.endM;
  return Math.round(Math.max(0,Math.min(aEnd,shiftEnd)-Math.max(aStart,shiftStart))/dur*100);
}
function subAvailabilityDurationPct(avail: SubAvailability): number {
  const start=avail.startH*60+avail.startM;
  const rawEnd=avail.endH*60+avail.endM;
  const end=rawEnd <= start ? rawEnd+1440 : rawEnd;
  return Math.round((end-start)/1440*100);
}
function getAvailableSubs(
  shift: Shift,
  date: Date,
  flexibilityHours = 1,
  overrides: SubstituteAvailabilityOverrides = {},
  absences: SubstituteAbsences = {},
  candidates: SubstituteCandidate[] = SUBSTITUTE_CANDIDATES,
): SubstituteCandidate[] {
  const [sH,sM]=shift.start.split(':').map(Number);
  const [eH,eM]=shift.end.split(':').map(Number);
  const shiftStart=sH*60+sM;
  const shiftEnd=(eH*60+eM) <= shiftStart ? eH*60+eM+1440 : eH*60+eM;
  const requiredMinutes=Math.max(0, shiftEnd-shiftStart-flexibilityHours*60);
  return candidates.filter(sub => {
    if (isSubstituteBooked(sub.id, toDateStr(date))) return false;
    const a=getSubAvailability(sub.id, date, overrides, absences);
    if (!a) return false;
    const availableStart=a.startH*60+a.startM;
    const availableEnd=a.endH*60+a.endM <= availableStart ? a.endH*60+a.endM+1440 : a.endH*60+a.endM;
    const overlap=Math.max(0, Math.min(availableEnd, shiftEnd)-Math.max(availableStart, shiftStart));
    return overlap >= requiredMinutes;
  });
}
function availPctCls(pct: number): string {
  const r=Math.max(0,Math.min(100,Math.round(pct/10)*10));
  return `schema-avail-pct-${r}`;
}
function fmtAvailTime(a: SubAvailability): string {
  const p=(n:number)=>String(n).padStart(2,'0');
  return `${p(a.startH)}:${p(a.startM)}–${p(a.endH)}:${p(a.endM)}`;
}

// Higher score = more suitable. Factors: availability overlap %, remaining ATL capacity, no conflict.
function suitabilityScore(
  subId: string,
  date: Date,
  shift: Shift,
  overrides: SubstituteAvailabilityOverrides = {},
  absences: SubstituteAbsences = {},
): number {
  const avail   = getSubAvailability(subId, date, overrides, absences);
  const pct     = avail ? subAvailPct(avail, shift) : 0;
  const details = SUB_DETAILS[subId];
  const atlCap  = details ? (details.maxAtlHours - details.atlHours) / details.maxAtlHours : 0;
  const booked  = (SUB_BOOKED_SHIFTS[subId] ?? []).some(b => b.dateStr === toDateStr(date));
  return pct + atlCap * 10 - (booked ? 200 : 0);
}

function candidateRankScore(candidate: SubstituteCandidate, date: Date, shift: Shift, overrides: SubstituteAvailabilityOverrides, absences: SubstituteAbsences): number {
  const costPreference = candidate.costLevel === 'Gratis' ? 12
    : candidate.costLevel === 'Kostnadsnivå 1' ? 8
      : candidate.costLevel === 'Kostnadsnivå 2' ? 4 : 0;
  return suitabilityScore(candidate.id, date, shift, overrides, absences) + costPreference;
}

// ─── Shift cell sub-components ────────────────────────────────────────────────

function ShiftDayCell({ shift, color, passInfo, isAkut, orderedBy, orderStatus, orderHandledBy, resourceNeedMode = false, resourceNeedCreatedBy, resourceNeedDisplayStatus, resourceNeedHandler, assignmentFailure }: { shift: Shift; color: ColorScheme; passInfo?: string; isAkut?: boolean; orderedBy?: string; orderStatus?: ResourceOrderStatus; orderHandledBy?: string; resourceNeedMode?: boolean; resourceNeedCreatedBy?: string; resourceNeedDisplayStatus?: string; resourceNeedHandler?: string; assignmentFailure?: string }) {
  const cap  = `schema-col-${color}-cap`;
  const main = `schema-col-${color}-main`;
  return (
    <div className="schema-shift">
      <div className="schema-timeline">
        {shift.type === 'night' ? (
          <>
            <div className={`schema-tl-bar schema-tl-pos-night-end   ${cap}`} />
            <div className={`schema-tl-bar schema-tl-pos-night-start ${main}`} />
          </>
        ) : (
          <>
            <div className={`schema-tl-bar schema-tl-pos-${shift.type}-cap  ${cap}`} />
            <div className={`schema-tl-bar schema-tl-pos-${shift.type}-main ${main}`} />
          </>
        )}
      </div>
      <div className="schema-shift-bottom">
        <span className="schema-shift-time">
          {shift.start}<span className="schema-shift-sep">–</span>{shift.end}
          {passInfo && <span className="schema-shift-info">{passInfo}</span>}
        </span>
        {isAkut && color === 'vacant' && (
          <span className="schema-akut-badge">Akut</span>
        )}
        {color === 'absence' && <span className="schema-absence-badge"><i className="fa-solid fa-user-clock" /> Frånvaro</span>}
        {color === 'vacant' && <span className="schema-vacancy-badge"><i className="fa-solid fa-user-plus" /> {resourceNeedMode ? 'Resursbehov' : 'Vakans'}</span>}
        {resourceNeedMode && resourceNeedCreatedBy && <span className="schema-resource-need-badge"><i className="fa-solid fa-user-clock" /> {resourceNeedDisplayStatus ?? 'Resursbehov'} · {resourceNeedHandler ?? resourceNeedCreatedBy}</span>}
        {orderedBy && <span className="schema-order-badge" title={resourceNeedMode ? `Beställning · ${orderStatus ?? 'Beställd'} · Hanteras av ${orderHandledBy ?? orderedBy}` : `Beställd av ${orderedBy}`}><i className="fa-solid fa-cart-shopping" /><span className="schema-order-badge-text">{resourceNeedMode ? `${orderStatus ?? 'Beställd'} · ${orderHandledBy ?? orderedBy}` : `Beställd av ${orderedBy}`}</span></span>}
        {assignmentFailure && <span className="schema-assignment-failure-badge" title={assignmentFailure}><i className="fa-solid fa-robot" /><i className="fa-solid fa-triangle-exclamation" /> Kunde inte tillsättas</span>}
      </div>
    </div>
  );
}

function ShiftMonthCell({ shift, color, passInfo, isAkut, orderedBy, orderStatus, orderHandledBy, resourceNeedMode = false, resourceNeedCreatedBy, resourceNeedDisplayStatus, resourceNeedHandler, assignmentFailure }: { shift: Shift; color: ColorScheme; passInfo?: string; isAkut?: boolean; orderedBy?: string; orderStatus?: ResourceOrderStatus; orderHandledBy?: string; resourceNeedMode?: boolean; resourceNeedCreatedBy?: string; resourceNeedDisplayStatus?: string; resourceNeedHandler?: string; assignmentFailure?: string }) {
  const cap  = `schema-col-${color}-cap`;
  const main = `schema-col-${color}-main`;
  const compactStatus: Record<string, string> = {
    'Under behandling': 'Påbörjat',
    'Förfrågan skickad': 'Frågad',
    'Besvarad': 'Svar',
    'Tillsatt': 'Bokad',
    'Borttaget': 'Borttaget',
  };
  const needStatusText = resourceNeedDisplayStatus ? compactStatus[resourceNeedDisplayStatus] ?? resourceNeedDisplayStatus : 'Öppet';
  const needHandlerTag = resourceNeedHandler?.split(/\s+/).map(part => part[0]).join('') ?? '';
  const orderStatusText = orderStatus ? compactStatus[orderStatus] ?? orderStatus : 'Beställd';
  const orderHandlerTag = orderHandledBy?.split(/\s+/).map(part => part[0]).join('') ?? '';
  return (
    <div className="schema-month-shift">
      <div className="schema-timeline">
        {shift.type === 'night' ? (
          <>
            <div className={`schema-tl-bar schema-tl-pos-night-end   ${cap}`} />
            <div className={`schema-tl-bar schema-tl-pos-night-start ${main}`} />
          </>
        ) : (
          <>
            <div className={`schema-tl-bar schema-tl-pos-${shift.type}-cap  ${cap}`} />
            <div className={`schema-tl-bar schema-tl-pos-${shift.type}-main ${main}`} />
          </>
        )}
      </div>
      <div className="schema-shift-bottom">
        <span className="schema-month-shift-time">
          {shift.start}–{shift.end}
          {passInfo && <span className="schema-shift-info schema-shift-info-month">{passInfo}</span>}
        </span>
        {isAkut && color === 'vacant' && (
          <span className="schema-akut-badge schema-akut-badge-month">Akut</span>
        )}
        {color === 'absence' && <span className="schema-absence-badge schema-absence-badge-month" title="Frånvaro"><i className="fa-solid fa-user-clock" /></span>}
        {color === 'vacant' && <span className="schema-vacancy-badge schema-vacancy-badge-month" title={resourceNeedMode ? 'Resursbehov' : 'Vakans'}><i className="fa-solid fa-user-plus" /></span>}
        {resourceNeedMode && resourceNeedCreatedBy && <span className="schema-resource-need-badge schema-resource-need-badge-month" title={`${resourceNeedDisplayStatus ?? 'Resursbehov'} · Hanteras av ${resourceNeedHandler ?? resourceNeedCreatedBy}`}><i className="fa-solid fa-user-clock" /><span>{needStatusText}{needHandlerTag ? ` · ${needHandlerTag}` : ''}</span></span>}
        {orderedBy && <span className="schema-order-badge schema-order-badge-month" title={resourceNeedMode ? `Beställning · ${orderStatus ?? 'Beställd'} · Hanteras av ${orderHandledBy ?? orderedBy}` : `Beställd av ${orderedBy}`}><i className="fa-solid fa-cart-shopping" /><span className="schema-order-badge-text">{resourceNeedMode ? `${orderStatusText}${orderHandlerTag ? ` · ${orderHandlerTag}` : ''}` : `Beställd av ${orderedBy}`}</span></span>}
        {assignmentFailure && <span className="schema-assignment-failure-badge schema-assignment-failure-badge-month" title={assignmentFailure}><i className="fa-solid fa-robot" /><i className="fa-solid fa-triangle-exclamation" /></span>}
      </div>
    </div>
  );
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function ActivityTimelineCell({ shift, activities, activityFills, availability, bookedAssignment, absenceLabel, vacancyLabel, statusLabel, assignedSubstituteName, isOrdered = false, isPast, onPassDragOver, onPassDrop }: {
  shift: Shift | null;
  activities: ScheduleActivity[];
  activityFills: Record<string, ActivityFill>;
  availability: SubAvailability | null;
  bookedAssignment?: { start: string; end: string; name: string };
  absenceLabel?: string;
  vacancyLabel?: string;
  statusLabel?: string;
  assignedSubstituteName?: string;
  isOrdered?: boolean;
  isPast: boolean;
  onPassDragOver: (event: React.DragEvent) => void;
  onPassDrop: (event: React.DragEvent, shift: Shift) => void;
}) {
  const segmentStyle = (start: string, end: string): React.CSSProperties => ({
    left: `${timeToMinutes(start) / 1440 * 100}%`,
    width: `${Math.max(0, (timeToMinutes(end) - timeToMinutes(start)) / 1440 * 100)}%`,
  });
  const availabilityStart = availability ? `${String(availability.startH).padStart(2, '0')}:${String(availability.startM).padStart(2, '0')}` : '';
  const availabilityEnd = availability ? `${String(availability.endH).padStart(2, '0')}:${String(availability.endM).padStart(2, '0')}` : '';
  const totalTime = shift ? `${shift.start}–${shift.end}`
    : bookedAssignment ? `${bookedAssignment.start}–${bookedAssignment.end}`
      : availability ? fmtAvailTime(availability) : '';
  const statusCaption = statusLabel ?? absenceLabel ?? vacancyLabel;
  return (
    <div className={`schema-activity-timeline${isPast ? ' schema-activity-timeline-past' : ''}`} aria-label={`Schema ${totalTime}`}>
      {totalTime && <span className="schema-activity-total-time">{totalTime}</span>}
      <div className="schema-activity-lanes">
      {shift && <div
          aria-hidden="true"
          className="schema-activity-pass-window"
          style={segmentStyle(shift.start, shift.end)}
          onDragOver={onPassDragOver}
          onDrop={event => onPassDrop(event, shift)}
        />}
      {activities.map(activity => {
        const presentation = PRESCHOOL_ACTIVITY_TYPES[activity.kind];
        const assignment = activityFills[activity.id];
        const assignedName = assignment?.substituteName ?? assignedSubstituteName;
        return (
          <div className="schema-activity-row" key={activity.id}>
            <div
              role="img"
              className={`schema-activity-bar ${presentation.className}${isOrdered && !assignedName ? ' schema-activity-bar-ordered' : absenceLabel ? ' schema-activity-bar-absence' : vacancyLabel && !assignedName ? ' schema-activity-bar-vacant' : ''}${assignedName ? ' schema-activity-bar-filled' : ''}`}
              style={segmentStyle(activity.start, activity.end)}
              aria-label={`${activity.label}, ${activity.start} till ${activity.end}${assignedName ? `, vikarie ${assignedName}` : ''}`}
              title={`${activity.label} · ${activity.start}–${activity.end}${assignedName ? ` · Tillsatt med ${assignedName}` : ''}`}
            >
              <span>{activity.label.slice(0, 3)}</span>
              {assignedName && <i className="fa-solid fa-check schema-activity-assignment-check" aria-hidden="true" />}
            </div>
          </div>
        );
      })}
      {bookedAssignment && !shift && <div className="schema-activity-row">
        <span
          className="schema-activity-booked-window"
          style={segmentStyle(bookedAssignment.start, bookedAssignment.end)}
          title={`Bokad som vikarie för ${bookedAssignment.name}, ${bookedAssignment.start}–${bookedAssignment.end}`}
        />
      </div>}
      {availability && !shift && !bookedAssignment && <div className="schema-activity-row">
        <span
          className="schema-activity-availability-window"
          style={segmentStyle(availabilityStart, availabilityEnd)}
          title={fmtAvailTime(availability)}
        />
      </div>}
      {!shift && !bookedAssignment && !availability && <div className="schema-activity-row" aria-hidden="true" />}
      </div>
      {statusCaption && <span className={`schema-activity-absence-caption${vacancyLabel ? ' schema-activity-vacancy-caption' : ''}`}>{statusCaption}</span>}
    </div>
  );
}

// ─── Substitute panel ─────────────────────────────────────────────────────────

interface SubstitutePanelProps {
  isOpen: boolean;
  browseAll: boolean;
  state: SubPanelState | null;
  candidates: SubstituteCandidate[];
  singleAssignment?: boolean;
  bookingsByCandidate?: Record<string, SubBookedShift[]>;
  columns: ViewColumn[];
  viewType: ViewType;
  viewColumnWidth?: number;
  onClose: () => void;
  onSendRequest: (selectedIds: string[]) => void;
  onOpenDetails: (substituteId: string, dateStr: string) => void;
  onSetAvailability: (substituteId: string, dateStr: string, availability: SubAvailability | null) => void;
  onRestoreAvailability: (substituteId: string, dateStr: string) => void;
  onReportSick: (substituteId: string, dateStr: string) => void;
  onClearSickness: (substituteId: string, dateStr: string) => void;
  availabilityOverrides: SubstituteAvailabilityOverrides;
  absences: SubstituteAbsences;
  onDragStart: (e: React.DragEvent, subId: string) => void;
  scrollRef: React.RefObject<HTMLDivElement>;
  tableWidth: number;
  tableInset: number;
}

function SubstitutePanel({
  isOpen, browseAll, state, candidates, singleAssignment = false, bookingsByCandidate = SUB_BOOKED_SHIFTS, columns, viewType, viewColumnWidth: viewColumnWidthOverride,
  onClose, onSendRequest, onOpenDetails, onSetAvailability, onRestoreAvailability, onReportSick, onClearSickness,
  availabilityOverrides, absences,
  onDragStart, scrollRef, tableWidth, tableInset,
}: SubstitutePanelProps) {
  const [filterRoles, setFilterRoles] = useState<string[]>([]);
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [categoryFilterOpen, setCategoryFilterOpen] = useState(false);
  const categoryFilterRef = useRef<HTMLDivElement>(null);
  const [filterCompetencies, setFilterCompetencies] = useState<string[]>([]);
  const [filterPass,  setFilterPass]  = useState('alla');
  const [timeFlexibility, setTimeFlexibility] = useState(1);
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);
  const [selectedSubIds, setSelectedSubIds] = useState<string[]>([]);
  const [contextTarget, setContextTarget] = useState<SubstituteContextTarget | null>(null);
  const [contextActions, setContextActions] = useState<SubstituteContextAction[]>([]);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!contextMenuPosition) return;
    const closeMenu = () => setContextMenuPosition(null);
    document.addEventListener('mousedown', closeMenu);
    window.addEventListener('scroll', closeMenu, true);
    return () => {
      document.removeEventListener('mousedown', closeMenu);
      window.removeEventListener('scroll', closeMenu, true);
    };
  }, [contextMenuPosition]);

  useEffect(() => {
    setFilterRoles([]);
    setFilterCategories([]);
    setCategoryFilterOpen(false);
    setFilterCompetencies([]);
    setFilterPass('alla');
    setTimeFlexibility(1);
    setSelectedSubIds([]);
    setExpandedSubId(null);
  }, [browseAll, state?.dateStr, state?.personId, state?.targetActivityId, state?.targetType]);

  useEffect(() => {
    if (!categoryFilterOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!categoryFilterRef.current?.contains(event.target as Node)) setCategoryFilterOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [categoryFilterOpen]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedSubId(prev => prev === id ? null : id);
  }, []);

  const browseShift: Shift | null = useMemo(() => {
    if (filterPass === 'alla') return browseAll ? null : state?.shift ?? null;
    const t = PASS_TO_SHIFT[filterPass];
    return { type: t, ...SHIFT_DEFS[t] };
  }, [browseAll, filterPass, state?.shift]);
  const candidateRoles = useMemo(() => [...new Set(candidates.map(candidate => candidate.role))]
    .sort((a, b) => a.localeCompare(b, 'sv'))
    .map(role => ({ id: role, label: role })), [candidates]);
  const candidateCategories = useMemo(() => [...new Set(candidates.map(candidate => candidate.category))]
    .sort((a, b) => a.localeCompare(b, 'sv'))
    .map(category => ({ id: category, label: category })), [candidates]);
  const candidateCompetencies = useMemo(() => [...new Set(candidates.flatMap(candidate => candidate.competencies ?? SUB_DETAILS[candidate.id]?.competencies ?? []))]
    .sort((a, b) => a.localeCompare(b, 'sv'))
    .map(competency => ({ id: competency, label: competency })), [candidates]);

  const availSubs = useMemo(() => {
    const matchesFilters = (sub: SubstituteCandidate) => {
      if (filterRoles.length > 0 && !filterRoles.includes(sub.role)) return false;
      if (filterCategories.length > 0 && !filterCategories.includes(sub.category)) return false;
      if (filterCompetencies.length > 0) {
        const competencies = sub.competencies ?? SUB_DETAILS[sub.id]?.competencies ?? [];
        if (!filterCompetencies.some(competency => competencies.includes(competency))) return false;
      }
      return true;
    };
    let list: SubstituteCandidate[];
    if (browseAll) {
      list = candidates.filter(sub => {
        if (!matchesFilters(sub)) return false;
        if (singleAssignment && sub.category === 'Tillgänglig medarbetare' && !browseShift) {
          const hasSelfAvailability = columns.some(column => {
            const dateStr = toDateStr(column.date);
            if ((bookingsByCandidate[sub.id] ?? []).some(booking => booking.dateStr === dateStr)) return false;
            return Boolean(getSubAvailability(sub.id, column.date, availabilityOverrides, absences));
          });
          if (!hasSelfAvailability) return false;
        }
        if (browseShift) {
          const hasMatchingAvailability = columns.some(column => {
            const dateStr = toDateStr(column.date);
            if ((bookingsByCandidate[sub.id] ?? []).some(booking => booking.dateStr === dateStr)) return false;
            const avail = getSubAvailability(sub.id, column.date, availabilityOverrides, absences);
            return Boolean(avail && subAvailPct(avail, browseShift) > 0);
          });
          if (!hasMatchingAvailability) return false;
        }
        return true;
      });
      if (browseShift) {
        list = [...list].sort((a, b) => {
          const bestScore = (candidate: SubstituteCandidate) => Math.max(...columns.map(column =>
            candidateRankScore(candidate, column.date, browseShift, availabilityOverrides, absences)
          ));
          return bestScore(b) - bestScore(a);
        });
      } else {
        list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'sv'));
      }
    } else {
      list = state && browseShift
        ? getAvailableSubs(browseShift, parseDate(state.dateStr), state.targetType === 'activity' ? 0 : timeFlexibility, availabilityOverrides, absences, candidates).filter(matchesFilters)
        : [];
      if (state && browseShift) {
        const date = parseDate(state.dateStr);
        list = [...list].sort((a, b) =>
          candidateRankScore(b, date, browseShift, availabilityOverrides, absences)
          - candidateRankScore(a, date, browseShift, availabilityOverrides, absences)
        );
      }
    }
    return list;
  }, [absences, availabilityOverrides, bookingsByCandidate, browseAll, candidates, filterRoles, filterCategories, filterCompetencies, browseShift, columns, singleAssignment, state, timeFlexibility]);

  const panelClass = `schema-sub-panel${isOpen ? ' schema-sub-panel-open' : ''}${singleAssignment ? ' schema-sub-panel-single-assignment' : ''}`;
  const fillLabel = 'Vikarier';
  const viewColumnWidth = viewColumnWidthOverride ?? VIEW_COLUMN_WIDTH[viewType];
  const tableMinWidth = EMPLOYEE_COLUMN_WIDTH + viewColumnWidth * columns.length;

  useEffect(() => {
    const visibleIds = new Set(availSubs.map(substitute => substitute.id));
    setSelectedSubIds(current => current.filter(id => visibleIds.has(id)));
  }, [availSubs]);

  const defaultContextDate = state?.dateStr
    ?? toDateStr(columns.find(column => toDateStr(column.date) >= TODAY_STR)?.date ?? columns[0]?.date ?? new Date(TODAY_STR));

  const openPersonContext = useCallback((event: React.MouseEvent, substituteId: string) => {
    event.preventDefault();
    event.stopPropagation();
    const dateStr = defaultContextDate;
    const key = substituteAvailabilityKey(substituteId, dateStr);
    setContextTarget({ substituteId, dateStr });
    setContextActions([
      { id: 'show-details', text: 'Visa vikarieuppgifter', icon: 'id-card' },
      { id: 'edit-availability', text: 'Ändra tillgänglighet', icon: 'clock', beginGroup: true },
      absences[key]
        ? { id: 'clear-sickness', text: 'Ta bort sjukanmälan', icon: 'calendar-check' }
        : { id: 'report-sick', text: 'Sjukanmäl', icon: 'calendar-xmark' },
      { id: 'send-request', text: 'Skicka förfrågan', icon: 'paper-plane', beginGroup: true },
    ]);
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
  }, [absences, defaultContextDate]);

  const openAvailabilityContext = useCallback((event: React.MouseEvent, substituteId: string, dateStr: string, isPast: boolean, isBooked: boolean) => {
    event.preventDefault();
    event.stopPropagation();
    const key = substituteAvailabilityKey(substituteId, dateStr);
    const hasOverride = Object.prototype.hasOwnProperty.call(availabilityOverrides, key);
    const isAbsent = Boolean(absences[key]);
    const actions: SubstituteContextAction[] = [
      { id: 'show-details', text: 'Visa vikarieuppgifter', icon: 'id-card' },
    ];
    if (!isPast) {
      if (!isBooked && !isAbsent) {
        actions.push({ id: 'edit-availability', text: 'Ändra tillgänglighet', icon: 'clock', beginGroup: true });
        actions.push({ id: 'mark-unavailable', text: 'Markera ej tillgänglig', icon: 'ban' });
        if (hasOverride) actions.push({ id: 'restore-availability', text: 'Återställ till grundtillgänglighet', icon: 'rotate-left' });
      }
      actions.push(isAbsent
        ? { id: 'clear-sickness', text: 'Ta bort sjukanmälan', icon: 'calendar-check', beginGroup: true }
        : { id: 'report-sick', text: 'Sjukanmäl', icon: 'calendar-xmark', beginGroup: true });
    }
    setContextTarget({ substituteId, dateStr });
    setContextActions(actions);
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
  }, [absences, availabilityOverrides]);

  const handleContextAction = useCallback((event: { itemData?: SubstituteContextAction }) => {
    if (!contextTarget || !event.itemData) return;
    setContextMenuPosition(null);
    const { substituteId, dateStr } = contextTarget;
    switch (event.itemData.id) {
      case 'show-details':
      case 'edit-availability': onOpenDetails(substituteId, dateStr); break;
      case 'mark-unavailable': onSetAvailability(substituteId, dateStr, null); break;
      case 'restore-availability': onRestoreAvailability(substituteId, dateStr); break;
      case 'report-sick': onReportSick(substituteId, dateStr); break;
      case 'clear-sickness': onClearSickness(substituteId, dateStr); break;
      case 'send-request': onSendRequest([substituteId]); break;
    }
  }, [contextTarget, onClearSickness, onOpenDetails, onReportSick, onRestoreAvailability, onSendRequest, onSetAvailability]);

  return (
    <div className={panelClass} role="region" aria-label={fillLabel}>
      {/* Header */}
      <div className="schema-sub-panel-header">
        <i className="fa-solid fa-users" />
        <span className="schema-sub-panel-title">{fillLabel}</span>
        {!browseAll && state && (
          <span className="schema-sub-panel-context">
            {state.targetPersonName}
            <span className="schema-sub-panel-context-sep"> · </span>
            {state.targetActivityLabel && <>{state.targetActivityLabel}<span className="schema-sub-panel-context-sep"> · </span></>}
            {state.dateStr}
            <span className="schema-sub-panel-context-sep"> · </span>
            {state.shift.start}–{state.shift.end}
          </span>
        )}
        <div className="schema-sub-panel-spacer" />
        <button className="schema-sub-panel-close" onClick={onClose} title="Stäng">
          <i className="fa-solid fa-xmark" />
        </button>
      </div>

      {/* Actions and filters */}
      <div className="schema-sub-send-bar">
        <button
          className="btn-primary schema-sub-send-btn"
          disabled={selectedSubIds.length === 0 || (singleAssignment && !state)}
          onClick={() => onSendRequest(selectedSubIds)}
        >
          <i className="fa-solid fa-paper-plane" />
          {singleAssignment ? state ? 'Välj vikarie' : 'Dra vikarie till pass' : 'Skicka förfrågan'}
        </button>
        <div className="schema-sub-filter-fields">
          <TagBox
            dataSource={candidateRoles}
            displayExpr="label"
            valueExpr="id"
            value={filterRoles}
            onValueChanged={e => setFilterRoles(current => preserveStringArrayWhenUnchanged(current, normalizeFilterValues(e.value)))}
            placeholder="Alla roller..."
            showSelectionControls={true}
            showClearButton={true}
            applyValueMode="instantly"
            multiline={false}
            stylingMode="outlined"
            width={210}
          />
          <div ref={categoryFilterRef} className={`schema-sub-category-filter${categoryFilterOpen ? ' schema-sub-category-filter-open' : ''}`}>
            <label>Vikariekategori</label>
            <button type="button" className="schema-sub-category-filter-button" aria-label="Välj vikariekategorier" aria-expanded={categoryFilterOpen} onClick={() => setCategoryFilterOpen(open => !open)}>
              <span>{filterCategories.length === 0 ? 'Alla kategorier' : `${filterCategories.length} valda`}</span>
              <i className={`fa-solid fa-chevron-${categoryFilterOpen ? 'up' : 'down'}`} aria-hidden="true" />
            </button>
            {categoryFilterOpen && <div className="schema-sub-category-filter-list" role="group" aria-label="Vikariekategorier">
              {candidateCategories.map(category => <label key={category.id}>
                <input
                  type="checkbox"
                  checked={filterCategories.includes(category.id)}
                  onChange={() => setFilterCategories(current => current.includes(category.id)
                    ? current.filter(value => value !== category.id)
                    : [...current, category.id])}
                />
                <span>{category.label}</span>
              </label>)}
              {filterCategories.length > 0 && <button type="button" className="schema-sub-category-filter-clear" onClick={() => setFilterCategories([])}>Rensa kategorier</button>}
            </div>}
            {filterCategories.length > 0 && <span className="schema-sub-category-filter-count">Visar {availSubs.length} vikarier</span>}
          </div>
          <SelectBox
            dataSource={PASS_TYPES}
            displayExpr="label"
            valueExpr="id"
            value={filterPass}
            onValueChanged={e => setFilterPass(e.value ?? 'alla')}
            showClearButton={false}
            width={145}
            stylingMode="outlined"
          />
          <TagBox
            dataSource={candidateCompetencies}
            displayExpr="label"
            valueExpr="id"
            value={filterCompetencies}
            onValueChanged={e => setFilterCompetencies(current => preserveStringArrayWhenUnchanged(current, normalizeFilterValues(e.value)))}
            placeholder="Alla kompetenser..."
            showSelectionControls={true}
            showClearButton={true}
            applyValueMode="instantly"
            multiline={false}
            stylingMode="outlined"
            width={230}
          />
          {!browseAll && state && state.targetType !== 'activity' && (
            <SelectBox
              dataSource={TIME_FLEXIBILITY}
              displayExpr="label"
              valueExpr="id"
              value={timeFlexibility}
              onValueChanged={e => setTimeFlexibility(Number(e.value ?? 1))}
              width={205}
              stylingMode="outlined"
            />
          )}
          {(filterRoles.length > 0 || filterCategories.length > 0 || filterCompetencies.length > 0 || filterPass !== 'alla' || timeFlexibility !== 1) && (
            <button type="button" className="btn-secondary schema-sub-filter-reset" onClick={() => {
              setFilterRoles([]);
              setFilterCategories([]);
              setFilterCompetencies([]);
              setFilterPass('alla');
              setTimeFlexibility(1);
            }}><i className="fa-solid fa-rotate-left" /> Rensa filter</button>
          )}
        </div>
        <span className="schema-sub-send-hint">{singleAssignment ? state ? 'Välj en vikarie för det markerade passet eller aktiviteten' : 'Dra en vikarie till ett pass i schemat' : 'Markera vikarier i listan nedan'}</span>
      </div>

      {/* Scrollable table — synced with main schedule */}
      <div ref={scrollRef} className="schema-sub-panel-body" style={tableInset ? { paddingLeft: tableInset } : undefined}>
        <table
          className="schema-table schema-sub-table"
          style={{ width: tableWidth || '100%', minWidth: tableMinWidth }}
        >
          <colgroup>
            <col style={{ width: EMPLOYEE_COLUMN_WIDTH }} />
            {columns.map((_, index) => <col key={index} style={{ width: viewColumnWidth }} />)}
          </colgroup>
          <thead>
            <tr>
              <th className="schema-employee-header schema-sub-sticky-col schema-sub-th-select">
                {!singleAssignment && (() => {
                  return (
                    <input
                      type="checkbox"
                      className="schema-sub-all-checkbox"
                      aria-label="Markera alla vikarier"
                      checked={availSubs.length > 0 && availSubs.every(substitute => selectedSubIds.includes(substitute.id))}
                      onChange={e => {
                        const checked = e.currentTarget.checked;
                        setSelectedSubIds(checked ? availSubs.map(substitute => substitute.id) : []);
                      }}
                    />
                  );
                })()}
                <span>
                  Vikarie
                  {availSubs.length > 0 && (
                    <span className="schema-sub-count"> ({availSubs.length})</span>
                  )}
                </span>
              </th>
              {columns.map((col, i) => {
                const ds = toDateStr(col.date);
                const isTarget = !browseAll && state && ds === state.dateStr;
                return (
                  <th key={i} className={[
                    'schema-header-cell',
                    viewType==='month-columns' ? 'schema-month-col-header' :
                    viewType==='year-columns'  ? 'schema-year-col-header'  : 'schema-day-header',
                    col.isWeekend ? 'schema-weekend-header' : '',
                    ds===TODAY_STR ? 'schema-today-header' : '',
                    isTarget ? 'schema-sub-target-header' : '',
                    ds < TODAY_STR ? 'schema-past-header' : '',
                  ].filter(Boolean).join(' ')}>
                    <span className="schema-col-main">{col.header}</span>
                    {col.subHeader && <span className="schema-col-sub">{col.subHeader}</span>}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {availSubs.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="schema-empty-state">
                  {browseAll
                    ? 'Inga vikarier matchade filtret.'
                    : 'Inga tillgängliga vikarier hittades för det aktuella passet.'}
                </td>
              </tr>
            ) : (
              availSubs.map(sub => {
                const isExpanded   = expandedSubId === sub.id;
                const sourceDetails = SUB_DETAILS[sub.id];
                const details = sourceDetails
                  ? { ...sourceDetails, competencies: sub.competencies ?? sourceDetails.competencies }
                  : undefined;
                const competencies = sub.competencies ?? sourceDetails?.competencies ?? [];
                const atlPct       = details ? Math.round(details.atlHours / details.maxAtlHours * 100) : 0;
                const bookedShifts = bookingsByCandidate[sub.id] ?? [];

                return (
                  <React.Fragment key={sub.id}>
                    <tr
                      className={[
                        'schema-sub-row',
                        isExpanded ? 'schema-sub-row-open' : '',
                      ].filter(Boolean).join(' ')}
                      draggable={true}
                      onDragStart={e => onDragStart(e, sub.id)}
                    >
                      <td
                        className={['schema-employee-cell', 'schema-sub-sticky-col', 'schema-sub-person-context', isExpanded ? 'schema-sub-sticky-expanded' : ''].filter(Boolean).join(' ')}
                        data-substitute-id={sub.id}
                        onContextMenu={event => openPersonContext(event, sub.id)}
                        onDoubleClick={() => onOpenDetails(sub.id, defaultContextDate)}
                      >
                        <div className="schema-sub-name-cell">
                          <input
                            type={singleAssignment ? 'radio' : 'checkbox'}
                            name={singleAssignment ? 'schema-sub-single-assignment' : undefined}
                            data-sub-id={sub.id}
                            className="schema-sub-checkbox"
                            aria-label={`Välj ${sub.name}`}
                            checked={selectedSubIds.includes(sub.id)}
                            onChange={() => setSelectedSubIds(current => singleAssignment
                              ? [sub.id]
                              : current.includes(sub.id) ? current.filter(id => id !== sub.id) : [...current, sub.id])}
                          />
                          <button
                            className="schema-sub-chevron"
                            onClick={() => toggleExpand(sub.id)}
                            title={isExpanded ? 'Dölj detaljer' : 'Visa detaljer'}
                          >
                            <i className={`fa-solid fa-chevron-${isExpanded ? 'down' : 'right'}`} />
                          </button>
                          <div className="schema-sub-name-block">
                           <span className="schema-employee-name">
                             {sub.category === 'Samverkanspass' && <i className="schema-pool-dot" title="Samverkanspass" />}
                             {sub.name}
                           </span>
                           <span className="schema-employee-role">{sub.role}</span>
                           <span className="schema-sub-category-cost">
                             <span className="schema-sub-category-badge">{sub.category}</span>
                             <span className={`schema-sub-cost-badge${sub.costLevel === 'Gratis' ? ' schema-sub-cost-free' : ''}`}>{sub.costLevel}</span>
                           </span>
                          </div>
                        </div>
                      </td>
                      {columns.map((col, ci) => {
                        const ds       = toDateStr(col.date);
                        const isPast   = ds < TODAY_STR;
                        const booked   = bookedShifts.find(b => b.dateStr === ds);
                        const availabilityKey = substituteAvailabilityKey(sub.id, ds);
                        const absenceReason = absences[availabilityKey];
                        const avail    = !booked && !absenceReason
                          ? getSubAvailability(sub.id, col.date, availabilityOverrides, absences)
                          : null;
                        const isTarget = !browseAll && state && ds === state.dateStr;

                        // 24 h proportional bar helpers
                        const bar24 = (startH: number, startM: number, endH: number, endM: number, cls: string) => {
                          const startMinutes = startH * 60 + startM;
                          const endMinutes = endH * 60 + endM;
                          const left  = startMinutes / 1440 * 100;
                          const crossesMidnight = endMinutes <= startMinutes;
                          const width = (endMinutes - startMinutes) / 1440 * 100;
                          return (
                            <div className="schema-sub-bar24-wrap">
                              {crossesMidnight ? <>
                                <div className={`schema-sub-bar24-fill ${cls}`} style={{ left: `${left}%`, width: `${100-left}%` }} />
                                <div className={`schema-sub-bar24-fill ${cls}`} style={{ left: 0, width: `${Math.max(endMinutes/1440*100, 1)}%` }} />
                              </> : <div className={`schema-sub-bar24-fill ${cls}`} style={{ left: `${left}%`, width: `${Math.max(width, 1)}%` }} />}
                            </div>
                          );
                        };

                        return (
                          <td key={ci} className={[
                            'schema-sub-avail-cell',
                            booked ? 'schema-sub-booked-cell' : '',
                            viewType==='month-columns' ? 'schema-month-col-cell' :
                            viewType==='year-columns'  ? 'schema-year-col-cell'  : 'schema-day-cell',
                            col.isWeekend ? 'schema-weekend-cell' : '',
                            isTarget ? 'schema-sub-target-col' : '',
                            isPast ? 'schema-sub-past-cell' : '',
                            absenceReason ? 'schema-sub-sick-cell' : '',
                            'schema-sub-availability-context',
                          ].filter(Boolean).join(' ')}>
                            <div
                              className="schema-sub-availability-hitarea"
                              data-substitute-id={sub.id}
                              data-date-str={ds}
                              onContextMenu={event => openAvailabilityContext(event, sub.id, ds, isPast, Boolean(booked))}
                              onDoubleClick={() => onOpenDetails(sub.id, ds)}
                            >
                            {absenceReason ? (
                              <span className="schema-sub-sick-label"><i className="fa-solid fa-calendar-xmark" /> {absenceReason}</span>
                            ) : booked ? (
                              <>
                                {viewType !== 'year-columns' && (() => {
                                  const [bsH, bsM] = booked.start.split(':').map(Number);
                                  const [beH, beM] = booked.end.split(':').map(Number);
                                  return bar24(bsH, bsM, beH, beM, 'schema-sub-bar24-booked');
                                })()}
                                {viewType === 'day-columns' && (
                                  <span className="schema-sub-booked-time">{booked.start}–{booked.end}</span>
                                )}
                              </>
                            ) : avail ? (
                              viewType === 'year-columns' ? (
                                <span className={`schema-sub-avail-time${isPast ? ' schema-sub-avail-time-past' : ''}`}>
                                  {subAvailabilityDurationPct(avail)}%
                                </span>
                              ) : (
                                <>
                                  {bar24(avail.startH, avail.startM, avail.endH, avail.endM, isPast ? 'schema-sub-bar24-past' : sub.category === 'Tillgänglig medarbetare' ? 'schema-sub-bar24-self-avail' : 'schema-sub-bar24-avail')}
                                  {viewType === 'day-columns' && (
                                    <span className={`schema-sub-avail-time${isPast ? ' schema-sub-avail-time-past' : ''}`}>
                                      {fmtAvailTime(avail)}
                                    </span>
                                  )}
                                </>
                              )
                            ) : (
                              <span className="schema-sub-avail-empty">Ej tillgänglig</span>
                            )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Expanded detail panel */}
                    {isExpanded && (
                      <tr className="schema-sub-expand-row">
                        <td colSpan={columns.length + 1} className="schema-sub-expand-cell">
                          <div className="schema-sub-expand-content">
                            {/* ATL hours */}
                            {details && (
                              <div className="schema-sub-expand-section">
                                <span className="schema-sub-expand-label">ATL-timmar</span>
                                <div className="schema-sub-atl-wrap">
                                  <div className="schema-sub-atl-track">
                                    <div
                                      className="schema-sub-atl-fill"
                                      style={{ width: `${atlPct}%` }}
                                    />
                                  </div>
                                  <span className="schema-sub-atl-count">{details.atlHours}/{details.maxAtlHours} h</span>
                                </div>
                              </div>
                            )}

                            {/* Competencies */}
                            {competencies.length > 0 && (
                              <div className="schema-sub-expand-section">
                                <span className="schema-sub-expand-label">Kompetenser</span>
                                <div className="schema-sub-comp-list">
                                  {competencies.slice(0, 3).map(c => (
                                    <span key={c} className="schema-sub-comp-badge">{c}</span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Contact */}
                            {details && (
                              <div className="schema-sub-expand-section">
                                <span className="schema-sub-expand-label">Kontakt</span>
                                <div className="schema-sub-contact-list">
                                  <span className="schema-sub-contact-item">
                                    <i className="fa-solid fa-phone" />
                                    <span>{details.phone}</span>
                                    <a href={`tel:${details.phone.replace(/\s/g,'')}`} className="schema-sub-action-btn" title="Ring">
                                      <i className="fa-solid fa-phone-arrow-up-right" />
                                    </a>
                                    <a href={`sms:${details.phone.replace(/\s/g,'')}`} className="schema-sub-action-btn" title="Skicka SMS">
                                      <i className="fa-regular fa-message" />
                                    </a>
                                  </span>
                                  <span className="schema-sub-contact-item">
                                    <i className="fa-solid fa-envelope" />
                                    <span>{details.email}</span>
                                    <a href={`mailto:${details.email}`} className="schema-sub-action-btn" title="Skicka e-post">
                                      <i className="fa-solid fa-arrow-up-right-from-square" />
                                    </a>
                                  </span>
                                </div>
                              </div>
                            )}

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {contextMenuPosition && (
        <div
          className="schema-sub-context-menu"
          role="menu"
          style={{ left: contextMenuPosition.x, top: contextMenuPosition.y }}
          onMouseDown={event => event.stopPropagation()}
          onContextMenu={event => event.preventDefault()}
        >
          {contextActions.map(action => (
            <button key={action.id} type="button" className={action.beginGroup ? 'schema-sub-context-menu-separator' : ''} onClick={() => handleContextAction({ itemData: action })} role="menuitem">
              <i className={`fa-solid fa-${action.icon}`} /> {action.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Confirm-assign dialog ────────────────────────────────────────────────────

function ConfirmAssignDialogInner({ state, onConfirm, onCancel }: {
  state: ConfirmState;
  onConfirm: (msg: string) => void;
  onCancel: () => void;
}) {
  const [msg, setMsg] = useState('');
  const [unit, setUnit] = useState(state.unit);
  const title = state.costApproval
    ? 'Bekräfta kostnad'
    : state.targetActivityLabel
      ? `Skicka förfrågan · ${state.targetActivityLabel}`
      : state.fillType === 'substitute' ? 'Skicka förfrågan' : 'Boka extrapass';
  return (
    <Popup visible={true} onHiding={onCancel} title={title} width={500} height="auto" showCloseButton={true} dragEnabled={false}>
      <div className="schema-dialog-content">
        {state.costApproval && <p className="schema-cost-approval-note">Ingen kostnadsfri vikarie är tillgänglig. Vill du tillsätta kandidaten nedan trots kostnaden?</p>}
        <div className="schema-confirm-details">
          <div className="schema-confirm-row">
            <i className="fa-solid fa-calendar-days" />
            <span>{state.targetDateStr}</span>
          </div>
          <div className="schema-confirm-row">
            <i className="fa-solid fa-clock" />
            <span>{state.targetShift.start}–{state.targetShift.end}</span>
          </div>
          {state.targetActivityLabel && <div className="schema-confirm-row"><i className="fa-solid fa-shapes" /><span>Vikarie för aktiviteten <strong>{state.targetActivityLabel}</strong></span></div>}
          <div className="schema-confirm-row">
            <i className="fa-solid fa-user-plus" />
            <div className="schema-confirm-subs">
              {state.substitutes.map((s, i) => (
                <div key={i} className="schema-confirm-sub-item">
                  <strong>{s.name}</strong>
                  <span> · {s.role} · {s.category} · {s.costLevel}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="schema-confirm-row">
            <i className="fa-solid fa-building" />
            {state.unitLocked ? <span>Enhet · {state.unit}</span> : <label>Enhet<select value={unit} onChange={e => setUnit(e.currentTarget.value)}>{SUBSTITUTE_UNITS.map(option => <option key={option.id} value={option.label}>{option.label}</option>)}</select></label>}
          </div>
        </div>
        {!state.costApproval && <>
          <div className="schema-confirm-note-label">Ytterligare information</div>
          <TextArea
            value={msg}
            onValueChanged={e => setMsg(e.value ?? '')}
            height={90}
            stylingMode="outlined"
            placeholder="Skriv eventuell information till vikarien..."
          />
        </>}
        <div className="schema-dialog-actions">
          <button className="btn-primary" disabled={!state.unitLocked && !unit} onClick={() => onConfirm(msg)}>{state.costApproval ? 'Godkänn och tillsätt' : 'Skicka'}</button>
          <button className="btn-secondary" onClick={onCancel}>{state.costApproval ? 'Avstå' : 'Avbryt'}</button>
        </div>
      </div>
    </Popup>
  );
}

function ConfirmAssignDialog({ state, onConfirm, onCancel }: {
  state: ConfirmState | null;
  onConfirm: (msg: string) => void;
  onCancel: () => void;
}) {
  if (!state) return null;
  return <ConfirmAssignDialogInner state={state} onConfirm={onConfirm} onCancel={onCancel} />;
}

function OpenRequestDialog({ state, onConfirm, onCancel }: {
  state: OpenRequestState | null;
  onConfirm: (dateStr: string, shift: Shift, role: string, unit: string) => void;
  onCancel: () => void;
}) {
  const [dateStr, setDateStr] = useState(state?.dateStr ?? TODAY_STR);
  const [start, setStart] = useState(state?.shift.start ?? '08:00');
  const [end, setEnd] = useState(state?.shift.end ?? '17:00');
  const [role, setRole] = useState(state?.role ?? SUBSTITUTE_ROLES[0]?.id ?? '');
  const [unit, setUnit] = useState(state?.unit ?? SUBSTITUTE_UNITS[0].label);
  if (!state) return null;
  return (
    <Popup visible={true} onHiding={onCancel} title="Skicka förfrågan" width={540} height="auto" showCloseButton={true} dragEnabled={false}>
      <div className="schema-dialog-content">
        <p>Ingen specifik passcell är vald. Ange när förfrågan gäller.</p>
        <div className="schema-order-time-fields">
          <label>Datum<input type="date" value={dateStr} onChange={e => setDateStr(e.currentTarget.value)} /></label>
          <label>Starttid<input type="time" value={start} onChange={e => setStart(e.currentTarget.value)} /></label>
          <label>Sluttid<input type="time" value={end} onChange={e => setEnd(e.currentTarget.value)} /></label>
        </div>
        <label className="schema-open-request-role">Roll
          <select value={role} onChange={e => setRole(e.currentTarget.value)}>
            {SUBSTITUTE_ROLES.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
        </label>
        <label className="schema-open-request-role">Enhet
          <select value={unit} onChange={e => setUnit(e.currentTarget.value)}>
            {SUBSTITUTE_UNITS.map(option => <option key={option.id} value={option.label}>{option.label}</option>)}
          </select>
        </label>
        <div className="schema-confirm-details">
          <div className="schema-confirm-row"><i className="fa-solid fa-user-plus" /><span>{state.substitutes.length} markerade vikarier: {state.substitutes.map(sub => sub.name).join(', ')}</span></div>
        </div>
        <div className="schema-dialog-actions">
          <button className="btn-primary" disabled={!dateStr || !start || !end || !role || !unit} onClick={() => onConfirm(dateStr, { type: 'day', start, end }, role, unit)}>Skicka</button>
          <button className="btn-secondary" onClick={onCancel}>Avbryt</button>
        </div>
      </div>
    </Popup>
  );
}

function ResourceOrderDialogInner({ state, onConfirm, onCancel }: {
  state: ResourceOrderDialogState;
  onConfirm: (shift: Shift, msg: string) => void;
  onCancel: () => void;
}) {
  const [msg, setMsg] = useState('');
  const [start, setStart] = useState(state.shift.start);
  const [end, setEnd] = useState(state.shift.end);
  const resourceLabel = state.resourceType === 'vikarie' ? 'Vikarie' : 'Extrapass';
  return (
    <Popup visible={true} onHiding={onCancel} title="Beställ resurs" width={500} height="auto" showCloseButton={true} dragEnabled={false}>
      <div className="schema-dialog-content">
        <div className="schema-confirm-details">
          <div className="schema-confirm-row">
            <i className="fa-solid fa-cart-shopping" />
            <span>{resourceLabel}</span>
          </div>
          <div className="schema-confirm-row">
            <i className="fa-solid fa-calendar-days" />
            <span>{state.dateStr}</span>
          </div>
          <div className="schema-confirm-row">
            <i className="fa-solid fa-clock" />
            <div className="schema-order-time-fields">
              <label>Starttid<input type="time" value={start} onChange={e => setStart(e.currentTarget.value)} /></label>
              <label>Sluttid<input type="time" value={end} onChange={e => setEnd(e.currentTarget.value)} /></label>
            </div>
          </div>
          <div className="schema-confirm-row">
            <i className="fa-solid fa-user" />
            <div className="schema-confirm-subs"><strong>{state.personName}</strong><span> · {state.role}</span></div>
          </div>
        </div>
        <div className="schema-confirm-note-label">Ytterligare information till den hanterande enheten</div>
        <TextArea
          value={msg}
          onValueChanged={e => setMsg(e.value ?? '')}
          height={90}
          stylingMode="outlined"
          placeholder="Skriv eventuell information om beställningen..."
        />
        <div className="schema-dialog-actions">
          <button className="btn-primary" onClick={() => onConfirm({ ...state.shift, start, end }, msg)}>Skicka beställning</button>
          <button className="btn-secondary" onClick={onCancel}>Avbryt</button>
        </div>
      </div>
    </Popup>
  );
}

function ResourceOrderDialog({ state, onConfirm, onCancel }: {
  state: ResourceOrderDialogState | null;
  onConfirm: (shift: Shift, msg: string) => void;
  onCancel: () => void;
}) {
  if (!state) return null;
  return <ResourceOrderDialogInner state={state} onConfirm={onConfirm} onCancel={onCancel} />;
}

// ─── Pass and person detail cards ────────────────────────────────────────────

const SHIFT_LABELS: Record<ShiftType, string> = {
  morning: 'Morgonpass', day: 'Dagpass', evening: 'Kvällspass', night: 'Nattpass',
};

function PassDetailCard({ state, onSaveTime, onPrimaryAction, onCreateOrder, onCreateResourceNeed, onReportSick, onSimulate, resourceNeedMode = false, resourceNeed, resourceNeedOrder, assignedPerson, assignmentFailure, organisation = 'clinic' }: {
  state: DetailState;
  onSaveTime: (start: string, end: string) => void;
  onPrimaryAction?: () => void;
  onCreateOrder: () => void;
  onCreateResourceNeed?: () => void;
  onReportSick: () => void;
  onSimulate: () => void;
  resourceNeedMode?: boolean;
  resourceNeed?: ResourceNeed;
  resourceNeedOrder?: ResourceOrder;
  assignedPerson?: { name: string; role: string };
  assignmentFailure?: string;
  organisation?: OrganisationScenario;
}) {
  const [start, setStart] = useState(state.shift.start);
  const [end, setEnd] = useState(state.shift.end);
  useEffect(() => { setStart(state.shift.start); setEnd(state.shift.end); }, [state.shift.start, state.shift.end]);
  const isVacant = state.color === 'vacant';
  const isAbsent = state.color === 'absence';
  const isPast   = state.color === 'past';
  const akut     = isAkutShift(state.empId, state.dateStr, organisation) && isVacant;
  const passInfo = getShiftPassInfo(state.empId, state.dateStr, organisation);
  const timeChanged = start !== state.shift.start || end !== state.shift.end;
  const statusLabel = assignmentFailure ? 'Kunde inte tillsättas' : isVacant ? (resourceNeedMode ? 'Resursbehov' : (akut ? 'Akut vakans' : 'Vakans')) : isAbsent ? 'Frånvaro' : state.color === 'filled' ? 'Tillsatt' : isPast ? 'Historiskt pass' : 'Planerat';
  const primaryLabel = isVacant ? 'Hitta vikarie' : isAbsent ? 'Gör till vakans' : state.color === 'normal' ? 'Boka extrapass' : null;
  const primaryIcon = isVacant ? 'fa-user-plus' : isAbsent ? 'fa-user-clock' : 'fa-calendar-plus';

  return (
    <div className="order-detail-card pass-detail-card">
      <div className="order-detail-type"><i className="fa-solid fa-calendar-day" /> Passdetaljer</div>
      <h3>{state.empName}</h3>
      <p className="order-detail-role">{state.empRole}</p>
      <dl>
        <div><dt>Datum</dt><dd>{fmtDay(parseDate(state.dateStr))}</dd></div>
        <div><dt>Pass</dt><dd><div className="order-detail-time-editor"><label>Starttid<input type="time" value={start} onChange={event => setStart(event.currentTarget.value)} /></label><span>–</span><label>Sluttid<input type="time" value={end} onChange={event => setEnd(event.currentTarget.value)} /></label>{timeChanged && <button type="button" className="btn-secondary" onClick={() => onSaveTime(start, end)}>Spara tid</button>}</div></dd></div>
        {!isSchoolScenario(organisation) && <div><dt>Passtyp</dt><dd>{SHIFT_LABELS[state.shift.type]}{passInfo ? ` · ${passInfo}` : ''}</dd></div>}
        <div><dt>Status</dt><dd><span className={`schema-detail-status schema-detail-status-${state.color}${assignmentFailure ? ' schema-detail-status-assignment-failed' : ''}`}><i className={assignmentFailure ? 'fa-solid fa-robot' : undefined} />{statusLabel}</span></dd></div>
        {assignmentFailure && <div><dt>Orsak</dt><dd>{assignmentFailure}</dd></div>}
        {resourceNeed && <div><dt>Resursbehov</dt><dd>{resourceNeed.createdBy}{resourceNeed.reason ? ` · ${resourceNeed.reason}` : ''}</dd></div>}
        {resourceNeedOrder && <div><dt>Beställning</dt><dd>Beställd av {resourceNeedOrder.orderedBy} · {resourceNeedOrder.status} · Hanteras av {resourceNeedOrder.handledBy}</dd></div>}
        {assignedPerson && <div><dt>Tillsatt med</dt><dd>{assignedPerson.name} · {assignedPerson.role}</dd></div>}
      </dl>
      {!isPast && <div className="order-detail-actions">
        {resourceNeedMode && onCreateResourceNeed && state.color === 'normal' && <button className="btn-primary" onClick={onCreateResourceNeed}><i className="fa-solid fa-user-clock" /> Skapa resursbehov</button>}
        {!resourceNeedMode && primaryLabel && onPrimaryAction && <button className="btn-primary" onClick={onPrimaryAction}><i className={`fa-solid ${primaryIcon}`} /> {primaryLabel}</button>}
        <button className="btn-secondary" onClick={onCreateOrder}><i className="fa-solid fa-cart-shopping" /> Beställ resurs</button>
        {!isAbsent && !isVacant && <button className="btn-secondary" onClick={onReportSick}><i className="fa-solid fa-calendar-xmark" /> Sjukanmäl</button>}
        <button className="btn-secondary" onClick={onSimulate}><i className="fa-solid fa-flask" /> Simulera urval</button>
      </div>}
    </div>
  );
}

function ActivityScheduleDetail({ schedule, activityFills = {}, assignedSubstituteName }: { schedule: EmployeeDaySchedule; activityFills?: Record<string, ActivityFill>; assignedSubstituteName?: string }) {
  const segmentStyle = (from: string, to: string): React.CSSProperties => ({
    left: `${timeToMinutes(from) / 1440 * 100}%`,
    width: `${Math.max(0, (timeToMinutes(to) - timeToMinutes(from)) / 1440 * 100)}%`,
  });
  return (
    <section className={`person-activity-schedule${schedule.dateStr < TODAY_STR ? ' person-activity-schedule-past' : ''}`} aria-label={`Dagschema ${fmtDay(parseDate(schedule.dateStr))}`}>
      <div className="person-activity-schedule-heading">
        <strong>{fmtDay(parseDate(schedule.dateStr))}</strong>
        <span>{schedule.shift.start}–{schedule.shift.end}</span>
      </div>
      <div className="person-activity-schedule-axis" aria-hidden="true">
        <span>00:00</span>
        <span style={{ left: '50%' }}>12:00</span>
        <span>24:00</span>
      </div>
      <div className="person-activity-schedule-lanes" aria-label={`Arbetstid ${schedule.shift.start} till ${schedule.shift.end}`}>
        {schedule.activities.map(activity => (
          <div className="person-activity-schedule-row" key={activity.id}>
            <span
              className={`person-activity-schedule-bar ${schedule.absenceLabel ? 'schema-activity-bar-absence' : PRESCHOOL_ACTIVITY_TYPES[activity.kind].className}`}
              style={segmentStyle(activity.start, activity.end)}
              title={`${activity.label} · ${activity.start}–${activity.end}`}
            >
              {activity.label.slice(0, 3)}
            </span>
          </div>
        ))}
      </div>
      <div className="person-activity-schedule-list">
        {schedule.activities.map(activity => (
          <div key={activity.id}>
            <i className={`person-activity-schedule-swatch ${schedule.absenceLabel ? 'schema-activity-bar-absence' : PRESCHOOL_ACTIVITY_TYPES[activity.kind].className}`} />
            <span>{activity.label}{(activityFills[activity.id]?.substituteName ?? assignedSubstituteName) && <small> · {activityFills[activity.id]?.substituteName ?? assignedSubstituteName}</small>}</span>
            <time>{activity.start}–{activity.end}</time>
          </div>
        ))}
      </div>
      {schedule.absenceLabel && <span className="schema-activity-absence-caption">{schedule.absenceLabel}</span>}
    </section>
  );
}

function PersonDetailCard({ employee, competencies, shiftDates, activitySchedules, onReportSick, onShowSchedule }: {
  employee: ScheduleEmployee;
  competencies: string[];
  shiftDates: string[];
  activitySchedules?: Record<string, EmployeeDaySchedule>;
  onReportSick: (dateStr: string) => void;
  onShowSchedule: () => void;
}) {
  const [selectedDate, setSelectedDate] = useState(shiftDates[0] ?? '');
  useEffect(() => { setSelectedDate(shiftDates[0] ?? ''); }, [employee.id, shiftDates]);
  return (
    <div className="order-detail-card person-detail-card">
      <div className="order-detail-type"><i className="fa-solid fa-id-card" /> Persondetaljer</div>
      <h3>{employee.name}</h3>
      <p className="order-detail-role">{employee.role}</p>
      <dl>
        <div><dt>Organisation</dt><dd>{employee.organisation}</dd></div>
        <div><dt>Anställningsgrupp</dt><dd>{employee.fmgGroup}</dd></div>
        <div><dt>Kompetenser</dt><dd><div className="person-detail-competencies">{competencies.map(competency => <span key={competency}>{competency}</span>)}</div></dd></div>
        <div><dt>Datum för sjukanmälan</dt><dd><select value={selectedDate} onChange={event => setSelectedDate(event.currentTarget.value)} disabled={shiftDates.length === 0}>{shiftDates.length > 0 ? shiftDates.map(dateStr => <option key={dateStr} value={dateStr}>{fmtDay(parseDate(dateStr))}</option>) : <option value="">Inget pass i aktuell period</option>}</select></dd></div>
      </dl>
      {activitySchedules && <div className="person-activity-schedule-panel">
        <h4>Schema för vald dag</h4>
        {activitySchedules[selectedDate]
          ? <ActivityScheduleDetail schedule={activitySchedules[selectedDate]} />
          : <p>Inget arbetsschema i aktuell period.</p>}
      </div>}
      <div className="order-detail-actions">
        <button className="btn-primary" disabled={!selectedDate} onClick={() => selectedDate && onReportSick(selectedDate)}><i className="fa-solid fa-calendar-xmark" /> Sjukanmäl</button>
        <button className="btn-secondary" onClick={onShowSchedule}><i className="fa-solid fa-calendar-days" /> Visa i schema</button>
      </div>
    </div>
  );
}

function SubstituteDetailCard({ substitute, details, dateStr, dateOptions, availability, hasAvailabilityOverride, booking, absenceReason, onSelectDate, onSaveAvailability, onMarkUnavailable, onRestoreAvailability, onReportSick, onClearSickness, onSendRequest }: {
  substitute: SubstituteCandidate;
  details?: SubstituteDetails;
  dateStr: string;
  dateOptions: string[];
  availability: SubAvailability | null;
  hasAvailabilityOverride: boolean;
  booking?: SubBookedShift;
  absenceReason?: AbsenceReason;
  onSelectDate: (dateStr: string) => void;
  onSaveAvailability: (availability: SubAvailability) => void;
  onMarkUnavailable: () => void;
  onRestoreAvailability: () => void;
  onReportSick: () => void;
  onClearSickness: () => void;
  onSendRequest: () => void;
}) {
  const formatTime = (hours: number, minutes: number) => `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  const competencies = details?.competencies ?? substitute.competencies ?? [];
  const [start, setStart] = useState(availability ? formatTime(availability.startH, availability.startM) : '08:00');
  const [end, setEnd] = useState(availability ? formatTime(availability.endH, availability.endM) : '17:00');
  useEffect(() => {
    setStart(availability ? formatTime(availability.startH, availability.startM) : '08:00');
    setEnd(availability ? formatTime(availability.endH, availability.endM) : '17:00');
  }, [availability, dateStr]);
  const availabilityLabel = absenceReason
    ? absenceReason
    : booking
      ? `Bokad ${booking.start}–${booking.end}`
      : availability
        ? `Tillgänglig ${fmtAvailTime(availability)}`
        : 'Ej tillgänglig';
  const canEdit = dateStr >= TODAY_STR && !booking && !absenceReason;
  const saveAvailability = () => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    if ([startH, startM, endH, endM].some(Number.isNaN)) return;
    onSaveAvailability({ startH, startM, endH, endM });
  };

  return (
    <div className="order-detail-card person-detail-card substitute-detail-card">
      <div className="order-detail-type"><i className="fa-solid fa-user-nurse" /> Vikarieuppgifter</div>
      <h3>{substitute.name}</h3>
      <p className="order-detail-role">{substitute.role} · {substitute.category} · {substitute.costLevel}</p>
      <dl>
        {details && <div><dt>Kontakt</dt><dd><a href={`tel:${details.phone.replace(/\s/g, '')}`}>{details.phone}</a><br /><a href={`mailto:${details.email}`}>{details.email}</a></dd></div>}
        {details && <div><dt>ATL</dt><dd>{details.atlHours} av {details.maxAtlHours} timmar</dd></div>}
        {competencies.length > 0 && <div><dt>Kompetenser</dt><dd><div className="person-detail-competencies">{competencies.map(competency => <span key={competency}>{competency}</span>)}</div></dd></div>}
        <div><dt>Datum</dt><dd><select value={dateStr} onChange={event => onSelectDate(event.currentTarget.value)}>{dateOptions.map(option => <option key={option} value={option}>{fmtDay(parseDate(option))}</option>)}</select></dd></div>
        <div><dt>Status</dt><dd><span className={`schema-detail-status ${absenceReason ? 'schema-detail-status-absence' : booking ? 'schema-detail-status-filled' : availability ? 'schema-detail-status-normal' : ''}`}>{availabilityLabel}</span></dd></div>
        <div><dt>Tillgänglighet</dt><dd><div className="order-detail-time-editor"><label>Från<input type="time" value={start} disabled={!canEdit} onChange={event => setStart(event.currentTarget.value)} /></label><span>–</span><label>Till<input type="time" value={end} disabled={!canEdit} onChange={event => setEnd(event.currentTarget.value)} /></label>{canEdit && <button type="button" className="btn-secondary" onClick={saveAvailability}>Spara</button>}</div></dd></div>
      </dl>
      <div className="order-detail-actions">
        <button className="btn-primary" onClick={onSendRequest}><i className="fa-solid fa-paper-plane" /> Skicka förfrågan</button>
        {canEdit && availability && <button className="btn-secondary" onClick={onMarkUnavailable}><i className="fa-solid fa-ban" /> Markera ej tillgänglig</button>}
        {canEdit && hasAvailabilityOverride && <button className="btn-secondary" onClick={onRestoreAvailability}><i className="fa-solid fa-rotate-left" /> Återställ tillgänglighet</button>}
        {dateStr >= TODAY_STR && (absenceReason
          ? <button className="btn-secondary" onClick={onClearSickness}><i className="fa-solid fa-calendar-check" /> Ta bort sjukanmälan</button>
          : <button className="btn-secondary" onClick={onReportSick}><i className="fa-solid fa-calendar-xmark" /> Sjukanmäl</button>)}
      </div>
    </div>
  );
}

function getOrderContextActions(order: ResourceOrder): OrderContextAction[] {
  if (order.status === 'Avbruten' || order.status === 'Tillsatt') return [];
  const actions: OrderContextAction[] = [];
  if (order.status === 'Beställd') {
    actions.push({ id: 'start-processing', text: 'Påbörja behandling', icon: 'user-gear' });
  }
  if (order.status === 'Beställd' || order.status === 'Under behandling') {
    actions.push({ id: 'send-order', text: 'Skicka förfrågan', icon: 'paper-plane' });
  }
  order.invitedSubstitutes
    .filter(invite => invite.response === 'Tillgänglig')
    .forEach(invite => actions.push({
      id: 'approve-response',
      text: `Godkänn svar från ${invite.name}`,
      icon: 'circle-check',
      substituteId: invite.substituteId,
    }));
  if (order.status !== 'Tillsatt') {
    actions.push({ id: 'cancel-order', text: 'Avbryt beställning', icon: 'ban', beginGroup: true });
  }
  return actions;
}

function OrderSubstituteDialog({ order, onConfirm, onCancel }: {
  order: ResourceOrder | null;
  onConfirm: (substitute: SubstituteCandidate) => void;
  onCancel: () => void;
}) {
  const [selectedId, setSelectedId] = useState('');
  useEffect(() => { setSelectedId(''); }, [order?.id]);
  if (!order) return null;
  const substitute = SUBSTITUTE_CANDIDATES.find(item => item.id === selectedId);
  return (
    <Popup visible={true} onHiding={onCancel} title="Välj vikarie" width={430} height="auto" showCloseButton={true} dragEnabled={false}>
      <div className="schema-dialog-content">
        <p className="schema-dialog-desc"><strong>{order.personName}</strong><br />{order.dateStr} · {order.shift.start}–{order.shift.end}</p>
        <SelectBox dataSource={SUBSTITUTE_CANDIDATES} displayExpr="name" valueExpr="id" value={selectedId} onValueChanged={event => setSelectedId(event.value ?? '')} placeholder="Välj vikarie" width="100%" stylingMode="outlined" />
        {substitute && <p className="schema-order-substitute-preview">{substitute.role} · matchas mot passets tider och kompetenskrav.</p>}
        <div className="schema-dialog-actions"><button className="btn-primary" disabled={!substitute} onClick={() => substitute && onConfirm(substitute)}>Välj vikarie</button><button className="btn-secondary" onClick={onCancel}>Avbryt</button></div>
      </div>
    </Popup>
  );
}

function ResourceOrdersList({ orders, onClose, onAction, onOpenDetails, onChooseSubstitute, onShowSubstitutes }: {
  orders: ResourceOrder[];
  onClose: () => void;
  onAction: (orderId: string, action: OrderContextAction) => void;
  onOpenDetails?: (order: ResourceOrder) => void;
  onChooseSubstitute?: (order: ResourceOrder) => void;
  onShowSubstitutes?: () => void;
}) {
  const [expandedOrderIds, setExpandedOrderIds] = useState<string[]>([]);
  const [contextOrderId, setContextOrderId] = useState<string | null>(null);
  const [contextActions, setContextActions] = useState<OrderContextAction[]>([]);

  const toggleOrder = useCallback((orderId: string) => {
    setExpandedOrderIds(previous => previous.includes(orderId)
      ? previous.filter(id => id !== orderId)
      : [...previous, orderId]);
  }, []);

  return (
    <div className="schema-orders-list" aria-live="polite">
      <div className="schema-orders-list-header">
        <div>
          <h2>Beställningar</h2>
          <p>Resursbeställningar som hanteras av annan enhet.</p>
        </div>
        <div className="schema-orders-header-actions">
          {onShowSubstitutes && <button className="btn-secondary schema-vikarie-open-btn" onClick={onShowSubstitutes}><i className="fa-solid fa-user-group" /> Visa vikarier</button>}
          <span className="schema-orders-count">{orders.length}</span>
          <button className="schema-orders-close" onClick={onClose} aria-label="Stäng beställningar"><i className="fa-solid fa-xmark" /></button>
        </div>
      </div>
      {orders.length === 0 ? (
        <div className="schema-orders-empty">
          <i className="fa-solid fa-cart-shopping" />
          <span>Inga beställningar att visa.</span>
        </div>
      ) : (
        <table className="schema-orders-table">
          <colgroup>
            <col style={{ width: '15%' }} />
            <col style={{ width: '25%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '17%' }} />
            <col style={{ width: '16%' }} />
          </colgroup>
          <thead>
            <tr>
              <th>Resurs</th>
              <th>Medarbetare</th>
              <th>Datum</th>
              <th>Pass</th>
              <th>Status</th>
              <th>Handläggare</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => {
              const isExpanded = expandedOrderIds.includes(order.id);
              return (
                <React.Fragment key={order.id}>
                  <tr
                    className="schema-order-row"
                    onDoubleClick={() => onOpenDetails?.(order)}
                    onContextMenu={() => {
                      setContextOrderId(order.id);
                      setContextActions(getOrderContextActions(order));
                    }}
                  >
                <td>
                  <button className="schema-order-expand" onClick={() => toggleOrder(order.id)} aria-label={isExpanded ? 'Fäll ihop beställning' : 'Fäll ut beställning'}>
                    <i className={`fa-solid fa-chevron-${isExpanded ? 'down' : 'right'}`} />
                  </button>
                  <i className="fa-solid fa-cart-shopping" /> {order.resourceType === 'vikarie' ? 'Vikarie' : 'Extrapass'}
                </td>
                <td><strong>{order.personName}</strong><span>{order.role}</span></td>
                <td>{order.dateStr}</td>
                <td>{order.shift.start}–{order.shift.end}</td>
                <td><span className="schema-order-status">{order.status}</span></td>
                <td>{order.handledBy}</td>
              </tr>
              {isExpanded && (
                <tr className="schema-order-details-row">
                  <td colSpan={6}>
                    <div className="schema-order-details">
                      <div className="schema-order-meta">
                        <span><strong>Beställd av:</strong> {order.orderedBy}</span>
                        <span><strong>Handläggare:</strong> {order.handledBy}</span>
                      </div>
                      <h3>Förfrågningar till vikarier</h3>
                      {order.invitedSubstitutes.length === 0 ? (
                        <p className="schema-order-no-responses">Ingen förfrågan är skickad ännu.</p>
                      ) : (
                        <div className="schema-order-invites">
                          {order.invitedSubstitutes.map(invite => (
                            <div key={invite.substituteId} className="schema-order-invite">
                              <div className="schema-order-invite-person">
                                <strong>{invite.name}</strong>
                                <span>{invite.role}</span>
                              </div>
                              <div className="schema-order-invite-response">
                                <span className={`schema-order-response schema-order-response-${invite.response === 'Tillgänglig' ? 'available' : invite.response === 'Kan inte' ? 'unavailable' : 'pending'}`}>
                                  {invite.response}
                                </span>
                                {invite.responseText && <span className="schema-order-response-text">{invite.responseText}</span>}
                              </div>
                              {invite.response === 'Tillgänglig' && order.status !== 'Tillsatt' && order.status !== 'Avbruten' && (
                                <button className="btn-primary schema-order-approve-btn" onClick={() => onAction(order.id, { id: 'approve-response', text: `Godkänn svar från ${invite.name}`, icon: 'circle-check', substituteId: invite.substituteId })}>
                                  <i className="fa-solid fa-circle-check" /> Godkänn svar
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {order.status !== 'Tillsatt' && order.status !== 'Avbruten' && onChooseSubstitute && <button className="btn-secondary schema-order-choose-btn" onClick={() => onChooseSubstitute(order)}><i className="fa-solid fa-user-plus" /> Välj vikarie</button>}
                    </div>
                  </td>
                </tr>
              )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      )}
      <ContextMenu
        target=".schema-order-row"
        dataSource={contextActions}
        onItemClick={event => {
          if (contextOrderId && event.itemData) onAction(contextOrderId, event.itemData as OrderContextAction);
        }}
      />
    </div>
  );
}

const RESOURCE_ORDER_BOARD_COLUMNS: Array<{
  id: 'needs' | 'ordered' | 'processing' | 'requested' | 'responded' | 'booked';
  label: string;
  icon: string;
  status?: ResourceOrderStatus;
}> = [
  { id: 'needs', label: 'Resursbehov', icon: 'fa-user-clock' },
  { id: 'ordered', label: 'Beställningar', icon: 'fa-cart-shopping', status: 'Beställd' },
  { id: 'processing', label: 'Påbörjat', icon: 'fa-user-gear', status: 'Under behandling' },
  { id: 'requested', label: 'Förfrågan skickad', icon: 'fa-paper-plane', status: 'Förfrågan skickad' },
  { id: 'responded', label: 'Besvarad', icon: 'fa-comment-dots', status: 'Besvarad' },
  { id: 'booked', label: 'Bokad', icon: 'fa-circle-check', status: 'Tillsatt' },
];

function ResourceOrdersKanban({ needs, orders, orgOptions, activityKinds, selectedRoleId, getActivitiesForPerson, isAcuteNeed, onClose, onAction, onOpenNeed, onOpenOrder, onChooseSubstitute, onShowSubstitutes, onMoveNeed, onMoveOrder, onReturnOrderToNeed, onRegisterResponses, onTakeBackOrder }: {
  needs: ResourceNeed[];
  orders: ResourceOrder[];
  orgOptions: ResourceBoardOrgOption[];
  activityKinds: ActivityKind[];
  selectedRoleId: string;
  getActivitiesForPerson: (personId: string, dateStr: string) => ScheduleActivity[];
  isAcuteNeed: (need: ResourceNeed) => boolean;
  onClose: () => void;
  onAction: (orderId: string, action: OrderContextAction) => void;
  onOpenNeed: (need: ResourceNeed) => void;
  onOpenOrder: (order: ResourceOrder) => void;
  onChooseSubstitute: (order: ResourceOrder) => void;
  onShowSubstitutes?: () => void;
  onMoveNeed: (needId: string, status: ResourceOrderStatus) => void;
  onMoveOrder: (orderId: string, status: ResourceOrderStatus) => void;
  onReturnOrderToNeed: (orderId: string) => void;
  onRegisterResponses: (orderId: string) => void;
  onTakeBackOrder: (orderId: string) => void;
}) {
  const [needsHidden, setNeedsHidden] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState('all');
  const [selectedActivities, setSelectedActivities] = useState<ActivityKind[]>([]);
  const allowedOrgLevels = useMemo<ResourceBoardOrgLevel[]>(() => selectedRoleId === 'admin'
    ? ['education', 'rectorate', 'preschool', 'team', 'department', 'organisation']
    : selectedRoleId === 'chef'
      ? ['rectorate', 'preschool', 'team', 'department', 'organisation']
      : ['preschool', 'team', 'department'], [selectedRoleId]);
  const visibleOrgOptions = useMemo(() => orgOptions.filter(option => allowedOrgLevels.includes(option.level)), [allowedOrgLevels, orgOptions]);
  useEffect(() => {
    if (selectedOrgId !== 'all' && !visibleOrgOptions.some(option => option.id === selectedOrgId)) setSelectedOrgId('all');
  }, [selectedOrgId, visibleOrgOptions]);
  useEffect(() => {
    setSelectedActivities(current => current.filter(kind => activityKinds.includes(kind)));
  }, [activityKinds]);
  const selectedOrg = visibleOrgOptions.find(option => option.id === selectedOrgId);
  const matchesBoardFilters = (personId: string, dateStr: string) => {
    if (selectedOrg && !selectedOrg.personIds.includes(personId)) return false;
    if (selectedActivities.length > 0 && !getActivitiesForPerson(personId, dateStr).some(activity => selectedActivities.includes(activity.kind))) return false;
    return true;
  };
  const activeOrders = orders.filter(order => order.status !== 'Avbruten' && matchesBoardFilters(order.personId, order.dateStr));
  const activeOrderNeedIds = new Set(activeOrders
    .filter(order => order.id.startsWith('resource-order-'))
    .map(order => order.id.slice('resource-order-'.length)));
  const openNeeds = needs.filter(need => need.status === 'Öppet' && !activeOrderNeedIds.has(need.id) && matchesBoardFilters(need.personId, need.dateStr));
  const directlyBookedNeeds = needs.filter(need => need.status === 'Tillsatt' && !activeOrderNeedIds.has(need.id) && matchesBoardFilters(need.personId, need.dateStr));

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, columnId: typeof RESOURCE_ORDER_BOARD_COLUMNS[number]['id']) => {
    event.preventDefault();
    const payload = event.dataTransfer.getData('text/plain');
    if (columnId === 'needs') {
      if (payload.startsWith('order:')) onReturnOrderToNeed(payload.slice(6));
      return;
    }
    const targetStatus = RESOURCE_ORDER_BOARD_COLUMNS.find(column => column.id === columnId)?.status;
    if (!targetStatus || targetStatus === 'Tillsatt') return;
    if (payload.startsWith('need:')) onMoveNeed(payload.slice(5), targetStatus);
    if (payload.startsWith('order:')) onMoveOrder(payload.slice(6), targetStatus);
  };

  const handleDragStart = (event: React.DragEvent<HTMLElement>, payload: string) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', payload);
  };

  const activitySummary = (personId: string, dateStr: string) => {
    const activities = getActivitiesForPerson(personId, dateStr)
      .filter(activity => selectedActivities.length === 0 || selectedActivities.includes(activity.kind));
    if (activities.length === 0) return null;
    const shortLabels: Record<ActivityKind, string> = {
      pedagogical: 'Pedagogisk', outdoors: 'Utevistelse', meals: 'Måltider', rest: 'Vila',
    };
    return <div className="schema-kanban-activities" aria-label="Aktiviteter">
      {activities.map(activity => <span key={activity.id} className={`schema-kanban-activity schema-kanban-activity-${activity.kind}`} title={`${activity.label} · ${activity.start}–${activity.end}`}>
        <i />{shortLabels[activity.kind]} <time>{activity.start}–{activity.end}</time>
      </span>)}
    </div>;
  };

  const renderNeedCard = (need: ResourceNeed, isBooked = false) => (
    <article
      key={need.id}
      className={`schema-kanban-card schema-kanban-need${isBooked ? ' schema-kanban-order-booked' : ''}`}
      draggable={!isBooked}
      onDragStart={isBooked ? undefined : event => handleDragStart(event, `need:${need.id}`)}
      onDoubleClick={() => onOpenNeed(need)}
      title="Dra behovet till Beställningar eller dubbelklicka för status och logg"
    >
      <div className="schema-kanban-card-topline">
        <span className="schema-kanban-kind">Resursbehov</span>
        <span className="schema-kanban-card-badges">
          <span className={`schema-kanban-urgency${isAcuteNeed(need) ? ' is-acute' : ''}`}>{isAcuteNeed(need) ? 'Akut' : 'Ej akut'}</span>
          {isBooked && <span className="schema-kanban-status">Bokad</span>}
        </span>
      </div>
      <strong className="schema-kanban-person">{need.personName}</strong>
      <span className="schema-kanban-subtitle">{need.role}</span>
      {activitySummary(need.personId, need.dateStr)}
      <div className="schema-kanban-meta"><span>{need.dateStr}</span><span>{need.shift.start}–{need.shift.end}</span></div>
      {isBooked && need.assignedSubstituteName && <div className="schema-kanban-assignment"><i className="fa-solid fa-circle-check" /> {need.assignedSubstituteName}</div>}
      <div className="schema-kanban-owner"><i className="fa-solid fa-user" /> Hanteras av {need.handledBy}</div>
    </article>
  );

  const renderOrderCard = (order: ResourceOrder) => {
    const linkedNeed = order.id.startsWith('resource-order-');
    const canTakeBack = order.status !== 'Tillsatt' && order.handledBy !== 'Maja Andersson';
    const stageAction = order.status === 'Beställd'
      ? <button className="btn-secondary" onClick={event => { event.stopPropagation(); onAction(order.id, { id: 'start-processing', text: 'Påbörja behandling', icon: 'user-gear' }); }}>Påbörja</button>
      : order.status === 'Under behandling'
        ? <button className="btn-secondary" onClick={event => { event.stopPropagation(); onAction(order.id, { id: 'send-order', text: 'Skicka förfrågan', icon: 'paper-plane' }); }}>Skicka förfrågan</button>
        : order.status === 'Förfrågan skickad'
          ? <button className="btn-secondary" onClick={event => { event.stopPropagation(); onRegisterResponses(order.id); }}>Registrera svar</button>
          : order.status === 'Besvarad'
            ? <button className="btn-primary" onClick={event => { event.stopPropagation(); onChooseSubstitute(order); }}><i className="fa-solid fa-user-plus" /> Välj vikarie</button>
            : null;
    return (
      <article
        key={order.id}
        className={`schema-kanban-card schema-kanban-order schema-kanban-order-${order.status === 'Tillsatt' ? 'booked' : order.status === 'Besvarad' ? 'responded' : 'active'}`}
        draggable={order.status !== 'Tillsatt'}
        onDragStart={event => handleDragStart(event, `order:${order.id}`)}
        onDoubleClick={() => onOpenOrder(order)}
        title="Dubbelklicka för status och händelselogg"
      >
        <div className="schema-kanban-card-topline">
          <span className="schema-kanban-kind"><i className={`fa-solid ${linkedNeed ? 'fa-user-clock' : 'fa-cart-shopping'}`} /> {linkedNeed ? 'Resursbehov' : order.resourceType === 'vikarie' ? 'Vikarie' : 'Extrapass'}</span>
          <span className="schema-kanban-status">{order.status}</span>
        </div>
        <strong className="schema-kanban-person">{order.personName}</strong>
        <span className="schema-kanban-subtitle">{order.role}</span>
        {activitySummary(order.personId, order.dateStr)}
        <div className="schema-kanban-meta"><span>{order.dateStr}</span><span>{order.shift.start}–{order.shift.end}</span></div>
        {order.acceptedSubstituteId && <div className="schema-kanban-assignment"><i className="fa-solid fa-circle-check" /> {SUBSTITUTE_CANDIDATES.find(candidate => candidate.id === order.acceptedSubstituteId)?.name ?? 'Vikarie bokad'}</div>}
        <div className="schema-kanban-owner"><i className="fa-solid fa-user" /> Hanteras av {order.handledBy}</div>
        <div className="schema-kanban-card-actions">
          {stageAction}
          {canTakeBack && <button className="btn-secondary" onClick={event => { event.stopPropagation(); onTakeBackOrder(order.id); }}>Ta tillbaka</button>}
        </div>
      </article>
    );
  };

  return (
    <section className="schema-orders-list schema-orders-kanban" aria-live="polite">
      <div className="schema-orders-list-header">
        <div>
          <h2>Beställningar</h2>
          <p>Följ resursbehov från registrering till bokning. Dubbelklicka på ett kort för status och logg.</p>
        </div>
        <div className="schema-orders-header-actions">
          {onShowSubstitutes && <button className="btn-secondary schema-vikarie-open-btn" onClick={onShowSubstitutes}><i className="fa-solid fa-user-group" /> Visa vikarier</button>}
          <span className="schema-orders-count">{openNeeds.length + activeOrders.length + directlyBookedNeeds.length}</span>
          <button className="schema-orders-close" onClick={onClose} aria-label="Stäng beställningar"><i className="fa-solid fa-xmark" /></button>
        </div>
      </div>
      <div className="schema-kanban-filters">
        <label className="schema-kanban-org-filter">Organisation
          <select value={selectedOrgId} onChange={event => setSelectedOrgId(event.currentTarget.value)}>
            <option value="all">Alla organisationer</option>
            {(['education', 'rectorate', 'preschool', 'team', 'department', 'organisation'] as ResourceBoardOrgLevel[]).map(level => {
              const levelOptions = visibleOrgOptions.filter(option => option.level === level);
              if (levelOptions.length === 0) return null;
              const levelLabels: Record<ResourceBoardOrgLevel, string> = {
                education: 'Förvaltning', rectorate: 'Rektorsområde', preschool: 'Förskola', team: 'Team', department: 'Avdelning', organisation: 'Organisation',
              };
              return <optgroup key={level} label={levelLabels[level]}>{levelOptions.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}</optgroup>;
            })}
          </select>
        </label>
        {activityKinds.length > 0 && <details className="schema-kanban-activity-filter">
          <summary>Aktiviteter{selectedActivities.length > 0 && <span>{selectedActivities.length}</span>}</summary>
          <div className="schema-kanban-activity-filter-options">
            {activityKinds.map(kind => (
              <label key={kind}><input type="checkbox" checked={selectedActivities.includes(kind)} onChange={event => {
                const checked = event.currentTarget.checked;
                setSelectedActivities(current => checked ? [...current, kind] : current.filter(item => item !== kind));
              }} />{PRESCHOOL_ACTIVITY_TYPES[kind].label}</label>
            ))}
            {selectedActivities.length > 0 && <button type="button" onClick={() => setSelectedActivities([])}>Rensa</button>}
          </div>
        </details>}
        <span className="schema-kanban-filter-hint">Filter följer den valda rollen</span>
      </div>
      <div className={`schema-kanban-board${needsHidden ? ' schema-kanban-needs-hidden' : ''}`}>
        {RESOURCE_ORDER_BOARD_COLUMNS.map(column => {
          const columnOrders = column.status ? activeOrders.filter(order => order.status === column.status) : [];
          const count = column.id === 'needs' ? openNeeds.length : column.id === 'booked' ? columnOrders.length + directlyBookedNeeds.length : columnOrders.length;
          if (column.id === 'needs' && needsHidden) {
            return <button key={column.id} className="schema-kanban-collapsed-needs" onClick={() => setNeedsHidden(false)} title="Visa resursbehov"><i className="fa-solid fa-chevron-right" /><span>Resursbehov</span><b>{count}</b></button>;
          }
          return (
            <div
              key={column.id}
              className={`schema-kanban-column schema-kanban-column-${column.id}`}
              onDragOver={event => { if (column.id !== 'booked') { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; } }}
              onDrop={event => handleDrop(event, column.id)}
            >
              <header className="schema-kanban-column-header">
                <div><i className={`fa-solid ${column.icon}`} /><h3>{column.label}</h3><span>{count}</span></div>
              {column.id === 'needs' && <button className="schema-kanban-collapse" onClick={() => setNeedsHidden(true)} aria-label="Dölj resursbehov"><i className="fa-solid fa-chevron-left" /></button>}
              </header>
              <div className="schema-kanban-column-content">
                {column.id === 'needs' ? openNeeds.map(need => renderNeedCard(need)) : <>
                  {columnOrders.map(renderOrderCard)}
                  {column.id === 'booked' && directlyBookedNeeds.map(need => renderNeedCard(need, true))}
                </>}
                {count === 0 && <div className="schema-kanban-empty">{column.id === 'needs' ? 'Inga nya resursbehov' : 'Inga beställningar'}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function OrderDetailCard({ order, onChooseSubstitute, onAction, onSaveTime, onTakeBack }: {
  order: ResourceOrder;
  onChooseSubstitute: (order: ResourceOrder) => void;
  onAction: (orderId: string, action: OrderContextAction) => void;
  onSaveTime: (orderId: string, start: string, end: string) => void;
  onTakeBack?: () => void;
}) {
  const [start, setStart] = useState(order.shift.start);
  const [end, setEnd] = useState(order.shift.end);
  useEffect(() => { setStart(order.shift.start); setEnd(order.shift.end); }, [order.shift.start, order.shift.end]);
  const timeChanged = start !== order.shift.start || end !== order.shift.end;

  return (
    <div className="order-detail-card">
      <div className="order-detail-type"><i className="fa-solid fa-cart-shopping" /> Resursbeställning</div>
      <h3>{order.personName}</h3>
      <p className="order-detail-role">{order.role}</p>
      <dl>
        <div><dt>Datum</dt><dd>{order.dateStr}</dd></div>
        <div><dt>Pass</dt><dd><div className="order-detail-time-editor"><label>Starttid<input type="time" value={start} onChange={event => setStart(event.currentTarget.value)} /></label><span>–</span><label>Sluttid<input type="time" value={end} onChange={event => setEnd(event.currentTarget.value)} /></label>{timeChanged && <button type="button" className="btn-secondary" onClick={() => onSaveTime(order.id, start, end)}>Spara tid</button>}</div></dd></div>
        <div><dt>Status</dt><dd><span className="schema-order-status">{order.status}</span></dd></div>
        <div><dt>Beställd av</dt><dd>{order.orderedBy}</dd></div>
        <div><dt>Handläggare</dt><dd>{order.handledBy}</dd></div>
      </dl>
      <div className="order-detail-actions">
        {onTakeBack && order.status !== 'Tillsatt' && order.handledBy !== 'Maja Andersson' && <button className="btn-secondary" onClick={onTakeBack}><i className="fa-solid fa-arrow-rotate-left" /> Ta tillbaka kontrollen</button>}
        {order.status !== 'Tillsatt' && order.status !== 'Avbruten' && <button className="btn-primary" onClick={() => onChooseSubstitute(order)}><i className="fa-solid fa-user-plus" /> Välj vikarie</button>}
        {getOrderContextActions(order).map(action => <button key={action.id + (action.substituteId ?? '')} className="btn-secondary" onClick={() => onAction(order.id, action)}><i className={`fa-solid fa-${action.icon}`} /> {action.text}</button>)}
      </div>
    </div>
  );
}

function getResourceNeedActions(need: ResourceNeed): ResourceNeedAction[] {
  if (need.status === 'Borttaget' || need.status === 'Tillsatt') return [];
  return [
    { id: 'open' as const, text: 'Öppna', icon: 'arrow-up-right-from-square' },
    ...(need.status !== 'Tillsatt' ? [{ id: 'assign-direct' as const, text: 'Tillsätt direkt', icon: 'robot' }] : []),
    ...(need.status !== 'Tillsatt' ? [{ id: 'assign' as const, text: 'Tillsätt', icon: 'user-check' }] : []),
    { id: 'order' as const, text: 'Beställ', icon: 'cart-shopping' },
    { id: 'remove' as const, text: 'Ta bort resursbehov', icon: 'ban' },
  ];
}

function ResourceNeedsList({ needs, onClose, onOpenDetails, onAction, onDropPass, onOrderAll, onAssignAll }: {
  needs: ResourceNeed[];
  onClose: () => void;
  onOpenDetails: (need: ResourceNeed) => void;
  onAction: (needId: string, action: ResourceNeedAction) => void;
  onDropPass: (event: React.DragEvent<HTMLDivElement>) => void;
  onOrderAll: () => void;
  onAssignAll?: () => void;
}) {
  const [contextNeedId, setContextNeedId] = useState<string | null>(null);
  const [contextActions, setContextActions] = useState<ResourceNeedAction[]>([]);
  const activeNeeds = needs.filter(need => need.status !== 'Borttaget');
  return (
    <div
      className="schema-orders-list schema-resource-needs-list"
      aria-live="polite"
      onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; }}
      onDrop={onDropPass}
    >
      <div className="schema-orders-list-header">
        <div>
          <h2>Resursbehov</h2>
          <p>Frånvaro och pass där ersättning behöver tillsättas.</p>
        </div>
        <div className="schema-orders-header-actions">
          <span className="schema-orders-count">{activeNeeds.length}</span>
          <button className="schema-orders-close" onClick={onClose} aria-label="Stäng resursbehov"><i className="fa-solid fa-xmark" /></button>
        </div>
      </div>
      <div className="schema-resource-needs-drop-hint"><i className="fa-solid fa-hand-pointer" /> Dra ett pass hit för att skapa ett resursbehov</div>
      {activeNeeds.length === 0 ? (
        <div className="schema-orders-empty"><i className="fa-solid fa-user-clock" /><span>Inga resursbehov att visa.</span></div>
      ) : (
        <table className="schema-orders-table">
          <thead><tr><th>Datum</th><th>Medarbetare</th><th>Orsak</th><th>Status</th><th>Pass</th></tr></thead>
          <tbody>
            {activeNeeds.map(need => (
              <tr
                key={need.id}
                className={`schema-order-row schema-resource-need-row schema-resource-need-row-${need.source === 'frånvaro' ? 'absence' : 'extra'}`}
                onDoubleClick={() => onOpenDetails(need)}
                onContextMenu={event => {
                  event.preventDefault();
                  setContextNeedId(need.id);
                  setContextActions(getResourceNeedActions(need));
                }}
                title="Dubbelklicka för detaljer eller högerklicka för åtgärder"
              >
                <td><span className="schema-resource-need-kind">{need.source === 'frånvaro' ? 'Frånvaro' : 'Extrapass'}</span>{need.dateStr}</td>
                <td><strong>{need.personName}</strong><span className="schema-order-person-role">{need.role}</span></td>
                <td>{need.reason ?? 'Pass'}</td>
                <td><span className={`schema-order-status schema-resource-need-status-${need.workflowStatus === 'Tillsatt' || need.status === 'Tillsatt' ? 'filled' : 'open'}`}>{need.workflowStatus ?? need.status}</span></td>
                <td>{need.shift.start}–{need.shift.end}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="schema-resource-needs-bulk-actions">
        <button className="btn-secondary" disabled={activeNeeds.every(need => need.status !== 'Öppet')} onClick={onOrderAll}>
          <i className="fa-solid fa-cart-shopping" /> Beställ alla
        </button>
        {onAssignAll && <button className="btn-primary" disabled={activeNeeds.every(need => need.status !== 'Öppet')} onClick={onAssignAll}>
          <i className="fa-solid fa-robot" /> Tillsätt alla
        </button>}
      </div>
      <ContextMenu
        target=".schema-resource-need-row"
        dataSource={contextActions}
        itemRender={renderSchemaContextMenuItem}
        onItemClick={event => {
          if (contextNeedId && event.itemData) onAction(contextNeedId, event.itemData as ResourceNeedAction);
        }}
      />
    </div>
  );
}

function ResourceNeedDetailCard({ need, order, onAction, onTakeBack }: {
  need: ResourceNeed;
  order?: ResourceOrder;
  onAction: (needId: string, action: ResourceNeedAction) => void;
  onTakeBack?: (needId: string) => void;
}) {
  return (
    <div className="order-detail-card">
      <div className="order-detail-type"><i className="fa-solid fa-user-clock" /> Resursbehov</div>
      <h3>{need.personName}</h3>
      <p className="order-detail-role">{need.role}</p>
      <dl>
        <div><dt>Datum</dt><dd>{need.dateStr}</dd></div>
        <div><dt>Pass</dt><dd>{need.shift.start}–{need.shift.end}</dd></div>
        <div><dt>Orsak</dt><dd>{need.reason ?? 'Skapat från pass'}</dd></div>
        <div><dt>Status</dt><dd><span className={`schema-order-status schema-resource-need-status-${need.workflowStatus === 'Tillsatt' || need.status === 'Tillsatt' ? 'filled' : 'open'}`}>{need.workflowStatus ?? need.status}</span></dd></div>
        <div><dt>Skapat av</dt><dd>{need.createdBy}</dd></div>
        <div><dt>Hanteras av</dt><dd>{need.handledBy}</dd></div>
        {order && <div><dt>Beställning</dt><dd>Beställd av {order.orderedBy} · {order.status} · Hanteras av {order.handledBy}</dd></div>}
      </dl>
      <div className="order-detail-actions">
        {onTakeBack && need.status !== 'Tillsatt' && need.handledBy !== 'Maja Andersson' && <button className="btn-secondary" onClick={() => onTakeBack(need.id)}><i className="fa-solid fa-arrow-rotate-left" /> Ta tillbaka kontrollen</button>}
        {getResourceNeedActions(need).map(action => (
          <button key={action.id} className={action.id === 'assign' ? 'btn-primary' : 'btn-secondary'} onClick={() => onAction(need.id, action)}>
            <i className={`fa-solid fa-${action.icon}`} /> {action.text}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface SchemaProps {
  breadcrumbSectionLabel?: string;
  hideMinimumStaffing?: boolean;
  useAlternativeOrganisationVisualization?: boolean;
  resourceNeedPrototype?: boolean;
}

export const Schema = ({
  breadcrumbSectionLabel = 'Tid & Bemanning',
  hideMinimumStaffing = false,
  useAlternativeOrganisationVisualization = false,
  resourceNeedPrototype = false,
}: SchemaProps) => {
  const navigateTo = useNavigate();
  const automation = useOptionalAutomation();
  const { selectedOrganisation, selectedRoleId } = useRole();
  const isActivityTimelineScenario = selectedOrganisation === 'schoolTimeline';
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Heroma', href: '/' },
    { label: breadcrumbSectionLabel },
    { label: 'Schema', isActive: true },
  ];

  // ── Filter state ──
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedActivityFilters, setSelectedActivityFilters] = useState<ActivityFilterKind[]>([]);
  const [selectedPass,   setSelectedPass]   = useState('alla');
  const [textFilter,     setTextFilter]     = useState('');
  const [period,         setPeriod]         = useState<PeriodType>('vecka');
  const [showVacancies,  setShowVacancies]  = useState(false);
  const [showOrders,     setShowOrders]     = useState(false);
  const [showResourceNeeds, setShowResourceNeeds] = useState(false);
  const [activeView,     setActiveView]     = useState<'schema' | 'orders' | 'resource-needs'>('schema');
  const [viewStart, setViewStart] = useState<Date>(() => initialPeriodStart('vecka', new Date(TODAY_STR)));

  // ── Fills ──
  const [fills, setFills] = useState<ShiftFill[]>(INITIAL_FILLS);
  useEffect(() => {
    setFills(current => {
      const next = current.filter(fill => !(fill.person.name === 'Anna Viksson' && !fill.substituteId));
      return next.length === current.length ? current : next;
    });
  }, []);
  const [remainingPasses, setRemainingPasses] = useState<RemainingPass[]>(INITIAL_REMAINING_PASSES);
  const [activityFills, setActivityFills] = useState<Record<string, ActivityFill>>({});
  const [assignmentFailures, setAssignmentFailures] = useState<Record<string, string>>({});
  const [resourceOrders, setResourceOrders] = useState<ResourceOrder[]>([]);
  const [resourceNeeds, setResourceNeeds] = useState<ResourceNeed[]>([]);
  const [resourceNeedDetail, setResourceNeedDetail] = useState<ResourceNeed | null>(null);
  const [resourceNeedActivities, setResourceNeedActivities] = useState<Record<string, CaseActivity[]>>({});
  const [resourceNeedAssignmentId, setResourceNeedAssignmentId] = useState<string | null>(null);
  const [resourceNeedOrderTargetId, setResourceNeedOrderTargetId] = useState<string | null>(null);
  const automationProcessedNeedIdsRef = useRef<Set<string>>(new Set());
  const [vacancyKeys, setVacancyKeys] = useState<string[]>([]);

  // ── Sub panel ──
  const [subPanelState,   setSubPanelState]   = useState<SubPanelState | null>(null);
  const [subPanelOpen,    setSubPanelOpen]    = useState(false);
  const [substituteAvailabilityOverrides, setSubstituteAvailabilityOverrides] = useState<SubstituteAvailabilityOverrides>({});
  const [substituteAbsences, setSubstituteAbsences] = useState<SubstituteAbsences>({});
  const [substituteDetailState, setSubstituteDetailState] = useState<SubstituteDetailState | null>(null);
  const [returnToSubstitutePanel, setReturnToSubstitutePanel] = useState(false);

  // ── Vikarie panel ──
  const [subPanelBrowseAll, setSubPanelBrowseAll] = useState(false);

  // ── Confirm dialog ──
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [openRequestState, setOpenRequestState] = useState<OpenRequestState | null>(null);
  const [resourceOrderDialogState, setResourceOrderDialogState] = useState<ResourceOrderDialogState | null>(null);
  const [orderDetail, setOrderDetail] = useState<ResourceOrder | null>(null);
  const [orderAssignment, setOrderAssignment] = useState<ResourceOrder | null>(null);
  const [orderActivities, setOrderActivities] = useState<Record<string, CaseActivity[]>>({});
  const [passActivities, setPassActivities] = useState<Record<string, CaseActivity[]>>({});
  const [personActivities, setPersonActivities] = useState<Record<string, CaseActivity[]>>({});
  const [substituteActivities, setSubstituteActivities] = useState<Record<string, CaseActivity[]>>({});

  useEffect(() => {
    setOrderDetail(current => current ? resourceOrders.find(order => order.id === current.id) ?? current : current);
  }, [resourceOrders]);
  useEffect(() => {
    setResourceNeedDetail(current => current ? resourceNeeds.find(need => need.id === current.id) ?? current : current);
  }, [resourceNeeds]);

  const addOrderActivity = useCallback((orderId: string, activity: Omit<CaseActivity, 'id'>) => {
    setOrderActivities(current => ({
      ...current,
      [orderId]: [...(current[orderId] ?? []), { ...activity, id: Date.now() + Math.floor(Math.random() * 1000) }],
    }));
  }, []);
  const addResourceNeedActivity = useCallback((needId: string, activity: Omit<CaseActivity, 'id'>) => {
    setResourceNeedActivities(current => ({
      ...current,
      [needId]: [...(current[needId] ?? []), { ...activity, id: Date.now() + Math.floor(Math.random() * 1000) }],
    }));
  }, []);
  const updateLinkedNeedAfterBooking = useCallback((order: ResourceOrder, substituteId: string, substituteName: string) => {
    const needId = order.id.startsWith('resource-order-') ? order.id.slice('resource-order-'.length) : '';
    const need = resourceNeeds.find(item => item.id === needId);
    if (!need) return;
    setResourceNeeds(current => current.map(item => item.id === needId
      ? { ...item, status: 'Tillsatt' as const, workflowStatus: 'Tillsatt', assignedSubstituteId: substituteId, assignedSubstituteName: substituteName, handledBy: order.handledBy }
      : item));
    addResourceNeedActivity(needId, {
      type: 'assignment', author: 'Du', initials: 'JV', time: 'Just nu',
      text: 'Resursbehovet bokades', detail: `${substituteName} · ${order.shift.start}–${order.shift.end}`,
    });
  }, [addResourceNeedActivity, resourceNeeds]);
  const updateLinkedNeedWorkflowStatus = useCallback((orderId: string, workflowStatus?: ResourceOrderStatus, handledBy?: string) => {
    const needId = orderId.startsWith('resource-order-') ? orderId.slice('resource-order-'.length) : '';
    if (!needId) return;
    setResourceNeeds(current => current.map(need => need.id === needId
      ? {
          ...need,
          workflowStatus,
          ...(workflowStatus === 'Tillsatt' ? { status: 'Tillsatt' as const } : workflowStatus ? {} : { status: 'Öppet' as const }),
          ...(handledBy ? { handledBy } : {}),
        }
      : need));
  }, []);
  const addPassActivity = useCallback((passKey: string, activity: Omit<CaseActivity, 'id'>) => {
    setPassActivities(current => ({
      ...current,
      [passKey]: [...(current[passKey] ?? []), { ...activity, id: Date.now() + Math.floor(Math.random() * 1000) }],
    }));
  }, []);
  const addPersonActivity = useCallback((personId: string, activity: Omit<CaseActivity, 'id'>) => {
    setPersonActivities(current => ({
      ...current,
      [personId]: [...(current[personId] ?? []), { ...activity, id: Date.now() + Math.floor(Math.random() * 1000) }],
    }));
  }, []);
  const addSubstituteActivity = useCallback((substituteId: string, activity: Omit<CaseActivity, 'id'>) => {
    setSubstituteActivities(current => ({
      ...current,
      [substituteId]: [...(current[substituteId] ?? []), { ...activity, id: Date.now() + Math.floor(Math.random() * 1000) }],
    }));
  }, []);
  const [absenceDialogState, setAbsenceDialogState] = useState<AbsenceDialogState | null>(null);

  // ── Shift detail dialog ──
  const [detailState, setDetailState] = useState<DetailState | null>(null);
  const [personDetailId, setPersonDetailId] = useState<string | null>(null);

  // ── Context menu ──
  const [absenceVersion, setAbsenceVersion] = useState(0);
  const [contextActions, setContextActions] = useState<ContextAction[]>(() => getContextActions('vacant', resourceNeedPrototype, false));
  const [personContextId, setPersonContextId] = useState<string | null>(null);
  const [organisationMenu, setOrganisationMenu] = useState<OrganisationGroup | null>(null);
  const [organisationSettings, setOrganisationSettings] = useState<OrganisationGroup | null>(null);
  const [minimumValues, setMinimumValues] = useState<Record<string, number>>({});
  const [minimumDraft, setMinimumDraft] = useState(0);
  const [minimumPassType, setMinimumPassType] = useState('dag');

  // ── Refs ──
  const ctxRef           = useRef<{ personId: string; dateStr: string; type: ContextTargetType } | null>(null);
  const mainWrapperRef   = useRef<HTMLDivElement>(null);
  const subScrollRef     = useRef<HTMLDivElement>(null);
  const isSyncingRef     = useRef(false);
  const [subTableLayout, setSubTableLayout] = useState({ width: 0, inset: 0 });

  // ── Scroll sync between main table and sub panel ──
  useEffect(() => {
    const main  = mainWrapperRef.current;
    const panel = subScrollRef.current;
    if (!main || !panel) return;

    const updateTableLayout = () => {
      const mainTable = main.querySelector<HTMLTableElement>('.schema-table');
      if (!mainTable) return;
      const width = Math.round(mainTable.getBoundingClientRect().width);
      const inset = Math.max(0, Math.round(main.getBoundingClientRect().left - panel.getBoundingClientRect().left));
      setSubTableLayout(current => current.width === width && current.inset === inset ? current : { width, inset });
    };

    const syncMain = () => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;
      panel.scrollLeft = main.scrollLeft;
      requestAnimationFrame(() => { isSyncingRef.current = false; });
    };
    const syncPanel = () => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;
      main.scrollLeft = panel.scrollLeft;
      requestAnimationFrame(() => { isSyncingRef.current = false; });
    };

    main.addEventListener('scroll', syncMain);
    panel.addEventListener('scroll', syncPanel);
    if (subPanelOpen) panel.scrollLeft = main.scrollLeft;
    updateTableLayout();
    const resizeObserver = new ResizeObserver(updateTableLayout);
    resizeObserver.observe(main);
    resizeObserver.observe(panel);

    return () => {
      main.removeEventListener('scroll', syncMain);
      panel.removeEventListener('scroll', syncPanel);
      resizeObserver.disconnect();
    };
  }, [subPanelOpen]);

  // ── Capture right-click target before DX context menu fires ──
  useEffect(() => {
    const onCtx = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest('.schema-ctx-cell') as HTMLElement | null;
      if (el) {
        ctxRef.current = {
          personId: el.dataset.personId!,
          dateStr:  el.dataset.dateStr!,
          type:     el.dataset.ctxType as ContextTargetType,
        };
        const passKey = `${ctxRef.current.personId}|${ctxRef.current.dateStr}`;
        const remainingPass = remainingPasses.find(pass => pass.id === ctxRef.current?.personId && pass.dateStr === ctxRef.current?.dateStr);
        const isAssigned = fills.some(fill => `${fill.personId}|${fill.dateStr}` === passKey)
          || Boolean(remainingPass?.assignedSubstituteId);
        if (remainingPass && !isAssigned) {
          setContextActions([
            { id: 'primary', text: 'Hitta vikarie', icon: 'user' },
            { id: 'order-resource', text: 'Beställ resurs', icon: 'cart-shopping' },
            ...(resourceNeedPrototype ? [{ id: 'assign-direct' as const, text: 'Tillsätt direkt', icon: 'robot', beginGroup: true }] : []),
            { id: 'show-details', text: 'Visa passdetaljer', icon: 'circle-info', beginGroup: true },
          ]);
        } else {
          setContextActions(getContextActions(ctxRef.current.type, resourceNeedPrototype, isAssigned));
        }
      } else {
        ctxRef.current = null;
      }
    };
    document.addEventListener('contextmenu', onCtx, true);
    return () => document.removeEventListener('contextmenu', onCtx, true);
  }, [fills, remainingPasses, resourceNeedPrototype]);

  // ── Employees ──
  const employees = useMemo<ScheduleEmployee[]>(() =>
    persons.map((p, index) => {
      const emp = getActiveEmployment(p.id) ?? p.employments[0];
      const departmentIndex = selectedOrganisation === 'clinic' ? Math.floor(index / 10) : Math.floor(index / 5);
      const teamIndex = selectedOrganisation === 'clinic' ? Math.floor((index % 10) / 5) : 0;
      const clinicDepartment = ORGANISATION.departments[departmentIndex];
      const preschoolIndex = Math.floor(departmentIndex / 2);
      const schoolDepartment = SCHOOL_ORGANISATION.preschools[preschoolIndex]?.departments[departmentIndex % 2];
      const departmentLabel = selectedOrganisation === 'clinic' ? clinicDepartment?.label : schoolDepartment;
      const organisationLabel = selectedOrganisation === 'clinic'
        ? ORGANISATION.clinic.label
        : SCHOOL_ORGANISATION.preschools[preschoolIndex]?.label ?? SCHOOL_ORGANISATION.label;
      return {
        id:         p.id,
        name:       p.displayName || fullName(p),
        role:       (selectedOrganisation === 'clinic' ? CARE_ROLES[index] : PRESCHOOL_ROLES[index]) ?? emp?.position.title ?? '—',
        // Keep the displayed workplace aligned with the organisation tree below.
        // The seed data contains legacy HR/test departments that should not be
        // shown as the employee's current workplace in this prototype.
        organisation: selectedOrganisation === 'clinic'
          ? `Team ${teamIndex + 1}, ${departmentLabel}, ${ORGANISATION.clinic.label}`
          : `${departmentLabel}, ${organisationLabel}`,
        department: departmentLabel ?? emp?.organization.department ?? '—',
        fmgGroup:   emp?.fmgGroup ?? '—',
      };
    }),
  [selectedOrganisation]);

  const getScheduleShift = useCallback((personId: string, date: Date, passFilter: string): Shift | null => {
    if (isSchoolScenario(selectedOrganisation)) {
      if (isWknd(date) || (passFilter !== 'alla' && PASS_TO_SHIFT[passFilter] !== 'day')) return null;
      if (selectedOrganisation === 'schoolTimeline') {
        return getPreschoolDayPattern(persons.findIndex(person => person.id === personId), date)?.shift ?? null;
      }
      return { type: 'day', start: '07:00', end: '17:00' };
    }
    return getCellShift(personId, date, passFilter);
  }, [persons, selectedOrganisation]);
  const getCellActivities = useCallback((personId: string, date: Date) => {
    if (!isActivityTimelineScenario) return [];
    return getPreschoolActivities(personId, persons.findIndex(person => person.id === personId), date);
  }, [isActivityTimelineScenario, persons]);
  useEffect(() => {
    if (!resourceNeedPrototype) return;
    const seededNeedKeys = Object.entries(RUNTIME_ABSENCE_REASONS)
      .filter(([, reason]) => reason === 'Sjuk')
      .map(([key]) => key);
    setVacancyKeys(current => Array.from(new Set([...current, ...seededNeedKeys])));
    const seededNeeds = Object.entries(RUNTIME_ABSENCE_REASONS)
      .filter(([, reason]) => reason === 'Sjuk')
      .map(([key, reason]) => {
        const [personId, dateStr] = key.split('|');
        const employee = employees.find(item => item.id === personId);
        const shift = getScheduleShift(personId, parseDate(dateStr), 'alla');
        if (!employee || !shift) return null;
        return {
          id: `resource-need-${key}`,
          personId,
          personName: employee.name,
          role: employee.role,
          dateStr,
          shift,
          reason,
          source: 'frånvaro' as const,
          status: 'Öppet' as const,
          createdBy: 'Systemet',
          handledBy: 'Lena Sjöberg',
        };
      })
      .filter(Boolean) as ResourceNeed[];
    setResourceNeeds(current => current.length > 0 ? current : seededNeeds);
    setResourceNeedActivities(current => {
      let changed = false;
      const next = { ...current };
      seededNeeds.forEach(need => {
        if (next[need.id]) return;
        next[need.id] = [{
          id: Date.now() + Math.floor(Math.random() * 1000),
          type: 'system', author: 'Systemet', initials: 'S', time: 'Vid registrering',
          text: 'Resursbehov registrerades', detail: `${need.personName} · ${need.dateStr} · ${need.shift.start}–${need.shift.end} · ${need.reason ?? 'Frånvaro'}`,
        }];
        changed = true;
      });
      return changed ? next : current;
    });
  }, [employees, getScheduleShift, resourceNeedPrototype]);

  const columns  = useMemo(() => getColumns(viewStart, period).filter(column =>
    !isSchoolScenario(selectedOrganisation)
      || period === 'ar'
      || period === 'vecka'
      || period === 'sjuDagar'
      || !isWknd(column.date),
  ), [viewStart, period, selectedOrganisation]);
  useEffect(() => {
    if (!isSchoolScenario(selectedOrganisation) || period !== 'dag' || !isWknd(viewStart)) return;
    setViewStart(current => addDays(current, current.getDay() === 6 ? 2 : 1));
  }, [period, selectedOrganisation, viewStart]);
  const viewType = useMemo(() => getViewType(period),            [period]);
  const pLabel   = useMemo(() => {
    if (period === 'sjuDagar' || period === 'femDagar') {
      const first = columns[0]?.date ?? viewStart;
      const last = columns[columns.length - 1]?.date ?? first;
      return `${fmtMid(first)} – ${fmtLong(last)}`;
    }
    if (isSchoolScenario(selectedOrganisation) && period === 'period') {
      return `${fmtMid(viewStart)} – ${fmtLong(addDays(viewStart, 4))}`;
    }
    return periodLabel(viewStart, period);
  }, [columns, viewStart, period, selectedOrganisation]);
  const viewColumnWidth = isActivityTimelineScenario && viewType === 'month-columns' ? 130 : VIEW_COLUMN_WIDTH[viewType];
  const scheduleTableMinWidth = EMPLOYEE_COLUMN_WIDTH + viewColumnWidth * columns.length;
  const scenarioSubstituteCandidates = useMemo(() => isSchoolScenario(selectedOrganisation)
    ? SUBSTITUTE_CANDIDATES.map(candidate => ({ ...candidate, ...PRESCHOOL_SUBSTITUTE_PROFILES[candidate.id] }))
    : SUBSTITUTE_CANDIDATES.map(candidate => SUB_DETAILS[candidate.id] ? candidate : ({
        ...candidate,
        competencies: candidate.role === 'Sjuksköterska'
          ? ['Omvårdnad', 'Läkemedelshantering', 'Dokumentation']
          : ['Basal omvårdnad', 'Förflyttning', 'Dokumentation'],
      })),
  [selectedOrganisation]);
  const internalSubstituteCandidates = useMemo<SubstituteCandidate[]>(() => isActivityTimelineScenario
    ? employees.map((employee, index) => {
        const isPoolEmployee = POOL_PERSON_INDICES.has(index);
        const role = PRESCHOOL_ROLES[index] ?? employee.role;
        return {
          id: internalCandidateId(employee.id),
          name: employee.name,
          role,
          category: isPoolEmployee ? 'Samverkanspass' : 'Tillgänglig medarbetare',
          costLevel: isPoolEmployee ? 'Gratis' : 'Kostnadsnivå 2',
          competencies: isPoolEmployee ? ['Pool i verksamheten', 'Barnsäkerhet'] : ['Barnsäkerhet', 'Första hjälpen'],
        };
      })
    : [], [employees, isActivityTimelineScenario]);
  const panelCandidates = useMemo(() => [...scenarioSubstituteCandidates, ...internalSubstituteCandidates], [internalSubstituteCandidates, scenarioSubstituteCandidates]);
  const scenarioCandidateAvailabilityOverrides = useMemo<SubstituteAvailabilityOverrides>(() => {
    if (!isSchoolScenario(selectedOrganisation)) return {};
    const overrides: SubstituteAvailabilityOverrides = {};
    scenarioSubstituteCandidates.forEach(candidate => columns.forEach(column => {
      const dateStr = toDateStr(column.date);
      const key = substituteAvailabilityKey(candidate.id, dateStr);
      overrides[key] = isWknd(column.date) ? null : { startH: 7, startM: 0, endH: 17, endM: 0 };
    }));
    return overrides;
  }, [columns, scenarioSubstituteCandidates, selectedOrganisation]);
  const internalAvailabilityOverrides = useMemo<SubstituteAvailabilityOverrides>(() => {
    if (!isActivityTimelineScenario) return {};
    const overrides: SubstituteAvailabilityOverrides = {};
    employees.forEach((employee, index) => {
      const candidateId = internalCandidateId(employee.id);
      columns.forEach(column => {
        const dateStr = toDateStr(column.date);
        const hasPoolDutyToday = !isWknd(column.date) && hasPoolDuty(index, column.date);
        const isBookedBySchedule = Boolean(getScheduleShift(employee.id, column.date, 'alla')) && !hasPoolDutyToday;
        const isAssigned = fills.some(fill => fill.substituteId === candidateId && fill.dateStr === dateStr)
          || Object.values(activityFills).some(fill => fill.substituteId === candidateId && fill.dateStr === dateStr)
          || remainingPasses.some(pass => pass.assignedSubstituteId === candidateId && pass.dateStr === dateStr);
        const isAvailable = !isBookedBySchedule && !isAssigned
          && (hasPoolDutyToday || isSelfAvailablePreschoolEmployee(index, column.date));
        overrides[substituteAvailabilityKey(candidateId, dateStr)] = isAvailable
          ? { startH: 7, startM: 0, endH: 17, endM: 0 }
          : null;
      });
    });
    return overrides;
  }, [activityFills, columns, employees, fills, getScheduleShift, isActivityTimelineScenario, remainingPasses]);
  const effectiveAvailabilityOverrides = useMemo<SubstituteAvailabilityOverrides>(() => {
    const overrides = { ...scenarioCandidateAvailabilityOverrides, ...internalAvailabilityOverrides, ...substituteAvailabilityOverrides };
    if (isActivityTimelineScenario) {
      const newlyAssigned = [
        ...fills.filter(fill => fill.substituteId).map(fill => ({
          candidateId: fill.substituteId,
          dateStr: fill.dateStr,
        })),
        ...Object.values(activityFills).map(fill => ({ candidateId: fill.substituteId, dateStr: fill.dateStr })),
        ...remainingPasses.filter(pass => pass.assignedSubstituteId).map(pass => ({ candidateId: pass.assignedSubstituteId!, dateStr: pass.dateStr })),
      ];
      newlyAssigned.forEach(({ candidateId, dateStr }) => {
        if (candidateId) overrides[substituteAvailabilityKey(candidateId, dateStr)] = null;
      });
      employees.forEach(employee => {
        const candidateId = internalCandidateId(employee.id);
        columns.forEach(column => {
          const dateStr = toDateStr(column.date);
          const employeeIndex = employees.findIndex(item => item.id === employee.id);
          const isBookedBySchedule = Boolean(getScheduleShift(employee.id, column.date, 'alla')) && !hasPoolDuty(employeeIndex, column.date);
          const isAssigned = fills.some(fill => fill.substituteId === candidateId && fill.dateStr === dateStr)
            || Object.values(activityFills).some(fill => fill.substituteId === candidateId && fill.dateStr === dateStr);
          if (isBookedBySchedule || isAssigned) overrides[substituteAvailabilityKey(candidateId, dateStr)] = null;
        });
      });
    }
    return overrides;
  }, [activityFills, columns, employees, fills, getScheduleShift, internalAvailabilityOverrides, isActivityTimelineScenario, remainingPasses, scenarioCandidateAvailabilityOverrides, substituteAvailabilityOverrides]);
  const candidateBookings = useMemo<Record<string, SubBookedShift[]>>(() => {
    if (!isActivityTimelineScenario) return SUB_BOOKED_SHIFTS;
    const bookings: Record<string, SubBookedShift[]> = { ...SUB_BOOKED_SHIFTS };
    employees.forEach((employee, employeeIndex) => {
      const candidateId = internalCandidateId(employee.id);
      const scheduled = columns.flatMap(column => {
        if (!isWknd(column.date) && hasPoolDuty(employeeIndex, column.date)) return [];
        const shift = getScheduleShift(employee.id, column.date, 'alla');
        return shift ? [{ dateStr: toDateStr(column.date), start: shift.start, end: shift.end }] : [];
      });
      bookings[candidateId] = scheduled;
    });
    fills.forEach(fill => {
      const candidateId = fill.substituteId;
      const shift = fill.shift ?? getScheduleShift(fill.personId, parseDate(fill.dateStr), 'alla');
      if (!candidateId || !shift) return;
      bookings[candidateId] = [...(bookings[candidateId] ?? []), { dateStr: fill.dateStr, start: shift.start, end: shift.end }];
    });
    Object.values(activityFills).forEach(fill => {
      bookings[fill.substituteId] = [...(bookings[fill.substituteId] ?? []), { dateStr: fill.dateStr, start: fill.shift.start, end: fill.shift.end }];
    });
    remainingPasses.forEach(pass => {
      if (!pass.assignedSubstituteId) return;
      bookings[pass.assignedSubstituteId] = [...(bookings[pass.assignedSubstituteId] ?? []), { dateStr: pass.dateStr, start: pass.shift.start, end: pass.shift.end }];
    });
    return bookings;
  }, [activityFills, columns, employees, fills, getScheduleShift, isActivityTimelineScenario, remainingPasses]);

  const personDetailEmployee = personDetailId
    ? employees.find(employee => employee.id === personDetailId) ?? null
    : null;
  const personDetailShiftDates = useMemo(() => {
    if (!personDetailEmployee) return [];
    return getPeriodDates(viewStart, period, columns)
      .filter(date => Boolean(getScheduleShift(personDetailEmployee.id, date, 'alla')))
      .map(toDateStr);
  }, [absenceVersion, columns, getScheduleShift, period, personDetailEmployee, viewStart]);
  const personDetailSchedules = useMemo<Record<string, EmployeeDaySchedule> | undefined>(() => {
    if (!personDetailEmployee || !isActivityTimelineScenario) return undefined;
    const schedules: Record<string, EmployeeDaySchedule> = {};
    getPeriodDates(viewStart, period, columns).forEach(date => {
      const shift = getScheduleShift(personDetailEmployee.id, date, 'alla');
      if (!shift) return;
      const dateStr = toDateStr(date);
      schedules[dateStr] = {
        dateStr,
        shift,
        activities: getCellActivities(personDetailEmployee.id, date),
        absenceLabel: getAbsenceCaption(personDetailEmployee.id, dateStr),
      };
    });
    return schedules;
  }, [columns, getCellActivities, getScheduleShift, isActivityTimelineScenario, period, personDetailEmployee, viewStart]);
  const passDetailKey = detailState ? `${detailState.empId}|${detailState.dateStr}` : '';
  const passDetailAssignmentFailure = detailState ? assignmentFailures[passDetailKey] : undefined;
  const passDetailResourceNeed = resourceNeedPrototype && detailState
    ? resourceNeeds.find(need => need.personId === detailState.empId && need.dateStr === detailState.dateStr && need.status !== 'Borttaget')
    : undefined;
  const passDetailResourceNeedOrder = passDetailResourceNeed
    ? resourceOrders.find(order => order.id === `resource-order-${passDetailResourceNeed.id}`)
    : undefined;
  const passDetailAssignedFill = detailState
    ? fills.find(fill => fill.personId === detailState.empId && fill.dateStr === detailState.dateStr)
    : undefined;
  const passDetailRemainingPass = detailState
    ? remainingPasses.find(pass => pass.id === detailState.empId)
    : undefined;
  const passDetailAssignedPerson = passDetailAssignedFill?.person ?? (passDetailRemainingPass?.assignedSubstituteId
    ? {
        name: passDetailRemainingPass.assignedSubstituteName ?? panelCandidates.find(candidate => candidate.id === passDetailRemainingPass.assignedSubstituteId)?.name ?? 'Vikarie',
        role: panelCandidates.find(candidate => candidate.id === passDetailRemainingPass.assignedSubstituteId)?.role ?? 'Vikarie',
      }
    : undefined);
  const passDetailSchedule = useMemo<EmployeeDaySchedule | undefined>(() => {
    if (!detailState || !isActivityTimelineScenario) return undefined;
    return {
      dateStr: detailState.dateStr,
      shift: detailState.shift,
      activities: passDetailRemainingPass?.activities ?? getCellActivities(detailState.empId, parseDate(detailState.dateStr)),
      absenceLabel: passDetailRemainingPass ? (passDetailRemainingPass.assignedSubstituteId ? undefined : 'Vakans') : getAbsenceCaption(detailState.empId, detailState.dateStr),
    };
  }, [detailState, getCellActivities, isActivityTimelineScenario, passDetailRemainingPass]);
  const passDetailActivities = useMemo<CaseActivity[]>(() => {
    if (!detailState) return [];
    const passOrder = resourceOrders.find(order => order.personId === detailState.empId && order.dateStr === detailState.dateStr);
    const activities: CaseActivity[] = [{
      id: -1,
      type: 'system',
      author: 'Systemet',
      initials: 'S',
      time: 'Schemalagt',
      text: 'Passet finns i schemat',
      detail: `${detailState.dateStr} · ${detailState.shift.start}–${detailState.shift.end}`,
    }];
    if (RUNTIME_ABSENCE_SHIFTS[passDetailKey]) {
      activities.push({
        id: -2,
        type: 'status',
        author: 'Systemet',
        initials: 'S',
        time: 'Aktuell status',
        text: 'Frånvaro registrerad',
        detail: RUNTIME_ABSENCE_REASONS[passDetailKey] ?? 'Frånvaro',
      });
    }
    if (passDetailRemainingPass) {
      activities.push({
        id: -3,
        type: passDetailRemainingPass.assignedSubstituteId ? 'assignment' : 'status',
        author: 'Systemet',
        initials: 'S',
        time: 'Aktuell status',
        text: passDetailRemainingPass.assignedSubstituteName ? 'Pass kvar tillsattes' : 'Vakans – pass kvar',
        detail: `${passDetailRemainingPass.unit}${passDetailRemainingPass.assignedSubstituteName ? ` · ${passDetailRemainingPass.assignedSubstituteName}` : ''}`,
      });
    }
    return [
      ...activities,
      ...(passActivities[passDetailKey] ?? []),
      ...(passDetailResourceNeed ? resourceNeedActivities[passDetailResourceNeed.id] ?? [] : []),
      ...(passOrder ? orderActivities[passOrder.id] ?? [] : []),
    ];
  }, [detailState, orderActivities, passActivities, passDetailKey, passDetailRemainingPass, passDetailResourceNeed, resourceNeedActivities, resourceOrders]);
  const personDetailActivities = useMemo<CaseActivity[]>(() => {
    if (!personDetailEmployee) return [];
    return [{
      id: -1,
      type: 'system',
      author: 'Systemet',
      initials: 'S',
      time: 'Aktuell uppgift',
      text: 'Aktiv i schemat',
      detail: `${personDetailEmployee.role} · ${personDetailEmployee.organisation}`,
    }, ...(personActivities[personDetailEmployee.id] ?? [])];
  }, [personActivities, personDetailEmployee]);
  const substituteDetail = substituteDetailState
    ? panelCandidates.find(substitute => substitute.id === substituteDetailState.substituteId) ?? null
    : null;
  const substituteDetailSource = substituteDetail ? SUB_DETAILS[substituteDetail.id] : null;
  const substituteDetailInfo = substituteDetailSource
    ? { ...substituteDetailSource, competencies: substituteDetail?.competencies ?? substituteDetailSource.competencies }
    : null;
  const substituteDetailDates = useMemo(() => {
    const visibleDates = columns.map(column => toDateStr(column.date));
    if (substituteDetailState?.dateStr && !visibleDates.includes(substituteDetailState.dateStr)) {
      return [substituteDetailState.dateStr, ...visibleDates];
    }
    return visibleDates.length > 0 ? visibleDates : [TODAY_STR];
  }, [columns, substituteDetailState?.dateStr]);
  const substituteDetailKey = substituteDetailState
    ? substituteAvailabilityKey(substituteDetailState.substituteId, substituteDetailState.dateStr)
    : '';
  const substituteDetailAvailability = substituteDetailState
    ? getSubAvailability(substituteDetailState.substituteId, parseDate(substituteDetailState.dateStr), effectiveAvailabilityOverrides, substituteAbsences)
    : null;
  const substituteDetailBooking = substituteDetailState
    ? (candidateBookings[substituteDetailState.substituteId] ?? []).find(booking => booking.dateStr === substituteDetailState.dateStr)
    : undefined;
  const substituteDetailActivities = useMemo<CaseActivity[]>(() => {
    if (!substituteDetail || !substituteDetailInfo) return [];
    return [{
      id: -1,
      type: 'system',
      author: 'Systemet',
      initials: 'S',
      time: 'Aktuell uppgift',
      text: 'Tillgänglig som vikarie',
      detail: `${substituteDetail.role} · ${substituteDetail.category} · ATL ${substituteDetailInfo.atlHours}/${substituteDetailInfo.maxAtlHours} h`,
    }, ...(substituteActivities[substituteDetail.id] ?? [])];
  }, [substituteActivities, substituteDetail, substituteDetailInfo]);

  const filteredEmployees = useMemo(() => {
    let list = employees;
    if (selectedGroups.length > 0 && !selectedGroups.includes('alla'))
      list = list.filter(e => selectedGroups.some(gid => {
        if (gid === 'samverkanspass') {
          const employeeIndex = employees.findIndex(employee => employee.id === e.id);
          return columns.some(column => hasPoolDuty(employeeIndex, column.date));
        }
        return matchGroup(e, gid);
      }));
    if (textFilter.trim()) {
      const q = textFilter.toLowerCase();
      list = list.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q)
      );
    }
    if (showVacancies) {
      list = list.filter(emp =>
        columns.some(col => {
          const ds = toDateStr(col.date);
          if (resourceNeedPrototype) {
            return Boolean(RUNTIME_ABSENCE_SHIFTS[`${emp.id}|${ds}`]) || resourceNeeds.some(need =>
              need.personId === emp.id && need.dateStr === ds && need.status !== 'Borttaget',
            );
          }
          return vacancyKeys.includes(`${emp.id}|${ds}`) &&
            !fills.some(f => f.personId === emp.id && f.dateStr === ds);
        })
      );
    }
    return list;
  }, [employees, selectedGroups, textFilter, showVacancies, columns, fills, vacancyKeys, resourceNeedPrototype, resourceNeeds]);

  const positiveResponseCount = resourceOrders.reduce((count, order) => {
    if (order.status === 'Tillsatt' || order.status === 'Avbruten') return count;
    return count + order.invitedSubstitutes.filter(invite => invite.response === 'Tillgänglig').length;
  }, 0);

  const availableGroups = useMemo(() => {
    return [
      { id:'alla', label:'Alla medarbetare', category:'team' as const },
      ...ALL_GROUPS.filter(g => g.id !== 'alla' && (!isSchoolScenario(selectedOrganisation) || g.category !== 'team')),
    ];
  }, [selectedOrganisation]);

  // Each activity is a real staffing focus beneath a team, rather than a shift or absence.
  const organisationGroups = useMemo(() => {
    const ids = filteredEmployees.map(employee => employee.id);
    const visibleIds = new Set(ids);
    const members = (start: number, end: number) => employees.slice(start, end).map(employee => employee.id).filter(id => visibleIds.has(id));
    const root = selectedOrganisation === 'clinic' ? ORGANISATION.clinic : SCHOOL_ORGANISATION;
    const result: OrganisationGroup[] = [
      { id: root.id, label: root.label, kind: 'clinic', personIds: ids, depth: 0 },
    ];
    const addActivityGroups = (parentId: string, personIds: string[], depth: number) => {
      const midpoint = Math.ceil(personIds.length / 2);
      const activityLabels = selectedOrganisation === 'clinic' ? ACTIVITIES_BY_ORGANISATION.clinic : ACTIVITIES_BY_ORGANISATION.school;
      activityLabels.forEach((label, index) => {
        const activityIds = personIds.slice(index === 0 ? 0 : midpoint, index === 0 ? midpoint : undefined);
        if (!activityIds.length) return;
        result.push({ id: `${parentId}-activity-${index + 1}`, label, kind: 'activity', parentId, personIds: activityIds, depth });
      });
    };
    const addTeamWithActivities = (teamId: string, teamLabel: string, parentId: string, personIds: string[], depth: number) => {
      result.push({ id: teamId, label: teamLabel, kind: 'team', parentId, personIds, depth });
      addActivityGroups(teamId, personIds, depth + 1);
    };
    if (selectedOrganisation === 'clinic') {
      ORGANISATION.departments.forEach((department, departmentIndex) => {
        const departmentIds = members(departmentIndex * 10, (departmentIndex + 1) * 10);
        result.push({ ...department, kind: 'department', parentId: root.id, personIds: departmentIds, depth: 1 });
        [0, 1].forEach(teamIndex => {
          const teamIds = members(departmentIndex * 10 + teamIndex * 5, departmentIndex * 10 + (teamIndex + 1) * 5);
          addTeamWithActivities(`${department.id}-team-${teamIndex + 1}`, `Team ${teamIndex + 1}`, department.id, teamIds, 2);
        });
      });
    } else {
      SCHOOL_ORGANISATION.preschools.forEach((preschool, preschoolIndex) => {
        const preschoolIds = members(preschoolIndex * 10, (preschoolIndex + 1) * 10);
        result.push({ id: preschool.id, label: preschool.label, kind: 'department', parentId: root.id, personIds: preschoolIds, depth: 1 });
        preschool.departments.forEach((departmentLabel, departmentIndex) => {
          const globalDepartmentIndex = preschoolIndex * 2 + departmentIndex;
          const departmentId = `${preschool.id}-avdelning-${departmentIndex + 1}`;
          const departmentIds = members(globalDepartmentIndex * 5, (globalDepartmentIndex + 1) * 5);
          result.push({ id: departmentId, label: `Avdelning ${departmentLabel}`, kind: 'department', parentId: preschool.id, personIds: departmentIds, depth: 2 });
          if (!isActivityTimelineScenario) addActivityGroups(departmentId, departmentIds, 3);
        });
      });
    }
    return result;
  }, [employees, filteredEmployees, isActivityTimelineScenario, selectedOrganisation]);

  const resourceBoardOrgOptions = useMemo<ResourceBoardOrgOption[]>(() => {
    const allPersonIds = employees.map(employee => employee.id);
    const options: ResourceBoardOrgOption[] = [];
    if (selectedOrganisation === 'clinic') {
      options.push({ id: ORGANISATION.clinic.id, label: ORGANISATION.clinic.label, level: 'organisation', personIds: allPersonIds });
      ORGANISATION.departments.forEach((department, departmentIndex) => {
        const departmentMembers = employees.slice(departmentIndex * 10, (departmentIndex + 1) * 10).map(employee => employee.id);
        options.push({ id: department.id, label: department.label, level: 'department', personIds: departmentMembers });
        [0, 1].forEach(teamIndex => options.push({
          id: `${department.id}-team-${teamIndex + 1}`,
          label: `Team ${teamIndex + 1}`,
          level: 'team',
          personIds: employees.slice(departmentIndex * 10 + teamIndex * 5, departmentIndex * 10 + (teamIndex + 1) * 5).map(employee => employee.id),
        }));
      });
    } else {
      options.push({ id: 'education-administration', label: 'Utbildningsförvaltningen', level: 'education', personIds: allPersonIds });
      options.push({ id: SCHOOL_ORGANISATION.id, label: SCHOOL_ORGANISATION.label, level: 'rectorate', personIds: allPersonIds });
      SCHOOL_ORGANISATION.preschools.forEach((preschool, preschoolIndex) => {
        const preschoolMembers = employees.slice(preschoolIndex * 10, (preschoolIndex + 1) * 10).map(employee => employee.id);
        options.push({ id: preschool.id, label: preschool.label, level: 'preschool', personIds: preschoolMembers });
        preschool.departments.forEach((departmentLabel, departmentIndex) => {
          const groupIndex = preschoolIndex * 2 + departmentIndex;
          options.push({
            id: `${preschool.id}-avdelning-${departmentIndex + 1}`,
            label: `Avdelning ${departmentLabel}`,
            level: 'department',
            personIds: employees.slice(groupIndex * 5, (groupIndex + 1) * 5).map(employee => employee.id),
          });
        });
      });
    }
    return options;
  }, [employees, selectedOrganisation]);
  const resourceBoardActivityKinds = useMemo<ActivityKind[]>(() =>
    isActivityTimelineScenario ? Object.keys(PRESCHOOL_ACTIVITY_TYPES) as ActivityKind[] : [],
  [isActivityTimelineScenario]);

  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  useEffect(() => {
    setSelectedGroups([]);
    setSelectedPass('alla');
    setCollapsedGroups([]);
  }, [selectedOrganisation]);
  useEffect(() => {
    setViewStart(initialPeriodStart(period, new Date(TODAY_STR)));
  }, [period, selectedOrganisation]);
  const toggleGroup = (id: string) => setCollapsedGroups(current =>
    current.includes(id) ? current.filter(groupId => groupId !== id) : [...current, id],
  );

  const minimumKey = (group: OrganisationGroup, passType: string) => `${group.id}|${passType}`;
  const minimumFor = (group: OrganisationGroup, passType = selectedPass === 'alla' ? 'dag' : selectedPass) =>
    minimumValues[minimumKey(group, passType)] ?? Math.ceil(group.personIds.length * 0.6);

  const passTypesForTeam = (group: OrganisationGroup) => PASS_TYPES.filter(pass => pass.id !== 'alla' && group.personIds.some(personId =>
    columns.some(column => Boolean(getScheduleShift(personId, column.date, pass.id))),
  ));

  const openOrganisationSettings = (group: OrganisationGroup) => {
    if (group.kind !== 'team') return;
    const availablePassTypes = passTypesForTeam(group);
    const initialPassType = availablePassTypes[0]?.id ?? 'alla';
    setOrganisationSettings(group);
    setMinimumPassType(initialPassType);
    setMinimumDraft(minimumFor(group, initialPassType));
    setOrganisationMenu(null);
  };

  const poolPeopleInGroup = (group: OrganisationGroup) => {
    const dates = columns.map(column => column.date);
    return group.personIds.filter(personId => {
      const index = employees.findIndex(employee => employee.id === personId);
      return dates.some(date => (!isSchoolScenario(selectedOrganisation) || !isWknd(date)) && hasPoolDuty(index, date));
    }).length;
  };

  const teamBelowMinimum = (group: OrganisationGroup, col: ViewColumn) => {
    if (group.kind !== 'team' || selectedPass === 'alla') return false;
    const scheduled = group.personIds.filter(personId => Boolean(getScheduleShift(personId, col.date, selectedPass))).length;
    if (scheduled === 0) return false;
    const summary = renderPresenceCell(group.personIds, col);
    return summary.present < minimumFor(group, selectedPass);
  };

  const renderPresenceCell = (personIds: string[], col: ViewColumn) => {
    if (viewType === 'year-columns') {
      const y = col.date.getFullYear();
      const m = col.date.getMonth();
      const days = daysInMonth(y, m);
      let present = 0;
      let absent = 0;
      let pool = 0;
      personIds.forEach(id => {
        for (let day = 1; day <= days; day += 1) {
          const date = new Date(y, m, day);
          const shift = getScheduleShift(id, date, selectedPass);
          if (shift) {
            if (RUNTIME_ABSENCE_SHIFTS[`${id}|${toDateStr(date)}`]) absent += 1;
            else present += 1;
          }
          if ((!isSchoolScenario(selectedOrganisation) || !isWknd(date)) && hasPoolDuty(employees.findIndex(employee => employee.id === id), date)) pool += 1;
        }
      });
      const total = Math.max(1, present + absent);
      return { present, absent, pool, presentWidth: `${present / total * 100}%`, absentWidth: `${absent / total * 100}%` };
    }
    let present = 0;
    let absent = 0;
    let pool = 0;
    personIds.forEach(id => {
      const ds = toDateStr(col.date);
      if (getScheduleShift(id, col.date, selectedPass)) {
        if (RUNTIME_ABSENCE_SHIFTS[`${id}|${ds}`]) absent += 1;
        else present += 1;
      }
      if (hasPoolDuty(employees.findIndex(employee => employee.id === id), col.date)) pool += 1;
    });
    const total = Math.max(1, personIds.length);
    return { present, absent, pool, presentWidth: `${present / total * 100}%`, absentWidth: `${absent / total * 100}%` };
  };

  const renderOrganisationRow = (group: OrganisationGroup) => {
    const collapsed = collapsedGroups.includes(group.id);
    const poolPeople = poolPeopleInGroup(group);
    return (
      <tr key={group.id} className={`schema-org-row schema-org-${group.kind} schema-org-level-${group.depth ?? 0}`}>
        <td
          className="schema-employee-cell schema-org-label-cell"
          style={{ paddingLeft: `${10 + (group.depth ?? 0) * 18}px` }}
          onContextMenu={event => { event.preventDefault(); setOrganisationMenu(group); }}
        >
          <button className="schema-org-toggle" onClick={() => toggleGroup(group.id)} aria-label={`${collapsed ? 'Visa' : 'Dölj'} ${group.label}`}>
            <i className={`fa-solid fa-chevron-${collapsed ? 'right' : 'down'}`} />
          </button>
          <span className="schema-org-label">{group.label}</span>
          {poolPeople > 0 && (
            <span className="schema-org-label-pool-dots" aria-label={`${poolPeople} medarbetare med samverkanspass`}>
              {Array.from({ length: Math.min(poolPeople, 4) }, (_, dotIndex) => <i key={dotIndex} />)}
            </span>
          )}
        </td>
        {columns.map((col, index) => {
          const summary = renderPresenceCell(group.personIds, col);
          const belowMinimum = !hideMinimumStaffing && teamBelowMinimum(group, col);
          const pastOrganisationCell = resourceNeedPrototype && toDateStr(col.date) < TODAY_STR;
          return (
            <td key={index} className={['schema-day-cell', 'schema-org-summary-cell', col.isWeekend ? 'schema-weekend-cell' : '', toDateStr(col.date) === TODAY_STR ? 'schema-today-col' : '', pastOrganisationCell ? 'schema-org-past-cell' : '', belowMinimum ? 'schema-org-under-minimum' : ''].filter(Boolean).join(' ')} title={belowMinimum ? 'Ett eller flera team ligger under minimibemanning' : undefined}>
              {useAlternativeOrganisationVisualization ? (
                <div className="schema-org-coverage-content" aria-label={`${summary.present} på plats, ${summary.absent} frånvarande, ${summary.pool} i pool`}>
                  <div className="schema-org-coverage-numbers" aria-label={`${summary.present} av ${group.personIds.length} på plats`}>
                    <span className={summary.present < group.personIds.length ? 'schema-org-coverage-present-missing' : 'schema-org-coverage-present'}>{summary.present}</span>
                    <span className="schema-org-coverage-target">{group.personIds.length}</span>
                  </div>
                  <span className="schema-org-coverage-label">på plats / börvärde</span>
                </div>
              ) : (
                <div className="schema-org-summary-content" aria-label={`${summary.present} på plats, ${summary.absent} frånvarande, ${summary.pool} i pool`}>
                  <div className="schema-org-summary-bar">
                    <span className="schema-org-present-bar" style={{ width: summary.presentWidth }} />
                    <span className="schema-org-absent-bar" style={{ width: summary.absentWidth }} />
                    {group.kind === 'team' && <span className="schema-org-minimum-marker" style={{ left: `${minimumFor(group, selectedPass === 'alla' ? 'dag' : selectedPass) / Math.max(1, group.personIds.length) * 100}%` }} />}
                  </div>
                  <span className="schema-org-summary-numbers"><b>{summary.present} av {group.personIds.length}</b></span>
                  <span
                    className={`schema-org-pool-count${summary.pool === 0 ? ' schema-org-pool-count-empty' : ''}`}
                    aria-label={summary.pool > 0 ? `${summary.pool} samverkanspass` : undefined}
                    aria-hidden={summary.pool === 0 ? true : undefined}
                  >
                    {Array.from({ length: Math.min(summary.pool, 4) }, (_, dotIndex) => <i key={dotIndex} />)}
                  </span>
                </div>
              )}
            </td>
          );
        })}
      </tr>
    );
  };

  type ScheduleRow =
    | { type: 'group'; group: OrganisationGroup }
    | { type: 'employee'; employee: typeof employees[number] }
    | { type: 'remaining-pass'; pass: RemainingPass };

  // Build the visible rows as a real tree projection. This keeps sibling branches intact
  // regardless of which department or team is opened or closed.
  const scheduleRows: ScheduleRow[] = [];
  const rootId = selectedOrganisation === 'clinic' ? ORGANISATION.clinic.id : SCHOOL_ORGANISATION.id;
  const visibleRemainingPasses = isActivityTimelineScenario && viewType !== 'year-columns'
    ? remainingPasses.filter(pass => columns.some(column => toDateStr(column.date) === pass.dateStr))
    : [];
  const groupsContainingRemainingPasses = new Set<string>();
  visibleRemainingPasses.forEach(pass => {
    let groupId: string | undefined = pass.unitId;
    while (groupId) {
      groupsContainingRemainingPasses.add(groupId);
      groupId = organisationGroups.find(group => group.id === groupId)?.parentId;
    }
  });
  const appendGroup = (group: OrganisationGroup) => {
    if (group.personIds.length === 0 && !groupsContainingRemainingPasses.has(group.id)) return;
    scheduleRows.push({ type: 'group', group });
    if (collapsedGroups.includes(group.id)) return;
    if (group.kind === 'activity') {
      group.personIds.forEach(personId => {
        const employee = filteredEmployees.find(item => item.id === personId);
        if (employee) scheduleRows.push({ type: 'employee', employee });
      });
      return;
    }
    if (isActivityTimelineScenario && group.kind === 'department' && group.depth === 2) {
      group.personIds.forEach(personId => {
        const employee = filteredEmployees.find(item => item.id === personId);
        if (employee) scheduleRows.push({ type: 'employee', employee });
      });
      visibleRemainingPasses
        .filter(pass => pass.unitId === group.id)
        .forEach(pass => scheduleRows.push({ type: 'remaining-pass', pass }));
      return;
    }
    organisationGroups.filter(child => child.parentId === group.id).forEach(appendGroup);
  };
  const rootGroup = organisationGroups.find(group => group.id === rootId);
  if (rootGroup) appendGroup(rootGroup);
  // ── Handlers: navigation / filters ──
  const navigate = (dir: 1|-1) => setViewStart(prev => {
    let next = navStep(period, dir, prev);
    if (isSchoolScenario(selectedOrganisation) && period === 'dag' && isWknd(next)) {
      next = addDays(next, dir > 0 ? (next.getDay() === 6 ? 2 : 1) : (next.getDay() === 0 ? -2 : -1));
    }
    return next;
  });

  const changePeriod = (p: PeriodType) => {
    setPeriod(p);
    setViewStart(initialPeriodStart(p, new Date(TODAY_STR)));
  };

  // ── Handlers: sub panel ──
  const createResourceNeed = useCallback((personId: string, dateStr: string, shift: Shift, reason?: AbsenceReason, source: 'frånvaro' | 'pass' = 'pass') => {
    if (!resourceNeedPrototype) return;
    const employee = employees.find(item => item.id === personId);
    if (!employee) return;
    const id = `resource-need-${personId}-${dateStr}`;
    setResourceNeeds(current => {
      const existing = current.find(need => need.id === id);
      if (existing?.status === 'Öppet' || existing?.status === 'Tillsatt') return current;
      const next = current.filter(need => need.id !== id);
      return [...next, {
        id,
        personId,
        personName: employee.name,
        role: employee.role,
        dateStr,
        shift,
        reason,
        source,
        status: 'Öppet' as const,
        createdBy: 'Du',
        handledBy: 'Lena Sjöberg',
      }];
    });
    setVacancyKeys(previous => previous.includes(`${personId}|${dateStr}`) ? previous : [...previous, `${personId}|${dateStr}`]);
    addResourceNeedActivity(id, {
      type: 'status', author: 'Du', initials: 'JV', time: 'Just nu',
      text: 'Resursbehov skapades',
      detail: `${employee.name} · ${dateStr} · ${shift.start}–${shift.end}${reason ? ` · ${reason}` : ''}`,
    });
  }, [addResourceNeedActivity, employees, resourceNeedPrototype]);

  useEffect(() => {
    if (!resourceNeedPrototype || !automation?.isAutomationActive) return;
    Object.entries(RUNTIME_ABSENCE_SHIFTS).forEach(([key]) => {
      const [personId, dateStr] = key.split('|');
      if (!personId || !dateStr) return;
      const shift = getScheduleShift(personId, parseDate(dateStr), 'alla');
      if (!shift) return;
      const reason = RUNTIME_ABSENCE_REASONS[key];
      const hasActiveNeed = resourceNeeds.some(need =>
        need.personId === personId && need.dateStr === dateStr && need.status !== 'Borttaget',
      );
      if (!hasActiveNeed) createResourceNeed(personId, dateStr, shift, reason, 'frånvaro');
    });
  }, [automation?.isAutomationActive, createResourceNeed, getScheduleShift, resourceNeedPrototype, resourceNeeds]);

  const handleOpenVacancyPanel = useCallback((personId: string, dateStr: string) => {
    const emp   = employees.find(e => e.id === personId);
    const shift = getScheduleShift(personId, parseDate(dateStr), 'alla');
    if (!shift) return;
    setResourceNeedAssignmentId(null);
    setOrderAssignment(null);
    setSubPanelState({ personId, dateStr, shift, fillType:'substitute', targetPersonName: emp?.name ?? '', targetUnit: emp?.department, targetType: 'pass' });
    setSubPanelBrowseAll(false);
    setSubPanelOpen(true);
  }, [employees, getScheduleShift]);

  const handleOpenRemainingPassPanel = useCallback((pass: RemainingPass) => {
    setResourceNeedAssignmentId(null);
    setOrderAssignment(null);
    setSubPanelState({
      personId: pass.id,
      dateStr: pass.dateStr,
      shift: pass.shift,
      fillType: 'substitute',
      targetPersonName: 'Vakans',
      targetUnit: pass.unit,
      targetType: 'pass',
      targetRemainingPassId: pass.id,
      unitLocked: true,
    });
    setSubPanelBrowseAll(false);
    setSubPanelOpen(true);
    setDetailState(null);
  }, []);

  const handleOpenScheduleActivityPanel = useCallback((personId: string, dateStr: string, activity: ScheduleActivity, targetPersonName: string, targetUnit: string) => {
    setResourceNeedAssignmentId(null);
    setOrderAssignment(null);
    setSubPanelState({
      personId,
      dateStr,
      shift: { type: 'day', start: activity.start, end: activity.end },
      fillType: 'substitute',
      targetPersonName,
      targetUnit,
      targetType: 'activity',
      targetActivityId: activity.id,
      targetActivityLabel: activity.label,
      unitLocked: true,
    });
    setSubPanelBrowseAll(false);
    setSubPanelOpen(true);
    setDetailState(null);
  }, []);

  const handleOpenExtraPanel = useCallback((personId: string, dateStr: string) => {
    const emp   = employees.find(e => e.id === personId);
    const shift = getScheduleShift(personId, parseDate(dateStr), 'alla');
    if (!shift) return;
    setSubPanelState({ personId, dateStr, shift, fillType:'extra', targetPersonName: emp?.name ?? '', targetUnit: emp?.department });
    setSubPanelBrowseAll(false);
    setSubPanelOpen(true);
  }, [employees, getScheduleShift]);

  const handleCloseSubPanel = useCallback(() => {
    setSubPanelOpen(false);
    setSubPanelBrowseAll(false);
    setOrderAssignment(null);
  }, []);

  const handleOpenAllSubstitutes = useCallback(() => {
    setSubPanelState(null);
    setSubPanelBrowseAll(true);
    setSubPanelOpen(true);
  }, []);

  const handleOpenSubstituteDetails = useCallback((substituteId: string, dateStr: string) => {
    setReturnToSubstitutePanel(subPanelOpen);
    setSubPanelOpen(false);
    setSubstituteDetailState({ substituteId, dateStr });
  }, [subPanelOpen]);

  const handleCloseSubstituteDetails = useCallback(() => {
    setSubstituteDetailState(null);
    if (returnToSubstitutePanel) setSubPanelOpen(true);
    setReturnToSubstitutePanel(false);
  }, [returnToSubstitutePanel]);

  const handleSetSubstituteAvailability = useCallback((substituteId: string, dateStr: string, availability: SubAvailability | null) => {
    const key = substituteAvailabilityKey(substituteId, dateStr);
    const substitute = panelCandidates.find(item => item.id === substituteId);
    setSubstituteAvailabilityOverrides(current => ({ ...current, [key]: availability }));
    addSubstituteActivity(substituteId, {
      type: 'status', author: 'Du', initials: 'JV', time: 'Just nu',
      text: availability ? 'Tillgänglighet ändrades' : 'Markerad som ej tillgänglig',
      detail: availability ? `${dateStr} · ${fmtAvailTime(availability)}` : `${dateStr} · ${substitute?.name ?? 'Vikarie'}`,
    });
  }, [addSubstituteActivity, panelCandidates]);

  const handleRestoreSubstituteAvailability = useCallback((substituteId: string, dateStr: string) => {
    const key = substituteAvailabilityKey(substituteId, dateStr);
    setSubstituteAvailabilityOverrides(current => {
      const next = { ...current };
      delete next[key];
      return next;
    });
    addSubstituteActivity(substituteId, {
      type: 'status', author: 'Du', initials: 'JV', time: 'Just nu', text: 'Tillgänglighet återställd',
      detail: `${dateStr} · Grundtillgängligheten används igen`,
    });
  }, [addSubstituteActivity]);

  const handleReportSubstituteSick = useCallback((substituteId: string, dateStr: string) => {
    const key = substituteAvailabilityKey(substituteId, dateStr);
    setSubstituteAbsences(current => ({ ...current, [key]: 'Sjuk' }));
    addSubstituteActivity(substituteId, {
      type: 'status', author: 'Du', initials: 'JV', time: 'Just nu', text: 'Sjukanmälan registrerades', detail: dateStr,
    });
  }, [addSubstituteActivity]);

  const handleClearSubstituteSickness = useCallback((substituteId: string, dateStr: string) => {
    const key = substituteAvailabilityKey(substituteId, dateStr);
    setSubstituteAbsences(current => {
      const next = { ...current };
      delete next[key];
      return next;
    });
    addSubstituteActivity(substituteId, {
      type: 'status', author: 'Du', initials: 'JV', time: 'Just nu', text: 'Sjukanmälan togs bort', detail: dateStr,
    });
  }, [addSubstituteActivity]);

  const handleOpenOrderSubstitutePanel = useCallback((order: ResourceOrder) => {
    setOrderAssignment(order);
    setSubPanelState({
      personId: order.personId,
      dateStr: order.dateStr,
      shift: order.shift,
      fillType: order.resourceType === 'vikarie' ? 'substitute' : 'extra',
      targetPersonName: order.personName,
      targetUnit: order.role,
    });
    setSubPanelBrowseAll(false);
    setSubPanelOpen(true);
  }, []);

  const handleOpenResourceNeedAssignment = useCallback((need: ResourceNeed) => {
    const employee = employees.find(item => item.id === need.personId);
    setResourceNeedAssignmentId(need.id);
    setSubPanelState({
      personId: need.personId,
      dateStr: need.dateStr,
      shift: need.shift,
      fillType: 'substitute',
      targetPersonName: need.personName,
      targetUnit: employee?.department ?? need.role,
    });
    setSubPanelBrowseAll(false);
    setSubPanelOpen(true);
  }, [employees]);

  const handleCreateResourceOrderForNeed = useCallback((need: ResourceNeed) => {
    setResourceNeedOrderTargetId(need.id);
    setResourceOrderDialogState({
      personId: need.personId,
      personName: need.personName,
      role: need.role,
      dateStr: need.dateStr,
      shift: need.shift,
      resourceType: 'vikarie',
    });
  }, []);

  // ── Handlers: assign ──
  const openConfirm = useCallback((subs: SubstituteCandidate[], personId: string, dateStr: string, shift: Shift, fillType: 'substitute'|'extra', target?: Pick<SubPanelState, 'targetType'|'targetActivityId'|'targetActivityLabel'|'targetRemainingPassId'|'targetUnit'|'unitLocked'>) => {
    const employee = employees.find(item => item.id === personId);
    setConfirmState({
      substitutes: subs,
      targetPersonId: personId,
      targetDateStr: dateStr,
      targetShift: shift,
      fillType,
      ...target,
      unit: target?.targetUnit ?? employee?.department ?? SUBSTITUTE_UNITS[0].label,
      unitLocked: target?.unitLocked ?? isSchoolScenario(selectedOrganisation),
    });
  }, [employees, selectedOrganisation]);

  const handleSendRequest = useCallback((selectedIds: string[]) => {
    if (selectedIds.length === 0) return;
    const requestedIds = isActivityTimelineScenario ? selectedIds.slice(0, 1) : selectedIds;
    const subs = panelCandidates.filter(s => requestedIds.includes(s.id));
    if (subs.length === 0) return;
    if (!subPanelState) {
      setOpenRequestState({ substitutes: subs, dateStr: toDateStr(columns[0]?.date ?? new Date(TODAY_STR)), shift: { type: 'day', ...SHIFT_DEFS.day }, role: subs[0]?.role ?? SUBSTITUTE_ROLES[0]?.id ?? '', unit: SUBSTITUTE_UNITS[0].label });
      setSubPanelOpen(false);
      return;
    }
    openConfirm(subs, subPanelState.personId, subPanelState.dateStr, subPanelState.shift, subPanelState.fillType, subPanelState);
    setSubPanelOpen(false);
  }, [subPanelState, openConfirm, columns, isActivityTimelineScenario, panelCandidates]);

  const handleSendSubstituteRequest = useCallback((substituteId: string) => {
    setSubstituteDetailState(null);
    setReturnToSubstitutePanel(false);
    handleSendRequest([substituteId]);
  }, [handleSendRequest]);

  const handleConfirmOpenRequest = useCallback((dateStr: string, shift: Shift, role: string, unit: string) => {
    if (!openRequestState) return;
    setOpenRequestState(null);
    setSubPanelOpen(false);
    window.alert(`Förfrågan skickad: ${role}, ${unit}, ${dateStr}, ${shift.start}–${shift.end}`);
  }, [openRequestState]);

  const handleConfirm = useCallback((_msg: string) => {
    if (!confirmState) return;
    if (confirmState.targetRemainingPassId) {
      const substitute = confirmState.substitutes[0];
      if (!substitute) return;
      setRemainingPasses(previous => previous.map(pass => pass.id === confirmState.targetRemainingPassId
        ? { ...pass, assignedSubstituteId: substitute.id, assignedSubstituteName: substitute.name }
        : pass));
      setConfirmState(null);
      setSubPanelOpen(false);
      return;
    }
    if (confirmState.targetType === 'activity' && confirmState.targetActivityId) {
      const substitute = confirmState.substitutes[0];
      if (!substitute) return;
      setActivityFills(current => ({
        ...current,
        [confirmState.targetActivityId!]: {
          activityId: confirmState.targetActivityId!,
          dateStr: confirmState.targetDateStr,
          shift: confirmState.targetShift,
          substituteId: substitute.id,
          substituteName: substitute.name,
          substituteRole: substitute.role,
        },
      }));
      setConfirmState(null);
      setSubPanelOpen(false);
      return;
    }
    if (resourceNeedAssignmentId) {
      const need = resourceNeeds.find(item => item.id === resourceNeedAssignmentId);
      if (!need) return;
      const selectedNames = confirmState.substitutes.map(sub => sub.name).join(' · ');
      setFills(previous => [
        ...previous.filter(fill => !(fill.personId === need.personId && fill.dateStr === need.dateStr)),
        ...confirmState.substitutes.map(sub => ({
          personId: need.personId,
          dateStr: need.dateStr,
          fillType: 'substitute' as const,
          person: { name: sub.name, role: sub.role },
          substituteId: sub.id,
          shift: need.shift,
        })),
      ]);
      setResourceNeeds(previous => previous.map(item => item.id === need.id
        ? { ...item, status: 'Tillsatt' as const, workflowStatus: 'Tillsatt', assignedSubstituteId: confirmState.substitutes[0]?.id, assignedSubstituteName: confirmState.substitutes[0]?.name }
        : item));
      addResourceNeedActivity(need.id, {
        type: 'assignment', author: 'Du', initials: 'JV', time: 'Just nu',
        text: confirmState.substitutes.length === 1 ? 'Resursbehov tillsattes' : 'Resursbehov tillsattes med flera vikarier',
        detail: `${selectedNames} · ${need.shift.start}–${need.shift.end}`,
      });
      setResourceNeedAssignmentId(null);
      setConfirmState(null);
      setSubPanelOpen(false);
      return;
    }
    if (orderAssignment) {
      const selectedNames = confirmState.substitutes.map(sub => sub.name).join(' · ');
      setFills(previous => [
        ...previous.filter(fill => !(fill.personId === orderAssignment.personId && fill.dateStr === orderAssignment.dateStr)),
        ...confirmState.substitutes.map(sub => ({
          personId: orderAssignment.personId,
          dateStr: orderAssignment.dateStr,
          fillType: orderAssignment.resourceType === 'vikarie' ? 'substitute' as const : 'extra' as const,
          person: { name: sub.name, role: sub.role },
          substituteId: sub.id,
          shift: orderAssignment.shift,
        })),
      ]);
      setResourceOrders(previous => previous.map(item => item.id === orderAssignment.id
        ? { ...item, status: 'Tillsatt', acceptedSubstituteId: confirmState.substitutes[0]?.id }
        : item));
      const acceptedSubstitute = confirmState.substitutes[0];
      if (acceptedSubstitute) updateLinkedNeedAfterBooking(orderAssignment, acceptedSubstitute.id, acceptedSubstitute.name);
      addOrderActivity(orderAssignment.id, {
        type: 'assignment', author: 'Du', initials: 'JV', time: 'Just nu',
        text: confirmState.substitutes.length === 1 ? 'Vikarie vald' : 'Vikarier valda',
        detail: `${selectedNames} · ${orderAssignment.shift.start}–${orderAssignment.shift.end}`,
      });
      setOrderAssignment(null);
      setConfirmState(null);
      setSubPanelOpen(false);
      return;
    }
    const selectedSubstitutes = isActivityTimelineScenario ? confirmState.substitutes.slice(0, 1) : confirmState.substitutes;
    setFills(previous => [
      ...(isActivityTimelineScenario
        ? previous.filter(fill => !(fill.personId === confirmState.targetPersonId && fill.dateStr === confirmState.targetDateStr))
        : previous),
      ...selectedSubstitutes.map(sub => ({
        personId: confirmState.targetPersonId,
        dateStr: confirmState.targetDateStr,
        fillType: confirmState.fillType,
        person: { name: sub.name, role: sub.role },
        substituteId: sub.id,
        shift: confirmState.targetShift,
      })),
    ]);
    setConfirmState(null);
    setSubPanelOpen(false);
  }, [addOrderActivity, addResourceNeedActivity, confirmState, isActivityTimelineScenario, orderAssignment, resourceNeedAssignmentId, resourceNeeds, updateLinkedNeedAfterBooking]);

  const handleCancelConfirm = useCallback(() => {
    setConfirmState(null);
    setResourceNeedAssignmentId(null);
  }, []);

  const handleSelectOrderCandidates = useCallback((candidateIds: string[]) => {
    if (!orderDetail || candidateIds.length === 0) return;
    const order = resourceOrders.find(item => item.id === orderDetail.id);
    if (!order) return;
    const selected = order.invitedSubstitutes.filter(invite => candidateIds.includes(invite.substituteId)).slice(0, isActivityTimelineScenario ? 1 : undefined);
    if (selected.length === 0) return;
    setFills(previous => [
      ...previous.filter(fill => !(fill.personId === order.personId && fill.dateStr === order.dateStr)),
      ...selected.map(invite => ({
        personId: order.personId,
        dateStr: order.dateStr,
        fillType: order.resourceType === 'vikarie' ? 'substitute' as const : 'extra' as const,
        person: { name: invite.name, role: invite.role },
        substituteId: invite.substituteId,
        shift: order.shift,
      })),
    ]);
    setResourceOrders(previous => previous.map(item => item.id === order.id
      ? { ...item, status: 'Tillsatt', acceptedSubstituteId: selected[0].substituteId }
      : item));
    updateLinkedNeedAfterBooking(order, selected[0].substituteId, selected[0].name);
    addOrderActivity(order.id, {
      type: 'assignment', author: 'Du', initials: 'JV', time: 'Just nu',
      text: selected.length === 1 ? 'Vikarie vald' : 'Vikarier valda',
      detail: `${selected.map(invite => invite.name).join(' · ')} · ${order.shift.start}–${order.shift.end}`,
    });
  }, [orderDetail, resourceOrders, addOrderActivity, isActivityTimelineScenario, updateLinkedNeedAfterBooking]);

  // ── Handlers: shift detail dialog ──
  const handleOpenDetail = useCallback((
    empId: string, empName: string, empRole: string,
    dateStr: string, shift: Shift, color: ColorScheme,
  ) => {
    setSubPanelOpen(false);
    setSubPanelBrowseAll(false);
    setSubPanelState(null);
    setDetailState({ empId, empName, empRole, dateStr, shift, color });
  }, []);

  const handleCloseDetail = useCallback(() => setDetailState(null), []);

  const openSicknessDialog = useCallback((personId: string, dateStr: string) => {
    const employee = employees.find(emp => emp.id === personId);
    const shift = getScheduleShift(personId, parseDate(dateStr), 'alla');
    if (!employee || !shift) return;
    setAbsenceDialogState({
      personId,
      personName: employee.name,
      dateStr,
      shift,
      startDate: dateStr,
      endDate: dateStr,
      reason: 'Sjuk',
    });
  }, [employees, getScheduleShift]);

  const handleUpdatePassTime = useCallback((start: string, end: string) => {
    if (!detailState || !start || !end || (start === detailState.shift.start && end === detailState.shift.end)) return;
    const key = `${detailState.empId}|${detailState.dateStr}`;
    const previousShift = detailState.shift;
    const updatedShift = { ...previousShift, start, end };
    if (RUNTIME_ABSENCE_SHIFTS[key]) RUNTIME_ABSENCE_SHIFTS[key] = updatedShift;
    else RUNTIME_SHIFT_OVERRIDES[key] = updatedShift;
    setDetailState(current => current ? { ...current, shift: updatedShift } : current);
    setResourceOrders(current => current.map(order => order.personId === detailState.empId && order.dateStr === detailState.dateStr
      ? { ...order, shift: updatedShift }
      : order));
    addPassActivity(key, {
      type: 'status', author: 'Du', initials: 'JV', time: 'Just nu', text: 'Passtid ändrades',
      detail: `${previousShift.start}–${previousShift.end} → ${start}–${end}`,
    });
    setAbsenceVersion(version => version + 1);
  }, [addPassActivity, detailState]);

  // ── Context-menu actions ──
  const handleOpenResourceOrderDialog = useCallback((target: NonNullable<typeof ctxRef.current>) => {
    const employee = employees.find(emp => emp.id === target.personId);
    const remainingPass = remainingPasses.find(pass => pass.id === target.personId && pass.dateStr === target.dateStr);
    const shift = remainingPass?.shift ?? getScheduleShift(target.personId, parseDate(target.dateStr), 'alla');
    if ((!employee && !remainingPass) || !shift) return;
    const linkedNeed = resourceNeedPrototype
      ? resourceNeeds.find(need => need.personId === target.personId && need.dateStr === target.dateStr && need.status !== 'Borttaget')
      : undefined;
    setResourceNeedOrderTargetId(linkedNeed?.id ?? null);

    setResourceOrderDialogState({
      personId: target.personId,
      personName: employee?.name ?? 'Pass kvar',
      role: employee?.role ?? remainingPass?.unit ?? 'Förskola',
      dateStr: target.dateStr,
      shift,
      resourceType: target.type === 'normal' ? 'extrapass' : 'vikarie',
    });
  }, [employees, getScheduleShift, remainingPasses, resourceNeedPrototype, resourceNeeds]);

  const handleConfirmResourceOrder = useCallback((orderedShift: Shift, _msg: string) => {
    if (!resourceOrderDialogState) return;
    const { personId, personName, role, dateStr, resourceType } = resourceOrderDialogState;
    if (resourceNeedOrderTargetId) {
      const need = resourceNeeds.find(item => item.id === resourceNeedOrderTargetId);
      if (!need) return;
      const id = `resource-order-${need.id}`;
      const order: ResourceOrder = {
        id,
        personId: need.personId,
        personName: need.personName,
        role: need.role,
        dateStr: need.dateStr,
        shift: orderedShift,
        resourceType: 'vikarie',
        status: 'Beställd',
        orderedBy: 'Maja Andersson',
        handledBy: 'Lena Sjöberg',
        invitedSubstitutes: [],
      };
      setResourceOrders(previous => previous.some(item => item.id === id)
        ? previous.map(item => item.id === id ? order : item)
        : [...previous, order]);
      updateLinkedNeedWorkflowStatus(id, 'Beställd', order.handledBy);
      addResourceNeedActivity(need.id, {
        type: 'status', author: 'Du', initials: 'JV', time: 'Just nu',
        text: 'Resurs beställd', detail: `${need.personName} · ${need.dateStr} · ${orderedShift.start}–${orderedShift.end}`,
      });
      addOrderActivity(id, {
        type: 'system', author: 'Du', initials: 'JV', time: 'Just nu',
        text: 'Beställningen skapades från ett resursbehov', detail: `${need.personName} · ${need.dateStr} · ${orderedShift.start}–${orderedShift.end}`,
      });
      setResourceNeedOrderTargetId(null);
      setResourceOrderDialogState(null);
      return;
    }
    const id = `${personId}-${dateStr}-${resourceType}`;
    setResourceOrders(previous => {
      if (previous.some(order => order.id === id)) return previous;
      return [...previous, {
        id,
        personId,
        personName,
        role,
        dateStr,
        shift: orderedShift,
        resourceType,
        status: 'Beställd',
        orderedBy: 'Maja Andersson',
        handledBy: 'Lena Sjöberg',
        invitedSubstitutes: [],
      }];
    });
    addOrderActivity(id, {
      type: 'system', author: 'Du', initials: 'JV', time: 'Just nu',
      text: 'Beställningen skapades', detail: `${personName} · ${dateStr} · ${orderedShift.start}–${orderedShift.end}`,
    });
    setResourceOrderDialogState(null);
  }, [addOrderActivity, addResourceNeedActivity, resourceNeedOrderTargetId, resourceNeedPrototype, resourceNeeds, resourceOrderDialogState, updateLinkedNeedWorkflowStatus]);

  const handleCancelResourceOrder = useCallback(() => {
    setResourceOrderDialogState(null);
    setResourceNeedOrderTargetId(null);
  }, []);

  const handleUpdateOrderTime = useCallback((orderId: string, start: string, end: string) => {
    const order = resourceOrders.find(item => item.id === orderId);
    if (!order || !start || !end || (start === order.shift.start && end === order.shift.end)) return;
    setResourceOrders(previous => previous.map(item => item.id === orderId ? { ...item, shift: { ...item.shift, start, end } } : item));
    addOrderActivity(orderId, {
      type: 'status', author: 'Du', initials: 'JV', time: 'Just nu', text: 'Passtid ändrades',
      detail: `${order.shift.start}–${order.shift.end} → ${start}–${end}`,
    });
  }, [resourceOrders, addOrderActivity]);

  const handlePassPrimaryAction = useCallback(() => {
    if (!detailState) return;
    const key = `${detailState.empId}|${detailState.dateStr}`;
    if (detailState.color === 'vacant') {
      setDetailState(null);
      handleOpenVacancyPanel(detailState.empId, detailState.dateStr);
      return;
    }
    if (detailState.color === 'absence') {
      setVacancyKeys(previous => previous.includes(key) ? previous : [...previous, key]);
      setDetailState(current => current ? { ...current, color: 'vacant' } : current);
      addPassActivity(key, {
        type: 'status', author: 'Du', initials: 'JV', time: 'Just nu', text: 'Passet markerades som vakans',
        detail: `${detailState.empName} · ${detailState.dateStr} · ${detailState.shift.start}–${detailState.shift.end}`,
      });
      return;
    }
    if (detailState.color === 'normal') {
      setDetailState(null);
      handleOpenExtraPanel(detailState.empId, detailState.dateStr);
    }
  }, [addPassActivity, detailState, handleOpenExtraPanel, handleOpenVacancyPanel]);

  const handlePassCreateResourceNeed = useCallback(() => {
    if (!detailState || !resourceNeedPrototype) return;
    createResourceNeed(detailState.empId, detailState.dateStr, detailState.shift, undefined, 'pass');
    setDetailState(null);
  }, [createResourceNeed, detailState, resourceNeedPrototype]);

  const handlePassCreateOrder = useCallback(() => {
    if (!detailState) return;
    handleOpenResourceOrderDialog({
      personId: detailState.empId,
      dateStr: detailState.dateStr,
      type: detailState.color === 'normal' ? 'normal' : detailState.color === 'absence' ? 'absence' : 'vacant',
    });
    setDetailState(null);
  }, [detailState, handleOpenResourceOrderDialog]);

  const handlePassReportSick = useCallback(() => {
    if (!detailState) return;
    openSicknessDialog(detailState.empId, detailState.dateStr);
    setDetailState(null);
  }, [detailState, openSicknessDialog]);

  const handlePassSimulate = useCallback(() => {
    if (!detailState) return;
    const employee = employees.find(emp => emp.id === detailState.empId);
    if (!employee) return;
    navigateTo('/vikariehantering/urvalstest', {
      state: {
        dateStr: detailState.dateStr,
        shift: detailState.shift,
        employeeName: employee.name,
        employeeRole: employee.role,
        workplace: employee.department,
        passInfo: getShiftPassInfo(detailState.empId, detailState.dateStr, selectedOrganisation),
      },
    });
    setDetailState(null);
  }, [detailState, employees, navigateTo, selectedOrganisation]);

  const handlePersonReportSick = useCallback((dateStr: string) => {
    if (!personDetailEmployee) return;
    openSicknessDialog(personDetailEmployee.id, dateStr);
    setPersonDetailId(null);
  }, [openSicknessDialog, personDetailEmployee]);

  const handleShowPersonInSchedule = useCallback(() => {
    if (!personDetailEmployee) return;
    setTextFilter(personDetailEmployee.name);
    setActiveView('schema');
    setPersonDetailId(null);
  }, [personDetailEmployee]);

  const handleAssignOrderSubstitute = useCallback((substitute: SubstituteCandidate) => {
    if (!orderAssignment) return;
    const order = orderAssignment;
    setFills(previous => [
      ...previous.filter(fill => !(fill.personId === order.personId && fill.dateStr === order.dateStr)),
      { personId: order.personId, dateStr: order.dateStr, fillType: order.resourceType === 'vikarie' ? 'substitute' : 'extra', person: { name: substitute.name, role: substitute.role }, substituteId: substitute.id, shift: order.shift },
    ]);
    setResourceOrders(previous => previous.map(item => item.id === order.id ? { ...item, status: 'Tillsatt', acceptedSubstituteId: substitute.id } : item));
    updateLinkedNeedAfterBooking(order, substitute.id, substitute.name);
    addOrderActivity(order.id, { type: 'assignment', author: 'Du', initials: 'JV', time: 'Just nu', text: 'Vikarie vald', detail: `${substitute.name} · ${order.shift.start}–${order.shift.end}` });
    setOrderAssignment(null);
  }, [orderAssignment, addOrderActivity, updateLinkedNeedAfterBooking]);

  const handleOrderAction = useCallback((orderId: string, action: OrderContextAction) => {
    const order = resourceOrders.find(item => item.id === orderId);
    if (!order) return;

    if (action.id === 'cancel-order') {
      setResourceOrders(previous => previous.map(item => item.id === orderId ? { ...item, status: 'Avbruten' } : item));
      updateLinkedNeedWorkflowStatus(orderId, undefined);
      const needId = order.id.startsWith('resource-order-') ? order.id.slice('resource-order-'.length) : '';
      if (resourceNeeds.some(need => need.id === needId)) addResourceNeedActivity(needId, {
        type: 'status', author: 'Du', initials: 'JV', time: 'Just nu',
        text: 'Beställningen avbröts', detail: 'Resursbehovet är öppet för ny hantering.',
      });
      addOrderActivity(orderId, { type: 'status', author: 'Du', initials: 'JV', time: 'Just nu', text: 'Beställningen avbröts', detail: `${order.personName} · ${order.dateStr}` });
      return;
    }

    if (action.id === 'start-processing') {
      setResourceOrders(previous => previous.map(item => item.id === orderId ? { ...item, status: 'Under behandling', handledBy: 'Lena Sjöberg' } : item));
      updateLinkedNeedWorkflowStatus(orderId, 'Under behandling', 'Lena Sjöberg');
      addOrderActivity(orderId, { type: 'status', author: 'Lena Sjöberg', initials: 'LS', time: 'Just nu', text: 'Behandling påbörjad', detail: 'Beställningen har tagits över för handläggning.' });
      return;
    }

    if (action.id === 'send-order') {
      const invites = resourceNeedPrototype
        ? DEFAULT_ORDER_INVITES.map(invite => ({ ...invite, response: 'Avvaktar' as const, responseText: undefined }))
        : DEFAULT_ORDER_INVITES.map(invite => ({ ...invite }));
      setResourceOrders(previous => previous.map(item => item.id === orderId
        ? { ...item, status: 'Förfrågan skickad', handledBy: 'Lena Sjöberg', invitedSubstitutes: invites }
        : item));
      updateLinkedNeedWorkflowStatus(orderId, 'Förfrågan skickad', 'Lena Sjöberg');
      addOrderActivity(orderId, { type: 'status', author: 'Lena Sjöberg', initials: 'LS', time: 'Just nu', text: 'Förfrågan skickad till vikarier', detail: invites.map(invite => invite.name).join(' · ') });
      const responseItems: CaseActivityResponse[] = invites.map(invite => ({
        id: invite.substituteId,
        name: invite.name,
        role: invite.role,
        response: invite.response === 'Tillgänglig' ? 'Ja' : invite.response === 'Kan inte' ? 'Nej' : invite.response === 'Avvaktar' ? (resourceNeedPrototype ? 'Inget svar' : 'Kanske') : 'Inget svar',
        detail: invite.responseText,
      }));
      addOrderActivity(orderId, {
        type: 'system', author: 'Systemet', initials: 'S', time: 'Just nu',
        text: `Förfrågan skickad till ${responseItems.length} vikarier`,
        detail: 'Svar från vikarier samlade i en gemensam post.',
        responseGroup: { responses: responseItems },
      });
      return;
    }

    if (action.id === 'approve-response' && action.substituteId) {
      const invite = order.invitedSubstitutes.find(item => item.substituteId === action.substituteId);
      if (!invite || invite.response !== 'Tillgänglig') return;
      setFills(previous => [
        ...previous.filter(fill => !(fill.personId === order.personId && fill.dateStr === order.dateStr)),
        {
          personId: order.personId,
          dateStr: order.dateStr,
          fillType: order.resourceType === 'vikarie' ? 'substitute' : 'extra',
          person: { name: invite.name, role: invite.role },
          substituteId: invite.substituteId,
          shift: order.shift,
        },
      ]);
      setResourceOrders(previous => previous.map(item => item.id === orderId
        ? { ...item, status: 'Tillsatt', acceptedSubstituteId: invite.substituteId }
        : item));
      updateLinkedNeedAfterBooking(order, invite.substituteId, invite.name);
      addOrderActivity(orderId, { type: 'assignment', author: 'Du', initials: 'JV', time: 'Just nu', text: 'Vikarie vald', detail: `${invite.name} · ${order.shift.start}–${order.shift.end}` });
    }
  }, [resourceOrders, resourceNeeds, addOrderActivity, addResourceNeedActivity, updateLinkedNeedAfterBooking, updateLinkedNeedWorkflowStatus, resourceNeedPrototype]);

  const handleRegisterOrderResponses = useCallback((orderId: string) => {
    const order = resourceOrders.find(item => item.id === orderId);
    if (!order || order.status !== 'Förfrågan skickad') return;
    const invites = DEFAULT_ORDER_INVITES.map(invite => ({ ...invite }));
    setResourceOrders(previous => previous.map(item => item.id === orderId
      ? { ...item, status: 'Besvarad', invitedSubstitutes: invites }
      : item));
    updateLinkedNeedWorkflowStatus(orderId, 'Besvarad');
    addOrderActivity(orderId, {
      type: 'status', author: 'Systemet', initials: 'S', time: 'Just nu',
      text: 'Svar mottagna från vikarier', detail: invites.map(invite => `${invite.name}: ${invite.response}`).join(' · '),
      responseGroup: { responses: invites.map(invite => ({
        id: invite.substituteId,
        name: invite.name,
        role: invite.role,
        response: invite.response === 'Tillgänglig' ? 'Ja' : invite.response === 'Kan inte' ? 'Nej' : 'Kanske',
        detail: invite.responseText,
      })) },
    });
    const needId = order.id.startsWith('resource-order-') ? order.id.slice('resource-order-'.length) : '';
    if (resourceNeeds.some(need => need.id === needId)) addResourceNeedActivity(needId, {
      type: 'status', author: 'Systemet', initials: 'S', time: 'Just nu',
      text: 'Svar mottagna på beställningen', detail: 'Resursbehovet inväntar att vikarie väljs.',
    });
  }, [addOrderActivity, addResourceNeedActivity, resourceNeeds, resourceOrders, updateLinkedNeedWorkflowStatus]);

  const handleMoveOrderOnBoard = useCallback((orderId: string, status: ResourceOrderStatus) => {
    if (status === 'Tillsatt' || status === 'Avbruten') return;
    const order = resourceOrders.find(item => item.id === orderId);
    if (!order || order.status === 'Tillsatt' || order.status === status) return;
    const invites = status === 'Besvarad'
      ? DEFAULT_ORDER_INVITES.map(invite => ({ ...invite }))
      : status === 'Förfrågan skickad'
        ? DEFAULT_ORDER_INVITES.map(invite => ({ ...invite, response: 'Avvaktar' as const, responseText: undefined }))
        : [];
    setResourceOrders(previous => previous.map(item => item.id === orderId
      ? { ...item, status, invitedSubstitutes: invites }
      : item));
    updateLinkedNeedWorkflowStatus(orderId, status);
    const activityText: Record<Exclude<ResourceOrderStatus, 'Tillsatt' | 'Avbruten'>, string> = {
      'Beställd': 'Beställningen återfördes till beställd',
      'Under behandling': 'Behandling påbörjad',
      'Förfrågan skickad': 'Förfrågan skickad',
      'Besvarad': 'Svar mottagna från vikarier',
    };
    addOrderActivity(orderId, {
      type: 'status', author: 'Du', initials: 'JV', time: 'Just nu',
      text: activityText[status], detail: `Status ändrad till ${status} · Hanteras av ${order.handledBy}`,
    });
    const needId = order.id.startsWith('resource-order-') ? order.id.slice('resource-order-'.length) : '';
    if (resourceNeeds.some(need => need.id === needId)) addResourceNeedActivity(needId, {
      type: 'status', author: 'Du', initials: 'JV', time: 'Just nu',
      text: `Beställningen flyttades till ${status}`, detail: `Hanteras av ${order.handledBy}`,
    });
  }, [addOrderActivity, addResourceNeedActivity, resourceNeeds, resourceOrders, updateLinkedNeedWorkflowStatus]);

  const handleMoveNeedOnBoard = useCallback((needId: string, status: ResourceOrderStatus) => {
    if (status === 'Tillsatt' || status === 'Avbruten') return;
    const need = resourceNeeds.find(item => item.id === needId);
    if (!need || need.status === 'Borttaget' || need.status === 'Tillsatt') return;
    const id = `resource-order-${need.id}`;
    const existingOrder = resourceOrders.find(order => order.id === id);
    const invites = status === 'Besvarad'
      ? DEFAULT_ORDER_INVITES.map(invite => ({ ...invite }))
      : status === 'Förfrågan skickad'
        ? DEFAULT_ORDER_INVITES.map(invite => ({ ...invite, response: 'Avvaktar' as const, responseText: undefined }))
        : [];
    const order: ResourceOrder = {
      id,
      personId: need.personId,
      personName: need.personName,
      role: need.role,
      dateStr: need.dateStr,
      shift: need.shift,
      resourceType: 'vikarie',
      status,
      orderedBy: existingOrder?.orderedBy ?? 'Maja Andersson',
      handledBy: existingOrder?.handledBy ?? need.handledBy,
      invitedSubstitutes: invites,
    };
    setResourceOrders(previous => existingOrder
      ? previous.map(item => item.id === id ? order : item)
      : [...previous, order]);
    updateLinkedNeedWorkflowStatus(id, status, order.handledBy);
    const activityText: Record<Exclude<ResourceOrderStatus, 'Tillsatt' | 'Avbruten'>, string> = {
      'Beställd': 'Resurs beställd',
      'Under behandling': 'Behandling påbörjad',
      'Förfrågan skickad': 'Förfrågan skickad',
      'Besvarad': 'Svar mottagna från vikarier',
    };
    addResourceNeedActivity(need.id, {
      type: 'status', author: 'Du', initials: 'JV', time: 'Just nu',
      text: activityText[status], detail: `${need.personName} · ${need.dateStr} · ${need.shift.start}–${need.shift.end}`,
    });
    addOrderActivity(id, {
      type: 'status', author: 'Du', initials: 'JV', time: 'Just nu',
      text: activityText[status], detail: `Resursbehovet flyttades till ${status} · Hanteras av ${order.handledBy}`,
    });
  }, [addOrderActivity, addResourceNeedActivity, resourceNeeds, resourceOrders, updateLinkedNeedWorkflowStatus]);

  const handleReturnOrderToNeed = useCallback((orderId: string) => {
    const order = resourceOrders.find(item => item.id === orderId);
    const needId = order?.id.startsWith('resource-order-') ? order.id.slice('resource-order-'.length) : '';
    const need = resourceNeeds.find(item => item.id === needId);
    if (!order || !need || order.status === 'Tillsatt') return;
    setResourceOrders(previous => previous.map(item => item.id === orderId ? { ...item, status: 'Avbruten' } : item));
    setResourceNeeds(previous => previous.map(item => item.id === needId
      ? { ...item, status: 'Öppet', workflowStatus: undefined, assignedSubstituteId: undefined, assignedSubstituteName: undefined }
      : item));
    updateLinkedNeedWorkflowStatus(orderId, undefined);
    addOrderActivity(orderId, {
      type: 'status', author: 'Du', initials: 'JV', time: 'Just nu',
      text: 'Beställningen avbröts', detail: 'Resursbehovet återfördes till kolumnen Resursbehov.',
    });
    addResourceNeedActivity(needId, {
      type: 'status', author: 'Du', initials: 'JV', time: 'Just nu',
      text: 'Resursbehovet återöppnades', detail: 'Beställningen avbröts och behovet kan beställas på nytt.',
    });
  }, [addOrderActivity, addResourceNeedActivity, resourceNeeds, resourceOrders, updateLinkedNeedWorkflowStatus]);

  const handleTakeBackNeed = useCallback((needId: string) => {
    const need = resourceNeeds.find(item => item.id === needId);
    if (!need || need.status === 'Tillsatt') return;
    setResourceNeeds(previous => previous.map(item => item.id === needId ? { ...item, handledBy: 'Maja Andersson' } : item));
    const orderId = `resource-order-${needId}`;
    const linkedOrder = resourceOrders.find(order => order.id === orderId && order.status !== 'Avbruten');
    if (linkedOrder && linkedOrder.status !== 'Tillsatt') {
      setResourceOrders(previous => previous.map(order => order.id === orderId ? { ...order, handledBy: 'Maja Andersson' } : order));
      addOrderActivity(orderId, {
        type: 'status', author: 'Maja Andersson', initials: 'MA', time: 'Just nu',
        text: 'Beställaren tog tillbaka kontrollen', detail: 'Beställningen hanteras åter av beställaren.',
      });
    }
    addResourceNeedActivity(needId, {
      type: 'status', author: 'Maja Andersson', initials: 'MA', time: 'Just nu',
      text: 'Beställaren tog tillbaka kontrollen', detail: 'Resursbehovet hanteras åter av beställaren.',
    });
  }, [addOrderActivity, addResourceNeedActivity, resourceNeeds, resourceOrders]);

  const handleTakeBackOrder = useCallback((orderId: string) => {
    const order = resourceOrders.find(item => item.id === orderId);
    if (!order || order.status === 'Tillsatt') return;
    setResourceOrders(previous => previous.map(item => item.id === orderId ? { ...item, handledBy: 'Maja Andersson' } : item));
    addOrderActivity(orderId, {
      type: 'status', author: 'Maja Andersson', initials: 'MA', time: 'Just nu',
      text: 'Beställaren tog tillbaka kontrollen', detail: 'Beställningen hanteras åter av beställaren.',
    });
    const needId = order.id.startsWith('resource-order-') ? order.id.slice('resource-order-'.length) : '';
    if (resourceNeeds.some(need => need.id === needId)) {
      setResourceNeeds(previous => previous.map(need => need.id === needId ? { ...need, handledBy: 'Maja Andersson' } : need));
      addResourceNeedActivity(needId, {
        type: 'status', author: 'Maja Andersson', initials: 'MA', time: 'Just nu',
        text: 'Beställaren tog tillbaka kontrollen', detail: 'Resursbehovet hanteras åter av beställaren.',
      });
    }
  }, [addOrderActivity, addResourceNeedActivity, resourceNeeds, resourceOrders]);

  const handleOrderAllResourceNeeds = useCallback(() => {
    const openNeeds = resourceNeeds.filter(need => need.status === 'Öppet');
    if (openNeeds.length === 0) return;
    const newOrders = openNeeds.map(need => ({
          id: `resource-order-${need.id}`,
          personId: need.personId,
          personName: need.personName,
          role: need.role,
          dateStr: need.dateStr,
          shift: need.shift,
          resourceType: 'vikarie' as const,
          status: 'Beställd' as const,
          orderedBy: 'Maja Andersson',
          handledBy: 'Lena Sjöberg',
          invitedSubstitutes: [],
        }));
    setResourceOrders(previous => {
      const ordersById = new Map(previous.map(order => [order.id, order]));
      newOrders.forEach(order => ordersById.set(order.id, order));
      return Array.from(ordersById.values());
    });
    openNeeds.forEach(need => updateLinkedNeedWorkflowStatus(`resource-order-${need.id}`, 'Beställd', 'Lena Sjöberg'));
    openNeeds.forEach(need => addResourceNeedActivity(need.id, {
      type: 'status', author: 'Du', initials: 'JV', time: 'Just nu',
      text: 'Resurs beställd', detail: `${need.personName} · ${need.dateStr} · ${need.shift.start}–${need.shift.end}`,
    }));
    newOrders.forEach(order => addOrderActivity(order.id, {
      type: 'system', author: 'Du', initials: 'JV', time: 'Just nu',
      text: 'Beställningen skapades från ett resursbehov', detail: `${order.personName} · ${order.dateStr} · ${order.shift.start}–${order.shift.end}`,
    }));
  }, [addOrderActivity, addResourceNeedActivity, resourceNeeds, updateLinkedNeedWorkflowStatus]);

  const handleAssignAllResourceNeeds = useCallback(() => {
    const openNeeds = resourceNeeds.filter(need => need.status === 'Öppet');
    if (openNeeds.length === 0) return;
    const assignments = openNeeds.map((need, index) => ({
      need,
      substitute: SUBSTITUTE_CANDIDATES[index % SUBSTITUTE_CANDIDATES.length],
    }));
    setFills(previous => [
      ...previous.filter(fill => !assignments.some(({ need }) => fill.personId === need.personId && fill.dateStr === need.dateStr)),
      ...assignments.map(({ need, substitute }) => ({
        personId: need.personId,
        dateStr: need.dateStr,
        fillType: 'substitute' as const,
        person: { name: substitute.name, role: substitute.role },
      })),
    ]);
    setResourceNeeds(previous => previous.map(need => {
      const assignment = assignments.find(item => item.need.id === need.id);
      return assignment ? { ...need, status: 'Tillsatt' as const, workflowStatus: 'Tillsatt', assignedSubstituteId: assignment.substitute.id, assignedSubstituteName: assignment.substitute.name } : need;
    }));
    assignments.forEach(({ need, substitute }) => addResourceNeedActivity(need.id, {
      type: 'assignment', author: 'Systemet', initials: 'AI', time: 'Just nu',
      text: 'Resursbehov tillsattes automatiskt', detail: `${substitute.name} · ${substitute.role}`,
    }));
  }, [addResourceNeedActivity, resourceNeeds]);

  const handleDirectAssignment = useCallback((personId: string, dateStr: string, shift: Shift, fillType: 'substitute' | 'extra', preferredCandidate?: SubstituteCandidate, remainingPassId?: string) => {
    if (!resourceNeedPrototype) return;
    const employee = employees.find(item => item.id === personId);
    const remainingPass = remainingPassId ? remainingPasses.find(pass => pass.id === remainingPassId) : undefined;
    if (!employee && !remainingPass) return;
    const date = parseDate(dateStr);
    const candidates = getAvailableSubs(shift, date, 1, effectiveAvailabilityOverrides, substituteAbsences, panelCandidates)
      .sort((a, b) => candidateRankScore(b, date, shift, effectiveAvailabilityOverrides, substituteAbsences)
        - candidateRankScore(a, date, shift, effectiveAvailabilityOverrides, substituteAbsences));
    const invited = preferredCandidate ? [preferredCandidate] : candidates.slice(0, isActivityTimelineScenario ? 1 : 3);
    const key = `${personId}|${dateStr}`;
    const targetName = employee?.name ?? 'Pass kvar';

    addPassActivity(key, {
      type: 'system', author: 'Systemet', initials: 'AI', time: 'Just nu',
      text: 'Tillsätt direkt startades',
      detail: invited.length ? `Automatiken rangordnade ${invited.length} lämpliga vikarier.` : 'Inga tillgängliga vikarier hittades.',
    });
    if (employee) addPersonActivity(personId, {
      type: 'system', author: 'Systemet', initials: 'AI', time: 'Just nu',
      text: 'Automatisk tillsättning startades',
      detail: `${dateStr} · ${shift.start}–${shift.end}`,
    });

    if (!invited.length) {
      const failureReason = 'Ingen lämplig vikarie var tillgänglig.';
      setAssignmentFailures(previous => ({ ...previous, [key]: failureReason }));
      addPassActivity(key, { type: 'status', author: 'Systemet', initials: 'AI', time: 'Just nu', text: 'Ingen vikarie kunde förfrågas', detail: 'Passet är fortfarande otillsatt.' });
      if (employee) addPersonActivity(personId, { type: 'status', author: 'Systemet', initials: 'AI', time: 'Just nu', text: 'Tillsättning kunde inte genomföras', detail: failureReason });
      return;
    }

    const substitute = invited[0];
    addPassActivity(key, {
      type: 'status', author: 'Systemet', initials: 'AI', time: 'Just nu',
      text: 'Förfrågan skickad till vikarie',
      detail: substitute.name,
    });
    if (employee) addPersonActivity(personId, {
      type: 'status', author: 'Systemet', initials: 'AI', time: 'Just nu',
      text: 'Förfrågan skickad till vikarie',
      detail: substitute.name,
    });
    addSubstituteActivity(substitute.id, {
      type: 'status', author: 'Systemet', initials: 'AI', time: 'Just nu',
      text: `Förfrågan om ${fillType === 'extra' ? 'extrapass' : 'vikariepass'}`,
      detail: `${dateStr} · ${shift.start}–${shift.end} · Tillgänglig`,
    });

    setAssignmentFailures(previous => {
      if (!previous[key]) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
    if (remainingPassId) {
      setRemainingPasses(previous => previous.map(pass => pass.id === remainingPassId
        ? { ...pass, assignedSubstituteId: substitute.id, assignedSubstituteName: substitute.name }
        : pass));
    } else {
      setFills(previous => [
        ...previous.filter(fill => !(fill.personId === personId && fill.dateStr === dateStr)),
        { personId, dateStr, fillType, person: { name: substitute.name, role: substitute.role }, substituteId: substitute.id, shift },
      ]);
      const assignedNeed = resourceNeeds.find(need => need.personId === personId && need.dateStr === dateStr && need.status === 'Öppet');
      setResourceNeeds(previous => previous.map(need =>
        need.personId === personId && need.dateStr === dateStr && need.status === 'Öppet'
          ? { ...need, status: 'Tillsatt' as const, workflowStatus: 'Tillsatt', assignedSubstituteId: substitute.id, assignedSubstituteName: substitute.name }
          : need,
      ));
      if (assignedNeed) addResourceNeedActivity(assignedNeed.id, {
        type: 'assignment', author: 'Systemet', initials: 'AI', time: 'Just nu',
        text: 'Resursbehov tillsattes automatiskt', detail: `${substitute.name} · ${substitute.role}`,
      });
    }
    addPassActivity(key, {
      type: 'assignment', author: 'Systemet', initials: 'AI', time: 'Just nu',
      text: 'Passet tillsattes automatiskt', detail: `${substitute.name} · ${substitute.role}`,
    });
    if (employee) addPersonActivity(personId, {
      type: 'assignment', author: 'Systemet', initials: 'AI', time: 'Just nu',
      text: 'Passet tillsattes automatiskt', detail: `${dateStr} · ${shift.start}–${shift.end} · ${substitute.name}`,
    });
    addSubstituteActivity(substitute.id, {
      type: 'assignment', author: 'Systemet', initials: 'AI', time: 'Just nu',
      text: 'Tackade ja och tillsattes', detail: `${targetName} · ${dateStr} · ${shift.start}–${shift.end}`,
    });
  }, [addPassActivity, addPersonActivity, addResourceNeedActivity, addSubstituteActivity, effectiveAvailabilityOverrides, employees, isActivityTimelineScenario, panelCandidates, remainingPasses, resourceNeedPrototype, resourceNeeds, setResourceNeeds, substituteAbsences]);

  useEffect(() => {
    if (!resourceNeedPrototype || !automation?.isAutomationActive) {
      automationProcessedNeedIdsRef.current.clear();
      return;
    }
    if (confirmState) return;
    const openNeed = resourceNeeds.find(need => need.status === 'Öppet' && !automationProcessedNeedIdsRef.current.has(need.id));
    const openRemainingPass = isActivityTimelineScenario
      ? remainingPasses.find(pass => !pass.assignedSubstituteId && !automationProcessedNeedIdsRef.current.has(pass.id))
      : undefined;
    if (!openNeed && !openRemainingPass) return;
    const target = openNeed ?? openRemainingPass!;
    const isRemainingPass = !openNeed;
    const personId = isRemainingPass ? target.id : (target as ResourceNeed).personId;
    const targetDate = target.dateStr;
    const targetShift = target.shift;
    const targetFillType = isRemainingPass ? 'substitute' : (target as ResourceNeed).source === 'frånvaro' ? 'substitute' : 'extra';
    automationProcessedNeedIdsRef.current.add(target.id);

    if (automation.automationMode !== 'free-then-confirm') {
      handleDirectAssignment(personId, targetDate, targetShift, targetFillType, undefined, isRemainingPass ? target.id : undefined);
      return;
    }
    const date = parseDate(targetDate);
    const available = getAvailableSubs(targetShift, date, 1, effectiveAvailabilityOverrides, substituteAbsences, panelCandidates)
      .sort((a, b) => candidateRankScore(b, date, targetShift, effectiveAvailabilityOverrides, substituteAbsences)
        - candidateRankScore(a, date, targetShift, effectiveAvailabilityOverrides, substituteAbsences));
    const freeCandidate = available.find(candidate => candidate.costLevel === 'Gratis');
    if (freeCandidate) {
      handleDirectAssignment(personId, targetDate, targetShift, targetFillType, freeCandidate, isRemainingPass ? target.id : undefined);
      return;
    }
    const paidCandidate = available[0];
    if (!paidCandidate) {
      handleDirectAssignment(personId, targetDate, targetShift, targetFillType, undefined, isRemainingPass ? target.id : undefined);
      return;
    }
    if (!isRemainingPass) setResourceNeedAssignmentId((target as ResourceNeed).id);
    const targetEmployee = isRemainingPass ? undefined : employees.find(employee => employee.id === personId);
    setConfirmState({
      substitutes: [paidCandidate],
      targetPersonId: personId,
      targetDateStr: targetDate,
      targetShift,
      fillType: targetFillType,
      unit: isRemainingPass ? (target as RemainingPass).unit : targetEmployee?.department ?? (target as ResourceNeed).role,
      targetRemainingPassId: isRemainingPass ? target.id : undefined,
      unitLocked: isRemainingPass || isSchoolScenario(selectedOrganisation),
      costApproval: true,
    });
  }, [automation, confirmState, effectiveAvailabilityOverrides, employees, handleDirectAssignment, isActivityTimelineScenario, panelCandidates, remainingPasses, resourceNeedPrototype, resourceNeeds, selectedOrganisation, substituteAbsences]);

  const handleResourceNeedAction = useCallback((needId: string, action: ResourceNeedAction) => {
    const need = resourceNeeds.find(item => item.id === needId);
    if (!need) return;
    if (action.id === 'open') {
      setResourceNeedDetail(need);
      return;
    }
    if (action.id === 'remove') {
      setResourceNeeds(previous => previous.map(item => item.id === needId ? { ...item, status: 'Borttaget' as const } : item));
      setVacancyKeys(previous => previous.filter(key => key !== `${need.personId}|${need.dateStr}`));
      addResourceNeedActivity(needId, {
        type: 'status', author: 'Du', initials: 'JV', time: 'Just nu',
        text: 'Resursbehovet togs bort', detail: `${need.personName} · ${need.dateStr}`,
      });
      if (resourceNeedDetail?.id === needId) setResourceNeedDetail(null);
      return;
    }
    if (action.id === 'assign') {
      handleOpenResourceNeedAssignment(need);
      return;
    }
    if (action.id === 'assign-direct') {
      handleDirectAssignment(need.personId, need.dateStr, need.shift, need.source === 'frånvaro' ? 'substitute' : 'extra');
      return;
    }
    if (action.id === 'order') handleCreateResourceOrderForNeed(need);
  }, [addResourceNeedActivity, handleCreateResourceOrderForNeed, handleDirectAssignment, handleOpenResourceNeedAssignment, resourceNeedDetail, resourceNeeds]);

  const handleCreateAbsence = useCallback(() => {
    if (!absenceDialogState) return;
    const { personId, personName, startDate, endDate, reason } = absenceDialogState;
    if (endDate < startDate) return;

    const start = parseDate(startDate);
    const end = parseDate(endDate);
    for (let date = new Date(start); date <= end; date = addDays(date, 1)) {
      const dateStr = toDateStr(date);
      const shift = getScheduleShift(personId, date, 'alla');
      if (shift) {
        const key = `${personId}|${dateStr}`;
        RUNTIME_ABSENCE_SHIFTS[key] = shift;
        RUNTIME_ABSENCE_REASONS[key] = reason;
        delete RUNTIME_SHIFT_OVERRIDES[key];
        setFills(previous => previous.filter(fill => !(fill.personId === personId && fill.dateStr === dateStr)));
        setVacancyKeys(previous => previous.filter(vacancyKey => vacancyKey !== key));
        const activity = {
          type: 'status' as const,
          author: 'Du',
          initials: 'JV',
          time: 'Just nu',
          text: `${reason} registrerades`,
          detail: `${personName} · ${dateStr} · ${shift.start}–${shift.end}`,
        };
        addPassActivity(key, activity);
        addPersonActivity(personId, activity);
        if (resourceNeedPrototype && (reason === 'Sjuk' || automation?.isAutomationActive)) {
          createResourceNeed(personId, dateStr, shift, reason, 'frånvaro');
        }
      }
    }
    setAbsenceDialogState(null);
    setAbsenceVersion(version => version + 1);
  }, [absenceDialogState, addPassActivity, addPersonActivity, automation?.isAutomationActive, createResourceNeed, getScheduleShift, resourceNeedPrototype]);

  const handleContextAction = useCallback((event: { itemData?: ContextAction }) => {
    const target = ctxRef.current;
    const action = event.itemData?.id;
    if (!target || !action) return;
    const remainingPass = remainingPasses.find(pass => pass.id === target.personId && pass.dateStr === target.dateStr);
    if (remainingPass) {
      if (action === 'primary' || action === 'find-substitute') {
        handleOpenRemainingPassPanel(remainingPass);
      } else if (action === 'assign-direct') {
        handleDirectAssignment(remainingPass.id, remainingPass.dateStr, remainingPass.shift, 'substitute', undefined, remainingPass.id);
      } else if (action === 'order-resource') {
        handleOpenResourceOrderDialog(target);
      } else if (action === 'show-details') {
        handleOpenDetail(remainingPass.id, 'Pass kvar', remainingPass.unit, remainingPass.dateStr, remainingPass.shift, 'vacant');
      }
      return;
    }

    if (action === 'make-vacancy') {
      const key = `${target.personId}|${target.dateStr}`;
      const targetShift = getScheduleShift(target.personId, parseDate(target.dateStr), 'alla');
      if (resourceNeedPrototype && targetShift) {
        if (RUNTIME_ABSENCE_SHIFTS[key] && RUNTIME_ABSENCE_REASONS[key] !== 'Sjuk') return;
        createResourceNeed(target.personId, target.dateStr, targetShift, RUNTIME_ABSENCE_REASONS[key], RUNTIME_ABSENCE_SHIFTS[key] ? 'frånvaro' : 'pass');
        return;
      }
      setVacancyKeys(previous => previous.includes(key) ? previous : [...previous, key]);
      const employee = employees.find(emp => emp.id === target.personId);
      const shift = getScheduleShift(target.personId, parseDate(target.dateStr), 'alla');
      addPassActivity(key, {
        type: 'status', author: 'Du', initials: 'JV', time: 'Just nu', text: 'Passet markerades som vakans',
        detail: `${employee?.name ?? 'Medarbetare'} · ${target.dateStr}${shift ? ` · ${shift.start}–${shift.end}` : ''}`,
      });
      return;
    }

    if (action === 'find-substitute') {
      handleOpenVacancyPanel(target.personId, target.dateStr);
      return;
    }
    if (action === 'assign-direct') {
      const shift = getScheduleShift(target.personId, parseDate(target.dateStr), 'alla');
      if (shift) handleDirectAssignment(target.personId, target.dateStr, shift, target.type === 'normal' ? 'extra' : 'substitute');
      return;
    }
    if (action === 'primary') {
      if (resourceNeedPrototype) {
        const shift = getScheduleShift(target.personId, parseDate(target.dateStr), 'alla');
        if (shift) createResourceNeed(target.personId, target.dateStr, shift, undefined, 'pass');
        return;
      }
      if (target.type === 'vacant') handleOpenVacancyPanel(target.personId, target.dateStr);
      else handleOpenExtraPanel(target.personId, target.dateStr);
      return;
    }
    if (action === 'order-resource') {
      handleOpenResourceOrderDialog(target);
      return;
    }

    if (action === 'create-absence') {
      openSicknessDialog(target.personId, target.dateStr);
      return;
    }

    if (action === 'simulate') {
      const employee = employees.find(emp => emp.id === target.personId);
      const shift = getScheduleShift(target.personId, parseDate(target.dateStr), 'alla');
      if (employee && shift) {
        navigateTo('/vikariehantering/urvalstest', {
          state: {
            dateStr: target.dateStr,
            shift,
            employeeName: employee.name,
            employeeRole: employee.role,
            workplace: employee.department,
            passInfo: getShiftPassInfo(target.personId, target.dateStr, selectedOrganisation),
          },
        });
      }
      return;
    }

    const employee = employees.find(emp => emp.id === target.personId);
    const shift = getScheduleShift(target.personId, parseDate(target.dateStr), 'alla');
    if (employee && shift) {
      handleOpenDetail(
        employee.id,
        employee.name,
        employee.role,
        target.dateStr,
        shift,
        getColorScheme(target.personId, target.dateStr, fills, vacancyKeys),
      );
    }
  }, [addPassActivity, createResourceNeed, employees, fills, getScheduleShift, handleDirectAssignment, handleOpenDetail, handleOpenExtraPanel, handleOpenRemainingPassPanel, handleOpenVacancyPanel, handleOpenResourceOrderDialog, navigateTo, openSicknessDialog, remainingPasses, resourceNeedPrototype, selectedOrganisation, vacancyKeys]);

  const handlePersonContextAction = useCallback((event: { itemData?: { id?: string } }) => {
    if (!personContextId) return;
    const action = event.itemData?.id;
    if (action === 'show-person') {
      setPersonDetailId(personContextId);
      return;
    }
    if (action === 'report-sick') {
      const firstShiftDate = getPeriodDates(viewStart, period, columns)
        .find(date => Boolean(getScheduleShift(personContextId, date, 'alla')));
      if (firstShiftDate) openSicknessDialog(personContextId, toDateStr(firstShiftDate));
    }
  }, [columns, getScheduleShift, openSicknessDialog, period, personContextId, viewStart]);

  // ── Handlers: drag / drop ──
  const handleDragStartSub = useCallback((e: React.DragEvent, subId: string) => {
    const selectedIds = subScrollRef.current
      ? Array.from(subScrollRef.current.querySelectorAll('.schema-sub-checkbox:checked'))
        .map(input => (input as HTMLInputElement).dataset.subId)
        .filter((id): id is string => Boolean(id))
      : [];
    const ids = selectedIds.includes(subId) ? selectedIds : [subId];
    e.dataTransfer.setData('substituteIds', JSON.stringify(ids));
    e.dataTransfer.setData('substituteId', subId);
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  const handleCellDragOver = useCallback((e: React.DragEvent) => {
    if (!subPanelOpen) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, [subPanelOpen]);

  const handleCellDrop = useCallback((e: React.DragEvent, personId: string, dateStr: string, shift: Shift) => {
    if (!subPanelOpen) return;
    e.preventDefault();
    const ids = (() => {
      try { return JSON.parse(e.dataTransfer.getData('substituteIds')) as string[]; } catch { return []; }
    })();
    const fallbackId = e.dataTransfer.getData('substituteId');
    const requestedIds = isActivityTimelineScenario ? ids.slice(0, 1) : ids;
    const selected = panelCandidates.filter(sub => requestedIds.includes(sub.id) || (!ids.length && sub.id === fallbackId));
    if (!selected.length) return;
    const remainingPass = remainingPasses.find(pass => pass.id === personId && pass.dateStr === dateStr);
    if (remainingPass) {
      openConfirm(selected, personId, dateStr, remainingPass.shift, 'substitute', {
        targetType: 'pass',
        targetUnit: remainingPass.unit,
        targetRemainingPassId: remainingPass.id,
        unitLocked: true,
      });
      return;
    }
    const fillType = vacancyKeys.includes(`${personId}|${dateStr}`) ? 'substitute' : 'extra';
    openConfirm(selected, personId, dateStr, shift, fillType, { targetType: 'pass' });
  }, [subPanelOpen, openConfirm, vacancyKeys, isActivityTimelineScenario, panelCandidates, remainingPasses]);

  const handleSchedulePassDragStart = useCallback((event: React.DragEvent, personId: string, dateStr: string, shift: Shift) => {
    if (!resourceNeedPrototype) return;
    event.dataTransfer.setData('resourceNeedPass', JSON.stringify({ personId, dateStr, shift }));
    event.dataTransfer.effectAllowed = 'copy';
  }, [resourceNeedPrototype]);

  const handleResourceNeedDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!resourceNeedPrototype) return;
    try {
      const target = JSON.parse(event.dataTransfer.getData('resourceNeedPass')) as { personId?: string; dateStr?: string; shift?: Shift };
      if (target.personId && target.dateStr && target.shift) createResourceNeed(target.personId, target.dateStr, target.shift, undefined, 'pass');
    } catch {
      // Ignore drops from other draggable elements.
    }
  }, [createResourceNeed, resourceNeedPrototype]);

  // ── Sub rows (substitutes / extra staff) ──
  const getSubRows = useCallback((empId: string) =>
    fills
      .filter(f => f.personId === empId)
      .map(f => {
        const shift = getScheduleShift(empId, parseDate(f.dateStr), 'alla');
        if (!shift) return null;
        return { key:`${empId}-${f.dateStr}-${f.person.name}`, name:f.person.name, role:f.person.role, dateStr:f.dateStr, shift };
      })
      .filter(Boolean) as Array<{ key:string; name:string; role:string; dateStr:string; shift:Shift }>,
  [fills, getScheduleShift]);

  const resourceNeedBoardCount = resourceOrders.filter(order => order.status !== 'Avbruten').length
    + resourceNeeds.filter(need => need.status !== 'Borttaget'
      && !resourceOrders.some(order => order.id === `resource-order-${need.id}` && order.status !== 'Avbruten')).length;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <PageLayout title={activeView === 'schema' ? 'Schema' : activeView === 'orders' ? 'Beställningar' : 'Resursbehov'} breadcrumbItems={breadcrumbItems} hideCaseActivityButton={resourceNeedPrototype}>
      <div className="col-12">
        <div className={`schema-page-wrapper${subPanelOpen ? ' schema-page-has-panel' : ''}`}>

          <div className="schema-view-switcher" role="tablist" aria-label="Välj vy">
            <button className={activeView === 'schema' ? 'active' : ''} onClick={() => setActiveView('schema')}><i className="fa-solid fa-calendar-days" /> Schema</button>
            <button className={activeView === 'orders' ? 'active' : ''} onClick={() => setActiveView('orders')}><i className="fa-solid fa-cart-shopping" /> Beställningar <span>{resourceNeedPrototype ? resourceNeedBoardCount : resourceOrders.length}</span></button>
          </div>

          {activeView === 'orders' ? (
            <div className="schema-orders-page-view">
              {resourceNeedPrototype
                ? <ResourceOrdersKanban
                    needs={resourceNeeds}
                    orders={resourceOrders}
                    orgOptions={resourceBoardOrgOptions}
                    activityKinds={resourceBoardActivityKinds}
                    selectedRoleId={selectedRoleId}
                    getActivitiesForPerson={(personId, dateStr) => getCellActivities(personId, parseDate(dateStr))}
                    isAcuteNeed={need => need.dateStr === TODAY_STR || isAkutShift(need.personId, need.dateStr, selectedOrganisation)}
                    onClose={() => setActiveView('schema')}
                    onAction={handleOrderAction}
                    onOpenNeed={setResourceNeedDetail}
                    onOpenOrder={setOrderDetail}
                    onChooseSubstitute={handleOpenOrderSubstitutePanel}
                    onShowSubstitutes={handleOpenAllSubstitutes}
                    onMoveNeed={handleMoveNeedOnBoard}
                    onMoveOrder={handleMoveOrderOnBoard}
                    onReturnOrderToNeed={handleReturnOrderToNeed}
                    onRegisterResponses={handleRegisterOrderResponses}
                    onTakeBackOrder={handleTakeBackOrder}
                  />
                : <ResourceOrdersList orders={resourceOrders} onClose={() => setActiveView('schema')} onAction={handleOrderAction} onOpenDetails={setOrderDetail} onChooseSubstitute={handleOpenOrderSubstitutePanel} onShowSubstitutes={handleOpenAllSubstitutes} />}
            </div>
          ) : activeView === 'resource-needs' ? (
            <div className="schema-orders-page-view">
              <ResourceNeedsList needs={resourceNeeds} onClose={() => setActiveView('schema')} onOpenDetails={setResourceNeedDetail} onAction={handleResourceNeedAction} onDropPass={handleResourceNeedDrop} onOrderAll={handleOrderAllResourceNeeds} onAssignAll={isActivityTimelineScenario ? undefined : handleAssignAllResourceNeeds} />
            </div>
          ) : <>

          {/* Filter bar */}
          <div className="schema-filter-bar">
            <div className="schema-filter-group">
              <TagBox
                dataSource={availableGroups}
                displayExpr="label"
                valueExpr="id"
                value={selectedGroups}
                onValueChanged={e => setSelectedGroups(e.value ?? [])}
                placeholder="Välj urval..."
                showSelectionControls={true}
                multiline={false}
                stylingMode="outlined"
                width={310}
              />
            </div>
            {isActivityTimelineScenario && <TagBox
              dataSource={PRESCHOOL_ACTIVITY_FILTERS}
              displayExpr="label"
              valueExpr="id"
              inputAttr={{ 'aria-label': 'Filtrera aktivitetstyper' }}
              value={selectedActivityFilters}
              onValueChanged={event => setSelectedActivityFilters((event.value ?? []) as ActivityFilterKind[])}
              placeholder="Aktiviteter"
              showSelectionControls={true}
              showClearButton={true}
              showDropDownButton={true}
              maxDisplayedTags={1}
              applyValueMode="instantly"
              multiline={false}
              stylingMode="outlined"
              width={165}
            />}
            <button
              className="btn-secondary schema-vikarie-open-btn"
              onClick={handleOpenAllSubstitutes}
            >
              <i className="fa-solid fa-user-group" />
              Visa vikarier
            </button>
            <SelectBox
              dataSource={isSchoolScenario(selectedOrganisation) ? PASS_TYPES.filter(pass => pass.id === 'alla' || pass.id === 'dag') : PASS_TYPES}
              displayExpr="label"
              valueExpr="id"
              value={selectedPass}
              onValueChanged={e => setSelectedPass(e.value)}
              width={180}
              stylingMode="outlined"
            />
            <TextBox
              placeholder="Textfilter"
              value={textFilter}
              onValueChanged={e => setTextFilter(e.value ?? '')}
              width={240}
              stylingMode="outlined"
            />
            <div className="schema-filter-spacer" />
            <SelectBox
              dataSource={TIME_PERIODS}
              displayExpr="label"
              valueExpr="id"
              value={period}
              onValueChanged={e => changePeriod(e.value as PeriodType)}
              width={155}
              stylingMode="outlined"
            />
          </div>

          {/* Checkboxes */}
          <div className="schema-filter-checks">
            {!isActivityTimelineScenario && <span className="schema-staffing-focus-note">Bemanning följs per aktivitet; pass och frånvaro visas som underlag.</span>}
            {resourceNeedPrototype && automation && (
              <label className="schema-automation-control">
                <i className="fa-solid fa-robot" />
                <span>Automatik</span>
                <select
                  aria-label="Automatikläge"
                  value={automation.automationMode}
                  onChange={event => automation.setAutomationMode(event.target.value as 'off' | 'always' | 'off-hours' | 'free-then-confirm')}
                >
                  <option value="off">Av</option>
                  <option value="always">Alltid på</option>
                  <option value="off-hours">Utanför kontorstid</option>
                  <option value="free-then-confirm">Gratis automatiskt, fråga om kostnad</option>
                </select>
                <span className={`automation-status-dot ${automation.isAutomationActive ? 'active' : ''}`} title={automation.isAutomationActive ? 'Automatik aktiv' : 'Automatik av'} />
              </label>
            )}
            <CheckBox value={showVacancies} onValueChanged={e => setShowVacancies(e.value)} text={resourceNeedPrototype ? 'Visa frånvaro och resursbehov' : 'Visa bara vakanser'} />
            {resourceNeedPrototype && (
              <div className="schema-orders-toggle">
                <CheckBox value={showResourceNeeds} onValueChanged={e => {
                  const visible = Boolean(e.value);
                  setShowResourceNeeds(visible);
                  if (visible) setShowOrders(false);
                }} text="Visa resursbehov" />
                <span className="schema-orders-count schema-resource-needs-count">{resourceNeeds.filter(need => need.status !== 'Borttaget').length}</span>
              </div>
            )}
            <div className="schema-orders-toggle">
              <CheckBox
                value={showOrders}
                onValueChanged={e => {
                  const visible = Boolean(e.value);
                  setShowOrders(visible);
                  if (visible && resourceNeedPrototype) setShowResourceNeeds(false);
                }}
                text="Visa beställningar"
              />
              {positiveResponseCount > 0 && <span className="schema-orders-response-badge" title={`${positiveResponseCount} positiv${positiveResponseCount === 1 ? 't svar' : 'a svar'}`}>
                {positiveResponseCount}
              </span>}
            </div>
            <div className="schema-org-legend" aria-label="Förklaring av sammanfattning">
              <span><i className="schema-org-legend-dot schema-org-legend-present" />På plats</span>
              <span><i className="schema-org-legend-dot schema-org-legend-absent" />Frånvarande</span>
              <small>Gruppceller: på plats / frånvarande</small>
            </div>
          </div>

          {/* Period navigation */}
          <div className="schema-period-nav">
            <button className="schema-period-nav-btn" onClick={() => navigate(-1)}>
              <i className="fa-solid fa-chevron-left" />
            </button>
            <span className="schema-period-label">{pLabel}</span>
            <button className="schema-period-nav-btn" onClick={() => navigate(1)}>
              <i className="fa-solid fa-chevron-right" />
            </button>
          </div>

          {/* Schedule table with an optional right-hand orders panel. */}
          <div className={`schema-schedule-area${resourceNeedPrototype && showResourceNeeds ? ' schema-schedule-has-resource-needs' : ''}`}>
          <div className="schema-schedule-main">
          <div ref={mainWrapperRef} className="schema-table-wrapper">
            <table className="schema-table" style={{ minWidth: scheduleTableMinWidth }}>
              <colgroup>
                <col style={{ width: EMPLOYEE_COLUMN_WIDTH }} />
                {columns.map((_, index) => <col key={index} style={{ width: viewColumnWidth }} />)}
              </colgroup>
              <thead>
                <tr>
                  <th className="schema-header-cell schema-employee-header">{isActivityTimelineScenario ? 'Medarbetare' : 'Aktivitet / medarbetare'}</th>
                  {columns.map((col, i) => {
                    const ds      = toDateStr(col.date);
                    const isToday = ds === TODAY_STR;
                    const isPast  = ds < TODAY_STR && viewType === 'day-columns';
                    const isNavCol = viewType === 'month-columns' || viewType === 'year-columns';
                    const handleColDblClick = viewType === 'month-columns'
                      ? () => { setPeriod('vecka'); setViewStart(monWeekStart(col.date)); }
                      : viewType === 'year-columns'
                      ? () => { setPeriod('manad'); setViewStart(monthStart(col.date)); }
                      : undefined;
                    return (
                      <th
                        key={i}
                        className={[
                          'schema-header-cell',
                          viewType==='month-columns' ? 'schema-month-col-header' :
                          viewType==='year-columns'  ? 'schema-year-col-header'  : 'schema-day-header',
                          col.isWeekend ? 'schema-weekend-header' : '',
                          isToday ? 'schema-today-header' : '',
                          isPast  ? 'schema-past-header'  : '',
                          isNavCol ? 'schema-col-nav' : '',
                        ].filter(Boolean).join(' ')}
                        onDoubleClick={handleColDblClick}
                        title={
                          viewType === 'month-columns' ? 'Dubbelklicka för att gå till veckovyn' :
                          viewType === 'year-columns'  ? 'Dubbelklicka för att gå till månadsvyn' :
                          undefined
                        }
                      >
                        <span className="schema-col-main">{col.header}</span>
                        {col.subHeader && <span className="schema-col-sub">{col.subHeader}</span>}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {scheduleRows.map(row => {
                  if (row.type === 'group') return renderOrganisationRow(row.group);
                  if (row.type === 'remaining-pass') {
                    const pass = row.pass;
                    const isVacant = !pass.assignedSubstituteId;
                    const passActivities = pass.activities.filter(activity => selectedActivityFilters.length === 0
                      || selectedActivityFilters.includes(activity.kind)
                      || selectedActivityFilters.includes('absence'));
                    return (
                      <tr key={pass.id} className="schema-table-row">
                        <td className="schema-employee-cell schema-org-employee-cell" style={{ paddingLeft: 106 }}>
                          <span className="schema-employee-name">Vakans</span>
                          <span className="schema-employee-role">Pass kvar</span>
                        </td>
                        {columns.map((column, index) => {
                          const dateStr = toDateStr(column.date);
                          const isTargetDay = dateStr === pass.dateStr;
                          const isPast = dateStr < TODAY_STR;
                          return <td key={`${pass.id}-${index}`} className={[
                            'schema-day-cell', 'schema-activity-timeline-cell',
                            viewType === 'month-columns' ? 'schema-month-col-cell' : '',
                            column.isWeekend ? 'schema-weekend-cell' : '',
                            dateStr === TODAY_STR ? 'schema-today-col' : '',
                            isTargetDay && isVacant ? 'schema-ctx-cell' : '',
                          ].filter(Boolean).join(' ')}
                            data-person-id={isTargetDay && isVacant ? pass.id : undefined}
                            data-date-str={isTargetDay && isVacant ? dateStr : undefined}
                            data-ctx-type={isTargetDay && isVacant ? 'vacant' : undefined}
                            onDoubleClick={isTargetDay ? () => handleOpenDetail(pass.id, 'Pass kvar', pass.unit, dateStr, pass.shift, isVacant ? 'vacant' : 'filled') : undefined}>
                            {isTargetDay && <ActivityTimelineCell
                              shift={pass.shift}
                              activities={passActivities}
                              activityFills={activityFills}
                              availability={null}
                              vacancyLabel={pass.assignedSubstituteId ? undefined : 'Vakans'}
                              statusLabel={pass.assignedSubstituteId ? `Tillsatt · ${pass.assignedSubstituteName ?? ''}` : undefined}
                              assignedSubstituteName={pass.assignedSubstituteName}
                              isPast={isPast}
                              onPassDragOver={handleCellDragOver}
                              onPassDrop={(event, targetShift) => handleCellDrop(event, pass.id, dateStr, targetShift)}
                            />}
                          </td>;
                        })}
                      </tr>
                    );
                  }
                  const emp = row.employee;
                  const subRows = viewType === 'day-columns' ? getSubRows(emp.id) : [];
                  const employeeIndex = employees.findIndex(employee => employee.id === emp.id);
                  const hasPoolInView = columns.some(column => hasPoolDuty(employeeIndex, column.date));
                  return (
                    <React.Fragment key={emp.id}>
                      {/* Employee row */}
                      <tr className="schema-table-row">
                        <td
                          className="schema-employee-cell schema-org-employee-cell schema-person-context-cell"
                          style={{ paddingLeft: 106 }}
                          data-person-id={emp.id}
                          onContextMenu={() => setPersonContextId(emp.id)}
                        >
                          <span className="schema-employee-name">{hasPoolInView && <i className="schema-pool-dot" title="Samverkanspass i aktuell period" />} {emp.name}</span>
                          <span className="schema-employee-role">{emp.role}</span>
                          <span className="schema-employee-dept">{emp.organisation}</span>
                        </td>
                        {columns.map((col, ci) => {
                          const ds    = toDateStr(col.date);
                          const shift = getScheduleShift(emp.id, col.date, selectedPass);

                          /* Year view */
                          if (viewType === 'year-columns') {
                            const y2  = col.date.getFullYear();
                            const m2  = col.date.getMonth();
                            const cnt = monthShiftCount(emp.id, y2, m2, selectedPass);
                            const abs = monthAbsenceCount(emp.id, y2, m2);
                            const dim = daysInMonth(y2, m2);
                            const past = isMonthPast(y2, m2);
                            const st  = tenths(cnt, dim);
                            const at  = Math.min(tenths(abs, dim), 10 - st);
                            const sp  = 10 - st - at;
                            const shiftBarCls = past ? 'schema-heat-past' : heatCls(cnt, dim);
                            const absCls = past ? 'schema-yr-absence-past' : 'schema-yr-absence';
                            return (
                              <td
                                key={ci}
                                className="schema-day-cell schema-year-col-cell schema-col-nav"
                                onDoubleClick={() => { setPeriod('manad'); setViewStart(monthStart(col.date)); }}
                                title="Dubbelklicka för att gå till månadsvyn"
                              >
                                {(cnt > 0 || abs > 0) && (
                                  <div className="schema-year-inner">
                                    <div className="schema-year-bar-flex">
                                      {st > 0 && <div className={`schema-yr-seg ${shiftBarCls} schema-yr-f-${st}`} />}
                                      {at > 0 && <div className={`schema-yr-seg ${absCls} schema-yr-f-${at}`} />}
                                      {sp > 0 && <div className={`schema-yr-seg schema-yr-spacer schema-yr-f-${sp}`} />}
                                    </div>
                                    <span className="schema-heat-count">
                                      {cnt > 0 && `${cnt} pass`}
                                      {cnt > 0 && abs > 0 && ' · '}
                                      {abs > 0 && <span className="schema-heat-count-abs">{abs} fr.</span>}
                                    </span>
                                  </div>
                                )}
                              </td>
                            );
                          }

                          const hasFill  = fills.some(f => f.personId===emp.id && f.dateStr===ds);
                          const absenceKey = `${emp.id}|${ds}`;
                          const isAbsent  = !!RUNTIME_ABSENCE_SHIFTS[absenceKey];
                          const absenceCaption = isAbsent
                            ? `Frånvaro${RUNTIME_ABSENCE_REASONS[absenceKey] ? ` · ${RUNTIME_ABSENCE_REASONS[absenceKey]}` : ''}`
                            : undefined;
                          const isVacant  = vacancyKeys.includes(absenceKey);
                          const ctxType: ContextTargetType | undefined = shift
                            ? (isAbsent ? (isVacant ? 'vacant' : 'absence') : 'normal')
                            : undefined;
                          const color    = shift ? getColorScheme(emp.id, ds, fills, vacancyKeys) : 'normal';
                          const passInfo = getShiftPassInfo(emp.id, ds, selectedOrganisation);
                          const akut     = isAkutShift(emp.id, ds, selectedOrganisation) && color === 'vacant';
                          const resourceOrder = resourceOrders.find(order => order.personId === emp.id && order.dateStr === ds);
                          const resourceNeed = resourceNeedPrototype
                            ? resourceNeeds.find(need => need.personId === emp.id && need.dateStr === ds && need.status !== 'Borttaget')
                            : undefined;
                          const resourceNeedOrder = resourceNeed
                            ? resourceOrders.find(order => order.id === `resource-order-${resourceNeed.id}`)
                            : undefined;
                          const activeResourceNeedOrder = resourceNeedOrder?.status !== 'Avbruten' ? resourceNeedOrder : undefined;
                          const activeScheduleOrder = activeResourceNeedOrder
                            ?? (resourceNeedPrototype && resourceOrder?.status !== 'Avbruten' ? resourceOrder : undefined);
                          const cellColor: ColorScheme = resourceNeedPrototype && ds < TODAY_STR
                            ? 'past'
                            : activeScheduleOrder && activeScheduleOrder.status !== 'Tillsatt'
                              ? 'ordered'
                              : color;
                          const resourceNeedDisplayStatus = activeScheduleOrder?.status ?? resourceNeed?.workflowStatus ?? resourceNeed?.status;
                          const resourceNeedHandler = activeScheduleOrder?.handledBy ?? resourceNeed?.handledBy;
                          const scheduleStatusLabel = resourceNeed
                            ? `${absenceCaption ?? 'Resursbehov'} · ${resourceNeedDisplayStatus ?? 'Öppet'} · ${resourceNeedHandler ?? resourceNeed.createdBy}`
                            : resourceOrder ? `Beställning · ${resourceOrder.status} · ${resourceOrder.handledBy}` : undefined;

                          if (isActivityTimelineScenario && viewType !== 'year-columns') {
                            const candidateId = internalCandidateId(emp.id);
                            const selfAvailability = !shift
                              ? getSubAvailability(candidateId, col.date, effectiveAvailabilityOverrides, substituteAbsences)
                              : null;
                            const assignedPass = fills.find(fill => fill.substituteId === candidateId && fill.dateStr === ds);
                            const assignedActivity = Object.values(activityFills).find(fill => fill.substituteId === candidateId && fill.dateStr === ds);
                            const bookedAssignment = assignedActivity
                              ? { start: assignedActivity.shift.start, end: assignedActivity.shift.end, name: assignedActivity.substituteName }
                              : assignedPass?.shift
                                ? { start: assignedPass.shift.start, end: assignedPass.shift.end, name: assignedPass.person.name }
                                : undefined;
                            const activities = shift
                              ? getCellActivities(emp.id, col.date).filter(activity =>
                                selectedActivityFilters.length === 0
                                  || selectedActivityFilters.includes(activity.kind)
                                  || (isAbsent && selectedActivityFilters.includes('absence')),
                              )
                              : [];
                            return (
                              <td
                                key={ci}
                                className={[
                                  'schema-day-cell',
                                  'schema-activity-timeline-cell',
                                  viewType === 'month-columns' ? 'schema-month-col-cell' : '',
                                  col.isWeekend ? 'schema-weekend-cell' : '',
                                  ds === TODAY_STR ? 'schema-today-col' : '',
                                  ctxType ? 'schema-ctx-cell' : '',
                                ].filter(Boolean).join(' ')}
                                data-person-id={ctxType ? emp.id : undefined}
                                data-date-str={ctxType ? ds : undefined}
                                data-ctx-type={ctxType}
                                onDoubleClick={shift ? () => handleOpenDetail(emp.id, emp.name, emp.role, ds, shift, color) : undefined}
                              >
                                <ActivityTimelineCell
                                  shift={shift}
                                  activities={activities}
                                  activityFills={activityFills}
                                  availability={selfAvailability}
                                  bookedAssignment={bookedAssignment}
                                  absenceLabel={absenceCaption}
                                  vacancyLabel={resourceNeed && !isAbsent ? 'Resursbehov' : undefined}
                                  statusLabel={scheduleStatusLabel}
                                  assignedSubstituteName={resourceNeed?.assignedSubstituteName}
                                  isOrdered={Boolean(activeScheduleOrder && activeScheduleOrder.status !== 'Tillsatt')}
                                  isPast={ds < TODAY_STR}
                                  onPassDragOver={handleCellDragOver}
                                  onPassDrop={(event, targetShift) => handleCellDrop(event, emp.id, ds, targetShift)}
                                />
                              </td>
                            );
                          }

                          /* Month view */
                          if (viewType === 'month-columns') {
                            return (
                              <td
                                key={ci}
                                className={['schema-month-col-cell', col.isWeekend ? 'schema-weekend-cell' : '', ds === TODAY_STR ? 'schema-today-col' : '', ctxType ? 'schema-ctx-cell' : ''].filter(Boolean).join(' ')}
                                data-person-id={ctxType ? emp.id : undefined}
                                data-date-str={ctxType ? ds : undefined}
                                data-ctx-type={ctxType}
                              >
                                {shift && (
                                  <div
                                    className={['schema-ctx-wrapper', ctxType ? `schema-ctx-${ctxType}` : '', subPanelOpen ? 'schema-drop-target' : ''].filter(Boolean).join(' ')}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`${emp.name}, ${ds}, pass ${shift.start} till ${shift.end}, ${color === 'absence' ? 'frånvaro' : color === 'vacant' ? (resourceNeedPrototype ? 'resursbehov' : 'vakans') : color === 'filled' ? 'tillsatt' : 'schemalagt pass'}. Visa passdetaljer.`}
                                    draggable={resourceNeedPrototype}
                                    onDragStart={event => handleSchedulePassDragStart(event, emp.id, ds, shift)}
                                    data-person-id={ctxType ? emp.id : undefined}
                                    data-date-str={ctxType  ? ds     : undefined}
                                    data-ctx-type={ctxType  ? ctxType : undefined}
                                    onDoubleClick={() => handleOpenDetail(emp.id, emp.name, emp.role, ds, shift, color)}
                                    onKeyDown={event => {
                                      if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault();
                                        handleOpenDetail(emp.id, emp.name, emp.role, ds, shift, color);
                                      }
                                    }}
                                    onDragOver={handleCellDragOver}
                                    onDrop={e => handleCellDrop(e, emp.id, ds, shift)}
                                  >
                                    <ShiftMonthCell shift={shift} color={cellColor} passInfo={passInfo} isAkut={akut} orderedBy={resourceNeed ? undefined : resourceOrder?.orderedBy} orderStatus={resourceNeed ? undefined : resourceOrder?.status} orderHandledBy={resourceNeed ? undefined : resourceOrder?.handledBy} resourceNeedMode={resourceNeedPrototype} resourceNeedCreatedBy={resourceNeed?.createdBy} resourceNeedDisplayStatus={resourceNeedDisplayStatus} resourceNeedHandler={resourceNeedHandler} assignmentFailure={assignmentFailures[`${emp.id}|${ds}`]} />
                                  </div>
                                )}
                              </td>
                            );
                          }

                          /* Day / week view */
                          return (
                            <td key={ci} className={[
                              'schema-day-cell',
                              col.isWeekend ? 'schema-weekend-cell' : '',
                              ds === TODAY_STR ? 'schema-today-col' : '',
                              ctxType ? 'schema-ctx-cell' : '',
                            ].filter(Boolean).join(' ')}
                            data-person-id={ctxType ? emp.id : undefined}
                            data-date-str={ctxType ? ds : undefined}
                            data-ctx-type={ctxType}
                            >
                              {hasPoolDuty(employeeIndex, col.date) && <i className="schema-pool-day-dot" title="Samverkanspass" />}
                              {shift && (
                                <div
                                  className={['schema-ctx-wrapper', ctxType ? `schema-ctx-${ctxType}` : '', subPanelOpen ? 'schema-drop-target' : ''].filter(Boolean).join(' ')}
                                  role="button"
                                  tabIndex={0}
                                  aria-label={`${emp.name}, ${ds}, pass ${shift.start} till ${shift.end}, ${color === 'absence' ? 'frånvaro' : color === 'vacant' ? (resourceNeedPrototype ? 'resursbehov' : 'vakans') : color === 'filled' ? 'tillsatt' : 'schemalagt pass'}. Visa passdetaljer.`}
                                  draggable={resourceNeedPrototype}
                                  onDragStart={event => handleSchedulePassDragStart(event, emp.id, ds, shift)}
                                  data-person-id={ctxType ? emp.id  : undefined}
                                  data-date-str={ctxType  ? ds      : undefined}
                                  data-ctx-type={ctxType  ? ctxType : undefined}
                                  onDoubleClick={() => handleOpenDetail(emp.id, emp.name, emp.role, ds, shift, color)}
                                  onKeyDown={event => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                      event.preventDefault();
                                      handleOpenDetail(emp.id, emp.name, emp.role, ds, shift, color);
                                    }
                                  }}
                                  onDragOver={handleCellDragOver}
                                  onDrop={e => handleCellDrop(e, emp.id, ds, shift)}
                                >
                                  <ShiftDayCell shift={shift} color={cellColor} passInfo={passInfo} isAkut={akut} orderedBy={resourceNeed ? undefined : resourceOrder?.orderedBy} orderStatus={resourceNeed ? undefined : resourceOrder?.status} orderHandledBy={resourceNeed ? undefined : resourceOrder?.handledBy} resourceNeedMode={resourceNeedPrototype} resourceNeedCreatedBy={resourceNeed?.createdBy} resourceNeedDisplayStatus={resourceNeedDisplayStatus} resourceNeedHandler={resourceNeedHandler} assignmentFailure={assignmentFailures[`${emp.id}|${ds}`]} />
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Substitute / extra rows */}
                      {subRows.map(sub => (
                        <tr key={sub.key} className="schema-substitute-row">
                          <td className="schema-employee-cell schema-sub-cell">
                            <span className="schema-sub-name">{sub.name}</span>
                            <span className="schema-employee-role">{sub.role}</span>
                          </td>
                          {columns.map((col, ci) => {
                            const ds2 = toDateStr(col.date);
                            return (
                              <td key={ci} className={[
                                'schema-day-cell',
                                col.isWeekend ? 'schema-weekend-cell' : '',
                                ds2 === TODAY_STR ? 'schema-today-col' : '',
                              ].filter(Boolean).join(' ')}>
                                {ds2 === sub.dateStr && (
                                  <ShiftDayCell shift={sub.shift} color="filled" />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={columns.length + 1} className="schema-empty-state">
                      Inga medarbetare matchade filtret.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {isActivityTimelineScenario && <div className="schema-activity-legend schema-activity-legend-below" aria-label="Aktivitetstyper och tillgänglighet">
            {Object.entries(PRESCHOOL_ACTIVITY_TYPES).map(([kind, activityType]) => <span key={kind}><i className={`schema-activity-legend-swatch ${activityType.className}`} />{activityType.label}</span>)}
            <span><i className="schema-activity-legend-swatch schema-activity-availability-swatch" />Tillgänglig vikarie</span>
            <span><i className="schema-activity-legend-swatch schema-activity-absence-swatch" />Frånvaro</span>
          </div>}
          </div>
          {showOrders && <ResourceOrdersList orders={resourceOrders} onClose={() => setShowOrders(false)} onAction={handleOrderAction} onOpenDetails={setOrderDetail} onChooseSubstitute={handleOpenOrderSubstitutePanel} onShowSubstitutes={handleOpenAllSubstitutes} />}
          {resourceNeedPrototype && showResourceNeeds && <ResourceNeedsList needs={resourceNeeds} onClose={() => setShowResourceNeeds(false)} onOpenDetails={setResourceNeedDetail} onAction={handleResourceNeedAction} onDropPass={handleResourceNeedDrop} onOrderAll={handleOrderAllResourceNeeds} onAssignAll={isActivityTimelineScenario ? undefined : handleAssignAllResourceNeeds} />}
          </div>

          </>}

          {/* Context menu — the first action changes with the selected pass. */}
          <ContextMenu
            target=".schema-ctx-cell"
            dataSource={contextActions}
            itemRender={renderSchemaContextMenuItem}
            onItemClick={handleContextAction}
          />
          <ContextMenu
            target=".schema-org-label-cell"
            dataSource={[
              { id: 'open' as OrganisationActionId, text: 'Öppna (fäll ut)', icon: 'chevron-down' },
              { id: 'close' as OrganisationActionId, text: 'Stäng (fäll ihop)', icon: 'chevron-right' },
              ...(!hideMinimumStaffing && organisationMenu?.kind === 'team'
                ? [{ id: 'settings' as OrganisationActionId, text: 'Inställningar', icon: 'gear', beginGroup: true }]
                : []),
            ]}
            onItemClick={event => {
              const action = event.itemData?.id as OrganisationActionId | undefined;
              if (!organisationMenu || !action) return;
              if (action === 'settings') openOrganisationSettings(organisationMenu);
              else {
                setCollapsedGroups(current => action === 'close'
                  ? current.includes(organisationMenu.id) ? current : [...current, organisationMenu.id]
                  : current.filter(id => id !== organisationMenu.id));
                setOrganisationMenu(null);
              }
            }}
          />
          <ContextMenu
            target=".schema-person-context-cell"
            dataSource={[
              { id: 'show-person', text: 'Visa persondetaljer', icon: 'id-card' },
              { id: 'report-sick', text: 'Sjukanmäl', icon: 'calendar-xmark', beginGroup: true },
            ]}
            onItemClick={handlePersonContextAction}
          />

          <Popup
            visible={Boolean(absenceDialogState)}
            onHiding={() => setAbsenceDialogState(null)}
            title="Skapa frånvaro"
            width={460}
            height={470}
            showCloseButton={true}
            dragEnabled={false}
            contentRender={() => absenceDialogState ? (
              <div className="schema-absence-dialog">
                <p className="schema-absence-dialog-context">
                  <strong>{absenceDialogState.personName}</strong>
                  <span>{absenceDialogState.dateStr} · {absenceDialogState.shift.start}–{absenceDialogState.shift.end}</span>
                </p>
                <div className="schema-absence-date-grid">
                  <label>
                    Från datum
                    <input type="date" value={absenceDialogState.startDate} readOnly />
                  </label>
                  <label>
                    Till datum
                    <input
                      type="date"
                      min={absenceDialogState.startDate}
                      value={absenceDialogState.endDate}
                      onChange={event => setAbsenceDialogState(current => current ? { ...current, endDate: event.currentTarget.value } : current)}
                    />
                  </label>
                </div>
                <fieldset className="schema-absence-reasons">
                  <legend>Orsak</legend>
                  {(['Sjuk', 'VAB', 'Tjänstledig', 'Semester'] as AbsenceReason[]).map(reason => (
                    <label key={reason}>
                      <input
                        type="radio"
                        name="absence-reason"
                        value={reason}
                        checked={absenceDialogState.reason === reason}
                        onChange={() => setAbsenceDialogState(current => current ? { ...current, reason } : current)}
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </fieldset>
                <div className="schema-absence-dialog-actions">
                  <button className="btn-secondary" onClick={() => setAbsenceDialogState(null)}>Avbryt</button>
                  <button className="btn-primary" disabled={absenceDialogState.endDate < absenceDialogState.startDate} onClick={handleCreateAbsence}>Skapa frånvaro</button>
                </div>
              </div>
            ) : null}
          />

          {!hideMinimumStaffing && (
          <Popup
            visible={Boolean(organisationSettings)}
            onHiding={() => setOrganisationSettings(null)}
            title={organisationSettings ? `Inställningar – ${organisationSettings.label}` : 'Inställningar'}
            width={460}
            height={390}
            showCloseButton={true}
            dragEnabled={false}
            contentRender={() => organisationSettings ? (
              <div className="schema-org-settings">
                <p>Ställ in minsta bemanning för teamets ordinarie medlemmar. Vikarier och extrapersonal räknas inte in.</p>
                {passTypesForTeam(organisationSettings).length > 0 ? (
                  <div className="schema-org-settings-field">
                    <label htmlFor="schema-minimum-pass-type">Passtyp</label>
                    <SelectBox
                      id="schema-minimum-pass-type"
                      dataSource={passTypesForTeam(organisationSettings)}
                      displayExpr="label"
                      valueExpr="id"
                      value={minimumPassType}
                      onValueChanged={event => {
                        const nextPassType = event.value as string;
                        setMinimumPassType(nextPassType);
                        setMinimumDraft(minimumFor(organisationSettings, nextPassType));
                      }}
                      stylingMode="outlined"
                      width="100%"
                    />
                  </div>
                ) : (
                  <div className="schema-org-settings-field"><label>Passtyp</label><div className="schema-org-no-pass-types">Ingen passtyp definierad</div></div>
                )}
                <div className="schema-org-settings-value"><strong>{minimumDraft}</strong> av {organisationSettings.personIds.length} ordinarie medarbetare</div>
                <input
                  type="range"
                  min={0}
                  max={organisationSettings.personIds.length}
                  value={minimumDraft}
                  onChange={event => setMinimumDraft(Number(event.currentTarget.value))}
                  aria-label="Minimivärde för antal medarbetare"
                />
                <div className="schema-org-range-labels"><span>0</span><span>{organisationSettings.personIds.length}</span></div>
                <div className="schema-org-settings-actions">
                  <button className="btn-primary" onClick={() => {
                    setMinimumValues(current => ({ ...current, [minimumKey(organisationSettings, minimumPassType)]: minimumDraft }));
                    setOrganisationSettings(null);
                  }}>Spara</button>
                  <button className="btn-secondary" onClick={() => setOrganisationSettings(null)}>Avbryt</button>
                </div>
              </div>
            ) : null}
          />
          )}
        </div>

        {/* Substitute panel — context mode (right-click) and browse-all mode ("Visa vikarier") */}
        <SubstitutePanel
          isOpen={subPanelOpen}
          browseAll={subPanelBrowseAll}
          state={subPanelState}
          candidates={panelCandidates}
          singleAssignment={isActivityTimelineScenario}
          bookingsByCandidate={candidateBookings}
          columns={columns}
          viewType={viewType}
          viewColumnWidth={viewColumnWidth}
          onClose={handleCloseSubPanel}
          onSendRequest={handleSendRequest}
          onOpenDetails={handleOpenSubstituteDetails}
          onSetAvailability={handleSetSubstituteAvailability}
          onRestoreAvailability={handleRestoreSubstituteAvailability}
          onReportSick={handleReportSubstituteSick}
          onClearSickness={handleClearSubstituteSickness}
          availabilityOverrides={effectiveAvailabilityOverrides}
          absences={substituteAbsences}
          onDragStart={handleDragStartSub}
          scrollRef={subScrollRef}
          tableWidth={subTableLayout.width}
          tableInset={subTableLayout.inset}
        />

        {/* Confirm dialog */}
        <ConfirmAssignDialog
          state={confirmState}
          onConfirm={handleConfirm}
          onCancel={handleCancelConfirm}
        />

        <OpenRequestDialog
          state={openRequestState}
          onConfirm={handleConfirmOpenRequest}
          onCancel={() => setOpenRequestState(null)}
        />

        <ResourceOrderDialog
          state={resourceOrderDialogState}
          onConfirm={handleConfirmResourceOrder}
          onCancel={handleCancelResourceOrder}
        />

        <CaseActivityModal
          isOpen={Boolean(orderDetail)}
          onClose={() => setOrderDetail(null)}
          contextKey={orderDetail?.id}
          kicker={orderDetail ? `Beställning ${orderDetail.id}` : 'Beställning'}
          title={orderDetail ? `${orderDetail.personName} – ${orderDetail.resourceType === 'vikarie' ? 'vikarie' : 'extrapass'}` : 'Beställning'}
          description={orderDetail ? `${orderDetail.dateStr} · ${orderDetail.shift.start}–${orderDetail.shift.end}` : ''}
          activities={orderDetail ? orderActivities[orderDetail.id] ?? [] : []}
          includeDefaultActivities={false}
          details={orderDetail ? <OrderDetailCard order={orderDetail} onChooseSubstitute={handleOpenOrderSubstitutePanel} onAction={handleOrderAction} onSaveTime={handleUpdateOrderTime} onTakeBack={resourceNeedPrototype ? () => handleTakeBackOrder(orderDetail.id) : undefined} /> : null}
          onSelectCandidates={orderDetail ? handleSelectOrderCandidates : undefined}
          onPostMessage={orderDetail ? activity => addOrderActivity(orderDetail.id, activity) : undefined}
        />

        <CaseActivityModal
          isOpen={Boolean(detailState)}
          onClose={handleCloseDetail}
          contextKey={passDetailKey}
          kicker={detailState ? `Pass ${detailState.dateStr}` : 'Pass'}
          title={detailState ? `${detailState.empName} – passdetaljer` : 'Passdetaljer'}
          description={detailState ? `${detailState.dateStr} · ${detailState.shift.start}–${detailState.shift.end}` : ''}
          aboveToolbar={passDetailSchedule ? <div className="person-activity-schedule-panel pass-activity-schedule-panel">
            <h4>Aktiviteter den här dagen</h4>
            <ActivityScheduleDetail
              schedule={passDetailSchedule}
              activityFills={activityFills}
              assignedSubstituteName={passDetailRemainingPass?.assignedSubstituteName ?? passDetailAssignedFill?.person.name}
            />
            {!passDetailAssignedFill && !passDetailRemainingPass?.assignedSubstituteId && passDetailSchedule.activities.some(activity => !activityFills[activity.id]) && <div className="schema-remaining-pass-activity-actions">
              <strong>Tillsätt vikarie för en aktivitet</strong>
              {passDetailSchedule.activities.filter(activity => !activityFills[activity.id]).map(activity => <button key={activity.id} type="button" className="btn-secondary" onClick={() => handleOpenScheduleActivityPanel(
                detailState!.empId,
                detailState!.dateStr,
                activity,
                passDetailRemainingPass ? 'Vakans' : detailState!.empName,
                passDetailRemainingPass?.unit ?? employees.find(employee => employee.id === detailState!.empId)?.department ?? detailState!.empRole,
              )}>
                <span>{activity.label}</span>
                <time>{activity.start}–{activity.end}</time>
              </button>)}
            </div>}
          </div> : undefined}
          activities={passDetailActivities}
          includeDefaultActivities={false}
          details={detailState ? (
            <PassDetailCard
              state={detailState}
              onSaveTime={handleUpdatePassTime}
              onPrimaryAction={resourceNeedPrototype ? undefined : handlePassPrimaryAction}
              onCreateOrder={handlePassCreateOrder}
              onCreateResourceNeed={handlePassCreateResourceNeed}
              onReportSick={handlePassReportSick}
              onSimulate={handlePassSimulate}
              resourceNeedMode={resourceNeedPrototype}
              resourceNeed={passDetailResourceNeed}
              resourceNeedOrder={passDetailResourceNeedOrder}
              assignedPerson={passDetailAssignedPerson}
              assignmentFailure={passDetailAssignmentFailure}
              organisation={selectedOrganisation}
            />
          ) : null}
          onPostMessage={detailState ? activity => addPassActivity(passDetailKey, activity) : undefined}
        />

        <CaseActivityModal
          isOpen={Boolean(resourceNeedDetail)}
          onClose={() => setResourceNeedDetail(null)}
          contextKey={resourceNeedDetail?.id}
          kicker="Resursbehov"
          title={resourceNeedDetail ? `${resourceNeedDetail.personName} – resursbehov` : 'Resursbehov'}
          description={resourceNeedDetail ? `${resourceNeedDetail.dateStr} · ${resourceNeedDetail.shift.start}–${resourceNeedDetail.shift.end}` : ''}
          activities={resourceNeedDetail ? resourceNeedActivities[resourceNeedDetail.id] ?? [] : []}
          includeDefaultActivities={false}
          details={resourceNeedDetail ? <ResourceNeedDetailCard need={resourceNeedDetail} order={resourceOrders.find(order => order.id === `resource-order-${resourceNeedDetail.id}`)} onAction={handleResourceNeedAction} onTakeBack={resourceNeedPrototype ? handleTakeBackNeed : undefined} /> : null}
          onPostMessage={resourceNeedDetail ? activity => addResourceNeedActivity(resourceNeedDetail.id, activity) : undefined}
        />

        <CaseActivityModal
          isOpen={Boolean(personDetailEmployee)}
          onClose={() => setPersonDetailId(null)}
          contextKey={personDetailEmployee?.id}
          kicker="Medarbetare"
          title={personDetailEmployee ? `${personDetailEmployee.name} – persondetaljer` : 'Persondetaljer'}
          description={personDetailEmployee ? `${personDetailEmployee.role} · ${personDetailEmployee.department}` : ''}
          activities={personDetailActivities}
          includeDefaultActivities={false}
          details={personDetailEmployee ? (
            <PersonDetailCard
              employee={personDetailEmployee}
              competencies={getEmployeeCompetencies(personDetailEmployee.role)}
              shiftDates={personDetailShiftDates}
              activitySchedules={personDetailSchedules}
              onReportSick={handlePersonReportSick}
              onShowSchedule={handleShowPersonInSchedule}
            />
          ) : null}
          onPostMessage={personDetailEmployee ? activity => addPersonActivity(personDetailEmployee.id, activity) : undefined}
        />

        <CaseActivityModal
          isOpen={Boolean(substituteDetail && substituteDetailState)}
          onClose={handleCloseSubstituteDetails}
          contextKey={substituteDetail ? `${substituteDetail.id}|${substituteDetailState?.dateStr ?? ''}` : undefined}
          kicker="Vikarie"
          title={substituteDetail ? `${substituteDetail.name} – vikarieuppgifter` : 'Vikarieuppgifter'}
          description={substituteDetailState ? `${substituteDetailState.dateStr} · tillgänglighet och händelser` : ''}
          activities={substituteDetailActivities}
          includeDefaultActivities={false}
          details={substituteDetail && substituteDetailState ? (
            <SubstituteDetailCard
              substitute={substituteDetail}
              details={substituteDetailInfo}
              dateStr={substituteDetailState.dateStr}
              dateOptions={substituteDetailDates}
              availability={substituteDetailAvailability}
              hasAvailabilityOverride={Object.prototype.hasOwnProperty.call(substituteAvailabilityOverrides, substituteDetailKey)}
              booking={substituteDetailBooking}
              absenceReason={substituteAbsences[substituteDetailKey]}
              onSelectDate={dateStr => setSubstituteDetailState(current => current ? { ...current, dateStr } : current)}
              onSaveAvailability={availability => handleSetSubstituteAvailability(substituteDetail.id, substituteDetailState.dateStr, availability)}
              onMarkUnavailable={() => handleSetSubstituteAvailability(substituteDetail.id, substituteDetailState.dateStr, null)}
              onRestoreAvailability={() => handleRestoreSubstituteAvailability(substituteDetail.id, substituteDetailState.dateStr)}
              onReportSick={() => handleReportSubstituteSick(substituteDetail.id, substituteDetailState.dateStr)}
              onClearSickness={() => handleClearSubstituteSickness(substituteDetail.id, substituteDetailState.dateStr)}
              onSendRequest={() => handleSendSubstituteRequest(substituteDetail.id)}
            />
          ) : null}
          onPostMessage={substituteDetail ? activity => addSubstituteActivity(substituteDetail.id, activity) : undefined}
        />

      </div>
    </PageLayout>
  );
};
