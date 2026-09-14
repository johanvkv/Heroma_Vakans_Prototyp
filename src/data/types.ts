/**
 * Shared person / seed-data types (Phase 2, Step 2).
 *
 * Source of truth: `src/data/seed.json` — keep these types in sync with it.
 *
 * RULE: person-related pages read from `src/data/` (via `index.ts`). When a view needs a new
 * field, extend THIS file AND `seed.json` — never embed local mock person data in a component.
 * See CLAUDE.md.
 */

// ─── Enums ──────────────────────────────────────────────────────────────────

export type Gender = "female" | "male" | "other" | "unspecified";
export type AddressType = "home" | "work" | "postal" | "other";
export type Relationship =
  | "partner"
  | "spouse"
  | "mother"
  | "father"
  | "sibling"
  | "child"
  | "friend"
  | "other";
export type EmploymentStatus = "active" | "onLeave" | "ended" | "planned";
export type EmploymentForm = "Permanent" | "Temporary" | "Hourly" | "Substitute";
export type BalanceType = "flex" | "comp" | "vacation";
export type PayrollStatus = "draft" | "preliminary" | "approved" | "closed";

// ─── Person sub-objects ─────────────────────────────────────────────────────

export interface Address {
  type: AddressType;
  careOf?: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  isPrimary: boolean;
}

export interface NextOfKinAddress {
  street: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface NextOfKin {
  id: string;
  name: string;
  relationship: Relationship;
  phone?: string;
  mobilePhone?: string;
  email?: string;
  careOf?: string;
  address?: NextOfKinAddress;
}

export interface Child {
  id: string;
  name: string;
  birthDate: string;
  calculatedBirthDate?: string | null;
  adoptionDate?: string | null;
  multipleBirth: boolean;
}

export interface TaxInfo {
  taxType: string;
  taxTable: number;
  column: number;
  taxCode: string;
  taxCodeLabel: string;
  voluntaryTax: number;
  companyCarModelCode?: string;
  companyCarMonths?: number;
}

// ─── Employment ─────────────────────────────────────────────────────────────

export interface EmploymentPosition {
  title: string;
  positionClass: string;
  jobLabel: string;
}

export interface EmploymentSalary {
  monthlySalary: number;
  hourlySalary: number;
  payGrade: string;
  payGradeAmount: number;
}

export interface EmploymentRules {
  overtimeCompensation: boolean;
  travelTimeCompensation: boolean;
  resursHanteringRule: string;
  collectiveAgreement: string;
  vacationRule: string;
  travelRule: string;
}

export interface EmploymentTimeMeasures {
  fullTimeMeasure: number | string;
  restTimeCompensation: boolean | number | string;
}

export interface EmploymentOrganization {
  department: string;
  costCenter: string;
  accountingCode: string;
  rekvag: string;
  avgvag: string;
  annotation: string;
}

export interface Employment {
  id: string;
  status: EmploymentStatus;
  idnr: string;
  validFrom: string;
  validTo?: string | null;
  v?: string;
  position: EmploymentPosition;
  employmentForm: EmploymentForm;
  fmgGroup: string;
  /** percentage 0..100 */
  degree: number;
  salary: EmploymentSalary;
  rules: EmploymentRules;
  timeMeasures: EmploymentTimeMeasures;
  organization: EmploymentOrganization;
}

// ─── Balances (discriminated union) ─────────────────────────────────────────

interface BalanceBase {
  id: string;
  personId: string;
  employmentId: string;
  label: string;
  unit: string;
}

export interface SimpleBalance extends BalanceBase {
  type: "flex" | "comp";
  value: number | string;
}

export interface VacationBalanceRow {
  key: string;
  label: string;
  earned: number;
  remaining: number;
}

export interface VacationBalanceSummary {
  total: number;
  saved: number;
}

export interface VacationBalance extends BalanceBase {
  type: "vacation";
  summary: VacationBalanceSummary;
  rows: VacationBalanceRow[];
}

export type Balance = SimpleBalance | VacationBalance;

// ─── Person ─────────────────────────────────────────────────────────────────

export interface Person {
  id: string;
  personalIdentityNumber: string;
  firstName: string;
  lastName: string;
  displayName: string;
  birthDate: string;
  gender: Gender;
  addresses: Address[];
  nextOfKin: NextOfKin[];
  children: Child[];
  taxInfo: TaxInfo;
  employments: Employment[];
  balances: Balance[];
}

// ─── Payroll ────────────────────────────────────────────────────────────────

export interface PayrollPeriod {
  year: number;
  month: number;
  from: string;
  to: string;
}

export interface PayrollResultItem {
  code: string;
  label: string;
  amount: number;
}

export interface PayrollResult {
  personId: string;
  employmentId: string;
  grossSalary: number;
  items: PayrollResultItem[];
  netSalary: number;
}

export interface PayrollRun {
  id: string;
  period: PayrollPeriod;
  status: PayrollStatus;
  results: PayrollResult[];
}

// ─── Top-level ──────────────────────────────────────────────────────────────

export interface SeedMeta {
  schemaVersion: string;
  systemName: string;
  generatedAt: string;
  seedPurpose: string;
}

export interface SeedData {
  meta: SeedMeta;
  persons: Person[];
  payrollRuns: PayrollRun[];
}
