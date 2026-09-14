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
import { persons, getActiveEmployment, fullName } from '../../data';

// ─── Types ───────────────────────────────────────────────────────────────────

type ShiftType    = 'morning' | 'day' | 'evening' | 'night';
type PeriodType   = 'dag' | 'arbetsvecka' | 'vecka' | 'manad' | 'period' | 'ar';
type ViewType     = 'day-columns' | 'month-columns' | 'year-columns';
type ColorScheme  = 'normal' | 'past' | 'vacant' | 'filled';

interface Shift            { type: ShiftType; start: string; end: string; }
interface EmployeeGroup    { id: string; label: string; category: 'team'|'role'|'department'; }
interface ViewColumn       { date: Date; header: string; subHeader?: string; isWeekend?: boolean; }
interface ShiftFill        { personId: string; dateStr: string; fillType: 'substitute'|'extra'; person: { name: string; role: string }; }
interface SubstituteCandidate { id: string; name: string; role: string; }
interface SubAvailability  { startH: number; startM: number; endH: number; endM: number; }
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
}
interface ConfirmState {
  substitutes: SubstituteCandidate[];
  targetPersonId: string;
  targetDateStr: string;
  targetShift: Shift;
  fillType: 'substitute' | 'extra';
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TODAY_STR = '2026-09-03';

// Stable module-level datasources — never recreated, so DevExtreme won't loop
const CTX_VACANT_ITEMS = [{ text: 'Hitta vikarie', icon: 'user' }];
const CTX_NORMAL_ITEMS = [{ text: 'Boka extrapass', icon: 'plus' }];

const SUBSTITUTE_CANDIDATES: SubstituteCandidate[] = [
  { id: 'sub1', name: 'Anna Viksson',    role: 'Undersköterska' },
  { id: 'sub2', name: 'Erik Lindqvist',  role: 'Sjuksköterska'  },
  { id: 'sub3', name: 'Maria Svensson',  role: 'Undersköterska' },
  { id: 'sub4', name: 'Jonas Berg',      role: 'Sjuksköterska'  },
  { id: 'sub5', name: 'Karin Nilsson',   role: 'Undersköterska' },
  { id: 'sub6', name: 'Peter Holm',      role: 'Sjuksköterska'  },
  { id: 'sub7', name: 'Sara Lundberg',   role: 'Undersköterska' },
  { id: 'sub8', name: 'Anders Persson',  role: 'Sjuksköterska'  },
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

const ALL_GROUPS: EmployeeGroup[] = [
  { id: 'alla',           label: 'Alla medarbetare',   category: 'team'       },
  { id: 'team1',          label: 'Team 1',             category: 'team'       },
  { id: 'team2',          label: 'Team 2',             category: 'team'       },
  { id: 'team3',          label: 'Team 3',             category: 'team'       },
  { id: 'sjukskoterskor', label: 'Sjuksköterskor',     category: 'role'       },
  { id: 'underskotare',   label: 'Undersköterskor',    category: 'role'       },
  { id: 'lakare',         label: 'Läkare',             category: 'role'       },
  { id: 'admin',          label: 'Administration',     category: 'department' },
  { id: 'akuten',         label: 'Akutmottagningen',   category: 'department' },
  { id: 'medicin',        label: 'Medicinavdelning',   category: 'department' },
];

const PASS_TYPES     = [{ id:'alla',label:'Alla pass'},{id:'morgan',label:'Morgonpass'},{id:'dag',label:'Dagpass'},{id:'kvall',label:'Kvällspass'},{id:'natt',label:'Nattpass'}];
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

const VACANT_SHIFTS: Record<string,Shift> = {
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
  if (VACANT_SHIFTS[key]) {
    const vs=VACANT_SHIFTS[key];
    if (passFilter!=='alla'&&vs.type!==PASS_TO_SHIFT[passFilter]) return null;
    return vs;
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
function getColorScheme(personId: string, dateStr: string, fills: ShiftFill[]): ColorScheme {
  if (fills.some(f=>f.personId===personId&&f.dateStr===dateStr)) return 'filled';
  if (VACANT_SHIFTS[`${personId}|${dateStr}`]) return 'vacant';
  if (dateStr<TODAY_STR) return 'past';
  return 'normal';
}
function matchGroup(emp:{role:string;department:string;fmgGroup:string}, gid: string): boolean {
  const r=emp.role.toLowerCase(), dept=emp.department.toLowerCase(), grp=emp.fmgGroup.toLowerCase();
  if (gid==='alla')          return true;
  if (gid==='team1')         return grp.includes('team 1')||grp.includes('team1');
  if (gid==='team2')         return grp.includes('team 2')||grp.includes('team2');
  if (gid==='team3')         return grp.includes('team 3')||grp.includes('team3');
  if (gid==='sjukskoterskor')return r.includes('sjukskötersk');
  if (gid==='underskotare')  return r.includes('underskötersk');
  if (gid==='lakare')        return r.includes('läkar')||r.includes('lakar');
  if (gid==='admin')         return dept.includes('admin');
  if (gid==='akuten')        return dept.includes('akut');
  if (gid==='medicin')       return dept.includes('medicin');
  return false;
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
function subAvailPct(avail: SubAvailability, shift: Shift): number {
  const [sH,sM]=shift.start.split(':').map(Number);
  const [eH,eM]=shift.end.split(':').map(Number);
  const shiftStart=sH*60+sM, shiftEnd=eH*60+eM, dur=shiftEnd-shiftStart;
  if (dur<=0) return 0;
  const aStart=avail.startH*60+avail.startM, aEnd=avail.endH*60+avail.endM;
  return Math.round(Math.max(0,Math.min(aEnd,shiftEnd)-Math.max(aStart,shiftStart))/dur*100);
}
function getAvailableSubs(shift: Shift, date: Date): SubstituteCandidate[] {
  const [sH,sM]=shift.start.split(':').map(Number);
  const [eH,eM]=shift.end.split(':').map(Number);
  const wStart=(sH*60+sM)-60, wEnd=(eH*60+eM)+60;
  return SUBSTITUTE_CANDIDATES.filter(sub => {
    const a=genSubAvailability(sub.id, date);
    if (!a) return false;
    return (a.startH*60+a.startM)<=wEnd && (a.endH*60+a.endM)>=wStart;
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
function suitabilityScore(subId: string, date: Date, shift: Shift): number {
  const avail   = genSubAvailability(subId, date);
  const pct     = avail ? subAvailPct(avail, shift) : 0;
  const details = SUB_DETAILS[subId];
  const atlCap  = details ? (details.maxAtlHours - details.atlHours) / details.maxAtlHours : 0;
  const booked  = (SUB_BOOKED_SHIFTS[subId] ?? []).some(b => b.dateStr === toDateStr(date));
  return pct + atlCap * 10 - (booked ? 200 : 0);
}

// ─── Shift cell sub-components ────────────────────────────────────────────────

function ShiftDayCell({ shift, color, passInfo, isAkut }: { shift: Shift; color: ColorScheme; passInfo?: string; isAkut?: boolean }) {
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
      </div>
    </div>
  );
}

function ShiftMonthCell({ shift, color, passInfo, isAkut }: { shift: Shift; color: ColorScheme; passInfo?: string; isAkut?: boolean }) {
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
  selectedSubs: string[];
  onToggleSub: (id: string, checked: boolean) => void;
  onSelectAll: (ids: string[]) => void;
  onDeselectAll: (ids: string[]) => void;
  onClose: () => void;
  onSendRequest: () => void;
  onDragStart: (e: React.DragEvent, subId: string) => void;
  scrollRef: React.RefObject<HTMLDivElement>;
}

function SubstitutePanel({
  isOpen, browseAll, state, columns, viewType, selectedSubs,
  onToggleSub, onSelectAll, onDeselectAll, onClose, onSendRequest,
  onDragStart, scrollRef,
}: SubstitutePanelProps) {
  const [filterRoles, setFilterRoles] = useState<string[]>([]);
  const [filterPass,  setFilterPass]  = useState('alla');
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);

  const toggleExpand = useCallback((id: string) => {
    setExpandedSubId(prev => prev === id ? null : id);
  }, []);

  const browseShift: Shift | null = useMemo(() => {
    if (!browseAll || filterPass === 'alla') return null;
    const t = PASS_TO_SHIFT[filterPass];
    return { type: t, ...SHIFT_DEFS[t] };
  }, [browseAll, filterPass]);

  const availSubs = useMemo(() => {
    let list: SubstituteCandidate[];
    if (browseAll) {
      list = SUBSTITUTE_CANDIDATES.filter(sub => {
        if (filterRoles.length > 0 && !filterRoles.includes(sub.role)) return false;
        if (browseShift) {
          const refDate = columns[0]?.date ?? new Date(TODAY_STR);
          const avail = genSubAvailability(sub.id, refDate);
          if (!avail || subAvailPct(avail, browseShift) === 0) return false;
        }
        return true;
      });
      // Sort: if a shift filter is active use suitability, otherwise alphabetical
      if (browseShift) {
        const refDate = columns[0]?.date ?? new Date(TODAY_STR);
        list = [...list].sort((a, b) =>
          suitabilityScore(b.id, refDate, browseShift) - suitabilityScore(a.id, refDate, browseShift)
        );
      } else {
        list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'sv'));
      }
    } else {
      list = state ? getAvailableSubs(state.shift, parseDate(state.dateStr)) : [];
      // Sort by suitability against the specific shift
      if (state) {
        const date = parseDate(state.dateStr);
        list = [...list].sort((a, b) =>
          suitabilityScore(b.id, date, state.shift) - suitabilityScore(a.id, date, state.shift)
        );
      }
    }
    return list;
  }, [browseAll, filterRoles, browseShift, columns, state]);

  const panelClass = `schema-sub-panel${isOpen ? ' schema-sub-panel-open' : ''}`;
  const fillLabel  = browseAll
    ? 'Vikarier'
    : state?.fillType === 'substitute' ? 'Hitta vikarie' : 'Boka extrapass';

  const selectedSubData = selectedSubs
    .map(id => SUBSTITUTE_CANDIDATES.find(s => s.id === id))
    .filter(Boolean) as SubstituteCandidate[];

  return (
    <div className={panelClass} role="region" aria-label={fillLabel}>
      {/* Header */}
      <div className="schema-sub-panel-header">
        <i className="fa-regular fa-users" />
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
          <i className="fa-regular fa-xmark" />
        </button>
      </div>

      {/* Permanent "Skicka förfrågan" bar */}
      <div className="schema-sub-send-bar">
        <button
          className="btn-primary schema-sub-send-btn"
          disabled={selectedSubs.length === 0}
          onClick={onSendRequest}
        >
          <i className="fa-regular fa-paper-plane" />
          {selectedSubs.length > 1 ? `Skicka förfrågan (${selectedSubs.length})` : 'Skicka förfrågan'}
        </button>
        {selectedSubData.length > 0 && (
          <span className="schema-sub-send-context">
            {selectedSubData.map(s => s.name).join(', ')}
          </span>
        )}
        {selectedSubData.length === 0 && (
          <span className="schema-sub-send-hint">Markera vikarier i listan nedan</span>
        )}
      </div>

      {/* Browse-all filter bar */}
      {browseAll && (
        <div className="schema-sub-filter-bar">
          <TagBox
            dataSource={SUBSTITUTE_ROLES}
            displayExpr="label"
            valueExpr="id"
            value={filterRoles}
            onValueChanged={e => setFilterRoles(e.value ?? [])}
            placeholder="Alla roller..."
            showSelectionControls={true}
            multiline={false}
            stylingMode="outlined"
            width={240}
          />
          <SelectBox
            dataSource={PASS_TYPES}
            displayExpr="label"
            valueExpr="id"
            value={filterPass}
            onValueChanged={e => setFilterPass(e.value)}
            width={155}
            stylingMode="outlined"
          />
        </div>
      )}

      {/* Scrollable table — synced with main schedule */}
      <div ref={scrollRef} className="schema-sub-panel-body">
        <table className="schema-table schema-sub-table">
          <thead>
            <tr>
              <th className="schema-employee-header schema-sub-sticky-col schema-sub-th-select">
                {(() => {
                  const visibleIds = availSubs.map(s => s.id);
                  const allSelected  = visibleIds.length > 0 && visibleIds.every(id => selectedSubs.includes(id));
                  const someSelected = !allSelected && visibleIds.some(id => selectedSubs.includes(id));
                  return (
                    <CheckBox
                      value={allSelected ? true : someSelected ? null : false}
                      allowIndeterminate={true}
                      onValueChanged={e => {
                        if (e.value) onSelectAll(visibleIds);
                        else onDeselectAll(visibleIds);
                      }}
                      className="schema-sub-all-checkbox"
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
                const isSelected   = selectedSubs.includes(sub.id);
                const details      = SUB_DETAILS[sub.id];
                const atlPct       = details ? Math.round(details.atlHours / details.maxAtlHours * 100) : 0;
                const bookedShifts = SUB_BOOKED_SHIFTS[sub.id] ?? [];

                return (
                  <React.Fragment key={sub.id}>
                    <tr
                      className={[
                        'schema-sub-row',
                        isSelected ? 'schema-sub-row-selected' : '',
                        isExpanded ? 'schema-sub-row-open' : '',
                      ].filter(Boolean).join(' ')}
                      draggable={!browseAll}
                      onDragStart={!browseAll ? e => onDragStart(e, sub.id) : undefined}
                    >
                      <td
                        className={['schema-employee-cell', 'schema-sub-sticky-col', isExpanded ? 'schema-sub-sticky-expanded' : ''].filter(Boolean).join(' ')}
                        onPointerDown={e => e.stopPropagation()}
                      >
                        <div className="schema-sub-name-cell">
                          <CheckBox
                            value={isSelected}
                            onValueChanged={e => onToggleSub(sub.id, e.value)}
                            className="schema-sub-checkbox"
                          />
                          <button
                            className="schema-sub-chevron"
                            onClick={() => toggleExpand(sub.id)}
                            title={isExpanded ? 'Dölj detaljer' : 'Visa detaljer'}
                          >
                            <i className={`fa-regular fa-chevron-${isExpanded ? 'down' : 'right'}`} />
                          </button>
                          <div className="schema-sub-name-block">
                            <span className="schema-employee-name">{sub.name}</span>
                            <span className="schema-employee-role">{sub.role}</span>
                          </div>
                        </div>
                      </td>
                      {columns.map((col, ci) => {
                        const ds       = toDateStr(col.date);
                        const isPast   = ds < TODAY_STR;
                        const booked   = bookedShifts.find(b => b.dateStr === ds);
                        const avail    = !booked ? genSubAvailability(sub.id, col.date) : null;
                        const refShift = browseAll ? browseShift : (state?.shift ?? null);
                        const isTarget = !browseAll && state && ds === state.dateStr;

                        // 24 h proportional bar helpers
                        const bar24 = (startH: number, startM: number, endH: number, endM: number, cls: string) => {
                          const left  = (startH * 60 + startM) / 1440 * 100;
                          const width = ((endH * 60 + endM) - (startH * 60 + startM)) / 1440 * 100;
                          return (
                            <div className="schema-sub-bar24-wrap">
                              <div className={`schema-sub-bar24-fill ${cls}`} style={{ left: `${left}%`, width: `${Math.max(width, 1)}%` }} />
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
                          ].filter(Boolean).join(' ')}>
                            {booked ? (
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
                                  {Math.round((avail.endH * 60 + avail.endM - avail.startH * 60 - avail.startM) / 1440 * 100)}%
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
                              <span className="schema-sub-avail-empty">—</span>
                            )}
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
                                    <i className="fa-regular fa-phone" />
                                    <span>{details.phone}</span>
                                    <a href={`tel:${details.phone.replace(/\s/g,'')}`} className="schema-sub-action-btn" title="Ring">
                                      <i className="fa-regular fa-phone-arrow-up-right" />
                                    </a>
                                    <a href={`sms:${details.phone.replace(/\s/g,'')}`} className="schema-sub-action-btn" title="Skicka SMS">
                                      <i className="fa-regular fa-message" />
                                    </a>
                                  </span>
                                  <span className="schema-sub-contact-item">
                                    <i className="fa-regular fa-envelope" />
                                    <span>{details.email}</span>
                                    <a href={`mailto:${details.email}`} className="schema-sub-action-btn" title="Skicka e-post">
                                      <i className="fa-regular fa-arrow-up-right-from-square" />
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
  const title = state.fillType === 'substitute' ? 'Skicka förfrågan' : 'Boka extrapass';
  return (
    <Popup visible={true} onHiding={onCancel} title={title} width={500} height="auto" showCloseButton={true} dragEnabled={false}>
      <div className="schema-dialog-content">
        <div className="schema-confirm-details">
          <div className="schema-confirm-row">
            <i className="fa-regular fa-calendar-days" />
            <span>{state.targetDateStr}</span>
          </div>
          <div className="schema-confirm-row">
            <i className="fa-regular fa-clock" />
            <span>{state.targetShift.start}–{state.targetShift.end}</span>
          </div>
          <div className="schema-confirm-row">
            <i className="fa-regular fa-user-plus" />
            <div className="schema-confirm-subs">
              {state.substitutes.map((s, i) => (
                <div key={i} className="schema-confirm-sub-item">
                  <strong>{s.name}</strong>
                  <span> · {s.role}</span>
                </div>
              ))}
            </div>
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
          <button className="btn-primary"   onClick={() => onConfirm(msg)}>Skicka</button>
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

// ─── Shift detail dialog ──────────────────────────────────────────────────────

const SHIFT_LABELS: Record<ShiftType, string> = {
  morning: 'Morgonpass', day: 'Dagpass', evening: 'Kvällspass', night: 'Nattpass',
};

function ShiftDetailDialogInner({ state, onClose, onOpenSubPanel }: {
  state: DetailState;
  onClose: () => void;
  onOpenSubPanel: () => void;
}) {
  const isVacant = state.color === 'vacant';
  const isPast   = state.color === 'past';
  const akut     = isAkutShift(state.empId, state.dateStr) && isVacant;
  return (
    <Popup
      visible={true}
      onHiding={onClose}
      title="Passdetaljer"
      width={440}
      height="auto"
      showCloseButton={true}
      dragEnabled={false}
    >
      <div className="schema-dialog-content">
        <div className="schema-confirm-details">
          <div className="schema-confirm-row">
            <i className="fa-regular fa-user" />
            <span>{state.empName}</span>
            <span className="schema-sub-panel-context-sep"> · </span>
            <span className="schema-detail-role">{state.empRole}</span>
          </div>
          <div className="schema-confirm-row">
            <i className="fa-regular fa-calendar-days" />
            <span>{fmtDay(parseDate(state.dateStr))}</span>
          </div>
          <div className="schema-confirm-row">
            <i className="fa-regular fa-clock" />
            <span>{state.shift.start}–{state.shift.end}</span>
            <span className="schema-sub-panel-context-sep"> · </span>
            <span>{SHIFT_LABELS[state.shift.type]}</span>
            {getShiftPassInfo(state.empId, state.dateStr) && (
              <>
                <span className="schema-sub-panel-context-sep"> · </span>
                <span className="schema-shift-info">{getShiftPassInfo(state.empId, state.dateStr)}</span>
              </>
            )}
          </div>
          {isVacant && (
            <div className={`schema-confirm-row ${akut ? 'schema-detail-akut-row' : 'schema-detail-vacant-row'}`}>
              <i className={`fa-solid ${akut ? 'fa-circle-exclamation' : 'fa-triangle-exclamation'}`} />
              <span>{akut ? 'Akut vakans' : 'Vakant pass'}</span>
            </div>
          )}
          {state.color === 'filled' && (
            <div className="schema-confirm-row schema-detail-filled-row">
              <i className="fa-regular fa-circle-check" />
              <span>Tillsatt</span>
            </div>
          )}
        </div>
        <div className="schema-dialog-actions">
          {!isPast && (
            <button className="btn-primary" onClick={onOpenSubPanel}>
              <i className={`fa-regular ${isVacant ? 'fa-user-plus' : 'fa-calendar-plus'}`} />
              {' '}{isVacant ? 'Hitta vikarie' : 'Boka extrapass'}
            </button>
          )}
          <button className="btn-secondary" onClick={onClose}>Stäng</button>
        </div>
      </div>
    </Popup>
  );
}

function ShiftDetailDialog({ state, onClose, onOpenSubPanel }: {
  state: DetailState | null;
  onClose: () => void;
  onOpenSubPanel: () => void;
}) {
  if (!state) return null;
  return <ShiftDetailDialogInner state={state} onClose={onClose} onOpenSubPanel={onOpenSubPanel} />;
}

// ─── Main component ───────────────────────────────────────────────────────────

export const Schema = () => {
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Heroma', href: '/' },
    { label: 'Tid & Bemanning' },
    { label: 'Schema', isActive: true },
  ];

  // ── Filter state ──
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedPass,   setSelectedPass]   = useState('alla');
  const [textFilter,     setTextFilter]     = useState('');
  const [period,         setPeriod]         = useState<PeriodType>('vecka');
  const [showVacancies,  setShowVacancies]  = useState(false);
  const [dialogOpen,     setDialogOpen]     = useState(false);
  const [dialogGroups,   setDialogGroups]   = useState<string[]>(
    ALL_GROUPS.filter(g => g.id !== 'alla').map(g => g.id)
  );
  const [viewStart, setViewStart] = useState<Date>(() => monWeekStart(new Date(TODAY_STR)));

  // ── Fills ──
  const [fills, setFills] = useState<ShiftFill[]>(INITIAL_FILLS);

  // ── Sub panel ──
  const [subPanelState,   setSubPanelState]   = useState<SubPanelState | null>(null);
  const [subPanelOpen,    setSubPanelOpen]    = useState(false);
  const [selectedSubs,    setSelectedSubs]    = useState<string[]>([]);

  // ── Vikarie panel ──
  const [subPanelBrowseAll, setSubPanelBrowseAll] = useState(false);

  // ── Confirm dialog ──
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  // ── Shift detail dialog ──
  const [detailState, setDetailState] = useState<DetailState | null>(null);

  // ── Refs ──
  const ctxRef           = useRef<{ personId: string; dateStr: string; type: 'vacant'|'normal' } | null>(null);
  const mainWrapperRef   = useRef<HTMLDivElement>(null);
  const subScrollRef     = useRef<HTMLDivElement>(null);
  const isSyncingRef     = useRef(false);

  // ── Scroll sync between main table and sub panel ──
  useEffect(() => {
    const main  = mainWrapperRef.current;
    const panel = subScrollRef.current;
    if (!main || !panel) return;

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

    return () => {
      main.removeEventListener('scroll', syncMain);
      panel.removeEventListener('scroll', syncPanel);
    };
  }, [subPanelOpen]);

  // ── Capture right-click target before DX context menu fires ──
  useEffect(() => {
    const onCtx = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest('.schema-ctx-wrapper') as HTMLElement | null;
      if (el) {
        ctxRef.current = {
          personId: el.dataset.personId!,
          dateStr:  el.dataset.dateStr!,
          type:     el.dataset.ctxType as 'vacant'|'normal',
        };
      } else {
        ctxRef.current = null;
      }
    };
    document.addEventListener('contextmenu', onCtx, true);
    return () => document.removeEventListener('contextmenu', onCtx, true);
  }, []);

  // ── Employees ──
  const employees = useMemo(() =>
    persons.map(p => {
      const emp = getActiveEmployment(p.id) ?? p.employments[0];
      return {
        id:         p.id,
        name:       p.displayName || fullName(p),
        role:       emp?.position.title ?? '—',
        department: emp?.organization.department ?? '—',
        fmgGroup:   emp?.fmgGroup ?? '—',
      };
    }),
  []);

  const columns  = useMemo(() => getColumns(viewStart, period),  [viewStart, period]);
  const viewType = useMemo(() => getViewType(period),            [period]);
  const pLabel   = useMemo(() => periodLabel(viewStart, period), [viewStart, period]);

  const filteredEmployees = useMemo(() => {
    let list = employees;
    if (selectedGroups.length > 0 && !selectedGroups.includes('alla'))
      list = list.filter(e => selectedGroups.some(gid => matchGroup(e, gid)));
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
          return !!VACANT_SHIFTS[`${emp.id}|${ds}`] &&
            !fills.some(f => f.personId === emp.id && f.dateStr === ds);
        })
      );
    }
    return list;
  }, [employees, selectedGroups, textFilter, showVacancies, columns, fills]);

  const availableGroups = useMemo(() => {
    return [
      { id:'alla', label:'Alla medarbetare', category:'team' as const },
      ...ALL_GROUPS.filter(g => g.id !== 'alla' && dialogGroups.includes(g.id)),
    ];
  }, [dialogGroups]);

  // ── Handlers: navigation / filters ──
  const navigate = (dir: 1|-1) => setViewStart(prev => navStep(period, dir, prev));

  const changePeriod = (p: PeriodType) => {
    setPeriod(p);
    if (p==='manad') setViewStart(monthStart(new Date(TODAY_STR)));
    else if (p==='ar') setViewStart(yearStart(new Date(TODAY_STR)));
    else setViewStart(monWeekStart(new Date(TODAY_STR)));
  };

  const toggleDialogGroup = (id: string) =>
    setDialogGroups(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);

  const saveDialog = () => {
    setSelectedGroups(prev => prev.filter(g => g === 'alla' || dialogGroups.includes(g)));
    setDialogOpen(false);
  };

  // ── Handlers: sub panel ──
  const handleOpenVacancyPanel = useCallback((personId: string, dateStr: string) => {
    const emp   = employees.find(e => e.id === personId);
    const shift = VACANT_SHIFTS[`${personId}|${dateStr}`];
    if (!shift) return;
    setSubPanelState({ personId, dateStr, shift, fillType:'substitute', targetPersonName: emp?.name ?? '' });
    setSubPanelBrowseAll(false);
    setSelectedSubs([]);
    setSubPanelOpen(true);
  }, [employees]);

  const handleOpenExtraPanel = useCallback((personId: string, dateStr: string) => {
    const emp   = employees.find(e => e.id === personId);
    const shift = getCellShift(personId, parseDate(dateStr), 'alla');
    if (!shift) return;
    setSubPanelState({ personId, dateStr, shift, fillType:'extra', targetPersonName: emp?.name ?? '' });
    setSubPanelBrowseAll(false);
    setSelectedSubs([]);
    setSubPanelOpen(true);
  }, [employees]);

  const handleCloseSubPanel = useCallback(() => {
    setSubPanelOpen(false);
    setSubPanelBrowseAll(false);
    setSelectedSubs([]);
  }, []);

  const handleToggleSub = useCallback((id: string, checked: boolean) => {
    setSelectedSubs(prev =>
      checked ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter(s => s !== id)
    );
  }, []);

  const handleSelectAll = useCallback((ids: string[]) => {
    setSelectedSubs(prev => [...new Set([...prev, ...ids])]);
  }, []);

  const handleDeselectAll = useCallback((ids: string[]) => {
    setSelectedSubs(prev => prev.filter(id => !ids.includes(id)));
  }, []);

  // ── Handlers: assign ──
  const openConfirm = useCallback((subs: SubstituteCandidate[], personId: string, dateStr: string, shift: Shift, fillType: 'substitute'|'extra') => {
    setConfirmState({ substitutes: subs, targetPersonId: personId, targetDateStr: dateStr, targetShift: shift, fillType });
  }, []);

  const handleSendRequest = useCallback(() => {
    if (!subPanelState || selectedSubs.length === 0) return;
    const subs = SUBSTITUTE_CANDIDATES.filter(s => selectedSubs.includes(s.id));
    if (subs.length === 0) return;
    openConfirm(subs, subPanelState.personId, subPanelState.dateStr, subPanelState.shift, subPanelState.fillType);
  }, [subPanelState, selectedSubs, openConfirm]);

  const handleConfirm = useCallback((_msg: string) => {
    if (!confirmState) return;
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
    setSelectedSubs([]);
  }, [confirmState]);

  const handleCancelConfirm = useCallback(() => setConfirmState(null), []);

  // ── Handlers: shift detail dialog ──
  const handleOpenDetail = useCallback((
    empId: string, empName: string, empRole: string,
    dateStr: string, shift: Shift, color: ColorScheme,
  ) => {
    setDetailState({ empId, empName, empRole, dateStr, shift, color });
  }, []);

  const handleCloseDetail = useCallback(() => setDetailState(null), []);

  const handleDetailOpenSubPanel = useCallback(() => {
    if (!detailState) return;
    setDetailState(null);
    if (detailState.color === 'vacant') {
      handleOpenVacancyPanel(detailState.empId, detailState.dateStr);
    } else {
      handleOpenExtraPanel(detailState.empId, detailState.dateStr);
    }
  }, [detailState, handleOpenVacancyPanel, handleOpenExtraPanel]);

  // ── Stable context-menu item-click handlers ──
  const handleCtxVacant = useCallback(() => {
    const t = ctxRef.current;
    if (t?.type === 'vacant') handleOpenVacancyPanel(t.personId, t.dateStr);
  }, [handleOpenVacancyPanel]);

  const handleCtxNormal = useCallback(() => {
    const t = ctxRef.current;
    if (t?.type === 'normal') handleOpenExtraPanel(t.personId, t.dateStr);
  }, [handleOpenExtraPanel]);

  // ── Handlers: drag / drop ──
  const handleDragStartSub = useCallback((e: React.DragEvent, subId: string) => {
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
    const subId = e.dataTransfer.getData('substituteId');
    if (!subId) return;
    const sub = SUBSTITUTE_CANDIDATES.find(s => s.id === subId);
    if (!sub) return;
    const fillType = VACANT_SHIFTS[`${personId}|${dateStr}`] ? 'substitute' : 'extra';
    openConfirm([sub], personId, dateStr, shift, fillType);
  }, [subPanelOpen, openConfirm]);

  // ── Sub rows (substitutes / extra staff) ──
  const getSubRows = useCallback((empId: string) =>
    fills
      .filter(f => f.personId === empId)
      .map(f => {
        const key = `${empId}|${f.dateStr}`;
        const shift = VACANT_SHIFTS[key] ?? baseShift(empId, parseDate(f.dateStr), 'alla');
        if (!shift) return null;
        return { key:`${empId}-${f.dateStr}-${f.person.name}`, name:f.person.name, role:f.person.role, dateStr:f.dateStr, shift };
      })
      .filter(Boolean) as Array<{ key:string; name:string; role:string; dateStr:string; shift:Shift }>,
  [fills]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <PageLayout title="Schema" breadcrumbItems={breadcrumbItems}>
      <div className="col-12">
        <div className={`schema-page-wrapper${subPanelOpen ? ' schema-page-has-panel' : ''}`}>

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
              <button className="schema-edit-link" onClick={() => setDialogOpen(true)}>Ändra</button>
            </div>
            <button
              className="btn-secondary schema-vikarie-open-btn"
              onClick={() => { setSubPanelState(null); setSubPanelBrowseAll(true); setSubPanelOpen(true); }}
            >
              <i className="fa-regular fa-user-group" />
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
          </div>

          {/* Period navigation */}
          <div className="schema-period-nav">
            <button className="schema-period-nav-btn" onClick={() => navigate(-1)}>
              <i className="fa-regular fa-chevron-left" />
            </button>
            <span className="schema-period-label">{pLabel}</span>
            <button className="schema-period-nav-btn" onClick={() => navigate(1)}>
              <i className="fa-regular fa-chevron-right" />
            </button>
          </div>

          {/* Schedule table */}
          <div ref={mainWrapperRef} className="schema-table-wrapper">
            <table className="schema-table">
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
                {filteredEmployees.map(emp => {
                  const subRows = viewType === 'day-columns' ? getSubRows(emp.id) : [];
                  return (
                    <React.Fragment key={emp.id}>
                      {/* Employee row */}
                      <tr className="schema-table-row">
                        <td className="schema-employee-cell">
                          <span className="schema-employee-name">{emp.name}</span>
                          <span className="schema-employee-role">{emp.role}</span>
                          <span className="schema-employee-dept">{emp.department}</span>
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
                          const isVacant = !!VACANT_SHIFTS[`${emp.id}|${ds}`];
                          const ctxType  = shift && !hasFill ? (isVacant ? 'vacant' : 'normal') : undefined;
                          const color    = shift ? getColorScheme(emp.id, ds, fills) : 'normal';
                          const passInfo = getShiftPassInfo(emp.id, ds);
                          const akut     = isAkutShift(emp.id, ds) && color === 'vacant';

                          /* Month view */
                          if (viewType === 'month-columns') {
                            return (
                              <td key={ci} className={['schema-month-col-cell', col.isWeekend ? 'schema-weekend-cell' : '', ds === TODAY_STR ? 'schema-today-col' : ''].filter(Boolean).join(' ')}>
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
                                    <ShiftMonthCell shift={shift} color={color} passInfo={passInfo} isAkut={akut} />
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
                            ].filter(Boolean).join(' ')}>
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
                                  <ShiftDayCell shift={shift} color={color} passInfo={passInfo} isAkut={akut} />
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

          {/* Context menus — dataSource uses module-level constants (stable refs) */}
          <ContextMenu
            target=".schema-ctx-vacant"
            dataSource={CTX_VACANT_ITEMS}
            onItemClick={handleCtxVacant}
          />
          <ContextMenu
            target=".schema-ctx-normal"
            dataSource={CTX_NORMAL_ITEMS}
            onItemClick={handleCtxNormal}
          />
        </div>

        {/* Substitute panel — context mode (right-click) and browse-all mode ("Visa vikarier") */}
        <SubstitutePanel
          isOpen={subPanelOpen}
          browseAll={subPanelBrowseAll}
          state={subPanelState}
          columns={columns}
          viewType={viewType}
          selectedSubs={selectedSubs}
          onToggleSub={handleToggleSub}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onClose={handleCloseSubPanel}
          onSendRequest={handleSendRequest}
          onDragStart={handleDragStartSub}
          scrollRef={subScrollRef}
        />

        {/* Confirm dialog */}
        <ConfirmAssignDialog
          state={confirmState}
          onConfirm={handleConfirm}
          onCancel={handleCancelConfirm}
        />

        {/* Shift detail dialog */}
        <ShiftDetailDialog
          state={detailState}
          onClose={handleCloseDetail}
          onOpenSubPanel={handleDetailOpenSubPanel}
        />

        {/* Ändra-urval dialog */}
        <Popup
          visible={dialogOpen}
          onHiding={() => setDialogOpen(false)}
          title="Välj urval av medarbetare"
          width={480}
          height="auto"
          showCloseButton={true}
          dragEnabled={false}
        >
          <div className="schema-dialog-content">
            <p className="schema-dialog-desc">
              Välj vilka kategorier som ska vara tillgängliga i urvalslistan ovanför schemat.
            </p>
            {(['team','role','department'] as const).map(cat => (
              <div key={cat}>
                <div className="schema-dialog-section-title">
                  {cat==='team' ? 'Team' : cat==='role' ? 'Yrkesroll' : 'Avdelning / Enhet'}
                </div>
                <div className="schema-dialog-group">
                  {ALL_GROUPS.filter(g => g.category === cat).map(g => (
                    <div key={g.id} className="schema-dialog-item">
                      <CheckBox
                        value={dialogGroups.includes(g.id)}
                        onValueChanged={() => toggleDialogGroup(g.id)}
                        text={g.label}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="schema-dialog-actions">
              <button className="btn-primary"   onClick={saveDialog}>Spara urval</button>
              <button className="btn-secondary" onClick={() => setDialogOpen(false)}>Avbryt</button>
            </div>
          </div>
        </Popup>
      </div>
    </PageLayout>
  );
};
