export type SubstituteCostLevel = 'Gratis' | 'Kostnadsnivå 1' | 'Kostnadsnivå 2' | 'Kostnadsnivå 3';

export interface SubstituteRosterMember {
  id: string;
  name: string;
  role: string;
  category: string;
  employmentType?: 'fastanställd' | 'timanställd';
  costLevel: SubstituteCostLevel;
  competencies?: string[];
}

export interface CompletedStaffingRecord {
  id: string;
  substituteId: string;
  date: string;
  hours: number;
  responseMinutes: number;
  simulatedCost: number;
}

export const SUBSTITUTE_ROSTER: SubstituteRosterMember[] = [
  { id: 'sub1', name: 'Anna Viksson', role: 'Undersköterska', category: 'Timanställd', costLevel: 'Kostnadsnivå 2' },
  { id: 'sub2', name: 'Erik Lindqvist', role: 'Sjuksköterska', category: 'Poolpersonal', employmentType: 'fastanställd', costLevel: 'Kostnadsnivå 1' },
  { id: 'sub3', name: 'Maria Svensson', role: 'Undersköterska', category: 'Timanställd', costLevel: 'Kostnadsnivå 2' },
  { id: 'sub4', name: 'Jonas Berg', role: 'Sjuksköterska', category: 'Pensionär', costLevel: 'Kostnadsnivå 3' },
  { id: 'sub5', name: 'Karin Nilsson', role: 'Undersköterska', category: 'Samverkanspass', employmentType: 'fastanställd', costLevel: 'Gratis' },
  { id: 'sub6', name: 'Peter Holm', role: 'Sjuksköterska', category: 'Poolpersonal', employmentType: 'fastanställd', costLevel: 'Kostnadsnivå 1' },
  { id: 'sub7', name: 'Sara Lundberg', role: 'Undersköterska', category: 'Timanställd', costLevel: 'Kostnadsnivå 2' },
  { id: 'sub8', name: 'Anders Persson', role: 'Sjuksköterska', category: 'Övrig', costLevel: 'Kostnadsnivå 3' },
  { id: 'sub9', name: 'Elin Bergström', role: 'Undersköterska', category: 'Timanställd', costLevel: 'Kostnadsnivå 2', competencies: ['Barnsäkerhet', 'Första hjälpen'] },
  { id: 'sub10', name: 'Oskar Lind', role: 'Undersköterska', category: 'Timanställd', costLevel: 'Kostnadsnivå 1', competencies: ['Måltider', 'Utevistelse'] },
  { id: 'sub11', name: 'Nora Ekström', role: 'Sjuksköterska', category: 'Timanställd', costLevel: 'Kostnadsnivå 2', competencies: ['Språkutveckling', 'Lek och lärande'] },
  { id: 'sub12', name: 'Viktor Holmgren', role: 'Undersköterska', category: 'Timanställd', costLevel: 'Kostnadsnivå 1', competencies: ['Barnsäkerhet', 'Måltider'] },
  { id: 'sub13', name: 'Maja Sandberg', role: 'Undersköterska', category: 'Timanställd', costLevel: 'Kostnadsnivå 2', competencies: ['Lpfö 18', 'Pedagogisk dokumentation'] },
  { id: 'sub14', name: 'Filip Nyström', role: 'Sjuksköterska', category: 'Timanställd', costLevel: 'Kostnadsnivå 1', competencies: ['Första hjälpen', 'Utevistelse'] },
  { id: 'sub15', name: 'Wilma Åberg', role: 'Undersköterska', category: 'Timanställd', costLevel: 'Kostnadsnivå 2', competencies: ['NPF-stöd', 'Lek och lärande'] },
  { id: 'sub16', name: 'Emil Östberg', role: 'Undersköterska', category: 'Timanställd', costLevel: 'Kostnadsnivå 1', competencies: ['Måltider', 'Barnsäkerhet'] },
  { id: 'sub17', name: 'Alva Sjöberg', role: 'Sjuksköterska', category: 'Timanställd', costLevel: 'Kostnadsnivå 2', competencies: ['Språkutveckling', 'Utevistelse'] },
  { id: 'sub18', name: 'Hugo Bergman', role: 'Undersköterska', category: 'Timanställd', costLevel: 'Kostnadsnivå 1', competencies: ['Första hjälpen', 'Måltider'] },
  { id: 'sub19', name: 'Stella Lindström', role: 'Undersköterska', category: 'Timanställd', costLevel: 'Kostnadsnivå 2', competencies: ['Lek och lärande', 'Barnsäkerhet'] },
  { id: 'sub20', name: 'Liam Karlsson', role: 'Sjuksköterska', category: 'Timanställd', costLevel: 'Kostnadsnivå 1', competencies: ['Lpfö 18', 'Utevistelse'] },
  { id: 'sub21', name: 'Ebba Lund', role: 'Undersköterska', category: 'Timanställd', costLevel: 'Kostnadsnivå 2', competencies: ['NPF-stöd', 'Första hjälpen'] },
  { id: 'sub22', name: 'Albin Wikström', role: 'Undersköterska', category: 'Timanställd', costLevel: 'Kostnadsnivå 1', competencies: ['Måltider', 'Lek och lärande'] },
  { id: 'sub23', name: 'Freja Dahl', role: 'Sjuksköterska', category: 'Timanställd', costLevel: 'Kostnadsnivå 2', competencies: ['Språkutveckling', 'Barnsäkerhet'] },
  { id: 'sub24', name: 'Noah Eklund', role: 'Undersköterska', category: 'Timanställd', costLevel: 'Kostnadsnivå 1', competencies: ['Utevistelse', 'Första hjälpen'] },
  { id: 'sub25', name: 'Signe Forsberg', role: 'Undersköterska', category: 'Timanställd', costLevel: 'Kostnadsnivå 2', competencies: ['Pedagogisk dokumentation', 'Måltider'] },
  { id: 'sub26', name: 'Axel Blom', role: 'Sjuksköterska', category: 'Timanställd', costLevel: 'Kostnadsnivå 1', competencies: ['Lpfö 18', 'Lek och lärande'] },
  { id: 'sub27', name: 'Lilly Åkesson', role: 'Undersköterska', category: 'Timanställd', costLevel: 'Kostnadsnivå 2', competencies: ['Språkutveckling', 'Första hjälpen'] },
  { id: 'sub28', name: 'Vera Håkansson', role: 'Undersköterska', category: 'Timanställd', costLevel: 'Kostnadsnivå 1', competencies: ['Barnsäkerhet', 'Utevistelse'] },
  { id: 'sub29', name: 'Arvid Söderberg', role: 'Sjuksköterska', category: 'Timanställd', costLevel: 'Kostnadsnivå 2', competencies: ['NPF-stöd', 'Måltider'] },
  { id: 'sub30', name: 'Rut Magnusson', role: 'Undersköterska', category: 'Pensionär', costLevel: 'Kostnadsnivå 3', competencies: ['Lek och lärande', 'Barnsäkerhet'] },
  { id: 'sub31', name: 'Bengt Norén', role: 'Undersköterska', category: 'Pensionär', costLevel: 'Kostnadsnivå 3', competencies: ['Lpfö 18', 'Måltider'] },
  { id: 'sub32', name: 'Ingrid Wallin', role: 'Undersköterska', category: 'Pensionär', costLevel: 'Kostnadsnivå 3', competencies: ['Språkutveckling', 'Utevistelse'] },
  { id: 'sub33', name: 'Meja Jansson', role: 'Sjuksköterska', category: 'Poolpersonal', employmentType: 'fastanställd', costLevel: 'Kostnadsnivå 1', competencies: ['Barnsäkerhet', 'Första hjälpen', 'Utevistelse'] },
  { id: 'sub34', name: 'Isak Edlund', role: 'Undersköterska', category: 'Poolpersonal', employmentType: 'fastanställd', costLevel: 'Kostnadsnivå 1', competencies: ['NPF-stöd', 'Språkutveckling'] },
  { id: 'sub35', name: 'Tuva Holmberg', role: 'Undersköterska', category: 'Poolpersonal', employmentType: 'fastanställd', costLevel: 'Kostnadsnivå 1', competencies: ['Lek och lärande', 'Pedagogisk dokumentation'] },
  { id: 'sub36', name: 'Loke Berglund', role: 'Sjuksköterska', category: 'Poolpersonal', employmentType: 'fastanställd', costLevel: 'Kostnadsnivå 1', competencies: ['Måltider', 'Barnsäkerhet'] },
];

export const PRESCHOOL_SUBSTITUTE_PROFILES: Record<string, Pick<SubstituteRosterMember, 'role' | 'category' | 'costLevel' | 'competencies'>> = {
  sub1: { role: 'Barnskötare', category: 'Timanställd', costLevel: 'Kostnadsnivå 2', competencies: ['Barnsäkerhet', 'Första hjälpen', 'Lek och lärande'] },
  sub2: { role: 'Förskollärare', category: 'Poolpersonal', costLevel: 'Kostnadsnivå 1', competencies: ['Lpfö 18', 'Språkutveckling', 'Pedagogisk dokumentation'] },
  sub3: { role: 'Förskollärare', category: 'Timanställd', costLevel: 'Kostnadsnivå 2', competencies: ['Språkutveckling', 'Lek och lärande', 'Barnsäkerhet'] },
  sub4: { role: 'Barnskötare', category: 'Pensionär', costLevel: 'Kostnadsnivå 3', competencies: ['Lek och lärande', 'Första hjälpen'] },
  sub5: { role: 'Barnskötare', category: 'Samverkanspass', costLevel: 'Gratis', competencies: ['Barnsäkerhet', 'Måltider', 'Utevistelse'] },
  sub6: { role: 'Resurspedagog', category: 'Poolpersonal', costLevel: 'Kostnadsnivå 1', competencies: ['NPF-stöd', 'Språkutveckling', 'Första hjälpen'] },
  sub7: { role: 'Barnskötare', category: 'Timanställd', costLevel: 'Kostnadsnivå 2', competencies: ['Måltider', 'Utevistelse', 'Lek och lärande'] },
  sub8: { role: 'Förskollärare', category: 'Pensionär', costLevel: 'Kostnadsnivå 3', competencies: ['Lpfö 18', 'Pedagogisk dokumentation'] },
  sub9: { role: 'Barnskötare', category: 'Timanställd', costLevel: 'Kostnadsnivå 2', competencies: ['Barnsäkerhet', 'Första hjälpen'] },
  sub10: { role: 'Barnskötare', category: 'Timanställd', costLevel: 'Kostnadsnivå 1', competencies: ['Måltider', 'Utevistelse'] },
  sub11: { role: 'Förskollärare', category: 'Timanställd', costLevel: 'Kostnadsnivå 2', competencies: ['Språkutveckling', 'Lek och lärande'] },
  sub12: { role: 'Barnskötare', category: 'Timanställd', costLevel: 'Kostnadsnivå 1', competencies: ['Barnsäkerhet', 'Måltider'] },
  sub13: { role: 'Förskollärare', category: 'Timanställd', costLevel: 'Kostnadsnivå 2', competencies: ['Lpfö 18', 'Pedagogisk dokumentation'] },
  sub14: { role: 'Barnskötare', category: 'Timanställd', costLevel: 'Kostnadsnivå 1', competencies: ['Första hjälpen', 'Utevistelse'] },
  sub15: { role: 'Resurspedagog', category: 'Timanställd', costLevel: 'Kostnadsnivå 2', competencies: ['NPF-stöd', 'Lek och lärande'] },
  sub16: { role: 'Barnskötare', category: 'Timanställd', costLevel: 'Kostnadsnivå 1', competencies: ['Måltider', 'Barnsäkerhet'] },
  sub17: { role: 'Förskollärare', category: 'Timanställd', costLevel: 'Kostnadsnivå 2', competencies: ['Språkutveckling', 'Utevistelse'] },
  sub18: { role: 'Barnskötare', category: 'Timanställd', costLevel: 'Kostnadsnivå 1', competencies: ['Första hjälpen', 'Måltider'] },
  sub19: { role: 'Barnskötare', category: 'Timanställd', costLevel: 'Kostnadsnivå 2', competencies: ['Lek och lärande', 'Barnsäkerhet'] },
  sub20: { role: 'Förskollärare', category: 'Timanställd', costLevel: 'Kostnadsnivå 1', competencies: ['Lpfö 18', 'Utevistelse'] },
  sub21: { role: 'Resurspedagog', category: 'Timanställd', costLevel: 'Kostnadsnivå 2', competencies: ['NPF-stöd', 'Första hjälpen'] },
  sub22: { role: 'Barnskötare', category: 'Timanställd', costLevel: 'Kostnadsnivå 1', competencies: ['Måltider', 'Lek och lärande'] },
  sub23: { role: 'Förskollärare', category: 'Timanställd', costLevel: 'Kostnadsnivå 2', competencies: ['Språkutveckling', 'Barnsäkerhet'] },
  sub24: { role: 'Barnskötare', category: 'Timanställd', costLevel: 'Kostnadsnivå 1', competencies: ['Utevistelse', 'Första hjälpen'] },
  sub25: { role: 'Förskollärare', category: 'Timanställd', costLevel: 'Kostnadsnivå 2', competencies: ['Pedagogisk dokumentation', 'Måltider'] },
  sub26: { role: 'Förskollärare', category: 'Timanställd', costLevel: 'Kostnadsnivå 1', competencies: ['Lpfö 18', 'Lek och lärande'] },
  sub27: { role: 'Barnskötare', category: 'Timanställd', costLevel: 'Kostnadsnivå 2', competencies: ['Språkutveckling', 'Första hjälpen'] },
  sub28: { role: 'Barnskötare', category: 'Timanställd', costLevel: 'Kostnadsnivå 1', competencies: ['Barnsäkerhet', 'Utevistelse'] },
  sub29: { role: 'Resurspedagog', category: 'Timanställd', costLevel: 'Kostnadsnivå 2', competencies: ['NPF-stöd', 'Måltider'] },
  sub30: { role: 'Barnskötare', category: 'Pensionär', costLevel: 'Kostnadsnivå 3', competencies: ['Lek och lärande', 'Barnsäkerhet'] },
  sub31: { role: 'Barnskötare', category: 'Pensionär', costLevel: 'Kostnadsnivå 3', competencies: ['Lpfö 18', 'Måltider'] },
  sub32: { role: 'Förskollärare', category: 'Pensionär', costLevel: 'Kostnadsnivå 3', competencies: ['Språkutveckling', 'Utevistelse'] },
  sub33: { role: 'Förskollärare', category: 'Poolpersonal', costLevel: 'Kostnadsnivå 1', competencies: ['Barnsäkerhet', 'Första hjälpen', 'Utevistelse'] },
  sub34: { role: 'Resurspedagog', category: 'Poolpersonal', costLevel: 'Kostnadsnivå 1', competencies: ['NPF-stöd', 'Språkutveckling'] },
  sub35: { role: 'Barnskötare', category: 'Poolpersonal', costLevel: 'Kostnadsnivå 1', competencies: ['Lek och lärande', 'Pedagogisk dokumentation'] },
  sub36: { role: 'Förskollärare', category: 'Poolpersonal', costLevel: 'Kostnadsnivå 1', competencies: ['Måltider', 'Barnsäkerhet'] },
};

const INACTIVE_IDS = new Set(['sub9', 'sub14', 'sub22', 'sub27']);

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function isoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function categoryForHistory(member: SubstituteRosterMember): string {
  return PRESCHOOL_SUBSTITUTE_PROFILES[member.id]?.category ?? member.category;
}

function costForHistory(member: SubstituteRosterMember, index: number): number {
  const category = categoryForHistory(member);
  if (category === 'Samverkanspass') return 0;
  const base = category === 'Poolpersonal' ? 1250
    : category === 'Pensionär' ? 2750
      : member.costLevel === 'Kostnadsnivå 1' ? 1850
        : member.costLevel === 'Kostnadsnivå 3' ? 2650 : 2250;
  return base + (index % 5) * (category === 'Poolpersonal' ? 80 : 125);
}

/** Synthetic demo history, generated deterministically so every roster member can be compared. */
export function createSimulatedStaffingHistory(anchor = new Date()): CompletedStaffingRecord[] {
  const records: CompletedStaffingRecord[] = [];
  SUBSTITUTE_ROSTER.forEach((member, memberIndex) => {
    const count = INACTIVE_IDS.has(member.id) ? 3 : 5 + ((memberIndex * 11) % 18);
    for (let assignmentIndex = 0; assignmentIndex < count; assignmentIndex += 1) {
      const daysAgo = INACTIVE_IDS.has(member.id)
        ? 205 + assignmentIndex * 37
        : Math.max(1, Math.floor(((assignmentIndex + 0.7) / count) * 365) + ((memberIndex * 13) % 11) - 5);
      records.push({
        id: `${member.id}-history-${assignmentIndex + 1}`,
        substituteId: member.id,
        date: isoDate(addDays(anchor, -daysAgo)),
        hours: 6 + ((memberIndex + assignmentIndex) % 4) * 0.75,
        responseMinutes: 28 + ((memberIndex * 19 + assignmentIndex * 23) % 143),
        simulatedCost: costForHistory(member, assignmentIndex),
      });
    }
  });
  return records;
}
