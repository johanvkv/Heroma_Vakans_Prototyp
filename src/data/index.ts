/**
 * Shared person / seed-data accessors (Phase 2, Step 2 — see CLAUDE.md).
 *
 * Always read from here. Never duplicate person data inline. Never introduce
 * a database, an API client, or a fetch layer — the template stays
 * dependency-free and remix-friendly.
 *
 * If a new view needs a field or row that does not yet exist:
 *   1. Extend `src/data/seed.json`
 *   2. Update `src/data/types.ts`
 *   3. Add an accessor here if the lookup is non-trivial
 *   4. Then consume it in the view
 */

import raw from "./seed.json";
import type {
  Balance,
  Employment,
  PayrollResult,
  PayrollRun,
  Person,
  SeedData,
  SimpleBalance,
  VacationBalance,
} from "./types";

const seed = raw as unknown as SeedData;

export const meta = seed.meta;
export const persons: Person[] = seed.persons;
export const payrollRuns: PayrollRun[] = seed.payrollRuns;

// ─── Person lookups ─────────────────────────────────────────────────────────

export function getPerson(id: string): Person | undefined {
  return persons.find((p) => p.id === id);
}

export function fullName(person: Person): string {
  return `${person.firstName} ${person.lastName}`;
}

// ─── Employment lookups ─────────────────────────────────────────────────────

export function getEmploymentsForPerson(personId: string): Employment[] {
  return getPerson(personId)?.employments ?? [];
}

export function getEmployment(
  personId: string,
  employmentId: string,
): Employment | undefined {
  return getEmploymentsForPerson(personId).find((e) => e.id === employmentId);
}

export function getActiveEmployment(personId: string): Employment | undefined {
  const today = new Date().toISOString().slice(0, 10);
  return getEmploymentsForPerson(personId).find((e) => {
    if (e.status !== "active") return false;
    if (e.validFrom > today) return false;
    if (e.validTo && e.validTo < today) return false;
    return true;
  });
}

// ─── Balance lookups ────────────────────────────────────────────────────────

export function getBalancesForPerson(personId: string): Balance[] {
  return getPerson(personId)?.balances ?? [];
}

export function getSimpleBalance(
  personId: string,
  type: SimpleBalance["type"],
): SimpleBalance | undefined {
  return getBalancesForPerson(personId).find(
    (b): b is SimpleBalance => b.type === type,
  );
}

export function getVacationBalance(personId: string): VacationBalance | undefined {
  return getBalancesForPerson(personId).find(
    (b): b is VacationBalance => b.type === "vacation",
  );
}

// ─── Payroll lookups ────────────────────────────────────────────────────────

export function getPayrollRun(id: string): PayrollRun | undefined {
  return payrollRuns.find((r) => r.id === id);
}

export function getPayrollResultsForPerson(personId: string): PayrollResult[] {
  return payrollRuns.flatMap((run) =>
    run.results.filter((r) => r.personId === personId),
  );
}

export type {
  Balance,
  Employment,
  PayrollResult,
  PayrollRun,
  Person,
  SeedData,
  SimpleBalance,
  VacationBalance,
} from "./types";
