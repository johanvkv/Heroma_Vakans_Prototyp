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
import { CaseActivityModal } from '../components/CaseActivityModal';
import type { CaseActivity, CaseActivityResponse } from '../components/CaseActivityModal';

// ─── Types ───────────────────────────────────────────────────────────────────

type ShiftType    = 'morning' | 'day' | 'evening' | 'night';
type PeriodType   = 'dag' | 'arbetsvecka' | 'vecka' | 'manad' | 'period' | 'ar';
type ViewType     = 'day-columns' | 'month-columns' | 'year-columns';
type ColorScheme  = 'normal' | 'past' | 'absence' | 'vacant' | 'filled';

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
interface OrganisationGroup { id: string; label: string; kind: 'clinic'|'department'|'team'; personIds: string[]; parentId?: string; }
interface ViewColumn       { date: Date; header: string; subHeader?: string; isWeekend?: boolean; }
interface ShiftFill        { personId: string; dateStr: string; fillType: 'substitute'|'extra'; person: { name: string; role: string }; }
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
type ResourceOrderStatus = 'Beställd' | 'Under behandling' | 'Förfrågan skickad' | 'Tillsatt' | 'Avbruten';
type ResourceResponseStatus = 'Avvaktar' | 'Tillgänglig' | 'Kan inte';
interface ResourceOrderInvite {
  substituteId: string;
  name: string;
  role: string;
  response: ResourceResponseStatus;
  responseText?: string;
}
interface SubstituteCandidate { id: string; name: string; role: string; category: string; }
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
}
interface ConfirmState {
  substitutes: SubstituteCandidate[];
  targetPersonId: string;
  targetDateStr: string;
  targetShift: Shift;
  fillType: 'substitute' | 'extra';
  unit: string;
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

// ─── Constants ───────────────────────────────────────────────────────────────

const TODAY_STR = '2026-09-03';

type ContextTargetType = 'absence' | 'vacant' | 'normal';
type ContextActionId = 'find-substitute' | 'make-vacancy' | 'primary' | 'order-resource' | 'show-details' | 'simulate' | 'create-absence';
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

function getContextActions(type: ContextTargetType): ContextAction[] {
  if (type === 'absence') {
    return [
      { id: 'find-substitute', text: 'Hitta vikarie', icon: 'user' },
      { id: 'order-resource', text: 'Beställ resurs', icon: 'cart-shopping' },
      { id: 'make-vacancy', text: 'Gör till vakans', icon: 'user-clock' },
      { id: 'simulate', text: 'Simulera', icon: 'flask', beginGroup: true },
      { id: 'show-details', text: 'Visa frånvarodetaljer', icon: 'circle-info', beginGroup: true },
    ];
  }
  return [
    {
      id: 'primary',
      text: type === 'vacant' ? 'Hitta vikarie' : 'Boka extrapass',
      icon: type === 'vacant' ? 'user' : 'plus',
    },
    { id: 'order-resource', text: 'Beställ resurs', icon: 'cart-shopping' },
    { id: 'simulate', text: 'Simulera', icon: 'flask', beginGroup: true },
    { id: 'create-absence', text: 'Skapa frånvaro', icon: 'calendar-xmark' },
    { id: 'show-details', text: 'Visa passdetaljer', icon: 'circle-info', beginGroup: true },
  ];
}

const SUBSTITUTE_CANDIDATES: SubstituteCandidate[] = [
  { id: 'sub1', name: 'Anna Viksson', role: 'Undersköterska', category: 'Timanställd' },
  { id: 'sub2', name: 'Erik Lindqvist', role: 'Sjuksköterska', category: 'Pool' },
  { id: 'sub3', name: 'Maria Svensson', role: 'Undersköterska', category: 'Timanställd' },
  { id: 'sub4', name: 'Jonas Berg', role: 'Sjuksköterska', category: 'Pensionär' },
  { id: 'sub5', name: 'Karin Nilsson', role: 'Undersköterska', category: 'Samverkanspass' },
  { id: 'sub6', name: 'Peter Holm', role: 'Sjuksköterska', category: 'Pool' },
  { id: 'sub7', name: 'Sara Lundberg', role: 'Undersköterska', category: 'Timanställd' },
  { id: 'sub8', name: 'Anders Persson', role: 'Sjuksköterska', category: 'Övrig' },
];

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
  sub5: [{ dateStr: TODAY_STR,    start: '22:00', end: '06:00' }],
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
const SUBSTITUTE_COMPETENCIES = [...new Set(Object.values(SUB_DETAILS).flatMap(details => details.competencies))]
  .sort((a, b) => a.localeCompare(b, 'sv'))
  .map(competency => ({ id: competency, label: competency }));

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
  { substituteId: 'sub1', name: 'Anna Viksson', role: 'Undersköterska', response: 'Tillgänglig', responseText: 'Jag kan ta passet.' },
  { substituteId: 'sub2', name: 'Erik Lindqvist', role: 'Sjuksköterska', response: 'Kan inte', responseText: 'Jag är redan bokad.' },
  { substituteId: 'sub3', name: 'Maria Svensson', role: 'Undersköterska', response: 'Avvaktar' },
];
const TIME_PERIODS   = [{ id:'dag',label:'Dag'},{id:'arbetsvecka',label:'Arbetsvecka'},{id:'vecka',label:'Vecka'},{id:'manad',label:'Månad'},{id:'period',label:'Period'},{id:'ar',label:'År'}];
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

const ABSENCE_SHIFTS: Record<string,Shift> = {
  [`${_pid0}|${TODAY_STR}`]: { type:'day',     start:'08:00', end:'17:00' },
  [`${_pid1}|2026-09-04`]:   { type:'evening', start:'14:30', end:'22:30' },
  [`${_pid2}|2026-09-05`]:   { type:'morning', start:'06:45', end:'15:00' },
  [`${_pid2}|2026-09-06`]:   { type:'morning', start:'06:45', end:'15:00' },
  [`${_pid2}|2026-09-07`]:   { type:'day',     start:'08:00', end:'17:00' },
  [`${_pid3}|2026-09-05`]:   { type:'night',   start:'22:00', end:'06:00' },
  [`${_pid3}|2026-09-07`]:   { type:'evening', start:'14:30', end:'22:30' },
  [`${_pid4}|${TODAY_STR}`]: { type:'morning', start:'06:45', end:'15:00' },
  [`${_pid4}|2026-09-06`]:   { type:'day',     start:'08:00', end:'17:00' },
  [`${_pid5}|2026-09-04`]:   { type:'night',   start:'22:00', end:'06:00' },
  [`${_pid5}|2026-09-06`]:   { type:'morning', start:'06:45', end:'15:00' },
};

// Runtime-created absences are kept alongside the seeded examples so all existing
// schedule helpers (colour, vacancy handling and details) treat them as real absences.
const RUNTIME_ABSENCE_SHIFTS: Record<string, Shift> = { ...ABSENCE_SHIFTS };
const RUNTIME_ABSENCE_REASONS: Record<string, AbsenceReason> = {};
const RUNTIME_SHIFT_OVERRIDES: Record<string, Shift> = {};

// Specific pass info text per shift cell ("Vak", "Bil", etc.)
const SHIFT_PASS_INFO: Record<string, string> = {
  [`${_pid0}|${TODAY_STR}`]: 'Vak',
  [`${_pid2}|2026-09-05`]:   'Bil',
  [`${_pid3}|2026-09-05`]:   'Vak',
  [`${_pid4}|${TODAY_STR}`]: 'Vak',
  [`${_pid5}|2026-09-06`]:   'Bil',
};

// Akut: same day OR "Vak" task type
function isAkutShift(personId: string, dateStr: string): boolean {
  if (dateStr === TODAY_STR) return true;
  return SHIFT_PASS_INFO[`${personId}|${dateStr}`] === 'Vak';
}

function getShiftPassInfo(personId: string, dateStr: string): string {
  return SHIFT_PASS_INFO[`${personId}|${dateStr}`] ?? '';
}

const INITIAL_FILLS: ShiftFill[] = _pid1
  ? [{ personId:_pid1, dateStr:TODAY_STR, fillType:'substitute', person:{ name:'Anna Viksson', role:'Undersköterska' } }]
  : [];

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
  const n: Record<PeriodType,number>={dag:1,arbetsvecka:5,vecka:7,period:7,manad:30,ar:365};
  return addDays(from, dir*n[period]);
}
function periodLabel(vs: Date, p: PeriodType): string {
  if (p==='dag')   return fmtDay(vs);
  if (p==='manad') return `${MTH_SHORT[vs.getMonth()]} ${vs.getFullYear()}`;
  if (p==='ar')    return `${vs.getFullYear()}`;
  const end=addDays(vs,p==='arbetsvecka'?4:6);
  return `${fmtMid(vs)} – ${fmtLong(end)}`;
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

const CARE_ROLES = [
  'Sjuksköterska', 'Undersköterska', 'Läkare', 'Fysioterapeut', 'Vårdadministratör',
  'Sjuksköterska', 'Undersköterska', 'Läkare', 'Medicinsk sekreterare', 'Arbetsterapeut',
  'Sjuksköterska', 'Undersköterska', 'Läkare', 'Sjuksköterska', 'Vårdadministratör',
  'Sjuksköterska', 'Undersköterska', 'Läkare', 'Medicinsk sekreterare', 'Fysioterapeut',
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
): SubstituteCandidate[] {
  const [sH,sM]=shift.start.split(':').map(Number);
  const [eH,eM]=shift.end.split(':').map(Number);
  const shiftStart=sH*60+sM;
  const shiftEnd=(eH*60+eM) <= shiftStart ? eH*60+eM+1440 : eH*60+eM;
  const requiredMinutes=Math.max(0, shiftEnd-shiftStart-flexibilityHours*60);
  return SUBSTITUTE_CANDIDATES.filter(sub => {
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

// ─── Shift cell sub-components ────────────────────────────────────────────────

function ShiftDayCell({ shift, color, passInfo, isAkut, orderedBy }: { shift: Shift; color: ColorScheme; passInfo?: string; isAkut?: boolean; orderedBy?: string }) {
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
        {color === 'vacant' && <span className="schema-vacancy-badge"><i className="fa-solid fa-user-plus" /> Vakans</span>}
        {orderedBy && <span className="schema-order-badge" title={`Beställd av ${orderedBy}`}><i className="fa-solid fa-cart-shopping" /><span className="schema-order-badge-text">Beställd av {orderedBy}</span></span>}
      </div>
    </div>
  );
}

function ShiftMonthCell({ shift, color, passInfo, isAkut, orderedBy }: { shift: Shift; color: ColorScheme; passInfo?: string; isAkut?: boolean; orderedBy?: string }) {
  const cap  = `schema-col-${color}-cap`;
  const main = `schema-col-${color}-main`;
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
        {color === 'vacant' && <span className="schema-vacancy-badge schema-vacancy-badge-month" title="Vakans"><i className="fa-solid fa-user-plus" /></span>}
        {orderedBy && <span className="schema-order-badge schema-order-badge-month" title={`Beställd av ${orderedBy}`}><i className="fa-solid fa-cart-shopping" /><span className="schema-order-badge-text">Beställd av {orderedBy}</span></span>}
      </div>
    </div>
  );
}

// ─── Substitute panel ─────────────────────────────────────────────────────────

interface SubstitutePanelProps {
  isOpen: boolean;
  browseAll: boolean;
  state: SubPanelState | null;
  columns: ViewColumn[];
  viewType: ViewType;
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
  isOpen, browseAll, state, columns, viewType,
  onClose, onSendRequest, onOpenDetails, onSetAvailability, onRestoreAvailability, onReportSick, onClearSickness,
  availabilityOverrides, absences,
  onDragStart, scrollRef, tableWidth, tableInset,
}: SubstitutePanelProps) {
  const [filterRoles, setFilterRoles] = useState<string[]>([]);
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
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
    setFilterCompetencies([]);
    setFilterPass('alla');
    setTimeFlexibility(1);
    setSelectedSubIds([]);
    setExpandedSubId(null);
  }, [browseAll, state?.dateStr, state?.personId]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedSubId(prev => prev === id ? null : id);
  }, []);

  const browseShift: Shift | null = useMemo(() => {
    if (filterPass === 'alla') return browseAll ? null : state?.shift ?? null;
    const t = PASS_TO_SHIFT[filterPass];
    return { type: t, ...SHIFT_DEFS[t] };
  }, [browseAll, filterPass, state?.shift]);

  const availSubs = useMemo(() => {
    const matchesFilters = (sub: SubstituteCandidate) => {
      if (filterRoles.length > 0 && !filterRoles.includes(sub.role)) return false;
      if (filterCategories.length > 0 && !filterCategories.includes(sub.category)) return false;
      if (filterCompetencies.length > 0) {
        const competencies = SUB_DETAILS[sub.id]?.competencies ?? [];
        if (!filterCompetencies.some(competency => competencies.includes(competency))) return false;
      }
      return true;
    };
    let list: SubstituteCandidate[];
    if (browseAll) {
      list = SUBSTITUTE_CANDIDATES.filter(sub => {
        if (!matchesFilters(sub)) return false;
        if (browseShift) {
          const hasMatchingAvailability = columns.some(column => {
            const dateStr = toDateStr(column.date);
            if (isSubstituteBooked(sub.id, dateStr)) return false;
            const avail = getSubAvailability(sub.id, column.date, availabilityOverrides, absences);
            return Boolean(avail && subAvailPct(avail, browseShift) > 0);
          });
          if (!hasMatchingAvailability) return false;
        }
        return true;
      });
      if (browseShift) {
        list = [...list].sort((a, b) => {
          const bestScore = (substituteId: string) => Math.max(...columns.map(column =>
            suitabilityScore(substituteId, column.date, browseShift, availabilityOverrides, absences)
          ));
          return bestScore(b.id) - bestScore(a.id);
        });
      } else {
        list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'sv'));
      }
    } else {
      list = state && browseShift
        ? getAvailableSubs(browseShift, parseDate(state.dateStr), timeFlexibility, availabilityOverrides, absences).filter(matchesFilters)
        : [];
      if (state && browseShift) {
        const date = parseDate(state.dateStr);
        list = [...list].sort((a, b) =>
          suitabilityScore(b.id, date, browseShift, availabilityOverrides, absences)
          - suitabilityScore(a.id, date, browseShift, availabilityOverrides, absences)
        );
      }
    }
    return list;
  }, [absences, availabilityOverrides, browseAll, filterRoles, filterCategories, filterCompetencies, browseShift, columns, state, timeFlexibility]);

  const panelClass = `schema-sub-panel${isOpen ? ' schema-sub-panel-open' : ''}`;
  const fillLabel = 'Vikarier';
  const viewColumnWidth = VIEW_COLUMN_WIDTH[viewType];
  const tableMinWidth = getScheduleTableMinWidth(viewType, columns.length);

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
          disabled={selectedSubIds.length === 0}
          onClick={() => onSendRequest(selectedSubIds)}
        >
          <i className="fa-solid fa-paper-plane" />
          Skicka förfrågan
        </button>
        <div className="schema-sub-filter-fields">
          <TagBox
            dataSource={SUBSTITUTE_ROLES}
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
          <TagBox
            dataSource={SUBSTITUTE_CATEGORIES}
            displayExpr="label"
            valueExpr="id"
            value={filterCategories}
            onValueChanged={e => setFilterCategories(current => preserveStringArrayWhenUnchanged(current, normalizeFilterValues(e.value)))}
            placeholder="Filtrera på typ..."
            hint="Typ"
            showSelectionControls={true}
            showClearButton={true}
            applyValueMode="instantly"
            multiline={false}
            stylingMode="outlined"
            width={190}
          />
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
            dataSource={SUBSTITUTE_COMPETENCIES}
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
          {!browseAll && state && (
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
        <span className="schema-sub-send-hint">Markera vikarier i listan nedan</span>
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
                {(() => {
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
                const details      = SUB_DETAILS[sub.id];
                const atlPct       = details ? Math.round(details.atlHours / details.maxAtlHours * 100) : 0;
                const bookedShifts = SUB_BOOKED_SHIFTS[sub.id] ?? [];

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
                            type="checkbox"
                            data-sub-id={sub.id}
                            className="schema-sub-checkbox"
                            aria-label={`Välj ${sub.name}`}
                            checked={selectedSubIds.includes(sub.id)}
                            onChange={() => setSelectedSubIds(current => current.includes(sub.id)
                              ? current.filter(id => id !== sub.id)
                              : [...current, sub.id])}
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
                           <span className="schema-employee-role">{sub.role} · {sub.category}</span>
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
                                  {bar24(avail.startH, avail.startM, avail.endH, avail.endM, isPast ? 'schema-sub-bar24-past' : 'schema-sub-bar24-avail')}
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
                            {details && details.competencies.length > 0 && (
                              <div className="schema-sub-expand-section">
                                <span className="schema-sub-expand-label">Kompetenser</span>
                                <div className="schema-sub-comp-list">
                                  {details.competencies.slice(0, 3).map(c => (
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
  const title = state.fillType === 'substitute' ? 'Skicka förfrågan' : 'Boka extrapass';
  return (
    <Popup visible={true} onHiding={onCancel} title={title} width={500} height="auto" showCloseButton={true} dragEnabled={false}>
      <div className="schema-dialog-content">
        <div className="schema-confirm-details">
          <div className="schema-confirm-row">
            <i className="fa-solid fa-calendar-days" />
            <span>{state.targetDateStr}</span>
          </div>
          <div className="schema-confirm-row">
            <i className="fa-solid fa-clock" />
            <span>{state.targetShift.start}–{state.targetShift.end}</span>
          </div>
          <div className="schema-confirm-row">
            <i className="fa-solid fa-user-plus" />
            <div className="schema-confirm-subs">
              {state.substitutes.map((s, i) => (
                <div key={i} className="schema-confirm-sub-item">
                  <strong>{s.name}</strong>
                  <span> · {s.role}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="schema-confirm-row">
            <i className="fa-solid fa-building" />
            <label>Enhet<select value={unit} onChange={e => setUnit(e.currentTarget.value)}>{SUBSTITUTE_UNITS.map(option => <option key={option.id} value={option.label}>{option.label}</option>)}</select></label>
          </div>
        </div>
        <div className="schema-confirm-note-label">Ytterligare information</div>
        <TextArea
          value={msg}
          onValueChanged={e => setMsg(e.value ?? '')}
          height={90}
          stylingMode="outlined"
          placeholder="Skriv eventuell information till vikarien..."
        />
        <div className="schema-dialog-actions">
          <button className="btn-primary" disabled={!unit} onClick={() => onConfirm(msg)}>Skicka</button>
          <button className="btn-secondary" onClick={onCancel}>Avbryt</button>
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

function PassDetailCard({ state, onSaveTime, onPrimaryAction, onCreateOrder, onReportSick, onSimulate }: {
  state: DetailState;
  onSaveTime: (start: string, end: string) => void;
  onPrimaryAction?: () => void;
  onCreateOrder: () => void;
  onReportSick: () => void;
  onSimulate: () => void;
}) {
  const [start, setStart] = useState(state.shift.start);
  const [end, setEnd] = useState(state.shift.end);
  useEffect(() => { setStart(state.shift.start); setEnd(state.shift.end); }, [state.shift.start, state.shift.end]);
  const isVacant = state.color === 'vacant';
  const isAbsent = state.color === 'absence';
  const isPast   = state.color === 'past';
  const akut     = isAkutShift(state.empId, state.dateStr) && isVacant;
  const timeChanged = start !== state.shift.start || end !== state.shift.end;
  const statusLabel = isVacant ? (akut ? 'Akut vakans' : 'Vakans') : isAbsent ? 'Frånvaro' : state.color === 'filled' ? 'Tillsatt' : isPast ? 'Historiskt pass' : 'Planerat';
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
        <div><dt>Passtyp</dt><dd>{SHIFT_LABELS[state.shift.type]}{getShiftPassInfo(state.empId, state.dateStr) ? ` · ${getShiftPassInfo(state.empId, state.dateStr)}` : ''}</dd></div>
        <div><dt>Status</dt><dd><span className={`schema-detail-status schema-detail-status-${state.color}`}>{statusLabel}</span></dd></div>
      </dl>
      {!isPast && <div className="order-detail-actions">
        {primaryLabel && onPrimaryAction && <button className="btn-primary" onClick={onPrimaryAction}><i className={`fa-solid ${primaryIcon}`} /> {primaryLabel}</button>}
        <button className="btn-secondary" onClick={onCreateOrder}><i className="fa-solid fa-cart-shopping" /> Beställ resurs</button>
        {!isAbsent && !isVacant && <button className="btn-secondary" onClick={onReportSick}><i className="fa-solid fa-calendar-xmark" /> Sjukanmäl</button>}
        <button className="btn-secondary" onClick={onSimulate}><i className="fa-solid fa-flask" /> Simulera urval</button>
      </div>}
    </div>
  );
}

function PersonDetailCard({ employee, competencies, shiftDates, onReportSick, onShowSchedule }: {
  employee: ScheduleEmployee;
  competencies: string[];
  shiftDates: string[];
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
      <div className="order-detail-actions">
        <button className="btn-primary" disabled={!selectedDate} onClick={() => selectedDate && onReportSick(selectedDate)}><i className="fa-solid fa-calendar-xmark" /> Sjukanmäl</button>
        <button className="btn-secondary" onClick={onShowSchedule}><i className="fa-solid fa-calendar-days" /> Visa i schema</button>
      </div>
    </div>
  );
}

function SubstituteDetailCard({ substitute, details, dateStr, dateOptions, availability, hasAvailabilityOverride, booking, absenceReason, onSelectDate, onSaveAvailability, onMarkUnavailable, onRestoreAvailability, onReportSick, onClearSickness, onSendRequest }: {
  substitute: SubstituteCandidate;
  details: SubstituteDetails;
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
      <p className="order-detail-role">{substitute.role} · {substitute.category}</p>
      <dl>
        <div><dt>Kontakt</dt><dd><a href={`tel:${details.phone.replace(/\s/g, '')}`}>{details.phone}</a><br /><a href={`mailto:${details.email}`}>{details.email}</a></dd></div>
        <div><dt>ATL</dt><dd>{details.atlHours} av {details.maxAtlHours} timmar</dd></div>
        <div><dt>Kompetenser</dt><dd><div className="person-detail-competencies">{details.competencies.map(competency => <span key={competency}>{competency}</span>)}</div></dd></div>
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
  if (order.status === 'Avbruten') return [];
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

function OrderDetailCard({ order, onChooseSubstitute, onAction, onSaveTime }: {
  order: ResourceOrder;
  onChooseSubstitute: (order: ResourceOrder) => void;
  onAction: (orderId: string, action: OrderContextAction) => void;
  onSaveTime: (orderId: string, start: string, end: string) => void;
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
        {order.status !== 'Tillsatt' && order.status !== 'Avbruten' && <button className="btn-primary" onClick={() => onChooseSubstitute(order)}><i className="fa-solid fa-user-plus" /> Välj vikarie</button>}
        {getOrderContextActions(order).map(action => <button key={action.id + (action.substituteId ?? '')} className="btn-secondary" onClick={() => onAction(order.id, action)}><i className={`fa-solid fa-${action.icon}`} /> {action.text}</button>)}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface SchemaProps {
  breadcrumbSectionLabel?: string;
  hideMinimumStaffing?: boolean;
  useAlternativeOrganisationVisualization?: boolean;
}

export const Schema = ({
  breadcrumbSectionLabel = 'Tid & Bemanning',
  hideMinimumStaffing = false,
  useAlternativeOrganisationVisualization = false,
}: SchemaProps) => {
  const navigateTo = useNavigate();
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Heroma', href: '/' },
    { label: breadcrumbSectionLabel },
    { label: 'Schema', isActive: true },
  ];

  // ── Filter state ──
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedPass,   setSelectedPass]   = useState('alla');
  const [textFilter,     setTextFilter]     = useState('');
  const [period,         setPeriod]         = useState<PeriodType>('vecka');
  const [showVacancies,  setShowVacancies]  = useState(false);
  const [showOrders,     setShowOrders]     = useState(false);
  const [activeView,     setActiveView]     = useState<'schema' | 'orders'>('schema');
  const [viewStart, setViewStart] = useState<Date>(() => monWeekStart(new Date(TODAY_STR)));

  // ── Fills ──
  const [fills, setFills] = useState<ShiftFill[]>(INITIAL_FILLS);
  const [resourceOrders, setResourceOrders] = useState<ResourceOrder[]>([]);
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

  const addOrderActivity = useCallback((orderId: string, activity: Omit<CaseActivity, 'id'>) => {
    setOrderActivities(current => ({
      ...current,
      [orderId]: [...(current[orderId] ?? []), { ...activity, id: Date.now() + Math.floor(Math.random() * 1000) }],
    }));
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
  const [contextActions, setContextActions] = useState<ContextAction[]>(() => getContextActions('vacant'));
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
        setContextActions(getContextActions(ctxRef.current.type));
      } else {
        ctxRef.current = null;
      }
    };
    document.addEventListener('contextmenu', onCtx, true);
    return () => document.removeEventListener('contextmenu', onCtx, true);
  }, []);

  // ── Employees ──
  const employees = useMemo<ScheduleEmployee[]>(() =>
    persons.map((p, index) => {
      const emp = getActiveEmployment(p.id) ?? p.employments[0];
      const departmentIndex = Math.floor(index / 10);
      const teamIndex = Math.floor((index % 10) / 5);
      const department = ORGANISATION.departments[departmentIndex];
      return {
        id:         p.id,
        name:       p.displayName || fullName(p),
        role:       CARE_ROLES[index] ?? emp?.position.title ?? '—',
        // Keep the displayed workplace aligned with the organisation tree below.
        // The seed data contains legacy HR/test departments that should not be
        // shown as the employee's current workplace in this prototype.
        organisation: department
          ? `Team ${teamIndex + 1}, ${department.label}, ${ORGANISATION.clinic.label}`
          : ORGANISATION.clinic.label,
        department: department?.label ?? emp?.organization.department ?? '—',
        fmgGroup:   emp?.fmgGroup ?? '—',
      };
    }),
  []);

  const columns  = useMemo(() => getColumns(viewStart, period),  [viewStart, period]);
  const viewType = useMemo(() => getViewType(period),            [period]);
  const pLabel   = useMemo(() => periodLabel(viewStart, period), [viewStart, period]);
  const viewColumnWidth = VIEW_COLUMN_WIDTH[viewType];
  const scheduleTableMinWidth = getScheduleTableMinWidth(viewType, columns.length);

  const personDetailEmployee = personDetailId
    ? employees.find(employee => employee.id === personDetailId) ?? null
    : null;
  const personDetailShiftDates = useMemo(() => {
    if (!personDetailEmployee) return [];
    return getPeriodDates(viewStart, period, columns)
      .filter(date => Boolean(getCellShift(personDetailEmployee.id, date, 'alla')))
      .map(toDateStr);
  }, [absenceVersion, columns, period, personDetailEmployee, viewStart]);
  const passDetailKey = detailState ? `${detailState.empId}|${detailState.dateStr}` : '';
  const passDetailActivities = useMemo<CaseActivity[]>(() => {
    if (!detailState) return [];
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
    return [...activities, ...(passActivities[passDetailKey] ?? [])];
  }, [detailState, passActivities, passDetailKey]);
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
    ? SUBSTITUTE_CANDIDATES.find(substitute => substitute.id === substituteDetailState.substituteId) ?? null
    : null;
  const substituteDetailInfo = substituteDetail ? SUB_DETAILS[substituteDetail.id] : null;
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
    ? getSubAvailability(substituteDetailState.substituteId, parseDate(substituteDetailState.dateStr), substituteAvailabilityOverrides, substituteAbsences)
    : null;
  const substituteDetailBooking = substituteDetailState
    ? (SUB_BOOKED_SHIFTS[substituteDetailState.substituteId] ?? []).find(booking => booking.dateStr === substituteDetailState.dateStr)
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
          return vacancyKeys.includes(`${emp.id}|${ds}`) &&
            !fills.some(f => f.personId === emp.id && f.dateStr === ds);
        })
      );
    }
    return list;
  }, [employees, selectedGroups, textFilter, showVacancies, columns, fills, vacancyKeys]);

  const positiveResponseCount = resourceOrders.reduce((count, order) => {
    if (order.status === 'Tillsatt' || order.status === 'Avbruten') return count;
    return count + order.invitedSubstitutes.filter(invite => invite.response === 'Tillgänglig').length;
  }, 0);

  const availableGroups = useMemo(() => {
    return [
      { id:'alla', label:'Alla medarbetare', category:'team' as const },
      ...ALL_GROUPS.filter(g => g.id !== 'alla'),
    ];
  }, []);

  // Prototype organisation: 20 people split into four credible teams of five.
  // The grouping is kept in the schedule view so every summary uses the same day cells as employees.
  const organisationGroups = useMemo(() => {
    const ids = filteredEmployees.map(employee => employee.id);
    const result: OrganisationGroup[] = [
      { id: ORGANISATION.clinic.id, label: ORGANISATION.clinic.label, kind: 'clinic', personIds: ids },
    ];
    ORGANISATION.departments.forEach((department, departmentIndex) => {
      const departmentIds = ids.filter(id => {
        const originalIndex = employees.findIndex(employee => employee.id === id);
        return originalIndex >= departmentIndex * 10 && originalIndex < (departmentIndex + 1) * 10;
      });
      result.push({ ...department, kind: 'department', personIds: departmentIds });
      [0, 1].forEach(teamIndex => {
        result.push({
          id: `${department.id}-team-${teamIndex + 1}`,
          label: `Team ${teamIndex + 1}`,
          kind: 'team',
          parentId: department.id,
          personIds: departmentIds.filter(id => {
            const originalIndex = employees.findIndex(employee => employee.id === id);
            return originalIndex % 10 >= teamIndex * 5 && originalIndex % 10 < (teamIndex + 1) * 5;
          }),
        });
      });
    });
    return result;
  }, [employees, filteredEmployees]);

  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  const toggleGroup = (id: string) => setCollapsedGroups(current =>
    current.includes(id) ? current.filter(groupId => groupId !== id) : [...current, id],
  );

  const minimumKey = (group: OrganisationGroup, passType: string) => `${group.id}|${passType}`;
  const minimumFor = (group: OrganisationGroup, passType = selectedPass === 'alla' ? 'dag' : selectedPass) =>
    minimumValues[minimumKey(group, passType)] ?? Math.ceil(group.personIds.length * 0.6);

  const passTypesForTeam = (group: OrganisationGroup) => PASS_TYPES.filter(pass => pass.id !== 'alla' && group.personIds.some(personId =>
    columns.some(column => Boolean(getCellShift(personId, column.date, pass.id))),
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
      return dates.some(date => hasPoolDuty(index, date));
    }).length;
  };

  const teamBelowMinimum = (group: OrganisationGroup, col: ViewColumn) => {
    if (group.kind !== 'team' || selectedPass === 'alla') return false;
    const scheduled = group.personIds.filter(personId => Boolean(getCellShift(personId, col.date, selectedPass))).length;
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
          const shift = getCellShift(id, date, selectedPass);
          if (shift) {
            if (RUNTIME_ABSENCE_SHIFTS[`${id}|${toDateStr(date)}`]) absent += 1;
            else present += 1;
          }
          if (hasPoolDuty(employees.findIndex(employee => employee.id === id), date)) pool += 1;
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
      if (getCellShift(id, col.date, selectedPass)) {
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
      <tr key={group.id} className={`schema-org-row schema-org-${group.kind}`}>
        <td
          className="schema-employee-cell schema-org-label-cell"
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
          const coverageTotal = Math.max(1, summary.present + summary.absent);
          const presentRatio = summary.present / coverageTotal * 100;
          const absentRatio = (summary.present + summary.absent) / coverageTotal * 100;
          return (
            <td key={index} className={['schema-day-cell', 'schema-org-summary-cell', col.isWeekend ? 'schema-weekend-cell' : '', toDateStr(col.date) === TODAY_STR ? 'schema-today-col' : '', belowMinimum ? 'schema-org-under-minimum' : ''].filter(Boolean).join(' ')} title={belowMinimum ? 'Ett eller flera team ligger under minimibemanning' : undefined}>
              {useAlternativeOrganisationVisualization ? (
                <div className="schema-org-coverage-content" aria-label={`${summary.present} på plats, ${summary.absent} frånvarande, ${summary.pool} i pool`}>
                  <div
                    className="schema-org-coverage-ring"
                    style={{ background: `conic-gradient(#31a875 0 ${presentRatio}%, #d66b73 ${presentRatio}% ${absentRatio}%, #e6e6e6 ${absentRatio}% 100%)` }}
                  >
                    <span>{summary.present}</span>
                  </div>
                  <span className="schema-org-summary-numbers"><b>{summary.present} av {group.personIds.length}</b></span>
                  <span className="schema-org-coverage-label">på plats</span>
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

  const isPersonVisible = (personId: string) => {
    if (collapsedGroups.includes(ORGANISATION.clinic.id)) return false;
    const index = employees.findIndex(employee => employee.id === personId);
    const department = ORGANISATION.departments[Math.floor(index / 10)];
    if (!department || collapsedGroups.includes(department.id)) return false;
    return !collapsedGroups.includes(`${department.id}-team-${Math.floor((index % 10) / 5) + 1}`);
  };

  const visibleEmployees = filteredEmployees.filter(emp => isPersonVisible(emp.id));
  type ScheduleRow =
    | { type: 'group'; group: OrganisationGroup }
    | { type: 'employee'; employee: typeof employees[number] };

  // Build the visible rows as a real tree projection. This keeps sibling branches intact
  // regardless of which department or team is opened or closed.
  const scheduleRows: ScheduleRow[] = [];
  const clinicGroup = organisationGroups.find(group => group.kind === 'clinic');
  if (clinicGroup) scheduleRows.push({ type: 'group', group: clinicGroup });
  if (!collapsedGroups.includes(ORGANISATION.clinic.id)) {
    ORGANISATION.departments.forEach(department => {
      const departmentGroup = organisationGroups.find(group => group.id === department.id);
      if (!departmentGroup || departmentGroup.personIds.length === 0) return;
      scheduleRows.push({ type: 'group', group: departmentGroup });
      if (collapsedGroups.includes(department.id)) return;
      [0, 1].forEach(teamIndex => {
        const teamId = `${department.id}-team-${teamIndex + 1}`;
        const teamGroup = organisationGroups.find(group => group.id === teamId);
        if (!teamGroup || teamGroup.personIds.length === 0) return;
        scheduleRows.push({ type: 'group', group: teamGroup });
        if (collapsedGroups.includes(teamId)) return;
        teamGroup.personIds.forEach(personId => {
          const employee = filteredEmployees.find(item => item.id === personId);
          if (employee && isPersonVisible(employee.id)) scheduleRows.push({ type: 'employee', employee });
        });
      });
    });
  }

  // ── Handlers: navigation / filters ──
  const navigate = (dir: 1|-1) => setViewStart(prev => navStep(period, dir, prev));

  const changePeriod = (p: PeriodType) => {
    setPeriod(p);
    if (p==='manad') setViewStart(monthStart(new Date(TODAY_STR)));
    else if (p==='ar') setViewStart(yearStart(new Date(TODAY_STR)));
    else setViewStart(monWeekStart(new Date(TODAY_STR)));
  };

  // ── Handlers: sub panel ──
  const handleOpenVacancyPanel = useCallback((personId: string, dateStr: string) => {
    const emp   = employees.find(e => e.id === personId);
    const shift = RUNTIME_ABSENCE_SHIFTS[`${personId}|${dateStr}`];
    if (!shift) return;
    setSubPanelState({ personId, dateStr, shift, fillType:'substitute', targetPersonName: emp?.name ?? '', targetUnit: emp?.department });
    setSubPanelBrowseAll(false);
    setSubPanelOpen(true);
  }, [employees]);

  const handleOpenExtraPanel = useCallback((personId: string, dateStr: string) => {
    const emp   = employees.find(e => e.id === personId);
    const shift = getCellShift(personId, parseDate(dateStr), 'alla');
    if (!shift) return;
    setSubPanelState({ personId, dateStr, shift, fillType:'extra', targetPersonName: emp?.name ?? '', targetUnit: emp?.department });
    setSubPanelBrowseAll(false);
    setSubPanelOpen(true);
  }, [employees]);

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
    const substitute = SUBSTITUTE_CANDIDATES.find(item => item.id === substituteId);
    setSubstituteAvailabilityOverrides(current => ({ ...current, [key]: availability }));
    addSubstituteActivity(substituteId, {
      type: 'status', author: 'Du', initials: 'JV', time: 'Just nu',
      text: availability ? 'Tillgänglighet ändrades' : 'Markerad som ej tillgänglig',
      detail: availability ? `${dateStr} · ${fmtAvailTime(availability)}` : `${dateStr} · ${substitute?.name ?? 'Vikarie'}`,
    });
  }, [addSubstituteActivity]);

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

  // ── Handlers: assign ──
  const openConfirm = useCallback((subs: SubstituteCandidate[], personId: string, dateStr: string, shift: Shift, fillType: 'substitute'|'extra') => {
    const employee = employees.find(item => item.id === personId);
    setConfirmState({ substitutes: subs, targetPersonId: personId, targetDateStr: dateStr, targetShift: shift, fillType, unit: employee?.department ?? SUBSTITUTE_UNITS[0].label });
  }, [employees]);

  const handleSendRequest = useCallback((selectedIds: string[]) => {
    if (selectedIds.length === 0) return;
    const subs = SUBSTITUTE_CANDIDATES.filter(s => selectedIds.includes(s.id));
    if (subs.length === 0) return;
    if (!subPanelState) {
      setOpenRequestState({ substitutes: subs, dateStr: toDateStr(columns[0]?.date ?? new Date(TODAY_STR)), shift: { type: 'day', ...SHIFT_DEFS.day }, role: subs[0]?.role ?? SUBSTITUTE_ROLES[0]?.id ?? '', unit: SUBSTITUTE_UNITS[0].label });
      setSubPanelOpen(false);
      return;
    }
    openConfirm(subs, subPanelState.personId, subPanelState.dateStr, subPanelState.shift, subPanelState.fillType);
    setSubPanelOpen(false);
  }, [subPanelState, openConfirm, columns]);

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
    if (orderAssignment) {
      const selectedNames = confirmState.substitutes.map(sub => sub.name).join(' · ');
      setFills(previous => [
        ...previous.filter(fill => !(fill.personId === orderAssignment.personId && fill.dateStr === orderAssignment.dateStr)),
        ...confirmState.substitutes.map(sub => ({
          personId: orderAssignment.personId,
          dateStr: orderAssignment.dateStr,
          fillType: orderAssignment.resourceType === 'vikarie' ? 'substitute' as const : 'extra' as const,
          person: { name: sub.name, role: sub.role },
        })),
      ]);
      setResourceOrders(previous => previous.map(item => item.id === orderAssignment.id
        ? { ...item, status: 'Tillsatt', acceptedSubstituteId: confirmState.substitutes[0]?.id }
        : item));
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
    confirmState.substitutes.forEach(sub => {
      setFills(prev => [...prev, {
        personId: confirmState.targetPersonId,
        dateStr:  confirmState.targetDateStr,
        fillType: confirmState.fillType,
        person:   { name: sub.name, role: sub.role },
      }]);
    });
    setConfirmState(null);
    setSubPanelOpen(false);
  }, [confirmState, orderAssignment, addOrderActivity]);

  const handleCancelConfirm = useCallback(() => setConfirmState(null), []);

  const handleSelectOrderCandidates = useCallback((candidateIds: string[]) => {
    if (!orderDetail || candidateIds.length === 0) return;
    const order = resourceOrders.find(item => item.id === orderDetail.id);
    if (!order) return;
    const selected = order.invitedSubstitutes.filter(invite => candidateIds.includes(invite.substituteId));
    if (selected.length === 0) return;
    setFills(previous => [
      ...previous.filter(fill => !(fill.personId === order.personId && fill.dateStr === order.dateStr)),
      ...selected.map(invite => ({
        personId: order.personId,
        dateStr: order.dateStr,
        fillType: order.resourceType === 'vikarie' ? 'substitute' as const : 'extra' as const,
        person: { name: invite.name, role: invite.role },
      })),
    ]);
    setResourceOrders(previous => previous.map(item => item.id === order.id
      ? { ...item, status: 'Tillsatt', acceptedSubstituteId: selected[0].substituteId }
      : item));
    addOrderActivity(order.id, {
      type: 'assignment', author: 'Du', initials: 'JV', time: 'Just nu',
      text: selected.length === 1 ? 'Vikarie vald' : 'Vikarier valda',
      detail: `${selected.map(invite => invite.name).join(' · ')} · ${order.shift.start}–${order.shift.end}`,
    });
  }, [orderDetail, resourceOrders, addOrderActivity]);

  // ── Handlers: shift detail dialog ──
  const handleOpenDetail = useCallback((
    empId: string, empName: string, empRole: string,
    dateStr: string, shift: Shift, color: ColorScheme,
  ) => {
    setDetailState({ empId, empName, empRole, dateStr, shift, color });
  }, []);

  const handleCloseDetail = useCallback(() => setDetailState(null), []);

  const openSicknessDialog = useCallback((personId: string, dateStr: string) => {
    const employee = employees.find(emp => emp.id === personId);
    const shift = getCellShift(personId, parseDate(dateStr), 'alla');
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
  }, [employees]);

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
    const shift = getCellShift(target.personId, parseDate(target.dateStr), 'alla');
    if (!employee || !shift) return;

    setResourceOrderDialogState({
      personId: target.personId,
      personName: employee.name,
      role: employee.role,
      dateStr: target.dateStr,
      shift,
      resourceType: target.type === 'normal' ? 'extrapass' : 'vikarie',
    });
  }, [employees]);

  const handleConfirmResourceOrder = useCallback((orderedShift: Shift, _msg: string) => {
    if (!resourceOrderDialogState) return;
    const { personId, personName, role, dateStr, resourceType } = resourceOrderDialogState;
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
  }, [resourceOrderDialogState, addOrderActivity]);

  const handleCancelResourceOrder = useCallback(() => setResourceOrderDialogState(null), []);

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
        passInfo: getShiftPassInfo(detailState.empId, detailState.dateStr),
      },
    });
    setDetailState(null);
  }, [detailState, employees, navigateTo]);

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
      { personId: order.personId, dateStr: order.dateStr, fillType: order.resourceType === 'vikarie' ? 'substitute' : 'extra', person: { name: substitute.name, role: substitute.role } },
    ]);
    setResourceOrders(previous => previous.map(item => item.id === order.id ? { ...item, status: 'Tillsatt', acceptedSubstituteId: substitute.id } : item));
    addOrderActivity(order.id, { type: 'assignment', author: 'Du', initials: 'JV', time: 'Just nu', text: 'Vikarie vald', detail: `${substitute.name} · ${order.shift.start}–${order.shift.end}` });
    setOrderAssignment(null);
  }, [orderAssignment, addOrderActivity]);

  const handleOrderAction = useCallback((orderId: string, action: OrderContextAction) => {
    const order = resourceOrders.find(item => item.id === orderId);
    if (!order) return;

    if (action.id === 'cancel-order') {
      setResourceOrders(previous => previous.map(item => item.id === orderId ? { ...item, status: 'Avbruten' } : item));
      addOrderActivity(orderId, { type: 'status', author: 'Du', initials: 'JV', time: 'Just nu', text: 'Beställningen avbröts', detail: `${order.personName} · ${order.dateStr}` });
      return;
    }

    if (action.id === 'start-processing') {
      setResourceOrders(previous => previous.map(item => item.id === orderId ? { ...item, status: 'Under behandling' } : item));
      addOrderActivity(orderId, { type: 'status', author: 'Lena Sjöberg', initials: 'LS', time: 'Just nu', text: 'Behandling påbörjad', detail: 'Beställningen har tagits över för handläggning.' });
      return;
    }

    if (action.id === 'send-order') {
      setResourceOrders(previous => previous.map(item => item.id === orderId
        ? { ...item, status: 'Förfrågan skickad', invitedSubstitutes: DEFAULT_ORDER_INVITES.map(invite => ({ ...invite })) }
        : item));
      addOrderActivity(orderId, { type: 'status', author: 'Lena Sjöberg', initials: 'LS', time: 'Just nu', text: 'Förfrågan skickad till vikarier', detail: DEFAULT_ORDER_INVITES.map(invite => invite.name).join(' · ') });
      const responseItems: CaseActivityResponse[] = DEFAULT_ORDER_INVITES.map(invite => ({
        id: invite.substituteId,
        name: invite.name,
        role: invite.role,
        response: invite.response === 'Tillgänglig' ? 'Ja' : invite.response === 'Kan inte' ? 'Nej' : invite.response === 'Avvaktar' ? 'Kanske' : 'Inget svar',
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
        },
      ]);
      setResourceOrders(previous => previous.map(item => item.id === orderId
        ? { ...item, status: 'Tillsatt', acceptedSubstituteId: invite.substituteId }
        : item));
      addOrderActivity(orderId, { type: 'assignment', author: 'Du', initials: 'JV', time: 'Just nu', text: 'Vikarie vald', detail: `${invite.name} · ${order.shift.start}–${order.shift.end}` });
    }
  }, [resourceOrders, addOrderActivity]);

  const handleCreateAbsence = useCallback(() => {
    if (!absenceDialogState) return;
    const { personId, personName, startDate, endDate, reason } = absenceDialogState;
    if (endDate < startDate) return;

    const start = parseDate(startDate);
    const end = parseDate(endDate);
    for (let date = new Date(start); date <= end; date = addDays(date, 1)) {
      const dateStr = toDateStr(date);
      const shift = getCellShift(personId, date, 'alla');
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
      }
    }
    setAbsenceDialogState(null);
    setAbsenceVersion(version => version + 1);
  }, [absenceDialogState, addPassActivity, addPersonActivity]);

  const handleContextAction = useCallback((event: { itemData?: ContextAction }) => {
    const target = ctxRef.current;
    const action = event.itemData?.id;
    if (!target || !action) return;

    if (action === 'make-vacancy') {
      const key = `${target.personId}|${target.dateStr}`;
      setVacancyKeys(previous => previous.includes(key) ? previous : [...previous, key]);
      const employee = employees.find(emp => emp.id === target.personId);
      const shift = getCellShift(target.personId, parseDate(target.dateStr), 'alla');
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
    if (action === 'primary') {
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
      const shift = getCellShift(target.personId, parseDate(target.dateStr), 'alla');
      if (employee && shift) {
        navigateTo('/vikariehantering/urvalstest', {
          state: {
            dateStr: target.dateStr,
            shift,
            employeeName: employee.name,
            employeeRole: employee.role,
            workplace: employee.department,
            passInfo: getShiftPassInfo(target.personId, target.dateStr),
          },
        });
      }
      return;
    }

    const employee = employees.find(emp => emp.id === target.personId);
    const shift = getCellShift(target.personId, parseDate(target.dateStr), 'alla');
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
  }, [addPassActivity, employees, fills, handleOpenDetail, handleOpenExtraPanel, handleOpenVacancyPanel, handleOpenResourceOrderDialog, navigateTo, openSicknessDialog, vacancyKeys]);

  const handlePersonContextAction = useCallback((event: { itemData?: { id?: string } }) => {
    if (!personContextId) return;
    const action = event.itemData?.id;
    if (action === 'show-person') {
      setPersonDetailId(personContextId);
      return;
    }
    if (action === 'report-sick') {
      const firstShiftDate = getPeriodDates(viewStart, period, columns)
        .find(date => Boolean(getCellShift(personContextId, date, 'alla')));
      if (firstShiftDate) openSicknessDialog(personContextId, toDateStr(firstShiftDate));
    }
  }, [columns, openSicknessDialog, period, personContextId, viewStart]);

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
    const selected = SUBSTITUTE_CANDIDATES.filter(sub => ids.includes(sub.id) || (!ids.length && sub.id === fallbackId));
    if (!selected.length) return;
    const fillType = vacancyKeys.includes(`${personId}|${dateStr}`) ? 'substitute' : 'extra';
    openConfirm(selected, personId, dateStr, shift, fillType);
  }, [subPanelOpen, openConfirm, vacancyKeys]);

  // ── Sub rows (substitutes / extra staff) ──
  const getSubRows = useCallback((empId: string) =>
    fills
      .filter(f => f.personId === empId)
      .map(f => {
        const shift = getCellShift(empId, parseDate(f.dateStr), 'alla');
        if (!shift) return null;
        return { key:`${empId}-${f.dateStr}-${f.person.name}`, name:f.person.name, role:f.person.role, dateStr:f.dateStr, shift };
      })
      .filter(Boolean) as Array<{ key:string; name:string; role:string; dateStr:string; shift:Shift }>,
  [fills]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <PageLayout title={activeView === 'schema' ? 'Schema' : 'Beställningar'} breadcrumbItems={breadcrumbItems}>
      <div className="col-12">
        <div className={`schema-page-wrapper${subPanelOpen ? ' schema-page-has-panel' : ''}`}>

          <div className="schema-view-switcher" role="tablist" aria-label="Välj vy">
            <button className={activeView === 'schema' ? 'active' : ''} onClick={() => setActiveView('schema')}><i className="fa-solid fa-calendar-days" /> Schema</button>
            <button className={activeView === 'orders' ? 'active' : ''} onClick={() => setActiveView('orders')}><i className="fa-solid fa-cart-shopping" /> Beställningar <span>{resourceOrders.length}</span></button>
          </div>

          {activeView === 'orders' ? (
            <div className="schema-orders-page-view">
              <ResourceOrdersList orders={resourceOrders} onClose={() => setActiveView('schema')} onAction={handleOrderAction} onOpenDetails={setOrderDetail} onChooseSubstitute={handleOpenOrderSubstitutePanel} onShowSubstitutes={handleOpenAllSubstitutes} />
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
            <button
              className="btn-secondary schema-vikarie-open-btn"
              onClick={handleOpenAllSubstitutes}
            >
              <i className="fa-solid fa-user-group" />
              Visa vikarier
            </button>
            <SelectBox
              dataSource={PASS_TYPES}
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
            <CheckBox value={showVacancies} onValueChanged={e => setShowVacancies(e.value)} text="Visa bara vakanser" />
            <div className="schema-orders-toggle">
              <CheckBox
                value={showOrders}
                onValueChanged={e => {
                  setShowOrders(Boolean(e.value));
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
          <div className="schema-schedule-area">
          <div ref={mainWrapperRef} className="schema-table-wrapper">
            <table className="schema-table" style={{ minWidth: scheduleTableMinWidth }}>
              <colgroup>
                <col style={{ width: EMPLOYEE_COLUMN_WIDTH }} />
                {columns.map((_, index) => <col key={index} style={{ width: viewColumnWidth }} />)}
              </colgroup>
              <thead>
                <tr>
                  <th className="schema-header-cell schema-employee-header">Medarbetare</th>
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
                          data-person-id={emp.id}
                          onContextMenu={() => setPersonContextId(emp.id)}
                        >
                          <span className="schema-employee-name">{hasPoolInView && <i className="schema-pool-dot" title="Samverkanspass i aktuell period" />} {emp.name}</span>
                          <span className="schema-employee-role">{emp.role}</span>
                          <span className="schema-employee-dept">{emp.organisation}</span>
                        </td>
                        {columns.map((col, ci) => {
                          const ds    = toDateStr(col.date);
                          const shift = getCellShift(emp.id, col.date, selectedPass);

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
                          const isVacant  = vacancyKeys.includes(absenceKey);
                          const ctxType: ContextTargetType | undefined = shift
                            ? (isAbsent ? (isVacant ? 'vacant' : 'absence') : 'normal')
                            : undefined;
                          const color    = shift ? getColorScheme(emp.id, ds, fills, vacancyKeys) : 'normal';
                          const passInfo = getShiftPassInfo(emp.id, ds);
                          const akut     = isAkutShift(emp.id, ds) && color === 'vacant';
                          const resourceOrder = resourceOrders.find(order => order.personId === emp.id && order.dateStr === ds);

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
                                    data-person-id={ctxType ? emp.id : undefined}
                                    data-date-str={ctxType  ? ds     : undefined}
                                    data-ctx-type={ctxType  ? ctxType : undefined}
                                    onDoubleClick={() => handleOpenDetail(emp.id, emp.name, emp.role, ds, shift, color)}
                                    onDragOver={handleCellDragOver}
                                    onDrop={e => handleCellDrop(e, emp.id, ds, shift)}
                                  >
                                    <ShiftMonthCell shift={shift} color={color} passInfo={passInfo} isAkut={akut} orderedBy={resourceOrder?.orderedBy} />
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
                                  data-person-id={ctxType ? emp.id  : undefined}
                                  data-date-str={ctxType  ? ds      : undefined}
                                  data-ctx-type={ctxType  ? ctxType : undefined}
                                  onDoubleClick={() => handleOpenDetail(emp.id, emp.name, emp.role, ds, shift, color)}
                                  onDragOver={handleCellDragOver}
                                  onDrop={e => handleCellDrop(e, emp.id, ds, shift)}
                                >
                                  <ShiftDayCell shift={shift} color={color} passInfo={passInfo} isAkut={akut} orderedBy={resourceOrder?.orderedBy} />
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
          {showOrders && <ResourceOrdersList orders={resourceOrders} onClose={() => setShowOrders(false)} onAction={handleOrderAction} onOpenDetails={setOrderDetail} onChooseSubstitute={handleOpenOrderSubstitutePanel} onShowSubstitutes={handleOpenAllSubstitutes} />}
          </div>

          </>}

          {/* Context menu — the first action changes with the selected pass. */}
          <ContextMenu
            target=".schema-ctx-cell"
            dataSource={contextActions}
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
          columns={columns}
          viewType={viewType}
          onClose={handleCloseSubPanel}
          onSendRequest={handleSendRequest}
          onOpenDetails={handleOpenSubstituteDetails}
          onSetAvailability={handleSetSubstituteAvailability}
          onRestoreAvailability={handleRestoreSubstituteAvailability}
          onReportSick={handleReportSubstituteSick}
          onClearSickness={handleClearSubstituteSickness}
          availabilityOverrides={substituteAvailabilityOverrides}
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
          details={orderDetail ? <OrderDetailCard order={orderDetail} onChooseSubstitute={handleOpenOrderSubstitutePanel} onAction={handleOrderAction} onSaveTime={handleUpdateOrderTime} /> : null}
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
          activities={passDetailActivities}
          includeDefaultActivities={false}
          details={detailState ? (
            <PassDetailCard
              state={detailState}
              onSaveTime={handleUpdatePassTime}
              onPrimaryAction={handlePassPrimaryAction}
              onCreateOrder={handlePassCreateOrder}
              onReportSick={handlePassReportSick}
              onSimulate={handlePassSimulate}
            />
          ) : null}
          onPostMessage={detailState ? activity => addPassActivity(passDetailKey, activity) : undefined}
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
              onReportSick={handlePersonReportSick}
              onShowSchedule={handleShowPersonInSchedule}
            />
          ) : null}
          onPostMessage={personDetailEmployee ? activity => addPersonActivity(personDetailEmployee.id, activity) : undefined}
        />

        <CaseActivityModal
          isOpen={Boolean(substituteDetail && substituteDetailInfo && substituteDetailState)}
          onClose={handleCloseSubstituteDetails}
          contextKey={substituteDetail ? `${substituteDetail.id}|${substituteDetailState?.dateStr ?? ''}` : undefined}
          kicker="Vikarie"
          title={substituteDetail ? `${substituteDetail.name} – vikarieuppgifter` : 'Vikarieuppgifter'}
          description={substituteDetailState ? `${substituteDetailState.dateStr} · tillgänglighet och händelser` : ''}
          activities={substituteDetailActivities}
          includeDefaultActivities={false}
          details={substituteDetail && substituteDetailInfo && substituteDetailState ? (
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
