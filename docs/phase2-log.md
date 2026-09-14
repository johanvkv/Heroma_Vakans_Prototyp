# Refaktoreringslogg — Fas 2

> Kortfattad läs-ikapp för utvecklare, separat från fas 1 ([`refactor-log.md`](./refactor-log.md)).
> Planen och analysen finns i [`/Improvements-phase2.md`](../Improvements-phase2.md). Denna logg
> listar bara vad som **faktiskt gjorts** i fas 2, i ordning, med filer och skäl.
>
> **Konventioner (samma som fas 1):** (1) Motstridigheter/val som kräver produktbeslut samlas i
> "Framtida förbättringar & beslut" sist. (2) När ett steg avslöjar nya fynd uppdateras
> `/Improvements-phase2.md` varsamt (rätta det som är direkt fel; komplettera nyanser med
> "Finding"-noteringar). (3) `pnpm build` + `pnpm lint` ska vara gröna efter varje steg.

**Referensprojekt:** ett valfritt implementationsstöd är noterat i `Improvements-phase2.md` (§0,
segmentet "Reference project") och tas bort innan projektet delas. Varje item går att genomföra
**utan** det.

---

## Executive summary (för icke-utvecklare)

Fas 1 gjorde design­system­reglerna tydliga och rensade bort brus. **Fas 2** byggde en liten
**gemensam datagrund** och gjorde verktyget och vägledningen tydligare — så att prototyperna blir mer
konsekventa och AI-verktyg (t.ex. Figma Make) jobbar effektivare. Precis som i fas 1 påverkar
ändringarna **inte** hur appen fungerar i grunden.

| # | Vad vi gjorde (i klarspråk) | Värde / förenkling |
|---|---|---|
| 1 | **Datadriven meny** — menyn låg hårdkodad på tre ställen som kunde hamna i osynk; nu i en enda datafil som både menyn och Page Builder läser. | Ändra på ETT ställe. När en ny sida skapas påminner verktyget om att lägga till den i menyn + skapa en route. |
| 2 | **Gemensamt personregister** — varje sida hittade förr på egen låtsasdata; nu finns 20 realistiska personer som sidor läser från, plus en läsvy under användarinställningar. | Konsekvent grunddata "gratis"; tydlig regel att utöka datamodellen i stället för att bädda in data i varje sida. |
| 3 | **Rollväljare** — knappen "Anställd" i toppen öppnade inställningar; nu öppnar den en riktig rollväljare (Admin/Anställd/Chef, Admin förvald). | Förberett för att kunna visa gränssnittet ur olika rollers perspektiv. |
| 4 | **Städad export-kod i Page Builder** — fyra funktioner (spara/ladda/exportera/importera) hade kopierad kod som glidit isär; nu delar de en implementation. | Mindre kod, och faktiska buggar fixade (steg och vissa inställningar försvann tidigare vid ladda/importera). |
| 5 | **Guidelines blev användbar** — den 2842-radiga designmanualen fick ett index ("läs det här för din uppgift") + en sektion för hur man bygger något eget som ändå följer designsystemet. | AI hittar rätt regler snabbt — oavsett om indata är en prompt, en skärmdump eller Page Builder-output. |

**Sammantaget:** en liten delad datagrund + tydligare verktyg och vägledning gör prototypbyggandet mer
konsekvent och AI-assistansen mer träffsäker — utan att ändra appens funktion. Ett par produktbeslut
(t.ex. typsnitt Lato vs Source Sans Pro, **B1**) är medvetet kvar att besluta, väl dokumenterade i
`docs/refactor-log.md`.

---

## Status

Analysen är gjord och alla fem påståenden bekräftades korrekta (se `Improvements-phase2.md` §0 för
verdikt-tabellen). **Steg 1–5 genomförda — fas 2 klar** (se sektionerna nedan).

---

## Steg 1 — Datadriven meny (huvudmeny + placering)

Branch `feature/phase2-item1-menu-data`. `pnpm build` + `pnpm lint` gröna.

### Nytt datalager `src/data/`
- **`menu.json`** — enda källan. Struktur/nivåer speglar Heroma-modellen: Primary →
  `_overviewCards[]` (reserverad nivå, **finns men oanvänd här** — läggs till i senare fas) →
  Secondary-sektioner → `options[]`. `_path` = leaf som navigerar direkt. Datan speglar nuvarande
  MegaMenu exakt. **Hem** först (leaf → `/`, som en knapp), **Page Builder Studio** sist (leaf →
  `/components`, med divider före); `_new`-badge på Tid & Bemanning bevarad.
- **`menu.ts`** — typer (`MenuStructure`, `OverviewCard`, …) + loader + härledningshjälpare
  `getMegaMenuItems` / `getMegaMenuContent` / `getPageLocations`, samt `getMenuNameById(id)`
  (id → visningsnamn) som Page Builder-outputen använder.

### Omkopplade konsumenter (identiskt renderat utfall)
- `MegaMenu.tsx` — inline `menuItems`/`menuContent` ersatta med helpers; navigationen är nu
  datadriven (`item.path`) i stället för hårdkodade id-specialfall.
- `PageBuilder.tsx` — `pageLocations` (placerings-dropdownen) härleds nu från samma meny (samma ids).
- **Page Builder-output (två egna kodvägar utöver dropdownen — lätt att missa):**
  - `pageBuilderExport.ts` (`buildExportCode`, "Export Code") — genererad kod inleds med en obligatorisk
    TODO som visar **valt menyval** (via `getMenuNameById`) och betonar att menyn är datadriven
    (lägg till i `menu.json` + registrera route).
  - `PageBuilder.tsx` (`handleCreatePage`, "Create Page") — hade en egen **hårdkodad `locationMap`** +
    stale instruktion ("lägg i MegaMenu.tsx / handleSearchItemClick"). Ersatt med `getMenuNameById`
    (visar rätt location, t.ex. "Personal-test") + datadrivna instruktioner + en design-system-
    påminnelse (CLAUDE.md/Guidelines, ui-kit).
- `CLAUDE.md` → "Before writing UI code" — stale "lägg nav i `NavigationSidebar.tsx`" rättad till
  "lägg menypost i `src/data/menu.json`" (stöd för plain-prompt-flödet, sida utan Page Builder).

### Fynd / avvikelser (jämfört med planens Steg 1)
- **`NavigationSidebar.DEFAULT_NAV_DATA` lämnades UTANFÖR.** Det är en *separat, editerbar demo-nav*
  (Dashboard/Components/Patterns) för en Page Builder-komponent — INTE huvudmenyn. Att koppla den
  till `menu.json` vore fel. (Planens Steg 1 nämnde den; detta korrigerar det.)
- Den oåtkomliga `oversikter`-portalvyn (ingen menuItem-id matchade) utelämnades — dead code, ingen
  beteendeförändring.
- `_overviewCards` finns i strukturen (tomma arrayer + typ) men renderas inte — redo för senare fas.

> **Rekommendation:** gör en snabb visuell smoke-test av megamenyn (öppna "Meny", klicka runt) — den
> är den mest synliga ytan; build/lint fångar inte rena renderingsavvikelser.

---

## Steg 2 — Delat personregister + läsvy

Branch `feature/phase2-step2-person-data`. `pnpm build` + `pnpm lint` gröna.

### Datalager `src/data/` (utökat)
- **`seed.json`** — hela persondatasettet (20 personer med adresser, anhöriga, barn, skatteuppgifter,
  anställningar, saldon + `payrollRuns` + `meta`). Kopierat i sin helhet (beslut D4).
- **`types.ts`** + **`index.ts`** — typer resp. accessors (`persons`, `getPerson`, `fullName`,
  `getActiveEmployment`, `getVacationBalance`, `getPayrollResultsForPerson` …). Filhuvudena anpassade
  bort från referensprojektets interna referenser.

### Läsvy (D2: egen sida)
- **`src/app/pages/Personer.tsx`** på route **`/installningar/personer`** — read-only DevExtreme
  `DataGrid` (sök + header-filter, ingen editering). **Begränsad kolumnuppsättning** (D4): Namn,
  Personnummer, Befattning, Avdelning, Kostnadsställe, Anställningsform, Grad — hela datamodellen
  finns i `seed.json`.
- Länkad från **`UserProfilePanel`** (ny "Personer"-post som navigerar dit).

### Regel + POC
- **`CLAUDE.md`**: ny sektion "Shared data (person register)" — personsidor läser från `src/data/`,
  bädda aldrig in mock; utöka `seed.json` + `types.ts` vid behov.
- **POC-migrering:** `UiKitReference.tsx` läser nu sina grid-rader från `src/data` (via
  `getActiveEmployment`) i stället för en inbäddad const — bevisar mönstret end-to-end.

> **Rekommendation:** öppna användarpanelen → "Personer" och verifiera läsvyn; öppna även `/ui-kit`
> (referenssidan läser nu från seed-datan).

---

## Steg 3 — Rollväljare i header

Branch `feature/phase2-step2-person-data` (fortsatt utan merge). `pnpm build` + `pnpm lint` gröna.

- **`src/data/roles.ts`** — `ROLES` (Admin/Anställd/Chef), `DEFAULT_ROLE_ID = 'admin'`.
- **`RoleContext.tsx`** — app-wide vald roll (`useRole`); roller sorterade `localeCompare('sv')`
  → **Admin, Anställd, Chef**, Admin förvald. Wrappar routern i `App.tsx`.
- **`RoleSelector.tsx`** — headerns "Anställd"-knapp ersatt av en rollväljare: trigger (`nav-btn`)
  visar aktuell roll + chevron; dropdown (`employee-actions-flyout`/`-item`, click-outside) listar
  rollerna i bokstavsordning med bock på vald. Mode B: native markup + våra CSS-klasser + FA —
  ingen shadcn, ingen inline-stil, ingen ny CSS.
- **Användarinställningar** öppnas fortfarande via den separata user-ikon-knappen.
- Rollval är **kosmetiskt** tills vidare (D5) — ingen innehållsfiltrering ännu.

> **Rekommendation:** klicka rollväljaren i headern → Admin/Anställd/Chef i bokstavsordning, Admin
> förvald; verifiera att user-ikonen fortfarande öppnar profilpanelen.

---

## Steg 4 — Deduplicera Page Builders save/export-kod

Branch `feature/phase2-step4-export-dedup`. `pnpm build` + `pnpm lint` gröna. Mode A (Page Builder).

- **Ny modul `pageBuilderSerialize.tsx`** — en `serializeComponent(s)` + en `deserializeComponent(s)`
  som enda källa. `saveDraft`, `loadDraft`, `exportDesign`, `importDesign` anropar dem nu.
- **Fixade drift-buggar** som de fyra kopiorna hade glidit isär till:
  - `loadDraft`-deserialiseringen tappade **`stepperSteps`**.
  - `importDesign`-deserialiseringen tappade **`buttonIcon`/`buttonIconPosition`/
    `segmentedButtonIcons`/`inputType`/`inputWidth`** samt tab-`icon`.
  - `saveDraft` sparade bara `tabsActiveStates`, `exportDesign` bara `stepperActiveStates` — nu
    sparas och återställs **båda** överallt.
- **`exportDesign` återanvänder `downloadFile()`** i stället för egen blob/länk-kod.
- **Kvar (out of scope):** `handleCreatePage` har en TREDJE serialisering med annan struktur
  (egna `serializeStepperSteps`/`…AccordionSections`-hjälpare) — orörd; kandidat för framtida enande.

> **Rekommendation:** kör en round-trip i Page Builder — Save draft → Load draft, och Export →
> Import — och verifiera att stepper-steg, tabs (med ikon) och knapp-/input-inställningar bevaras.

---

## Steg 5 — Gör Guidelines.md AI-användbar

Branch `feature/phase2-step5-guidelines` (fortsatt utan merge, ovanpå Steg 4). Docs-ändring — `pnpm lint` grön.

- **Uppgiftsindex överst i `Guidelines.md`** — en "läs sektionen för din uppgift"-tabell (färger,
  typsnitt, dark mode, knappar, kort, tabs, accordion, tooltip, alert, carousel, input, dropdown,
  datatabell, biblioteksval, persondata) som pekar in i den 2842-radiga filen. Slut på
  topp-till-botten-läsning.
- **Ny sektion "BUILDING CUSTOM UI"** — hur man handbygger element UTAN färdig komponent men ändå
  följer designsystemet: tokens (`var(--primary)`, `var(--font-family-base)` = Lato), våra CSS-klasser,
  Bootstrap bara för layout, FA-ikoner, `border-radius: 0`. Med ett komplett token-baserat exempel
  (JSX + `overrides.css`) — inga inline-stilar/Tailwind.
- **`CLAUDE.md`** pekar nu på indexet + custom-UI-sektionen.
- Gäller lika för alla tre indata: prompt, screenshot, Page Builder-output.

### B1 (typsnitt) — noterat, ej mass-migrerat
Font-notisen i custom-UI-sektionen styr NY kod till token (Lato). De ~20 per-komponent-specarna som
fortfarande säger `'Source Sans Pro'` migrerades INTE här — det kräver även ändring av den faktiska
CSS:en (`overrides.css`/`globals.css`), vilket är en synlig font-ändring i appen. Kvarstår som
beslut **B1** i `docs/refactor-log.md`.

---

## Kvar att göra (fas 2)
Samma ordning som planen (`Improvements-phase2.md` → "Execution order & the shared data layer"):
- [x] **Steg 1** — Datadriven meny; `src/data/`-lagret etablerat. ✅ (se ovan)
- [x] **Steg 2** — Delat personregister (`src/data/`) + läsvy under användarinställningar. ✅ (se ovan)
- [x] **Steg 3** — Rollväljare i header (Admin/Anställd/Chef, bokstavsordning, Admin förvalt). ✅ (se ovan)
- [x] **Steg 4** — Deduplicera Page Builders save/export-kod (Mode A). ✅ (se ovan)
- [x] **Steg 5** — Gör `Guidelines.md` AI-användbar (index + "läs vid X" + tokens-sektion). ✅ (se ovan)

## Beslut (fattade)
- **D1** — Menydata: minimal nu (`id`/`label`/`icon`/`path`/`children`); `roles` läggs till när Steg 3 (rollväljaren) landar.
- **D2** — Personläsvy: egen sida (`/installningar/personer`-stil), länkad från användarinställningar.
- **D3** — Guidelines: index-först i en fil; dela upp i separata filer senare bara vid behov.
- **D4** — Seed-data: kopiera **hela** datasettet; läsvyn får visa en **begränsad** delmängd.
- **D5** — Rollfiltrering: kosmetiskt först (bara väljaren); koppla filtrering senare.
