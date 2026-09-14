# Refaktoreringslogg

> Kortfattad läs-ikapp för utvecklare. Full plan och motivering finns i
> [`/Improvement.md`](../Improvement.md). Denna logg listar bara vad som **faktiskt gjorts**,
> i ordning, med filer och skäl.
>
> **Konventioner:** (1) Motstridigheter som kräver produktbeslut samlas i sektionen
> **"Framtida förbättringar & beslut"** sist i denna fil — de löses inte ad hoc under
> refaktoreringen. (2) När ett steg avslöjar nya fynd uppdateras `/Improvement.md` varsamt
> (rätta det som är direkt fel; komplettera nyanser med "Finding"-noteringar) så att en framtida
> omkörning av refaktoreringen blir så effektiv som möjligt.

---

## Executive summary (för icke-utvecklare)

Projektet är två saker i ett: en **mall** för att snabbt bygga verklighetstrogna prototyper, och ett
**verktyg** ("Page Builder Studio") för att bygga dem. Syftet med refaktoreringen var att göra allt
**enklare, renare och mer pålitligt** — särskilt när AI-verktyg (t.ex. Figma Make) hjälper till att
skriva koden. Kort sagt: göra "rätt sätt" till det enkla sättet och "fel sätt" i praktiken omöjligt.

Alla steg gjordes **utan att ändra hur appen fungerar** — det är en städning och en förstärkning av
spelreglerna, inte en ombyggnad.

| # | Vad vi gjorde (i klarspråk) | Värde / förenkling |
|---|---|---|
| 1 | **Skrev en kort regelbok** (`CLAUDE.md`) som AI:n alltid läser först, och klargjorde att projektet har två delar med olika regler: "fabriken" (verktyget) och "produkterna" (prototypsidorna). | AI:n förstår direkt vilka regler som gäller och slutar blanda ihop delarna eller dra åt fel verktyg. |
| 2 | **Rensade bort brus:** gamla dokument, backup-filer och funktioner som inte hörde till syftet (uppläsning/röst, chatbot, manualer, klisterlappar, YouTube). | Mindre förvirrande material för både människor och AI; en mindre och tydligare kodbas. |
| 3 | **Färre men rätt sidor:** minskade ett tiotal dubblett-/testsidor till det väsentliga (startsida + verktygssida + ett rent referensexempel). | AI:n får tydliga, korrekta exempel att utgå från i stället för motstridiga. |
| 4 | **Flyttade verktyget till en egen mapp** (`page-builder-studio`). | Det syns nu direkt *på var koden ligger* om den tillhör "fabriken" (fritt fram) eller "produkten" (strikta regler) — inget gissande. |
| 5 | **Byggde färdiga byggblock** (knappar, kort, sidlayout med rätt stil inbyggd) plus en exempelsida som visar hur en korrekt sida ska se ut. | Nya sidor byggs snabbare och det är svårt att göra fel — rätt stil är redan inbakad. |
| 6 | **Lade till en automatisk vakt** som blockerar förbjudna verktyg/bibliotek i "produkt"-delen så fort någon försöker använda dem, men lämnar "fabriken" fri. | Regelbrott stoppas automatiskt i stället för att slinka igenom obemärkt. |
| 7 | **Tog bort ett förbjudet komponentbibliotek + ~50 oanvända paket.** | Beroenden gick från ~68 till 13 — mindre, snabbare, säkrare, och inget förbjudet bibliotek kvar som lockar till felanvändning. |

**Sammantaget resultat:** en betydligt mindre och mer självförklarande kodbas där det korrekta sättet
är det enkla sättet och det felaktiga blockeras automatiskt. Det gör AI-assisterad prototypbyggnad
snabbare och mer pålitlig, och prototyperna hamnar närmare färdig produktion. Kodbasen bygger och
passerar den automatiska kontrollen rent.

> Detaljerna för varje steg finns i sektionerna nedan (skrivna för utvecklare). Öppna frågor som
> kräver *beslut* (t.ex. val av typsnitt) ligger samlade sist under "Framtida förbättringar & beslut".

---

**Branch:** `refactor/design-system-enforcement`
**Mål:** Refaktorera utan att ändra funktionalitet — göra design-system­reglerna tydligare och
lättare att följa för AI-verktyg (Figma Make, Claude Code m.fl.), och rensa bort brus som drar
AI:n mot fel bibliotek.

---

## Bakgrund: de två arbetslägena
Repot är **två appar med två regelböcker**:
- **Mode A – Page Builder Studio** (verktyget som *bygger* prototyper). Tailwind-baserat,
  inga restriktioner. Filer: `src/app/components/{PageBuilder*,pageBuilder*}`.
- **Mode B – allt annat** (prototypsidorna under `src/app/pages/**`). Hårda regler: DevExtreme +
  Bootstrap + native HTML + CSS-klasser + Font Awesome. Ingen Tailwind i JSX, inga inline-stilar,
  inget Lucide/Recharts/shadcn/MUI.

AI:n måste **först avgöra vilket läge** en uppgift gäller. Detta är nu dokumenterat i `CLAUDE.md`.

---

## Tier 0 — riskfri städning (Improvement.md §5c, §5f, §5g)
Rena raderingar av filer som inte importeras av någon kod och som bara var brus.

### Raderade root-dokument
- **11 st TTS/Azure-dokument:** `AZURE_SPEECH_SETUP.md`, `TEST_AZURE_TOGGLE.md`,
  `AZURE_TOGGLE_FIX_SUMMARY.md`, `TTS_TOGGLE_TROUBLESHOOTING.md`, `TTS_DEBUG_TOGGLE.md`,
  `TTS_TESTING_GUIDE.md`, `TTS_UI_TOGGLE_GUIDE.md`, `TTS_HIGHLIGHTING_FIX.md`,
  `TTS_VOICE_PRIORITY.md`, `TTS_WORD_HIGHLIGHTING.md`, `SNABBGUIDE_TTS.md`
- `YOUTUBE_VIDEO_FEATURE.md`
- **Databas-artefakter:** `DATABASE_SETUP_GUIDE.md`, `database-design-snabbguide.md`,
  `database-snabbguide.sql`, `database-snabbguide-migration.sql`, `database-snabbguide-seed.sql`
- `default_shadcn_theme.css` (strö-shadcn-tema i root, refererades ingenstans)

**Skäl:** Varje strö-`.md` i root är en kandidat AI:n läser som "auktoritativ kontext". En hög
TTS/Azure/databas-docs missignalerar projektets syfte och konkurrerar med `CLAUDE.md`/`Guidelines.md`.

### Raderade stale-filer (§5c)
- `src/styles/overrides.css.backup` (stale backup bredvid riktiga `overrides.css`)
- `src/styles/button-color-replacements.sed` (engångs-migreringsskript)

### Behållna (omdömesfall — flaggade för ditt beslut)
- `ATTRIBUTIONS.md` — behålls (kan vara legalt krävt).
- `APPLIKATION_DOKUMENTATION.md` — behålls tills vidare. Innehåller korrekt stack-beskrivning
  men överlappar/motsäger delvis `Guidelines.md` (t.ex. anger "Lato" som primärt typsnitt medan
  reglerna säger Source Sans Pro). **Beslut behövs:** ta bort eller synka mot reglerna.

---

## Enforcement-backbone (Improvement.md §1, §2)

### Ny fil: `/CLAUDE.md` (Steg 1)
Kort, alltid-läst regelfil som tuffas in i kontexten vid sessionsstart. Innehåller:
- **Rule 0:** avgör Mode A/Mode B först.
- **De 10 reglerna** för Mode B (ingen Tailwind i JSX, inga inline-stilar, Font Awesome-ikoner,
  DevExtreme-charts/komplex UI, ingen shadcn/Radix/MUI, Bootstrap bara för layout/utilities osv.).
- Var nya sidor läggs (`src/app/pages/`, `routes.tsx`, `NavigationSidebar.tsx`).
- Hur de tre indata-typerna (Page Builder-export / Figma-frame / prompt) hanteras.

### `Guidelines.md`-filerna korsrefererade (Steg 2)
- `guidelines/Guidelines.md` (kort, auto-injiceras) → pekar nu explicit på root-`Guidelines.md`
  som fullständig spec, och på `CLAUDE.md`.
- `Guidelines.md` (root, ~2840 rader, fullständig spec) → pekar på summeringarna och slår fast
  att root-filen vinner vid konflikt om detalj.

### Template-boilerplate bortstädad (Steg 5g)
Ur båda `Guidelines.md`-filerna: raden `**Add your own guidelines here**` och (i den korta filen)
hela `<!-- System Guidelines ... -->`-exempelblocket. Endast riktiga, aktiva regler kvarstår.
Inga faktiska regler ändrades.

---

## Verifiering
- **Build-baseline:** `pnpm build` (via `npx pnpm@10`, då pnpm saknas globalt i miljön) kördes
  på trädet efter alla ändringar: **grönt — `✓ built in 9.21s`**, `dist/` genererat.
  Chunk-storleksvarningen från Vite är pre-existerande (inte orsakad av dessa ändringar).
- **`.gitignore` tillagd** (saknades helt) så `node_modules/` och `dist/` inte råkar committas;
  `pnpm-lock.yaml` versionshanteras för reproducerbarhet.
- Alla Tier 0-raderingar och backbone-ändringar rör **endast dokument/CSS-backup/strö-filer** —
  ingen körbar kod eller aktiv CSS-import berördes. Appen kan inte ha regrederat av dessa steg.

---

## Tier 1 — feature-borttagning (§5e) och sidkonsolidering (§5d)

Verifierat: `pnpm build` grönt efter allt nedan. Ingen kvarvarande referens till borttagen kod
(kontrollerat med sökning).

### §5e — off-purpose features borttagna end-to-end
Hela hjälpsystemet var nästlat under **`HelpFloatingButton`** (navet), som drog in Manual
(→ TTS + YouTube-embed), WizardGuide, ChatbotFrame och StickyNotes. Navet renderades i både
`Layout.tsx` och `MainContent.tsx`.

- **Raderade komponenter:** `HelpFloatingButton.tsx`, `Manual.tsx`, `WizardGuide.tsx`,
  `ChatbotFrame.tsx`, `StickyNotes.tsx`.
- **Raderad tjänst:** `services/textToSpeechService.ts` (+ dep `microsoft-cognitiveservices-speech-sdk`
  ur `package.json`).
- **Raderad CSS:** `chatbot-widget.css`, `help-components.css`, `manual-restore-popup.css`,
  `manual-visibility.css`, `manual-tts.css`, `sticky-notes.css`.
- **Avwiring (enligt CSS-kartan i Improvement.md §5e):**
  - `Layout.tsx` + `MainContent.tsx`: import + render av `HelpFloatingButton` bort.
  - `App.tsx`: `import "@/styles/chatbot-widget.css"` bort.
  - `globals.css`: `@import` av help-components/manual-restore-popup/manual-visibility/manual-tts bort
    (high-contrast, accessibility-features, icon-color-overrides **behålls**).
  - `index.css`: `@import` av sticky-notes + manual-tts bort.
- **`UserProfilePanel.tsx`:** hade en "Debug (Testing Only)" Azure-TTS-toggle som använde
  `ttsService`. TTS-koden (import, state, effect, handler, debug-sektion) borttagen; panelen i övrigt
  orörd.
- **`MegaMenu.tsx`:** menyval `Traveltest`/`Testsida1`/`Test` samt deras `navigate()`-grenar bort
  (pekade på nu raderade rutter).
- **Tillgänglighet behölls** medvetet (AccessibilityPanel, high-contrast.css, accessibility-features.css)
  — utanför din borttagningslista.

### §5d — duplicerade sidor borttagna (ej bevarade)
- **Raderade sidor (7):** `Test`, `Testpage`, `Testsida1`, `Travel`, `Travelapp2`,
  `Travelapplication`, `Traveltest`.
- **Kvar (5):** `Dashboard` (`/`), `InterfaceCustomization`, `Loneportalen`, `Chefsoversikten`,
  `Components`.
- `routes.tsx` omskriven till endast dessa fem. Inga navlänkar pekar längre på borttagna rutter.

### Dokumentation
- **`APPLIKATION_DOKUMENTATION.md` flyttad till `docs/`** och synkad: statusrubrik överst +
  sektionerna "Hjälpsystem" och "Hjälpkomponenter" markerade som borttagna (2026-07-08).

### ⚠️ Typsnitt korrigerat — Lato, inte Source Sans Pro
Kod-sanning: `globals.css` `--font-family-base: 'Lato'` och `theme.css` `--font-family-primary: 'Lato'`
(applicerat på body). Root-`Guidelines.md` font-**regel** (rad ~382) säger redan `latoweb`/Lato och
"NEVER Source Sans Pro". Men **summeringarna hade fel** — de sa "Source Sans Pro only". Rättat:
- `CLAUDE.md` rule 9 → Lato (`latoweb`).
- `guidelines/Guidelines.md` "Font Family Rule" → Lato.
- **Följdstädning kvar (flaggad):** root-`Guidelines.md` har ~20 per-komponent-specar som fortfarande
  säger "Source Sans Pro" (t.ex. `.card-title`). Dessa motsäger font-regeln och bör migreras till Lato
  i en separat, fokuserad pass (rör detaljerade CSS-specar — utanför denna omgång).

---

## Sidkonsolidering (slutlig) + Steg 0b — Page Builder Studio i egen mapp

Ny branch `refactor/page-builder-studio-structure` (avgrenad från uppdaterad `main` efter merge av
föregående branch; den mergade branchen togs bort lokalt — best practice). `pnpm build` grönt (vite 8.27s).

### Sidor reducerade till det väsentliga (§5d, slutlig)
- **Kvar:** `Dashboard` (`/`) och `Components` (`/components`, värdsida för Page Builder Studio).
- **Borttaget nu:** `InterfaceCustomization`, `Loneportalen`, `Chefsoversikten`.
  (Tidigare borttaget: Travel*/Test*-sidorna + Personligt.)
- `routes.tsx` innehåller nu bara Dashboard + Components.
- **Menyn (MegaMenu/vänsternav) rörs INTE** — den skrivs om i ett separat, senare steg utanför
  refaktoreringen. Döda länkar/404 mot borttagna rutter är därför OK tills dess (medvetet beslut).

### Steg 0b — mode-gränsen är nu en mapp
- **Flyttat till `src/page-builder-studio/`:** 10 filer (PageBuilder.tsx + fem PageBuilder*-
  kontexter/komponenter + pageBuilderTypes/Export/Helpers + figmaFrameExport.ts). De korsimporterar
  bara varandra via `./` → flyttade rent tillsammans.
- **Importer justerade:** 5 delade komponenter (`NavigationSidebar`, `Spacer`, `SidebarContentLayout`,
  `Alert`, `Accordion`) ligger kvar i `src/app/components/` → `./X` omskrivet till `../app/components/X`.
  Enda externa importören `Components.tsx` pekar nu på `../../page-builder-studio/PageBuilder`.
  Den genererade strängen `'./components/Alert'` i `pageBuilderExport.ts` lämnades orörd (exportkod).
- **`CLAUDE.md`** uppdaterad: Mode A = `src/page-builder-studio/**` (gamla "or today…"-klausulen bort).
  Mode-gränsen är nu en ren path-lookup — redo för path-scopad lint i Steg 4.

---

## Steg 3 — ui-kit-wrappers + regelenlig referenssida

Ny branch `refactor/ui-kit-wrappers` (från main). `pnpm build` grönt (vite 9.01s).

### Wrappers i `src/app/components/ui-kit/`
- `Button.tsx` — `Button` + `PrimaryButton`/`SecondaryButton`/`TertiaryButton`; bakar in
  `.btn-primary/-secondary/-tertiary`, FA-ikon via `icon`-prop, default `type="button"`.
- `Card.tsx` — standardstruktur `.card-standard` > `.card-header-wrapper` (titel +
  `.card-header-actions`) + `.card-body-standard`.
- `PageLayout.tsx` — wrappar `<Layout>` + Bootstrap-grid (`.main-content-wrapper` >
  `.container-fluid` > `.row g-3`); barn = Bootstrap-kolumner.
- `Icon.tsx` — enda choke-point för FA-ikoner (rule 3).
- `index.ts` — barrel-export.
- **Alla klassnamn verifierade mot `overrides.css`** innan de bakades in. OBS: mappen heter
  `ui-kit/` — INTE den deprecerade shadcn-mappen `ui/`.

### Referenssida (verifiering + Steg 3-adoption)
- `src/app/pages/UiKitReference.tsx` på route `/ui-kit` — kanoniskt, regelenligt exempel som
  ENBART använder ui-kit + DevExtreme (DataGrid) + Bootstrap-layout + FA + våra CSS-klasser.
  Inga inline-stilar, ingen Tailwind, inget shadcn/Lucide/Recharts.
- **Varför en sida behövs:** projektet saknar tsconfig/typecheck och Vite bundlar bara det som
  importeras — oanvända wrappers skulle aldrig kompileras. En konsumerande sida gör att build:en
  faktiskt verifierar dem. (Menyn rörs inte — separat senare steg.)

---

## Steg 4 — ESLint hård enforcement av förbjudna importer

Ny fil `eslint.config.js` (flat config) + `"lint": "eslint ."` i package.json.
Deps: `eslint` + `typescript-eslint` (dev). `pnpm lint` grönt; enforcement verifierad.

### Vad configen gör
- **Mode B** (allt under `src/**` UTOM Page Builder Studio): `no-restricted-imports` blockerar
  `lucide-react`, `recharts`, `antd` (paths) samt `@mui/*`, `@radix-ui/*`, `lucide-react/*` och
  `**/components/ui/*` (patterns) — varje regel med eget felmeddelande som pekar på CLAUDE.md.
- **Mode A** (`src/page-builder-studio/**`): regeln avstängd — verktyget får använda vad som helst.

### Fynd/anpassningar (avviker från planens literala snippet)
- **Ingen `recommended`-preset** aktiverad — den skulle flooda befintlig kod med orelaterade fel
  och göra `pnpm lint` omöjlig att passera. Fokuserad config = bara `no-restricted-imports`.
- **Bas-block med TS-parser** för alla `src/**/*.{ts,tsx}` krävs (annars parse-fel i Mode A-filer,
  eftersom recommended-preseten annars satt parsern).
- **`src/app/components/ui/**` ignoreras** (deprecerad shadcn-mapp, tas bort i §5b; importerar
  lucide/radix internt — annars failar lint direkt på dess egna filer).
- Mode A-glob = `src/page-builder-studio/**` (ren path efter Steg 0b).

### Verifierat
- `pnpm lint` = grönt (EXIT 0) på nuvarande kod.
- Temporär `lucide-react`-import i Mode B-fil → **error** med custom-meddelande.
- Samma import i `src/page-builder-studio/`-fil → **tillåten** (ingen error). Path-scoping bevisad.

---

## §5b/§5a — shadcn ui/ borttagen + döda deps avinstallerade

Ny branch `refactor/remove-shadcn-ui` (från main efter merge av Steg 3+4). `pnpm build` grönt
(vite 8.64s) OCH `pnpm lint` grönt efter borttagningen.

### Verifiering före borttagning
- Bekräftat att `ui/`-mappen (48 filer) importeras av INGET utanför sig själv — inte page-builder-
  studio, inte någon sida. En isolerad ö.
- Bekräftat att hela dess dep-kluster har 0 importörer utanför `ui/` (inkl. `date-fns`, `react-slick`,
  `react-responsive-masonry`, `@popperjs/core`, `react-popper`). `react-dnd` (9 importörer) behålls.

### Borttaget
- **`src/app/components/ui/`** — hela shadcn/Radix-mappen (48 filer).
- **~50 npm-deps avinstallerade:** alla `@radix-ui/*` (26 st), `lucide-react`, `recharts`,
  `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`, `cmdk`, `vaul`,
  `sonner`, `input-otp`, `embla-carousel-react`, `react-day-picker`, `react-resizable-panels`,
  `next-themes`, `react-hook-form`, `motion`, `clsx`, `class-variance-authority`, `tailwind-merge`,
  `date-fns`, `react-slick`, `react-responsive-masonry`, `@popperjs/core`, `react-popper`.
- `eslint.config.js`: `ignore` för `src/app/components/ui/**` borttagen (mappen finns inte längre);
  `no-restricted-imports`-reglerna behålls som skydd mot att biblioteken återinförs.

### Behållet (medvetet)
- `tw-animate-css` — importeras i `src/styles/tailwind.css` (CSS-lagret), inte död kod.
- `tailwindcss` + `@tailwindcss/vite` — token-lager + Mode A (Page Builder är Tailwind-baserad).
- `react-dnd` (+ html5-backend) — används av Page Builder + Components-sidan.

### Resultat
Beroendena gick från ~68 till **7 deps + 6 devDeps** — exakt den sanktionerade stacken
(DevExtreme + Bootstrap + react-router + react-dnd + Tailwind-token-verktyg + eslint/vite).

---

## Kvar att göra
Planens kärnsteg (Tier 0, Steg 1–4, §5d, §5e, Steg 0b, §5a/§5b) är nu **genomförda**. Återstår:
- **Produktbeslut** i sektionen nedan (B1–B4) — löses när besluten tas, inte ad hoc.
- Ev. verifiera att `tw-animate-css`-animationerna faktiskt används (annars kan även den + dess
  `@import` i `tailwind.css` tas bort).

---

## Framtida förbättringar & beslut (kräver produktbeslut)

> Motstridigheter och val som **inte** ska lösas ad hoc under refaktoreringen. De dokumenteras
> här — väl underbyggda — och implementeras först när beslutet är fattat. Nya poster läggs till
> här allt eftersom de upptäcks, istället för att lägga resurser på att gissa rätt. Varje post:
> vad konflikten är, var i koden, preliminär riktning, och exakt vad som ska göras när beslut tagits.

### B1. Typsnitt: Lato vs Source Sans Pro
- **Konflikt:** Kodens bas-tokens är Lato (`--font-family-base` / `--font-family-primary: 'Lato'`)
  och root-`Guidelines.md`:s font-*regel* säger `latoweb`/Lato. MEN ~20 per-komponent-specar i
  root-`Guidelines.md` (t.ex. `.card-title`, rad ~413) och flera hårdkodade regler i
  `globals.css` (rad 162, 189, 197, 257, 305 m.fl.) säger `'Source Sans Pro'`.
- **Riktning (preliminär):** Lato är standard i den riktiga applikationen (bekräftat av produktägare
  2026-07-08). Summeringarna (`CLAUDE.md`, `guidelines/Guidelines.md`) är redan rättade till Lato.
- **Öppen fråga:** Är någon `Source Sans Pro`-användning avsiktlig (t.ex. rubriker), eller är allt
  legacy som ska bli Lato?
- **Implementation när beslut tagits:** ersätt `'Source Sans Pro'` → Lato-token i root-`Guidelines.md`
  (~20 specar) och i `globals.css`; verifiera visuellt.

### B2. Font Awesome — Pro vs Free
- **Konflikt:** `Guidelines.md` och dess exempel använder `fa-light`/`fa-duotone` (kräver FA **Pro**),
  medan den gamla app-dokumentationen angav "endast gratis solid-varianten". `CLAUDE.md` säger
  "använd `fa-regular`/`fa-solid` om Pro saknas".
- **Beslut som behövs:** Har projektet en FA Pro-licens? Om nej: standardisera regler och exempel på
  `fa-regular`/`fa-solid` och undvik `fa-light`/`fa-duotone`.

### B3. `ATTRIBUTIONS.md`
- **Beslut som behövs:** Behåll om det är legalt krävt (bild-/font-/bibliotekslicenser); annars ta bort.
  Ligger kvar i root tills vidare.

### B4. Byt namn på `Components`-sidan → "Page Builder Studio"?
- **Kontext:** `/components` (`src/app/pages/Components.tsx`) är i dag en bred *komponent-showcase*
  som OCKSÅ bäddar in själva `PageBuilder`-verktyget. Produktägaren ser den som "Page Builder Studio"
  och överväger att döpa om den.
- **Beslut som behövs:** (a) döp om hela sidan/route:n till Page Builder Studio, (b) bryt ut PBS till
  egen route och låt showcase vara kvar, eller (c) behåll som i dag. Rör route-path, komponentnamn och
  navreferenser → görs lämpligen ihop med menyomskrivningen (samma steg som MegaMenu).
