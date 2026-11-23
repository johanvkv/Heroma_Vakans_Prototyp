/**
 * SCHEMA — Schedule view. Mode B.
 * Substitute panel slides in from bottom on "Hitta vikarie" / "Boka extrapass".
 * Columns align with the main schedule via shared scroll sync.
 */
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
import { VikariehanteringViewSwitcher, type VikariehanteringView } from '../components/VikariehanteringViewSwitcher';
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
type ResourceNeedTimeWindow = 'all' | 'today' | 'this-week' | 'after-this-week';
interface ViewColumn       { date: Date; header: string; subHeader?: string; isWeekend?: boolean; }
interface ShiftFill        { personId: string; dateStr: string; fillType: 'substitute'|'extra'; person: { name: string; role: string }; substituteId?: string; shift?: Shift; }
interface ScheduleEmployee { id: string; name: string; role: string; organisation: string; department: string; team?: string; teamId?: string; fmgGroup: string; }
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
  activities?: ScheduleActivity[];
  reason?: AbsenceReason;
  source: 'frånvaro' | 'pass' | 'vakans';
  status: ResourceNeedStatus;
  workflowStatus?: ResourceOrderStatus;
  createdBy: string;
  handledBy: string;
  assignedSubstituteId?: string;
  assignedSubstituteName?: string;
}
type ResourceOrderStatus = 'Beställd' | 'Under behandling' | 'Förfrågan skickad' | 'Besvarad' | 'Tillsatt' | 'Avbruten';
function resourceNeedLabel(source: ResourceNeed['source'] | undefined): string {
  return source === 'frånvaro' ? 'Frånvaro' : source === 'vakans' ? 'Vakans' : 'Extrapass';
}
type ResourceResponseStatus = 'Avvaktar' | 'Tillgänglig' | 'Kan inte';
interface ResourceOrderInvite {
  substituteId: string;
  name: string;
  role: string;
  response: ResourceResponseStatus;
  responseText?: string;
}
type SubstituteCostLevel = 'Gratis' | 'Kostnadsnivå 1' | 'Kostnadsnivå 2' | 'Kostnadsnivå 3';
interface SubstituteCandidate { id: string; name: string; role: string; category: string; costLevel: SubstituteCostLevel; employmentType?: 'fastanställd' | 'timanställd'; ownUnitIds?: string[]; competencies?: string[]; }
interface CandidateMatchCriterion { label: string; achieved: number; possible: number; detail: string; }
interface CandidateMatch { percent: number; tone: 'green' | 'yellow' | 'red'; criteria: CandidateMatchCriterion[]; blocker?: string; }
const OWN_UNIT_CATEGORY_FILTER_ID = '__egna-vikarier__';
function getCandidateScreeningFlags(candidateId: string) {
  const digits = candidateId.match(/\d+/)?.[0];
  const score = digits ? Number(digits) : candidateId.split('').reduce((total, character) => total + character.charCodeAt(0), 0);
  return { continuity: score % 4 !== 0, clearance: score % 7 !== 0, onboarded: score % 5 !== 0 };
}
function initialsFromName(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0] ?? '').join('').toLocaleUpperCase('sv');
}
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

const LAS_MAX_HOURS = 360;
const ATL_MAX_HOURS = 200;
function isHourlyCandidate(candidate: SubstituteCandidate): boolean {
  return candidate.category === 'Timanställd' || candidate.category === 'Timvikarie';
}
function isPermanentCandidate(candidate: SubstituteCandidate): boolean {
  return candidate.employmentType === 'fastanställd' || candidate.category === 'Fastanställd' || candidate.category === 'Tillgänglig medarbetare';
}
function candidateLasHours(candidateId: string): number {
  const numericId = Number(candidateId.match(/\d+/)?.[0] ?? 1);
  // Deterministic sample values for the prototype; the real limit belongs in settings.
  return 20 + ((numericId * 83) % (LAS_MAX_HOURS - 19));
}
function candidateAtlHours(candidateId: string, details?: SubstituteDetails): number {
  if (details) return details.atlHours;
  const numericId = Number(candidateId.match(/\d+/)?.[0] ?? 1);
  return 18 + ((numericId * 41) % (ATL_MAX_HOURS - 17));
}
function hourUsageTone(hours: number, maximum: number): 'green' | 'yellow' | 'red' {
  const ratio = maximum > 0 ? hours / maximum : 0;
  return ratio >= 0.9 ? 'red' : ratio >= 0.7 ? 'yellow' : 'green';
}
function candidateHoursSummary(candidate: SubstituteCandidate, details?: SubstituteDetails): string | null {
  if (isHourlyCandidate(candidate)) return `LAS ${candidateLasHours(candidate.id)}/${LAS_MAX_HOURS} h`;
  if (isPermanentCandidate(candidate)) return `ATL ${candidateAtlHours(candidate.id, details)}/${ATL_MAX_HOURS} h`;
  return null;
}
interface SubBookedShift { dateStr: string; start: string; end: string; personId?: string; activities?: ScheduleActivity[]; }
interface CandidateBlockedInterval { startMinute: number; endMinute: number; reason: string; }
interface DeclaredUnavailableTime { weekday: number; start: string; end: string; }
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
  matchCandidates?: boolean;
  targetRole?: string;
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
  directAssignment?: boolean;
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
type ResourceNeedActionId = 'open' | 'remove' | 'assign' | 'assign-direct' | 'order' | 'find-substitute';
interface ResourceNeedAction { id: ResourceNeedActionId; text: string; icon: string; }

// ─── Constants ───────────────────────────────────────────────────────────────

const TODAY_STR = toDateStr(new Date());

type ContextTargetType = 'absence' | 'vacant' | 'normal';
type ContextActionId = 'find-substitute' | 'make-vacancy' | 'primary' | 'order-resource' | 'show-details' | 'simulate' | 'create-absence' | 'assign-direct';
type OrganisationActionId = 'open' | 'close' | 'settings';
type SubstituteContextActionId = 'show-details' | 'edit-availability' | 'mark-unavailable' | 'restore-availability' | 'report-sick' | 'clear-sickness' | 'send-request' | 'assign-direct';
interface SubstituteContextAction { id: SubstituteContextActionId; text: string; icon: string; beginGroup?: boolean; }
interface SubstituteContextTarget { substituteId: string; dateStr: string; }

interface ContextAction {
  id: ContextActionId;
  text: string;
  icon: string;
  beginGroup?: boolean;
  disabled?: boolean;
}

function renderSchemaContextMenuItem(item: { id?: string; text?: string; icon?: string; disabled?: boolean }) {
  const icon = item.id === 'assign-direct' ? 'robot' : item.icon ?? 'circle';
  return (
    <span className={`schema-context-menu-item${item.disabled ? ' schema-context-menu-item-disabled' : ''}`} aria-disabled={item.disabled || undefined}>
      <i className={`fa-solid fa-${icon}`} aria-hidden="true" />
      <span>{item.text}</span>
    </span>
  );
}

function ContextKebabButton({ targetSelector, onActivate, className = '', label = 'Fler åtgärder' }: {
  targetSelector?: string;
  onActivate?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  label?: string;
}) {
  const activate = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (onActivate) {
      onActivate(event);
      return;
    }
    const target = targetSelector ? event.currentTarget.closest(targetSelector) : null;
    if (!target) return;
    const rect = event.currentTarget.getBoundingClientRect();
    window.setTimeout(() => target.dispatchEvent(new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: rect.left + rect.width / 2,
      clientY: rect.bottom,
      button: 2,
      buttons: 2,
    })), 0);
  };

  return <button
    type="button"
    className={`schema-context-kebab ${className}`.trim()}
    aria-label={label}
    aria-haspopup="menu"
    title={label}
    onClick={activate}
    onDoubleClick={event => event.stopPropagation()}
    onDragStart={event => { event.preventDefault(); event.stopPropagation(); }}
  ><i className="fa-solid fa-ellipsis-vertical" aria-hidden="true" /></button>;
}

function NewMessageIndicator({ className = '' }: { className?: string }) {
  return <span className={`schema-new-message-indicator ${className}`.trim()} role="img" aria-label="Nytt meddelande" title="Nytt meddelande">
    <i className="fa-solid fa-comment-dots" aria-hidden="true" />
  </span>;
}

function SubstituteDetailLink({ name, substituteId, dateStr, onOpen }: {
  name: string;
  substituteId?: string;
  dateStr: string;
  onOpen?: (substituteId: string, dateStr: string) => void;
}) {
  if (!substituteId || !onOpen) return <>{name}</>;
  return <button
    type="button"
    className="schema-assigned-substitute-link"
    aria-haspopup="dialog"
    title={`Visa kandidatdetaljer för ${name}`}
    onClick={event => { event.stopPropagation(); onOpen(substituteId, dateStr); }}
    onDoubleClick={event => event.stopPropagation()}
  >{name}</button>;
}

function getContextActions(type: ContextTargetType, resourceNeedMode = false, isAssigned = false): ContextAction[] {
  const directAssignment = resourceNeedMode && !isAssigned
    ? [{ id: 'assign-direct' as const, text: 'Tillsätt direkt', icon: 'robot', beginGroup: true }]
    : [];
  if (type === 'absence') {
    return [
      { id: 'find-substitute', text: 'Hitta ersättare', icon: 'user' },
      { id: 'order-resource', text: 'Beställ resurs', icon: 'cart-shopping' },
      ...directAssignment,
      { id: 'make-vacancy', text: resourceNeedMode ? 'Skapa resursbehov' : 'Gör till vakans', icon: 'user-clock' },
      { id: 'simulate', text: 'Simulera', icon: 'flask', beginGroup: true },
      { id: 'show-details', text: 'Visa frånvarodetaljer', icon: 'circle-info', beginGroup: true },
    ];
  }
  return [
    { id: 'find-substitute', text: 'Hitta ersättare', icon: 'user' },
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
  sub1: { phone: '070-123 45 67', email: 'anna.viksson@vardpool.se',    competencies: ['Demens', 'Palliation', 'Sondmatning'],             atlHours: 145, maxAtlHours: ATL_MAX_HOURS },
  sub2: { phone: '072-234 56 78', email: 'erik.lindqvist@vardpool.se',  competencies: ['Akutvård', 'IV-behandling', 'Insulingivning'],       atlHours: 88,  maxAtlHours: ATL_MAX_HOURS },
  sub3: { phone: '073-345 67 89', email: 'maria.svensson@vardpool.se',  competencies: ['Demens', 'Rehabilitering'],                         atlHours: 160, maxAtlHours: ATL_MAX_HOURS },
  sub4: { phone: '076-456 78 90', email: 'jonas.berg@vardpool.se',      competencies: ['Medicinsk vård', 'Sårbehandling', 'Läkemedel'],      atlHours: 112, maxAtlHours: ATL_MAX_HOURS },
  sub5: { phone: '070-567 89 01', email: 'karin.nilsson@vardpool.se',   competencies: ['Barnomsorg', 'Demens'],                             atlHours: 72,  maxAtlHours: ATL_MAX_HOURS },
  sub6: { phone: '073-678 90 12', email: 'peter.holm@vardpool.se',      competencies: ['Kirurgi', 'Akutvård', 'Smärtlindring'],             atlHours: 130, maxAtlHours: ATL_MAX_HOURS },
  sub7: { phone: '070-789 01 23', email: 'sara.lundberg@vardpool.se',   competencies: ['Rehabilitering', 'Hemtjänst'],                      atlHours: 55,  maxAtlHours: ATL_MAX_HOURS },
  sub8: { phone: '072-890 12 34', email: 'anders.persson@vardpool.se',  competencies: ['Intensivvård', 'Neurologi', 'HLR-instruktör'],       atlHours: 168, maxAtlHours: ATL_MAX_HOURS },
};

// Pre-existing booked shifts for substitutes (date → time range)
const SUB_BOOKED_SHIFTS: Record<string, SubBookedShift[]> = {
  sub1: [{ dateStr: '2026-09-05', start: '08:00', end: '17:00' }],
  sub2: [{ dateStr: '2026-09-04', start: '14:30', end: '22:30' }, { dateStr: '2026-09-07', start: '06:45', end: '15:00' }],
  sub3: [{ dateStr: '2026-09-06', start: '06:45', end: '15:00' }],
  sub5: [{ dateStr: '2026-09-03', start: '22:00', end: '06:00' }],
  sub8: [{ dateStr: '2026-09-05', start: '06:45', end: '15:00' }, { dateStr: '2026-09-06', start: '06:45', end: '15:00' }],
};

// Example candidate-entered blocked time windows for the hospital prototype (weekday uses JS Sunday=0).
const SUB_DECLARED_UNAVAILABLE_TIMES: Record<string, DeclaredUnavailableTime[]> = {
  sub1: [{ weekday: 2, start: '12:00', end: '14:30' }],
  sub6: [{ weekday: 5, start: '16:00', end: '18:00' }],
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
  [`${_pid4}|${TODAY_STR}`]: 'Semester',
  [`${_pid5}|${TODAY_STR}`]: 'Sjuk',
  [`${_pid6}|${TODAY_STR}`]: 'Sjuk',
};
const REPLACED_PAST_PRESCHOOL_ABSENCE_KEYS = [
  `${_pid2}|2026-09-05`, `${_pid10}|2026-09-10`, `${_pid12}|2026-09-11`,
  `${_pid14}|2026-09-15`, `${_pid16}|2026-09-17`, `${_pid18}|2026-09-22`,
];
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
function matchesResourceNeedTimeWindow(dateStr: string, timeWindow: ResourceNeedTimeWindow): boolean {
  if (timeWindow === 'all') return true;
  if (timeWindow === 'today') return dateStr === TODAY_STR;
  const weekStart = toDateStr(monWeekStart(parseDate(TODAY_STR)));
  const nextWeekStart = toDateStr(addDays(parseDate(weekStart), 7));
  return timeWindow === 'this-week'
    ? dateStr >= weekStart && dateStr < nextWeekStart
    : dateStr >= nextWeekStart;
}

function ResourceNeedTimeWindowFilter({ value, onChange, compact = false }: {
  value: ResourceNeedTimeWindow;
  onChange: (value: ResourceNeedTimeWindow) => void;
  compact?: boolean;
}) {
  return <label className={`schema-kanban-time-window-filter${compact ? ' schema-resource-needs-time-window-filter' : ''}`}>
    Tidsfönster
    <select value={value} onChange={event => onChange(event.currentTarget.value as ResourceNeedTimeWindow)}>
      <option value="all">Alla</option>
      <option value="today">Idag</option>
      <option value="this-week">Denna vecka</option>
      <option value="after-this-week">Efter denna vecka</option>
    </select>
  </label>;
}

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
  const key = `${personId}|${dateStr}`;
  if (RUNTIME_ABSENCE_SHIFTS[key]) return 'absence';
  if (fills.some(f=>f.personId===personId&&f.dateStr===dateStr)) return 'filled';
  if (vacancyKeys.includes(key)) return 'vacant';
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

const HOSPITAL_ORGANISATION = {
  id: 'norrangen-sjukhus',
  label: 'Norrängens sjukhus',
  unitId: 'akutvardsavdelningen',
  unit: 'Akutvårdsavdelningen',
  departments: [
    { id: 'akutvardsavdelningen', label: 'Akutvårdsavdelningen' },
    { id: 'medicinavdelningen', label: 'Medicinavdelningen' },
  ],
  teams: ['Team 1', 'Team 2'],
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
const HOSPITAL_ACTIVITY_TYPES: Record<ActivityKind, { label: string; className: string }> = {
  pedagogical: { label: 'Rapport och överlämning', className: 'schema-activity-type-pedagogical' },
  outdoors: { label: 'Patientrond och bedömning', className: 'schema-activity-type-outdoors' },
  meals: { label: 'Läkemedelshantering', className: 'schema-activity-type-meals' },
  rest: { label: 'Omvårdnad och dokumentation', className: 'schema-activity-type-rest' },
};
const PRESCHOOL_ACTIVITY_FILTERS: Array<{ id: ActivityFilterKind; label: string }> = [
  ...Object.entries(PRESCHOOL_ACTIVITY_TYPES).map(([id, type]) => ({ id: id as ActivityKind, label: type.label })),
  { id: 'absence', label: 'Frånvaro' },
];
const HOSPITAL_ACTIVITY_FILTERS: Array<{ id: ActivityFilterKind; label: string }> = [
  ...Object.entries(HOSPITAL_ACTIVITY_TYPES).map(([id, type]) => ({ id: id as ActivityKind, label: type.label })),
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

function formatActivityTime(minutes: number): string {
  const bounded = Math.max(0, Math.min(1440, minutes));
  return `${String(Math.floor(bounded / 60)).padStart(2, '0')}:${String(bounded % 60).padStart(2, '0')}`;
}

function getHospitalActivities(employeeId: string, date: Date, shift: Shift): ScheduleActivity[] {
  const start = timeToMinutes(shift.start);
  const rawEnd = timeToMinutes(shift.end);
  const overnight = rawEnd <= start;
  const visibleEnd = overnight ? rawEnd + 1440 : rawEnd;
  const duration = Math.max(0, visibleEnd - start);
  if (!duration) return [];
  const dateStr = toDateStr(date);
  const kinds: ActivityKind[] = ['pedagogical', 'outdoors', 'meals', 'rest'];
  const segments = overnight ? 1 : (employeeId.charCodeAt(0) + date.getDate()) % 2 === 0 ? 2 : 1;
  return Array.from({ length: segments }, (_, index) => {
    const segmentStart = Math.min(start + Math.round(duration * index / segments), 1440);
    const segmentEnd = Math.min(start + Math.round(duration * (index + 1) / segments), 1440);
    const kind = kinds[(index + (date.getDate() % kinds.length)) % kinds.length];
    return {
      id: `${employeeId}|${dateStr}|hospital-activity-${index + 1}`,
      employeeId,
      dateStr,
      kind,
      label: HOSPITAL_ACTIVITY_TYPES[kind].label,
      start: formatActivityTime(segmentStart),
      end: formatActivityTime(overnight && index === segments - 1 ? visibleEnd - 1440 : segmentEnd),
    };
  });
}

function seedForwardPreschoolAbsences(): void {
  const examples = [
    { employeeIndex: 2, firstOffset: 1 },
    { employeeIndex: 10, firstOffset: 3 },
    { employeeIndex: 12, firstOffset: 5 },
    { employeeIndex: 14, firstOffset: 7 },
    { employeeIndex: 16, firstOffset: 9 },
    { employeeIndex: 18, firstOffset: 11 },
  ];

  REPLACED_PAST_PRESCHOOL_ABSENCE_KEYS.forEach(key => {
    delete RUNTIME_ABSENCE_SHIFTS[key];
    delete RUNTIME_ABSENCE_REASONS[key];
  });

  examples.forEach(({ employeeIndex, firstOffset }) => {
    const employee = persons[employeeIndex];
    if (!employee) return;
    for (let offset = firstOffset; offset < firstOffset + 8; offset += 1) {
      const date = addDays(parseDate(TODAY_STR), offset);
      const schedule = getPreschoolDayPattern(employeeIndex, date);
      if (!schedule) continue;
      const key = `${employee.id}|${toDateStr(date)}`;
      if (RUNTIME_ABSENCE_REASONS[key]) continue;
      RUNTIME_ABSENCE_SHIFTS[key] = getCellShift(employee.id, date, 'alla') ?? schedule.shift;
      RUNTIME_ABSENCE_REASONS[key] = 'Sjuk';
      break;
    }
  });
}

seedForwardPreschoolAbsences();

const CARE_ROLES = [
  'Sjuksköterska', 'Undersköterska', 'Läkare', 'Fysioterapeut', 'Vårdadministratör',
  'Sjuksköterska', 'Undersköterska', 'Läkare', 'Medicinsk sekreterare', 'Arbetsterapeut',
  'Sjuksköterska', 'Undersköterska', 'Läkare', 'Sjuksköterska', 'Vårdadministratör',
  'Sjuksköterska', 'Undersköterska', 'Läkare', 'Medicinsk sekreterare', 'Fysioterapeut',
];

const HOSPITAL_ROLES = [
  'Sjuksköterska', 'Undersköterska', 'Läkare', 'Undersköterska', 'Sjuksköterska',
  'Vårdadministratör', 'Sjuksköterska', 'Undersköterska', 'Läkare', 'Undersköterska',
  'Sjuksköterska', 'Medicinsk sekreterare', 'Undersköterska', 'Sjuksköterska', 'Läkare',
  'Undersköterska', 'Fysioterapeut', 'Sjuksköterska', 'Undersköterska', 'Sjuksköterska',
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
function timeMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}
function getCandidateBlockedIntervals(subId: string, date: Date, bookings: SubBookedShift[] = []): CandidateBlockedInterval[] {
  const dayNumber = (value: Date) => Math.floor(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()) / 86400000);
  const targetDay = dayNumber(date);
  const targetStart = targetDay * 1440;
  const intervals: CandidateBlockedInterval[] = (SUB_DECLARED_UNAVAILABLE_TIMES[subId] ?? [])
    .filter(window => window.weekday === date.getDay())
    .map(window => {
      const startMinute = timeMinutes(window.start);
      const rawEnd = timeMinutes(window.end);
      return { startMinute, endMinute: rawEnd <= startMinute ? rawEnd + 1440 : rawEnd, reason: 'Ej tillgänglig tid' };
    })
    .map(interval => ({ ...interval, endMinute: Math.min(interval.endMinute, 1440) }))
    .filter(interval => interval.endMinute > interval.startMinute);

  bookings.forEach(booking => {
    const bookingDate = parseDate(booking.dateStr);
    const bookingDay = dayNumber(bookingDate);
    const startMinute = timeMinutes(booking.start);
    const rawEnd = timeMinutes(booking.end);
    const duration = rawEnd <= startMinute ? rawEnd + 1440 - startMinute : rawEnd - startMinute;
    const restStart = bookingDay * 1440 + startMinute + duration;
    const restEnd = restStart + 11 * 60;
    const start = Math.max(0, restStart - targetStart);
    const end = Math.min(1440, restEnd - targetStart);
    if (end > start) intervals.push({ startMinute: start, endMinute: end, reason: 'Dygnsvila (11 timmar)' });
  });
  return intervals.sort((a, b) => a.startMinute - b.startMinute);
}
function candidateHasRestConflict(subId: string, date: Date, shift: Shift, bookings: SubBookedShift[] = []): boolean {
  const shiftStart = timeMinutes(shift.start);
  const rawEnd = timeMinutes(shift.end);
  const shiftEnd = rawEnd <= shiftStart ? rawEnd + 1440 : rawEnd;
  const intervals = [
    ...getCandidateBlockedIntervals(subId, date, bookings),
    ...(shiftEnd > 1440 ? getCandidateBlockedIntervals(subId, addDays(date, 1), bookings).map(interval => ({ ...interval, startMinute: interval.startMinute + 1440, endMinute: interval.endMinute + 1440 })) : []),
  ];
  return intervals.some(interval => Math.max(shiftStart, interval.startMinute) < Math.min(shiftEnd, interval.endMinute));
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

// Higher score = more suitable. Factors: availability overlap, remaining tracked hours, no conflict.
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
  const candidate = SUBSTITUTE_CANDIDATES.find(item => item.id === subId);
  const workloadCapacity = candidate && isHourlyCandidate(candidate)
    ? (LAS_MAX_HOURS - candidateLasHours(candidate.id)) / LAS_MAX_HOURS
    : candidate && isPermanentCandidate(candidate)
      ? (ATL_MAX_HOURS - candidateAtlHours(candidate.id, details)) / ATL_MAX_HOURS
      : 0;
  const booked  = (SUB_BOOKED_SHIFTS[subId] ?? []).some(b => b.dateStr === toDateStr(date));
  return pct + workloadCapacity * 10 - (booked ? 200 : 0);
}

function candidateRankScore(candidate: SubstituteCandidate, date: Date, shift: Shift, overrides: SubstituteAvailabilityOverrides, absences: SubstituteAbsences): number {
  const costPreference = candidate.costLevel === 'Gratis' ? 12
    : candidate.costLevel === 'Kostnadsnivå 1' ? 8
      : candidate.costLevel === 'Kostnadsnivå 2' ? 4 : 0;
  return suitabilityScore(candidate.id, date, shift, overrides, absences) + costPreference;
}

// ─── Shift cell sub-components ────────────────────────────────────────────────

function ShiftDayCell({ shift, color, passInfo, isAkut, orderedBy, orderStatus, orderHandledBy, resourceNeedMode = false, resourceNeedCreatedBy, resourceNeedSource, resourceNeedDisplayStatus, resourceNeedHandler, assignmentFailure, overnightContinuation = false }: { shift: Shift; color: ColorScheme; passInfo?: string; isAkut?: boolean; orderedBy?: string; orderStatus?: ResourceOrderStatus; orderHandledBy?: string; resourceNeedMode?: boolean; resourceNeedCreatedBy?: string; resourceNeedSource?: ResourceNeed['source']; resourceNeedDisplayStatus?: string; resourceNeedHandler?: string; assignmentFailure?: string; overnightContinuation?: boolean }) {
  const cap  = `schema-col-${color}-cap`;
  const main = `schema-col-${color}-main`;
  return (
    <div className="schema-shift">
      <div className={`schema-timeline${overnightContinuation ? ' schema-timeline-overflow' : ''}`}>
        {shift.type === 'night' ? (
          overnightContinuation
            ? <><div className={`schema-tl-bar schema-tl-pos-night-span-cap ${cap}`} /><div className={`schema-tl-bar schema-tl-pos-night-span-main ${main}`} /></>
            : <><div className={`schema-tl-bar schema-tl-pos-night-end ${cap}`} /><div className={`schema-tl-bar schema-tl-pos-night-start ${main}`} /></>
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
        {resourceNeedMode && resourceNeedCreatedBy && <span className={`schema-resource-need-badge${resourceNeedHandler === 'Maja Andersson' ? ' schema-resource-need-badge-requester' : ''}`} title={`${resourceNeedLabel(resourceNeedSource)} · Skapad av ${resourceNeedCreatedBy} · ${resourceNeedDisplayStatus ?? 'Öppet'} · Hanteras av ${resourceNeedHandler ?? resourceNeedCreatedBy}`}><i className="fa-solid fa-user-clock" /> {resourceNeedLabel(resourceNeedSource)} · {resourceNeedCreatedBy}</span>}
        {orderedBy && <span className="schema-order-badge" title={resourceNeedMode ? `Beställning · ${orderStatus ?? 'Beställd'} · Hanteras av ${orderHandledBy ?? orderedBy}` : `Beställd av ${orderedBy}`}><i className="fa-solid fa-cart-shopping" /><span className="schema-order-badge-text">{resourceNeedMode ? `${orderStatus ?? 'Beställd'} · ${orderHandledBy ?? orderedBy}` : `Beställd av ${orderedBy}`}</span></span>}
        {assignmentFailure && <span className="schema-assignment-failure-badge" title={assignmentFailure}><i className="fa-solid fa-robot" /><i className="fa-solid fa-triangle-exclamation" /> Kunde inte tillsättas</span>}
      </div>
    </div>
  );
}

function ShiftMonthCell({ shift, color, passInfo, isAkut, orderedBy, orderStatus, orderHandledBy, resourceNeedMode = false, resourceNeedCreatedBy, resourceNeedSource, resourceNeedDisplayStatus, resourceNeedHandler, assignmentFailure, overnightContinuation = false }: { shift: Shift; color: ColorScheme; passInfo?: string; isAkut?: boolean; orderedBy?: string; orderStatus?: ResourceOrderStatus; orderHandledBy?: string; resourceNeedMode?: boolean; resourceNeedCreatedBy?: string; resourceNeedSource?: ResourceNeed['source']; resourceNeedDisplayStatus?: string; resourceNeedHandler?: string; assignmentFailure?: string; overnightContinuation?: boolean }) {
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
  const needCreatorTag = resourceNeedCreatedBy?.split(/\s+/).map(part => part[0]).join('') ?? '';
  const orderStatusText = orderStatus ? compactStatus[orderStatus] ?? orderStatus : 'Beställd';
  const orderHandlerTag = orderHandledBy?.split(/\s+/).map(part => part[0]).join('') ?? '';
  return (
    <div className="schema-month-shift">
      <div className={`schema-timeline${overnightContinuation ? ' schema-timeline-overflow' : ''}`}>
        {shift.type === 'night' ? (
          overnightContinuation
            ? <><div className={`schema-tl-bar schema-tl-pos-night-span-cap ${cap}`} /><div className={`schema-tl-bar schema-tl-pos-night-span-main ${main}`} /></>
            : <><div className={`schema-tl-bar schema-tl-pos-night-end ${cap}`} /><div className={`schema-tl-bar schema-tl-pos-night-start ${main}`} /></>
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
        {resourceNeedMode && resourceNeedCreatedBy && <span className={`schema-resource-need-badge schema-resource-need-badge-month${resourceNeedHandler === 'Maja Andersson' ? ' schema-resource-need-badge-requester' : ''}`} title={`${resourceNeedLabel(resourceNeedSource)} · Skapad av ${resourceNeedCreatedBy} · ${resourceNeedDisplayStatus ?? 'Öppet'} · Hanteras av ${resourceNeedHandler ?? resourceNeedCreatedBy}`}><i className="fa-solid fa-user-clock" /><span>{resourceNeedSource === 'frånvaro' ? 'F' : resourceNeedSource === 'vakans' ? 'V' : 'E'}·{needCreatorTag || needStatusText}{needHandlerTag ? ` · ${needHandlerTag}` : ''}</span></span>}
        {orderedBy && <span className="schema-order-badge schema-order-badge-month" title={resourceNeedMode ? `Beställning · ${orderStatus ?? 'Beställd'} · Hanteras av ${orderHandledBy ?? orderedBy}` : `Beställd av ${orderedBy}`}><i className="fa-solid fa-cart-shopping" /><span className="schema-order-badge-text">{resourceNeedMode ? `${orderStatusText}${orderHandlerTag ? ` · ${orderHandlerTag}` : ''}` : `Beställd av ${orderedBy}`}</span></span>}
        {assignmentFailure && <span className="schema-assignment-failure-badge schema-assignment-failure-badge-month" title={assignmentFailure}><i className="fa-solid fa-robot" /><i className="fa-solid fa-triangle-exclamation" /></span>}
      </div>
    </div>
  );
}

function NightPassCarryIn({ color, compact = false }: { color: ColorScheme; compact?: boolean }) {
  return <span className={`schema-night-pass-carry${compact ? ' schema-night-pass-carry-compact' : ''}`} aria-hidden="true" title="Fortsättning av nattpass från föregående dag">
    <i className={`schema-night-pass-carry-cap schema-col-${color}-cap`} />
    <i className={`schema-night-pass-carry-main schema-col-${color}-main`} />
  </span>;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function ActivityTimelineCell({ shift, activities, activityFills, availability, bookedAssignment, absenceLabel, vacancyLabel, statusLabel, assignedSubstituteName, resourceNeedCreatedBy, resourceNeedSource, resourceNeedDisplayStatus, resourceNeedHandler, isOrdered = false, resourceStatus = false, isPast, hospitalMode = false, carryInShift, carryInActivities = [], carryInAbsenceLabel, carryInVacancyLabel, carryInIsOrdered = false, carryInAssignedSubstituteName, carryInIsPast = false, selectedActivityId, onCarryInDoubleClick, onPassDragStart, onPassDragOver, onPassDrop }: {
  shift: Shift | null;
  activities: ScheduleActivity[];
  activityFills: Record<string, ActivityFill>;
  availability: SubAvailability | null;
  bookedAssignment?: { start: string; end: string; name: string };
  absenceLabel?: string;
  vacancyLabel?: string;
  statusLabel?: string;
  assignedSubstituteName?: string;
  resourceNeedCreatedBy?: string;
  resourceNeedSource?: ResourceNeed['source'];
  resourceNeedDisplayStatus?: string;
  resourceNeedHandler?: string;
  isOrdered?: boolean;
  resourceStatus?: boolean;
  isPast: boolean;
  hospitalMode?: boolean;
  carryInShift?: Shift | null;
  carryInActivities?: ScheduleActivity[];
  carryInAbsenceLabel?: string;
  carryInVacancyLabel?: string;
  carryInIsOrdered?: boolean;
  carryInAssignedSubstituteName?: string;
  carryInIsPast?: boolean;
  selectedActivityId?: string;
  onCarryInDoubleClick?: () => void;
  onPassDragStart?: (event: React.DragEvent, shift: Shift) => void;
  onPassDragOver: (event: React.DragEvent) => void;
  onPassDrop: (event: React.DragEvent, shift: Shift) => void;
}) {
  const segmentStyle = (start: string, end: string, continuesFromPrevious = false, continuesIntoNext = false): React.CSSProperties => {
    const left = timeToMinutes(start) / 1440 * 100;
    const width = Math.max(0, (timeToMinutes(end) - timeToMinutes(start)) / 1440 * 100);
    const overlap = Number(continuesFromPrevious) + Number(continuesIntoNext);
    return {
      left: continuesFromPrevious ? `calc(${left}% - 1px)` : `${left}%`,
      width: overlap ? `calc(${width}% + ${overlap}px)` : `${width}%`,
    };
  };
  const availabilityStart = availability ? `${String(availability.startH).padStart(2, '0')}:${String(availability.startM).padStart(2, '0')}` : '';
  const availabilityEnd = availability ? `${String(availability.endH).padStart(2, '0')}:${String(availability.endM).padStart(2, '0')}` : '';
  const totalTime = shift ? `${shift.start}–${shift.end}`
    : bookedAssignment ? `${bookedAssignment.start}–${bookedAssignment.end}`
      : availability ? fmtAvailTime(availability) : '';
  const statusCaption = statusLabel ?? absenceLabel ?? vacancyLabel;
  const rangeSegments = (start: string, end: string, portion: 'start' | 'carry' | 'whole' = 'whole') => {
    if (timeToMinutes(end) > timeToMinutes(start)) return [{ start, end }];
    if (portion === 'start') return [{ start, end: '24:00' }];
    if (portion === 'carry') return [{ start: '00:00', end }];
    return [{ start, end: '24:00' }, { start: '00:00', end }];
  };
  const activityTypes = hospitalMode ? HOSPITAL_ACTIVITY_TYPES : PRESCHOOL_ACTIVITY_TYPES;
  const activityBar = (activity: ScheduleActivity, portion: 'start' | 'carry', carry = false) => {
    const presentation = activityTypes[activity.kind];
    const assignment = activityFills[activity.id];
    const assignedName = assignment?.substituteName ?? (carry ? carryInAssignedSubstituteName ?? assignedSubstituteName : assignedSubstituteName);
    const segmentAbsenceLabel = carry ? carryInAbsenceLabel : absenceLabel;
    const segmentVacancyLabel = carry ? carryInVacancyLabel : vacancyLabel;
    const segmentIsOrdered = carry ? carryInIsOrdered : isOrdered;
    const segments = rangeSegments(activity.start, activity.end, portion);
    const isFirstActivity = carry
      ? false
      : activities[0]?.id === activity.id;
    const isLastActivity = carry
      ? carryInActivities[carryInActivities.length - 1]?.id === activity.id
      : activities[activities.length - 1]?.id === activity.id
        && timeToMinutes(activity.end) > timeToMinutes(activity.start);
    return segments.map((segment, index) => <div
      key={`${activity.id}-${carry ? 'carry' : 'start'}-${index}`}
      role="img"
      className={`schema-activity-bar ${presentation.className}${activity.id === selectedActivityId ? ' schema-activity-bar-selected' : ''}${isFirstActivity && index === 0 ? ' schema-activity-bar-start-cap' : ''}${isLastActivity && index === segments.length - 1 ? ' schema-activity-bar-end-cap' : ''}${carry ? ' schema-activity-bar-carry' : timeToMinutes(activity.end) <= timeToMinutes(activity.start) ? ' schema-activity-bar-overflow-start' : ''}${!assignedName && segmentAbsenceLabel ? ' schema-activity-bar-absence' : !assignedName && segmentIsOrdered ? ' schema-activity-bar-ordered' : !assignedName && segmentVacancyLabel ? ' schema-activity-bar-vacant' : ''}${assignedName ? ' schema-activity-bar-filled' : ''}${carry && carryInIsPast && !isPast ? ' schema-activity-bar-past' : ''}`}
      data-activity-id={activity.id}
      style={segmentStyle(segment.start, segment.end, carry, segment.end === '24:00')}
      aria-label={`${activity.label}, ${activity.start} till ${activity.end}${assignedName ? `, vikarie ${assignedName}` : ''}${carry ? ', fortsättning från föregående dag' : ''}`}
      title={`${activity.label} · ${activity.start}–${activity.end}${assignedName ? ` · Tillsatt med ${assignedName}` : ''}${carry ? ' · Fortsättning av samma nattpass' : ''}`}
      onDoubleClick={carry && onCarryInDoubleClick ? event => { event.stopPropagation(); onCarryInDoubleClick(); } : undefined}
    >
      {(carry || (timeToMinutes(segment.end) - timeToMinutes(segment.start)) / 1440 * 100 >= 12) && <span>{activity.label.slice(0, 3)}</span>}
      {assignedName && <i className="fa-solid fa-check schema-activity-assignment-check" aria-hidden="true" />}
    </div>);
  };
  const needTypeLabel = resourceNeedLabel(resourceNeedSource);
  const resourceStatusLabels: Record<string, string> = {
    'Under behandling': 'Påbörjad',
    'Förfrågan skickad': 'Förfrågan skickad',
    'Besvarad': 'Besvarad',
    'Tillsatt': 'Tillsatt',
    'Öppet': 'Öppet',
    'Borttaget': 'Borttaget',
  };
  const resourceStatusText = resourceNeedDisplayStatus
    ? resourceStatusLabels[resourceNeedDisplayStatus] ?? resourceNeedDisplayStatus
    : statusLabel ?? 'Öppet';
  const resourceStatusCaption = resourceStatusText === 'Tillsatt' && assignedSubstituteName
    ? `${resourceStatusText} ${assignedSubstituteName}`
    : resourceStatusText;
  return (
    <div
      className={`schema-activity-timeline${isPast ? ' schema-activity-timeline-past' : ''}`}
      aria-label={`Schema ${totalTime}`}
      draggable={Boolean(shift && onPassDragStart)}
      onDragStart={shift && onPassDragStart ? event => onPassDragStart(event, shift) : undefined}
      onDragOver={shift ? onPassDragOver : undefined}
      onDrop={shift ? event => onPassDrop(event, shift) : undefined}
    >
      <div className="schema-activity-lanes">
      {shift && rangeSegments(shift.start, shift.end, 'start').map((segment, index) => <div
        key={`pass-segment-${index}`}
        aria-hidden="true"
        className="schema-activity-pass-window"
        style={segmentStyle(segment.start, segment.end)}
        onDragOver={onPassDragOver}
        onDrop={event => onPassDrop(event, shift)}
      />)}
      <div className="schema-activity-row">
        {carryInActivities.map(activity => activityBar(activity, 'carry', true))}
        {activities.map(activity => activityBar(activity, 'start'))}
      </div>
      {bookedAssignment && !shift && <div className="schema-activity-row">
        <span
          className="schema-activity-booked-window"
          style={segmentStyle(bookedAssignment.start, bookedAssignment.end)}
          title={`Bokad som vikarie för ${bookedAssignment.name}, ${bookedAssignment.start}–${bookedAssignment.end}`}
        />
      </div>}
      {!shift && !bookedAssignment && <div className="schema-activity-row" aria-hidden="true" />}
      </div>
      {availability && !shift && !bookedAssignment && <span
          className="schema-activity-availability-window"
          style={segmentStyle(availabilityStart, availabilityEnd)}
          title={fmtAvailTime(availability)}
        />}
      <div className={`schema-activity-captions${hospitalMode ? ' schema-activity-captions-hospital' : ''}`}>
        {totalTime && <span className="schema-activity-time-line"><span className="schema-activity-total-time">{totalTime}</span>{resourceNeedCreatedBy && <span className="schema-activity-resource-need-caption" aria-hidden="true" title={`${needTypeLabel} resursbehov`}><i className="fa-solid fa-user-clock" /></span>}</span>}
        {carryInShift?.type === 'night' && <span className="schema-activity-carry-time">22:00–{carryInShift.end} · fortsättning</span>}
        {assignedSubstituteName && !resourceNeedCreatedBy && <span className="schema-activity-assignment-caption">Tillsatt med {assignedSubstituteName}</span>}
        {resourceNeedCreatedBy
          ? <span className={`schema-activity-resource-status-caption${resourceStatusText === 'Tillsatt' ? ' schema-activity-resource-status-filled' : ''}`} title={`${resourceStatusCaption}${resourceNeedHandler ? ` · Hanteras av ${resourceNeedHandler}` : ''}`}>{resourceStatusCaption}</span>
          : statusCaption && <span className={`schema-activity-absence-caption${vacancyLabel ? ' schema-activity-vacancy-caption' : ''}${resourceStatus ? ' schema-activity-resource-status-caption' : ''}`}>{statusCaption}</span>}
      </div>
    </div>
  );
}

// ─── Substitute panel ─────────────────────────────────────────────────────────

interface SubstitutePanelProps {
  isOpen: boolean;
  browseAll: boolean;
  state: SubPanelState | null;
  candidates: SubstituteCandidate[];
  unreadMessageEntities: Set<string>;
  singleAssignment?: boolean;
  preschoolMode?: boolean;
  targetUnitId?: string;
  targetCompetencies?: string[];
  bookingsByCandidate?: Record<string, SubBookedShift[]>;
  highlightedCandidateId?: string | null;
  highlightedCandidateBooking?: { candidateId: string; dateStr: string } | null;
  relatedCandidateIds?: string[];
  relatedCandidateBookingKeys?: string[];
  onSelectCandidate?: (candidateId: string) => void;
  onSelectCandidateBooking?: (candidateId: string, booking: SubBookedShift) => void;
  columns: ViewColumn[];
  viewType: ViewType;
  viewColumnWidth?: number;
  onClose: () => void;
  onSendRequest: (selectedIds: string[]) => void;
  onDirectAssign: (selectedIds: string[]) => void;
  onOpenDetails: (substituteId: string, dateStr: string) => void;
  onSetAvailability: (substituteId: string, dateStr: string, availability: SubAvailability | null) => void;
  onRestoreAvailability: (substituteId: string, dateStr: string) => void;
  onReportSick: (substituteId: string, dateStr: string) => void;
  onClearSickness: (substituteId: string, dateStr: string) => void;
  availabilityOverrides: SubstituteAvailabilityOverrides;
  absences: SubstituteAbsences;
  onDragStart: (e: React.DragEvent, subId: string) => void;
  onDragStartAvailability: (event: React.DragEvent, candidateId: string, dateStr: string) => void;
  scrollRef: React.RefObject<HTMLDivElement>;
  tableWidth: number;
  tableInset: number;
  panelLeft?: number;
  panelWidth?: number;
}

function SubstitutePanel({
  isOpen, browseAll, state, candidates, unreadMessageEntities, singleAssignment = false, preschoolMode = false, targetUnitId, targetCompetencies = [], bookingsByCandidate = SUB_BOOKED_SHIFTS, columns, viewType, viewColumnWidth: viewColumnWidthOverride,
  highlightedCandidateId = null, highlightedCandidateBooking = null, relatedCandidateIds = [], relatedCandidateBookingKeys = [], onSelectCandidate, onSelectCandidateBooking,
  onClose, onSendRequest, onDirectAssign, onOpenDetails, onSetAvailability, onRestoreAvailability, onReportSick, onClearSickness,
  availabilityOverrides, absences,
  onDragStart, onDragStartAvailability, scrollRef, tableWidth, tableInset, panelLeft, panelWidth,
}: SubstitutePanelProps) {
  const [filterRoles, setFilterRoles] = useState<string[]>([]);
  const [filterText, setFilterText] = useState('');
  const [matchDetailId, setMatchDetailId] = useState<string | null>(null);
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [categoryFilterOpen, setCategoryFilterOpen] = useState(false);
  const categoryFilterTriggerRef = useRef<HTMLButtonElement>(null);
  const categoryFilterPopupRef = useRef<HTMLDivElement>(null);
  const [categoryFilterBounds, setCategoryFilterBounds] = useState<{ top: number; left: number; width: number } | null>(null);
  const [filterCompetencies, setFilterCompetencies] = useState<string[]>([]);
  const [filterPass,  setFilterPass]  = useState('alla');
  const [timeFlexibility, setTimeFlexibility] = useState(1);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [continuityFilter, setContinuityFilter] = useState(false);
  const [clearanceFilter, setClearanceFilter] = useState(false);
  const [onboardedFilter, setOnboardedFilter] = useState(false);
  const [costFocusFilter, setCostFocusFilter] = useState(false);
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
    setFilterText('');
    setMatchDetailId(null);
    setFilterCategories([]);
    setCategoryFilterOpen(false);
    setFilterCompetencies([]);
    setFilterPass('alla');
    setTimeFlexibility(1);
    setAdvancedFiltersOpen(false);
    setContinuityFilter(false);
    setClearanceFilter(false);
    setOnboardedFilter(false);
    setCostFocusFilter(false);
    if (preschoolMode && !state?.matchCandidates && targetCompetencies.length > 0) setFilterCompetencies(targetCompetencies);
    setSelectedSubIds([]);
    setExpandedSubId(null);
  }, [browseAll, preschoolMode, state?.dateStr, state?.personId, state?.targetActivityId, state?.targetType, state?.matchCandidates, targetCompetencies]);

  useEffect(() => {
    if (!categoryFilterOpen) return;
    const updatePopupPosition = () => {
      const rect = categoryFilterTriggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.max(rect.width, 190);
      setCategoryFilterBounds({
        top: Math.max(8, Math.min(rect.bottom + 4, window.innerHeight - 120)),
        left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)),
        width,
      });
    };
    updatePopupPosition();
    const closeOnOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!categoryFilterTriggerRef.current?.contains(target) && !categoryFilterPopupRef.current?.contains(target)) setCategoryFilterOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    window.addEventListener('resize', updatePopupPosition);
    window.addEventListener('scroll', updatePopupPosition, true);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      window.removeEventListener('resize', updatePopupPosition);
      window.removeEventListener('scroll', updatePopupPosition, true);
    };
  }, [categoryFilterOpen]);

  const toggleCategoryFilter = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (categoryFilterOpen) {
      setCategoryFilterOpen(false);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const width = Math.max(rect.width, 190);
    setCategoryFilterBounds({
      top: Math.max(8, Math.min(rect.bottom + 4, window.innerHeight - 120)),
      left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)),
      width,
    });
    setCategoryFilterOpen(true);
  };

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
  const candidateCategories = useMemo(() => {
    const categories = [...new Set(candidates.map(candidate => candidate.category))]
      .map(category => ({ id: category, label: category }));
    if (preschoolMode && candidates.some(candidate => candidate.ownUnitIds?.length)) {
      categories.push({ id: OWN_UNIT_CATEGORY_FILTER_ID, label: 'Egna vikarier' });
    }
    return categories.sort((a, b) => a.label.localeCompare(b.label, 'sv'));
  }, [candidates, preschoolMode]);
  const candidateCompetencies = useMemo(() => [...new Set(candidates.flatMap(candidate => candidate.competencies ?? SUB_DETAILS[candidate.id]?.competencies ?? []))]
    .sort((a, b) => a.localeCompare(b, 'sv'))
    .map(competency => ({ id: competency, label: competency })), [candidates]);

  const matchMode = Boolean(preschoolMode && !browseAll && state?.matchCandidates);
  const candidateMatches = useMemo<Record<string, CandidateMatch>>(() => {
    if (!matchMode || !state) return {};
    const date = parseDate(state.dateStr);
    const previousDateStr = toDateStr(addDays(date, -1));
    return Object.fromEntries(candidates.map(candidate => {
      const availability = getSubAvailability(candidate.id, date, availabilityOverrides, absences);
      const availabilityPercent = availability ? subAvailPct(availability, state.shift) : 0;
      const skills = candidate.competencies ?? SUB_DETAILS[candidate.id]?.competencies ?? [];
      const matchedSkills = targetCompetencies.filter(skill => skills.includes(skill));
      const roleMatches = !state.targetRole || candidate.role === state.targetRole;
      const sameUnit = !targetUnitId || Boolean(candidate.ownUnitIds?.includes(targetUnitId));
      const flags = getCandidateScreeningFlags(candidate.id);
      const bookings = bookingsByCandidate[candidate.id] ?? [];
      const booked = bookings.some(booking => booking.dateStr === state.dateStr || booking.dateStr === previousDateStr && timeMinutes(booking.end) <= timeMinutes(booking.start));
      const restConflict = candidateHasRestConflict(candidate.id, date, state.shift, bookings);
      const criteria: CandidateMatchCriterion[] = [
        { label: 'Roll', achieved: roleMatches ? 30 : 0, possible: 30, detail: state.targetRole ? `${candidate.role} · sökt: ${state.targetRole}` : 'Ingen särskild roll krävs' },
        { label: 'Tillgänglig tid', achieved: Math.round(availabilityPercent * .35), possible: 35, detail: availability ? `${fmtAvailTime(availability)} · täcker ${availabilityPercent} % av passet` : 'Ingen tillgänglig tid registrerad' },
        { label: 'Kompetenser', achieved: targetCompetencies.length ? Math.round(matchedSkills.length / targetCompetencies.length * 20) : 20, possible: 20, detail: targetCompetencies.length ? `${matchedSkills.length} av ${targetCompetencies.length}: ${matchedSkills.join(', ') || 'inga'}` : 'Inga särskilda kompetenser krävs' },
        { label: 'Samma enhet', achieved: sameUnit ? 10 : 0, possible: 10, detail: !targetUnitId ? 'Ingen enhet angiven' : sameUnit ? 'Kopplad till enheten' : 'Annan eller okänd enhet' },
        { label: 'Inskolning och utdrag', achieved: flags.onboarded && flags.clearance ? 5 : 0, possible: 5, detail: flags.onboarded && flags.clearance ? 'Båda uppfyllda' : 'Minst ett underlag saknas' },
      ];
      const blocker = !roleMatches ? 'Fel roll' : booked ? 'Redan bokad på pass' : restConflict ? 'Krock med dygnsvila' : undefined;
      const rawScore = criteria.reduce((sum, criterion) => sum + criterion.achieved, 0);
      const percent = blocker ? Math.min(rawScore, 39) : rawScore;
      return [candidate.id, { percent, tone: percent >= 75 ? 'green' : percent >= 50 ? 'yellow' : 'red', criteria, blocker } satisfies CandidateMatch];
    }));
  }, [absences, availabilityOverrides, bookingsByCandidate, candidates, matchMode, state, targetCompetencies, targetUnitId]);

  const availSubs = useMemo(() => {
    const matchesFilters = (sub: SubstituteCandidate) => {
      if (filterText.trim()) {
        const query = filterText.trim().toLocaleLowerCase('sv');
        const searchable = [sub.name, sub.role, sub.category, sub.costLevel, ...(sub.competencies ?? SUB_DETAILS[sub.id]?.competencies ?? [])].join(' ').toLocaleLowerCase('sv');
        if (!searchable.includes(query)) return false;
      }
      if (filterRoles.length > 0 && !filterRoles.includes(sub.role)) return false;
      if (filterCategories.length > 0) {
        const selectedOwnUnitCategory = preschoolMode && filterCategories.includes(OWN_UNIT_CATEGORY_FILTER_ID);
        const matchesOwnUnit = selectedOwnUnitCategory
          && Boolean(sub.ownUnitIds?.length)
          && (!targetUnitId || sub.ownUnitIds?.includes(targetUnitId));
        if (!filterCategories.includes(sub.category) && !matchesOwnUnit) return false;
      }
      if (filterCompetencies.length > 0) {
        const competencies = sub.competencies ?? SUB_DETAILS[sub.id]?.competencies ?? [];
        if (!filterCompetencies.some(competency => competencies.includes(competency))) return false;
      }
      if (preschoolMode) {
        const flags = getCandidateScreeningFlags(sub.id);
        if (continuityFilter && !flags.continuity) return false;
        if (clearanceFilter && !flags.clearance) return false;
        if (onboardedFilter && !flags.onboarded) return false;
      }
      if (preschoolMode && costFocusFilter && !['Gratis', 'Kostnadsnivå 1'].includes(sub.costLevel)) return false;
      return true;
    };
    const conflictsWithBlockedTime = (sub: SubstituteCandidate, date: Date, shift: Shift) =>
      candidateHasRestConflict(sub.id, date, shift, bookingsByCandidate[sub.id] ?? []);
    let list: SubstituteCandidate[];
    if (matchMode) {
      list = candidates.filter(matchesFilters).sort((a, b) =>
        (candidateMatches[b.id]?.percent ?? 0) - (candidateMatches[a.id]?.percent ?? 0) || a.name.localeCompare(b.name, 'sv'));
    } else if (browseAll) {
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
            return Boolean(avail
              && !conflictsWithBlockedTime(sub, column.date, browseShift)
              && getAvailableSubs(browseShift, column.date, timeFlexibility, availabilityOverrides, absences, candidates).some(candidate => candidate.id === sub.id));
          });
          if (!hasMatchingAvailability) return false;
        }
        return true;
      });
      const rankingShift = browseShift ?? (preschoolMode ? { type: 'day' as const, ...SHIFT_DEFS.day } : null);
      if (rankingShift) {
        list = [...list].sort((a, b) => {
          const bestScore = (candidate: SubstituteCandidate) => Math.max(...columns.map(column =>
            candidateRankScore(candidate, column.date, rankingShift, availabilityOverrides, absences)
          ));
          return bestScore(b) - bestScore(a) || a.name.localeCompare(b.name, 'sv');
        });
      } else {
        list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'sv'));
      }
    } else {
      list = state && browseShift
        ? getAvailableSubs(browseShift, parseDate(state.dateStr), state.targetType === 'activity' && !preschoolMode ? 0 : timeFlexibility, availabilityOverrides, absences, candidates)
          .filter(candidate => matchesFilters(candidate) && !conflictsWithBlockedTime(candidate, parseDate(state.dateStr), browseShift))
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
  }, [absences, availabilityOverrides, bookingsByCandidate, browseAll, candidates, candidateMatches, matchMode, filterText, filterRoles, filterCategories, filterCompetencies, browseShift, columns, singleAssignment, state, timeFlexibility, preschoolMode, continuityFilter, clearanceFilter, onboardedFilter, costFocusFilter]);

  const panelClass = `schema-sub-panel${isOpen ? ' schema-sub-panel-open' : ''}${singleAssignment ? ' schema-sub-panel-single-assignment' : ''}${preschoolMode ? ' schema-sub-panel-preschool' : ''}`;
  const fillLabel = preschoolMode ? 'Kandidater' : 'Vikarier';
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
    onSelectCandidate?.(substituteId);
    const dateStr = defaultContextDate;
    const key = substituteAvailabilityKey(substituteId, dateStr);
    setContextTarget({ substituteId, dateStr });
    setContextActions([
      { id: 'show-details', text: preschoolMode ? 'Visa kandidatdetaljer' : 'Visa vikarieuppgifter', icon: 'id-card' },
      { id: 'edit-availability', text: 'Ändra tillgänglighet', icon: 'clock', beginGroup: true },
      absences[key]
        ? { id: 'clear-sickness', text: 'Ta bort sjukanmälan', icon: 'calendar-check' }
        : { id: 'report-sick', text: 'Sjukanmäl', icon: 'calendar-xmark' },
      ...(preschoolMode && state ? [{ id: 'assign-direct' as const, text: 'Tillsätt direkt', icon: 'user-check', beginGroup: true }] : []),
      { id: 'send-request', text: 'Skicka förfrågan', icon: 'paper-plane', beginGroup: true },
    ]);
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
  }, [absences, defaultContextDate, onSelectCandidate, preschoolMode, state]);

  const openAvailabilityContext = useCallback((event: React.MouseEvent, substituteId: string, dateStr: string, isPast: boolean, isBooked: boolean) => {
    event.preventDefault();
    event.stopPropagation();
    const candidateBookings = bookingsByCandidate[substituteId] ?? [];
    const clickedBooking = candidateBookings.find(booking => booking.dateStr === dateStr)
      ?? candidateBookings.find(booking => booking.dateStr === toDateStr(addDays(parseDate(dateStr), -1)) && timeMinutes(booking.end) <= timeMinutes(booking.start));
    if (clickedBooking && isBooked) onSelectCandidateBooking?.(substituteId, clickedBooking);
    else onSelectCandidate?.(substituteId);
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
  }, [absences, availabilityOverrides, bookingsByCandidate, onSelectCandidate, onSelectCandidateBooking]);

  const handleContextAction = useCallback((event: { itemData?: SubstituteContextAction }) => {
    if (!contextTarget || !event.itemData) return;
    setContextMenuPosition(null);
    const { substituteId, dateStr } = contextTarget;
    if (candidateMatches[substituteId]?.tone === 'red' && (event.itemData.id === 'send-request' || event.itemData.id === 'assign-direct')) return;
    switch (event.itemData.id) {
      case 'show-details':
      case 'edit-availability': onOpenDetails(substituteId, dateStr); break;
      case 'mark-unavailable': onSetAvailability(substituteId, dateStr, null); break;
      case 'restore-availability': onRestoreAvailability(substituteId, dateStr); break;
      case 'report-sick': onReportSick(substituteId, dateStr); break;
      case 'clear-sickness': onClearSickness(substituteId, dateStr); break;
      case 'send-request': onSendRequest([substituteId]); break;
      case 'assign-direct': onDirectAssign([substituteId]); break;
    }
  }, [candidateMatches, contextTarget, onClearSickness, onDirectAssign, onOpenDetails, onReportSick, onRestoreAvailability, onSendRequest, onSetAvailability]);

  return (
    <div className={panelClass} role="region" aria-label={fillLabel} style={preschoolMode && panelLeft !== undefined && panelWidth !== undefined ? { left: panelLeft, width: panelWidth, right: 'auto' } : undefined}>
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
      <div className={`schema-sub-send-bar${preschoolMode ? ' schema-sub-send-bar-preschool' : ''}`}>
        {preschoolMode ? <>
          <div className="schema-sub-action-buttons">
            <button
              className="btn-primary schema-sub-send-btn"
              disabled={selectedSubIds.length === 0}
              onClick={() => onSendRequest(selectedSubIds)}
            >
              <i className="fa-solid fa-paper-plane" /> Skicka förfrågan
            </button>
            <button
              className="btn-secondary schema-sub-send-btn schema-sub-direct-btn"
              disabled={selectedSubIds.length !== 1 || !state}
              title={!state ? 'Öppna kandidater från ett pass eller resursbehov för att välja mål' : undefined}
              onClick={() => onDirectAssign(selectedSubIds)}
            >
              <i className="fa-solid fa-user-check" /> Tillsätt direkt
            </button>
          </div>
          <div className="schema-sub-filter-fields schema-sub-filter-fields-preschool">
            <div className={`schema-sub-category-filter${categoryFilterOpen ? ' schema-sub-category-filter-open' : ''}`}>
              <button ref={categoryFilterTriggerRef} type="button" className="schema-sub-category-filter-button" aria-label="Välj kandidatkategorier" aria-expanded={categoryFilterOpen} onClick={toggleCategoryFilter}>
                <span>{filterCategories.length === 0 ? 'Alla kategorier' : `${filterCategories.length} kategorier`}</span>
                <i className={`fa-solid fa-chevron-${categoryFilterOpen ? 'up' : 'down'}`} aria-hidden="true" />
              </button>
            </div>
            <label className="schema-sub-flexibility-filter">
              <span className="sr-only">Tidsflexibilitet</span>
              <select aria-label="Tidsflexibilitet" value={timeFlexibility} onChange={event => setTimeFlexibility(Number(event.currentTarget.value))}>
                {[1, 2, 3, 4].map(hours => <option key={hours} value={hours}>± {hours} tim</option>)}
              </select>
            </label>
            <TagBox
              dataSource={candidateCompetencies}
              displayExpr="label"
              valueExpr="id"
              value={filterCompetencies}
              onValueChanged={event => setFilterCompetencies(current => preserveStringArrayWhenUnchanged(current, normalizeFilterValues(event.value)))}
              placeholder="Kompetens"
              showSelectionControls={true}
              showClearButton={true}
              applyValueMode="instantly"
              multiline={false}
              stylingMode="outlined"
              width={190}
            />
            <label className="schema-sub-advanced-checkbox schema-sub-cost-focus schema-sub-stage-one-checkbox"><input type="checkbox" checked={costFocusFilter} onChange={event => setCostFocusFilter(event.currentTarget.checked)} /><span>Kostnadsfokus</span></label>
            <label className="schema-sub-advanced-checkbox schema-sub-stage-one-checkbox" title="Har arbetat på samma enhet det senaste halvåret"><input type="checkbox" checked={continuityFilter} onChange={event => setContinuityFilter(event.currentTarget.checked)} /><span>Kontinuitet</span></label>
            <button type="button" className={`btn-secondary schema-sub-advanced-toggle${advancedFiltersOpen ? ' active' : ''}`} aria-expanded={advancedFiltersOpen} onClick={() => setAdvancedFiltersOpen(open => !open)}>
              <i className={`fa-solid fa-chevron-${advancedFiltersOpen ? 'up' : 'down'}`} /> Fler filter
            </button>
          </div>
          {advancedFiltersOpen && <div className="schema-sub-advanced-filters">
            <label className="schema-sub-text-filter">Textfilter
              <input type="search" placeholder="Sök kandidat, roll eller kompetens" value={filterText} onChange={event => setFilterText(event.currentTarget.value)} />
            </label>
            <div className="schema-sub-role-filter"><span>Roll</span><TagBox
              dataSource={candidateRoles} displayExpr="label" valueExpr="id" value={filterRoles}
              onValueChanged={event => setFilterRoles(current => preserveStringArrayWhenUnchanged(current, normalizeFilterValues(event.value)))}
              placeholder="Alla roller" showSelectionControls={true} showClearButton={true}
              applyValueMode="instantly" multiline={false} stylingMode="outlined" width={190}
            /></div>
            <label className="schema-sub-advanced-checkbox"><input type="checkbox" checked={clearanceFilter} onChange={event => setClearanceFilter(event.currentTarget.checked)} /><span>Belastningsregisterutdrag finns</span></label>
            <label className="schema-sub-advanced-checkbox"><input type="checkbox" checked={onboardedFilter} onChange={event => setOnboardedFilter(event.currentTarget.checked)} /><span>Inskolad</span></label>
            <button type="button" className="btn-secondary schema-sub-filter-reset" onClick={() => {
              setFilterText(''); setFilterRoles([]); setFilterCategories([]); setFilterCompetencies(matchMode ? [] : targetCompetencies); setTimeFlexibility(1);
              setContinuityFilter(false); setClearanceFilter(false); setOnboardedFilter(false); setCostFocusFilter(false);
            }}><i className="fa-solid fa-rotate-left" /> Rensa filter</button>
          </div>}
        </> : <>
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
          <div className={`schema-sub-category-filter${categoryFilterOpen ? ' schema-sub-category-filter-open' : ''}`}>
            <label>Vikariekategori</label>
            <button ref={categoryFilterTriggerRef} type="button" className="schema-sub-category-filter-button" aria-label="Välj vikariekategorier" aria-expanded={categoryFilterOpen} onClick={toggleCategoryFilter}>
              <span>{filterCategories.length === 0 ? 'Alla kategorier' : `${filterCategories.length} valda`}</span>
              <i className={`fa-solid fa-chevron-${categoryFilterOpen ? 'up' : 'down'}`} aria-hidden="true" />
            </button>
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
        <span className="schema-sub-send-hint">{preschoolMode ? 'Markera en eller flera kandidater i listan' : singleAssignment ? state ? 'Välj en vikarie för det markerade passet eller aktiviteten' : 'Dra en vikarie till ett pass i schemat' : 'Markera vikarier i listan nedan'}</span>
        {preschoolMode && <div className="schema-sub-availability-legend" aria-label="Förklaring av tidsmarkeringar">
          <span><i className="schema-sub-availability-legend-available" aria-hidden="true" /> Tillgänglig</span>
          <span><i className="schema-sub-availability-legend-unavailable" aria-hidden="true" /> Ej tillgänglig</span>
          <span><i className="schema-sub-availability-legend-rest" aria-hidden="true" /> Dygnsvila</span>
        </div>}
        </>}
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
                  {preschoolMode ? 'Kandidat' : 'Vikarie'}
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
                const ownUnitLabels = (sub.ownUnitIds ?? [])
                  .map(unitId => HOSPITAL_ORGANISATION.departments.find(department => department.id === unitId)?.label)
                  .filter((label): label is string => Boolean(label));
                const isOwnUnitCandidate = preschoolMode
                  && ownUnitLabels.length > 0
                  && (!targetUnitId || sub.ownUnitIds?.includes(targetUnitId));
                const candidateIsHourly = isHourlyCandidate(sub);
                const showAtlHours = isPermanentCandidate(sub);
                const lasHours = candidateIsHourly ? candidateLasHours(sub.id) : undefined;
                const lasPct = lasHours === undefined ? 0 : Math.round(lasHours / LAS_MAX_HOURS * 100);
                const atlHours = showAtlHours ? candidateAtlHours(sub.id, details) : undefined;
                const atlPct = atlHours === undefined ? 0 : Math.round(atlHours / ATL_MAX_HOURS * 100);
                const atlTone = atlHours === undefined ? 'green' : hourUsageTone(atlHours, ATL_MAX_HOURS);
                const lasTone = lasHours === undefined ? 'green' : hourUsageTone(lasHours, LAS_MAX_HOURS);
                const bookedShifts = bookingsByCandidate[sub.id] ?? [];

                return (
                  <React.Fragment key={sub.id}>
                    <tr
                      className={[
                        'schema-sub-row',
                        candidateMatches[sub.id]?.tone === 'red' ? 'schema-candidate-low-match' : '',
                        isExpanded ? 'schema-sub-row-open' : '',
                        highlightedCandidateId === sub.id ? 'schema-sub-row-selected' : relatedCandidateIds.includes(sub.id) ? 'schema-sub-row-related' : '',
                      ].filter(Boolean).join(' ')}
                      draggable={candidateMatches[sub.id]?.tone !== 'red'}
                      onDragStart={e => { if (candidateMatches[sub.id]?.tone === 'red') e.preventDefault(); else onDragStart(e, sub.id); }}
                      onClick={event => {
                        if ((event.target as HTMLElement).closest('input, button, a')) return;
                        onSelectCandidate?.(sub.id);
                      }}
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
                            disabled={candidateMatches[sub.id]?.tone === 'red'}
                            onChange={() => {
                              onSelectCandidate?.(sub.id);
                              setSelectedSubIds(current => singleAssignment
                                ? [sub.id]
                                : current.includes(sub.id) ? current.filter(id => id !== sub.id) : [...current, sub.id]);
                            }}
                          />
                          <button
                            className="schema-sub-chevron"
                            onClick={() => toggleExpand(sub.id)}
                            title={isExpanded ? 'Dölj detaljer' : 'Visa detaljer'}
                          >
                            <i className={`fa-solid fa-chevron-${isExpanded ? 'down' : 'right'}`} />
                          </button>
                          <div className="schema-sub-name-block">
                           <span className="schema-sub-name-line"><span className="schema-person-avatar" aria-hidden="true">{initialsFromName(sub.name)}</span><span className="schema-employee-name" title={sub.name}>
                             {sub.category === 'Samverkanspass' && <i className="schema-pool-dot" title="Samverkanspass" />}
                             {sub.name}
                             {unreadMessageEntities.has(`substitute:${sub.id}`) && <NewMessageIndicator />}
                           </span>
                           {matchMode && candidateMatches[sub.id] && <button type="button" className={`schema-candidate-match schema-candidate-match-${candidateMatches[sub.id].tone}`} onClick={event => { event.stopPropagation(); setMatchDetailId(sub.id); }} aria-label={`Visa matchning för ${sub.name}: ${candidateMatches[sub.id].percent} procent`}>{candidateMatches[sub.id].percent}%</button>}
                           </span>
                           <span className="schema-employee-role">{sub.role}</span>
                           <span className="schema-sub-category-cost">
                             <span className="schema-sub-category-badge">{sub.category}</span>
                             {isOwnUnitCandidate && <span className="schema-sub-own-unit-badge" title={`Knyten till ${ownUnitLabels.join(', ')}`}>Egen vikarie</span>}
                             <span className={`schema-sub-cost-badge${sub.costLevel === 'Gratis' ? ' schema-sub-cost-free' : ''}`}>{sub.costLevel}</span>
                           </span>
                          </div>
                          <ContextKebabButton
                            className="schema-context-kebab-inline schema-sub-context-kebab"
                            label={`Fler åtgärder för ${sub.name}`}
                            onActivate={event => openPersonContext(event, sub.id)}
                          />
                        </div>
                      </td>
                      {columns.map((col, ci) => {
                        const ds       = toDateStr(col.date);
                        const isPast   = ds < TODAY_STR;
                        const booked   = bookedShifts.find(b => b.dateStr === ds);
                        const previousDateStr = toDateStr(addDays(col.date, -1));
                        const bookedCarry = bookedShifts.find(b => b.dateStr === previousDateStr && timeMinutes(b.end) <= timeMinutes(b.start));
                        const bookedCarryIsPast = previousDateStr < TODAY_STR;
                        const hasBooking = Boolean(booked || bookedCarry);
                        const bookingForCell = booked ?? bookedCarry;
                        const bookingKey = bookingForCell ? `${sub.id}|${bookingForCell.dateStr}` : '';
                        const isSelectedBooking = Boolean(bookingForCell && highlightedCandidateBooking?.candidateId === sub.id && highlightedCandidateBooking.dateStr === bookingForCell.dateStr);
                        const isRelatedBooking = hasBooking && (highlightedCandidateId === sub.id || relatedCandidateBookingKeys.includes(bookingKey));
                        const bookedTimeIsPast = booked ? isPast : bookedCarry ? bookedCarryIsPast : isPast;
                        const bookedTimeLabel = [
                          booked && `${booked.start}–${booked.end}`,
                          bookedCarry && `${bookedCarry.start}–${bookedCarry.end} · fortsättning`,
                        ].filter(Boolean).join(' · ');
                        const availabilityKey = substituteAvailabilityKey(sub.id, ds);
                        const absenceReason = absences[availabilityKey];
                        const avail    = !hasBooking && !absenceReason
                          ? getSubAvailability(sub.id, col.date, availabilityOverrides, absences)
                          : null;
                        const blockedIntervals = preschoolMode ? getCandidateBlockedIntervals(sub.id, col.date, bookedShifts) : [];
                        if (preschoolMode && Object.prototype.hasOwnProperty.call(availabilityOverrides, availabilityKey) && availabilityOverrides[availabilityKey] === null && !hasBooking && !absenceReason) {
                          blockedIntervals.push({ startMinute: 0, endMinute: 1440, reason: 'Ej tillgänglig tid' });
                        }
                        const formatBlockedMinute = (value: number) => {
                          const clipped = Math.min(value, 1440);
                          return clipped === 1440 ? '24:00' : `${String(Math.floor(clipped / 60)).padStart(2, '0')}:${String(clipped % 60).padStart(2, '0')}`;
                        };
                        const blockedTimeLabel = blockedIntervals
                          .filter(interval => !interval.reason.startsWith('Dygnsvila'))
                          .map(interval => `Ej tillgänglig tid ${formatBlockedMinute(interval.startMinute)}–${formatBlockedMinute(interval.endMinute)}`)
                          .join(', ');
                        const isTarget = !browseAll && state && ds === state.dateStr;
                        const canDragAvailability = !isPast && candidateMatches[sub.id]?.tone !== 'red';
                        const availabilityDragProps = {
                          draggable: canDragAvailability,
                          onDragStart: (event: React.DragEvent<HTMLSpanElement>) => {
                            event.stopPropagation();
                            if (canDragAvailability) onDragStartAvailability(event, sub.id, ds);
                            else event.preventDefault();
                          },
                        };

                        // 24 h proportional bar helpers
                        const bar24 = (startH: number, startM: number, endH: number, endM: number, cls: string, blocked: CandidateBlockedInterval[] = [], requestedPart: 'auto' | 'whole' | 'start' | 'carry' = 'auto') => {
                          const startMinutes = startH * 60 + startM;
                          const endMinutes = endH * 60 + endM;
                          const left  = startMinutes / 1440 * 100;
                          const crossesMidnight = endMinutes <= startMinutes;
                          const width = (endMinutes - startMinutes) / 1440 * 100;
                          const fill = (part: 'whole' | 'start' | 'carry', style: React.CSSProperties) => {
                            const alignedStyle = part === 'carry'
                              ? { ...style, left: 'calc(0% - 1px)', width: `calc(${style.width} + 1px)` }
                              : part === 'start'
                                ? { ...style, width: `calc(${style.width} + 1px)` }
                                : style;
                            return <div className={`schema-sub-bar24-fill ${cls} schema-sub-bar24-part-${part}`} style={alignedStyle} />;
                          };
                          const part = requestedPart === 'auto' ? crossesMidnight ? 'start' : 'whole' : requestedPart;
                          return (
                            <div className="schema-sub-bar24-wrap">
                              {(part === 'start' || requestedPart === 'auto' && crossesMidnight) && <>
                                {fill('start', { left: `${left}%`, width: `${100-left}%` })}
                              </>}
                              {(part === 'carry' || requestedPart === 'auto' && crossesMidnight) && <>
                                {fill('carry', { left: 0, width: `${Math.max(endMinutes/1440*100, 1)}%` })}
                              </>}
                              {part === 'whole' && !crossesMidnight && fill('whole', { left: `${left}%`, width: `${Math.max(width, 1)}%` })}
                              {blocked.map((interval, intervalIndex) => <span
                                key={`${interval.reason}-${intervalIndex}`}
                                className={`schema-sub-bar24-blocked${interval.reason.startsWith('Dygnsvila') ? ' schema-sub-bar24-blocked-rest' : interval.reason === 'Ej tillgänglig tid' ? ' schema-sub-bar24-blocked-unavailable' : ''}`}
                                style={{ left: `${interval.startMinute / 1440 * 100}%`, width: `${Math.max((interval.endMinute - interval.startMinute) / 1440 * 100, 0.7)}%` }}
                                title={`${interval.reason}: ${formatBlockedMinute(interval.startMinute)}–${formatBlockedMinute(interval.endMinute)}`}
                              />)}
                            </div>
                          );
                        };
                        const hospitalRangeStyle = (startMinute: number, endMinute: number, continuesFromPrevious = false, continuesIntoNext = false): React.CSSProperties => {
                          const left = startMinute / 1440 * 100;
                          const width = Math.max((endMinute - startMinute) / 1440 * 100, 0.7);
                          const overlap = Number(continuesFromPrevious) + Number(continuesIntoNext);
                          return {
                            left: continuesFromPrevious ? `calc(${left}% - 1px)` : `${left}%`,
                            width: overlap ? `calc(${width}% + ${overlap}px)` : `${width}%`,
                          };
                        };
                        const hospitalAvailabilityBars = (availability: SubAvailability) => {
                          const startMinute = availability.startH * 60 + availability.startM;
                          const endMinute = availability.endH * 60 + availability.endM;
                          const crossesMidnight = endMinute <= startMinute;
                          return crossesMidnight ? <>
                            <span className="schema-activity-availability-window schema-sub-candidate-availability-start" style={hospitalRangeStyle(startMinute, 1440, false, true)} title={`${fmtAvailTime(availability)} · Dra till ett pass`} {...availabilityDragProps} />
                            <span className="schema-activity-availability-window schema-sub-candidate-availability-carry" style={hospitalRangeStyle(0, endMinute, true, false)} title={`${fmtAvailTime(availability)} · Dra till ett pass`} {...availabilityDragProps} />
                          </> : <span className="schema-activity-availability-window" style={hospitalRangeStyle(startMinute, endMinute)} title={`${fmtAvailTime(availability)} · Dra till ett pass`} {...availabilityDragProps} />;
                        };
                        const hospitalBookingBars = (booking: SubBookedShift, portion: 'start' | 'carry') => {
                          const bookingStart = timeMinutes(booking.start);
                          const bookingEnd = timeMinutes(booking.end);
                          const bookingCrossesMidnight = bookingEnd <= bookingStart;
                          const activities = booking.activities ?? [];
                          if (activities.length === 0) {
                            if (portion === 'carry' && !bookingCrossesMidnight) return null;
                            const start = portion === 'carry' ? 0 : bookingStart;
                            const end = portion === 'carry' ? bookingEnd : bookingCrossesMidnight ? 1440 : bookingEnd;
                            const continuesFromPrevious = portion === 'carry';
                            const continuesIntoNext = portion === 'start' && bookingCrossesMidnight;
                            return <div
                              key={`${booking.dateStr}-${portion}-generic`}
                              className={`schema-activity-bar schema-sub-candidate-booking-bar${continuesFromPrevious ? ' schema-activity-bar-carry schema-activity-bar-end-cap' : continuesIntoNext ? ' schema-activity-bar-start-cap schema-activity-bar-overflow-start' : ' schema-activity-bar-start-cap schema-activity-bar-end-cap'}`}
                              style={hospitalRangeStyle(start, end, continuesFromPrevious, continuesIntoNext)}
                              aria-label={`Bokning ${booking.start}–${booking.end}${continuesFromPrevious ? ', fortsättning från föregående dag' : ''}`}
                              title={`Bokning · ${booking.start}–${booking.end}`}
                            />;
                          }
                          const visibleActivities = activities.flatMap((activity, index) => {
                            const activityStart = timeMinutes(activity.start);
                            const activityEnd = timeMinutes(activity.end);
                            const activityCrossesMidnight = activityEnd <= activityStart;
                            if (portion === 'carry' && !activityCrossesMidnight) return [];
                            const start = portion === 'carry' ? 0 : activityStart;
                            const end = portion === 'carry' ? activityEnd : activityCrossesMidnight ? 1440 : activityEnd;
                            if (end <= start) return [];
                            return [{ activity, index, start, end, activityCrossesMidnight }];
                          });
                          return visibleActivities.map((segment, segmentIndex) => {
                            const continuesFromPrevious = portion === 'carry';
                            const continuesIntoNext = portion === 'start' && segment.activityCrossesMidnight;
                            const startsPass = portion === 'start' && segment.index === 0;
                            const endsPass = portion === 'carry'
                              ? segmentIndex === visibleActivities.length - 1
                              : segment.index === activities.length - 1 && !segment.activityCrossesMidnight;
                            const segmentWidthPct = (segment.end - segment.start) / 1440 * 100;
                            return <div
                              key={`${booking.dateStr}-${segment.activity.id}-${portion}`}
                              className={`schema-activity-bar ${HOSPITAL_ACTIVITY_TYPES[segment.activity.kind].className}${startsPass ? ' schema-activity-bar-start-cap' : ''}${endsPass ? ' schema-activity-bar-end-cap' : ''}${continuesFromPrevious ? ' schema-activity-bar-carry' : continuesIntoNext ? ' schema-activity-bar-overflow-start' : ''}`}
                              style={hospitalRangeStyle(segment.start, segment.end, continuesFromPrevious, continuesIntoNext)}
                              aria-label={`${segment.activity.label}, ${segment.activity.start}–${segment.activity.end}${continuesFromPrevious ? ', fortsättning från föregående dag' : ''}`}
                              title={`${segment.activity.label} · ${segment.activity.start}–${segment.activity.end}`}
                            >
                              {(continuesFromPrevious || segmentWidthPct >= 12) && <span>{segment.activity.label.slice(0, 3)}</span>}
                            </div>;
                          });
                        };

                        return (
                          <td key={ci} className={[
                            'schema-sub-avail-cell',
                            hasBooking ? 'schema-sub-booked-cell' : '',
                            viewType==='month-columns' ? 'schema-month-col-cell' :
                            viewType==='year-columns'  ? 'schema-year-col-cell'  : 'schema-day-cell',
                            col.isWeekend ? 'schema-weekend-cell' : '',
                            isTarget ? 'schema-sub-target-col' : '',
                            isPast ? 'schema-sub-past-cell' : '',
                            absenceReason ? 'schema-sub-sick-cell' : '',
                            isSelectedBooking ? 'schema-sub-booking-selected' : isRelatedBooking ? 'schema-sub-booking-related' : '',
                            'schema-sub-availability-context',
                          ].filter(Boolean).join(' ')}>
                            <div
                              className="schema-sub-availability-hitarea"
                              data-substitute-id={sub.id}
                              data-date-str={ds}
                              onClick={event => {
                                event.stopPropagation();
                                bookingForCell ? onSelectCandidateBooking?.(sub.id, bookingForCell) : onSelectCandidate?.(sub.id);
                              }}
                              onContextMenu={event => openAvailabilityContext(event, sub.id, ds, isPast, hasBooking)}
                              onDoubleClick={() => onOpenDetails(sub.id, ds)}
                            >
                            {preschoolMode && viewType !== 'year-columns' ? (
                              <div className={`schema-activity-timeline schema-activity-timeline-candidate schema-sub-candidate-timeline${isPast ? ' schema-activity-timeline-past' : ''}`}>
                                <div className="schema-activity-lanes">
                                  <div className="schema-activity-row">
                                    {!absenceReason && booked && hospitalBookingBars(booked, 'start')}
                                    {!absenceReason && bookedCarry && hospitalBookingBars(bookedCarry, 'carry')}
                                    {!hasBooking && !absenceReason && avail && hospitalAvailabilityBars(avail)}
                                    {!hasBooking && !absenceReason && !avail && <span
                                      className="schema-activity-availability-window schema-sub-candidate-unavailable-window"
                                      style={{ left: '0%', width: '100%' }}
                                      title="Ej tillgänglig hela dagen"
                                      aria-label="Ej tillgänglig hela dagen"
                                    />}
                                    {blockedIntervals.length > 0 && <div className="schema-sub-candidate-blocked-layer" aria-label={blockedTimeLabel}>
                                      {blockedIntervals.map((interval, intervalIndex) => <span
                                        key={`${interval.reason}-${intervalIndex}`}
                                        className={`schema-sub-bar24-blocked${interval.reason.startsWith('Dygnsvila') ? ' schema-sub-bar24-blocked-rest' : interval.reason === 'Ej tillgänglig tid' ? ' schema-sub-bar24-blocked-unavailable' : ''}`}
                                        style={{ left: `${interval.startMinute / 1440 * 100}%`, width: `${Math.max((interval.endMinute - interval.startMinute) / 1440 * 100, 0.7)}%` }}
                                        title={`${interval.reason}: ${formatBlockedMinute(interval.startMinute)}–${formatBlockedMinute(interval.endMinute)}`}
                                      />)}
                                    </div>}
                                  </div>
                                </div>
                                <div className="schema-activity-captions schema-activity-captions-hospital">
                                  {hasBooking && <span className="schema-activity-time-line"><span className="schema-activity-total-time">{bookedTimeLabel}</span></span>}
                                  {!hasBooking && !absenceReason && avail && <span className="schema-activity-time-line"><span className="schema-activity-total-time">{fmtAvailTime(avail)}</span></span>}
                                  {absenceReason && <span className="schema-activity-absence-caption">{absenceReason}</span>}
                                </div>
                              </div>
                            ) : absenceReason ? (
                              <span className="schema-sub-sick-label"><i className="fa-solid fa-calendar-xmark" /> {absenceReason}</span>
                            ) : hasBooking ? (
                              <>
                                {booked && viewType !== 'year-columns' && (() => {
                                  const [bsH, bsM] = booked.start.split(':').map(Number);
                                  const [beH, beM] = booked.end.split(':').map(Number);
                                  const crossesMidnight = timeMinutes(booked.end) <= timeMinutes(booked.start);
                                  return bar24(bsH, bsM, beH, beM, `schema-sub-bar24-booked${isPast ? ' schema-sub-bar24-past-booked' : ''}`, blockedIntervals, crossesMidnight ? 'start' : 'whole');
                                })()}
                                {bookedCarry && viewType !== 'year-columns' && (() => {
                                  const [beH, beM] = bookedCarry.end.split(':').map(Number);
                                  return bar24(0, 0, beH, beM, `schema-sub-bar24-booked${bookedCarryIsPast ? ' schema-sub-bar24-past-booked' : ''}`, blockedIntervals, 'carry');
                                })()}
                                {viewType === 'day-columns' && (
                                  <>
                                    <span className={`schema-sub-cell-time${bookedTimeIsPast ? ' schema-sub-cell-time-past' : ''}`}>{bookedTimeLabel}</span>
                                    {blockedTimeLabel && <span className="schema-sub-blocked-time-label">{blockedTimeLabel}</span>}
                                  </>
                                )}
                              </>
                            ) : avail ? (
                              viewType === 'year-columns' ? (
                                <span className={`schema-sub-avail-time${isPast ? ' schema-sub-avail-time-past' : ''}`}>
                                  {subAvailabilityDurationPct(avail)}%
                                </span>
                              ) : (
                                <>
                                  {bar24(avail.startH, avail.startM, avail.endH, avail.endM, isPast ? 'schema-sub-bar24-past' : sub.category === 'Tillgänglig medarbetare' ? 'schema-sub-bar24-self-avail' : 'schema-sub-bar24-avail', blockedIntervals)}
                                  {viewType === 'day-columns' && (
                                    <>
                                      <span className={`schema-sub-cell-time${isPast ? ' schema-sub-avail-time-past' : ''}`}>
                                        {fmtAvailTime(avail)}
                                      </span>
                                      {blockedTimeLabel && <span className="schema-sub-blocked-time-label">{blockedTimeLabel}</span>}
                                    </>
                                  )}
                                </>
                              )
                            ) : (
                              <>
                                {bar24(0, 0, 24, 0, 'schema-sub-bar24-unavailable', blockedIntervals, 'whole')}
                              </>
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
                            {showAtlHours && atlHours !== undefined && (
                              <div className="schema-sub-expand-section">
                                <span className="schema-sub-expand-label">ATL-timmar</span>
                                <div className="schema-sub-atl-wrap">
                                  <div className="schema-sub-atl-track">
                                    <div
                                      className={`schema-sub-atl-fill schema-sub-hours-fill-${atlTone}`}
                                      style={{ width: `${atlPct}%` }}
                                    />
                                  </div>
                                  <span className="schema-sub-atl-count">{atlHours}/{ATL_MAX_HOURS} h</span>
                                </div>
                              </div>
                            )}
                            {lasHours !== undefined && (
                              <div className="schema-sub-expand-section">
                                <span className="schema-sub-expand-label">LAS-timmar</span>
                                <div className="schema-sub-atl-wrap">
                                  <div className="schema-sub-atl-track"><div className={`schema-sub-atl-fill schema-sub-hours-fill-${lasTone}`} style={{ width: `${lasPct}%` }} /></div>
                                  <span className="schema-sub-atl-count">{lasHours}/{LAS_MAX_HOURS} h</span>
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
      {matchDetailId && candidateMatches[matchDetailId] && <Popup
        visible={true} onHiding={() => setMatchDetailId(null)} title={`Matchning · ${candidates.find(candidate => candidate.id === matchDetailId)?.name ?? 'Kandidat'}`}
        width={480} height="auto" showCloseButton={true} dragEnabled={false}
        wrapperAttr={{ class: 'schema-candidate-match-popup' }}
      >
        <div className="schema-candidate-match-detail">
          <p><strong className={`schema-candidate-match schema-candidate-match-${candidateMatches[matchDetailId].tone}`}>{candidateMatches[matchDetailId].percent}%</strong> för {state?.shift.start}–{state?.shift.end} den {state?.dateStr}</p>
          {candidateMatches[matchDetailId].blocker && <p className="schema-candidate-match-blocker">Spärr: {candidateMatches[matchDetailId].blocker}. Matchningen begränsas till högst 39 %.</p>}
          <ul>{candidateMatches[matchDetailId].criteria.map(criterion => <li key={criterion.label}><span><strong>{criterion.label}</strong><small>{criterion.detail}</small></span><b>{criterion.achieved}/{criterion.possible}</b></li>)}</ul>
          <p className="schema-candidate-match-method">Förslag till viktning: roll 30, tillgänglig tid 35, kompetenser 20, enhet 10 och inskolning/utdrag 5 poäng. Grönt ≥ 75 %, gult 50–74 %, rött &lt; 50 %.</p>
        </div>
      </Popup>}
      {categoryFilterOpen && categoryFilterBounds && typeof document !== 'undefined' && createPortal(
        <div
          ref={categoryFilterPopupRef}
          className="schema-sub-category-filter-list schema-sub-category-filter-portal"
          role="group"
          aria-label={preschoolMode ? 'Kandidatkategorier' : 'Vikariekategorier'}
          style={{ top: categoryFilterBounds.top, left: categoryFilterBounds.left, width: categoryFilterBounds.width }}
          onMouseDown={event => event.stopPropagation()}
        >
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
          {filterCategories.length > 0 && <button type="button" className="schema-sub-category-filter-clear" onClick={() => setFilterCategories([])}>
            {preschoolMode ? 'Rensa' : 'Rensa kategorier'}
          </button>}
        </div>,
        document.body,
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
  const title = state.directAssignment
    ? 'Bekräfta direkt tillsättning'
    : state.costApproval
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
          <button className="btn-primary" disabled={!state.unitLocked && !unit} onClick={() => onConfirm(msg)}>{state.directAssignment ? 'Tillsätt direkt' : state.costApproval ? 'Godkänn och tillsätt' : 'Skicka'}</button>
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

function OpenRequestDialog({ state, onConfirm, onCancel, roleOptions = SUBSTITUTE_ROLES, unitOptions = SUBSTITUTE_UNITS }: {
  state: OpenRequestState | null;
  onConfirm: (dateStr: string, shift: Shift, role: string, unit: string) => void;
  onCancel: () => void;
  roleOptions?: Array<{ id: string; label: string }>;
  unitOptions?: Array<{ id: string; label: string }>;
}) {
  const [dateStr, setDateStr] = useState(state?.dateStr ?? TODAY_STR);
  const [start, setStart] = useState(state?.shift.start ?? '08:00');
  const [end, setEnd] = useState(state?.shift.end ?? '17:00');
  const [role, setRole] = useState(state?.role ?? roleOptions[0]?.id ?? '');
  const [unit, setUnit] = useState(state?.unit ?? unitOptions[0]?.label ?? '');
  useEffect(() => {
    if (!state) return;
    setDateStr(state.dateStr);
    setStart(state.shift.start);
    setEnd(state.shift.end);
    setRole(state.role);
    setUnit(state.unit);
  }, [state]);
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
            {roleOptions.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
        </label>
        <label className="schema-open-request-role">Enhet
          <select value={unit} onChange={e => setUnit(e.currentTarget.value)}>
            {unitOptions.map(option => <option key={option.id} value={option.label}>{option.label}</option>)}
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

function PassDetailCard({ state, onSaveTime, resourceNeed, resourceNeedOrder, assignedPerson, assignmentFailure, onOpenSubstitute, organisation = 'clinic' }: {
  state: DetailState;
  onSaveTime: (start: string, end: string) => void;
  resourceNeed?: ResourceNeed;
  resourceNeedOrder?: ResourceOrder;
  assignedPerson?: { name: string; role: string; substituteId?: string };
  assignmentFailure?: string;
  onOpenSubstitute?: (substituteId: string) => void;
  organisation?: OrganisationScenario;
}) {
  const [start, setStart] = useState(state.shift.start);
  const [end, setEnd] = useState(state.shift.end);
  useEffect(() => { setStart(state.shift.start); setEnd(state.shift.end); }, [state.shift.start, state.shift.end]);
  const passInfo = getShiftPassInfo(state.empId, state.dateStr, organisation);
  const timeChanged = start !== state.shift.start || end !== state.shift.end;

  return (
    <div className="order-detail-card pass-detail-card">
      <dl>
        <div><dt>Pass</dt><dd><div className="order-detail-time-editor"><label>Starttid<input type="time" value={start} onChange={event => setStart(event.currentTarget.value)} /></label><span>–</span><label>Sluttid<input type="time" value={end} onChange={event => setEnd(event.currentTarget.value)} /></label>{timeChanged && <button type="button" className="btn-secondary" onClick={() => onSaveTime(start, end)}>Spara tid</button>}</div></dd></div>
        {!isSchoolScenario(organisation) && <div><dt>Passtyp</dt><dd>{SHIFT_LABELS[state.shift.type]}{passInfo ? ` · ${passInfo}` : ''}</dd></div>}
        {assignmentFailure && <div><dt>Orsak</dt><dd>{assignmentFailure}</dd></div>}
        {resourceNeed && <div><dt>Resursbehov</dt><dd>{resourceNeed.createdBy}{resourceNeed.reason ? ` · ${resourceNeed.reason}` : ''}</dd></div>}
        {resourceNeedOrder && <div><dt>Beställning</dt><dd>Beställd av {resourceNeedOrder.orderedBy} · {resourceNeedOrder.status} · Hanteras av {resourceNeedOrder.handledBy}</dd></div>}
        {assignedPerson && <div><dt>Tillsatt med</dt><dd>
          {assignedPerson.substituteId && onOpenSubstitute
            ? <button type="button" className="schema-assigned-substitute-link" aria-haspopup="dialog" title={`Visa kandidatdetaljer för ${assignedPerson.name}`} onClick={() => onOpenSubstitute(assignedPerson.substituteId!)}>{assignedPerson.name}</button>
            : assignedPerson.name}
          {' · '}{assignedPerson.role}
        </dd></div>}
      </dl>
    </div>
  );
}

function ActivityScheduleDetail({ schedule, activityFills = {}, assignedSubstituteName, assignedSubstituteId, onOpenSubstitute, hospitalMode = false }: {
  schedule: EmployeeDaySchedule;
  activityFills?: Record<string, ActivityFill>;
  assignedSubstituteName?: string;
  assignedSubstituteId?: string;
  onOpenSubstitute?: (substituteId: string) => void;
  hospitalMode?: boolean;
}) {
  const segmentStyle = (from: string, to: string): React.CSSProperties => ({
    left: `${timeToMinutes(from) / 1440 * 100}%`,
    width: `${Math.max(0, (timeToMinutes(to) - timeToMinutes(from)) / 1440 * 100)}%`,
  });
  const activityTypes = hospitalMode ? HOSPITAL_ACTIVITY_TYPES : PRESCHOOL_ACTIVITY_TYPES;
  return (
    <section className={`person-activity-schedule person-activity-schedule-compact${schedule.dateStr < TODAY_STR ? ' person-activity-schedule-past' : ''}`} aria-label={`Dagschema ${fmtDay(parseDate(schedule.dateStr))}`}>
      <div className="person-activity-schedule-heading">
        <strong>{fmtDay(parseDate(schedule.dateStr))}</strong>
        <span>{schedule.shift.start}–{schedule.shift.end}</span>
      </div>
      <div className="person-activity-schedule-axis" aria-hidden="true">
        <span>00:00</span>
        <span style={{ left: '50%' }}>12:00</span>
        <span>24:00</span>
      </div>
      {schedule.activities.length > 0 && <div className="person-activity-schedule-lanes" aria-label={`Arbetstid ${schedule.shift.start} till ${schedule.shift.end}`}>
        <div className="person-activity-schedule-row">
          {schedule.activities.flatMap(activity => (
            (timeToMinutes(activity.end) <= timeToMinutes(activity.start)
              ? [{ start: activity.start, end: '24:00' }, { start: '00:00', end: activity.end }]
              : [{ start: activity.start, end: activity.end }]
            ).map((segment, index) => <span
              key={`${activity.id}-detail-${index}`}
              className={`person-activity-schedule-bar ${schedule.absenceLabel ? 'schema-activity-bar-absence' : activityTypes[activity.kind].className}`}
              style={segmentStyle(segment.start, segment.end)}
              title={`${activity.label} · ${activity.start}–${activity.end}`}
            >{activity.label.slice(0, 3)}</span>)
          ))}
        </div>
      </div>}
      <div className="person-activity-schedule-list">
        {schedule.activities.map(activity => {
          const activityFill = activityFills[activity.id];
          const substituteName = activityFill?.substituteName ?? assignedSubstituteName;
          const substituteId = activityFill?.substituteId ?? assignedSubstituteId;
          return <div key={activity.id}>
            <i className={`person-activity-schedule-swatch ${schedule.absenceLabel ? 'schema-activity-bar-absence' : activityTypes[activity.kind].className}`} />
            <span>{activity.label}{substituteName && <small> · {substituteId && onOpenSubstitute
              ? <button type="button" className="schema-assigned-substitute-link" aria-haspopup="dialog" title={`Visa kandidatdetaljer för ${substituteName}`} onClick={() => onOpenSubstitute(substituteId)}>{substituteName}</button>
              : substituteName}</small>}</span>
            <time>{activity.start}–{activity.end}</time>
          </div>;
        })}
      </div>
      {schedule.absenceLabel && <span className="schema-activity-absence-caption">{schedule.absenceLabel}</span>}
    </section>
  );
}

function PersonDetailCard({ employee, competencies, shiftDates, selectedDate, onSelectDate, activitySchedules, hospitalMode = false }: {
  employee: ScheduleEmployee;
  competencies: string[];
  shiftDates: string[];
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  activitySchedules?: Record<string, EmployeeDaySchedule>;
  hospitalMode?: boolean;
}) {
  return (
    <div className="order-detail-card person-detail-card">
      <dl>
        <div><dt>Organisation</dt><dd>{employee.organisation}</dd></div>
        <div><dt>Anställningsgrupp</dt><dd>{employee.fmgGroup}</dd></div>
        <div><dt>Kompetenser</dt><dd><div className="person-detail-competencies">{competencies.map(competency => <span key={competency}>{competency}</span>)}</div></dd></div>
        <div><dt>Vald dag</dt><dd><select value={selectedDate} onChange={event => onSelectDate(event.currentTarget.value)} disabled={shiftDates.length === 0}>{shiftDates.length > 0 ? shiftDates.map(dateStr => <option key={dateStr} value={dateStr}>{fmtDay(parseDate(dateStr))}</option>) : <option value="">Inget pass i aktuell period</option>}</select></dd></div>
      </dl>
      {activitySchedules && <div className="person-activity-schedule-panel">
        <h4>Dagschema</h4>
        {activitySchedules[selectedDate]
          ? <ActivityScheduleDetail schedule={activitySchedules[selectedDate]} hospitalMode={hospitalMode} />
          : <p>Inget arbetsschema i aktuell period.</p>}
      </div>}
    </div>
  );
}

function SubstituteDetailCard({ substitute, details, dateStr, dateOptions, availability, booking, absenceReason, preschoolMode = false, onSelectDate, onSaveAvailability }: {
  substitute: SubstituteCandidate;
  details?: SubstituteDetails;
  dateStr: string;
  dateOptions: string[];
  availability: SubAvailability | null;
  booking?: SubBookedShift;
  absenceReason?: AbsenceReason;
  preschoolMode?: boolean;
  onSelectDate: (dateStr: string) => void;
  onSaveAvailability: (availability: SubAvailability) => void;
}) {
  const formatTime = (hours: number, minutes: number) => `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  const competencies = details?.competencies ?? substitute.competencies ?? [];
  const screeningFlags = preschoolMode ? getCandidateScreeningFlags(substitute.id) : undefined;
  const [start, setStart] = useState(availability ? formatTime(availability.startH, availability.startM) : '08:00');
  const [end, setEnd] = useState(availability ? formatTime(availability.endH, availability.endM) : '17:00');
  useEffect(() => {
    setStart(availability ? formatTime(availability.startH, availability.startM) : '08:00');
    setEnd(availability ? formatTime(availability.endH, availability.endM) : '17:00');
  }, [availability, dateStr]);
  const canEdit = dateStr >= TODAY_STR && !booking && !absenceReason;
  const saveAvailability = () => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    if ([startH, startM, endH, endM].some(Number.isNaN)) return;
    onSaveAvailability({ startH, startM, endH, endM });
  };

  return (
    <div className="order-detail-card person-detail-card substitute-detail-card">
      <dl>
        {details && <div><dt>Kontakt</dt><dd><a href={`tel:${details.phone.replace(/\s/g, '')}`}>{details.phone}</a><br /><a href={`mailto:${details.email}`}>{details.email}</a></dd></div>}
        {isHourlyCandidate(substitute) && <div><dt>LAS-timmar</dt><dd>{candidateLasHours(substitute.id)} av {LAS_MAX_HOURS} prototypstimmar</dd></div>}
        {isPermanentCandidate(substitute) && <div><dt>ATL-timmar</dt><dd>{candidateAtlHours(substitute.id, details)} av {ATL_MAX_HOURS} timmar</dd></div>}
        {competencies.length > 0 && <div><dt>Kompetenser</dt><dd><div className="person-detail-competencies">{competencies.map(competency => <span key={competency}>{competency}</span>)}</div></dd></div>}
        {screeningFlags && <>
          <div><dt>Kontinuitet</dt><dd>{screeningFlags.continuity ? 'Arbetat på enheten senaste halvåret' : 'Ingen kontinuitet registrerad'}</dd></div>
          <div><dt>Belastningsregister</dt><dd>{screeningFlags.clearance ? 'Utdrag finns' : 'Utdrag saknas'}</dd></div>
          <div><dt>Inskolning</dt><dd>{screeningFlags.onboarded ? 'Inskolad' : 'Inte inskolad'}</dd></div>
        </>}
        <div><dt>Datum</dt><dd><select value={dateStr} onChange={event => onSelectDate(event.currentTarget.value)}>{dateOptions.map(option => <option key={option} value={option}>{fmtDay(parseDate(option))}</option>)}</select></dd></div>
        <div><dt>Tillgänglighet</dt><dd><div className="order-detail-time-editor"><label>Från<input type="time" value={start} disabled={!canEdit} onChange={event => setStart(event.currentTarget.value)} /></label><span>–</span><label>Till<input type="time" value={end} disabled={!canEdit} onChange={event => setEnd(event.currentTarget.value)} /></label>{canEdit && <button type="button" className="btn-secondary" onClick={saveAvailability}>Spara</button>}</div></dd></div>
      </dl>
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

function ResourceOrdersList({ orders, unreadMessageEntities, selectedOrderId, selectedPersonId, relatedOrderIds, onSelectOrder, onSelectPerson, onClose, onAction, onOpenDetails, onChooseSubstitute, onShowSubstitutes, onOpenSubstitute, candidateButtonLabel = 'Visa vikarier' }: {
  orders: ResourceOrder[];
  unreadMessageEntities: Set<string>;
  selectedOrderId: string | null;
  selectedPersonId: string | null;
  relatedOrderIds: string[];
  onSelectOrder: (order: ResourceOrder) => void;
  onSelectPerson: (order: ResourceOrder) => void;
  onClose: () => void;
  onAction: (orderId: string, action: OrderContextAction) => void;
  onOpenDetails?: (order: ResourceOrder) => void;
  onChooseSubstitute?: (order: ResourceOrder) => void;
  onShowSubstitutes?: () => void;
  onOpenSubstitute?: (substituteId: string, dateStr: string) => void;
  candidateButtonLabel?: string;
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
          {onShowSubstitutes && <button className="btn-secondary schema-vikarie-open-btn" onClick={onShowSubstitutes}><i className="fa-solid fa-user-group" /> {candidateButtonLabel}</button>}
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
                    className={`schema-order-row${selectedOrderId === order.id ? ' schema-order-row-selected' : relatedOrderIds.includes(order.id) ? ' schema-order-row-related' : ''}`}
                    onClick={event => {
                      if ((event.target as HTMLElement).closest('.schema-order-person-cell, button, a')) return;
                      onSelectOrder(order);
                    }}
                    onDoubleClick={() => onOpenDetails?.(order)}
                    onContextMenu={() => {
                      onSelectOrder(order);
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
                <td className={`schema-order-person-cell${selectedPersonId === order.personId ? ' schema-order-person-selected' : ''}${selectedPersonId !== order.personId && relatedOrderIds.includes(order.id) ? ' schema-order-person-related' : ''}`}><button type="button" className="schema-order-person-select" onClick={event => { event.stopPropagation(); onSelectPerson(order); }}><strong>{order.personName}</strong><span>{order.role}</span></button></td>
                <td>{order.dateStr}</td>
                <td>{order.shift.start}–{order.shift.end}</td>
                <td className="schema-order-status-cell">
                  <span className="schema-order-status">{order.status}</span>{unreadMessageEntities.has(`order:${order.id}`) && <NewMessageIndicator />}
                  {order.acceptedSubstituteId && <small className="schema-order-assigned-substitute">Vikarie: <SubstituteDetailLink name={SUBSTITUTE_CANDIDATES.find(candidate => candidate.id === order.acceptedSubstituteId)?.name ?? 'Vikarie bokad'} substituteId={order.acceptedSubstituteId} dateStr={order.dateStr} onOpen={onOpenSubstitute} /></small>}
                </td>
                <td><div className="schema-context-action-cell"><span>{order.handledBy}</span><ContextKebabButton className="schema-context-kebab-inline" targetSelector=".schema-order-row" label={`Fler åtgärder för beställning ${order.personName}`} /></div></td>
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
                                <strong>{order.acceptedSubstituteId === invite.substituteId
                                  ? <SubstituteDetailLink name={invite.name} substituteId={invite.substituteId} dateStr={order.dateStr} onOpen={onOpenSubstitute} />
                                  : invite.name}</strong>
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
        showEvent="contextmenu"
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
  { id: 'ordered', label: 'Mottagna', icon: 'fa-cart-shopping', status: 'Beställd' },
  { id: 'processing', label: 'Påbörjat', icon: 'fa-user-gear', status: 'Under behandling' },
  { id: 'requested', label: 'Förfrågan skickad', icon: 'fa-paper-plane', status: 'Förfrågan skickad' },
  { id: 'responded', label: 'Besvarad', icon: 'fa-comment-dots', status: 'Besvarad' },
  { id: 'booked', label: 'Bokad', icon: 'fa-circle-check', status: 'Tillsatt' },
];

function ResourceOrdersKanban({ needs, orders, unreadMessageEntities, orgOptions, activityKinds, hospitalMode = false, selectedRoleId, getActivitiesForPerson, isAcuteNeed, onClose, onAction, onNeedAction, onOpenNeed, onOpenOrder, onChooseSubstitute, onShowSubstitutes, onOpenSubstitute, candidateButtonLabel = 'Visa vikarier', onMoveNeed, onMoveOrder, onReturnOrderToNeed, onRegisterResponses, onTakeBackOrder }: {
  needs: ResourceNeed[];
  orders: ResourceOrder[];
  unreadMessageEntities: Set<string>;
  orgOptions: ResourceBoardOrgOption[];
  activityKinds: ActivityKind[];
  hospitalMode?: boolean;
  selectedRoleId: string;
  getActivitiesForPerson: (personId: string, dateStr: string) => ScheduleActivity[];
  isAcuteNeed: (need: ResourceNeed) => boolean;
  onClose: () => void;
  onAction: (orderId: string, action: OrderContextAction) => void;
  onNeedAction: (needId: string, action: ResourceNeedAction) => void;
  onOpenNeed: (need: ResourceNeed) => void;
  onOpenOrder: (order: ResourceOrder) => void;
  onChooseSubstitute: (order: ResourceOrder) => void;
  onShowSubstitutes?: () => void;
  onOpenSubstitute?: (substituteId: string, dateStr: string) => void;
  candidateButtonLabel?: string;
  onMoveNeed: (needId: string, status: ResourceOrderStatus) => void;
  onMoveOrder: (orderId: string, status: ResourceOrderStatus) => void;
  onReturnOrderToNeed: (orderId: string) => void;
  onRegisterResponses: (orderId: string) => void;
  onTakeBackOrder: (orderId: string) => void;
}) {
  const [needsHidden, setNeedsHidden] = useState(false);
  const [kanbanContextTarget, setKanbanContextTarget] = useState<{ kind: 'need'; id: string } | { kind: 'order'; id: string } | null>(null);
  const [kanbanContextActions, setKanbanContextActions] = useState<Array<OrderContextAction | ResourceNeedAction>>([]);
  const [selectedOrgId, setSelectedOrgId] = useState('all');
  const [selectedActivities, setSelectedActivities] = useState<ActivityKind[]>([]);
  const [urgencyFilter, setUrgencyFilter] = useState<'acute' | 'nonacute' | 'all'>('all');
  const [timeWindowFilter, setTimeWindowFilter] = useState<ResourceNeedTimeWindow>('all');
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
  const matchesNeedUrgency = (need: ResourceNeed) => urgencyFilter === 'all'
    || (urgencyFilter === 'acute' ? isAcuteNeed(need) : !isAcuteNeed(need));
  const matchesBoardFilters = (personId: string, dateStr: string) => {
    if (!matchesResourceNeedTimeWindow(dateStr, timeWindowFilter)) return false;
    if (selectedOrg && !selectedOrg.personIds.includes(personId)) return false;
    if (selectedActivities.length > 0 && !getActivitiesForPerson(personId, dateStr).some(activity => selectedActivities.includes(activity.kind))) return false;
    return true;
  };
  const activeOrders = orders.filter(order => {
    if (order.status === 'Avbruten' || !matchesBoardFilters(order.personId, order.dateStr)) return false;
    if (!order.id.startsWith('resource-order-')) return true;
    const linkedNeed = needs.find(need => need.id === order.id.slice('resource-order-'.length));
    return !linkedNeed || matchesNeedUrgency(linkedNeed);
  });
  const activeOrderNeedIds = new Set(activeOrders
    .filter(order => order.id.startsWith('resource-order-'))
    .map(order => order.id.slice('resource-order-'.length)));
  const openNeeds = needs.filter(need => need.status === 'Öppet' && matchesNeedUrgency(need) && !activeOrderNeedIds.has(need.id) && matchesBoardFilters(need.personId, need.dateStr));
  const directlyBookedNeeds = needs.filter(need => need.status === 'Tillsatt' && matchesNeedUrgency(need) && !activeOrderNeedIds.has(need.id) && matchesBoardFilters(need.personId, need.dateStr));

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

  const activitySummary = (personId: string, dateStr: string, compact = false) => {
    const activities = getActivitiesForPerson(personId, dateStr)
      .filter(activity => selectedActivities.length === 0 || selectedActivities.includes(activity.kind));
    if (activities.length === 0) return null;
    const shortLabels: Record<ActivityKind, string> = hospitalMode
      ? { pedagogical: 'Rapport', outdoors: 'Patientrond', meals: 'Läkemedel', rest: 'Omvårdnad' }
      : { pedagogical: 'Pedagogisk', outdoors: 'Utevistelse', meals: 'Måltider', rest: 'Vila' };
    return <div className={`schema-kanban-activities${compact ? ' schema-kanban-activities-compact' : ''}`} aria-label="Aktiviteter">
      {activities.map(activity => <span key={activity.id} className={`schema-kanban-activity schema-kanban-activity-${activity.kind}`} title={`${activity.label} · ${activity.start}–${activity.end}`}>
        <i />{shortLabels[activity.kind]} {!compact && <time>{activity.start}–{activity.end}</time>}
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
      onContextMenu={event => {
        event.preventDefault();
        setKanbanContextTarget({ kind: 'need', id: need.id });
        setKanbanContextActions(getResourceNeedActions(need));
      }}
      title="Dra behovet till Mottagna eller dubbelklicka för status och logg"
    >
      <div className="schema-kanban-card-topline schema-kanban-need-topline">
        <strong className="schema-kanban-person" title={need.personName}>{need.personName}</strong>
        <span className="schema-kanban-card-badges">
          <span className={`schema-kanban-urgency${isAcuteNeed(need) ? ' is-acute' : ''}`}>{isAcuteNeed(need) ? 'Akut' : 'Ej akut'}</span>
          {isBooked && <span className="schema-kanban-status">Bokad</span>}
            {unreadMessageEntities.has(`need:${need.id}`) && <NewMessageIndicator />}
            {getResourceNeedActions(need).length > 0 && <ContextKebabButton className="schema-context-kebab-inline schema-kanban-context-kebab" targetSelector=".schema-kanban-card" label={`Fler åtgärder för resursbehov ${need.personName}`} />}
        </span>
      </div>
      <div className="schema-kanban-need-info">
        <span className="schema-kanban-subtitle" title={need.role}>{need.role}</span>
        {activitySummary(need.personId, need.dateStr, true)}
      </div>
      <div className="schema-kanban-meta schema-kanban-need-meta">
        <span>{need.dateStr} · {need.shift.start}–{need.shift.end}</span>
        <span className="schema-kanban-need-owner" title={isBooked && need.assignedSubstituteName ? `Ersättare ${need.assignedSubstituteName}` : `Hanteras av ${need.handledBy}`}>
          <i className={`fa-solid ${isBooked && need.assignedSubstituteName ? 'fa-circle-check' : 'fa-user'}`} />{isBooked && need.assignedSubstituteName
            ? <SubstituteDetailLink name={need.assignedSubstituteName} substituteId={need.assignedSubstituteId} dateStr={need.dateStr} onOpen={onOpenSubstitute} />
            : need.handledBy}
        </span>
      </div>
    </article>
  );

  const renderOrderCard = (order: ResourceOrder) => {
    const linkedNeed = order.id.startsWith('resource-order-');
    const linkedResourceNeed = linkedNeed ? needs.find(need => need.id === order.id.slice('resource-order-'.length)) : undefined;
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
        className={`schema-kanban-card schema-kanban-order schema-kanban-order-${order.status === 'Tillsatt' ? 'booked' : order.status === 'Besvarad' ? 'responded' : 'active'}${linkedNeed ? ' schema-kanban-linked-need' : ''}`}
        draggable={order.status !== 'Tillsatt'}
        onDragStart={event => handleDragStart(event, `order:${order.id}`)}
        onDoubleClick={() => onOpenOrder(order)}
        onContextMenu={event => {
          event.preventDefault();
          setKanbanContextTarget({ kind: 'order', id: order.id });
          setKanbanContextActions(getOrderContextActions(order));
        }}
        title="Dubbelklicka för status och händelselogg"
      >
        {linkedNeed ? <>
          <div className="schema-kanban-card-topline schema-kanban-need-topline">
            <strong className="schema-kanban-person" title={order.personName}>{order.personName}</strong>
            <span className="schema-kanban-card-badges">
              {linkedResourceNeed && <span className={`schema-kanban-urgency${isAcuteNeed(linkedResourceNeed) ? ' is-acute' : ''}`}>{isAcuteNeed(linkedResourceNeed) ? 'Akut' : 'Ej akut'}</span>}
              <span className="schema-kanban-status">{order.status}</span>
              {unreadMessageEntities.has(`order:${order.id}`) && <NewMessageIndicator />}
              {getOrderContextActions(order).length > 0 && <ContextKebabButton className="schema-context-kebab-inline schema-kanban-context-kebab" targetSelector=".schema-kanban-card" label={`Fler åtgärder för beställning ${order.personName}`} />}
            </span>
          </div>
          <div className="schema-kanban-need-info">
            <span className="schema-kanban-subtitle" title={order.role}>{order.role}</span>
            {activitySummary(order.personId, order.dateStr, true)}
          </div>
          <div className="schema-kanban-meta schema-kanban-need-meta">
            <span>{order.dateStr} · {order.shift.start}–{order.shift.end}</span>
            <span className="schema-kanban-need-owner" title={order.acceptedSubstituteId ? 'Ersättare bokad' : `Hanteras av ${order.handledBy}`}>
              <i className={`fa-solid ${order.acceptedSubstituteId ? 'fa-circle-check' : 'fa-user'}`} />
              {order.acceptedSubstituteId
                ? <SubstituteDetailLink name={SUBSTITUTE_CANDIDATES.find(candidate => candidate.id === order.acceptedSubstituteId)?.name ?? 'Vikarie bokad'} substituteId={order.acceptedSubstituteId} dateStr={order.dateStr} onOpen={onOpenSubstitute} />
                : order.handledBy}
            </span>
          </div>
        </> : <>
          <div className="schema-kanban-card-topline">
            <span className="schema-kanban-kind"><i className="fa-solid fa-cart-shopping" /> {order.resourceType === 'vikarie' ? 'Vikarie' : 'Extrapass'}</span>
            <span className="schema-kanban-card-badges"><span className="schema-kanban-status">{order.status}</span>{unreadMessageEntities.has(`order:${order.id}`) && <NewMessageIndicator />}{getOrderContextActions(order).length > 0 && <ContextKebabButton className="schema-context-kebab-inline schema-kanban-context-kebab" targetSelector=".schema-kanban-card" label={`Fler åtgärder för beställning ${order.personName}`} />}</span>
          </div>
          <strong className="schema-kanban-person">{order.personName}</strong>
          <span className="schema-kanban-subtitle">{order.role}</span>
          {activitySummary(order.personId, order.dateStr)}
          <div className="schema-kanban-meta"><span>{order.dateStr}</span><span>{order.shift.start}–{order.shift.end}</span></div>
          {order.acceptedSubstituteId && <div className="schema-kanban-assignment"><i className="fa-solid fa-circle-check" /> <SubstituteDetailLink name={SUBSTITUTE_CANDIDATES.find(candidate => candidate.id === order.acceptedSubstituteId)?.name ?? 'Vikarie bokad'} substituteId={order.acceptedSubstituteId} dateStr={order.dateStr} onOpen={onOpenSubstitute} /></div>}
          <div className="schema-kanban-owner"><i className="fa-solid fa-user" /> Hanteras av {order.handledBy}</div>
        </>}
        {!linkedNeed && <div className="schema-kanban-card-actions">
          {stageAction}
          {canTakeBack && <button className="btn-secondary" onClick={event => { event.stopPropagation(); onTakeBackOrder(order.id); }}>Ta tillbaka</button>}
        </div>}
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
          {onShowSubstitutes && <button className="btn-secondary schema-vikarie-open-btn" onClick={onShowSubstitutes}><i className="fa-solid fa-user-group" /> {candidateButtonLabel}</button>}
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
        <label className="schema-kanban-urgency-filter">Akutstatus
          <select value={urgencyFilter} onChange={event => setUrgencyFilter(event.currentTarget.value as 'acute' | 'nonacute' | 'all')}>
            <option value="acute">Akut</option>
            <option value="nonacute">Ej akut</option>
            <option value="all">Alla</option>
          </select>
        </label>
        <ResourceNeedTimeWindowFilter value={timeWindowFilter} onChange={setTimeWindowFilter} />
        {activityKinds.length > 0 && <details className="schema-kanban-activity-filter">
          <summary>Aktiviteter{selectedActivities.length > 0 && <span>{selectedActivities.length}</span>}</summary>
          <div className="schema-kanban-activity-filter-options">
            {activityKinds.map(kind => (
              <label key={kind}><input type="checkbox" checked={selectedActivities.includes(kind)} onChange={event => {
                const checked = event.currentTarget.checked;
                setSelectedActivities(current => checked ? [...current, kind] : current.filter(item => item !== kind));
              }} />{(hospitalMode ? HOSPITAL_ACTIVITY_TYPES : PRESCHOOL_ACTIVITY_TYPES)[kind].label}</label>
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
      <ContextMenu
        target=".schema-kanban-card"
        showEvent="contextmenu"
        dataSource={kanbanContextActions}
        itemRender={renderSchemaContextMenuItem}
        onItemClick={event => {
          if (!kanbanContextTarget || !event.itemData) return;
          if (kanbanContextTarget.kind === 'need') onNeedAction(kanbanContextTarget.id, event.itemData as ResourceNeedAction);
          else onAction(kanbanContextTarget.id, event.itemData as OrderContextAction);
        }}
      />
    </section>
  );
}

function OrderDetailCard({ order, onSaveTime, onOpenSubstitute }: {
  order: ResourceOrder;
  onSaveTime: (orderId: string, start: string, end: string) => void;
  onOpenSubstitute?: (substituteId: string, dateStr: string) => void;
}) {
  const [start, setStart] = useState(order.shift.start);
  const [end, setEnd] = useState(order.shift.end);
  useEffect(() => { setStart(order.shift.start); setEnd(order.shift.end); }, [order.shift.start, order.shift.end]);
  const timeChanged = start !== order.shift.start || end !== order.shift.end;

  return (
    <div className="order-detail-card">
      <dl>
        <div><dt>Pass</dt><dd><div className="order-detail-time-editor"><label>Starttid<input type="time" value={start} onChange={event => setStart(event.currentTarget.value)} /></label><span>–</span><label>Sluttid<input type="time" value={end} onChange={event => setEnd(event.currentTarget.value)} /></label>{timeChanged && <button type="button" className="btn-secondary" onClick={() => onSaveTime(order.id, start, end)}>Spara tid</button>}</div></dd></div>
        <div><dt>Beställd av</dt><dd>{order.orderedBy}</dd></div>
        <div><dt>Handläggare</dt><dd>{order.handledBy}</dd></div>
        {order.acceptedSubstituteId && <div><dt>Tillsatt med</dt><dd><SubstituteDetailLink name={SUBSTITUTE_CANDIDATES.find(candidate => candidate.id === order.acceptedSubstituteId)?.name ?? 'Vikarie bokad'} substituteId={order.acceptedSubstituteId} dateStr={order.dateStr} onOpen={onOpenSubstitute} /></dd></div>}
      </dl>
    </div>
  );
}

function getResourceNeedActions(need: ResourceNeed): ResourceNeedAction[] {
  if (need.status === 'Borttaget' || need.status === 'Tillsatt') return [];
  return [
    { id: 'open' as const, text: 'Öppna', icon: 'arrow-up-right-from-square' },
    { id: 'find-substitute' as const, text: 'Hitta ersättare', icon: 'user-magnifying-glass' },
    ...(need.status !== 'Tillsatt' ? [{ id: 'assign-direct' as const, text: 'Tillsätt direkt', icon: 'robot' }] : []),
    ...(need.status !== 'Tillsatt' ? [{ id: 'assign' as const, text: 'Tillsätt', icon: 'user-check' }] : []),
    { id: 'order' as const, text: 'Beställ', icon: 'cart-shopping' },
    { id: 'remove' as const, text: 'Ta bort resursbehov', icon: 'ban' },
  ];
}

function ResourceNeedsList({ needs, unreadMessageEntities, orgOptions, selectedRoleId, selectedNeedId, relatedNeedIds, onSelectNeed, onClose, onOpenDetails, onAction, onDropPass, onOrderAll, onAssignAll }: {
  needs: ResourceNeed[];
  unreadMessageEntities: Set<string>;
  orgOptions: ResourceBoardOrgOption[];
  selectedRoleId: string;
  selectedNeedId: string | null;
  relatedNeedIds: string[];
  onSelectNeed: (need: ResourceNeed) => void;
  onClose?: () => void;
  onOpenDetails: (need: ResourceNeed) => void;
  onAction: (needId: string, action: ResourceNeedAction) => void;
  onDropPass: (event: React.DragEvent<HTMLDivElement>) => void;
  onOrderAll: (needIds: string[]) => void;
  onAssignAll?: (needIds: string[]) => void;
}) {
  const [contextNeedId, setContextNeedId] = useState<string | null>(null);
  const [contextActions, setContextActions] = useState<ResourceNeedAction[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrgId, setSelectedOrgId] = useState('all');
  const [timeWindowFilter, setTimeWindowFilter] = useState<ResourceNeedTimeWindow>('all');
  const allowedOrgLevels = useMemo<ResourceBoardOrgLevel[]>(() => selectedRoleId === 'admin'
    ? ['education', 'rectorate', 'preschool', 'team', 'department', 'organisation']
    : selectedRoleId === 'chef'
      ? ['rectorate', 'preschool', 'team', 'department', 'organisation']
      : ['preschool', 'team', 'department'], [selectedRoleId]);
  const visibleOrgOptions = useMemo(() => orgOptions.filter(option => allowedOrgLevels.includes(option.level)), [allowedOrgLevels, orgOptions]);
  useEffect(() => {
    if (selectedOrgId !== 'all' && !visibleOrgOptions.some(option => option.id === selectedOrgId)) setSelectedOrgId('all');
  }, [selectedOrgId, visibleOrgOptions]);
  const selectedOrg = visibleOrgOptions.find(option => option.id === selectedOrgId);
  const activeNeeds = needs.filter(need => {
    if (need.status === 'Borttaget') return false;
    if (statusFilter !== 'all' && (need.workflowStatus ?? need.status) !== statusFilter) return false;
    if (selectedOrg && !selectedOrg.personIds.includes(need.personId)) return false;
    if (!matchesResourceNeedTimeWindow(need.dateStr, timeWindowFilter)) return false;
    return true;
  });
  const hasOpenNeed = activeNeeds.some(need => need.status === 'Öppet' && !need.workflowStatus);
  return (
    <div
      className="schema-orders-list schema-resource-needs-list"
      aria-live="polite"
      onDragEnter={event => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; }}
      onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; }}
      onDrop={event => { event.preventDefault(); event.stopPropagation(); onDropPass(event); }}
    >
      <div className="schema-orders-list-header">
        <div>
          <h2><i className="fa-solid fa-user-clock" aria-hidden="true" /> Resursbehov</h2>
          <p>Frånvaro, vakanser och extrapass som behöver tillsättas.</p>
        </div>
        <div className="schema-orders-header-actions">
          <span className="schema-orders-count">{activeNeeds.length}</span>
          {onClose && <button className="schema-orders-close" onClick={onClose} aria-label="Stäng resursbehov"><i className="fa-solid fa-xmark" /></button>}
        </div>
      </div>
      <div className="schema-kanban-filters schema-resource-needs-filters">
        <label className="schema-kanban-org-filter">Organisation
          <select value={selectedOrgId} onChange={event => setSelectedOrgId(event.currentTarget.value)}>
            <option value="all">Alla organisationer</option>
            {(['education', 'rectorate', 'preschool', 'team', 'department', 'organisation'] as ResourceBoardOrgLevel[]).map(level => {
              const levelOptions = visibleOrgOptions.filter(option => option.level === level);
              if (levelOptions.length === 0) return null;
              const levelLabels: Record<ResourceBoardOrgLevel, string> = {
                education: 'Förvaltning', rectorate: 'Område', preschool: 'Förskola', team: 'Team', department: 'Avdelning', organisation: 'Organisation',
              };
              return <optgroup key={level} label={levelLabels[level]}>{levelOptions.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}</optgroup>;
            })}
          </select>
        </label>
        <label className="schema-kanban-urgency-filter">Status
          <select value={statusFilter} onChange={event => setStatusFilter(event.currentTarget.value)}>
            <option value="all">Alla statusar</option>
            <option value="Öppet">Öppet</option>
            <option value="Beställd">Beställd</option>
            <option value="Under behandling">Under behandling</option>
            <option value="Förfrågan skickad">Förfrågan skickad</option>
            <option value="Besvarad">Besvarad</option>
            <option value="Tillsatt">Tillsatt</option>
          </select>
        </label>
        <ResourceNeedTimeWindowFilter value={timeWindowFilter} onChange={setTimeWindowFilter} compact />
      </div>
      <div className="schema-resource-needs-drop-hint"><i className="fa-solid fa-hand-pointer" /> Dra ett pass hit för att skapa ett resursbehov</div>
      {activeNeeds.length === 0 ? (
        <div className="schema-orders-empty"><i className="fa-solid fa-user-clock" /><span>Inga resursbehov att visa.</span></div>
      ) : (
        <table className="schema-orders-table">
          <colgroup><col style={{ width: '16%' }} /><col style={{ width: '20%' }} /><col style={{ width: '27%' }} /><col style={{ width: '37%' }} /></colgroup>
          <thead><tr><th>Behov</th><th>Medarbetare</th><th>Status</th><th>Pass / aktivitet</th></tr></thead>
          <tbody>
            {activeNeeds.map(need => (
              <tr
                key={need.id}
                className={`schema-order-row schema-resource-need-row schema-resource-need-row-${need.source === 'pass' ? 'extra' : 'absence'}${need.workflowStatus === 'Tillsatt' || need.status === 'Tillsatt' ? ' schema-resource-need-row-filled' : ''}${selectedNeedId === need.id ? ' schema-resource-need-row-selected' : relatedNeedIds.includes(need.id) ? ' schema-resource-need-row-related' : ''}`}
                onClick={() => onSelectNeed(need)}
                onDoubleClick={() => onOpenDetails(need)}
                onContextMenu={event => {
                  event.preventDefault();
                  onSelectNeed(need);
                  setContextNeedId(need.id);
                  setContextActions(getResourceNeedActions(need));
                }}
                title="Dubbelklicka för detaljer eller högerklicka för åtgärder"
              >
                <td className="schema-resource-need-type-cell">
                  <span className="schema-resource-need-type-heading"><strong className={`schema-resource-need-kind schema-resource-need-kind-${need.source === 'pass' ? 'extra' : 'absence'}`}>{resourceNeedLabel(need.source)}</strong>{unreadMessageEntities.has(`need:${need.id}`) && <NewMessageIndicator />}</span>
                  <span>{need.dateStr}</span>
                  {need.source === 'frånvaro' && need.reason && <small>{need.reason}</small>}
                </td>
                <td><strong>{need.source === 'pass' ? 'Extrapass' : need.personName}</strong><span className="schema-order-person-role">{need.role}</span></td>
                <td className="schema-resource-need-status-cell">
                  <span className={`schema-order-status schema-resource-need-status-${need.workflowStatus === 'Tillsatt' || need.status === 'Tillsatt' ? 'filled' : need.handledBy === 'Maja Andersson' ? 'requester' : 'open'}`}>{need.workflowStatus ?? need.status}</span>
                  <small className={need.handledBy === 'Maja Andersson' ? 'schema-resource-need-owner-requester' : ''}>{need.handledBy === 'Maja Andersson' ? 'Beställare' : 'Bemanning'} · {need.handledBy}</small>
                </td>
                <td className="schema-resource-need-pass-cell schema-context-host">
                  <strong className={`schema-resource-need-pass-time schema-resource-need-pass-${need.shift.type}`}>{need.shift.start}–{need.shift.end}</strong>
                  {need.activities && need.activities.length > 0 && <span className="schema-resource-need-activities">
                    {need.activities.slice(0, 2).map(activity => <span key={activity.id} className={`schema-resource-need-activity ${HOSPITAL_ACTIVITY_TYPES[activity.kind].className}`} title={`${activity.label} · ${activity.start}–${activity.end}`}>
                      {activity.label.slice(0, 3).toUpperCase()}
                    </span>)}
                  </span>}
                  <ContextKebabButton className="schema-context-kebab-cell" targetSelector=".schema-resource-need-row" label={`Fler åtgärder för resursbehov ${need.personName}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="schema-resource-needs-bulk-actions">
        <button className="btn-secondary" disabled={!hasOpenNeed} onClick={() => onOrderAll(activeNeeds.map(need => need.id))}>
          <i className="fa-solid fa-cart-shopping" /> Skicka alla till bemanning
        </button>
        {onAssignAll && <button className="btn-primary" disabled={!hasOpenNeed} onClick={() => onAssignAll(activeNeeds.map(need => need.id))}>
          <i className="fa-solid fa-robot" /> Tillsätt alla
        </button>}
      </div>
      <ContextMenu
        target=".schema-resource-need-row"
        showEvent="contextmenu"
        dataSource={contextActions}
        itemRender={renderSchemaContextMenuItem}
        onItemClick={event => {
          if (contextNeedId && event.itemData) onAction(contextNeedId, event.itemData as ResourceNeedAction);
        }}
      />
    </div>
  );
}

function ResourceNeedDetailCard({ need, order, onOpenSubstitute }: {
  need: ResourceNeed;
  order?: ResourceOrder;
  onOpenSubstitute?: (substituteId: string, dateStr: string) => void;
}) {
  return (
    <div className="order-detail-card">
      <dl>
        <div><dt>Orsak</dt><dd>{need.reason ?? 'Skapat från pass'}</dd></div>
        <div><dt>Skapat av</dt><dd>{need.createdBy}</dd></div>
        <div><dt>Hanteras av</dt><dd>{need.handledBy}</dd></div>
        {need.assignedSubstituteId && <div><dt>Tillsatt med</dt><dd><SubstituteDetailLink name={need.assignedSubstituteName ?? SUBSTITUTE_CANDIDATES.find(candidate => candidate.id === need.assignedSubstituteId)?.name ?? 'Vikarie'} substituteId={need.assignedSubstituteId} dateStr={need.dateStr} onOpen={onOpenSubstitute} /></dd></div>}
        {order && <div><dt>Beställning</dt><dd>Beställd av {order.orderedBy} · {order.status} · Hanteras av {order.handledBy}</dd></div>}
      </dl>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface SchemaProps {
  breadcrumbSectionLabel?: string;
  hideMinimumStaffing?: boolean;
  useAlternativeOrganisationVisualization?: boolean;
  resourceNeedPrototype?: boolean;
  alwaysShowResourceNeeds?: boolean;
  initialActiveView?: 'schema' | 'orders';
}

export const Schema = ({
  breadcrumbSectionLabel = 'Tid & Bemanning',
  hideMinimumStaffing = false,
  useAlternativeOrganisationVisualization = false,
  resourceNeedPrototype = false,
  alwaysShowResourceNeeds = false,
  initialActiveView = 'schema',
}: SchemaProps) => {
  const navigateTo = useNavigate();
  const automation = useOptionalAutomation();
  const { selectedOrganisation, selectedRoleId } = useRole();
  const isActivityTimelineScenario = selectedOrganisation === 'schoolTimeline';
  const hasActivityTimeline = isActivityTimelineScenario || alwaysShowResourceNeeds;
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
  const [activeView,     setActiveView]     = useState<'schema' | 'orders' | 'resource-needs'>(initialActiveView);
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
  const [highlightedScheduleObject, setHighlightedScheduleObject] = useState<{ personId: string; dateStr: string; activityId?: string } | null>(null);
  const [highlightedNeedId, setHighlightedNeedId] = useState<string | null>(null);
  const [highlightedOrderId, setHighlightedOrderId] = useState<string | null>(null);
  const [highlightedPersonId, setHighlightedPersonId] = useState<string | null>(null);
  const [highlightedCandidateId, setHighlightedCandidateId] = useState<string | null>(null);
  const [highlightedCandidateBooking, setHighlightedCandidateBooking] = useState<{ candidateId: string; dateStr: string } | null>(null);
  const [resourceNeedDetail, setResourceNeedDetail] = useState<ResourceNeed | null>(null);
  const [resourceNeedActivities, setResourceNeedActivities] = useState<Record<string, CaseActivity[]>>({});
  const [resourceNeedAssignmentId, setResourceNeedAssignmentId] = useState<string | null>(null);
  const [resourceNeedOrderTargetId, setResourceNeedOrderTargetId] = useState<string | null>(null);
  const automationProcessedNeedIdsRef = useRef<Set<string>>(new Set());
  const [vacancyKeys, setVacancyKeys] = useState<string[]>([]);

  // ── Sub panel ──
  const [subPanelState,   setSubPanelState]   = useState<SubPanelState | null>(null);
  const [subPanelOpen,    setSubPanelOpen]    = useState(false);
  const [passToReveal, setPassToReveal] = useState<{ personId: string; dateStr: string } | null>(null);
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
  const [unreadMessageEntities, setUnreadMessageEntities] = useState<Set<string>>(() => new Set());
  const sampleMessagesSeededRef = useRef(false);

  const markMessageEntitiesUnread = useCallback((keys: string[]) => {
    if (keys.length === 0) return;
    setUnreadMessageEntities(current => {
      const additions = keys.filter(key => !current.has(key));
      if (additions.length === 0) return current;
      return new Set([...current, ...additions]);
    });
  }, []);
  const markMessageEntitiesRead = useCallback((keys: string[]) => {
    if (keys.length === 0) return;
    setUnreadMessageEntities(current => {
      if (!keys.some(key => current.has(key))) return current;
      const next = new Set(current);
      keys.forEach(key => next.delete(key));
      return next;
    });
  }, []);

  useEffect(() => {
    setOrderDetail(current => current ? resourceOrders.find(order => order.id === current.id) ?? current : current);
  }, [resourceOrders]);
  useEffect(() => {
    setResourceNeedDetail(current => current ? resourceNeeds.find(need => need.id === current.id) ?? current : current);
  }, [resourceNeeds]);

  const addOrderActivity = useCallback((orderId: string, activity: Omit<CaseActivity, 'id'>) => {
    const newActivity = { ...activity, id: Date.now() + Math.floor(Math.random() * 1000) };
    setOrderActivities(current => ({
      ...current,
      [orderId]: [...(current[orderId] ?? []), newActivity],
    }));
    if (activity.type === 'message' && activity.author !== 'Du' && !activity.isCurrentUser) {
      const order = resourceOrders.find(item => item.id === orderId);
      const keys = [`order:${orderId}`];
      if (order) keys.push(`pass:${order.personId}|${order.dateStr}`, `person:${order.personId}`);
      if (orderId.startsWith('resource-order-') && resourceNeeds.some(need => need.id === orderId.slice('resource-order-'.length))) {
        keys.push(`need:${orderId.slice('resource-order-'.length)}`);
      }
      markMessageEntitiesUnread(keys);
    }
  }, [markMessageEntitiesUnread, resourceNeeds, resourceOrders]);
  const addResourceNeedActivity = useCallback((needId: string, activity: Omit<CaseActivity, 'id'>) => {
    const newActivity = { ...activity, id: Date.now() + Math.floor(Math.random() * 1000) };
    setResourceNeedActivities(current => ({
      ...current,
      [needId]: [...(current[needId] ?? []), newActivity],
    }));
    if (activity.type === 'message' && activity.author !== 'Du' && !activity.isCurrentUser) {
      const need = resourceNeeds.find(item => item.id === needId);
      const order = resourceOrders.find(item => item.id === `resource-order-${needId}`);
      const keys = [`need:${needId}`];
      if (need) keys.push(`pass:${need.personId}|${need.dateStr}`, `person:${need.personId}`);
      if (order) keys.push(`order:${order.id}`);
      markMessageEntitiesUnread(keys);
    }
  }, [markMessageEntitiesUnread, resourceNeeds, resourceOrders]);
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
    const newActivity = { ...activity, id: Date.now() + Math.floor(Math.random() * 1000) };
    setPassActivities(current => ({
      ...current,
      [passKey]: [...(current[passKey] ?? []), newActivity],
    }));
    if (activity.type === 'message' && activity.author !== 'Du' && !activity.isCurrentUser) {
      const separatorIndex = passKey.lastIndexOf('|');
      const personId = separatorIndex >= 0 ? passKey.slice(0, separatorIndex) : '';
      const dateStr = separatorIndex >= 0 ? passKey.slice(separatorIndex + 1) : '';
      const need = resourceNeeds.find(item => item.personId === personId && item.dateStr === dateStr && item.status !== 'Borttaget');
      const order = resourceOrders.find(item => item.personId === personId && item.dateStr === dateStr);
      markMessageEntitiesUnread([
        `pass:${passKey}`,
        ...(personId ? [`person:${personId}`] : []),
        ...(need ? [`need:${need.id}`] : []),
        ...(order ? [`order:${order.id}`] : []),
      ]);
    }
  }, [markMessageEntitiesUnread, resourceNeeds, resourceOrders]);
  const addPersonActivity = useCallback((personId: string, activity: Omit<CaseActivity, 'id'>) => {
    const newActivity = { ...activity, id: Date.now() + Math.floor(Math.random() * 1000) };
    setPersonActivities(current => ({
      ...current,
      [personId]: [...(current[personId] ?? []), newActivity],
    }));
    if (activity.type === 'message' && activity.author !== 'Du' && !activity.isCurrentUser) markMessageEntitiesUnread([`person:${personId}`]);
  }, [markMessageEntitiesUnread]);
  const addSubstituteActivity = useCallback((substituteId: string, activity: Omit<CaseActivity, 'id'>) => {
    const newActivity = { ...activity, id: Date.now() + Math.floor(Math.random() * 1000) };
    setSubstituteActivities(current => ({
      ...current,
      [substituteId]: [...(current[substituteId] ?? []), newActivity],
    }));
    if (activity.type === 'message' && activity.author !== 'Du' && !activity.isCurrentUser) markMessageEntitiesUnread([`substitute:${substituteId}`]);
  }, [markMessageEntitiesUnread]);
  const [absenceDialogState, setAbsenceDialogState] = useState<AbsenceDialogState | null>(null);

  // ── Shift detail dialog ──
  const [detailState, setDetailState] = useState<DetailState | null>(null);
  const [personDetailId, setPersonDetailId] = useState<string | null>(null);
  const [personDetailDate, setPersonDetailDate] = useState('');

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
  const presenceScrollRef = useRef<HTMLDivElement>(null);
  const subScrollRef     = useRef<HTMLDivElement>(null);
  const isSyncingRef     = useRef(false);
  const [subTableLayout, setSubTableLayout] = useState({ width: 0, inset: 0 });
  const [presenceBounds, setPresenceBounds] = useState({ left: 0, width: 0 });
  const isPrimaryScheduleSelection = !highlightedNeedId && !highlightedOrderId && !highlightedPersonId && !highlightedCandidateId && !highlightedCandidateBooking;
  const selectScheduleObject = (personId: string, dateStr: string, target: EventTarget | null) => {
    const activityId = target instanceof HTMLElement ? target.closest<HTMLElement>('[data-activity-id]')?.dataset.activityId : undefined;
    setHighlightedNeedId(null);
    setHighlightedOrderId(null);
    setHighlightedPersonId(null);
    setHighlightedCandidateId(null);
    setHighlightedCandidateBooking(null);
    setHighlightedScheduleObject({ personId, dateStr, activityId });
  };
  const focusPassForCandidates = useCallback((personId: string, dateStr: string) => {
    setHighlightedNeedId(null);
    setHighlightedOrderId(null);
    setHighlightedPersonId(null);
    setHighlightedCandidateId(null);
    setHighlightedCandidateBooking(null);
    setHighlightedScheduleObject({ personId, dateStr });
    setPassToReveal({ personId, dateStr });
  }, []);
  const selectResourceNeed = (need: ResourceNeed) => {
    setHighlightedNeedId(need.id);
    setHighlightedOrderId(null);
    setHighlightedPersonId(null);
    setHighlightedCandidateId(null);
    setHighlightedCandidateBooking(null);
    setHighlightedScheduleObject({ personId: need.personId, dateStr: need.dateStr });
  };
  const selectResourceOrder = (order: ResourceOrder) => {
    setHighlightedNeedId(null);
    setHighlightedOrderId(order.id);
    setHighlightedPersonId(null);
    setHighlightedCandidateId(null);
    setHighlightedCandidateBooking(null);
    setHighlightedScheduleObject({ personId: order.personId, dateStr: order.dateStr });
  };
  const selectOrderPerson = (order: ResourceOrder) => {
    setHighlightedNeedId(null);
    setHighlightedOrderId(null);
    setHighlightedPersonId(order.personId);
    setHighlightedCandidateId(null);
    setHighlightedCandidateBooking(null);
    setHighlightedScheduleObject({ personId: order.personId, dateStr: order.dateStr });
  };
  const selectSchedulePerson = (personId: string) => {
    setHighlightedNeedId(null);
    setHighlightedOrderId(null);
    setHighlightedPersonId(personId);
    setHighlightedCandidateId(null);
    setHighlightedCandidateBooking(null);
    setHighlightedScheduleObject(null);
  };
  const selectCandidate = (candidateId: string) => {
    setHighlightedScheduleObject(null);
    setHighlightedNeedId(null);
    setHighlightedOrderId(null);
    setHighlightedPersonId(null);
    setHighlightedCandidateId(candidateId);
    setHighlightedCandidateBooking(null);
  };
  const selectCandidateBooking = (candidateId: string, booking: SubBookedShift) => {
    setHighlightedNeedId(null);
    setHighlightedOrderId(null);
    setHighlightedPersonId(null);
    setHighlightedCandidateId(null);
    setHighlightedCandidateBooking({ candidateId, dateStr: booking.dateStr });
    setHighlightedScheduleObject(booking.personId ? { personId: booking.personId, dateStr: booking.dateStr } : null);
  };

  // ── Scroll sync between main table and sub panel ──
  useEffect(() => {
    const main  = mainWrapperRef.current;
    const panel = subScrollRef.current;
    const presence = presenceScrollRef.current;
    if (!main || (!panel && !presence)) return;

    const updateTableLayout = () => {
      const mainTable = main.querySelector<HTMLTableElement>('.schema-table');
      if (mainTable && panel) {
        const width = Math.round(mainTable.getBoundingClientRect().width);
        const inset = Math.max(0, Math.round(main.getBoundingClientRect().left - panel.getBoundingClientRect().left));
        setSubTableLayout(current => current.width === width && current.inset === inset ? current : { width, inset });
      }
      if (presence) {
        const scheduleMain = main.closest('.schema-schedule-main') as HTMLElement | null;
        const bounds = scheduleMain?.getBoundingClientRect();
        if (bounds) {
          const next = { left: Math.round(bounds.left), width: Math.round(bounds.width) };
          setPresenceBounds(current => current.left === next.left && current.width === next.width ? current : next);
        }
      }
    };

    const syncMain = () => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;
      if (panel) panel.scrollLeft = main.scrollLeft;
      if (presence) presence.scrollLeft = main.scrollLeft;
      requestAnimationFrame(() => { isSyncingRef.current = false; });
    };
    const syncPanel = () => {
      if (!panel || isSyncingRef.current) return;
      isSyncingRef.current = true;
      main.scrollLeft = panel.scrollLeft;
      requestAnimationFrame(() => { isSyncingRef.current = false; });
    };
    const syncPresence = () => {
      if (!presence || isSyncingRef.current) return;
      isSyncingRef.current = true;
      main.scrollLeft = presence.scrollLeft;
      if (panel) panel.scrollLeft = presence.scrollLeft;
      requestAnimationFrame(() => { isSyncingRef.current = false; });
    };

    main.addEventListener('scroll', syncMain);
    panel?.addEventListener('scroll', syncPanel);
    presence?.addEventListener('scroll', syncPresence);
    if (subPanelOpen && panel) panel.scrollLeft = main.scrollLeft;
    if (presence) presence.scrollLeft = main.scrollLeft;
    updateTableLayout();
    const resizeObserver = new ResizeObserver(updateTableLayout);
    resizeObserver.observe(main);
    if (panel) resizeObserver.observe(panel);
    if (presence) resizeObserver.observe(presence);
    const scheduleMain = main.closest('.schema-schedule-main');
    if (scheduleMain) resizeObserver.observe(scheduleMain);
    document.addEventListener('scroll', updateTableLayout, true);
    window.addEventListener('resize', updateTableLayout);

    return () => {
      main.removeEventListener('scroll', syncMain);
      panel?.removeEventListener('scroll', syncPanel);
      presence?.removeEventListener('scroll', syncPresence);
      document.removeEventListener('scroll', updateTableLayout, true);
      window.removeEventListener('resize', updateTableLayout);
      resizeObserver.disconnect();
    };
  }, [activeView, subPanelOpen]);

  useEffect(() => {
    if (!subPanelOpen || activeView !== 'schema' || (!hasActivityTimeline && !passToReveal)) return;
    let firstFrame = 0;
    let secondFrame = 0;
    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        const table = mainWrapperRef.current;
        const scrollContainer = table?.closest('.main-content-wrapper') as HTMLElement | null;
        const passCell = passToReveal && table ? (Array.from(table.querySelectorAll('td[data-person-id][data-date-str]')) as HTMLTableCellElement[])
          .find(cell => cell.dataset.personId === passToReveal.personId && cell.dataset.dateStr === passToReveal.dateStr) : undefined;
        const target = passCell ?? table?.closest('.schema-page-wrapper')?.querySelector<HTMLElement>('.schema-schedule-toolbar') ?? table;
        if (!scrollContainer || !target) return;
        const containerBounds = scrollContainer.getBoundingClientRect();
        const targetBounds = target.getBoundingClientRect();
        const availableTop = containerBounds.top + 8;
        const panel = document.querySelector<HTMLElement>('.schema-sub-panel-open');
        const availableBottom = Math.min(window.innerHeight - (panel?.offsetHeight ?? 470), containerBounds.bottom) - 16;
        const correction = targetBounds.top < availableTop
          ? targetBounds.top - availableTop
          : targetBounds.bottom > availableBottom ? targetBounds.bottom - availableBottom : 0;
        if (correction) scrollContainer.scrollBy({ top: correction, behavior: 'smooth' });
        if (passCell && table) {
          const tableBounds = table.getBoundingClientRect();
          const visibleLeft = Math.min(tableBounds.left + EMPLOYEE_COLUMN_WIDTH + 8, tableBounds.right - 16);
          const visibleRight = tableBounds.right - 12;
          const horizontalCorrection = targetBounds.left < visibleLeft
            ? targetBounds.left - visibleLeft
            : targetBounds.right > visibleRight ? targetBounds.right - visibleRight : 0;
          if (horizontalCorrection) table.scrollBy({ left: horizontalCorrection, behavior: 'smooth' });
        }
      });
    });
    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [activeView, hasActivityTimeline, passToReveal, subPanelOpen]);

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
        const selectedActivity = (e.target as HTMLElement).closest<HTMLElement>('[data-activity-id]');
        setHighlightedScheduleObject({
          personId: ctxRef.current.personId,
          dateStr: ctxRef.current.dateStr,
          activityId: selectedActivity?.dataset.activityId,
        });
        setHighlightedNeedId(null);
        setHighlightedOrderId(null);
        setHighlightedPersonId(null);
        setHighlightedCandidateId(null);
        setHighlightedCandidateBooking(null);
        const passKey = `${ctxRef.current.personId}|${ctxRef.current.dateStr}`;
        const remainingPass = remainingPasses.find(pass => pass.id === ctxRef.current?.personId && pass.dateStr === ctxRef.current?.dateStr);
        const isAssigned = fills.some(fill => `${fill.personId}|${fill.dateStr}` === passKey)
          || Boolean(remainingPass?.assignedSubstituteId);
        let actions: ContextAction[];
        if (remainingPass && !isAssigned) {
          actions = [
            { id: 'primary', text: 'Hitta vikarie', icon: 'user' },
            { id: 'find-substitute', text: 'Hitta ersättare', icon: 'user-magnifying-glass' },
            { id: 'order-resource', text: 'Beställ resurs', icon: 'cart-shopping' },
            ...(resourceNeedPrototype ? [{ id: 'assign-direct' as const, text: 'Tillsätt direkt', icon: 'robot', beginGroup: true }] : []),
            { id: 'show-details', text: 'Visa passdetaljer', icon: 'circle-info', beginGroup: true },
          ];
        } else {
          actions = getContextActions(ctxRef.current.type, resourceNeedPrototype, isAssigned);
        }
        if (ctxRef.current.dateStr < TODAY_STR) {
          actions = actions.map(action => ({ ...action, disabled: action.id !== 'show-details' }));
        }
        setContextActions(actions);
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
      const hospitalDepartment = HOSPITAL_ORGANISATION.departments[Math.floor(index / 10) % HOSPITAL_ORGANISATION.departments.length];
      const hospitalTeamIndex = Math.floor((index % 10) / 5);
      const hospitalTeam = HOSPITAL_ORGANISATION.teams[hospitalTeamIndex];
      const hospitalTeamId = `${hospitalDepartment.id}-team-${hospitalTeamIndex + 1}`;
      return {
        id:         p.id,
        name:       fullName(p),
        role:       (alwaysShowResourceNeeds ? HOSPITAL_ROLES[index % HOSPITAL_ROLES.length] : selectedOrganisation === 'clinic' ? CARE_ROLES[index] : PRESCHOOL_ROLES[index]) ?? emp?.position.title ?? '—',
        // Keep the displayed workplace aligned with the organisation tree below.
        // The seed data contains legacy HR/test departments that should not be
        // shown as the employee's current workplace in this prototype.
        organisation: alwaysShowResourceNeeds
          ? `${hospitalTeam}, ${hospitalDepartment.label}, ${HOSPITAL_ORGANISATION.label}`
          : selectedOrganisation === 'clinic'
          ? `Team ${teamIndex + 1}, ${departmentLabel}, ${ORGANISATION.clinic.label}`
          : `${departmentLabel}, ${organisationLabel}`,
        department: alwaysShowResourceNeeds ? hospitalDepartment.label : departmentLabel ?? emp?.organization.department ?? '—',
        ...(alwaysShowResourceNeeds ? { team: hospitalTeam, teamId: hospitalTeamId } : {}),
        fmgGroup:   emp?.fmgGroup ?? '—',
      };
    }),
  [alwaysShowResourceNeeds, selectedOrganisation]);

  const getScheduleShift = useCallback((personId: string, date: Date, passFilter: string): Shift | null => {
    if (alwaysShowResourceNeeds) {
      const key = `${personId}|${toDateStr(date)}`;
      if (RUNTIME_ABSENCE_SHIFTS[key] || RUNTIME_SHIFT_OVERRIDES[key]) return getCellShift(personId, date, passFilter);
      const employeeIndex = employees.findIndex(employee => employee.id === personId);
      if (employeeIndex < 0) return null;
      const weekday = dayIdx(date);
      const restStart = (employeeIndex * 3) % 7;
      if (weekday === restStart || weekday === (restStart + 1) % 7) return null;
      const shiftTypes: ShiftType[] = ['morning', 'day', 'evening', 'night'];
      const shiftType = shiftTypes[employeeIndex % shiftTypes.length];
      if (passFilter !== 'alla' && shiftType !== PASS_TO_SHIFT[passFilter]) return null;
      return { type: shiftType, ...SHIFT_DEFS[shiftType] };
    }
    if (isSchoolScenario(selectedOrganisation)) {
      if (isWknd(date) || (passFilter !== 'alla' && PASS_TO_SHIFT[passFilter] !== 'day')) return null;
      if (selectedOrganisation === 'schoolTimeline') {
        return getPreschoolDayPattern(persons.findIndex(person => person.id === personId), date)?.shift ?? null;
      }
      return { type: 'day', start: '07:00', end: '17:00' };
    }
    return getCellShift(personId, date, passFilter);
  }, [alwaysShowResourceNeeds, employees, persons, selectedOrganisation]);
  const getCellActivities = useCallback((personId: string, date: Date) => {
    if (alwaysShowResourceNeeds) {
      const shift = getScheduleShift(personId, date, 'alla');
      return shift ? getHospitalActivities(personId, date, shift) : [];
    }
    if (!isActivityTimelineScenario) return [];
    return getPreschoolActivities(personId, persons.findIndex(person => person.id === personId), date);
  }, [alwaysShowResourceNeeds, getScheduleShift, isActivityTimelineScenario, persons]);
  useEffect(() => {
    if (!resourceNeedPrototype) return;
    const seededNeedKeys = Object.entries(RUNTIME_ABSENCE_REASONS)
      .filter(([, reason]) => reason === 'Sjuk')
      .map(([key]) => key);
    const replacedNeedKeys = new Set(REPLACED_PAST_PRESCHOOL_ABSENCE_KEYS);
    const replacedNeedIds = new Set(REPLACED_PAST_PRESCHOOL_ABSENCE_KEYS.map(key => `resource-need-${key}`));
    setVacancyKeys(current => Array.from(new Set([
      ...current.filter(key => !replacedNeedKeys.has(key)),
      ...seededNeedKeys,
    ])));
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
          activities: getCellActivities(personId, parseDate(dateStr)),
          reason,
          source: 'frånvaro' as const,
          status: 'Öppet' as const,
          createdBy: 'Systemet',
          handledBy: 'Lena Sjöberg',
        };
      })
      .filter(Boolean) as ResourceNeed[];
    setResourceNeeds(current => {
      const next = new Map<string, ResourceNeed>();
      current.filter(need => !replacedNeedIds.has(need.id)).forEach(need => next.set(need.id, need));
      seededNeeds.forEach(need => { if (!next.has(need.id)) next.set(need.id, need); });
      return [...next.values()];
    });
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
  }, [employees, getCellActivities, getScheduleShift, resourceNeedPrototype]);

  useEffect(() => {
    if (!alwaysShowResourceNeeds || !resourceNeedPrototype || sampleMessagesSeededRef.current || resourceNeeds.length === 0) return;
    const firstEmployee = employees[0];
    const secondEmployee = employees[1];
    const passEmployee = employees[3];
    const firstNeed = firstEmployee && resourceNeeds.find(need => need.personId === firstEmployee.id && need.dateStr === TODAY_STR);
    const secondNeed = secondEmployee && resourceNeeds.find(need => need.personId === secondEmployee.id && need.dateStr === TODAY_STR);
    if (!firstEmployee || !secondEmployee || !passEmployee || !firstNeed || !secondNeed) return;

    const firstOrderId = `resource-order-${firstNeed.id}`;
    const secondOrderId = `resource-order-${secondNeed.id}`;
    const sampleMessageId = Date.now() + 5000;
    const firstOrder: ResourceOrder = {
      id: firstOrderId,
      personId: firstNeed.personId,
      personName: firstNeed.personName,
      role: firstNeed.role,
      dateStr: firstNeed.dateStr,
      shift: firstNeed.shift,
      resourceType: 'vikarie',
      status: 'Beställd',
      orderedBy: 'Maja Andersson',
      handledBy: 'Lena Sjöberg',
      invitedSubstitutes: [],
    };
    const secondOrder: ResourceOrder = {
      id: secondOrderId,
      personId: secondNeed.personId,
      personName: secondNeed.personName,
      role: secondNeed.role,
      dateStr: secondNeed.dateStr,
      shift: secondNeed.shift,
      resourceType: 'vikarie',
      status: 'Under behandling',
      orderedBy: 'Maja Andersson',
      handledBy: 'Lena Sjöberg',
      invitedSubstitutes: [],
    };
    const personMessage: CaseActivity = {
      id: sampleMessageId + 1, type: 'message', author: 'Lena Sjöberg', initials: 'LS', time: 'Idag 08:42',
      text: 'Jag har stämt av med avdelningen. De behöver täckning för hela dagens pass.',
    };
    const passMessage: CaseActivity = {
      id: sampleMessageId + 2, type: 'message', author: 'Oskar Pettersson', initials: initialsFromName('Oskar Pettersson'), time: 'Idag 09:05',
      text: 'Vakansen gäller hela passet. Rapporten behöver lämnas över vid 14:30.',
    };
    const firstNeedMessage: CaseActivity = {
      id: sampleMessageId + 3, type: 'message', author: 'Maja Andersson', initials: 'MA', time: 'Idag 09:18',
      text: 'Kan ni prioritera en ersättare med erfarenhet från akutvården?',
    };
    const secondNeedMessage: CaseActivity = {
      id: sampleMessageId + 4, type: 'message', author: 'Lena Sjöberg', initials: 'LS', time: 'Idag 09:26',
      text: 'Vi kontrollerar tillgängligheten och återkommer så snart vi har ett förslag.',
    };
    const firstOrderMessage: CaseActivity = {
      id: sampleMessageId + 5, type: 'message', author: 'Lena Sjöberg', initials: 'LS', time: 'Idag 09:20',
      text: 'Beställningen är mottagen. Vi söker en vikarie med rätt kompetens.',
    };
    const secondOrderMessage: CaseActivity = {
      id: sampleMessageId + 6, type: 'message', author: 'Maja Andersson', initials: 'MA', time: 'Idag 09:31',
      text: 'Tack. Meddela mig när ni har en kandidat att föreslå.',
    };

    sampleMessagesSeededRef.current = true;
    setResourceOrders(current => {
      const existingIds = new Set(current.map(order => order.id));
      return [
        ...current,
        ...[firstOrder, secondOrder].filter(order => !existingIds.has(order.id)),
      ];
    });
    setResourceNeeds(current => current.map(need => need.id === firstNeed.id
      ? { ...need, workflowStatus: 'Beställd' }
      : need.id === secondNeed.id
        ? { ...need, workflowStatus: 'Under behandling' }
        : need));
    setPersonActivities(current => ({
      ...current,
      [firstEmployee.id]: [...(current[firstEmployee.id] ?? []), personMessage],
    }));
    setPassActivities(current => ({
      ...current,
      [`${passEmployee.id}|${TODAY_STR}`]: [...(current[`${passEmployee.id}|${TODAY_STR}`] ?? []), passMessage],
    }));
    setResourceNeedActivities(current => ({
      ...current,
      [firstNeed.id]: [...(current[firstNeed.id] ?? []), firstNeedMessage],
      [secondNeed.id]: [...(current[secondNeed.id] ?? []), secondNeedMessage],
    }));
    setOrderActivities(current => ({
      ...current,
      [firstOrderId]: [...(current[firstOrderId] ?? []), firstOrderMessage],
      [secondOrderId]: [...(current[secondOrderId] ?? []), secondOrderMessage],
    }));
    setUnreadMessageEntities(current => new Set([
      ...current,
      `person:${firstEmployee.id}`,
      `pass:${passEmployee.id}|${TODAY_STR}`,
      `pass:${firstNeed.personId}|${firstNeed.dateStr}`,
      `pass:${secondNeed.personId}|${secondNeed.dateStr}`,
      `person:${firstNeed.personId}`,
      `person:${secondNeed.personId}`,
      `need:${firstNeed.id}`,
      `need:${secondNeed.id}`,
      `order:${firstOrderId}`,
      `order:${secondOrderId}`,
    ]));
  }, [alwaysShowResourceNeeds, employees, resourceNeedPrototype, resourceNeeds]);

  const columns  = useMemo(() => getColumns(viewStart, period).filter(column =>
    alwaysShowResourceNeeds || !isSchoolScenario(selectedOrganisation)
      || period === 'ar'
      || period === 'vecka'
      || period === 'sjuDagar'
      || !isWknd(column.date),
  ), [alwaysShowResourceNeeds, viewStart, period, selectedOrganisation]);
  useEffect(() => {
    if (alwaysShowResourceNeeds || !isSchoolScenario(selectedOrganisation) || period !== 'dag' || !isWknd(viewStart)) return;
    setViewStart(current => addDays(current, current.getDay() === 6 ? 2 : 1));
  }, [alwaysShowResourceNeeds, period, selectedOrganisation, viewStart]);
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
  const viewColumnWidth = hasActivityTimeline && viewType === 'month-columns' ? 130 : VIEW_COLUMN_WIDTH[viewType];
  const scheduleTableMinWidth = EMPLOYEE_COLUMN_WIDTH + viewColumnWidth * columns.length;
  const scenarioSubstituteCandidates = useMemo(() => alwaysShowResourceNeeds
    ? SUBSTITUTE_CANDIDATES.map(candidate => ({
        ...candidate,
        competencies: [...new Set([
          ...getEmployeeCompetencies(candidate.role),
          'Patientsäkerhet',
          ...(candidate.competencies ?? SUB_DETAILS[candidate.id]?.competencies ?? []),
        ])],
      }))
    : isSchoolScenario(selectedOrganisation)
      ? SUBSTITUTE_CANDIDATES.map(candidate => ({ ...candidate, ...PRESCHOOL_SUBSTITUTE_PROFILES[candidate.id] }))
      : SUBSTITUTE_CANDIDATES.map(candidate => SUB_DETAILS[candidate.id] ? candidate : ({
          ...candidate,
          competencies: candidate.role === 'Sjuksköterska'
            ? ['Omvårdnad', 'Läkemedelshantering', 'Dokumentation']
            : ['Basal omvårdnad', 'Förflyttning', 'Dokumentation'],
        })),
  [alwaysShowResourceNeeds, selectedOrganisation]);
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
  const candidateTargetCompetencies = useMemo(() => {
    if (!alwaysShowResourceNeeds || !subPanelState) return [];
    if (!isActivityTimelineScenario) {
      const employee = employees.find(item => item.id === subPanelState.personId);
      return employee ? [...new Set([...getEmployeeCompetencies(employee.role), 'Patientsäkerhet'])] : [];
    }
    const activities = getCellActivities(subPanelState.personId, parseDate(subPanelState.dateStr));
    const targetActivity = subPanelState.targetActivityId
      ? activities.find(activity => activity.id === subPanelState.targetActivityId)
      : undefined;
    const relevantActivities = targetActivity ? [targetActivity] : activities;
    const competencyByActivity: Record<ActivityKind, string[]> = {
      pedagogical: ['Lek och lärande', 'Lpfö 18', 'Pedagogisk dokumentation'],
      outdoors: ['Utevistelse', 'Barnsäkerhet', 'Första hjälpen'],
      meals: ['Måltider', 'Barnsäkerhet'],
      rest: ['NPF-stöd', 'Barnsäkerhet'],
    };
    return [...new Set(relevantActivities.flatMap(activity => competencyByActivity[activity.kind]))];
  }, [alwaysShowResourceNeeds, employees, getCellActivities, isActivityTimelineScenario, subPanelState]);
  const candidatePanelTargetUnitId = useMemo(() => {
    if (!alwaysShowResourceNeeds || !subPanelState) return undefined;
    const unitFromState = HOSPITAL_ORGANISATION.departments.find(department =>
      department.id === subPanelState.targetUnit || department.label === subPanelState.targetUnit,
    );
    if (unitFromState) return unitFromState.id;
    const targetEmployee = employees.find(employee => employee.id === subPanelState.personId);
    return HOSPITAL_ORGANISATION.departments.find(department => department.label === targetEmployee?.department)?.id;
  }, [alwaysShowResourceNeeds, employees, subPanelState]);
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
    const bookings: Record<string, SubBookedShift[]> = Object.fromEntries(
      Object.entries(SUB_BOOKED_SHIFTS).map(([candidateId, shifts]) => [candidateId, [...shifts]]),
    );
    const linkBookingToSchedule = (candidateId: string, booking: SubBookedShift): SubBookedShift => {
      if (booking.personId) return booking;
      const date = parseDate(booking.dateStr);
      const scheduledEmployees = employees.flatMap(employee => {
        const shift = getScheduleShift(employee.id, date, 'alla');
        return shift ? [{ employee, shift }] : [];
      });
      const matched = scheduledEmployees.find(item => item.shift.start === booking.start && item.shift.end === booking.end)
        ?? scheduledEmployees[(Number(candidateId.match(/\d+/)?.[0] ?? 1) - 1) % Math.max(scheduledEmployees.length, 1)];
      if (!matched) return booking;
      return {
        ...booking,
        personId: matched.employee.id,
        start: matched.shift.start,
        end: matched.shift.end,
        activities: booking.activities?.length ? booking.activities : getCellActivities(matched.employee.id, date),
      };
    };
    const linkUnmappedBookings = () => {
      Object.entries(bookings).forEach(([candidateId, shifts]) => {
        bookings[candidateId] = shifts.map(booking => linkBookingToSchedule(candidateId, booking));
      });
    };
    const addBooking = (candidateId: string | undefined, booking: SubBookedShift) => {
      if (!candidateId) return;
      const candidateBookings = bookings[candidateId] ?? (bookings[candidateId] = []);
      const existingIndex = candidateBookings.findIndex(existing =>
        existing.dateStr === booking.dateStr && existing.start === booking.start && existing.end === booking.end,
      );
      if (existingIndex >= 0) {
        const existing = candidateBookings[existingIndex];
        if ((!existing.activities || existing.activities.length === 0) && booking.activities?.length) {
          candidateBookings[existingIndex] = { ...existing, personId: existing.personId ?? booking.personId, activities: booking.activities };
        } else if (!existing.personId && booking.personId) {
          candidateBookings[existingIndex] = { ...existing, personId: booking.personId };
        }
        return;
      }
      candidateBookings.push(booking);
    };

    if (alwaysShowResourceNeeds) {
      const yesterday = toDateStr(addDays(parseDate(TODAY_STR), -1));
      addBooking('sub2', { dateStr: yesterday, start: '14:30', end: '22:30' });
      addBooking('sub5', { dateStr: yesterday, start: '22:00', end: '06:00' });
      fills.forEach(fill => {
        const shift = fill.shift ?? getScheduleShift(fill.personId, parseDate(fill.dateStr), 'alla');
        if (!shift || !fill.substituteId) return;
        addBooking(fill.substituteId, {
          dateStr: fill.dateStr,
          start: shift.start,
          end: shift.end,
          personId: fill.personId,
          activities: getCellActivities(fill.personId, parseDate(fill.dateStr)),
        });
      });
      resourceNeeds.forEach(need => {
        if (need.status !== 'Tillsatt' && need.workflowStatus !== 'Tillsatt') return;
        addBooking(need.assignedSubstituteId, {
          dateStr: need.dateStr,
          start: need.shift.start,
          end: need.shift.end,
          personId: need.personId,
          activities: need.activities ?? getCellActivities(need.personId, parseDate(need.dateStr)),
        });
      });
      resourceOrders.forEach(order => {
        if (order.status !== 'Tillsatt' || !order.acceptedSubstituteId) return;
        const linkedNeed = order.id.startsWith('resource-order-')
          ? resourceNeeds.find(need => need.id === order.id.slice('resource-order-'.length))
          : undefined;
        addBooking(order.acceptedSubstituteId, {
          dateStr: order.dateStr,
          start: order.shift.start,
          end: order.shift.end,
          personId: order.personId,
          activities: linkedNeed?.activities ?? getCellActivities(order.personId, parseDate(order.dateStr)),
        });
      });
      Object.values(activityFills).forEach(fill => {
        const activity = employees
          .flatMap(employee => getCellActivities(employee.id, parseDate(fill.dateStr)))
          .find(item => item.id === fill.activityId);
        if (!activity) return;
        addBooking(fill.substituteId, {
          dateStr: fill.dateStr,
          start: fill.shift.start,
          end: fill.shift.end,
          personId: employees.find(employee => getCellActivities(employee.id, parseDate(fill.dateStr)).some(item => item.id === fill.activityId))?.id,
          activities: [activity],
        });
      });
      remainingPasses.forEach(pass => {
        if (!pass.assignedSubstituteId) return;
        addBooking(pass.assignedSubstituteId, {
          dateStr: pass.dateStr,
          start: pass.shift.start,
          end: pass.shift.end,
          personId: pass.id,
          activities: pass.activities,
        });
      });
      linkUnmappedBookings();
      return bookings;
    }
    if (!isActivityTimelineScenario) {
      linkUnmappedBookings();
      return bookings;
    }
    employees.forEach((employee, employeeIndex) => {
      const candidateId = internalCandidateId(employee.id);
      const scheduled = columns.flatMap(column => {
        if (!isWknd(column.date) && hasPoolDuty(employeeIndex, column.date)) return [];
        const shift = getScheduleShift(employee.id, column.date, 'alla');
        return shift ? [{
          dateStr: toDateStr(column.date),
          start: shift.start,
          end: shift.end,
          personId: employee.id,
          activities: getCellActivities(employee.id, column.date),
        }] : [];
      });
      bookings[candidateId] = scheduled;
    });
    fills.forEach(fill => {
      const candidateId = fill.substituteId;
      const shift = fill.shift ?? getScheduleShift(fill.personId, parseDate(fill.dateStr), 'alla');
      if (!candidateId || !shift) return;
      addBooking(candidateId, {
        dateStr: fill.dateStr,
        start: shift.start,
        end: shift.end,
        personId: fill.personId,
        activities: getCellActivities(fill.personId, parseDate(fill.dateStr)),
      });
    });
    Object.values(activityFills).forEach(fill => {
      const activity = employees
        .flatMap(employee => getCellActivities(employee.id, parseDate(fill.dateStr)))
        .find(item => item.id === fill.activityId);
      addBooking(fill.substituteId, {
        dateStr: fill.dateStr,
        start: fill.shift.start,
        end: fill.shift.end,
        personId: employees.find(employee => getCellActivities(employee.id, parseDate(fill.dateStr)).some(item => item.id === fill.activityId))?.id,
        activities: activity ? [activity] : undefined,
      });
    });
    remainingPasses.forEach(pass => {
      if (!pass.assignedSubstituteId) return;
      addBooking(pass.assignedSubstituteId, {
        dateStr: pass.dateStr,
        start: pass.shift.start,
        end: pass.shift.end,
        personId: pass.id,
        activities: pass.activities,
      });
    });
    linkUnmappedBookings();
    return bookings;
  }, [activityFills, alwaysShowResourceNeeds, columns, employees, fills, getCellActivities, getScheduleShift, isActivityTimelineScenario, remainingPasses, resourceNeeds, resourceOrders]);

  const isCandidateBookingRelatedToSchedule = (personId: string, dateStr: string) => {
    if (highlightedCandidateId) {
      return (candidateBookings[highlightedCandidateId] ?? []).some(booking => booking.personId === personId && booking.dateStr === dateStr);
    }
    return highlightedPersonId === personId;
  };
  const relatedNeedIds = resourceNeeds.filter(need => {
    if (highlightedCandidateId) return isCandidateBookingRelatedToSchedule(need.personId, need.dateStr);
    if (highlightedPersonId) return need.personId === highlightedPersonId;
    return highlightedScheduleObject?.personId === need.personId && highlightedScheduleObject.dateStr === need.dateStr;
  }).map(need => need.id);
  const relatedOrderIds = resourceOrders.filter(order => {
    if (highlightedCandidateId) return isCandidateBookingRelatedToSchedule(order.personId, order.dateStr);
    if (highlightedPersonId) return order.personId === highlightedPersonId;
    return highlightedScheduleObject?.personId === order.personId && highlightedScheduleObject.dateStr === order.dateStr;
  }).map(order => order.id);
  const relatedCandidateBookingKeys = Object.entries(candidateBookings).flatMap(([candidateId, bookings]) => bookings
    .filter(booking => highlightedCandidateId
      ? candidateId === highlightedCandidateId
      : highlightedPersonId
        ? booking.personId === highlightedPersonId
        : highlightedScheduleObject?.personId === booking.personId && highlightedScheduleObject.dateStr === booking.dateStr)
    .map(booking => `${candidateId}|${booking.dateStr}`));
  const relatedCandidateIds = [...new Set(relatedCandidateBookingKeys.map(key => key.split('|')[0]))];

  const personDetailEmployee = personDetailId
    ? employees.find(employee => employee.id === personDetailId) ?? null
    : null;
  const personDetailShiftDates = useMemo(() => {
    if (!personDetailEmployee) return [];
    return getPeriodDates(viewStart, period, columns)
      .filter(date => Boolean(getScheduleShift(personDetailEmployee.id, date, 'alla')))
      .map(toDateStr);
  }, [absenceVersion, columns, getScheduleShift, period, personDetailEmployee, viewStart]);
  useEffect(() => {
    if (!personDetailEmployee) {
      setPersonDetailDate('');
      return;
    }
    setPersonDetailDate(current => personDetailShiftDates.includes(current) ? current : personDetailShiftDates[0] ?? '');
  }, [personDetailEmployee?.id, personDetailShiftDates]);
  const personDetailSchedules = useMemo<Record<string, EmployeeDaySchedule> | undefined>(() => {
    if (!personDetailEmployee || !hasActivityTimeline) return undefined;
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
  }, [columns, getCellActivities, getScheduleShift, hasActivityTimeline, period, personDetailEmployee, viewStart]);
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
  const passDetailOrder = detailState
    ? resourceOrders.find(order => order.personId === detailState.empId && order.dateStr === detailState.dateStr && order.status !== 'Avbruten')
    : undefined;
  const passDetailAssignedSubstituteId = passDetailAssignedFill?.substituteId
    ?? passDetailRemainingPass?.assignedSubstituteId
    ?? passDetailResourceNeed?.assignedSubstituteId
    ?? passDetailOrder?.acceptedSubstituteId;
  const passDetailAssignedCandidate = passDetailAssignedSubstituteId
    ? panelCandidates.find(candidate => candidate.id === passDetailAssignedSubstituteId)
    : undefined;
  const passDetailAssignedPersonSource = passDetailAssignedFill?.person
    ?? (passDetailRemainingPass?.assignedSubstituteId
      ? {
          name: passDetailRemainingPass.assignedSubstituteName ?? passDetailAssignedCandidate?.name ?? 'Vikarie',
          role: passDetailAssignedCandidate?.role ?? 'Vikarie',
        }
      : undefined)
    ?? (passDetailResourceNeed?.assignedSubstituteId
      ? {
          name: passDetailResourceNeed.assignedSubstituteName ?? passDetailAssignedCandidate?.name ?? 'Vikarie',
          role: passDetailAssignedCandidate?.role ?? 'Vikarie',
        }
      : undefined)
    ?? (passDetailOrder?.acceptedSubstituteId
      ? { name: passDetailAssignedCandidate?.name ?? 'Vikarie', role: passDetailAssignedCandidate?.role ?? 'Vikarie' }
      : undefined);
  const passDetailAssignedPerson = passDetailAssignedPersonSource
    ? { ...passDetailAssignedPersonSource, substituteId: passDetailAssignedSubstituteId }
    : undefined;
  const passDetailStatusLabel = !detailState ? undefined
    : passDetailAssignmentFailure ? 'Kunde inte tillsättas'
      : passDetailResourceNeedOrder?.status ?? passDetailResourceNeed?.workflowStatus ?? passDetailResourceNeed?.status
        ?? (detailState.color === 'vacant'
          ? isAkutShift(detailState.empId, detailState.dateStr, selectedOrganisation) ? 'Akut vakans' : 'Vakans'
          : detailState.color === 'absence' ? 'Frånvaro'
            : detailState.color === 'filled' ? 'Tillsatt'
              : detailState.color === 'ordered' ? 'Beställd'
                : detailState.color === 'past' ? 'Historiskt pass' : 'Planerat');
  const passDetailStatusTone = passDetailStatusLabel === 'Tillsatt' ? 'positive'
    : passDetailStatusLabel === 'Frånvaro' || passDetailStatusLabel === 'Kunde inte tillsättas' ? 'negative'
      : passDetailStatusLabel?.includes('Vakans') || passDetailStatusLabel === 'Öppet' ? 'warning' : 'neutral';
  const passDetailSchedule = useMemo<EmployeeDaySchedule | undefined>(() => {
    if (!detailState || !hasActivityTimeline) return undefined;
    return {
      dateStr: detailState.dateStr,
      shift: detailState.shift,
      activities: passDetailRemainingPass?.activities ?? getCellActivities(detailState.empId, parseDate(detailState.dateStr)),
      absenceLabel: passDetailRemainingPass ? (passDetailRemainingPass.assignedSubstituteId ? undefined : 'Vakans') : getAbsenceCaption(detailState.empId, detailState.dateStr),
    };
  }, [detailState, getCellActivities, hasActivityTimeline, passDetailRemainingPass]);
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
    const personId = personDetailEmployee.id;
    const relatedMessageActivities = [
      ...resourceOrders.filter(order => order.personId === personId).flatMap(order => orderActivities[order.id] ?? []),
      ...resourceNeeds.filter(need => need.personId === personId).flatMap(need => resourceNeedActivities[need.id] ?? []),
      ...Object.entries(passActivities).filter(([key]) => key.startsWith(`${personId}|`)).flatMap(([, activities]) => activities),
    ].filter(activity => activity.type === 'message');
    const visibleActivities = [...new Map<string, CaseActivity>([
      ...(personActivities[personId] ?? []),
      ...relatedMessageActivities,
    ].map(activity => [`${activity.id}:${activity.author}:${activity.text}`, activity] as const)).values()];
    return [{
      id: -1,
      type: 'system',
      author: 'Systemet',
      initials: 'S',
      time: 'Aktuell uppgift',
      text: 'Aktiv i schemat',
      detail: `${personDetailEmployee.role} · ${personDetailEmployee.organisation}`,
    }, ...visibleActivities];
  }, [orderActivities, passActivities, personActivities, personDetailEmployee, resourceNeedActivities, resourceNeeds, resourceOrders]);
  const resourceNeedDetailOrder = resourceNeedDetail
    ? resourceOrders.find(order => order.id === `resource-order-${resourceNeedDetail.id}`)
    : undefined;
  const resourceNeedDetailActivities = useMemo<CaseActivity[]>(() => {
    if (!resourceNeedDetail) return [];
    return [
      ...(resourceNeedActivities[resourceNeedDetail.id] ?? []),
      ...(resourceNeedDetailOrder ? (orderActivities[resourceNeedDetailOrder.id] ?? []).filter(activity => activity.type === 'message') : []),
    ].sort((a, b) => a.id - b.id);
  }, [orderActivities, resourceNeedActivities, resourceNeedDetail, resourceNeedDetailOrder]);
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
  const substituteDetailAbsence = substituteDetailKey ? substituteAbsences[substituteDetailKey] : undefined;
  const substituteDetailStatusLabel = substituteDetailAbsence
    ?? (substituteDetailBooking
      ? `Bokad ${substituteDetailBooking.start}–${substituteDetailBooking.end}`
      : substituteDetailAvailability
        ? `Tillgänglig ${fmtAvailTime(substituteDetailAvailability)}`
        : 'Ej tillgänglig');
  const substituteDetailStatusTone = substituteDetailAbsence ? 'negative'
    : substituteDetailBooking || substituteDetailAvailability ? 'positive' : 'neutral';
  const substituteDetailActivities = useMemo<CaseActivity[]>(() => {
    if (!substituteDetail || !substituteDetailInfo) return [];
    return [{
      id: -1,
      type: 'system',
      author: 'Systemet',
      initials: 'S',
      time: 'Aktuell uppgift',
      text: 'Tillgänglig som vikarie',
      detail: `${substituteDetail.role} · ${substituteDetail.category}${candidateHoursSummary(substituteDetail, substituteDetailInfo) ? ` · ${candidateHoursSummary(substituteDetail, substituteDetailInfo)}` : ''}`,
    }, ...(substituteActivities[substituteDetail.id] ?? [])];
  }, [substituteActivities, substituteDetail, substituteDetailInfo]);

  useEffect(() => {
    if (!orderDetail) return;
    const keys = [`order:${orderDetail.id}`, `pass:${orderDetail.personId}|${orderDetail.dateStr}`, `person:${orderDetail.personId}`];
    if (orderDetail.id.startsWith('resource-order-')) keys.push(`need:${orderDetail.id.slice('resource-order-'.length)}`);
    markMessageEntitiesRead(keys);
  }, [markMessageEntitiesRead, orderDetail?.dateStr, orderDetail?.id, orderDetail?.personId, orderActivities]);

  useEffect(() => {
    if (!resourceNeedDetail) return;
    const order = resourceOrders.find(item => item.id === `resource-order-${resourceNeedDetail.id}`);
    const keys = [`need:${resourceNeedDetail.id}`];
    if (order) keys.push(`order:${order.id}`, `pass:${order.personId}|${order.dateStr}`, `person:${order.personId}`);
    markMessageEntitiesRead(keys);
  }, [markMessageEntitiesRead, orderActivities, resourceNeedActivities, resourceNeedDetail?.id, resourceOrders]);

  useEffect(() => {
    if (!detailState) return;
    const passKey = `${detailState.empId}|${detailState.dateStr}`;
    const keys = [`pass:${passKey}`, `person:${detailState.empId}`];
    const need = resourceNeeds.find(item => item.personId === detailState.empId && item.dateStr === detailState.dateStr && item.status !== 'Borttaget');
    const order = resourceOrders.find(item => item.personId === detailState.empId && item.dateStr === detailState.dateStr);
    if (need) keys.push(`need:${need.id}`);
    if (order) keys.push(`order:${order.id}`);
    markMessageEntitiesRead(keys);
  }, [detailState?.dateStr, detailState?.empId, markMessageEntitiesRead, orderActivities, passActivities, resourceNeedActivities, resourceNeeds, resourceOrders]);

  useEffect(() => {
    if (!personDetailEmployee) return;
    const personId = personDetailEmployee.id;
    const keys = [`person:${personId}`];
    resourceOrders.filter(order => order.personId === personId).forEach(order => {
      keys.push(`order:${order.id}`, `pass:${personId}|${order.dateStr}`);
      if (order.id.startsWith('resource-order-')) keys.push(`need:${order.id.slice('resource-order-'.length)}`);
    });
    resourceNeeds.filter(need => need.personId === personId).forEach(need => keys.push(`need:${need.id}`, `pass:${personId}|${need.dateStr}`));
    Object.keys(passActivities).filter(key => key.startsWith(`${personId}|`)).forEach(key => keys.push(`pass:${key}`));
    markMessageEntitiesRead(keys);
  }, [markMessageEntitiesRead, orderActivities, passActivities, personDetailEmployee?.id, personActivities, resourceNeedActivities, resourceNeeds, resourceOrders]);

  useEffect(() => {
    if (substituteDetailState) markMessageEntitiesRead([`substitute:${substituteDetailState.substituteId}`]);
  }, [markMessageEntitiesRead, substituteActivities, substituteDetailState?.substituteId]);

  const filteredEmployees = useMemo(() => {
    let list = employees;
    if (selectedGroups.length > 0 && !selectedGroups.includes('alla')) {
      if (alwaysShowResourceNeeds) {
        const selectedDepartments = selectedGroups.filter(id => id.startsWith('hospital:department:')).map(id => id.slice('hospital:department:'.length));
        const selectedTeams = selectedGroups.filter(id => id.startsWith('hospital:team:')).map(id => id.slice('hospital:team:'.length));
        const selectedRoles = selectedGroups.filter(id => id.startsWith('hospital:role:')).map(id => id.slice('hospital:role:'.length));
        const selectedOrganisation = selectedGroups.includes('hospital:org');
        list = list.filter(employee =>
          (!selectedOrganisation || employee.organisation.includes(HOSPITAL_ORGANISATION.label))
          && (selectedDepartments.length === 0 || selectedDepartments.includes(HOSPITAL_ORGANISATION.departments.find(department => department.label === employee.department)?.id ?? ''))
          && (selectedTeams.length === 0 || (employee.teamId && selectedTeams.includes(employee.teamId)))
          && (selectedRoles.length === 0 || selectedRoles.includes(employee.role)),
        );
      } else {
        list = list.filter(e => selectedGroups.some(gid => {
          if (gid === 'samverkanspass') {
            const employeeIndex = employees.findIndex(employee => employee.id === e.id);
            return columns.some(column => hasPoolDuty(employeeIndex, column.date));
          }
          return matchGroup(e, gid);
        }));
      }
    }
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
  }, [alwaysShowResourceNeeds, employees, selectedGroups, textFilter, showVacancies, columns, fills, vacancyKeys, resourceNeedPrototype, resourceNeeds]);

  const availablePassTypes = useMemo(() => {
    if (!alwaysShowResourceNeeds) return PASS_TYPES.filter(pass => pass.id !== 'alla').map(pass => pass.id);
    return [...new Set(filteredEmployees.flatMap(employee => columns.flatMap(column => {
      const shift = getScheduleShift(employee.id, column.date, 'alla');
      return shift ? [Object.entries(PASS_TO_SHIFT).find(([, type]) => type === shift.type)?.[0]].filter((id): id is string => Boolean(id)) : [];
    })))];
  }, [alwaysShowResourceNeeds, columns, filteredEmployees, getScheduleShift]);
  const passTypeOptions = useMemo(() => {
    const visibleTypes = isSchoolScenario(selectedOrganisation)
      ? availablePassTypes.filter(id => id === 'dag')
      : availablePassTypes;
    return PASS_TYPES.filter(pass => pass.id === 'alla' || visibleTypes.includes(pass.id));
  }, [availablePassTypes, selectedOrganisation]);
  const showPassTypeFilter = !alwaysShowResourceNeeds || availablePassTypes.length > 1;
  useEffect(() => {
    if (alwaysShowResourceNeeds && selectedPass !== 'alla' && !availablePassTypes.includes(selectedPass)) {
      setSelectedPass('alla');
    }
  }, [alwaysShowResourceNeeds, availablePassTypes, selectedPass]);

  const positiveResponseCount = resourceOrders.reduce((count, order) => {
    if (order.status === 'Tillsatt' || order.status === 'Avbruten') return count;
    return count + order.invitedSubstitutes.filter(invite => invite.response === 'Tillgänglig').length;
  }, 0);

  const availableGroups = useMemo(() => {
    if (alwaysShowResourceNeeds) {
      const hospitalRoles = [...new Set<string>(employees.map(employee => employee.role))].sort((a, b) => a.localeCompare(b, 'sv'));
      return [
        { id: 'alla', label: 'Alla medarbetare', category: 'team' as const },
        { id: 'hospital:org', label: `Sjukhus · ${HOSPITAL_ORGANISATION.label}`, category: 'team' as const },
        ...HOSPITAL_ORGANISATION.departments.flatMap(department => [
          { id: `hospital:department:${department.id}`, label: `Avdelning · ${department.label}`, category: 'department' as const },
          ...HOSPITAL_ORGANISATION.teams.map((team, teamIndex) => ({
            id: `hospital:team:${department.id}-team-${teamIndex + 1}`,
            label: `${department.label} · ${team}`,
            category: 'team' as const,
          })),
        ]),
        ...hospitalRoles.map(role => ({ id: `hospital:role:${role}`, label: `Yrkesroll · ${role}`, category: 'role' as const })),
      ];
    }
    return [
      { id:'alla', label:'Alla medarbetare', category:'team' as const },
      ...ALL_GROUPS.filter(g => g.id !== 'alla' && (!isSchoolScenario(selectedOrganisation) || g.category !== 'team')),
    ];
  }, [alwaysShowResourceNeeds, employees, selectedOrganisation]);

  // Each activity is a real staffing focus beneath a team, rather than a shift or absence.
  const organisationGroups = useMemo(() => {
    const ids = filteredEmployees.map(employee => employee.id);
    const visibleIds = new Set(ids);
    const members = (start: number, end: number) => employees.slice(start, end).map(employee => employee.id).filter(id => visibleIds.has(id));
    const root = alwaysShowResourceNeeds
      ? { id: HOSPITAL_ORGANISATION.id, label: HOSPITAL_ORGANISATION.label }
      : selectedOrganisation === 'clinic' ? ORGANISATION.clinic : SCHOOL_ORGANISATION;
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
    if (alwaysShowResourceNeeds) {
      HOSPITAL_ORGANISATION.departments.forEach(department => {
        const departmentIds = employees
          .filter(employee => employee.department === department.label)
          .map(employee => employee.id)
          .filter(id => visibleIds.has(id));
        result.push({ id: department.id, label: department.label, kind: 'department', parentId: root.id, personIds: departmentIds, depth: 1 });
        HOSPITAL_ORGANISATION.teams.forEach((team, teamIndex) => {
          const teamId = `${department.id}-team-${teamIndex + 1}`;
          const teamIds = employees
            .filter(employee => employee.teamId === teamId)
            .map(employee => employee.id)
            .filter(id => visibleIds.has(id));
          result.push({ id: teamId, label: team, kind: 'team', parentId: department.id, personIds: teamIds, depth: 2 });
        });
      });
    } else if (selectedOrganisation === 'clinic') {
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
  }, [alwaysShowResourceNeeds, employees, filteredEmployees, isActivityTimelineScenario, selectedOrganisation]);

  const resourceBoardOrgOptions = useMemo<ResourceBoardOrgOption[]>(() => {
    const allPersonIds = employees.map(employee => employee.id);
    const options: ResourceBoardOrgOption[] = [];
    if (alwaysShowResourceNeeds) {
      options.push({ id: HOSPITAL_ORGANISATION.id, label: HOSPITAL_ORGANISATION.label, level: 'organisation', personIds: allPersonIds });
      HOSPITAL_ORGANISATION.departments.forEach(department => {
        const departmentEmployees = employees.filter(employee => employee.department === department.label);
        options.push({ id: department.id, label: department.label, level: 'department', personIds: departmentEmployees.map(employee => employee.id) });
        departmentEmployees.forEach(employee => {
          if (!employee.teamId || options.some(option => option.id === employee.teamId)) return;
          options.push({ id: employee.teamId, label: `${department.label} · ${employee.team}`, level: 'team', personIds: departmentEmployees.filter(teamMember => teamMember.teamId === employee.teamId).map(teamMember => teamMember.id) });
        });
      });
    } else if (selectedOrganisation === 'clinic') {
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
  }, [alwaysShowResourceNeeds, employees, selectedOrganisation]);
  const resourceBoardActivityKinds = useMemo<ActivityKind[]>(() =>
    hasActivityTimeline ? Object.keys(alwaysShowResourceNeeds ? HOSPITAL_ACTIVITY_TYPES : PRESCHOOL_ACTIVITY_TYPES) as ActivityKind[] : [],
  [alwaysShowResourceNeeds, hasActivityTimeline]);

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

  const renderPresenceCell = (personIds: string[], col: ViewColumn, passFilter = selectedPass) => {
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
          const shift = getScheduleShift(id, date, passFilter);
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
      if (getScheduleShift(id, col.date, passFilter)) {
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
          <ContextKebabButton className="schema-context-kebab-cell" targetSelector=".schema-org-label-cell" label={`Fler åtgärder för ${group.label}`} />
        </td>
        {columns.map((col, index) => {
          if (alwaysShowResourceNeeds) {
            return <td key={index} className={['schema-day-cell', 'schema-org-summary-cell', 'schema-hospital-organisation-empty', col.isWeekend ? 'schema-weekend-cell' : '', toDateStr(col.date) === TODAY_STR ? 'schema-today-col' : ''].filter(Boolean).join(' ')} aria-hidden="true" />;
          }
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
  const rootId = alwaysShowResourceNeeds
    ? HOSPITAL_ORGANISATION.id
    : selectedOrganisation === 'clinic' ? ORGANISATION.clinic.id : SCHOOL_ORGANISATION.id;
  const visibleRemainingPasses = isActivityTimelineScenario && viewType !== 'year-columns'
    ? remainingPasses.filter(pass => columns.some(column => toDateStr(column.date) === pass.dateStr))
    : [];
  if (alwaysShowResourceNeeds) {
    filteredEmployees.forEach(employee => scheduleRows.push({ type: 'employee', employee }));
    visibleRemainingPasses.forEach(pass => scheduleRows.push({ type: 'remaining-pass', pass }));
  }
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
  if (!alwaysShowResourceNeeds && rootGroup) appendGroup(rootGroup);
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
  const createResourceNeed = useCallback((personId: string, dateStr: string, shift: Shift, reason?: AbsenceReason, source: ResourceNeed['source'] = 'pass', markVacant = source !== 'pass') => {
    if (!resourceNeedPrototype) return;
    const employee = employees.find(item => item.id === personId);
    const remainingPass = remainingPasses.find(pass => pass.id === personId && pass.dateStr === dateStr);
    if (!employee && !remainingPass) return;
    const priorNeed = resourceNeeds.find(need => need.personId === personId && need.dateStr === dateStr);
    if (priorNeed && priorNeed.status !== 'Borttaget') return;
    const id = priorNeed?.id ?? `resource-need-${personId}|${dateStr}`;
    setResourceNeeds(current => {
      const existing = current.find(need => need.personId === personId && need.dateStr === dateStr);
      if (existing && existing.status !== 'Borttaget') return current;
      const next = current.filter(need => need.personId !== personId || need.dateStr !== dateStr);
      return [...next, {
        id,
        personId,
        personName: employee?.name ?? 'Pass kvar',
        role: employee?.role ?? 'Vikarie',
        dateStr,
        shift,
        activities: employee ? getCellActivities(personId, parseDate(dateStr)) : remainingPass?.activities,
        reason,
        source,
        status: 'Öppet' as const,
        createdBy: 'Du',
        handledBy: 'Lena Sjöberg',
      }];
    });
    if (markVacant) setVacancyKeys(previous => previous.includes(`${personId}|${dateStr}`) ? previous : [...previous, `${personId}|${dateStr}`]);
    addResourceNeedActivity(id, {
      type: 'status', author: 'Du', initials: 'JV', time: 'Just nu',
      text: 'Resursbehov skapades',
      detail: `${employee?.name ?? 'Pass kvar'} · ${dateStr} · ${shift.start}–${shift.end}${reason ? ` · ${reason}` : ''}`,
    });
  }, [addResourceNeedActivity, employees, getCellActivities, remainingPasses, resourceNeedPrototype, resourceNeeds]);

  useEffect(() => {
    if (!resourceNeedPrototype || !automation?.isAutomationActive || !automation.autoCreateNeeds) return;
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
  }, [automation?.isAutomationActive, automation?.autoCreateNeeds, createResourceNeed, getScheduleShift, resourceNeedPrototype, resourceNeeds]);

  const handleOpenVacancyPanel = useCallback((personId: string, dateStr: string, matchCandidates = false) => {
    const emp   = employees.find(e => e.id === personId);
    const shift = getScheduleShift(personId, parseDate(dateStr), 'alla');
    if (!shift) return;
    if (matchCandidates) focusPassForCandidates(personId, dateStr);
    setResourceNeedAssignmentId(null);
    setOrderAssignment(null);
    setSubPanelState({ personId, dateStr, shift, fillType:'substitute', targetPersonName: emp?.name ?? '', targetUnit: emp?.department, targetType: 'pass', targetRole: emp?.role, matchCandidates });
    setSubPanelBrowseAll(false);
    setSubPanelOpen(true);
  }, [employees, focusPassForCandidates, getScheduleShift]);

  const handleOpenRemainingPassPanel = useCallback((pass: RemainingPass, matchCandidates = false) => {
    if (matchCandidates) focusPassForCandidates(pass.id, pass.dateStr);
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
      matchCandidates,
    });
    setSubPanelBrowseAll(false);
    setSubPanelOpen(true);
    setDetailState(null);
  }, [focusPassForCandidates]);

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
    setPassToReveal(null);
    setSubPanelBrowseAll(false);
    setOrderAssignment(null);
    setResourceNeedAssignmentId(null);
  }, []);

  const handleOpenAllSubstitutes = useCallback(() => {
    if (subPanelOpen && subPanelBrowseAll) {
      handleCloseSubPanel();
      return;
    }
    setSubPanelState(null);
    setResourceNeedAssignmentId(null);
    setSubPanelBrowseAll(true);
    setSubPanelOpen(true);
  }, [handleCloseSubPanel, subPanelBrowseAll, subPanelOpen]);

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
    const employee = employees.find(item => item.id === order.personId);
    setOrderAssignment(order);
    setSubPanelState({
      personId: order.personId,
      dateStr: order.dateStr,
      shift: order.shift,
      fillType: order.resourceType === 'vikarie' ? 'substitute' : 'extra',
      targetPersonName: order.personName,
      targetUnit: employee?.department ?? order.role,
    });
    setSubPanelBrowseAll(false);
    setSubPanelOpen(true);
  }, [employees]);

  const handleOpenResourceNeedAssignment = useCallback((need: ResourceNeed, matchCandidates = false) => {
    if (matchCandidates) focusPassForCandidates(need.personId, need.dateStr);
    const employee = employees.find(item => item.id === need.personId);
    const remainingPass = remainingPasses.find(pass => pass.id === need.personId && pass.dateStr === need.dateStr);
    setResourceNeedAssignmentId(need.id);
    setSubPanelState({
      personId: need.personId,
      dateStr: need.dateStr,
      shift: need.shift,
      fillType: need.source === 'pass' ? 'extra' : 'substitute',
      targetPersonName: need.personName,
      targetUnit: employee?.department ?? remainingPass?.unit ?? need.role,
      targetRole: need.role,
      matchCandidates,
    });
    setSubPanelBrowseAll(false);
    setSubPanelOpen(true);
  }, [employees, focusPassForCandidates, remainingPasses]);

  const handleCreateResourceOrderForNeed = useCallback((need: ResourceNeed) => {
    setResourceNeedOrderTargetId(need.id);
    setResourceOrderDialogState({
      personId: need.personId,
      personName: need.personName,
      role: need.role,
      dateStr: need.dateStr,
      shift: need.shift,
      resourceType: need.source === 'pass' ? 'extrapass' : 'vikarie',
    });
  }, []);

  // ── Handlers: assign ──
  const openConfirm = useCallback((subs: SubstituteCandidate[], personId: string, dateStr: string, shift: Shift, fillType: 'substitute'|'extra', target?: Pick<SubPanelState, 'targetType'|'targetActivityId'|'targetActivityLabel'|'targetRemainingPassId'|'targetUnit'|'unitLocked'> & { directAssignment?: boolean }) => {
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

  const handleCreateCandidateRequest = useCallback((
    selectedCandidates: SubstituteCandidate[],
    personId: string,
    dateStr: string,
    shift: Shift,
    fillType: 'substitute' | 'extra',
    targetPersonName?: string,
    targetRole?: string,
    ensureResourceNeed = false,
  ) => {
    if (selectedCandidates.length === 0) return;
    const employee = employees.find(item => item.id === personId);
    const remainingPass = remainingPasses.find(pass => pass.id === personId && pass.dateStr === dateStr);
    const linkedNeed = resourceNeeds.find(need => need.personId === personId && need.dateStr === dateStr && need.status !== 'Borttaget');
    const shouldCreateNeed = !linkedNeed && Boolean(employee || remainingPass) && (ensureResourceNeed || fillType === 'substitute');
    if (shouldCreateNeed) createResourceNeed(personId, dateStr, shift, RUNTIME_ABSENCE_REASONS[`${personId}|${dateStr}`], RUNTIME_ABSENCE_SHIFTS[`${personId}|${dateStr}`] ? 'frånvaro' : remainingPass || fillType === 'substitute' ? 'vakans' : 'pass');
    const priorNeed = resourceNeeds.find(need => need.personId === personId && need.dateStr === dateStr);
    const needId = linkedNeed?.id ?? (shouldCreateNeed ? priorNeed?.id ?? `resource-need-${personId}|${dateStr}` : undefined);
    const resourceType: ResourceOrder['resourceType'] = fillType === 'extra' ? 'extrapass' : 'vikarie';
    const orderId = needId
      ? `resource-order-${needId}`
      : `candidate-request-${personId}-${dateStr}-${resourceType}-${Date.now()}`;
    const order: ResourceOrder = {
      id: orderId,
      personId,
      personName: targetPersonName ?? employee?.name ?? 'Pass kvar',
      role: targetRole ?? employee?.role ?? 'Förskola',
      dateStr,
      shift,
      resourceType,
      status: 'Förfrågan skickad',
      orderedBy: 'Du',
      handledBy: 'Lena Sjöberg',
      invitedSubstitutes: selectedCandidates.map(candidate => ({
        substituteId: candidate.id,
        name: candidate.name,
        role: candidate.role,
        response: 'Avvaktar',
      })),
    };
    setResourceOrders(current => current.some(existing => existing.id === orderId)
      ? current.map(existing => existing.id === orderId ? order : existing)
      : [...current, order]);
    if (needId) {
      updateLinkedNeedWorkflowStatus(orderId, 'Förfrågan skickad', order.handledBy);
      addResourceNeedActivity(needId, {
        type: 'status', author: 'Du', initials: 'JV', time: 'Just nu',
        text: 'Förfrågan skickad', detail: selectedCandidates.map(candidate => candidate.name).join(' · '),
      });
    }
    addOrderActivity(orderId, {
      type: 'status', author: 'Du', initials: 'JV', time: 'Just nu',
      text: resourceType === 'extrapass' ? 'Förfrågan om extrapass skickad' : 'Förfrågan om vikarie skickad',
      detail: `${order.personName} · ${dateStr} · ${shift.start}–${shift.end} · ${selectedCandidates.map(candidate => candidate.name).join(' · ')}`,
    });
    addPassActivity(`${personId}|${dateStr}`, {
      type: 'status', author: 'Du', initials: 'JV', time: 'Just nu',
      text: resourceType === 'extrapass' ? 'Förfrågan om extrapass skickad' : 'Förfrågan skickad',
      detail: selectedCandidates.map(candidate => candidate.name).join(' · '),
    });
    setResourceNeedAssignmentId(null);
    setSubPanelOpen(false);
  }, [addOrderActivity, addPassActivity, addResourceNeedActivity, createResourceNeed, employees, remainingPasses, resourceNeeds, updateLinkedNeedWorkflowStatus]);

  const handleDirectAssignFromPanel = useCallback((selectedIds: string[]) => {
    if (!subPanelState || selectedIds.length !== 1) return;
    const candidate = panelCandidates.find(item => item.id === selectedIds[0]);
    if (!candidate) return;
    const matchingNeed = subPanelState.fillType === 'substitute'
      ? resourceNeeds.find(need => need.personId === subPanelState.personId && need.dateStr === subPanelState.dateStr && need.status !== 'Borttaget')
      : undefined;
    setResourceNeedAssignmentId(matchingNeed?.id ?? null);
    openConfirm([candidate], subPanelState.personId, subPanelState.dateStr, subPanelState.shift, subPanelState.fillType, { ...subPanelState, directAssignment: true });
    setSubPanelOpen(false);
  }, [openConfirm, panelCandidates, resourceNeeds, subPanelState]);

  const handleSendRequest = useCallback((selectedIds: string[]) => {
    if (selectedIds.length === 0) return;
    const requestedIds = isActivityTimelineScenario && !alwaysShowResourceNeeds ? selectedIds.slice(0, 1) : selectedIds;
    const subs = panelCandidates.filter(s => requestedIds.includes(s.id));
    if (subs.length === 0) return;
    if (!subPanelState) {
      setOpenRequestState({ substitutes: subs, dateStr: toDateStr(columns[0]?.date ?? new Date(TODAY_STR)), shift: { type: 'day', ...SHIFT_DEFS.day }, role: subs[0]?.role ?? SUBSTITUTE_ROLES[0]?.id ?? '', unit: alwaysShowResourceNeeds ? HOSPITAL_ORGANISATION.unit : SUBSTITUTE_UNITS[0].label });
      setSubPanelOpen(false);
      return;
    }
    if (alwaysShowResourceNeeds) {
      const targetRole = employees.find(employee => employee.id === subPanelState.personId)?.role ?? subPanelState.targetUnit;
      handleCreateCandidateRequest(subs, subPanelState.personId, subPanelState.dateStr, subPanelState.shift, subPanelState.fillType, subPanelState.targetPersonName, targetRole);
      return;
    }
    openConfirm(subs, subPanelState.personId, subPanelState.dateStr, subPanelState.shift, subPanelState.fillType, subPanelState);
    setSubPanelOpen(false);
  }, [alwaysShowResourceNeeds, handleCreateCandidateRequest, subPanelState, openConfirm, columns, employees, isActivityTimelineScenario, panelCandidates]);

  const handleSendSubstituteRequest = useCallback((substituteId: string) => {
    setSubstituteDetailState(null);
    setReturnToSubstitutePanel(false);
    handleSendRequest([substituteId]);
  }, [handleSendRequest]);

  const handleConfirmOpenRequest = useCallback((dateStr: string, shift: Shift, role: string, unit: string) => {
    if (!openRequestState) return;
    if (alwaysShowResourceNeeds) {
      const orderId = `candidate-request-${dateStr}-${Date.now()}`;
      const order: ResourceOrder = {
        id: orderId,
        personId: `open-request-${orderId}`,
        personName: unit,
        role,
        dateStr,
        shift,
        resourceType: 'vikarie',
        status: 'Förfrågan skickad',
        orderedBy: 'Du',
        handledBy: 'Lena Sjöberg',
        invitedSubstitutes: openRequestState.substitutes.map(candidate => ({
          substituteId: candidate.id,
          name: candidate.name,
          role: candidate.role,
          response: 'Avvaktar',
        })),
      };
      setResourceOrders(current => [...current, order]);
      addOrderActivity(orderId, {
        type: 'status', author: 'Du', initials: 'JV', time: 'Just nu',
        text: 'Förfrågan skickad till valda kandidater',
        detail: `${unit} · ${dateStr} · ${shift.start}–${shift.end} · ${order.invitedSubstitutes.map(candidate => candidate.name).join(' · ')}`,
      });
      setOpenRequestState(null);
      setSubPanelOpen(false);
      return;
    }
    setOpenRequestState(null);
    setSubPanelOpen(false);
    window.alert(`Förfrågan skickad: ${role}, ${unit}, ${dateStr}, ${shift.start}–${shift.end}`);
  }, [addOrderActivity, alwaysShowResourceNeeds, openRequestState]);

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
    invites.filter(invite => invite.response !== 'Avvaktar').forEach(invite => {
      const responseMessage = {
        type: 'message' as const,
        author: invite.name,
        initials: initialsFromName(invite.name),
        time: 'Just nu',
        text: invite.responseText ?? (invite.response === 'Tillgänglig' ? 'Jag kan ta passet.' : 'Jag kan inte ta passet.'),
        detail: `Svar på förfrågan · ${order.personName} · ${order.dateStr}`,
      };
      addOrderActivity(orderId, responseMessage);
      addSubstituteActivity(invite.substituteId, responseMessage);
    });
    const needId = order.id.startsWith('resource-order-') ? order.id.slice('resource-order-'.length) : '';
    markMessageEntitiesUnread([
      `pass:${order.personId}|${order.dateStr}`,
      `person:${order.personId}`,
      ...(resourceNeeds.some(need => need.id === needId) ? [`need:${needId}`] : []),
    ]);
    if (resourceNeeds.some(need => need.id === needId)) addResourceNeedActivity(needId, {
      type: 'status', author: 'Systemet', initials: 'S', time: 'Just nu',
      text: 'Svar mottagna på beställningen', detail: 'Resursbehovet inväntar att vikarie väljs.',
    });
  }, [addOrderActivity, addResourceNeedActivity, addSubstituteActivity, markMessageEntitiesUnread, resourceNeeds, resourceOrders, updateLinkedNeedWorkflowStatus]);

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

  const handleOrderAllResourceNeeds = useCallback((needIds: string[]) => {
    const selectedNeedIds = new Set(needIds);
    const openNeeds = resourceNeeds.filter(need => needIds.length === 0 || selectedNeedIds.has(need.id))
      .filter(need => need.status === 'Öppet' && !need.workflowStatus);
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

  const handleAssignAllResourceNeeds = useCallback((needIds: string[]) => {
    const selectedNeedIds = new Set(needIds);
    const openNeeds = resourceNeeds.filter(need => needIds.length === 0 || selectedNeedIds.has(need.id))
      .filter(need => need.status === 'Öppet' && !need.workflowStatus);
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
    const targetFillType = isRemainingPass || (target as ResourceNeed).source !== 'pass' ? 'substitute' : 'extra';
    automationProcessedNeedIdsRef.current.add(target.id);

    if (automation.automationMode !== 'free-then-confirm') {
      handleDirectAssignment(personId, targetDate, targetShift, targetFillType, undefined, isRemainingPass ? target.id : undefined);
      return;
    }
    const date = parseDate(targetDate);
    const available = getAvailableSubs(targetShift, date, 1, effectiveAvailabilityOverrides, substituteAbsences, panelCandidates)
      .sort((a, b) => candidateRankScore(b, date, targetShift, effectiveAvailabilityOverrides, substituteAbsences)
        - candidateRankScore(a, date, targetShift, effectiveAvailabilityOverrides, substituteAbsences));
    const freeCandidate = automation.autoAssignFreeSubstitutes ? available.find(candidate => candidate.costLevel === 'Gratis') : undefined;
    if (freeCandidate) {
      handleDirectAssignment(personId, targetDate, targetShift, targetFillType, freeCandidate, isRemainingPass ? target.id : undefined);
      return;
    }
    const paidCandidate = available[0];
    if (!paidCandidate || !automation.askBeforePaidSubstitutes) {
      if (paidCandidate && !automation.askBeforePaidSubstitutes) {
        handleDirectAssignment(personId, targetDate, targetShift, targetFillType, paidCandidate, isRemainingPass ? target.id : undefined);
        return;
      }
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
    if (action.id === 'find-substitute') {
      handleOpenResourceNeedAssignment(need, true);
      return;
    }
    if (action.id === 'assign-direct') {
      handleDirectAssignment(need.personId, need.dateStr, need.shift, need.source === 'pass' ? 'extra' : 'substitute');
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
    const selectedAction = event.itemData;
    const action = selectedAction?.id;
    if (!target || !selectedAction || selectedAction.disabled || !action) return;
    const remainingPass = remainingPasses.find(pass => pass.id === target.personId && pass.dateStr === target.dateStr);
    if (remainingPass) {
      if (action === 'primary' || action === 'find-substitute') {
        handleOpenRemainingPassPanel(remainingPass, action === 'find-substitute');
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
        createResourceNeed(target.personId, target.dateStr, targetShift, RUNTIME_ABSENCE_REASONS[key], RUNTIME_ABSENCE_SHIFTS[key] ? 'frånvaro' : 'vakans', true);
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
      handleOpenVacancyPanel(target.personId, target.dateStr, true);
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

  const handleDragStartAvailability = useCallback((event: React.DragEvent, candidateId: string, dateStr: string) => {
    event.stopPropagation();
    const payload = JSON.stringify({ candidateId, dateStr });
    event.dataTransfer.setData('candidateAvailability', payload);
    event.dataTransfer.setData('text/plain', payload);
    event.dataTransfer.effectAllowed = 'copy';
  }, []);

  const handleCellDragOver = useCallback((e: React.DragEvent) => {
    if (!subPanelOpen) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, [subPanelOpen]);

  const handleCellDrop = useCallback((e: React.DragEvent, personId: string, dateStr: string, shift: Shift) => {
    if (!subPanelOpen) return;
    e.preventDefault();
    e.stopPropagation();
    const availabilityPayload = e.dataTransfer.getData('candidateAvailability');
    let availabilityCandidate: SubstituteCandidate | undefined;
    if (availabilityPayload) {
      try {
        const source = JSON.parse(availabilityPayload) as { candidateId?: string; dateStr?: string };
        if (source.dateStr !== dateStr || dateStr < TODAY_STR) return;
        availabilityCandidate = panelCandidates.find(candidate => candidate.id === source.candidateId);
        if (!availabilityCandidate) return;
        const available = getSubAvailability(availabilityCandidate.id, parseDate(dateStr), effectiveAvailabilityOverrides, substituteAbsences);
        const bookings = candidateBookings[availabilityCandidate.id] ?? [];
        if (!available || subAvailPct(available, shift) === 0 || candidateHasRestConflict(availabilityCandidate.id, parseDate(dateStr), shift, bookings)) return;
        if (bookings.some(booking => booking.dateStr === dateStr)) return;
      } catch { return; }
    }
    const ids = (() => {
      try { return JSON.parse(e.dataTransfer.getData('substituteIds')) as string[]; } catch { return []; }
    })();
    const fallbackId = e.dataTransfer.getData('substituteId');
    const requestedIds = isActivityTimelineScenario && !alwaysShowResourceNeeds ? ids.slice(0, 1) : ids;
    const selected = availabilityCandidate ? [availabilityCandidate] : panelCandidates.filter(sub => requestedIds.includes(sub.id) || (!ids.length && sub.id === fallbackId));
    if (!selected.length) return;
    const remainingPass = remainingPasses.find(pass => pass.id === personId && pass.dateStr === dateStr);
    if (alwaysShowResourceNeeds) {
      if (remainingPass) {
        handleCreateCandidateRequest(selected, remainingPass.id, dateStr, remainingPass.shift, 'substitute', 'Pass kvar', 'Vikarie', true);
        return;
      }
      const alreadyStaffed = fills.some(fill => fill.personId === personId && fill.dateStr === dateStr);
      const activeNeed = resourceNeeds.find(need => need.personId === personId && need.dateStr === dateStr && need.status !== 'Borttaget');
      const fillType = activeNeed ? activeNeed.source === 'pass' ? 'extra' : 'substitute' : vacancyKeys.includes(`${personId}|${dateStr}`) && !alreadyStaffed ? 'substitute' : 'extra';
      const employee = employees.find(item => item.id === personId);
      handleCreateCandidateRequest(selected, personId, dateStr, shift, fillType, employee?.name, employee?.role, true);
      return;
    }
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
  }, [subPanelOpen, openConfirm, vacancyKeys, isActivityTimelineScenario, alwaysShowResourceNeeds, panelCandidates, remainingPasses, handleCreateCandidateRequest, employees, fills, resourceNeeds, effectiveAvailabilityOverrides, substituteAbsences, candidateBookings]);

  const handleSchedulePassDragStart = useCallback((event: React.DragEvent, personId: string, dateStr: string, shift: Shift) => {
    if (!resourceNeedPrototype) return;
    const payload = JSON.stringify({ personId, dateStr, shift });
    event.dataTransfer.setData('resourceNeedPass', payload);
    event.dataTransfer.setData('text/plain', payload);
    event.dataTransfer.effectAllowed = 'copy';
  }, [resourceNeedPrototype]);

  const handleResourceNeedDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!resourceNeedPrototype) return;
    try {
      const dragPayload = event.dataTransfer.getData('resourceNeedPass') || event.dataTransfer.getData('text/plain');
      if (!dragPayload) return;
      const target = JSON.parse(dragPayload) as { personId?: string; dateStr?: string; shift?: Shift };
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

  const isResourceNeedAcute = useCallback((need: ResourceNeed) =>
    need.dateStr === TODAY_STR || isAkutShift(need.personId, need.dateStr, selectedOrganisation),
  [selectedOrganisation]);
  const resourceNeedBoardCount = resourceOrders.filter(order => order.status !== 'Avbruten').length
    + resourceNeeds.filter(need => need.status !== 'Borttaget' && isResourceNeedAcute(need)
      && !resourceOrders.some(order => order.id === `resource-order-${need.id}` && order.status !== 'Avbruten')).length;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <PageLayout title={activeView === 'schema' ? 'Schema' : activeView === 'orders' ? 'Beställningar' : 'Resursbehov'} breadcrumbItems={breadcrumbItems} hideCaseActivityButton={resourceNeedPrototype}>
      <div className="col-12">
        <div className={`schema-page-wrapper${subPanelOpen ? ' schema-page-has-panel' : ''}${alwaysShowResourceNeeds ? ' schema-page-hospital' : ''}`}>

          {alwaysShowResourceNeeds
            ? <VikariehanteringViewSwitcher
                activeView={activeView === 'orders' ? 'orders' : 'schema'}
                orderCount={resourceNeedBoardCount}
                onSelect={(view: VikariehanteringView) => {
                  if (view === 'settings') {
                    sessionStorage.setItem('vikariehantering.orderCount', String(resourceNeedBoardCount));
                    navigateTo('/vikariehantering/installningar');
                  }
                  else setActiveView(view);
                }}
              />
            : <div className="schema-view-switcher" role="tablist" aria-label="Välj vy">
                <button type="button" className={activeView === 'schema' ? 'active' : ''} onClick={() => setActiveView('schema')}><i className="fa-solid fa-calendar-days" /> Schema</button>
                <button type="button" className={activeView === 'orders' ? 'active' : ''} onClick={() => setActiveView('orders')}><i className="fa-solid fa-cart-shopping" /> Beställningar <span>{resourceNeedPrototype ? resourceNeedBoardCount : resourceOrders.length}</span></button>
              </div>}

          {activeView === 'orders' ? (
            <div className="schema-orders-page-view">
              {resourceNeedPrototype
                ? <ResourceOrdersKanban
                    needs={resourceNeeds}
                    orders={resourceOrders}
                    unreadMessageEntities={unreadMessageEntities}
                    orgOptions={resourceBoardOrgOptions}
                    activityKinds={resourceBoardActivityKinds}
                    hospitalMode={alwaysShowResourceNeeds}
                    selectedRoleId={selectedRoleId}
                    getActivitiesForPerson={(personId, dateStr) => getCellActivities(personId, parseDate(dateStr))}
                    isAcuteNeed={isResourceNeedAcute}
                    onClose={() => setActiveView('schema')}
                    onAction={handleOrderAction}
                    onNeedAction={handleResourceNeedAction}
                    onOpenNeed={setResourceNeedDetail}
                    onOpenOrder={setOrderDetail}
                    onChooseSubstitute={handleOpenOrderSubstitutePanel}
                    onOpenSubstitute={handleOpenSubstituteDetails}
                    onShowSubstitutes={handleOpenAllSubstitutes}
                    candidateButtonLabel={alwaysShowResourceNeeds ? 'Kandidater' : undefined}
                    onMoveNeed={handleMoveNeedOnBoard}
                    onMoveOrder={handleMoveOrderOnBoard}
                    onReturnOrderToNeed={handleReturnOrderToNeed}
                    onRegisterResponses={handleRegisterOrderResponses}
                    onTakeBackOrder={handleTakeBackOrder}
                  />
                : <ResourceOrdersList orders={resourceOrders} unreadMessageEntities={unreadMessageEntities} selectedOrderId={highlightedOrderId} selectedPersonId={highlightedPersonId} relatedOrderIds={relatedOrderIds} onSelectOrder={selectResourceOrder} onSelectPerson={selectOrderPerson} onClose={() => setActiveView('schema')} onAction={handleOrderAction} onOpenDetails={setOrderDetail} onChooseSubstitute={handleOpenOrderSubstitutePanel} onShowSubstitutes={handleOpenAllSubstitutes} onOpenSubstitute={handleOpenSubstituteDetails} candidateButtonLabel={alwaysShowResourceNeeds ? 'Kandidater' : undefined} />}
            </div>
          ) : activeView === 'resource-needs' ? (
            <div className="schema-orders-page-view">
              <ResourceNeedsList needs={resourceNeeds} unreadMessageEntities={unreadMessageEntities} orgOptions={resourceBoardOrgOptions} selectedRoleId={selectedRoleId} selectedNeedId={highlightedNeedId} relatedNeedIds={relatedNeedIds} onSelectNeed={selectResourceNeed} onClose={() => setActiveView('schema')} onOpenDetails={setResourceNeedDetail} onAction={handleResourceNeedAction} onDropPass={handleResourceNeedDrop} onOrderAll={handleOrderAllResourceNeeds} onAssignAll={isActivityTimelineScenario ? undefined : handleAssignAllResourceNeeds} />
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
                onValueChanged={e => {
                  const next = e.value ?? [];
                  setSelectedGroups(alwaysShowResourceNeeds && next.length > 1 && next.includes('alla') ? next.filter(id => id !== 'alla') : next);
                }}
                placeholder="Välj urval..."
                showSelectionControls={true}
                multiline={false}
                stylingMode="outlined"
                width={310}
              />
            </div>
            {hasActivityTimeline && <TagBox
              dataSource={alwaysShowResourceNeeds ? HOSPITAL_ACTIVITY_FILTERS : PRESCHOOL_ACTIVITY_FILTERS}
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
            {!alwaysShowResourceNeeds && <button
              className="btn-secondary schema-vikarie-open-btn"
              onClick={handleOpenAllSubstitutes}
            >
              <i className="fa-solid fa-user-group" />
              Visa vikarier
            </button>}
            {showPassTypeFilter && <SelectBox
              dataSource={passTypeOptions}
              displayExpr="label"
              valueExpr="id"
              value={selectedPass}
              onValueChanged={e => setSelectedPass(e.value)}
              width={alwaysShowResourceNeeds ? 165 : 180}
              stylingMode="outlined"
            />}
            <TextBox
              placeholder="Textfilter"
              value={textFilter}
              onValueChanged={e => setTextFilter(e.value ?? '')}
              width={240}
              stylingMode="outlined"
            />
            <div className="schema-filter-spacer" />
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
          </div>

          {/* Checkboxes */}
          <div className="schema-filter-checks">
            {!alwaysShowResourceNeeds && <CheckBox value={showVacancies} onValueChanged={e => setShowVacancies(e.value)} text={resourceNeedPrototype ? 'Visa frånvaro och resursbehov' : 'Visa bara vakanser'} />}
            {resourceNeedPrototype && !alwaysShowResourceNeeds && (
              <div className="schema-orders-toggle">
                <CheckBox value={showResourceNeeds} onValueChanged={e => {
                  const visible = Boolean(e.value);
                  setShowResourceNeeds(visible);
                  if (visible) setShowOrders(false);
                }} text="Visa resursbehov" />
                <span className="schema-orders-count schema-resource-needs-count">{resourceNeeds.filter(need => need.status !== 'Borttaget').length}</span>
              </div>
            )}
            {!alwaysShowResourceNeeds && <div className="schema-orders-toggle">
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
            </div>}
            {!alwaysShowResourceNeeds && <div className="schema-org-legend" aria-label="Förklaring av sammanfattning">
              <span><i className="schema-org-legend-dot schema-org-legend-present" />På plats</span>
              <span><i className="schema-org-legend-dot schema-org-legend-absent" />Frånvarande</span>
              <small>Gruppceller: på plats / frånvarande</small>
            </div>}
          </div>

          {/* Week navigation and the activity key sit directly above the schedule. */}
          <div className="schema-schedule-toolbar">
            <div className="schema-schedule-toolbar-controls">
              <div className="schema-period-nav">
                <button className="schema-period-nav-btn" onClick={() => navigate(-1)} aria-label="Föregående period">
                  <i className="fa-solid fa-chevron-left" />
                </button>
                <span className="schema-period-label">{pLabel}</span>
                <button className="schema-period-nav-btn" onClick={() => navigate(1)} aria-label="Nästa period">
                  <i className="fa-solid fa-chevron-right" />
                </button>
              </div>
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
            {hasActivityTimeline && <div className="schema-activity-legend schema-activity-legend-top" aria-label="Aktivitetstyper och tillgänglighet">
              {Object.entries(alwaysShowResourceNeeds ? HOSPITAL_ACTIVITY_TYPES : PRESCHOOL_ACTIVITY_TYPES).map(([kind, activityType]) => <span key={kind}><i className={`schema-activity-legend-swatch ${activityType.className}`} />{activityType.label}</span>)}
              <span><i className="schema-activity-legend-swatch schema-activity-availability-swatch" />Tillgänglig vikarie</span>
              <span><i className="schema-activity-legend-swatch schema-activity-absence-swatch" />Frånvaro</span>
            </div>}
          </div>

          {/* Schedule table with an optional right-hand orders panel. */}
          <div className={`schema-schedule-area${resourceNeedPrototype && (showResourceNeeds || alwaysShowResourceNeeds) ? ' schema-schedule-has-resource-needs' : ''}`}>
          <div className="schema-schedule-main">
          <div ref={mainWrapperRef} className="schema-table-wrapper">
            <table className="schema-table" style={{ minWidth: scheduleTableMinWidth }}>
              <colgroup>
                <col style={{ width: EMPLOYEE_COLUMN_WIDTH }} />
                {columns.map((_, index) => <col key={index} style={{ width: viewColumnWidth }} />)}
              </colgroup>
              <thead>
                <tr>
                  <th className="schema-header-cell schema-employee-header">{isActivityTimelineScenario || alwaysShowResourceNeeds ? 'Medarbetare' : 'Aktivitet / medarbetare'}</th>
                  {columns.map((col, i) => {
                    const ds      = toDateStr(col.date);
                    const isToday = ds === TODAY_STR;
                    const isPast  = ds < TODAY_STR && viewType === 'day-columns';
                    const dailyCoverage = alwaysShowResourceNeeds && viewType === 'day-columns'
                      ? renderPresenceCell(filteredEmployees.map(employee => employee.id), col, 'alla')
                      : null;
                    const dailyTarget = dailyCoverage ? dailyCoverage.present + dailyCoverage.absent : 0;
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
                        {dailyCoverage && <span className="schema-col-staffing-count" title="På plats / börvärde"><i className="fa-solid fa-user" aria-hidden="true" />{dailyCoverage.present} av {dailyTarget}</span>}
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
                        <td className="schema-employee-cell schema-org-employee-cell" style={{ paddingLeft: alwaysShowResourceNeeds ? 12 : 106 }}>
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
                            highlightedScheduleObject?.personId === pass.id && highlightedScheduleObject.dateStr === dateStr && !highlightedScheduleObject.activityId ? isPrimaryScheduleSelection ? 'schema-schedule-object-selected' : 'schema-schedule-object-related' : isCandidateBookingRelatedToSchedule(pass.id, dateStr) ? 'schema-schedule-object-related' : '',
                          ].filter(Boolean).join(' ')}
                            data-person-id={isTargetDay ? pass.id : undefined}
                            data-date-str={isTargetDay ? dateStr : undefined}
                            data-ctx-type={isTargetDay && isVacant ? 'vacant' : undefined}
                            onClick={event => selectScheduleObject(pass.id, dateStr, event.target)}
                            onDoubleClick={isTargetDay ? () => handleOpenDetail(pass.id, 'Pass kvar', pass.unit, dateStr, pass.shift, isVacant ? 'vacant' : 'filled') : undefined}>
                            {unreadMessageEntities.has(`pass:${pass.id}|${dateStr}`) && <NewMessageIndicator className="schema-new-message-indicator-cell" />}
                            {isTargetDay && isVacant && <ContextKebabButton className="schema-context-kebab-cell" targetSelector=".schema-ctx-cell" label={`Fler åtgärder för vakans, ${dateStr}`} />}
                            {isTargetDay && <ActivityTimelineCell
                              shift={pass.shift}
                              activities={passActivities}
                              activityFills={activityFills}
                              availability={null}
                              vacancyLabel={pass.assignedSubstituteId ? undefined : 'Vakans'}
                              statusLabel={pass.assignedSubstituteId ? `Tillsatt · ${pass.assignedSubstituteName ?? ''}` : undefined}
                              assignedSubstituteName={pass.assignedSubstituteName}
                              isPast={isPast}
                              selectedActivityId={highlightedScheduleObject?.personId === pass.id && highlightedScheduleObject.dateStr === dateStr ? highlightedScheduleObject.activityId : undefined}
                              onPassDragOver={handleCellDragOver}
                              onPassDrop={(event, targetShift) => handleCellDrop(event, pass.id, dateStr, targetShift)}
                            />}
                          </td>;
                        })}
                      </tr>
                    );
                  }
                  const emp = row.employee;
                  const subRows = viewType === 'day-columns' && !alwaysShowResourceNeeds ? getSubRows(emp.id) : [];
                  const employeeIndex = employees.findIndex(employee => employee.id === emp.id);
                  const hasPoolInView = columns.some(column => hasPoolDuty(employeeIndex, column.date));
                  return (
                    <React.Fragment key={emp.id}>
                      {/* Employee row */}
                      <tr className="schema-table-row">
                        <td
                          className={`schema-employee-cell schema-org-employee-cell schema-person-context-cell${alwaysShowResourceNeeds ? ' schema-preschool-employee-cell' : ''}${highlightedPersonId === emp.id ? ' schema-schedule-person-selected' : ''}`}
                          style={{ paddingLeft: alwaysShowResourceNeeds ? 12 : 106 }}
                          data-person-id={emp.id}
                          onClick={() => selectSchedulePerson(emp.id)}
                          onContextMenu={() => setPersonContextId(emp.id)}
                          onDoubleClick={() => setPersonDetailId(emp.id)}
                          title="Dubbelklicka för persondetaljer, högerklicka för åtgärder"
                        >
                          {alwaysShowResourceNeeds
                            ? <div className="schema-employee-identity">
                                <span className="schema-person-avatar" aria-hidden="true">{initialsFromName(emp.name)}</span>
                                <span className="schema-employee-copy">
                                  <span className="schema-employee-name">{hasPoolInView && <i className="schema-pool-dot" title="Samverkanspass i aktuell period" />} {emp.name} {unreadMessageEntities.has(`person:${emp.id}`) && <NewMessageIndicator />}</span>
                                  <span className="schema-employee-role">{emp.role}</span>
                                  <span className="schema-employee-organisation-chip"><i className="fa-solid fa-location-dot" />{emp.organisation}</span>
                                </span>
                              </div>
                            : <>
                                <span className="schema-employee-name">{hasPoolInView && <i className="schema-pool-dot" title="Samverkanspass i aktuell period" />} {emp.name} {unreadMessageEntities.has(`person:${emp.id}`) && <NewMessageIndicator />}</span>
                                <span className="schema-employee-role">{emp.role}</span>
                                <span className="schema-employee-dept">{emp.organisation}</span>
                              </>}
                          <ContextKebabButton className="schema-context-kebab-cell" targetSelector=".schema-person-context-cell" label={`Fler åtgärder för ${emp.name}`} />
                        </td>
                        {columns.map((col, ci) => {
                          const ds    = toDateStr(col.date);
                          const hasUnreadPassMessage = unreadMessageEntities.has(`pass:${emp.id}|${ds}`);
                          const shift = getScheduleShift(emp.id, col.date, selectedPass);
                          const previousDate = addDays(col.date, -1);
                          const previousDateStr = toDateStr(previousDate);
                          const previousShift = alwaysShowResourceNeeds && (selectedPass === 'alla' || selectedPass === 'natt')
                            ? getScheduleShift(emp.id, previousDate, 'alla')
                            : null;
                          const nightCarryColor = previousShift?.type === 'night'
                            ? getColorScheme(emp.id, previousDateStr, fills, vacancyKeys)
                            : null;
                          const previousAbsenceKey = `${emp.id}|${previousDateStr}`;
                          const carryInAbsenceLabel = nightCarryColor === 'absence'
                            ? `Frånvaro${RUNTIME_ABSENCE_REASONS[previousAbsenceKey] ? ` · ${RUNTIME_ABSENCE_REASONS[previousAbsenceKey]}` : ''}`
                            : undefined;
                          const previousResourceNeed = resourceNeedPrototype
                            ? resourceNeeds.find(need => need.personId === emp.id && need.dateStr === previousDateStr && need.status !== 'Borttaget')
                            : undefined;
                          const carryInIsOrdered = resourceNeedPrototype && resourceOrders.some(order =>
                            order.personId === emp.id && order.dateStr === previousDateStr && order.status !== 'Tillsatt' && order.status !== 'Avbruten',
                          );
                          const carryInVacancyLabel = nightCarryColor === 'vacant'
                            ? previousResourceNeed ? 'Resursbehov' : 'Vakans'
                            : undefined;
                          const carryInAssignedSubstituteName = previousResourceNeed?.assignedSubstituteName
                            ?? fills.find(fill => fill.personId === emp.id && fill.dateStr === previousDateStr)?.person.name;

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
                          const employeeFill = fills.find(f => f.personId === emp.id && f.dateStr === ds);
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
                          const cellColor: ColorScheme = isAbsent
                            ? 'absence'
                            : resourceNeedPrototype && ds < TODAY_STR
                            ? 'past'
                            : resourceNeed || activeScheduleOrder
                              ? activeScheduleOrder && activeScheduleOrder.status !== 'Tillsatt'
                                ? 'ordered'
                                : resourceNeed?.status === 'Tillsatt' || activeScheduleOrder?.status === 'Tillsatt'
                                  ? 'filled'
                                  : 'normal'
                              : color;
                          const resourceNeedDisplayStatus = activeScheduleOrder?.status ?? resourceNeed?.workflowStatus ?? resourceNeed?.status;
                          const resourceNeedHandler = activeScheduleOrder?.handledBy ?? resourceNeed?.handledBy;
                          const hasScheduleResourceStatus = Boolean(resourceNeed || activeScheduleOrder);
                          const scheduleStatusLabel = resourceNeed
                            ? resourceNeedDisplayStatus ?? 'Öppet'
                            : activeScheduleOrder ? activeScheduleOrder.status : undefined;

                          if (hasActivityTimeline && viewType !== 'year-columns') {
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
                                timeToMinutes(activity.end) <= timeToMinutes(activity.start)
                                  || selectedActivityFilters.length === 0
                                  || selectedActivityFilters.includes(activity.kind)
                                  || (isAbsent && selectedActivityFilters.includes('absence')),
                              )
                              : [];
                            const carryInActivities = nightCarryColor
                              ? getCellActivities(emp.id, previousDate).filter(activity => timeToMinutes(activity.end) <= timeToMinutes(activity.start))
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
                                  highlightedScheduleObject?.personId === emp.id && highlightedScheduleObject.dateStr === ds && !highlightedScheduleObject.activityId ? isPrimaryScheduleSelection ? 'schema-schedule-object-selected' : 'schema-schedule-object-related' : isCandidateBookingRelatedToSchedule(emp.id, ds) ? 'schema-schedule-object-related' : '',
                                ].filter(Boolean).join(' ')}
                                data-person-id={emp.id}
                                data-date-str={ds}
                                data-ctx-type={ctxType}
                                onClick={event => selectScheduleObject(emp.id, ds, event.target)}
                                onDoubleClick={shift ? () => handleOpenDetail(emp.id, emp.name, emp.role, ds, shift, color) : undefined}
                              >
                                {hasUnreadPassMessage && <NewMessageIndicator className="schema-new-message-indicator-cell" />}
                                {ctxType && <ContextKebabButton className="schema-context-kebab-cell" targetSelector=".schema-ctx-cell" label={`Fler åtgärder för ${emp.name}, ${ds}`} />}
                                <ActivityTimelineCell
                                  shift={shift}
                                  activities={activities}
                                  activityFills={activityFills}
                                  availability={selfAvailability}
                                  bookedAssignment={bookedAssignment}
                                  absenceLabel={absenceCaption}
                                  vacancyLabel={hasScheduleResourceStatus ? undefined : resourceNeed && !isAbsent ? 'Resursbehov' : undefined}
                                  statusLabel={scheduleStatusLabel}
                                  assignedSubstituteName={resourceNeed?.assignedSubstituteName ?? employeeFill?.person.name}
                                  resourceNeedCreatedBy={resourceNeed?.createdBy}
                                  resourceNeedSource={resourceNeed?.source}
                                  resourceNeedDisplayStatus={resourceNeedDisplayStatus}
                                  resourceNeedHandler={resourceNeedHandler}
                                  isOrdered={Boolean(activeScheduleOrder && activeScheduleOrder.status !== 'Tillsatt')}
                                  resourceStatus={hasScheduleResourceStatus}
                                  isPast={ds < TODAY_STR}
                                  hospitalMode={alwaysShowResourceNeeds}
                                  selectedActivityId={highlightedScheduleObject?.personId === emp.id && highlightedScheduleObject.dateStr === ds ? highlightedScheduleObject.activityId : undefined}
                                  carryInShift={nightCarryColor ? previousShift : null}
                                  carryInActivities={carryInActivities}
                                  carryInAbsenceLabel={carryInAbsenceLabel}
                                  carryInVacancyLabel={carryInVacancyLabel}
                                  carryInIsOrdered={carryInIsOrdered}
                                  carryInAssignedSubstituteName={carryInAssignedSubstituteName}
                                  carryInIsPast={previousDateStr < TODAY_STR}
                                  onCarryInDoubleClick={previousShift && nightCarryColor ? () => handleOpenDetail(emp.id, emp.name, emp.role, toDateStr(previousDate), previousShift, nightCarryColor) : undefined}
                                  onPassDragStart={resourceNeedPrototype ? (event, targetShift) => handleSchedulePassDragStart(event, emp.id, ds, targetShift) : undefined}
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
                                className={['schema-month-col-cell', col.isWeekend ? 'schema-weekend-cell' : '', ds === TODAY_STR ? 'schema-today-col' : '', ctxType ? 'schema-ctx-cell' : '', nightCarryColor ? 'schema-night-carry-cell' : '', highlightedScheduleObject?.personId === emp.id && highlightedScheduleObject.dateStr === ds && !highlightedScheduleObject.activityId ? isPrimaryScheduleSelection ? 'schema-schedule-object-selected' : 'schema-schedule-object-related' : isCandidateBookingRelatedToSchedule(emp.id, ds) ? 'schema-schedule-object-related' : ''].filter(Boolean).join(' ')}
                                data-person-id={emp.id}
                                data-date-str={ds}
                                data-ctx-type={ctxType}
                                onClick={event => selectScheduleObject(emp.id, ds, event.target)}
                              >
                                {hasUnreadPassMessage && <NewMessageIndicator className="schema-new-message-indicator-cell" />}
                                {ctxType && <ContextKebabButton className="schema-context-kebab-cell" targetSelector=".schema-ctx-cell" label={`Fler åtgärder för ${emp.name}, ${ds}`} />}
                                {nightCarryColor && <NightPassCarryIn color={nightCarryColor} compact />}
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
                                    <ShiftMonthCell shift={shift} color={cellColor} passInfo={passInfo} isAkut={akut} orderedBy={resourceNeed ? undefined : resourceOrder?.orderedBy} orderStatus={resourceNeed ? undefined : resourceOrder?.status} orderHandledBy={resourceNeed ? undefined : resourceOrder?.handledBy} resourceNeedMode={resourceNeedPrototype} resourceNeedCreatedBy={resourceNeed?.createdBy} resourceNeedSource={resourceNeed?.source} resourceNeedDisplayStatus={resourceNeedDisplayStatus} resourceNeedHandler={resourceNeedHandler} assignmentFailure={assignmentFailures[`${emp.id}|${ds}`]} overnightContinuation={alwaysShowResourceNeeds} />
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
                              nightCarryColor ? 'schema-night-carry-cell' : '',
                              highlightedScheduleObject?.personId === emp.id && highlightedScheduleObject.dateStr === ds && !highlightedScheduleObject.activityId ? isPrimaryScheduleSelection ? 'schema-schedule-object-selected' : 'schema-schedule-object-related' : isCandidateBookingRelatedToSchedule(emp.id, ds) ? 'schema-schedule-object-related' : '',
                            ].filter(Boolean).join(' ')}
                            data-person-id={emp.id}
                            data-date-str={ds}
                            data-ctx-type={ctxType}
                            onClick={event => selectScheduleObject(emp.id, ds, event.target)}
                            >
                              {hasUnreadPassMessage && <NewMessageIndicator className="schema-new-message-indicator-cell" />}
                              {ctxType && <ContextKebabButton className="schema-context-kebab-cell" targetSelector=".schema-ctx-cell" label={`Fler åtgärder för ${emp.name}, ${ds}`} />}
                              {nightCarryColor && <NightPassCarryIn color={nightCarryColor} />}
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
                                  <ShiftDayCell shift={shift} color={cellColor} passInfo={passInfo} isAkut={akut} orderedBy={resourceNeed ? undefined : resourceOrder?.orderedBy} orderStatus={resourceNeed ? undefined : resourceOrder?.status} orderHandledBy={resourceNeed ? undefined : resourceOrder?.handledBy} resourceNeedMode={resourceNeedPrototype} resourceNeedCreatedBy={resourceNeed?.createdBy} resourceNeedSource={resourceNeed?.source} resourceNeedDisplayStatus={resourceNeedDisplayStatus} resourceNeedHandler={resourceNeedHandler} assignmentFailure={assignmentFailures[`${emp.id}|${ds}`]} overnightContinuation={alwaysShowResourceNeeds} />
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
          {alwaysShowResourceNeeds && typeof document !== 'undefined' && createPortal(<div ref={presenceScrollRef} className="schema-presence-sticky-wrap" style={{ left: presenceBounds.left, width: presenceBounds.width }}>
            <table className="schema-presence-sticky-table" style={{ minWidth: scheduleTableMinWidth }}>
              <colgroup>
                <col style={{ width: EMPLOYEE_COLUMN_WIDTH }} />
                {columns.map((_, index) => <col key={index} style={{ width: viewColumnWidth }} />)}
              </colgroup>
              <tbody><tr>
                <th className="schema-presence-sticky-label">
                  <div className="schema-presence-sticky-label-inner">
                    <button type="button" className={`btn-primary schema-presence-candidates-btn${subPanelOpen && subPanelBrowseAll ? ' active' : ''}`} aria-expanded={subPanelOpen && subPanelBrowseAll} title="Visa eller dölj kandidater" onClick={handleOpenAllSubstitutes}>
                      <i className="fa-solid fa-users" /> Kandidater <b>{panelCandidates.length}</b>
                    </button>
                  </div>
                </th>
                {columns.map((column, index) => <td key={index} className={column.isWeekend ? 'schema-presence-weekend' : ''} aria-hidden="true" />)}
              </tr></tbody>
            </table>
          </div>, document.body)}
          </div>
          {showOrders && <ResourceOrdersList orders={resourceOrders} unreadMessageEntities={unreadMessageEntities} selectedOrderId={highlightedOrderId} selectedPersonId={highlightedPersonId} relatedOrderIds={relatedOrderIds} onSelectOrder={selectResourceOrder} onSelectPerson={selectOrderPerson} onClose={() => setShowOrders(false)} onAction={handleOrderAction} onOpenDetails={setOrderDetail} onChooseSubstitute={handleOpenOrderSubstitutePanel} onShowSubstitutes={handleOpenAllSubstitutes} onOpenSubstitute={handleOpenSubstituteDetails} candidateButtonLabel={alwaysShowResourceNeeds ? 'Kandidater' : undefined} />}
          {resourceNeedPrototype && (showResourceNeeds || alwaysShowResourceNeeds) && <ResourceNeedsList needs={resourceNeeds} unreadMessageEntities={unreadMessageEntities} orgOptions={resourceBoardOrgOptions} selectedRoleId={selectedRoleId} selectedNeedId={highlightedNeedId} relatedNeedIds={relatedNeedIds} onSelectNeed={selectResourceNeed} onClose={alwaysShowResourceNeeds ? undefined : () => setShowResourceNeeds(false)} onOpenDetails={setResourceNeedDetail} onAction={handleResourceNeedAction} onDropPass={handleResourceNeedDrop} onOrderAll={handleOrderAllResourceNeeds} onAssignAll={alwaysShowResourceNeeds || !isActivityTimelineScenario ? handleAssignAllResourceNeeds : undefined} />}
          </div>

          </>}

          {/* Context menu — the first action changes with the selected pass. */}
          <ContextMenu
            target=".schema-ctx-cell"
            showEvent="contextmenu"
            dataSource={contextActions}
            itemRender={renderSchemaContextMenuItem}
            onItemClick={handleContextAction}
          />
          <ContextMenu
            target=".schema-org-label-cell"
            showEvent="contextmenu"
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
            showEvent="contextmenu"
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
        <div className={alwaysShowResourceNeeds ? 'schema-page-hospital' : undefined}>
        <SubstitutePanel
          isOpen={subPanelOpen}
          browseAll={subPanelBrowseAll}
          state={subPanelState}
          candidates={panelCandidates}
          unreadMessageEntities={unreadMessageEntities}
          singleAssignment={isActivityTimelineScenario && !alwaysShowResourceNeeds}
          preschoolMode={alwaysShowResourceNeeds}
          targetUnitId={candidatePanelTargetUnitId}
          targetCompetencies={candidateTargetCompetencies}
          bookingsByCandidate={candidateBookings}
          highlightedCandidateId={highlightedCandidateId}
          highlightedCandidateBooking={highlightedCandidateBooking}
          relatedCandidateIds={relatedCandidateIds}
          relatedCandidateBookingKeys={relatedCandidateBookingKeys}
          onSelectCandidate={selectCandidate}
          onSelectCandidateBooking={selectCandidateBooking}
          columns={columns}
          viewType={viewType}
          viewColumnWidth={viewColumnWidth}
          onClose={handleCloseSubPanel}
          onSendRequest={handleSendRequest}
          onDirectAssign={handleDirectAssignFromPanel}
          onOpenDetails={handleOpenSubstituteDetails}
          onSetAvailability={handleSetSubstituteAvailability}
          onRestoreAvailability={handleRestoreSubstituteAvailability}
          onReportSick={handleReportSubstituteSick}
          onClearSickness={handleClearSubstituteSickness}
          availabilityOverrides={effectiveAvailabilityOverrides}
          absences={substituteAbsences}
          onDragStart={handleDragStartSub}
          onDragStartAvailability={handleDragStartAvailability}
          scrollRef={subScrollRef}
          tableWidth={subTableLayout.width}
          tableInset={subTableLayout.inset}
          panelLeft={alwaysShowResourceNeeds ? presenceBounds.left : undefined}
          panelWidth={alwaysShowResourceNeeds ? presenceBounds.width : undefined}
        />
        </div>

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
          roleOptions={alwaysShowResourceNeeds ? [...new Set<string>(panelCandidates.map(candidate => candidate.role))].map(role => ({ id: role, label: role })) : undefined}
          unitOptions={alwaysShowResourceNeeds
            ? HOSPITAL_ORGANISATION.departments.map(department => ({ id: department.id, label: department.label }))
            : undefined}
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
          icon="fa-cart-shopping"
          kicker={orderDetail ? (orderDetail.resourceType === 'vikarie' ? 'Vikariebeställning' : 'Extrapassbeställning') : 'Beställning'}
          title={orderDetail?.personName ?? 'Beställning'}
          description={orderDetail ? `${orderDetail.role} · ${fmtDay(parseDate(orderDetail.dateStr))} · ${orderDetail.shift.start}–${orderDetail.shift.end}` : ''}
          status={orderDetail ? { label: orderDetail.status, tone: orderDetail.status === 'Tillsatt' ? 'positive' : orderDetail.status === 'Avbruten' ? 'negative' : 'warning' } : undefined}
          activities={orderDetail ? orderActivities[orderDetail.id] ?? [] : []}
          includeDefaultActivities={false}
          details={orderDetail ? <OrderDetailCard order={orderDetail} onSaveTime={handleUpdateOrderTime} onOpenSubstitute={handleOpenSubstituteDetails} /> : null}
          actions={orderDetail && <div className="case-activity-action-buttons">
            {resourceNeedPrototype && orderDetail.status !== 'Tillsatt' && orderDetail.handledBy !== 'Maja Andersson' && <button type="button" className="btn-secondary" onClick={() => handleTakeBackOrder(orderDetail.id)}><i className="fa-solid fa-arrow-rotate-left" /> Ta tillbaka kontrollen</button>}
            {orderDetail.status !== 'Tillsatt' && orderDetail.status !== 'Avbruten' && <button type="button" className="btn-primary" onClick={() => handleOpenOrderSubstitutePanel(orderDetail)}><i className="fa-solid fa-user-plus" /> Välj vikarie</button>}
            {getOrderContextActions(orderDetail).map(action => <button key={action.id + (action.substituteId ?? '')} type="button" className="btn-secondary" onClick={() => handleOrderAction(orderDetail.id, action)}><i className={`fa-solid fa-${action.icon}`} /> {action.text}</button>)}
          </div>}
          onSelectCandidates={orderDetail ? handleSelectOrderCandidates : undefined}
          onPostMessage={orderDetail ? activity => addOrderActivity(orderDetail.id, activity) : undefined}
        />

        <CaseActivityModal
          isOpen={Boolean(detailState)}
          onClose={handleCloseDetail}
          contextKey={passDetailKey}
          icon="fa-calendar-day"
          kicker="Pass"
          title={detailState?.empName ?? 'Pass'}
          description={detailState ? `${fmtDay(parseDate(detailState.dateStr))} · ${detailState.shift.start}–${detailState.shift.end} · ${detailState.empRole}` : ''}
          status={passDetailStatusLabel ? { label: passDetailStatusLabel, tone: passDetailStatusTone } : undefined}
          aboveToolbar={passDetailSchedule ? <div className="person-activity-schedule-panel pass-activity-schedule-panel">
            <h4>Aktiviteter</h4>
            <ActivityScheduleDetail
              schedule={passDetailSchedule}
              activityFills={activityFills}
              assignedSubstituteName={passDetailAssignedPerson?.name}
              assignedSubstituteId={passDetailAssignedSubstituteId}
              onOpenSubstitute={substituteId => detailState && handleOpenSubstituteDetails(substituteId, detailState.dateStr)}
              hospitalMode={alwaysShowResourceNeeds}
            />
          </div> : undefined}
          activities={passDetailActivities}
          includeDefaultActivities={false}
          details={detailState ? (
            <PassDetailCard
              state={detailState}
              onSaveTime={handleUpdatePassTime}
              resourceNeed={passDetailResourceNeed}
              resourceNeedOrder={passDetailResourceNeedOrder}
              assignedPerson={passDetailAssignedPerson}
              assignmentFailure={passDetailAssignmentFailure}
              onOpenSubstitute={substituteId => handleOpenSubstituteDetails(substituteId, detailState.dateStr)}
              organisation={selectedOrganisation}
            />
          ) : null}
          actions={detailState && detailState.color !== 'past' && <div className="case-activity-action-buttons">
            {resourceNeedPrototype && detailState.color === 'normal' && <button type="button" className="btn-primary" onClick={handlePassCreateResourceNeed}><i className="fa-solid fa-user-clock" /> Skapa resursbehov</button>}
            {!resourceNeedPrototype && detailState.color === 'vacant' && <button type="button" className="btn-primary" onClick={handlePassPrimaryAction}><i className="fa-solid fa-user-plus" /> Hitta vikarie</button>}
            {!resourceNeedPrototype && detailState.color === 'absence' && <button type="button" className="btn-primary" onClick={handlePassPrimaryAction}><i className="fa-solid fa-user-clock" /> Gör till vakans</button>}
            {!resourceNeedPrototype && detailState.color === 'normal' && <button type="button" className="btn-primary" onClick={handlePassPrimaryAction}><i className="fa-solid fa-calendar-plus" /> Boka extrapass</button>}
            <button type="button" className="btn-secondary" onClick={handlePassCreateOrder}><i className="fa-solid fa-cart-shopping" /> Beställ resurs</button>
            {detailState.color !== 'absence' && detailState.color !== 'vacant' && <button type="button" className="btn-secondary" onClick={handlePassReportSick}><i className="fa-solid fa-calendar-xmark" /> Sjukanmäl</button>}
            <button type="button" className="btn-secondary" onClick={handlePassSimulate}><i className="fa-solid fa-flask" /> Simulera urval</button>
            {!passDetailAssignedFill && !passDetailRemainingPass?.assignedSubstituteId && passDetailSchedule?.activities.filter(activity => !activityFills[activity.id]).map(activity => <button key={activity.id} type="button" className="btn-secondary" onClick={() => handleOpenScheduleActivityPanel(
              detailState.empId,
              detailState.dateStr,
              activity,
              passDetailRemainingPass ? 'Vakans' : detailState.empName,
              passDetailRemainingPass?.unit ?? employees.find(employee => employee.id === detailState.empId)?.department ?? detailState.empRole,
            )}>
              <i className="fa-solid fa-user-plus" /> {activity.label} · {activity.start}–{activity.end}
            </button>)}
          </div>}
          onPostMessage={detailState ? activity => addPassActivity(passDetailKey, activity) : undefined}
        />

        <CaseActivityModal
          isOpen={Boolean(resourceNeedDetail)}
          onClose={() => setResourceNeedDetail(null)}
          contextKey={resourceNeedDetail?.id}
          icon="fa-user-clock"
          kicker="Resursbehov"
          title={resourceNeedDetail?.personName ?? 'Resursbehov'}
          description={resourceNeedDetail ? `${resourceNeedDetail.role} · ${fmtDay(parseDate(resourceNeedDetail.dateStr))} · ${resourceNeedDetail.shift.start}–${resourceNeedDetail.shift.end}` : ''}
          status={resourceNeedDetail ? { label: resourceNeedDetail.workflowStatus ?? resourceNeedDetail.status, tone: resourceNeedDetail.workflowStatus === 'Tillsatt' || resourceNeedDetail.status === 'Tillsatt' ? 'positive' : resourceNeedDetail.status === 'Öppet' ? 'warning' : 'neutral' } : undefined}
          activities={resourceNeedDetailActivities}
          includeDefaultActivities={false}
          details={resourceNeedDetail ? <ResourceNeedDetailCard need={resourceNeedDetail} order={resourceOrders.find(order => order.id === `resource-order-${resourceNeedDetail.id}`)} onOpenSubstitute={handleOpenSubstituteDetails} /> : null}
          actions={resourceNeedDetail && <div className="case-activity-action-buttons">
            {resourceNeedPrototype && resourceNeedDetail.status !== 'Tillsatt' && resourceNeedDetail.handledBy !== 'Maja Andersson' && <button type="button" className="btn-secondary" onClick={() => handleTakeBackNeed(resourceNeedDetail.id)}><i className="fa-solid fa-arrow-rotate-left" /> Ta tillbaka kontrollen</button>}
            {getResourceNeedActions(resourceNeedDetail).filter(action => action.id !== 'open').map(action => (
              <button key={action.id} type="button" className={action.id === 'assign' ? 'btn-primary' : 'btn-secondary'} onClick={() => handleResourceNeedAction(resourceNeedDetail.id, action)}>
                <i className={`fa-solid fa-${action.icon}`} /> {action.text}
              </button>
            ))}
          </div>}
          onPostMessage={resourceNeedDetail ? activity => addResourceNeedActivity(resourceNeedDetail.id, activity) : undefined}
        />

        <CaseActivityModal
          isOpen={Boolean(personDetailEmployee)}
          onClose={() => setPersonDetailId(null)}
          contextKey={personDetailEmployee?.id}
          icon="fa-id-card"
          kicker="Medarbetare"
          title={personDetailEmployee?.name ?? 'Medarbetare'}
          description={personDetailEmployee ? `${personDetailEmployee.role} · ${personDetailEmployee.department}` : ''}
          activities={personDetailActivities}
          includeDefaultActivities={false}
          details={personDetailEmployee ? (
            <PersonDetailCard
              employee={personDetailEmployee}
              competencies={getEmployeeCompetencies(personDetailEmployee.role)}
              shiftDates={personDetailShiftDates}
              selectedDate={personDetailDate}
              onSelectDate={setPersonDetailDate}
              activitySchedules={personDetailSchedules}
              hospitalMode={alwaysShowResourceNeeds}
            />
          ) : null}
          actions={personDetailEmployee && <div className="case-activity-action-buttons">
            <button type="button" className="btn-primary" disabled={!personDetailDate} onClick={() => personDetailDate && handlePersonReportSick(personDetailDate)}><i className="fa-solid fa-calendar-xmark" /> Sjukanmäl</button>
            <button type="button" className="btn-secondary" onClick={handleShowPersonInSchedule}><i className="fa-solid fa-calendar-days" /> Visa i schema</button>
          </div>}
          onPostMessage={personDetailEmployee ? activity => addPersonActivity(personDetailEmployee.id, activity) : undefined}
        />

        <CaseActivityModal
          isOpen={Boolean(substituteDetail && substituteDetailState)}
          onClose={handleCloseSubstituteDetails}
          contextKey={substituteDetail ? `${substituteDetail.id}|${substituteDetailState?.dateStr ?? ''}` : undefined}
          icon="fa-user-nurse"
          kicker={alwaysShowResourceNeeds ? 'Kandidat' : 'Vikarie'}
          title={substituteDetail?.name ?? (alwaysShowResourceNeeds ? 'Kandidat' : 'Vikarie')}
          description={substituteDetail ? `${substituteDetail.role} · ${substituteDetail.category} · ${substituteDetail.costLevel}` : ''}
          status={substituteDetailStatusLabel ? { label: substituteDetailStatusLabel, tone: substituteDetailStatusTone } : undefined}
          activities={substituteDetailActivities}
          includeDefaultActivities={false}
          details={substituteDetail && substituteDetailState ? (
            <SubstituteDetailCard
              substitute={substituteDetail}
              details={substituteDetailInfo}
              preschoolMode={alwaysShowResourceNeeds}
              dateStr={substituteDetailState.dateStr}
              dateOptions={substituteDetailDates}
              availability={substituteDetailAvailability}
              booking={substituteDetailBooking}
              absenceReason={substituteDetailAbsence}
              onSelectDate={dateStr => setSubstituteDetailState(current => current ? { ...current, dateStr } : current)}
              onSaveAvailability={availability => handleSetSubstituteAvailability(substituteDetail.id, substituteDetailState.dateStr, availability)}
            />
          ) : null}
          actions={substituteDetail && substituteDetailState && <div className="case-activity-action-buttons">
            <button type="button" className="btn-primary" onClick={() => handleSendSubstituteRequest(substituteDetail.id)}><i className="fa-solid fa-paper-plane" /> Skicka förfrågan</button>
            {substituteDetailState.dateStr >= TODAY_STR && !substituteDetailBooking && !substituteDetailAbsence && substituteDetailAvailability && <button type="button" className="btn-secondary" onClick={() => handleSetSubstituteAvailability(substituteDetail.id, substituteDetailState.dateStr, null)}><i className="fa-solid fa-ban" /> Markera ej tillgänglig</button>}
            {substituteDetailState.dateStr >= TODAY_STR && !substituteDetailBooking && !substituteDetailAbsence && Object.prototype.hasOwnProperty.call(substituteAvailabilityOverrides, substituteDetailKey) && <button type="button" className="btn-secondary" onClick={() => handleRestoreSubstituteAvailability(substituteDetail.id, substituteDetailState.dateStr)}><i className="fa-solid fa-rotate-left" /> Återställ tillgänglighet</button>}
            {substituteDetailState.dateStr >= TODAY_STR && (substituteDetailAbsence
              ? <button type="button" className="btn-secondary" onClick={() => handleClearSubstituteSickness(substituteDetail.id, substituteDetailState.dateStr)}><i className="fa-solid fa-calendar-check" /> Ta bort sjukanmälan</button>
              : <button type="button" className="btn-secondary" onClick={() => handleReportSubstituteSick(substituteDetail.id, substituteDetailState.dateStr)}><i className="fa-solid fa-calendar-xmark" /> Sjukanmäl</button>)}
          </div>}
          onPostMessage={substituteDetail ? activity => addSubstituteActivity(substituteDetail.id, activity) : undefined}
        />

      </div>
    </PageLayout>
  );
};
