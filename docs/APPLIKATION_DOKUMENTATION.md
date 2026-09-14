# Heroma Portal - Komplett Applikationsdokumentation

> **Synkstatus (2026-07-08):** Flyttad till `docs/`. Typsnitt bekräftat mot koden: **Lato**
> (`latoweb`, `var(--font-family-base)`) är standard — INTE Source Sans Pro. Följande funktioner
> har **tagits bort** ur kodbasen och är därför markerade som borttagna nedan: Hjälpsystem
> (HelpFloatingButton), Chatbot, Manualer, WizardGuide, Sticky Notes, Text-to-Speech (Azure) och
> YouTube-inbäddning. Se [`docs/refactor-log.md`](./refactor-log.md) för detaljer.

## Översikt

Detta är en modern medarbetarportal byggd med React, DevExtreme och Bootstrap. Applikationen tillhandahåller en central plats för medarbetare att få tillgång till viktig information, verktyg och funktioner med fokus på tillgänglighet, användarvänlighet och konsekvent design.

---

## Innehållsförteckning

- [Teknisk Stack](#teknisk-stack)
- [Applikationsstruktur](#applikationsstruktur)
- [Huvudfunktioner](#huvudfunktioner)
- [Komponenter](#komponenter)
- [Designsystem](#designsystem)
- [Navigationsstruktur](#navigationsstruktur)
- [Tillgänglighetsfunktioner](#tillgänglighetsfunktioner)
- [Utvecklingsriktlinjer](#utvecklingsriktlinjer)
- [Filstruktur](#filstruktur)

---

## Teknisk Stack

### Ramverk och Bibliotek
- **React 18** - Modern UI-ramverk med hooks
- **TypeScript** - Typsäker utveckling
- **DevExtreme** - Komplexa UI-komponenter (DataGrid, Button, Form, Chart)
- **Bootstrap 5** - CSS-ramverk för layout och grundläggande styling
- **Font Awesome 6** - Ikonsystem (endast gratis solid-varianten)

### Styling och Tema
- **CSS Variables** - Dynamisk temahantering
- **CSS Modules** - All styling i separata CSS-filer
- **Inga inline-stilar** - All styling via CSS-klasser
- **Tre teman**: Ljust läge, Mörkt läge, Högkontrastläge

### Typsnitt
- **Lato** - Primärt typsnitt för all text
- Laddas via Google Fonts CDN
- Varianter: `latoweb` (normal), `latowebheavy` (bold)

---

## Applikationsstruktur

### Hierarki
```
App.tsx (ROOT - FÅR INTE MODIFIERAS)
└── Layout.tsx (PERMANENT - FÅR INTE MODIFIERAS)
    ├── Header.tsx (PERMANENT - FÅR INTE MODIFIERAS)
    ├── SubHeader.tsx (PERMANENT - FÅR INTE MODIFIERAS)
    └── MainContent.tsx (EDITERBAR - Enda komponenten som får modifieras)
        ├── Carousel
        ├── PersonalCasesCard
        ├── SalaryCard
        ├── VacationCard
        ├── DataTableCard
        ├── FAQCard
        ├── Accordion
        └── HelpFloatingButton
```

### Permanenta Komponenter (FÅR INTE MODIFIERAS)

#### 1. App.tsx
- Huvudkomponent och ingångspunkt
- Importerar Layout och MainContent
- **KRITISKT**: Får ALDRIG modifieras

#### 2. Layout.tsx
- Wrapper för hela applikationen
- Innehåller Header, SubHeader och children (MainContent)
- Innehåller ScrollToBottomButton
- **KRITISKT**: Får ALDRIG tas bort eller modifieras

#### 3. Header.tsx
- Topprubrik med logotyp
- Mega Menu-knapp och sökfunktion
- Navigationsikoner:
  - Meny (hamburgerikon)
  - Favoriter
  - Notifikationer
  - Hjälp
  - Tillgänglighet
  - Användarprofil
- **KRITISKT**: Får ALDRIG tas bort eller modifieras

#### 4. SubHeader.tsx
- Breadcrumb-navigation
- Sidtitel ("Portalen")
- Personuppgiftssökning
- **KRITISKT**: Får ALDRIG tas bort eller modifieras

#### 5. MegaMenu.tsx
- Fullskärmsmeny med kategorier
- Sökfunktionalitet
- **KRITISKT**: Får ALDRIG tas bort eller modifieras

#### 6. AccessibilityPanel.tsx
- Tillgänglighetsinställningar
- Temaväxlare
- **KRITISKT**: Får ALDRIG tas bort eller modifieras

### Editerbar Komponent

#### MainContent.tsx
- **ENDA KOMPONENTEN SOM FÅR MODIFIERAS**
- Innehåller alla dashboard-kort
- Här läggs nya komponenter till
- Här tas komponenter bort
- Här ändras layout

---

## Huvudfunktioner

### 1. Mega Menu Navigation

Komplett navigationsstruktur med flera kategorier:

#### Huvudkategorier:
1. **PORTALER**
   - Portal 1, Portal 2, Portal 3, Portal 4

2. **MIN ANSTÄLLNING**
   - Lön och förmåner
   - Semester och ledighet
   - Arbetstid
   - Personuppgifter
   - Dokument

3. **MIN UTVECKLING**
   - Mina mål
   - Kompetensutveckling
   - Utbildningar
   - Karriärplanering
   - Medarbetarsamtal

4. **LEDNING**
   - Organisation
   - Team
   - Rapporter
   - Resurser

5. **VERKTYG**
   - E-post
   - Kalender
   - Dokument
   - Chat
   - Projekt

6. **SUPPORT & HJÄLP**
   - Hjälpcenter
   - Kontakta IT
   - Guider
   - FAQ

#### Sökfunktionalitet:
- Realtidssökning i alla menyalternativ
- Öppnar automatiskt när användaren börjar skriva
- Filtrerar menyalternativ baserat på sökning
- Rensar sökning när menyn stängs

### 2. Hjälpsystem — BORTTAGET (2026-07-08)

Hela hjälpsystemet (HelpFloatingButton, Manualer, WizardGuide, Chatbot, Sticky Notes samt
Text-to-Speech/Azure) har tagits bort ur kodbasen. Se [`docs/refactor-log.md`](./refactor-log.md).

### 3. Favoriter & Notifikationer

#### Favoriter (FavouritesFlyout):
- Lägg till/ta bort sidor som favoriter
- Snabbåtkomst via header-ikonen
- Visar antal favoriter med badge
- Dropdown-meny från header

#### Notifikationer (NotificationsFlyout):
- Visar antal olästa notifikationer med badge
- Notifikationsflöde med tidsstämplar
- Markera som läst/oläst
- Dropdown-meny från header

### 4. Tillgänglighetspanel

Omfattande tillgänglighetsfunktioner enligt WCAG 2.1 AA:

#### Teman:
- **Ljust läge** (standard) - Vit bakgrund, mörk text
- **Mörkt läge** - Mörk bakgrund (#1e1e1e), ljus text
- **Högkontrastläge** - Svart bakgrund (#000000), vit text, gul accent (#ffff00)

#### Textinställningar:
- **Textstorlek**: Liten (14px), Normal (16px), Stor (18px), Extra stor (20px)
- **Radavstånd**: Normal (1.5), Ökat (2.0), Extra ökat (2.5)

#### Visuella hjälpmedel:
- **Läsguide** - Horisontell linje som följer muspekaren
- **Länkunderstrykningar** - Understryka alla länkar
- **Animationer på/av** - Inaktivera animationer

### 5. Personuppgiftssökning

- Sök efter personer i organisationen
- Visa kontaktinformation
- Tillgänglig från SubHeader

### 6. Användarprofilpanel

- Profilmenyn i headern
- Visar användarinformation
- Inställningar och logout

### 7. Scroll to Bottom Button

- Flytande knapp längst ner till vänster
- Scrollar sidan till botten med smooth scroll

---

## Komponenter

### Dashboard-komponenter (i MainContent)

#### 1. Carousel
- Bildkarusell högst upp på sidan
- Visar viktig information eller kampanjer
- Navigering med pilar

#### 2. PersonalCasesCard
- "Mina pågående ärenden"
- Lista över användarens aktiva ärenden
- Expanderbar lista med case-information
- Status och datum för varje ärende
- Klickbara rader för mer information

#### 3. SalaryCard
- "Min lön"
- Översikt över aktuell månadslön
- **Primär knapp**: "Visa lön" (visar/döljer lönedetaljer)
- **Sekundär knapp**: "Löneuppgifter" (extern länk)
- Status för senaste utbetalningen
- Expanderbar detaljvy med:
  - Grundlön
  - Tillägg
  - Avdrag
  - Nettolön

#### 4. VacationCard
- "Semester & Ledighet"
- Översikt över semester och ledighet
- Visar antal sparade semesterdagar
- Visar antal planerade ledigheter
- Statistik och statusöversikt

#### 5. DataTableCard
- DevExtreme DataGrid i kort
- Visar tabelldata med sortering och filtrering
- Paginering
- **MÅSTE** alltid vara i ett kort (inte direkt på bakgrund)

#### 6. FAQCard
- "Vanliga frågor"
- Accordion med vanliga frågor och svar
- Frågor på svenska
- Expanderbara sektioner
- Gradient plus/minus-ikoner

#### 7. Accordion
- Fristående accordion direkt på bakgrunden
- Kan användas för expanderbart innehåll
- **KAN** placeras direkt på bakgrund ELLER i kort

#### 8. HeatMapCard
- Värmekarta för visualisering av data
- DevExtreme Chart-komponent
- Visar data i färgkodad matris

### Övriga komponenter

> HelpFloatingButton, StickyNotes, WizardGuide och Manual har tagits bort (2026-07-08).

#### 9. Alert
- Varningsmeddelanden och notiser
- Olika typer: success, warning, error, info

#### 10. Tooltip
- Hjälptexter på hover
- Förklaringar av funktioner

#### 11. SkeletonLoader
- Laddningsindikator
- Visar skelett under datahämtning

---

## Designsystem

### Färgpalette

#### Primära Färger (Ljust läge)
- **Primär**: `#5236ab` (lila) - Knappar, länkar, accenter
- **Sekundär**: `#f6f8f9` (ljusgrå) - Bakgrund
- **Förgrund**: `#333333` (mörkgrå) - Text
- **Muted**: `#666666` (grå) - Sekundär text
- **Bakgrund**: `#ffffff` (vit) - Kortbakgrund
- **Kant**: `#efefef` (ljusgrå) - Kantlinjer

#### Mörkt Läge
- **Primär**: `#7c5cdb` (ljuslila)
- **Sekundär**: `#121212` (nästan svart)
- **Förgrund**: `#ffffff` (vit)
- **Muted**: `#a3a3a3` (ljusgrå)
- **Bakgrund**: `#1e1e1e` (mörk)
- **Kant**: `#333333` (mörkgrå)

#### Högkontrastläge
- **Primär**: `#ffff00` (gul)
- **Sekundär**: `#000000` (svart)
- **Förgrund**: `#ffffff` (vit)
- **Muted**: `#ffffff` (vit)
- **Bakgrund**: `#000000` (svart)
- **Kant**: `#ffffff` (vit)

#### Gradienter
```css
/* Primär gradient (lila till rosa) */
linear-gradient(90deg, #5236AB 26%, #E121B4 66%)

/* Används för:
   - Plus/minus-ikoner i accordion
   - Dekorativa element
   - Hoverkanter på vissa element
*/
```

### Typografi

#### Typsnitt
- **Primärt**: Lato (latoweb)
- **Fet**: Lato Heavy (latowebheavy)
- **Laddas från**: Google Fonts CDN

#### Textstorlekar
- **H5 (Kortrubriker)**: 18px, fet (700), `#200a58` färg
- **Brödtext**: 16px, normal (400)
- **Liten text**: 14px
- **Extra liten**: 12px

#### Radavstånd
- **Standard**: 1.5
- **Ökat**: 2.0
- **Extra ökat**: 2.5

### Knappar

#### DevExtreme Button-komponenter

**ALLA knappar MÅSTE använda DevExtreme Button-komponenten:**
```tsx
import Button from 'devextreme-react/button';
```

#### Primär Knapp (`.dx-btn-primary`)
- **Bakgrund**: `#5236ab` (lila)
- **Text**: Vit (`#ffffff`)
- **Ikon**: Font Awesome via `icon` prop
- **Användning**: **EN per sida** för huvudåtgärd
- **Hover**: `#cbc3e6` (ljuslila) bakgrund, `#200a58` text
- **Border radius**: 0px (skarpa hörn)

**Exempel:**
```tsx
<Button
  text="Visa lön"
  icon="fa-solid fa-eye"
  className="dx-btn-primary"
  onClick={handleClick}
/>
```

#### Sekundär Knapp (`.dx-btn-outline`)
- **Bakgrund**: Vit (`#ffffff`)
- **Kant**: `#5236ab` (lila) 1px solid
- **Text**: `#5236ab` (lila)
- **Ikon**: Font Awesome via `icon` prop
- **Användning**: Flera tillåtna per sida
- **Hover**: `#f2f1f9` bakgrund
- **Border radius**: 0px (skarpa hörn)

**Exempel:**
```tsx
<Button
  text="Löneuppgifter"
  icon="fa-solid fa-external-link"
  className="dx-btn-outline"
  onClick={handleClick}
/>
```

#### Knappregler
- ✅ Använd **DevExtreme Button** för ALLA knappar
- ✅ Ikoner via `icon` prop (Font Awesome class)
- ✅ **EN primär knapp per sida**
- ✅ Flera sekundära knappar tillåtna
- ✅ **0px border-radius** (skarpa hörn)
- ❌ Använd ALDRIG native `<button>` element
- ❌ Använd ALDRIG Bootstrap-knappar

### Kort (Cards)

#### Kortstruktur
```html
<div class="card-container">
  <div class="card-top-border"></div>
  <div class="card-content-wrapper">
    <div class="card-header">
      <h5>Rubrik</h5>
    </div>
    <div class="card-body">
      <!-- Innehåll -->
    </div>
  </div>
</div>
```

#### Kortstil
- **Bakgrund**: `var(--background)` (vit i ljust läge)
- **Kant**: `var(--card-border)` (#efefef) 1px solid
- **Topp-kantlinje**: 4px gradient (lila→rosa)
- **Skugga**: `0px 2px 6px 2px rgba(0,0,0,0.15)`
- **Border radius**: 4px
- **Padding**: 20px

#### Kortregler
- ✅ **DataGrid MÅSTE** alltid vara i ett kort
- ✅ Accordions **KAN** vara direkt på bakgrund eller i kort
- ✅ Alla kort har gradient-topp-kant
- ✅ H5-rubrik i `.card-header`

### Accordion

#### Accordion-struktur och regler

**Ikoner:**
- ✅ **Plus (+)** - Kollapsad sektion (använd gradient SVG)
- ✅ **Minus (-)** - Expanderad sektion (använd gradient SVG)
- ❌ **ALDRIG** chevrons (pilar) för accordion

**Gradient SVG-ikoner:**
```tsx
function PlusIcon() {
  return (
    <div className="accordion-icon">
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
        <path d="..." fill="url(#gradient_plus)" className="light-mode-path" />
        <path d="..." fill="white" className="dark-mode-path" />
        <defs>
          <linearGradient id="gradient_plus" ...>
            <stop offset="0.26" stopColor="#5236AB" />
            <stop offset="0.66" stopColor="#E121B4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
```

**Accordion-beteende:**
- En sektion öppen åt gången
- Expanderad sektion: Lila kant (`#cbc3e6`), 10px vertikal marginal
- Kollapsad sektion: Grå kant (`#efefef`), ingen marginal
- Smooth övergångar för border och marginal
- Hover-effekt: Ljusgrå bakgrund på header

**CSS-klass för grå bakgrund:**
```css
.accordion-container-bg {
  background-color: var(--secondary);
  padding: 16px;
}
```

### DataGrid

#### DataGrid-regler

**KRITISKT:**
- ✅ DataGrid MÅSTE **ALLTID** vara i ett kort
- ✅ DataGrid får **ALDRIG** placeras direkt på bakgrund
- ❌ **ALDRIG** lägg till ikoner när man först skapar en DataGrid
- ❌ **ALDRIG** lägg till åtgärdskolumner med ikoner i initial implementation
- ✅ **ALLTID** skapa DataGrids med textbaserade kolumner
- ✅ Ikoner kan läggas till **SENARE** om specifikt begärt

**Initial DataGrid-exempel (KORREKT):**
```tsx
<DataGrid
  dataSource={data}
  showBorders={false}
  showRowLines={true}
  hoverStateEnabled={true}
>
  <Column dataField="name" caption="Namn" />
  <Column dataField="email" caption="E-post" />
  <Column dataField="department" caption="Avdelning" />
</DataGrid>
```

**Fel exempel (GÖR INTE):**
```tsx
// ❌ ALDRIG lägga till ikoner i initial implementation
<Column 
  cellRender={(data) => <i className="fa-solid fa-edit"></i>}
/>
```

### Ikoner

#### Font Awesome

**ENDAST Font Awesome Free:**
- ✅ `fa-solid` - Standard (mest komplett i Free)
- ⚠️ `fa-regular` - Begränsad i Free (endast vissa ikoner)
- ❌ `fa-light` - KRÄVER PRO (fungerar EJ)
- ❌ `fa-duotone` - KRÄVER PRO (fungerar EJ)

**CDN-import (OBLIGATORISK):**
```css
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');
```

**Användning:**
- ✅ I DevExtreme Button via `icon` prop: `icon="fa-solid fa-eye"`
- ✅ I HTML: `<i className="fa-solid fa-search"></i>`
- ❌ ALDRIG DevExtreme-ikoner
- ❌ ALDRIG Lucide React
- ❌ ALDRIG Bootstrap Icons

**Ikonregler för olika komponenter:**
- **Accordion**: Plus/minus (gradient SVG)
- **Dropdown**: Chevron up/down (`fa-solid fa-chevron-down`)
- **Expanderbara listor**: Chevron up/down (`fa-solid fa-chevron-down`)
- **Knappar**: Font Awesome via `icon` prop
- **Navigation**: Font Awesome solid

### Layout och Responsivitet

#### Bootstrap Grid
- 12-kolumners grid-system
- Responsiva breakpoints:
  - `col-12` - Mobile (full bredd)
  - `col-lg-6` - Desktop (halv bredd)
  - `col-lg-4` - Desktop (tredjedel)

#### Dashboard Grid
```css
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}
```

#### Mobilanpassning
- Header kollapsar till hamburgermeny
- Sökfält döljs på mobil (visas via ikon)
- Favoriter och andra funktioner döljs på mobil
- Kort staplas vertikalt

---

## Navigationsstruktur

### Mega Menu-kategorier

Fullständig lista över alla menyalternativ:

#### 1. PORTALER (FÖRSTA MENYN)
- Portal 1
- Portal 2
- Portal 3
- Portal 4

#### 2. MIN ANSTÄLLNING
- Lön och förmåner
- Semester och ledighet
- Arbetstid
- Personuppgifter
- Dokument

#### 3. MIN UTVECKLING
- Mina mål
- Kompetensutveckling
- Utbildningar
- Karriärplanering
- Medarbetarsamtal

#### 4. LEDNING
- Organisation
- Team
- Rapporter
- Resurser

#### 5. VERKTYG
- E-post
- Kalender
- Dokument
- Chat
- Projekt

#### 6. SUPPORT & HJÄLP
- Hjälpcenter
- Kontakta IT
- Guider
- FAQ

---

## Tillgänglighetsfunktioner

### WCAG 2.1 AA-efterlevnad

#### Visuella Anpassningar

**1. Temaväxling:**
- Ljust läge (standard)
- Mörkt läge (#1e1e1e bakgrund)
- Högkontrastläge (#000000 bakgrund, #ffffff text, #ffff00 accent)

**2. Textstorlek:**
- Liten (14px)
- Normal (16px) - Standard
- Stor (18px)
- Extra stor (20px)

**3. Radavstånd:**
- Normal (1.5) - Standard
- Ökat (2.0)
- Extra ökat (2.5)

**4. Visuella hjälpmedel:**
- Läsguide (horisontell linje som följer muspekaren)
- Länkunderstrykningar (understryka alla länkar)
- Animationer på/av (inaktivera CSS-animationer)

#### Tangentbordsnavigation
- **Tab-ordning**: Logisk och sekventiell
- **Focus-indikatorer**: Tydliga fokusringar på alla interaktiva element
- **Skip-länkar**: Hoppa över navigation (om implementerat)

#### Skärmläsarstöd
- **ARIA-attribut**: På alla interaktiva element
- **Semantisk HTML**: Korrekt användning av heading-hierarki
- **Alt-texter**: På alla bilder
- **aria-expanded**: På expanderbara element (accordion, dropdown)

#### Färgkontrast
- **Ljust läge**: Minst 4.5:1 för normal text
- **Mörkt läge**: Minst 4.5:1 för normal text
- **Högkontrastläge**: Maximalt kontrast (21:1)

---

## Utvecklingsriktlinjer

### KRITISKA REGLER

#### 1. INGA INLINE-STILAR
```tsx
// ❌ ALDRIG göra så här
<div style={{ color: 'red', padding: '10px' }}>

// ✅ GÖR så här
<div className="custom-class">
```

**ALL styling i CSS-filer:**
- `/src/styles/globals.css` - Globala stilar och variabler
- `/src/styles/overrides.css` - Komponent-specifika stilar
- `/src/styles/high-contrast.css` - Högkontraststilar

#### 2. ENDAST FONT AWESOME (GRATIS)
```tsx
// ✅ KORREKT - fa-solid (gratis)
<i className="fa-solid fa-search"></i>

// ❌ FEL - fa-light (kräver Pro)
<i className="fa-light fa-search"></i>

// ❌ FEL - Lucide React
import { Search } from 'lucide-react';
```

#### 3. ENDAST DEVEXTREME BUTTON
```tsx
// ✅ KORREKT
import Button from 'devextreme-react/button';
<Button text="Klicka" icon="fa-solid fa-check" className="dx-btn-primary" />

// ❌ FEL - Native button
<button>Klicka</button>

// ❌ FEL - Bootstrap button
<button className="btn btn-primary">Klicka</button>
```

#### 4. ENDAST DEVEXTREME CHART
```tsx
// ✅ KORREKT
import Chart, { Series } from 'devextreme-react/chart';

// ❌ FEL - Recharts
import { LineChart, Line } from 'recharts';

// ❌ FEL - Chart.js
import { Chart } from 'react-chartjs-2';
```

#### 5. DATAGRID ALLTID I KORT
```tsx
// ✅ KORREKT
<div className="card-container">
  <div className="card-top-border"></div>
  <div className="card-content-wrapper">
    <div className="card-body">
      <DataGrid dataSource={data}>
        <Column dataField="name" caption="Namn" />
      </DataGrid>
    </div>
  </div>
</div>

// ❌ FEL - DataGrid direkt på bakgrund
<DataGrid dataSource={data} />
```

#### 6. INGA IKONER I INITIAL DATAGRID
```tsx
// ✅ KORREKT - Textbaserade kolumner
<Column dataField="name" caption="Namn" />
<Column dataField="email" caption="E-post" />

// ❌ FEL - Ikoner i initial implementation
<Column 
  cellRender={(data) => <i className="fa-solid fa-edit"></i>}
/>
```

#### 7. ENDAST LATO TYPSNITT
```css
/* ✅ KORREKT */
font-family: 'Lato', sans-serif;
font-family: var(--font-family-base);

/* ❌ FEL */
font-family: 'Source Sans Pro', sans-serif;
font-family: Arial, sans-serif;
```

#### 8. INGA TAILWIND-KLASSER
```tsx
// ❌ FEL - Tailwind
<div className="w-4 h-4 p-4 text-xl">

// ✅ KORREKT - Bootstrap + egna klasser
<div className="d-flex gap-3 custom-class">
```

#### 9. EN PRIMÄR KNAPP PER SIDA
```tsx
// ✅ KORREKT - En primär, resten sekundära
<Button text="Huvudåtgärd" className="dx-btn-primary" />
<Button text="Åtgärd 2" className="dx-btn-outline" />
<Button text="Åtgärd 3" className="dx-btn-outline" />

// ❌ FEL - Flera primära knappar
<Button text="Åtgärd 1" className="dx-btn-primary" />
<Button text="Åtgärd 2" className="dx-btn-primary" />
```

#### 10. ACCORDION-IKONER
```tsx
// ✅ KORREKT - Plus/minus gradient SVG för accordion
<PlusIcon />  // Kollapsad
<MinusIcon /> // Expanderad

// ❌ FEL - Chevrons för accordion
<i className="fa-solid fa-chevron-down"></i>

// ✅ KORREKT - Chevrons för dropdown/expanderbar lista
<i className="fa-solid fa-chevron-down"></i>
```

### Komponentplaceringsregler

#### DataGrid
- **MÅSTE** alltid vara i ett kort
- **FÅR ALDRIG** placeras direkt på bakgrund
- **Skäl**: Visuell hierarki och avgränsning

#### Accordion
- **KAN** placeras direkt på bakgrund
- **KAN** placeras i kort
- **Flexibel** placering

### Nya Komponenter

**När du skapar nya komponenter:**

1. **Placera i** `/src/app/components/`
2. **Importera i** `MainContent.tsx`
3. **Använd TypeScript** för typsäkerhet
4. **Följ namnkonvention**: PascalCase för komponenter
5. **Exportera som named export**: `export function MyComponent()`
6. **Använd funktionella komponenter** med hooks
7. **Dokumentera** med JSDoc-kommentarer

**Exempel:**
```tsx
// /src/app/components/MyNewCard.tsx
import React from 'react';
import Button from 'devextreme-react/button';

/**
 * MyNewCard Component
 * Beskrivning av vad komponenten gör
 */
export function MyNewCard() {
  return (
    <div className="card-container">
      <div className="card-top-border"></div>
      <div className="card-content-wrapper">
        <div className="card-header">
          <h5>Rubrik</h5>
        </div>
        <div className="card-body">
          <p>Innehåll</p>
          <Button 
            text="Åtgärd" 
            icon="fa-solid fa-check"
            className="dx-btn-primary" 
          />
        </div>
      </div>
    </div>
  );
}
```

**Importera i MainContent:**
```tsx
import { MyNewCard } from './MyNewCard';

export const MainContent = () => {
  return (
    <main className="main-content p-0 mx-3">
      <div className="d-flex flex-column gap-4">
        <MyNewCard />
      </div>
    </main>
  );
};
```

---

## Filstruktur

```
/
├── src/
│   ├── app/
│   │   ├── App.tsx                          # ROOT (PERMANENT)
│   │   └── components/
│   │       ├── Layout.tsx                   # Layout wrapper (PERMANENT)
│   │       ├── Header.tsx                   # Topprubrik (PERMANENT)
│   │       ├── SubHeader.tsx                # Sub-rubrik (PERMANENT)
│   │       ├── MegaMenu.tsx                 # Mega menu (PERMANENT)
│   │       ├── AccessibilityPanel.tsx       # Tillgänglighet (PERMANENT)
│   │       ├── UserProfilePanel.tsx         # Användarprofilpanel
│   │       ├── FavouritesFlyout.tsx         # Favoriter
│   │       ├── NotificationsFlyout.tsx      # Notifikationer
│   │       ├── MainContent.tsx              # Huvudinnehåll (EDITERBAR)
│   │       ├── Carousel.tsx                 # Bildkarusell
│   │       ├── PersonalCasesCard.tsx        # Ärendekort
│   │       ├── SalaryCard.tsx               # Lönekort
│   │       ├── VacationCard.tsx             # Semesterkort
│   │       ├── DataTableCard.tsx            # DataGrid-kort
│   │       ├── FAQCard.tsx                  # FAQ-kort med accordion
│   │       ├── Accordion.tsx                # Fristående accordion
│   │       ├── HeatMapCard.tsx              # Värmekarta
│   │       ├── HelpFloatingButton.tsx       # Flytande hjälpknapp
│   │       ├── StickyNotes.tsx              # Anteckningar
│   │       ├── WizardGuide.tsx              # Guide
│   │       ├── Manual.tsx                   # Manual
│   │       ├── ScrollToBottomButton.tsx     # Scroll till botten
│   │       ├── SearchDropdown.tsx           # Sökdropdown
│   │       ├── Alert.tsx                    # Varningar
│   │       ├── Tooltip.tsx                  # Tooltips
│   │       ├── Breadcrumbs.tsx              # Breadcrumbs
│   │       ├── SkeletonLoader.tsx           # Laddningsindikator
│   │       ├── AccordionSection.tsx         # Accordion-sektion
│   │       ├── ChatbotFrame.tsx             # Chatbot
│   │       ├── figma/                       # Figma-komponenter
│   │       │   └── ImageWithFallback.tsx    # Bild med fallback
│   │       └── ui/                          # UI-hjälpkomponenter
│   │
│   └── styles/
│       ├── fonts.css                        # Typsnittsinläsning
│       ├── globals.css                      # Globala stilar och variabler
│       ├── overrides.css                    # Komponent-specifika stilar
│       ├── high-contrast.css                # Högkontraststilar
│       ├── accessibility-features.css       # Tillgänglighetsstilar
│       ├── user-profile-panel.css           # Användarprofilpanel
│       ├── chatbot-widget.css               # Chatbot-widget
│       ├── help-components.css              # Hjälpkomponenter
│       └── manual-restore-popup.css         # Manual återställning
│
├── Guidelines.md                            # Utvecklingsriktlinjer
└── APPLIKATION_DOKUMENTATION.md             # Denna fil
```

---

## Användningsexempel

### Lägga till nytt kort i dashboard

**1. Skapa komponent:**
```tsx
// /src/app/components/MyCard.tsx
import React from 'react';
import Button from 'devextreme-react/button';

export function MyCard() {
  const handleClick = () => {
    console.log('Klickad!');
  };

  return (
    <div className="card-container">
      <div className="card-top-border"></div>
      <div className="card-content-wrapper">
        <div className="card-header">
          <h5>Mitt kort</h5>
        </div>
        <div className="card-body">
          <p>Innehåll här...</p>
          <Button 
            text="Min åtgärd"
            icon="fa-solid fa-check"
            className="dx-btn-outline"
            onClick={handleClick}
          />
        </div>
      </div>
    </div>
  );
}
```

**2. Importera i MainContent:**
```tsx
import { MyCard } from './MyCard';

export const MainContent = () => {
  return (
    <main className="main-content p-0 mx-3">
      <div className="d-flex flex-column gap-4">
        <MyCard />
        {/* Övriga komponenter */}
      </div>
    </main>
  );
};
```

### Skapa accordion

```tsx
import React, { useState } from 'react';

export function MyAccordion() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="d-flex flex-column w-100">
      {sections.map((section) => {
        const isExpanded = expandedId === section.id;
        return (
          <div 
            key={section.id} 
            className={`accordion-section ${isExpanded ? 'expanded' : 'collapsed'}`}
          >
            <button 
              className="accordion-header" 
              onClick={() => setExpandedId(isExpanded ? null : section.id)}
            >
              <span>{section.title}</span>
              {isExpanded ? <MinusIcon /> : <PlusIcon />}
            </button>
            {isExpanded && (
              <div className="accordion-content">
                {section.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

### Skapa DataGrid i kort

```tsx
import React from 'react';
import DataGrid, { Column, Paging } from 'devextreme-react/data-grid';

const data = [
  { id: 1, name: 'Anna', email: 'anna@example.com' },
  { id: 2, name: 'Erik', email: 'erik@example.com' },
];

export function MyDataGrid() {
  return (
    <div className="card-container">
      <div className="card-top-border"></div>
      <div className="card-content-wrapper">
        <div className="card-header">
          <h5>Data</h5>
        </div>
        <div className="card-body">
          <DataGrid
            dataSource={data}
            showBorders={false}
            showRowLines={true}
            hoverStateEnabled={true}
            keyExpr="id"
          >
            <Paging enabled={true} pageSize={10} />
            <Column dataField="name" caption="Namn" />
            <Column dataField="email" caption="E-post" />
          </DataGrid>
        </div>
      </div>
    </div>
  );
}
```

### Lägga till CSS-stilar

**I `/src/styles/overrides.css`:**
```css
/* Anpassad komponent */
.my-custom-class {
  background-color: var(--background);
  color: var(--foreground);
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-family: 'Lato', sans-serif;
}

/* Mörkt läge */
[data-theme="dark"] .my-custom-class {
  background-color: #2a2a2a;
  border-color: #444444;
}

/* Högkontrast */
[data-theme="high-contrast"] .my-custom-class {
  background-color: #000000 !important;
  color: #ffffff !important;
  border: 2px solid #ffffff !important;
}
```

---

## Prestanda och Optimering

### Aktuella Optimeringar
- **CSS Variables**: Snabb temaväxling utan re-rendering
- **LocalStorage**: Persistenta användarinställningar
- **Komponentseparation**: Modulär struktur
- **Bootstrap Grid**: Responsiv layout utan extra JS
- **Font Awesome CDN**: Snabb ikonladdning

### Framtida Förbättringar
- Lazy loading av kortkomponenter
- Virtualisering av långa listor i DataGrid
- Bild-optimering och lazy loading
- Service Worker för offline-stöd
- Code splitting för stora komponenter

---

## Testning

### Tillgänglighetstestning
1. **Tangentbordsnavigation**: Testa alla funktioner med endast tangentbord
2. **Skärmläsare**: Testa med NVDA/JAWS (Windows) eller VoiceOver (Mac)
3. **Kontrasttest**: Verifiera kontrast med WebAIM Contrast Checker
4. **Zoom**: Testa 200% zoom utan förlust av funktionalitet
5. **Tema**: Testa alla tre teman (ljust, mörkt, högkontrast)

### Responsivitetstestning
1. **Mobil**: 375px - 768px
2. **Tablet**: 768px - 1024px
3. **Desktop**: 1024px+
4. **Orientering**: Porträtt och landskap

### Webbläsartestning
- Chrome (senaste)
- Firefox (senaste)
- Safari (senaste)
- Edge (senaste)

---

## Felsökning

### Ikoner visas som "X"
**Problem**: Font Awesome-ikoner fungerar inte

**Lösning:**
1. Kontrollera att CDN-import finns i `/src/styles/globals.css`
2. Verifiera att du använder `fa-solid` (inte `fa-light`)
3. Kontrollera stavning av ikonnamn
4. Rensa webbläsarcache

### Tema fungerar inte
**Problem**: Temaväxling ändrar inte färger

**Lösning:**
1. Kontrollera att CSS-variabler används: `var(--primary)`
2. Verifiera att `[data-theme]` attribut sätts på `<html>` eller `<body>`
3. Kontrollera att alla teman definieras i `globals.css`

### DataGrid visas inte
**Problem**: DataGrid renderas inte

**Lösning:**
1. Kontrollera att DevExtreme CSS importeras i `App.tsx`
2. Verifiera att data har `keyExpr` eller unikt ID
3. Kontrollera att DataGrid är i ett kort
4. Inspektera console för fel

### Knappar ser fel ut
**Problem**: Knappar har fel styling

**Lösning:**
1. Kontrollera att DevExtreme Button används (inte native button)
2. Verifiera att korrekt className används: `.dx-btn-primary` eller `.dx-btn-outline`
3. Kontrollera att override-CSS är korrekt
4. Se till att endast en primär knapp finns per sida

---

## Support och Kontakt

### Teknisk Support
- **IT-support**: Via hjälpmenyn → Kontakt
- **Dokumentation**: `Guidelines.md` + denna fil
- **FAQ**: I FAQCard-komponenten

### Utvecklingsstöd
- **Kodstandarder**: Se `Guidelines.md`
- **Komponentexempel**: Se befintliga komponenter
- **Designmönster**: Följ existerande struktur

---

## Versionshistorik

### Version 1.0 - Aktuell
**Funktioner:**
- ✅ Komplett mega menu med sökning
- ✅ Hjälpsystem med Sticky Notes och guide
- ✅ Favoriter och notifikationer
- ✅ Tillgänglighetspanel med tre teman
- ✅ Dashboard med 8+ kortkomponenter
- ✅ FAQ med accordion
- ✅ Mobilresponsiv design
- ✅ Högkontrast-tema för tillgänglighet
- ✅ Användarprofilpanel
- ✅ Scroll to bottom-knapp
- ✅ Carousel för bildvisning
- ✅ DataGrid med sortering och filtrering
- ✅ Värmekarta för datavisualisering

---

## Licensiering

### Tredjepartsbibliotek
- **React**: MIT License
- **DevExtreme**: Commercial License (Community Edition tillgänglig)
- **Bootstrap**: MIT License
- **Font Awesome 6 Free**: Font Awesome Free License

---

## Sammanfattning

Heroma Portal är en fullständig medarbetarportal byggd med moderna webbteknologier och fokus på:

✅ **Tillgänglighet** - WCAG 2.1 AA-efterlevnad med tre teman  
✅ **Användarvänlighet** - Intuitiv navigation och tydlig struktur  
✅ **Konsekvent design** - Enhetligt designsystem genom hela appen  
✅ **Underhållbarhet** - Modulär struktur och tydlig dokumentation  
✅ **Prestanda** - Optimerad för snabb laddning och responsivitet  
✅ **Flexibilitet** - Editerbart MainContent-område  
✅ **Säkerhet** - Permanenta layout-komponenter skyddas från oavsiktliga ändringar  

**Permanent struktur:** Header, SubHeader, Layout  
**Editerbart område:** MainContent (enda komponenten som modifieras)  
**Designprinciper:** Inga inline-stilar, endast DevExtreme-komponenter, endast Font Awesome-ikoner, en primär knapp per sida  

Alla komponenter är noggrant dokumenterade och följer strikta designriktlinjer för att säkerställa en konsekvent och professionell användarupplevelse.

---

**Senast uppdaterad:** 2024-01-XX  
**Version:** 1.0  
**Författare:** Heroma Development Team
