# Improvement Plan — Phase 2

> **How to use this file:** Same spirit as `Improvement.md` (phase 1) — a tool-agnostic,
> step-by-step work order. Each step states its goal, the **analysis verdict** (is the claim
> correct?), the evidence in this codebase, a **self-contained pattern to implement**, the exact
> files to touch, and how to verify. Every step can be executed **without any external project**.
> The steps below are in the **sequence to implement them** (Step 1 → Step 5). What actually gets
> built is tracked in `docs/phase2-log.md` (separate from this plan).

---

## 0. Purpose & context

Phase 1 (`Improvement.md`) is complete: the design-system rules are enforced, the codebase is
cleaned, the Page Builder tool lives in its own folder, `ui-kit` wrappers exist, and lint blocks
forbidden imports. **Phase 2** is a set of five targeted improvements requested after phase 1.

### The two modes still apply
- **Mode A** — the Page Builder Studio tool (`src/page-builder-studio/**`): unrestricted.
- **Mode B** — everything else (app shell, pages, shared data): the strict design-system rules
  (DevExtreme + Bootstrap + our CSS classes + Font Awesome; no Tailwind in JSX, no inline styles,
  no shadcn/Radix/MUI/Lucide/Recharts).

The role selector, the person data view and the menu *rendering* are **Mode B** (strict). The
Page Builder export refactor is **Mode A**. The shared JSON/data files are neutral.

### Reference project (optional implementation aid — will be removed before sharing)
> An existing sister prototype at `C:\Github\Heroma_Template-2604` already implements several of
> these patterns. **You do NOT need it** — every step below is fully self-contained. It can,
> however, *speed up* the menu, role-selector and seed-data steps (Steps 1–3) because concrete
> shapes and data can be copied from it. It is a **different tech stack** (Tailwind + shadcn/ui),
> so translate patterns into our stack — never paste its components into Mode B. **This whole
> segment is disposable**: once the shapes/data are copied into `src/data/`, the plan stands on its
> own and this note can be deleted.

### Analysis verdict — all five claims are CORRECT
Listed in step order (the order in which the requests were originally given carried no meaning).

| Step | Claim | Verdict | Core evidence (this repo) |
|---|---|---|---|
| 1 | Menu is hardcoded in several places; should be one data-driven JSON | ✅ Correct | Hardcoded in 3 separate places |
| 2 | Need a shared person register; new pages should extend JSON, not embed | ✅ Correct | Views embed local mock consts |
| 3 | Header role dropdown ("Anställd") routes to user settings | ✅ Correct | `Header.tsx:154` opens `UserProfilePanel` |
| 4 | Export / Save draft / Export / Preview have duplicated code | ✅ Correct (mostly) | `serializeComponent` copy-pasted & drifted |
| 5 | The long `Guidelines.md` has good content but isn't actually used | ✅ Correct | 2840 lines, no on-demand structure |

### Decisions (resolved — baked into the steps below)
- **D1 (menu JSON scope):** start **minimal** (`id`/`label`/`icon`/`path`/`children`). Add a
  `roles` field only when the role selector (Step 3) lands.
- **D2 (person view location):** a **dedicated page** (`/installningar/personer` style) linked from
  the user-settings panel — easier to grow than an inline panel.
- **D3 (Guidelines format):** **index-first single file** — add a navigable "read this for your
  task" index to `Guidelines.md`; only split into separate files later if it proves insufficient.
- **D4 (seed data scope):** **copy the FULL dataset** (persons with employments, balances, payroll)
  into `src/data/`. The read-only **view page may show a limited subset** of columns/fields.
- **D5 (role filtering):** **cosmetic first** — ship the selector; wire role→content filtering later.

---

## Execution order & the shared data layer

The steps are presented **in the order to implement them**, ordered by **dependency and leverage**.
**Steps 1–3** all build on a tiny shared **`src/data/`** layer (`menu.json`, `seed.json`/`types.ts`/
accessors, `roles.ts`), so the sequence leads with the foundation; **Steps 4–5** are independent and
slot in afterwards.

| Step | What | Why here |
|---|---|---|
| 1 | Data-driven menu | Creates `src/data/`; removes the triple-hardcoded menu; highest leverage. |
| 2 | Person register + read-only view | Extends `src/data/`; gives every later page consistent base data. |
| 3 | Role selector | Adds `src/data/roles.ts`; after Step 1 so it can add `roles` to `menu.json` (D1). |
| 4 | Export dedup | Independent Mode A cleanup; no dependencies either way. |
| 5 | Guidelines restructure | Docs-only; natural wrap-up (fold in the B1 font cleanup). |

Phase-1 guardrails apply to every step: capture a `pnpm build` (and `pnpm lint`) baseline and re-run
both after each change. Keep Mode A vs Mode B discipline: the role selector, data view and menu
rendering are **Mode B** (strict); the Page Builder export refactor is **Mode A**.

---

## Step 1 — Data-driven menu (single JSON source of truth)

> ✅ **Done** — implemented and verified; see `docs/phase2-log.md` for the as-built details.

**Goal:** One menu definition that BOTH the live navigation AND the Page Builder placement selector
read, so they can never drift. When a new page is created, the Page Builder output must clearly say
"add this to the menu data + register a route."

**Verdict: CORRECT.** The menu concept is currently hardcoded in **three** unrelated places:
- `src/app/components/MegaMenu.tsx` — menu items *and* `navigate('/…')` handlers, all inline.
- `src/app/components/NavigationSidebar.tsx` — `DEFAULT_NAV_DATA` (its own hardcoded tree).
- `src/page-builder-studio/PageBuilder.tsx:2275` — `pageLocations` (a *separate* hardcoded tree for
  the placement selector: Heroma → Personligt/HR/Lön/Personal/System/Tid/Components).

None share a source. Adding a page means editing several files by hand and they fall out of sync.

**Pattern to implement (minimal, per D1):**
1. Add `src/data/menu.json` — a simple recursive tree. Each node: a stable `id`, a `label`, an
   optional Font Awesome `icon` class, an optional `path` (present ⇒ the node is a navigable leaf),
   and optional `children` (array of the same shape). Example:
   ```json
   {
     "items": [
       { "id": "hem", "label": "Hem", "icon": "fa-house", "path": "/" },
       { "id": "personligt", "label": "Personligt", "icon": "fa-user",
         "children": [
           { "id": "personligt-hr", "label": "HR", "path": "/personligt/hr" }
         ] },
       { "id": "components", "label": "Components", "icon": "fa-table-cells", "path": "/components" }
     ]
   }
   ```
   (No `roles` yet — that field is added in Step 3.)
2. Add `src/data/menu.ts` — a tiny typed loader + small helpers: the derivation helpers the consumers
   need (`getMegaMenuItems` / `getMegaMenuContent` / `getPageLocations`) AND **`getMenuNameById(id)`**
   (id → display name), which the Page Builder OUTPUT needs in sub-step 4. No validation engine, no
   `localStorage` — just a typed import.
3. Repoint the nav consumers and delete their inline trees: `MegaMenu` (render items + derive
   navigation from each leaf's `path`) and the Page Builder `pageLocations` (the placement dropdown).
   (Leave `NavigationSidebar` alone — see the finding.)
4. **Repoint the Page Builder OUTPUT functions too — easy to miss, they are SEPARATE code paths from
   the placement dropdown.** BOTH "Export Code" (`buildExportCode` in `pageBuilderExport.ts`) and
   "Create Page" (`handleCreatePage` in `PageBuilder.tsx`) must:
   - **Show the selected location by NAME**, resolved via `getMenuNameById(selectedLocation)` — never a
     hardcoded `locationMap` (it drifts) or the raw id.
   - **Print data-driven wiring instructions**, e.g.:
     ```
     // TODO (required to wire this page up):
     //   1) Add "<PageName>" to src/data/menu.json under the "<Location>" primary (with a "path")
     //   2) Add a route in src/app/routes.tsx
     //   The menu is data-driven — nav + placement both read menu.json; do NOT hardcode in MegaMenu.tsx.
     ```
     Delete any old "add to MegaMenu.tsx section array / handleSearchItemClick()" text, and add a
     design-system reminder (CLAUDE.md/Guidelines + ui-kit) to the Create Page instructions.
5. Update **`CLAUDE.md` → "Before writing UI code"**: the new-page wiring rule must say **route +
   entry in `src/data/menu.json`** (data-driven), NOT "add the nav entry in `NavigationSidebar.tsx`".
   This is the guidance for the plain-prompt flow — a page built WITHOUT the Page Builder.

**Files:** `src/data/menu.json` (new), `src/data/menu.ts` (new, incl. `getMenuNameById`),
`MegaMenu.tsx`, `PageBuilder.tsx` (`pageLocations` + `handleCreatePage`), `pageBuilderExport.ts`
(`buildExportCode`), `CLAUDE.md` (page-wiring rule). (`NavigationSidebar.tsx` deliberately untouched —
see finding.)
**Mode:** spans A (builder) + B (nav render); the JSON is neutral.
**Verify:** menu renders unchanged; the placement dropdown shows the same tree; editing `menu.json`
changes the nav, the placement dropdown, AND both output functions (the selected-location NAME and the
wiring TODO update); Create Page / Export Code print data-driven instructions (menu.json + route), not
the old MegaMenu / `handleSearchItemClick` text.

> **Finding (execution 2026-07-08):** `NavigationSidebar.DEFAULT_NAV_DATA` was intentionally **NOT**
> repointed — on inspection it is a separate, editable demo nav (Dashboard/Components/Patterns) for a
> Page Builder component, not the main menu, so coupling it to `menu.json` would be wrong. Also: the
> unreachable `oversikter` portal view was dropped (dead code), and `_overviewCards` is kept
> present-but-empty (reserved for a later phase). The MegaMenu keeps its exact render output by
> consuming derived shapes (`getMegaMenuItems`/`getMegaMenuContent`) rather than changing its
> rendering logic. Final `menu.json` uses the Heroma object-keyed shape (Primary → `_overviewCards[]`
> → sections → `options[]`), with **Hem** first (leaf → `/`) and **Page Builder Studio** last
> (leaf → `/components`).
>
> **Also part of Step 1 (separate code paths — easy to miss):** the Page Builder OUTPUT.
> `handleCreatePage` ("Create Page") had its OWN hardcoded `locationMap` + stale "add to MegaMenu.tsx /
> handleSearchItemClick" instructions, and `buildExportCode` ("Export Code") omitted the selected
> location. Both were repointed to `getMenuNameById` + data-driven wiring instructions, and
> `CLAUDE.md`'s page-wiring rule was fixed to `menu.json`. Do these together with the rest of Step 1 —
> not as a later fix.

---

## Step 2 — Shared person register + read-only data view

**Goal:** A basic, reusable person register so new pages get consistent base data for free; new
person-related pages **extend the JSON data model** (related fields or separate objects, in the same
folder) instead of embedding mock data in the GUI; and a **read-only view** of the data available
under user settings.

**Verdict: CORRECT.** Today, views embed their own mock consts (e.g. `gridData` in
`UiKitReference.tsx`, and the dashboard cards `SalaryCard`/`VacationCard`). There is no shared data
source, so every page invents its own numbers.

**Pattern to implement (a small, static, dependency-free data layer):**
1. Create `src/data/` with three files:
   - **`seed.json`** — the single source of truth. Per **D4, copy the FULL person dataset** (from
     the reference project, or author an equivalent). It should cover, per person: identity
     (name, personal id, birth date, gender), `addresses[]`, `nextOfKin[]`, `children[]`, `taxInfo`,
     `employments[]` (each with position, salary, rules, time measures, organization/cost centre),
     and `balances[]` (flex / comp / vacation). Plus top-level `payrollRuns[]` (period, status,
     per-person results). A top-level `meta` block (schema version, purpose) is useful.
   - **`types.ts`** — TypeScript interfaces for all of the above (`Person`, `Address`, `NextOfKin`,
     `Child`, `TaxInfo`, `Employment`, `Balance` as a union of `SimpleBalance` | `VacationBalance`,
     `PayrollRun`, `PayrollResult`, `SeedData`). Header comment states the **rule**: *"Extend this
     file and `seed.json` when a new view needs a field. Do NOT create local mock data in views."*
   - **`index.ts`** — accessors that views import (`persons`, `getPerson(id)`, `fullName(p)`,
     `getActiveEmployment(personId)`, `getVacationBalance(personId)`,
     `getPayrollResultsForPerson(personId)`, …). Header comment states the **rule**: *"Always read
     from here. Never duplicate person data inline. Never add a database, API client or fetch layer
     — the template stays static and remix-friendly."*
   (Vite imports JSON natively; plain `.ts` types work without `tsconfig` since esbuild strips them.)
2. Add a **project rule** to `CLAUDE.md` (and the relevant `Guidelines.md` section): *person-related
   pages must read from `src/data/` and extend `seed.json` + `types.ts` — never embed person mock
   data in a component.*
3. Add a **read-only data view** as a **dedicated page** (per **D2**), e.g. `/installningar/personer`,
   linked from the user-settings panel (`UserProfilePanel`). Render with a DevExtreme `DataGrid` in
   read-only mode. Per **D4 the view may be limited** — show a sensible subset of columns
   (e.g. name, personal id, department/cost centre, employment form, degree %), not every nested
   field. No add/edit/delete controls.
4. **POC migration:** convert the reference page and/or a dashboard card to read from `src/data/`
   instead of a local const, proving the pattern end-to-end.

**Files:** `src/data/{seed.json,types.ts,index.ts}` (new), `CLAUDE.md`/`Guidelines.md` (rule), a new
read-only page + its route in `src/app/routes.tsx` + a link in `UserProfilePanel`, plus a POC
migration. **Mode:** B / shared data.
**Verify:** a page renders person data from `src/data/`; the read-only page lists persons with a
limited column set and no edit controls; no new component invents its own person mock data.

> **Finding (execution 2026-07-08 — Step 2 DONE):** The full 20-person dataset (`seed.json`) +
> `types.ts` + `index.ts` accessors were copied and their file headers de-referenced from the
> reference project. The read-only view is `src/app/pages/Personer.tsx` at `/installningar/personer`
> (DevExtreme DataGrid, search + header filter, no editing; limited columns per D4), linked from
> `UserProfilePanel`. The `CLAUDE.md` "Shared data (person register)" rule was added, and
> `UiKitReference.tsx` now reads its grid rows from `src/data` as the POC. `pnpm build` + `pnpm lint`
> green.

---

## Step 3 — Turn the header "Anställd" button into a role selector

**Goal:** The header role control opens a **role selector** (choices **Admin, Anställd, Chef** in
alphabetical order, **Admin pre-selected**) instead of opening user settings.

**Verdict: CORRECT.** `Header.tsx:154–157` renders a button showing `Anställd` whose `onClick`
does `setIsUserProfileOpen(true)` — i.e. it opens the `UserProfilePanel` (user settings), not a
role picker.

**Pattern to implement (Mode B — native markup + our CSS, NOT shadcn):**
1. Add `src/data/roles.ts`:
   ```ts
   export interface Role { id: string; label: string; }
   export const ROLES: Role[] = [
     { id: 'admin',    label: 'Admin' },
     { id: 'anstalld', label: 'Anställd' },
     { id: 'chef',     label: 'Chef' },
   ];
   export const DEFAULT_ROLE_ID = 'admin';
   ```
   Display order is alphabetical by `label` using `localeCompare(…, 'sv')` → **Admin, Anställd, Chef**.
2. Add a lightweight `RoleContext` (React context holding `selectedRoleId` + a setter, plus a
   `useRole()` hook) and wrap the app so the selection is app-wide. Default to `DEFAULT_ROLE_ID`.
3. Change the header button (`Header.tsx`) so it shows the **current role label** + a Font Awesome
   chevron and, on click, opens a **dropdown** built with native markup + our CSS classes (reuse the
   existing `Dropdown`/`SearchDropdown` pattern, or a small local dropdown). The dropdown lists the
   three roles alphabetically with a selected indicator; Admin is selected by default; picking a role
   updates the label. Keep user-settings still reachable via the separate user-icon button.
4. (Synergy, deferred per D5) later, the selected role can filter menu visibility via a `roles`
   field on menu entries (Step 1).

**Files:** `Header.tsx`, new `RoleContext` (e.g. `src/app/components/RoleContext.tsx` or
`src/data/RoleContext.tsx`), `src/data/roles.ts`. **Mode:** B (app shell — strict rules).
**Verify:** header shows the current role; clicking opens Admin/Anställd/Chef alphabetically with
Admin selected; choosing one updates the label; the user-settings panel still opens from the user
icon.

> **Finding (execution 2026-07-08 — Step 3 DONE):** Built with `src/data/roles.ts` +
> `src/app/components/RoleContext.tsx` (provider wraps the router in `App.tsx`) + `RoleSelector.tsx`.
> The selector reuses existing classes (`nav-btn` trigger, `employee-actions-flyout`/`-item`
> dropdown) + a Font Awesome check + Bootstrap `invisible`/`me-2` utilities — **no new CSS, no
> shadcn**. Roles sort `localeCompare('sv')` → Admin, Anställd, Chef; Admin default. User settings
> stay on the separate user-icon button. Cosmetic only (D5). `pnpm build` + `pnpm lint` green.

---

## Step 4 — Deduplicate the Page Builder save/export code

**Goal:** One serialization path shared by Save draft and Export; reuse the existing download
helper; remove the copy-paste that has already drifted.

**Verdict: CORRECT (with nuance).** There are **four** actions; two of them genuinely duplicate
logic:
- **Save draft** (`saveDraft`, `PageBuilder.tsx:3836`) — serializes the component tree → `localStorage`.
- **Export** (`exportDesign`, `PageBuilder.tsx:4033`) — serializes the component tree → `.json` file.
  Its `serializeComponent` (4042–4100) is a **verbatim copy** of the one in `saveDraft` (3847–3905),
  with the comment *"Serialize using the same logic as saveDraft."*
- **The two copies have already drifted:** `saveDraft` stores `tabsActiveStates`; `exportDesign`
  stores `stepperActiveStates`. A textbook copy-paste bug — they should serialize the same state.
- `exportDesign` also **re-implements** the blob/anchor/download inline instead of reusing the
  existing `downloadFile()` helper (3824).
- The **import/load** side mirrors this: `importDesign` says *"Deserialize using the same logic as
  loadDraft"* — the same duplication in reverse.

The other two actions are **not** true duplicates: **Preview** (visual modal) and **Export Code**
(`buildExportCode` → generates a `.tsx` component) do different jobs. This step does not merge them;
it only removes the serialize/deserialize/download duplication.

**Pattern to implement (internal refactor):**
1. Extract one `serializeDesign(components, activeStates)` and one `deserializeDesign(data)` — e.g.
   into `pageBuilderExport.ts` or a new `pageBuilderSerialize.ts`.
2. `saveDraft`, `exportDesign`, `loadDraft`, `importDesign` all call the shared functions.
3. Decide the correct active-state payload **once** (include BOTH `tabsActiveStates` AND
   `stepperActiveStates` if both matter) so save/export are consistent — fixing the drift.
4. `exportDesign` reuses `downloadFile()`.

**Files:** `PageBuilder.tsx`, `pageBuilderExport.ts` (or new serialize module). **Mode:** A
(unrestricted). **Verify:** save→load and export→import round-trip preserve the same design,
including both tab AND stepper active states; `pnpm build` green.

> **Finding (execution 2026-07-08 — Step 4 DONE):** Extracted `serializeComponent(s)` +
> `deserializeComponent(s)` into a new `src/page-builder-studio/pageBuilderSerialize.tsx`; all four
> call sites (`saveDraft`, `loadDraft`, `exportDesign`, `importDesign`) use it. The **deserialize
> copies had ALSO drifted** — `loadDraft` dropped `stepperSteps`; `importDesign` dropped
> `buttonIcon`/`buttonIconPosition`/`segmentedButtonIcons`/`inputType`/`inputWidth` and the tab
> `icon` — so the single implementation restores the UNION of fields (a real bug fix). Save/export
> now both persist `tabsActiveStates` AND `stepperActiveStates`, and `exportDesign` reuses
> `downloadFile()`. Out of scope: `handleCreatePage` has a THIRD, structurally different serialize
> (own `serializeStepperSteps`/… helpers) — left as-is. `pnpm build` + `pnpm lint` green.

---

## Step 5 — Make `Guidelines.md` actually useful to an AI

**Goal:** Turn the 2840-line spec into something an AI reliably *uses* while building a page —
whether the input is a prompt, a screenshot, or Page Builder output — especially for the common case
where there is **no ready-made component** but the result must still follow our rules, colors and
tokens.

**Verdict: CORRECT concern.** The full `Guidelines.md` holds genuinely good detail, but a single
2840-line file is read partially at best. Phase 1 added `CLAUDE.md` (always-read essentials) and
cross-links, but the detailed spec is still a wall of text with no on-demand entry points.

**Pattern to implement (index-first, per D3):**
1. Add a **navigable index at the very top of `Guidelines.md`** — a "read the section for your
   task" table so an agent can jump straight to the relevant part. Give every major section a
   stable, numbered anchor. Shape:
   | Task you're doing | Read section |
   |---|---|
   | Colors, tokens, variables, dark mode | §Styling & tokens |
   | Buttons | §Buttons |
   | Cards / blocks | §Cards |
   | Inputs / forms / selects / dates | §Inputs |
   | Tables / data grids | §Tables |
   | Tabs / accordions / steppers | §Composite components |
   | Icons | §Icons |
   | Accessibility | §Accessibility |
2. Add a **"When there is no ready-made component"** section — the gap the user described: how to
   build custom markup that STILL uses our design tokens (`var(--primary)`, `var(--card-border)`,
   the font tokens, etc.), our CSS classes, Bootstrap layout utilities and Font Awesome. Include a
   short worked example (a bespoke element styled only with tokens/classes, no inline styles, no
   Tailwind).
3. Wire it from `CLAUDE.md`: a one-liner like "for detail on X, open `Guidelines.md` → §X" so the
   always-read file points at the map.
4. Keep it a single file for now; only split into numbered files under `guidelines/` if the in-file
   index proves insufficient.

**Files:** `Guidelines.md` (add index + the "no ready component" section + section anchors),
`CLAUDE.md` (pointers). **Mode:** B / docs.
**Verify:** from a cold prompt, the AI can name which section to read for a given task without being
told; the "no ready component" path is documented.
**Note:** while restructuring, fix the stale `Source Sans Pro` per-component specs to the correct
font token (decision **B1** in `docs/refactor-log.md`).

> **Finding (execution 2026-07-08 — Step 5 DONE):** Added a **task index** at the top of
> `Guidelines.md` ("read the section for your task") mapping ~15 tasks to the existing sections, a new
> **"BUILDING CUSTOM UI"** section (tokens + our classes + Bootstrap layout + FA, with a worked
> token-only example) for the no-ready-component case, and a `CLAUDE.md` pointer to both. **B1 was
> NOT mass-migrated:** the font note steers NEW code to `var(--font-family-base)` (Lato), but the ~20
> per-component `'Source Sans Pro'` specs were left — actually fixing them also requires changing the
> real CSS (`overrides.css`/`globals.css`), a visible app-wide font change, so it stays as decision
> B1. Docs-only change; `pnpm lint` green (build unaffected).
