# Improvement Plan — Enforcing the Design System for Production-Like Prototypes

> **How to use this file:** This is a tool-agnostic, step-by-step work order. It can be
> executed later in any environment (Figma Make, Claude Code, Cursor, plain CLI). Each
> step is self-contained, states its goal, lists the exact files to touch, and gives
> copy-pasteable content. Do the steps in order — later steps assume earlier ones exist.

> **Status (2026-07-08):** The throwaway `/personligt` scratch page (added by an early Figma
> Make prompt) has been **removed** — its page file (`src/app/pages/Personligt.tsx`), its
> `/personligt` route, and its `NavigationSidebar` entry are all gone. Steps 3 and 5d below
> have been updated accordingly: the Step 3 proof-of-concept is now a **freshly authored**
> reference page, not a refactor of `/personligt`. The verified CSS-wiring map in Step 5e was
> also corrected (feature CSS is chained through `globals.css`, not `App.tsx`).

---

## 0. Purpose & Guiding Principle

The purpose of this app is to build **production-like prototypes** that use our
**production component library (DevExtreme + Bootstrap) and our styling language (CSS
classes + design tokens)** so that prototypes are cheap and safe to hand over to
engineering for real implementation.

A prototype may be created from **three different kinds of input**:

1. **Page Builder export** — generated via the Page Builder Studio export function.
2. **A Figma design frame** — imported as React code (`<figma_imported_react_code>`).
3. **Plain prompt text** — a written description of the desired UI.

**The non-negotiable rule:** regardless of which input is used, the *output* must obey the
**same** design-system rules. The input format only determines the starting material — it
must never determine the styling approach. All three paths converge on:

- **DevExtreme** for data grids, charts, forms, date pickers, dropdowns, complex widgets.
- **Bootstrap** for layout (grid, containers) and utility classes (spacing, flex, display).
- **Native HTML + our CSS classes** for buttons, cards, simple inputs.
- **Font Awesome** for all icons.
- **CSS classes in `overrides.css` / `globals.css` + design tokens** for all styling.
- **No Tailwind utility classes in JSX, no inline `style={{}}`, no Lucide, no Recharts,
  no shadcn/Radix/MUI/AntD component libraries.**

### Why there is tension today
The Make platform's *default* authoring style (Tailwind utility classes, Lucide icons,
shadcn components) is the **opposite** of our rules. The project also physically ships the
conflicting libraries (`lucide-react`, `recharts`, a full shadcn `ui/` folder, MUI, Radix).
Because enforcement is currently only *soft* (instruction text that may or may not be read),
the AI drifts toward its defaults. This plan converts the most important rules from **soft
enforcement (hope)** into **hard enforcement (build fails / component makes wrong code
impossible)**.

### The enforcement ladder (mental model)
```
Weakest  ->  Long guideline doc the AI partially reads
             Short CLAUDE.md the AI reads every session
             Wrapper components that bake in correct styling
Strongest -> ESLint/lint rules that fail the build on violation
```
Steps 1–4 below climb this ladder.

---

## 0.1 The Two Work Modes (READ BEFORE ANY TASK)

This repository is not one app under one rulebook — it is **two apps with two different
rulebooks**, living in the same codebase. The single most important thing the AI must do is
**decide which mode it is in before writing any code.** Applying the wrong rulebook is the
root cause of the design-system tension.

### Mode A — Building/Improving **Page Builder Studio** itself (UNRESTRICTED)
Page Builder Studio is an **"app within the app"** — a tool used to *construct* prototypes.
It is itself built with Tailwind and has **no framework restrictions**. When the task is to
**improve the Page Builder tool itself** (its canvas, drag-and-drop, toolbars, property
panels, export logic, editable-component internals), the AI should use **whatever is most
effective** — Tailwind utilities, any React libraries, any icon set. The design-system rules
(DevExtreme-only, Font Awesome-only, no Tailwind, etc.) **do NOT apply here.** Optimize for
the best tooling UX and developer velocity.

### Mode B — Creating/editing everything else (MANDATORY design-system rules)
This is the app's core purpose: producing **production-like prototype pages** — whether the
input is a Page Builder export, an imported Figma frame, or a plain text prompt. Here the
`.md` rules (`CLAUDE.md` + `Guidelines.md`) are **mandatory and non-negotiable**: DevExtreme
+ Bootstrap + native HTML + our CSS classes + Font Awesome, no Tailwind in JSX, no inline
styles, no Lucide/Recharts/shadcn/MUI.

> **Key insight:** The *artifacts the Page Builder outputs* are Mode B (they must obey the
> rules). The *Page Builder tool that produces them* is Mode A (it need not). Don't confuse
> "the factory" with "the product."

### Step 0 — Initial Assessment (the AI must do this first, every task)
Before touching code, classify the task:

```
Is the task about the Page Builder Studio TOOL itself
(its canvas / toolbar / property panel / drag-drop / export engine / editable-component internals)?
   ├─ YES → MODE A (unrestricted). Use the most effective tools. Design-system rules do NOT apply.
   └─ NO  → MODE B (mandatory). Apply CLAUDE.md + Guidelines.md rules in full.

If genuinely ambiguous → assume MODE B (the stricter mode) and ask the user to confirm.
```

### How to make the boundary machine-detectable (recommended)
Soft prose isn't enough — make the boundary **physical and enforceable**:

1. **Give Page Builder Studio its own directory.** Consolidate all tool code under a single
   root, e.g. `src/page-builder-studio/`. Today it is spread across
   `src/app/components/PageBuilder*.tsx` and `src/app/components/pageBuilder*.ts`
   (`PageBuilder.tsx`, `PageBuilderAccordionContext.tsx`, `PageBuilderDataGrid.tsx`,
   `PageBuilderEditableComponents.tsx`, `PageBuilderGridComponents.tsx`,
   `PageBuilderTabsContext.tsx`, `pageBuilderExport.ts`, `pageBuilderHelpers.ts`,
   `pageBuilderTypes.ts`). Moving them into one folder makes "which mode is this file?" a
   pure path lookup.
   > **Finding (2026-07-08 execution — Step 0b DONE):** The actual tool set is **10 files** — the
   > 9 above PLUS `figmaFrameExport.ts` (imported by `PageBuilder.tsx`; imports `pageBuilderTypes`).
   > All 10 cross-import only each other via `./`, so they `git mv` together cleanly into
   > `src/page-builder-studio/`. Two fixes after the move: (a) the tool imports 5 SHARED components
   > that STAY in `src/app/components/` — rewrite `./NavigationSidebar`, `./Spacer`,
   > `./SidebarContentLayout`, `./Alert`, `./Accordion` → `../app/components/…`; (b) the only
   > external importer is `src/app/pages/Components.tsx` → repoint to
   > `../../page-builder-studio/PageBuilder`. Do NOT touch the literal string
   > `import { Alert } from './components/Alert'` inside `pageBuilderExport.ts` — that is generated
   > export-code text, not a real import.
2. **Encode the boundary as a path glob** used by both the AI and the linter:
   - **Mode A territory:** `src/page-builder-studio/**` (or, until moved,
     `src/app/components/{PageBuilder*,pageBuilder*}`).
   - **Mode B territory:** everything else under `src/` — especially `src/app/pages/**`.
3. **State the boundary in `CLAUDE.md`** (Step 1) and **scope the lint rules by path**
   (Step 4) so Mode A is exempt from the restricted-import rules and Mode B is fully covered.

---

## Step 1 — Create a root `CLAUDE.md` with the critical rules

**Goal:** Give the AI a short, always-read file at session start so the top rules are in
context *before* any prompt, without relying on the platform injecting `guidelines/Guidelines.md`.

**Why this matters:** Today only the 169-line `guidelines/Guidelines.md` is auto-injected;
the 2840-line root `Guidelines.md` is never read. There is no `CLAUDE.md` at all. Tools
in the Claude Code / Cursor family automatically read a root `CLAUDE.md` (Cursor also reads
`.cursorrules`) at the start of every session. A *short* file is read and followed far more
reliably than a long one.

**File to create:** `/CLAUDE.md` (repo root)

**Exact content to write:**

```markdown
# CLAUDE.md — Project Rules (READ FIRST, EVERY SESSION)

This project builds **production-like prototypes** using our production stack.
The full design system lives in `Guidelines.md`. These are the enforced essentials.

## Purpose
Prototypes must be implementable by engineering with minimal rework. Input may come from
Page Builder export, an imported Figma frame, or a plain text prompt — the output rules
below are IDENTICAL in all three cases.

## Rule 0 — FIRST decide the work mode (before any code)
This repo has TWO modes with TWO rulebooks:
- **MODE A — Page Builder Studio tool itself** (files under `src/page-builder-studio/**`, or
  today `src/app/components/{PageBuilder*,pageBuilder*}`). This is an "app within the app"
  used to *build* prototypes. It is Tailwind-based and UNRESTRICTED — use whatever is most
  effective (Tailwind, any libs, any icons). The rules below DO NOT apply in Mode A.
- **MODE B — everything else** (especially `src/app/pages/**`): creating/editing prototype
  pages from Page Builder export, Figma frames, or prompts. The 10 rules below are MANDATORY.

Decision: *"Am I changing the Page Builder TOOL, or building a prototype page?"*
Tool → Mode A. Anything else / ambiguous → Mode B (assume the stricter mode; ask if unsure).
The 10 rules below apply to **Mode B only.**

## The 10 Rules (Mode B)
1. **No Tailwind utility classes in JSX.** No `w-4`, `p-4`, `text-xl`, `flex`, etc.
   Tailwind exists ONLY for design tokens in `src/styles/theme.css`. Never author with it.
2. **No inline styles.** Never write `style={{}}`. All styling goes in
   `src/styles/overrides.css` or `src/styles/globals.css`, using tokens like `var(--primary)`.
3. **Icons: Font Awesome only.** `<i className="fa-regular fa-user"></i>`. Never `lucide-react`.
   (`fa-light`/`fa-duotone` need FA Pro — use `fa-regular`/`fa-solid` if Pro is absent.)
4. **Charts: DevExtreme only.** `devextreme-react/chart`, `.../pie-chart`. Never `recharts`.
5. **Complex UI: DevExtreme only.** DataGrid, Form, SelectBox, DateBox, TextBox, etc.
6. **No third-party component libraries.** No shadcn, Radix, MUI, Ant Design.
   Do NOT import from `src/app/components/ui/*` (that folder is deprecated — see Improvement.md).
7. **Bootstrap is allowed ONLY for** layout (grid/containers/rows/cols) and utility
   classes (spacing/flex/display), plus native buttons/cards/inputs with Bootstrap classes.
8. **Buttons/cards/simple inputs:** native HTML + our CSS classes (`.btn-primary`,
   `.btn-secondary`, `.btn-tertiary`, `.card-standard`, ...). Always set explicit classes;
   never rely on component defaults.
9. **Font:** Lato only (`latoweb`) via `var(--font-family-base)` / `var(--font-family-primary)`
   (and `latowebheavy` / `var(--font-family-heavy)` for bold). NOT Source Sans Pro.
10. **Prefer the project wrappers** in `src/app/components/` (e.g. `<Layout>`, `Stepper`,
    `CardMenu`, and the new UI wrappers) over hand-rolling markup.

## Before writing UI code
- Check `Guidelines.md` (root) for the detailed spec of the component you are building.
- Check `src/app/components/` for an existing compliant component and reuse it.
- Add new page components under `src/app/pages/`, register the route in `src/app/routes.tsx`,
  and add the nav entry in `src/app/components/NavigationSidebar.tsx`.

## Handling the three input types
- **Figma import / Page Builder export:** treat the imported code as *content and layout
  intent only*. Re-express every styled element using our rules above. Imported Tailwind/
  inline styles/foreign components must be translated, not kept.
- **Plain prompt:** same rules; infer the closest DevExtreme/Bootstrap equivalent.
```

> **Finding (2026-07-08 execution):** Rule 9 originally read "Source Sans Pro only" — that is
> **wrong** and was corrected above to Lato. Ground truth: the code's base tokens are Lato
> (`--font-family-base` / `--font-family-primary: 'Lato'`) and root `Guidelines.md`'s font *rule*
> already says `latoweb`/Lato. Remaining nuance: ~20 per-component specs in root `Guidelines.md`
> (and several `globals.css` element rules) still say "Source Sans Pro" and contradict the rule —
> this is logged as a product decision in `docs/refactor-log.md` → "Framtida förbättringar &
> beslut" and must NOT be fixed ad hoc.

**Verification for Step 1:**
- `CLAUDE.md` exists at repo root.
- Open a fresh session and confirm the rules are honored without the user restating them.

---

## Step 2 — Consolidate the two `Guidelines.md` files

**Goal:** Eliminate the gap where the authoritative 2840-line spec is never read while a
169-line summary is the only thing injected.

**Current state:**
- `/Guidelines.md` — ~2840 lines, full spec (buttons, cards, accordions, dark mode, inputs,
  tables, tooltips, dropdowns). **Never read today.**
- `/guidelines/Guidelines.md` — ~169 lines, abbreviated. **Auto-injected by the platform.**

**Chosen approach — "summary injects, full spec is one hop away":**
Keep the platform-injected short file as the canonical *summary*, and make it explicitly
point to the full file, so any tool/agent knows where the detail lives.

**Files to change:**

1. **`/guidelines/Guidelines.md`** — keep it short (this is what gets injected). At the very
   top add a pointer block:

   ```markdown
   > This is the SHORT design-system summary that the platform auto-injects.
   > The COMPLETE, authoritative specification is in `/Guidelines.md` at the repo root.
   > For any detailed component spec (button states, card borders, accordion icons,
   > dark mode, inputs, tables, tooltips, dropdowns) READ `/Guidelines.md` before coding.
   ```
   Ensure the 10 critical rules in this file are byte-for-byte consistent with `CLAUDE.md`
   (Step 1). If they disagree, fix the summary — never the intent.

2. **`/Guidelines.md`** — keep as the single source of truth for detail. At the top add:

   ```markdown
   > This is the AUTHORITATIVE full design system spec. A short summary lives in
   > `/guidelines/Guidelines.md` (auto-injected) and `/CLAUDE.md` (read every session).
   > If any summary conflicts with this file, THIS file wins for detail;
   > the summaries win only for "which rule is most important".
   ```

**Decision to record:** Do **not** delete either file. Two files with clear roles
(summary vs. detail) plus explicit cross-references is safer than one giant file that gets
truncated or partially read.

**Verification for Step 2:**
- Both files cross-reference each other.
- The 10 rules are identical across `CLAUDE.md` and `guidelines/Guidelines.md`.

---

## Step 3 — Build compliant wrapper components

**Goal:** Remove authoring decisions. If the AI (or a developer) uses a wrapper, producing
non-compliant markup becomes *impossible* because the correct classes/structure are baked in.

**Why this matters:** The most repeated mistakes are buttons, cards, and page scaffolding.
A `<PrimaryButton>` that already applies `.btn-primary` cannot get the wrong class. This is
the strongest form of enforcement short of lint rules, and it also speeds up generation.

**Where to put them:** `src/app/components/ui-kit/`
(Use a NEW folder name `ui-kit/`, NOT the existing `ui/` folder — see Step 4 / Removal
section. The old `ui/` is the deprecated shadcn library and must not be confused with this.)

> Note: verify the exact class names against `src/styles/overrides.css` before finalizing
> (e.g. `.btn-primary`, `.btn-secondary`, `.btn-tertiary`, `.btn-icon`, `.card-standard`,
> `.card-header-wrapper`, `.card-title-standard`, `.card-body-standard`). The snippets below
> use the class names already observed in the codebase.

### 3a. Buttons — `src/app/components/ui-kit/Button.tsx`

```tsx
import React from 'react';

type Variant = 'primary' | 'secondary' | 'tertiary';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** Font Awesome icon class, e.g. "fa-regular fa-plus" */
  icon?: string;
}

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  tertiary: 'btn-tertiary',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  icon,
  children,
  className,
  ...rest
}) => (
  <button className={`${VARIANT_CLASS[variant]}${className ? ` ${className}` : ''}`} {...rest}>
    {icon && <i className={icon}></i>}
    {children}
  </button>
);

export const PrimaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (p) => (
  <Button variant="primary" {...p} />
);
export const SecondaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (p) => (
  <Button variant="secondary" {...p} />
);
export const TertiaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (p) => (
  <Button variant="tertiary" {...p} />
);
```

### 3b. Card — `src/app/components/ui-kit/Card.tsx`

```tsx
import React from 'react';

interface CardProps {
  title?: React.ReactNode;
  /** Right-aligned header actions (e.g. a CardMenu). */
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, actions, children, className }) => (
  <div className={`card-standard${className ? ` ${className}` : ''}`}>
    {(title || actions) && (
      <div className="card-header-wrapper">
        {title && <h2 className="card-title-standard">{title}</h2>}
        {actions && <div className="card-header-actions">{actions}</div>}
      </div>
    )}
    <div className="card-body-standard">{children}</div>
  </div>
);
```

### 3c. Page layout — `src/app/components/ui-kit/PageLayout.tsx`

Wrap the existing `Layout` + Bootstrap scaffolding so every new page starts compliant.

```tsx
import React from 'react';
import { Layout } from '../Layout';
import { BreadcrumbItem } from '../Breadcrumbs';

interface PageLayoutProps {
  title: string;
  breadcrumbItems: BreadcrumbItem[];
  children: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ title, breadcrumbItems, children }) => (
  <Layout breadcrumbItems={breadcrumbItems} title={title}>
    <main className="main-content-wrapper">
      <div className="container-fluid">
        <div className="row g-3">{children}</div>
      </div>
    </main>
  </Layout>
);
```

### 3d. Icon — `src/app/components/ui-kit/Icon.tsx`

A single choke point for icons makes it trivial to audit and to lint against Lucide.

```tsx
import React from 'react';

interface IconProps {
  /** Font Awesome class, e.g. "fa-regular fa-user". */
  name: string;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, className }) => (
  <i className={`${name}${className ? ` ${className}` : ''}`} aria-hidden="true"></i>
);
```

### 3e. Barrel export — `src/app/components/ui-kit/index.ts`

```ts
export * from './Button';
export * from './Card';
export * from './PageLayout';
export * from './Icon';
```

**Adoption:** New pages should import from `ui-kit` (e.g.
`import { PageLayout, PrimaryButton, Card } from '../components/ui-kit';`). Author ONE fresh,
fully-compliant page from scratch using the wrappers as the first proof-of-concept — e.g. a new
page under `src/app/pages/` with its route in `routes.tsx` and its nav entry in
`NavigationSidebar.tsx`. (The earlier `/personligt` scratch page came from a throwaway Figma Make
prompt and has been **deleted**, so there is nothing to "refactor" — build the reference page new.)

**Verification for Step 3:**
- `ui-kit/` folder exists with the five files.
- The new reference page renders using ONLY `ui-kit`/DevExtreme/Bootstrap markup — no inline
  styles, no Tailwind utility classes, and no `ui/`, Lucide, or Recharts imports.

> **Finding (2026-07-08 execution — Step 3 DONE):** All wrapper class names were verified to exist
> in `overrides.css` FIRST (`.btn-primary/-secondary/-tertiary`, `.card-standard`,
> `.card-header-wrapper`, `.card-header-actions`, `.card-title-standard`, `.card-body-standard`,
> `.main-content-wrapper`, `.label-standard`). **Verification gotcha:** the repo has NO
> `tsconfig`/typecheck and Vite only bundles *imported* modules — so unused wrappers are never even
> compiled. Keep at least one consuming page so `pnpm build` actually validates them; here that is
> `src/app/pages/UiKitReference.tsx` at `/ui-kit`. Note `.card-title-standard` hard-codes
> `'Source Sans Pro'` — that is the font inconsistency tracked as decision B1, not fixed here.

---

## Step 4 — Add hard lint enforcement for forbidden imports

**Goal:** Make the two most damaging violations — importing `lucide-react`/`recharts`, and
importing the deprecated shadcn `ui/` folder — **fail the build/lint** instead of shipping
silently.

**Why this matters:** A guideline can be missed; a failed lint cannot. This is the top rung
of the enforcement ladder.

**There is currently no ESLint config in the repo.** Add one.

**Files to create/change:**

1. Install dev dependencies (let the resolver pick versions):
   ```bash
   pnpm add -D eslint @eslint/js typescript-eslint eslint-plugin-react
   ```

2. Create **`/eslint.config.js`** (flat config, matches ESLint 9 + Vite).
   **Note the two blocks:** the restrictive block targets **Mode B territory only**, and a
   second block explicitly **exempts Mode A (Page Builder Studio)** so it stays unrestricted.

   ```js
   import js from '@eslint/js';
   import tseslint from 'typescript-eslint';

   // Mode A — Page Builder Studio tool. Unrestricted (Tailwind, any libs, any icons).
   // Update this glob if/when the tool is consolidated into src/page-builder-studio/**.
   const PAGE_BUILDER_STUDIO = [
     'src/page-builder-studio/**/*.{ts,tsx}',
     'src/app/components/PageBuilder*.{ts,tsx}',
     'src/app/components/pageBuilder*.{ts,tsx}',
   ];

   export default tseslint.config(
     js.configs.recommended,
     ...tseslint.configs.recommended,

     // ---- MODE B: mandatory design-system rules (everything EXCEPT Page Builder Studio) ----
     {
       files: ['src/**/*.{ts,tsx}'],
       ignores: PAGE_BUILDER_STUDIO,
       rules: {
         'no-restricted-imports': [
           'error',
           {
             paths: [
               { name: 'lucide-react',
                 message: 'Mode B: icons must use Font Awesome (<i className="fa-regular fa-...">). See CLAUDE.md rule 3.' },
               { name: 'recharts',
                 message: 'Mode B: charts must use DevExtreme (devextreme-react/chart). See CLAUDE.md rule 4.' },
               { name: '@mui/material',
                 message: 'Mode B: no MUI. Use DevExtreme + Bootstrap. See CLAUDE.md rule 6.' },
               { name: 'antd',
                 message: 'Mode B: no Ant Design. Use DevExtreme + Bootstrap. See CLAUDE.md rule 6.' },
             ],
             patterns: [
               { group: ['lucide-react/*'], message: 'Mode B: icons must use Font Awesome. See CLAUDE.md rule 3.' },
               { group: ['@radix-ui/*'], message: 'Mode B: no Radix. Use DevExtreme/Bootstrap or ui-kit wrappers. See CLAUDE.md rule 6.' },
               { group: ['**/components/ui/*', '@/app/components/ui/*'],
                 message: 'Mode B: the shadcn ui/ folder is deprecated. Use src/app/components/ui-kit/*. See Improvement.md.' },
             ],
           },
         ],
       },
     },

     // ---- MODE A: Page Builder Studio — explicitly unrestricted ----
     {
       files: PAGE_BUILDER_STUDIO,
       rules: {
         // Intentionally empty: the tool may use Tailwind, Lucide, any libraries.
         'no-restricted-imports': 'off',
       },
     },
   );
   ```

3. Add a lint script to **`package.json`**:
   ```json
   "scripts": {
     "build": "vite build",
     "lint": "eslint ."
   }
   ```

> **Note on `style={{}}` and Tailwind classes:** `no-restricted-imports` cannot catch these.
> If you later want to block them too, add `eslint-plugin-react` with `react/forbid-dom-props`
> to flag `style`, and a `no-restricted-syntax` rule (or a Tailwind-class regex check) for
> utility-class strings in `className`. Start with imports (highest value, lowest noise),
> then tighten.

**Verification for Step 4:**
- `pnpm lint` runs clean on compliant code.
- Temporarily add `import { X } from 'lucide-react';` and confirm `pnpm lint` errors with the
  custom message; then remove it.

> **Finding (2026-07-08 execution — Step 4 DONE):** Several adaptations were required vs. the
> literal config above:
> 1. **Do NOT enable `js.configs.recommended` / `tseslint.configs.recommended` yet.** On this
>    existing codebase they flood `pnpm lint` with hundreds of unrelated errors (unused vars,
>    `no-explicit-any`, …) so it can never pass. Ship a FOCUSED config with only
>    `no-restricted-imports` (the plan's own "highest value, lowest noise" advice).
> 2. **Because we dropped the recommended presets, add a BASE block** that sets
>    `languageOptions.parser = tseslint.parser` for ALL `src/**/*.{ts,tsx}`. Otherwise Mode A
>    files (matched only by the exempt block, which has no parser) fall back to espree and fail
>    with `Parsing error: Unexpected token interface/:`. The recommended presets used to provide
>    the parser globally; without them you must set it yourself.
> 3. **Globally `ignore` `src/app/components/ui/**`.** The deprecated shadcn kit still exists
>    (removed later in §5b) and imports lucide/radix internally — without the ignore, lint errors
>    on its own files on day one. Nothing imports it, so ignoring is safe.
> 4. **Mode A glob is now just `src/page-builder-studio/**/*.{ts,tsx}`** (the legacy
>    `src/app/components/{PageBuilder*,pageBuilder*}` globs are obsolete after Step 0b).
> 5. Installed only `eslint` + `typescript-eslint` (resolved to eslint 10 / tseslint 8 — works);
>    `eslint-plugin-react` deferred until style rules are actually added. Script: `"lint": "eslint ."`.
> Verified: `pnpm lint` clean; a lucide import in a Mode B file errors with the custom message; the
> same import in a `src/page-builder-studio/` file is allowed.

---

## Should removal come FIRST? (sequencing rationale)

You asked whether it's better to trim totally non-relevant functionality *first* to reduce
content, or whether that's a bad idea. **Answer: partly yes — front-load the *safe* removals,
but not all of them, and never at the expense of the cheapest enforcement win.**

The deciding factor is **risk**, not size. Split removals into two risk tiers:

- **Tier 0 — zero-risk artifacts (do this FIRST, before anything else).**
  Deleting documentation files, stale backups, and one-off scripts *cannot break the running
  app* — they aren't imported by any code. This is the stray root `.md` docs (§5f-docs, and
  the 11 TTS/Azure docs in §5e), `overrides.css.backup`, and the `.sed` script (§5c). Doing
  these first is pure upside: it immediately shrinks the context the AI must read and removes
  mis-signalling docs, with no chance of regression.

- **Tier 1 — feature code removals (do these EARLY, but with an import check + app run).**
  Deleting components/services/CSS (chatbot, TTS service, manuals, sticky notes, shadcn `ui/`)
  *can* break things if something imports them, so each needs a quick dependency search and a
  smoke test. Best done right after `CLAUDE.md` exists (so the two-mode model is in place),
  but still early — a smaller, cleaner codebase makes Steps 3–4 easier and gives the AI fewer
  wrong examples to imitate.

**Why *not* literally everything first:** `CLAUDE.md` (Step 1) is the single highest-value,
lowest-risk action in this whole plan — it takes minutes and immediately improves every
subsequent step (including guiding *which* features are safe to remove). So the ideal order is:
**Tier 0 cleanup → Step 1 (CLAUDE.md) → Tier 1 feature removal → wrappers → lint.** In other
words: do the free, safe deletions first; do the enforcement backbone second; then remove the
riskier feature code with guardrails in place. The checklist below is ordered accordingly.

---

## Step 5 (Removal) — Things to delete or quarantine that create tension

These items actively pull the AI (and developers) toward non-compliant output, create
uncertainty, or are simply not relevant to the app's purpose. Removing them shrinks the
"attack surface" for design-system drift.

> **Safety:** Do a dependency check before deleting anything (`grep`/search for imports).
> Remove in a branch, run the app, and confirm nothing breaks. Order below is roughly
> "highest tension / safest to remove" first.
>
> **Baseline first (there is no test/lint suite yet):** before ANY removal, capture a known-good
> baseline by running `pnpm build` (and `pnpm dev`) on a clean tree. `pnpm build` passing is the
> ONLY automated "nothing broke" signal available until Step 4's lint exists — re-run it after
> each removal. Land the Step 4 lint as early as feasible to strengthen this net.
>
> **Finding (2026-07-08 execution):** The repo ships **no `.gitignore`** and `node_modules/` is not
> ignored — add a `.gitignore` (`node_modules/`, `dist/`) BEFORE running install/commit, or the first
> `git add -A` stages the whole dependency tree. Commit `pnpm-lock.yaml`.

> **⚠️ Mode A caveat (critical):** Everything in this removal section applies to **Mode B**.
> Before removing ANY library, first confirm it is **not used by Page Builder Studio (Mode A)**,
> which is legitimately allowed to use Tailwind, Lucide, and any libraries. A dependency is
> only safe to delete if it has **zero importers in both modes**. Concretely, search the
> Page Builder territory (`src/page-builder-studio/**` or today
> `src/app/components/{PageBuilder*,pageBuilder*}`) before deleting. If a lib is used *only*
> by Mode A, **keep it** — it is not "forbidden," it is just Mode-A-only.
>
> *As of this writing:* `lucide-react` is imported **only** inside the shadcn `ui/` folder
> (18 files), `recharts` is imported **nowhere**, and nothing imports `ui/`. The Page Builder
> files use custom CSS classes + Font Awesome. So the removals below are currently safe — but
> re-verify at execution time, as Page Builder Studio may adopt these libs later.

### 5a. Forbidden libraries still installed — REMOVE from `package.json`
These directly contradict the rules and their mere presence invites the AI to use them:
- **`lucide-react` (0.487.0)** — forbidden icon lib. Remove after confirming no imports remain.
- **`recharts` (2.15.2)** — forbidden chart lib. Remove after migrating any usage to DevExtreme.
- **`@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`** — MUI stack,
  not part of the sanctioned stack. Remove unless something load-bearing depends on them.
- **`tailwind-merge`, `tw-animate-css`** — Tailwind utility helpers. Forbidden for Mode B,
  but **may be used by Page Builder Studio (Mode A)** and/or the shadcn `ui/` folder. Only
  remove after confirming zero importers in Mode A. If Mode A wants them, keep them.

> Keep `tailwindcss` + `@tailwindcss/vite` — they are required for the token layer in
> `theme.css`, for the Make build, AND for Page Builder Studio (Mode A), which is
> Tailwind-based. The goal is to stop *authoring Mode B pages* with Tailwind, not to remove
> the token infrastructure or cripple the Page Builder tool.

### 5b. The shadcn/Radix `ui/` component library — QUARANTINE then REMOVE
- **`src/app/components/ui/`** (button, card, dialog, chart, table, ... ~45 files) is a full
  shadcn/Radix kit. It is the single biggest source of tension: it's the exact library the
  guidelines forbid, yet it sits in the components folder inviting reuse.
- Action: (1) confirm via search which of these are actually imported anywhere; (2) migrate
  those usages to DevExtreme/Bootstrap or the new `ui-kit/` wrappers; (3) delete the folder.
- Until fully migrated, the Step 4 lint pattern blocks new imports from it.
- The `@radix-ui/*` packages in `package.json` can be removed once `ui/` is gone.

> **Finding (2026-07-08 execution — §5b/§5a DONE):** The `ui/` folder had **zero external importers**
> (verified across all of `src/`, including `src/page-builder-studio/`) — it only imported itself, so
> no migration was needed; it was deleted outright (48 files). Crucially it dragged in a MUCH larger
> dead-dependency cluster than just radix/lucide: removing it let us uninstall **~50 packages** — all
> 26 `@radix-ui/*`, plus `lucide-react`, `recharts`, `@mui/*`, `@emotion/*`, `cmdk`, `vaul`, `sonner`,
> `input-otp`, `embla-carousel-react`, `react-day-picker`, `react-resizable-panels`, `next-themes`,
> `react-hook-form`, `motion`, `clsx`, `class-variance-authority`, `tailwind-merge`, `date-fns`,
> `react-slick`, `react-responsive-masonry`, `@popperjs/core`, `react-popper` — each confirmed to have
> 0 importers outside `ui/`. Deps dropped from ~68 to **13**. **Keep** `tw-animate-css` (it is
> `@import`-ed by `src/styles/tailwind.css`, NOT dead), `tailwindcss`/`@tailwindcss/vite` (tokens +
> Mode A), and `react-dnd` (used by the Page Builder + Components page). After removal, drop the
> `ui/**` `ignore` from `eslint.config.js` but KEEP the `no-restricted-imports` rules as guards.
> `pnpm build` + `pnpm lint` both green.

### 5c. Stale / backup / one-off files — DELETE (not relevant, cause confusion)
- **`src/styles/overrides.css.backup`** (~130 KB) — a stale backup living next to the real
  198 KB `overrides.css`. Two similar files invite edits to the wrong one. Version control is
  the place for history; delete the backup.
- **`src/styles/button-color-replacements.sed`** — a one-off migration script left in the
  styles folder. Not runtime-relevant; remove or move out of `src/`.

### 5d. Prototype pages — CONSOLIDATE to the essentials
- The routes list scratch pages (`Travel*`, `Test*`) AND several feature pages not needed for the
  tool's core purpose. They add noise and give the AI conflicting "how a page is built" examples.
- Action (done directly 2026-07-08): reduce `src/app/pages/` + `src/app/routes.tsx` to only the
  pages that must survive — here **`Dashboard`** (home) and **`Components`** (the host page for the
  Page Builder Studio tool). Everything else removed end-to-end: `Travel`, `Travelapplication`,
  `Travelapp2`, `Traveltest`, `Testpage`, `Testsida1`, `Test`, `InterfaceCustomization`,
  `Loneportalen`, `Chefsoversikten`, `Personligt`. Fewer, correct examples > many, mixed examples.
  > **Finding (2026-07-08 execution):** `MegaMenu.tsx` hardcodes menu items AND `navigate('/…')`
  > handlers for removed routes. **Product decision:** the left menu / MegaMenu is rewritten in a
  > SEPARATE, later step that is NOT part of this refactoring — so do NOT chase the resulting dead
  > links / 404s here. Just remove the pages + routes; leave all nav wiring for the menu rewrite.
- The Step 3 compliant reference page is authored separately (it is NOT one of the pages above).

### 5e. Off-purpose FEATURES — REMOVE (biggest noise reduction)
The app has accumulated substantial functionality that has **nothing to do with the core
purpose** (building production-like prototypes). Every one of these features enlarges the
codebase, adds dependencies, produces stray docs, and gives the AI irrelevant/wrong examples
to imitate. Unless a specific feature is *intentionally* meant to be demonstrated inside
prototypes, remove it end-to-end (component + CSS + service + `App.tsx` import + docs).

Each of these is a self-contained "leaf" feature — verify importers, then delete:

> **Finding (2026-07-08 execution):** In this codebase they are NOT independent leaves — they form
> one tree. The **hub is `HelpFloatingButton`** (rendered in BOTH `Layout.tsx` and `MainContent.tsx`),
> which imports and renders `Manual` (→ `ttsService` + a YouTube embed), `WizardGuide`,
> `ChatbotFrame` and `StickyNotes`. Removing the hub + its children clears manuals, chatbot, sticky
> notes and YouTube in one pass. **Cross-dependency to watch:** `ttsService` is also imported by
> `UserProfilePanel.tsx` (a KEPT component, via an "Azure TTS" debug toggle) — strip that TTS code
> before deleting `textToSpeechService.ts`. And unwire the hub from `MainContent.tsx`, not just
> `Layout.tsx`.

- **Text-to-Speech / Azure Speech (largest offender).**
  - Service: `src/app/services/textToSpeechService.ts` (uses `microsoft-cognitiveservices-speech-sdk`).
  - Dependency: **`microsoft-cognitiveservices-speech-sdk`** in `package.json` — remove.
  - CSS: `src/styles/manual-tts.css` and TTS-related rules elsewhere.
  - Docs (root): `AZURE_SPEECH_SETUP.md`, `TEST_AZURE_TOGGLE.md`, `AZURE_TOGGLE_FIX_SUMMARY.md`,
    `TTS_TOGGLE_TROUBLESHOOTING.md`, `TTS_DEBUG_TOGGLE.md`, `TTS_TESTING_GUIDE.md`,
    `TTS_UI_TOGGLE_GUIDE.md`, `TTS_HIGHLIGHTING_FIX.md`, `TTS_VOICE_PRIORITY.md`,
    `TTS_WORD_HIGHLIGHTING.md`, `SNABBGUIDE_TTS.md` — **11 TTS/Azure docs**, all removable.
- **Chatbot.** `src/app/components/ChatbotFrame.tsx` + `src/styles/chatbot-widget.css`
  (+ the `App.tsx` import of `chatbot-widget.css`).
- **YouTube video feature.** Doc: `YOUTUBE_VIDEO_FEATURE.md` (+ any component/embed it refers to).
- **Manuals / help system.** `Manual.tsx`, `WizardGuide.tsx`, `HelpFloatingButton.tsx`,
  `src/styles/help-components.css` (50 KB), `manual-restore-popup.css`, `manual-visibility.css`.
  (Note `HelpFloatingButton` is wired into `Layout.tsx` — unwire it there when removing.)
- **Accessibility / high-contrast tooling.** `AccessibilityPanel.tsx`,
  `accessibility-features.css` (23 KB), `high-contrast.css` (18 KB), `manual-tts.css`.
  ⚠️ Judgment call: if accessibility is a deliberate part of what prototypes must showcase,
  keep it; if it was experimental, remove it.
- **Sticky notes.** `StickyNotes.tsx` + `sticky-notes.css`.

> **CSS is wired in THREE places — not just `App.tsx` (verified).** Removing a feature means
> pulling the right import from the right file:
> - **`src/app/App.tsx`** — direct `import "..."`: bootstrap, `fonts`, `globals`,
>   `css-variables`, `overrides`, `user-profile-panel`, **`chatbot-widget`**,
>   `interface-customization`, devextreme.
> - **`src/main.tsx` → `src/styles/index.css`** — `@import`: `fonts`, `tailwind`, `theme`,
>   **`sticky-notes`**, **`manual-tts`**.
> - **`src/styles/globals.css`** — `@import` (this is where MOST feature CSS actually lives):
>   font-awesome (CDN), **`help-components`**, **`high-contrast`**, **`accessibility-features`**,
>   **`manual-restore-popup`**, **`manual-visibility`**, **`manual-tts`**, `icon-color-overrides`.
>
> Per-feature removal map (delete the file AND its import at the listed location):
>
> | Feature | CSS file(s) | Remove the import from |
> |---|---|---|
> | TTS / Azure | `manual-tts.css` | BOTH `globals.css` **and** `index.css` |
> | Chatbot | `chatbot-widget.css` | `App.tsx` |
> | Manuals / help | `help-components.css`, `manual-restore-popup.css`, `manual-visibility.css` | `globals.css` |
> | Accessibility / high-contrast | `accessibility-features.css`, `high-contrast.css` | `globals.css` |
> | Sticky notes | `sticky-notes.css` | `index.css` |
>
> After removing a feature, also unwire any usage in `Layout.tsx` (e.g. `HelpFloatingButton`),
> then run `pnpm build` (and `pnpm dev`) to confirm nothing breaks.

### 5f-docs. Stray root documentation — DELETE
Beyond the TTS/Azure docs above, the repo root is littered with **database and app docs that
are not design-system rules** and only add confusion about "what this project is":
- `DATABASE_SETUP_GUIDE.md`, `database-design-snabbguide.md` — database design docs. The app
  is a prototype builder; unless a Supabase/DB integration is actually in use, remove these.
- `APPLIKATION_DOKUMENTATION.md` — general app documentation; review, likely stale/removable.
- `ATTRIBUTIONS.md` — keep only if legally required (image/font/library attributions);
  otherwise remove.

> **Why this matters for the AI specifically:** every stray `.md` at the root is a candidate
> the AI may read and treat as authoritative context. A pile of TTS/Azure/database docs
> actively mis-signals the project's purpose and competes with `CLAUDE.md`/`Guidelines.md`.
> Reducing root docs to just the rule files sharpens the AI's understanding of the app.

### 5g. Guidelines template boilerplate — CLEAN UP
- Both `Guidelines.md` files still contain the commented-out **template scaffolding**
  ("Add your own guidelines here", the `<!-- System Guidelines ... -->` example block).
  This filler adds length without rules and can confuse a reader about what is actually in
  force. Delete the template comments so only real, active rules remain.

---

## Suggested execution order (summary checklist)

**Baseline (before any change):**
- [ ] Run `pnpm build` on a clean tree and confirm it passes — the only automated regression
      signal until Step 4's lint exists. Re-run it after each removal step.

**Tier 0 — free, zero-risk cleanup (do first):**
- [ ] **Step 5f-docs** — Delete stray root docs: 11 TTS/Azure docs, `DATABASE_SETUP_GUIDE.md`,
      `database-design-snabbguide.md`, `YOUTUBE_VIDEO_FEATURE.md`, `APPLIKATION_DOKUMENTATION.md`
      (keep `ATTRIBUTIONS.md` only if legally required).
- [ ] **Step 5c** — Delete `overrides.css.backup` and the `.sed` script.
- [ ] **Step 5g** — Strip template boilerplate from both `Guidelines.md` files.

**Enforcement backbone (do second):**
- [ ] **Step 0 (concept)** — Adopt the two-work-mode model (§0.1). Make the AI classify every
      task as Mode A (Page Builder Studio tool) or Mode B (prototype pages) before coding.
- [ ] **Step 1** — Add root `CLAUDE.md` (fast, zero build risk, immediate benefit).
- [ ] **Step 2** — Cross-reference the two `Guidelines.md` files; align the 10 rules.

**Tier 1 — feature/code removal with import check + smoke test (do third):**
- [ ] **Step 5e** — Remove off-purpose features end-to-end: TTS/Azure speech (+ the
      `microsoft-cognitiveservices-speech-sdk` dep), chatbot, manuals/help, sticky notes,
      YouTube; decide on accessibility tooling.
- [ ] **Step 5d** — Consolidate duplicate Travel/Test pages down to one reference page.
- [ ] **Step 0b (structure)** — Consolidate the Page Builder tool into `src/page-builder-studio/`
      so the mode boundary is a pure path lookup (enables clean lint scoping in Step 4).

**Guardrails + wrappers (do fourth):**
- [ ] **Step 3** — Build `ui-kit/` wrappers; refactor `/personligt` as the reference page.
- [ ] **Step 4** — Add path-scoped ESLint config + `no-restricted-imports` + `lint` script.
- [ ] **Step 5b** — Migrate and delete the shadcn `ui/` folder + `@radix-ui/*` deps.
- [ ] **Step 5a** — Remove remaining forbidden deps once imports are gone (lucide, recharts,
      MUI, tw helpers) — after confirming zero Mode A usage.

## Definition of done
- A fresh AI session **correctly classifies the task as Mode A or Mode B first** (§0.1), and:
  - **Mode B** — given any of the three input types (Page Builder export, Figma frame, plain
    prompt), it produces a page that uses `ui-kit`/DevExtreme/Bootstrap only, has no Tailwind
    utility classes in JSX, no inline styles, no Lucide/Recharts/shadcn imports, and
    **passes `pnpm lint`** — without the user having to restate the rules.
  - **Mode A** — when improving Page Builder Studio itself, it is free to use Tailwind and the
    most effective libraries, and lint does **not** flag those choices.
- The mode boundary is physical (a directory) and enforced by path-scoped lint, so the two
  rulebooks can never bleed into each other.
```
