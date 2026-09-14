> This is the AUTHORITATIVE full design system spec. A short summary lives in
> `/guidelines/Guidelines.md` (auto-injected) and `/CLAUDE.md` (read every session).
> If any summary conflicts with this file, THIS file wins for detail;
> the summaries win only for "which rule is most important".

# Design System Guidelines

## 📇 How to use this spec — read the section for your task

This is a long reference. **Do not read it top to bottom.** Find your task below and jump to that
section (search the heading text). The always-read essentials live in `/CLAUDE.md`; this file holds
the detail. Building something with **no ready-made component**? Read **BUILDING CUSTOM UI** first.

| What you're building / changing | Go to section |
|---|---|
| Colors, brand palette, tokens/variables | `COLOR SYSTEM` |
| Fonts / typography | `COLOR SYSTEM` → "Font Family Rule" |
| Dark mode / high contrast | `DARK MODE STYLING GUIDELINES` |
| A custom element with **no ready component** | `BUILDING CUSTOM UI` (below) |
| Primary buttons | `PRIMARY BUTTON COMPONENT GUIDELINES` |
| Secondary / outline buttons | `SECONDARY/OUTLINE BUTTON COMPONENT GUIDELINES` |
| Cards (container, title, header, body) | `CARD COMPONENT GUIDELINES` |
| Tabs | `TABS COMPONENT GUIDELINES` |
| Accordions | `ACCORDION COMPONENT` |
| Tooltips | `TOOLTIP COMPONENT GUIDELINES` |
| Alerts | `ALERT COMPONENT GUIDELINES` |
| Carousels | `CAROUSEL COMPONENT GUIDELINES` |
| Text inputs / fields | `INPUT FIELD COMPONENT GUIDELINES` |
| Dropdowns / selects | `DROPDOWN DESIGN GUIDELINES` |
| Data tables / grids | `DATA TABLE DESIGN SPECIFICATIONS` (+ DevExtreme DataGrid) |
| Which library to use for what | `COLOR SYSTEM` → the "ONLY DEVEXTREME / NO …" rules |
| Person / seed data on a page | `/CLAUDE.md` → "Shared data (person register)" |

> **Non-negotiables (full detail in `/CLAUDE.md`):** DevExtreme + Bootstrap + native HTML + our CSS
> classes + Font Awesome. No Tailwind in JSX, no inline `style={{}}`, no Lucide/Recharts/shadcn/MUI.
> This applies to ALL three inputs identically — a plain prompt, a screenshot, or Page Builder output.

## 🧩 BUILDING CUSTOM UI (when there is no ready-made component)

Not everything has a prebuilt component. When you must hand-build an element it STILL has to look
like the design system. Do this instead of reaching for Tailwind, inline styles, or a foreign library:

1. **Use design tokens, never hard-coded values.** Colours: `var(--primary)`, `var(--primary-dark)`,
   `var(--background)`, `var(--border)`, `var(--card-border)`, … Font: `var(--font-family-base)`
   (resolves to **Lato**, the standard). Never hard-code a hex colour or a font name.
2. **Reuse our CSS classes** from `src/styles/overrides.css` (e.g. `.btn-primary`, `.btn-secondary`,
   `.card-standard`, `.card-header-wrapper`, `.card-body-standard`, `.nav-btn`, …). New rules go in
   `overrides.css` (page-agnostic) — not inline styles, not page-local CSS.
3. **Bootstrap for layout only** — grid (`container`, `row`, `col-*`) and utilities (spacing, flex,
   display). Not for look-and-feel.
4. **Font Awesome for icons** (`<i className="fa-regular fa-user"></i>`).
5. **Square corners by default** (`border-radius: 0`) and the standard page background — see
   `CRITICAL RULES`.

**Worked example — a bespoke summary tile (no ready component):**

```tsx
// JSX — only our classes + Bootstrap utilities; no inline styles, no Tailwind
<div className="card-standard">
  <div className="card-header-wrapper">
    <h2 className="card-title-standard">Kostnadsställe</h2>
  </div>
  <div className="card-body-standard d-flex align-items-center gap-2">
    <i className="fa-regular fa-building" aria-hidden="true"></i>
    <span className="summary-tile-value">KE 4210</span>
  </div>
</div>
```

```css
/* src/styles/overrides.css — tokens only, no hard-coded colours/fonts */
.summary-tile-value {
  font-family: var(--font-family-base); /* Lato */
  color: var(--primary-dark);
  font-weight: 700;
}
```

> **Font note (decision B1):** the standard font is **Lato** via `var(--font-family-base)` /
> `var(--font-family-primary)`. Some per-component specs lower in this file still say
> `'Source Sans Pro'` — a tracked inconsistency (`docs/refactor-log.md` → B1). For any NEW markup,
> use the **token**, never a hard-coded font name.

## ⚠️ CRITICAL RULES - READ FIRST ⚠️

### BACKGROUND COLOR CONSISTENCY
- **CRITICAL**: ALL pages must use the same background color as the home page
- **ALWAYS** use `#f4f4f4` (light gray) as the main background color for ALL pages
- **NEVER** introduce different background colors on different pages
- **CONSISTENCY**: The background must remain `#f4f4f4` across the entire application

### BORDER RADIUS POLICY
- **CRITICAL**: NO ROUNDED BORDERS unless explicitly requested by the user
- **ALWAYS** use `border-radius: 0` (sharp square corners) for ALL elements by default
- **NEVER** introduce rounded corners on buttons, input fields, cards, or any other elements
- **Applies to:**
  - All buttons (primary, secondary, outline)
  - All input fields (text inputs, color pickers, selects)
  - All cards and containers
  - All dropdowns and popovers
  - All modals and dialogs
- **Exception ONLY**: If user explicitly requests "rounded corners" or "rounded borders" with a specific border-radius value
- **Default Rule**: `border-radius: 0` for everything

## 🔒 TEMPLATE STRUCTURE - NEVER MODIFY WHEN REMIXING 🔒

### PERMANENT LAYOUT COMPONENTS
**CRITICAL: When remixing this template, the following components are PERMANENT and must NEVER be removed, modified, or affected by user prompts:**

#### Protected Files and Components:
1. **`/src/app/components/Layout.tsx`** - PERMANENT LAYOUT WRAPPER
   - ❌ **NEVER** delete this file
   - ❌ **NEVER** modify the Header or SubHeader references
   - ❌ **NEVER** remove the Layout component from App.tsx
   - ✅ This component wraps all application content
   
2. **`/src/app/components/Header.tsx`** - PERMANENT HEADER
   - ❌ **NEVER** delete this file
   - ❌ **NEVER** remove the Header from Layout.tsx
   - ❌ **NEVER** modify the header structure (logo, menu, search, navigation)
   - ✅ The header is persistent across the entire application
   
3. **`/src/app/components/SubHeader.tsx`** - PERMANENT SUB-HEADER
   - ❌ **NEVER** delete this file
   - ❌ **NEVER** remove the SubHeader from Layout.tsx
   - ❌ **NEVER** modify the sub-header structure (title, breadcrumb, person search)
   - ✅ The sub-header is persistent across the entire application

4. **`/src/app/components/MegaMenu.tsx`** - PERMANENT MEGA MENU
   - ❌ **NEVER** delete this file
   - ❌ **NEVER** remove the MegaMenu from Header.tsx
   - ✅ The mega menu is part of the navigation system

5. **`/src/app/components/AccessibilityPanel.tsx`** - PERMANENT ACCESSIBILITY PANEL
   - ❌ **NEVER** delete this file
   - ❌ **NEVER** remove the AccessibilityPanel from Header.tsx
   - ✅ The accessibility panel is part of the navigation system

### EDITABLE CONTENT AREA
**The ONLY component that should be modified when remixing:**

- **`/src/app/components/MainContent.tsx`** - EDITABLE DASHBOARD CONTENT
  - ✅ **SAFE TO MODIFY** - This is the main content area
  - ✅ **SAFE TO REPLACE** - User prompts can change this component
  - ✅ **SAFE TO CUSTOMIZE** - Edit cards, grids, charts, etc. in this file
  - ❌ **DO NOT** remove the Layout wrapper in App.tsx

### Application Structure
```
App.tsx (DO NOT MODIFY)
  └── Layout.tsx (DO NOT MODIFY)
      ├── Header.tsx (DO NOT MODIFY)
      ├── SubHeader.tsx (DO NOT MODIFY)
      └── MainContent.tsx (SAFE TO MODIFY) ← Edit this file only
```

### When Processing User Prompts:
1. **ALWAYS** preserve the Layout, Header, and SubHeader components
2. **ONLY** modify the MainContent.tsx file or create new components called by MainContent
3. **NEVER** regenerate or restructure App.tsx or Layout.tsx
4. **ALWAYS** keep the header navigation, search, and user menu intact
5. **ALWAYS** keep the sub-header breadcrumb and person search intact

### Important Remixing Rules:
- ✅ User asks: "Create a new dashboard" → Modify **MainContent.tsx only**
- ✅ User asks: "Add a new card" → Edit **MainContent.tsx only**
- ✅ User asks: "Change the layout" → Modify **MainContent.tsx only**
- ❌ User asks: "Remove the header" → **REFUSE** - Header is permanent
- ❌ User asks: "Change the navigation" → **REFUSE** - Header navigation is permanent
- ❌ Any prompt that would modify Layout, Header, or SubHeader → **REFUSE** or **CLARIFY** that these are permanent

---

## COLOR SYSTEM

### Primary and Secondary Colors
- **Primary Color**: `#5236ab` (purple) - Use for primary actions, accents, and interactive elements
- **Secondary Color**: `#200a58` (dark purple) - Use for secondary actions, headings, and emphasis
- **Usage Examples**:
  - Primary buttons background: `#5236ab`
  - Card titles: `#200a58`
  - Links and interactive text: `#5236ab`
  - Hover states (dark): `#200a58`

### ABSOLUTELY NO INLINE STYLES
- **NEVER** write `style={{}}` in any React component
- **NEVER** use inline CSS of any kind
- **ALL** styling must be defined in CSS files (`/styles/globals.css` or `/styles/overrides.css`)
- **ALWAYS** use CSS classes from `/styles/overrides.css` for all styling needs
- **ALWAYS** use CSS variables from `/styles/globals.css` (e.g., `var(--primary)`, `var(--card-border)`)

### COMPONENT PLACEMENT RULES - DATA GRIDS AND ACCORDIONS
- **CRITICAL: Data Grids (DevExtreme DataGrid) MUST ALWAYS be placed inside a card component**
  - ❌ **NEVER** place a DataGrid directly on the page background
  - ✅ **ALWAYS** wrap DataGrid components in a card container with proper card structure
  - ✅ Use the `.card-container` wrapper with `.card-top-border` and `.card-content-wrapper`
  - **Reason**: Data grids need the visual hierarchy and containment that cards provide
  
- **Accordions CAN be placed directly on the page background**
  - ✅ Accordions are allowed to sit directly on the background without a card wrapper
  - ✅ Accordions have their own self-contained styling and borders
  - **Exception**: If design requires it, accordions can also be placed inside cards

### DATA GRID COLUMN SORTING GUIDELINES
- **CRITICAL: New data grids/tables should NOT have column sorting enabled by default**
  - ❌ **NEVER** add `allowSorting={true}` to columns when creating new data grids
  - ❌ **NEVER** enable sorting features unless explicitly requested by the user
  - ✅ **ALWAYS** follow the template in `/src/app/components/DataTableCard.tsx` (Data Overview card)
  - ✅ Columns should be clean and simple without sort indicators
  - **Reason**: The default template does not include sorting functionality
  - **Exception**: Only add sorting if the user explicitly requests "sortable columns" or "column sorting"

**Template Reference (Data Overview Card):**
```tsx
<DataGrid
  dataSource={dataSource}
  showBorders={false}
  rowAlternationEnabled={true}
  columnAutoWidth={true}
  hoverStateEnabled={true}
  className="data-table-grid"
>
  <Column dataField="customer" caption="Customer" alignment="left" />
  <Column dataField="id" caption="Order ID" alignment="left" width={120} />
  {/* No allowSorting prop - sorting is NOT enabled by default */}
</DataGrid>
```

**Summary:**
- ✅ **Default behavior**: Columns are NOT sortable
- ✅ **Clean columns**: No sort arrows or indicators
- ❌ **Never assume sorting is needed** - wait for user to request it
- ✅ **Follow template**: Match the Data Overview card implementation exactly

### ACCORDION AND DROPDOWN ICON GUIDELINES

#### Accordion Expand/Collapse Icons
- **CRITICAL**: Accordions MUST use **+ (plus)** and **- (minus)** icons for expand/collapse functionality
- **NEVER** use chevron/arrow icons for accordions (up/down arrows)
- **Icon Implementation**:
  - **Collapsed state**: Use **+ (plus)** icon - Font Awesome: `fa-solid fa-plus`
  - **Expanded state**: Use **- (minus)** icon - Font Awesome: `fa-solid fa-minus`
- **Icon Position**: Right side of accordion header
- **Icon Size**: 14px (standard icon size)
- **Icon Color**: Follow color system (`#333333` in light mode, `#ffffff` in dark mode)
- **Toggle Behavior**: Icon should change from + to - when accordion expands

#### Dropdown Icons
- **CRITICAL**: Dropdowns MUST use **chevron/arrow** icons for open/close functionality
- **NEVER** use + (plus) or - (minus) icons for dropdowns
- **Icon Implementation**:
  - **Closed state**: Use **down chevron** - Font Awesome: `fa-solid fa-chevron-down`
  - **Open state**: Use **up chevron** - Font Awesome: `fa-solid fa-chevron-up`
- **Icon Position**: Right side of dropdown button/select
- **Icon Size**: 14px (standard icon size)
- **Icon Color**: Follow color system (`#333333` in light mode, `#ffffff` in dark mode)
- **Toggle Behavior**: Icon should change from down to up when dropdown opens

#### Summary
- ✅ **Accordions** = `+` / `-` icons (plus/minus)
- ✅ **Dropdowns** = `↓` / `↑` icons (chevron-down/chevron-up)
- ❌ **NEVER** mix these - accordions use plus/minus, dropdowns use chevrons

### EXPANDABLE LIST ITEMS

#### When to Use Expandable List Items
- **Purpose**: Show/hide nested content within list items
- **Use Case**: List items that contain sub-items or additional details
- **Example**: "Mina pågående ärenden" with expandable case list

#### Expandable List Item Implementation
- **CRITICAL**: Expandable list items MUST use **chevron** icons (up/down arrows)
- **NEVER** use + (plus) or - (minus) icons for expandable list items
- **Icon Implementation**:
  - **Collapsed state**: Use **down chevron** - Font Awesome: `fa-solid fa-chevron-down`
  - **Expanded state**: Use **up chevron** - Font Awesome: `fa-solid fa-chevron-up`
- **Icon Position**: Right side of list item header
- **Icon Size**: 14px (standard icon size)
- **Icon Color**: Text muted color (`text-muted-foreground` class)
- **Toggle Behavior**: Icon should change from down to up when list expands

#### Expandable List Item Structure
```tsx
const [isExpanded, setIsExpanded] = useState(false);

// List item header (clickable)
<div className="list-item cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
  <span className="small text-foreground">Section Title</span>
  <div className="d-flex align-items-center gap-3">
    <span className="badge-custom">{items.length}</span>
    <i className={`fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} text-muted-foreground`}></i>
  </div>
</div>

// Expanded content (conditionally rendered)
{isExpanded && (
  <div className="mt-3">
    {items.map((item) => (
      <div key={item.id} className="list-item">
        {/* Item content */}
      </div>
    ))}
  </div>
)}
```

#### Styling Requirements
- **Clickable list items**: Add `cursor-pointer` class
- **Hover state**: Background color changes on hover
  - Light theme: `#f9f9f9`
  - Dark theme: `#3a3a3a`
- **Transition**: Smooth background color transition (0.2s ease)
- **Badge**: Display count of items in the list
- **Gap**: 12px between badge and chevron icon

#### CSS Classes Required
```css
.list-item.cursor-pointer {
  transition: background-color 0.2s ease;
}

.list-item.cursor-pointer:hover {
  background-color: #f9f9f9;
}

[data-theme="dark"] .list-item.cursor-pointer:hover {
  background-color: #3a3a3a;
}
```

#### Visual Hierarchy
- **Header row**: Main list item with title, badge, and chevron
- **Expanded content**: Nested list items indented or styled differently
- **Chevron direction**: Down = collapsed, Up = expanded
- **Badge updates**: Badge count should reflect the number of items in the expanded list

#### Summary
- ✅ **Expandable List Items** = `↓` / `↑` icons (chevron-down/chevron-up)
- ✅ **Interactive**: Add `cursor-pointer` class and hover states
- ✅ **Badge**: Show count of items in the list
- ❌ **NEVER** use + (plus) or - (minus) icons for list items

### ABSOLUTELY NO LUCIDE REACT - ONLY FONT AWESOME
- **NEVER** use `lucide-react` package or any Lucide icons
- **NEVER** import from `lucide-react`
- **ONLY** use **Font Awesome** for ALL icons
- **NEVER** use DevExtreme icons, Bootstrap icons, or any other icon libraries
- **ALWAYS** use Font Awesome class names: `<i className="fa-solid fa-icon-name"></i>`
- **ALWAYS** use `fa-solid` as the default icon style
- **NEVER** use `fa-light` or `fa-duotone` - these require Font Awesome Pro and will display as broken "X" icons
- Only use `fa-regular` if you've verified the specific icon exists in Font Awesome Free
- Example: `<i className="fa-solid fa-filter"></i>` for filter icon
- Example: `<i className="fa-solid fa-gear"></i>` for settings icon
- Example: `<i className="fa-solid fa-user"></i>` for user icon

#### Font Awesome Setup
Font Awesome is included via CDN in `/styles/globals.css`. The following import is required at the top of the file:

```css
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');
```

**⚠️ CRITICAL: Font Awesome Library Must Be Included ⚠️**

**Font Awesome 6.5.1 CDN is MANDATORY** for this project. The library must be loaded via CDN at the top of `/styles/globals.css`:

```css
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');
```

**BEFORE writing ANY Font Awesome icon code:**
1. ✅ **VERIFY** the CDN import exists in `/styles/globals.css`
2. ✅ **CHECK** that it's Font Awesome 6.5.1 (not version 5 or 4)
3. ✅ **CONFIRM** the import is at the very top of the file

**If the CDN import is missing:**
- ❌ **ALL icons will display as broken "X"**
- ❌ **NO Font Awesome icons will work**
- ✅ **ADD the CDN import IMMEDIATELY** before writing any icon code

**Font Awesome Free vs Pro:**
- This project uses **Font Awesome 6 Free** (CDN free tier)
- **Free version limitations:**
  - ✅ `fa-solid` - **WORKS** (most complete icon set in Free)
  - ⚠️ `fa-regular` - **LIMITED** (only a few icons available in Free)
  - ❌ `fa-light` - **REQUIRES PRO LICENSE** (will not work)
  - ❌ `fa-duotone` - **REQUIRES PRO LICENSE** (will not work)

**Default Icon Style Rule:**
- **ALWAYS use `fa-solid` as the default** for Font Awesome Free
- Only use `fa-regular` if you've verified the specific icon exists in FA Free
- **NEVER use `fa-light` or `fa-duotone`** (Pro-only features)

**Common Icon Examples (Free Version):**
- ✅ `fa-solid fa-circle-info` - Info icon (WORKS)
- ✅ `fa-solid fa-search` - Search icon (WORKS)
- ✅ `fa-solid fa-user` - User icon (WORKS)
- ✅ `fa-solid fa-bars` - Menu icon (WORKS)
- ❌ `fa-regular fa-circle-info` - Info icon (BROKEN in Free - requires Pro)
- ❌ `fa-light fa-user` - User icon (BROKEN - requires Pro)

**Testing Icons:**
- If an icon appears as a broken "X", it means:
  1. The CDN is not loaded (check `/styles/globals.css`)
  2. The icon name is incorrect (check fontawesome.com)
  3. You're using a Pro-only style like `fa-light` or `fa-regular` for icons that don't exist in Free

**Important Notes:**
- The Font Awesome CDN link is already included in the project
- This provides access to **Font Awesome 6 Free** icon variants
- **Default to `fa-solid`** - it has the most complete icon set in the Free version
- No additional imports or setup needed in React components - just use the `<i className="fa-solid fa-icon-name"></i>` syntax
- **VERIFY the CDN is loaded** before writing any Font Awesome code

**Emergency Checklist (If Icons Are Broken):**
1. [ ] Is the CDN import in `/styles/globals.css`?
2. [ ] Is it Font Awesome 6.5.1 (not older versions)?
3. [ ] Are you using `fa-solid` (not `fa-light` or `fa-regular` for Pro-only icons)?
4. [ ] Is the icon name correct? (Check fontawesome.com)
5. [ ] Is the browser cache cleared?

**Remember: `fa-solid` first, verify CDN second, check icon name third. This will prevent 99% of icon issues.**

### ABSOLUTELY NO RECHARTS OR OTHER CHART LIBRARIES - ONLY DEVEXTREME
- **NEVER** use `recharts` package or any other charting library (Chart.js, Victory, etc.)
- **NEVER** import from `recharts` or similar chart libraries
- **ONLY** use **DevExtreme Chart Components** for ALL charts and graphs
- **ALWAYS** use DevExtreme Chart, PieChart, BarChart for data visualization
- Example: `import Chart, { Series, ArgumentAxis, ValueAxis } from 'devextreme-react/chart';`
- Example: `import PieChart, { Series, Label } from 'devextreme-react/pie-chart';`
- DevExtreme provides comprehensive charting: Line, Area, Bar, Pie, Donut, Scatter, and more
- **ALL** charts must be styled using CSS variables from `/styles/globals.css`

### ONLY DEVEXTREME COMPONENTS (APART FROM BOOTSTRAP)
- **NEVER** use third-party UI component libraries other than DevExtreme and Bootstrap
- **NEVER** use libraries like ShadCN, Material-UI, Ant Design, etc.
- **ONLY** use DevExtreme components for:
  - ✅ All data grids and tables
  - ✅ All forms and form inputs (when building complex forms)
  - ✅ All charts and graphs
  - ✅ All date/time pickers
  - ✅ All dropdowns and selects
  - ✅ **ALL BUTTONS** - Use DevExtreme Button component
  - ✅ Any other complex UI components
- **Bootstrap is allowed ONLY for:**
  - ✅ Layout (grid system, containers, rows, columns)
  - ✅ Utility classes (spacing, display, flex)
  - ❌ **NOT for buttons** - Use DevExtreme Button instead
  - ✅ Simple cards (native `<div>` with Bootstrap card classes)
  - ✅ Simple form inputs (native `<input>`, `<select>`, `<textarea>` outside DevExtreme forms)

### Component Defaults Must Be Overridden
- **WARNING**: ShadCN and Bootstrap components have default styling (gap, typography, spacing, etc.)
- **ALWAYS** explicitly set CSS classes to override these defaults
- **NEVER** rely on component defaults - they do not match our design system
- Example: A button component may have default padding/font - you **MUST** apply `.btn-standard` or similar class to override it

### Font Family Rule
- **CRITICAL**: **ALL** text in the application must use **"latoweb"** or **"latowebheavy"** font families
- **NEVER** use "Source Sans Pro", "Arial", "Helvetica", or any other fonts
- **Font Family Options**:
  - **latoweb** - For regular text (defined as `var(--font-family-base)`)
  - **latowebheavy** - For bold/heavy text (defined as `var(--font-family-heavy)`)
- **ALWAYS** explicitly set `font-family: 'latoweb', sans-serif;` or `font-family: 'latowebheavy', sans-serif;` in CSS
- **ALL** CSS classes must include font-family declarations
- **NEVER** rely on inherited font families - always declare explicitly

### ABSOLUTELY NO TAILWIND
- **NEVER** use Tailwind CSS classes (e.g., `w-4`, `h-4`, `text-xl`, `p-4`, etc.)
- **ONLY** use CSS classes from `/styles/overrides.css` and `/styles/globals.css`
- **ONLY** use Bootstrap utility classes (e.g., `container`, `row`, `col-md-8`, `d-flex`, etc.)
- **ALL** custom styling must be in CSS files, not Tailwind classes

### BUTTON STYLING RULES
- **ALL** buttons must have **0px border-radius** (sharp square corners)
- **NEVER** apply rounded corners to buttons
- **ALWAYS** set `border-radius: 0` for all standard buttons
- **Applies to:**
  - `.dx-btn-primary` - Primary action buttons
  - `.dx-btn-outline` - Outline/secondary buttons
  - All custom button classes
- **Exception:** Circular icon buttons (`.icon-btn`, `.badge`, etc.) should remain circular with `border-radius: 50%`

### CARD TITLE STYLING RULES
- **CRITICAL**: ALL card titles must use the `.card-title` class and follow the standard card title styling
- **Standard Card Title CSS** (defined in `/styles/overrides.css`):
  ```css
  .card-title {
    font-family: 'Source Sans Pro', sans-serif;
    font-size: 18px;
    font-weight: 600;
    color: #200a58;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  ```
- **ALWAYS** use these exact properties for card titles:
  - **Font Family**: `'Source Sans Pro', sans-serif`
  - **Font Size**: `18px`
  - **Font Weight**: `600` (SemiBold)
  - **Color**: `#200a58` (dark purple)
  - **Display**: `flex`
  - **Align Items**: `center`
  - **Gap**: `8px` (between title text and icons)
- **Use Cases**:
  - Card headers (e.g., "Lön", "Semestersaldo", "Färginställningar", "Förhandsvisning")
  - Section titles within cards
  - Any prominent heading within a card component
- **NEVER** create custom title styles that deviate from this standard
- **Reference**: See the Lön card (SalaryCard component) for the canonical card title implementation

---

## PRIMARY BUTTON COMPONENT GUIDELINES

### CRITICAL: Use DevExtreme Button Component
- **ALWAYS** use `import Button from 'devextreme-react/button';` for ALL buttons
- **NEVER** use native HTML `<button>` elements or Bootstrap button classes
- **NEVER** use custom button components from other libraries

### DevExtreme Button Usage

#### Primary Button
```tsx
import Button from 'devextreme-react/button';

<Button
  text="Button Text"
  icon="fa-regular fa-icon-name"
  className="dx-btn-primary"
/>
```

#### Outline Button
```tsx
<Button
  text="Button Text"
  icon="fa-solid fa-icon-name"
  className="dx-btn-outline"
/>
```

### Icon Integration
- **Icons**: Use Font Awesome class names in the `icon` prop (e.g., `icon=\"fa-regular fa-eye\"`)
- **Icon Size**: 14x14px (automatically styled via CSS)
- **Icon Position**: Icons appear before text by default
- **Icon Color**: Changes with button state (defined in CSS)

### Button Structure
- **Border Radius**: **0px** (sharp square corners)
- **Font**: Source Sans Pro SemiBold (600), **16px**, **16px line-height**
- **Height**: **~16px total** (minimal/ultra-compact)
- **Padding**: **0px vertical**, **4px horizontal**
- **Gap**: **2px** between icon and text
- **Icon Size**: **14x14px**
- **Text Size**: **16px**
- **Font Weight**: **600 (SemiBold)**

### Primary Button States (`.dx-btn-primary`)

#### Default State
- **Background**: `#5236ab` (purple)
- **Text Color**: `#ffffff` (white)
- **Icon Color**: `#ffffff` (white)
- **Border**: None
- **Use Case**: Standard resting state

#### Hover State
- **Background**: `#cbc3e6` (light purple)
- **Text Color**: `#200a58` (dark purple)
- **Icon Color**: `#200a58` (dark purple)
- **Box Shadow**: `0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)`
- **Use Case**: Mouse hover over button

#### Focus State
- **Background**: `#afa3d8` (medium purple)
- **Text Color**: `#200a58` (dark purple)
- **Icon Color**: `#200a58` (dark purple)
- **Border**: None
- **Outline**: None (removed)
- **Box Shadow**: None
- **Use Case**: Keyboard focus or active focus

#### Pressed/Active State
- **Background**: `#3a2679` (dark purple)
- **Text Color**: `#ffffff` (white)
- **Icon Color**: `#ffffff` (white)
- **Box Shadow**: None
- **Use Case**: Button click/press state

#### Disabled State
- **Background**: `#efefef` (light gray)
- **Text Color**: `rgba(21, 21, 21, 0.45)` (semi-transparent black)
- **Icon Color**: `#a8a8a8` (gray)
- **Cursor**: not-allowed
- **Use Case**: Inactive/disabled button state

### Important Notes
- **NEVER** use inline styles for button states
- **ALWAYS** use CSS pseudo-classes (`:hover`, `:focus`, `:active`, `:disabled`) for state styling
- **ALL** button styling must be in `/styles/overrides.css`
- **Icon transitions**: Icons should change color to match text color in hover/focus states
- **Reference**: See `/src/imports/Primary.tsx` for Figma primary button design reference

### Primary Button Usage Guidelines

#### CRITICAL: One Primary Button Per Page Rule
- **ALWAYS** use only **ONE primary button** per application/page/view
- **Primary buttons** are for the **most important action** on the page
- **Use Case**: The single most critical action the user should take (e.g., "Visa lön", "Submit", "Save", "Continue")
- **Multiple buttons needed?** Use **outline buttons (secondary)** for all other actions

#### Template Reference: "Visa lön" Button
The **"Visa lön" button** in the Lön card (`/src/app/components/SalaryCard.tsx`) is the **PRIMARY BUTTON TEMPLATE** for this application.

**When a user requests a primary button**, implement it EXACTLY like this template with all its states and behaviors:

```tsx
import { Button } from 'devextreme-react/button';

<Button
  text="Visa lön"
  icon="fa-solid fa-eye"
  className="dx-btn-primary"
  onClick={() => setShowSalaryDetails(!showSalaryDetails)}
/>
```

### Primary Button States (`.dx-btn-primary`)

**IMPORTANT**: All states below are defined in `/src/styles/overrides.css` and must be followed exactly.

#### Default State (Normal/Resting)
- **Background**: `#5236ab` (primary purple)
- **Text Color**: `#ffffff` (white)
- **Icon Color**: `#ffffff` (white)
- **Border**: None
- **Font**: Source Sans Pro, 16px, weight 600
- **Padding**: 0px 4px
- **Gap**: 2px between icon and text
- **Border Radius**: 0 (square corners)
- **Use Case**: Standard resting state - most visible button on page

#### Hover State
- **Background**: `#cbc3e6` (light purple)
- **Text Color**: `#200a58` (dark purple)
- **Icon Color**: `#200a58` (dark purple)
- **Border**: None
- **Box Shadow**: `0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)`
- **Use Case**: Mouse hover over button
- **Note**: Background inverts to lighter shade, text/icon becomes dark purple

#### Focus State
- **Background**: `#afa3d8` (medium light purple)
- **Text Color**: `#200a58` (dark purple)
- **Icon Color**: `#200a58` (dark purple)
- **Border**: None
- **Outline**: None (removed)
- **Box Shadow**: None
- **Use Case**: Keyboard focus or tab navigation
- **Note**: Slightly darker than hover state

#### Pressed/Active State
- **Background**: `#3a2679` (dark purple)
- **Text Color**: `#ffffff` (white)
- **Icon Color**: `#ffffff` (white)
- **Border**: None
- **Box Shadow**: None
- **Use Case**: Button click/press state
- **Note**: Darker than default state to show pressed feedback

#### Disabled State
- **Background**: `#efefef` (light gray)
- **Text Color**: `rgba(21, 21, 21, 0.45)` (muted dark gray)
- **Icon Color**: `#a8a8a8` (medium gray)
- **Border**: None
- **Cursor**: `not-allowed`
- **Use Case**: When button action is unavailable
- **Note**: Visually muted to indicate disabled state

### High Contrast Theme States

When `data-theme="high-contrast"` is active, primary buttons adapt for accessibility:

#### Default State (High Contrast)
- **Background**: Transparent
- **Text Color**: `#ffff00` (yellow)
- **Icon Color**: `#ffff00` (yellow)
- **Border**: 2px solid `#ffff00` (yellow)

#### Hover State (High Contrast)
- **Background**: `#ffff00` (yellow)
- **Text Color**: `#000000` (black)
- **Icon Color**: `#000000` (black)
- **Border**: 2px solid `#ffff00` (yellow)

#### When to Add a Primary Button
When a user requests: "Add a primary button" or "Make this the main action button", implement it exactly like the **"Visa lön" button** in SalaryCard

#### Button Hierarchy Best Practices
1. **Primary Button** (`.dx-btn-primary`) - ONE per page
   - Most important action
   - Example: "Visa lön", "Submit Form", "Save Changes", "Continue to Checkout"
   
2. **Secondary/Outline Buttons** (`.dx-btn-outline`) - Multiple allowed
   - Supporting actions
   - Example: "Löneuppgifter", "Cancel", "Go Back", "View Details"
   
3. **Icon-Only Buttons** - Navigation and utility actions
   - Minimize, maximize, close buttons
   - Example: Card header controls (minus, square icons)

#### Visual Hierarchy
- Primary buttons stand out with solid purple background (`#5236ab`)
- Outline buttons are visually subordinate with transparent background and purple border
- This creates clear visual priority for the primary action

#### Example: Correct Button Usage in SalaryCard
```tsx
{/* Secondary action - Outline button */}
<Button
  text="Löneuppgifter"
  icon="fa-solid fa-external-link"
  className="dx-btn-outline"
/>

{/* Primary action - Primary button (ONLY ONE per page) */}
<Button
  text="Visa lön"
  icon="fa-solid fa-eye"
  className="dx-btn-primary"
/>
```

---

## SECONDARY/OUTLINE BUTTON COMPONENT GUIDELINES

### Template Reference: "Semesteröversikt person" Button
The **"Semesteröversikt person" button** in the Semestersaldo card (`/src/app/components/VacationCard.tsx`) is the **SECONDARY BUTTON TEMPLATE** for this application.

**When a user requests a secondary button or outline button**, implement it EXACTLY like this template with all its states and behaviors:

```tsx
import { Button } from 'devextreme-react/button';

<Button
  text="Semesteröversikt person"
  icon="fa-solid fa-external-link"
  className="dx-btn-outline"
/>
```

### Secondary/Outline Button States (`.dx-btn-outline`)

**IMPORTANT**: All states below are defined in `/src/styles/overrides.css` and must be followed exactly.

#### Default State (Normal/Resting)
- **Background**: `#ffffff` (white)
- **Text Color**: `#5236ab` (primary purple)
- **Icon Color**: `#5236ab` (primary purple)
- **Border**: 1px solid `#5236ab` (purple)
- **Font**: Source Sans Pro, 16px, weight 600
- **Padding**: 0px 4px
- **Gap**: 2px between icon and text
- **Border Radius**: 0 (square corners)
- **Use Case**: Standard resting state for secondary actions
- **Note**: White background with purple outline creates visual hierarchy below primary buttons

#### Hover State
- **Background**: `#f2f1f9` (very light purple)
- **Text Color**: `#5236ab` (primary purple)
- **Icon Color**: `#5236ab` (primary purple)
- **Border**: 1px solid `#5236ab` (purple)
- **Box Shadow**: None
- **Use Case**: Mouse hover over button
- **Note**: Subtle background tint on hover while maintaining purple text/icon

#### Focus State
- **Background**: `#e6e3f3` (light purple)
- **Text Color**: `#200a58` (dark purple)
- **Icon Color**: `#200a58` (dark purple)
- **Border**: 1px solid `#200a58` (dark purple)
- **Outline**: None (removed)
- **Box Shadow**: None
- **Use Case**: Keyboard focus or tab navigation
- **Note**: Darker purple background and text for clear focus indication

#### Pressed/Active State
- **Background**: `#cbc3e6` (medium light purple)
- **Text Color**: `#200a58` (dark purple)
- **Icon Color**: `#200a58` (dark purple)
- **Border**: 1px solid `#200a58` (dark purple)
- **Box Shadow**: None
- **Use Case**: Button click/press state
- **Note**: Most saturated purple background in the state progression

#### Disabled State
- **Background**: `#ffffff` (white)
- **Text Color**: `rgba(21, 21, 21, 0.45)` (muted dark gray)
- **Icon Color**: `rgba(21, 21, 21, 0.45)` (muted dark gray)
- **Border**: 1px solid `#efefef` (light gray)
- **Cursor**: `not-allowed`
- **Use Case**: When button action is unavailable
- **Note**: Muted colors indicate disabled state

### High Contrast Theme States

When `data-theme="high-contrast"` is active, secondary buttons adapt for accessibility:

#### Default State (High Contrast)
- **Background**: Transparent
- **Text Color**: `#ffffff` (white)
- **Icon Color**: `#ffffff` (white)
- **Border**: 2px solid `#ffffff` (white)

#### Hover State (High Contrast)
- **Background**: `#ffff00` (yellow)
- **Text Color**: `#000000` (black)
- **Icon Color**: `#000000` (black)
- **Border**: 2px solid `#ffff00` (yellow)

### Dark Theme States

When `data-theme="dark"` is active, secondary buttons adapt:

#### Default State (Dark Theme)
- **Background**: `#4d4d4d` (dark gray)
- **Text Color**: `#ffffff` (white)
- **Icon Color**: `#ffffff` (white)
- **Border**: 1px solid `#4d4d4d` (dark gray)

#### Hover State (Dark Theme)
- **Background**: `#5a5a5a` (lighter gray)
- **Text Color**: `#ffffff` (white)
- **Icon Color**: `#ffffff` (white)
- **Border**: 1px solid `#777777` (medium gray)

#### Focus State (Dark Theme)
- **Background**: `#666666` (medium gray)
- **Text Color**: `#ffffff` (white)
- **Icon Color**: `#ffffff` (white)
- **Border**: 1px solid `#888888` (light gray)

#### Pressed/Active State (Dark Theme)
- **Background**: `#3a3a3a` (darker gray)
- **Text Color**: `#ffffff` (white)
- **Icon Color**: `#ffffff` (white)
- **Border**: 1px solid `#555555` (dark gray)

#### Disabled State (Dark Theme)
- **Background**: `#2b2b2b` (very dark gray)
- **Text Color**: `rgba(255, 255, 255, 0.45)` (muted white)
- **Icon Color**: `rgba(255, 255, 255, 0.45)` (muted white)
- **Border**: 1px solid `#333333` (dark gray)

### Important Notes
- **NEVER** use inline styles for button states
- **ALWAYS** use CSS pseudo-classes (`:hover`, `:focus`, `:active`, `:disabled`) for state styling
- **ALL** button styling must be in `/styles/overrides.css`
- **Icon transitions**: Icons should change color to match text color in hover/focus states
- **Reference**: See `/src/imports/Outline.tsx` for Figma outline button design reference

### Secondary Button Usage Guidelines

#### CRITICAL: Outline Buttons are Secondary Buttons
- **Outline buttons** (`.dx-btn-outline`) are **SECONDARY buttons** in this design system
- **Use for**: Supporting actions, less important actions, alternative options
- **Multiple allowed**: You can have multiple secondary buttons per page
- **Always subordinate**: Secondary buttons should visually support, not compete with, the primary button

#### When to Add a Secondary Button
When a user requests: "Add a secondary button" or "Add a supporting action button", implement it exactly like the **"Löneuppgifter" button** in SalaryCard:

```tsx
import { Button } from 'devextreme-react/button';

<Button
  text="Löneuppgifter"
  icon="fa-solid fa-external-link"
  className="dx-btn-outline"
/>
```

#### Secondary Button Use Cases
- **Navigation**: "Go Back", "View Details", "Learn More"
- **Alternative actions**: "Cancel", "Skip", "Close"
- **External links**: "Löneuppgifter", "Open Document", "Export Data"
- **Secondary operations**: "Reset", "Refresh", "Duplicate"

#### Visual Design Philosophy
- **Primary button** (solid purple): Demands attention for the main action
- **Secondary button** (outline purple): Provides options without overwhelming the interface
- **Hierarchy**: Secondary buttons create a clear visual hierarchy where the primary action stands out

#### Example: Correct Secondary Button Usage in SalaryCard
```tsx
{/* Secondary action - External link to salary info */}
<Button
  text="Löneuppgifter"
  icon="fa-solid fa-external-link"
  className="dx-btn-outline"
/>

{/* Primary action - View salary (most important action) */}
<Button
  text="Visa lön"
  icon="fa-solid fa-eye"
  className="dx-btn-primary"
/>
```

#### Common Patterns
1. **Form Actions**: Primary = "Save", Secondary = "Cancel"
2. **Data Views**: Primary = "Edit", Secondary = "Export" / "Share"
3. **Card Actions**: Primary = "View Full Details", Secondary = "Quick Preview" / "Download"
4. **Wizards**: Primary = "Continue", Secondary = "Go Back"

---

## TABS COMPONENT GUIDELINES

### CRITICAL: Use Tabs for Content Organization
- **Purpose**: Tabs are used to organize related content into separate views within the same page context
- **Use Case**: When you need to show different content sections that are mutually exclusive (only one visible at a time)
- **Example**: Interface Customization page with "Färginställningar" and "Språkinställningar" tabs

### Template Reference: Interface Customization Tabs
The **tabs in `/src/app/pages/InterfaceCustomization.tsx`** are the **TABS TEMPLATE** for this application.

**When a user requests tabs**, implement them EXACTLY like this template:

```tsx
const [activeTab, setActiveTab] = useState('colors');

const tabs = [
  { id: 'colors', label: 'Färginställningar' },
  { id: 'language', label: 'Språkinställningar' }
];

<div className="container-fluid">
  <div className="interface-tabs">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        className={`interface-tab ${activeTab === tab.id ? 'active' : ''}`}
        onClick={() => setActiveTab(tab.id)}
      >
        {tab.label}
      </button>
    ))}
  </div>
</div>
```

### Tab Structure Requirements

#### Tab Container (`.interface-tabs`)
- **ALWAYS** use a container div with class `interface-tabs`
- **Display**: `flex` with no gap
- **Overflow**: `overflow-x: auto` for horizontal scrolling on small screens
- **Padding**: `0`

#### Individual Tab Button (`.interface-tab`)
- **ALWAYS** use `<button>` elements (NOT divs or other elements)
- **ALWAYS** add the `interface-tab` class
- **Active State**: Add `active` class when tab is selected
- **Key Prop**: Required for each tab in the map
- **onClick Handler**: Must update the active tab state

### Tab Styling Specifications

**IMPORTANT**: All tab styling is defined in `/src/styles/interface-customization.css`

#### Default State (Inactive Tab)
- **Background**: `transparent`
- **Text Color**: `#6c757d` (muted gray)
- **Border**: None
- **Border Bottom**: 3px solid transparent (reserve space for active state)
- **Padding**: `16px 24px`
- **Font Family**: `var(--font-family-base)` (latoweb)
- **Font Size**: `14px`
- **Font Weight**: `600` (SemiBold)
- **Cursor**: `pointer`
- **White Space**: `nowrap` (prevent text wrapping)
- **Transition**: `all 0.2s ease`

#### Hover State
- **Background**: `#f8f9fa` (light gray)
- **Text Color**: `#5236ab` (primary purple)
- **Border Bottom**: Remains transparent

#### Active State (`.interface-tab.active`)
- **Background**: `transparent`
- **Text Color**: `var(--active-tab-border-color, #5236ab)` (primary purple)
- **Border Bottom**: 3px solid `var(--active-tab-border-color, #5236ab)` (primary purple)
- **Font Weight**: `600` (SemiBold)
- **Note**: The 3px bottom border is the primary active state indicator

### Tab Content Area

#### Tab Content Container (`.interface-tab-content`)
- **Background**: `#ffffff` (white)
- **Padding**: `32px 24px`
- **Min Height**: `400px`
- **Use**: Wrap tab content in this class for consistent spacing

### Tab Implementation Pattern

```tsx
import { useState } from 'react';

function MyTabComponent() {
  const [activeTab, setActiveTab] = useState('tab1');

  const tabs = [
    { id: 'tab1', label: 'First Tab' },
    { id: 'tab2', label: 'Second Tab' },
    { id: 'tab3', label: 'Third Tab' }
  ];

  return (
    <div>
      {/* Tab Navigation */}
      <div className="container-fluid">
        <div className="interface-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`interface-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="interface-tab-content">
        {activeTab === 'tab1' && (
          <div>{/* Tab 1 content */}</div>
        )}
        {activeTab === 'tab2' && (
          <div>{/* Tab 2 content */}</div>
        )}
        {activeTab === 'tab3' && (
          <div>{/* Tab 3 content */}</div>
        )}
      </div>
    </div>
  );
}
```

### Visual Hierarchy Rules

1. **Active Tab Indicator**: 3px bottom border in primary purple (`#5236ab`)
2. **Hover Feedback**: Light gray background with purple text
3. **Inactive Tabs**: Muted gray text, transparent background
4. **No Icons**: Tabs should contain text only (no Font Awesome icons)
5. **No Badges**: Keep tab labels clean and simple

### Tab vs. Other Navigation Patterns

**Use Tabs When:**
- ✅ Content sections are related and belong to the same context
- ✅ Only one section should be visible at a time
- ✅ Switching between sections should be instant (no page reload)
- ✅ You have 2-6 sections (optimal range)

**Use Accordions When:**
- ✅ Multiple sections can be open simultaneously
- ✅ Vertical space is limited
- ✅ Content hierarchy is important

**Use Navigation Menu When:**
- ✅ Navigating to completely different pages
- ✅ Page URL should change
- ✅ Browser history should be updated

### Accessibility Requirements

- **Keyboard Navigation**: Tabs must be keyboard accessible (native `<button>` provides this)
- **Focus States**: Browser default focus outline (do not remove)
- **ARIA (Optional)**: Consider adding `role="tablist"`, `role="tab"`, and `role="tabpanel"` for screen readers
- **Active Indication**: Visual active state (bottom border) is mandatory

### CSS File Reference

All tab styles are defined in `/src/styles/interface-customization.css`:
- `.interface-tabs-container` - Optional outer container with bottom border
- `.interface-tabs` - Tab button container
- `.interface-tab` - Individual tab button
- `.interface-tab:hover` - Hover state
- `.interface-tab.active` - Active state
- `.interface-tab-content` - Content area styling

### Important Notes

- **NEVER** use inline styles for tabs
- **ALWAYS** use the CSS classes from `/src/styles/interface-customization.css`
- **NEVER** use third-party tab components (Material-UI, Ant Design, etc.)
- **ALWAYS** implement tabs using native `<button>` elements with these CSS classes
- **NEVER** add icons to tab labels (keep them text-only)
- **Reference**: See `/src/app/pages/InterfaceCustomization.tsx` for the canonical tabs implementation

---

## CARD COMPONENT GUIDELINES

### Template Reference: "Att göra" Card
The **"Att göra" card** in the PersonalCasesCard component (`/src/app/components/PersonalCasesCard.tsx`) is the **CARD TEMPLATE** for this application.

**When a user requests a card**, implement it EXACTLY like this template with all its structural elements and styling:

```tsx
<div className="card-container border-top-4" data-wizard-target="personal-cases-card">
  <div className="card-content-wrapper">
    <div className="card-header-row">
      <h3 className="card-title">
        Att göra
        <span className="tooltip-wrapper">
          <i className="fa-solid fa-circle-info card-title-icon"></i>
          <Tooltip text="Hantera och spåra dina personliga ärenden" />
        </span>
      </h3>
      <div className="d-flex gap-2 text-muted-foreground">
        <i className="fa-solid fa-minus cursor-pointer hover-primary"></i>
        <i className="fa-regular fa-square icon-sm cursor-pointer hover-primary"></i>
      </div>
    </div>

    <div className="card-body">
      {/* Card content goes here */}
    </div>
  </div>
</div>
```

### CRITICAL: Card Border Specifications

**BORDER SPECIFICATIONS** - This is the defining characteristic of cards:
- **Top Border**: **4px solid** `#efefef` (light gray) - Applied via `.border-top-4` class
- **Left/Right/Bottom Border**: **1px solid** `#efefef` (light gray)
- **Border Radius**: 0 (square corners)
- **IMPORTANT**: The 4px top border creates visual separation and is REQUIRED on all cards

### Card Container (`.card-container`)

#### Default State
- **Background**: `#ffffff` (white)
- **Border**: 1px solid `#efefef` (light gray) on all sides
- **Border Top**: 4px solid `#efefef` (via `.border-top-4` class override)
- **Border Radius**: 0 (square corners)
- **Margin Bottom**: 1.5rem
- **Display**: flex
- **Flex Direction**: column
- **Height**: 100%
- **Overflow**: visible

#### Dark Theme State
- **Background**: `#2b2b2b` (dark gray)
- **Border**: 1px solid `#2b2b2b` (dark gray)
- **Border Top**: 4px solid `#2b2b2b` (dark gray)

#### High Contrast Theme State
- **Background**: `#000000` (black)
- **Border**: 2px solid `#ffffff` (white) on all sides
- **Border Top**: 1px solid `#ffffff` (reduced to 1px in high contrast)

### Card Content Wrapper (`.card-content-wrapper`)

- **Padding**: 1.5rem (24px) on all sides
- **Display**: flex
- **Flex Direction**: column
- **Flex**: 1 (fills available space)
- **Purpose**: Provides consistent internal spacing for all card content

### Card Header Row (`.card-header-row`)

- **Display**: flex
- **Justify Content**: space-between
- **Align Items**: center
- **Margin Bottom**: 1.5rem (24px)
- **Purpose**: Contains card title and action icons (minimize, maximize)

### Card Title (`.card-title`)

**CRITICAL: When a user requests a card, the title MUST be implemented exactly as it appears in the "Att göra" card template.**

#### Required Title Structure
```tsx
<h3 className="card-title">
  Card Title Text
  <span className="tooltip-wrapper">
    <i className="fa-solid fa-circle-info card-title-icon"></i>
    <Tooltip text="Description of what this card does" />
  </span>
</h3>
```

**ALWAYS include:**
1. The `<h3>` element with `className="card-title"`
2. The card title text
3. The tooltip wrapper span with `className="tooltip-wrapper"`
4. The Font Awesome info icon with `className="fa-solid fa-circle-info card-title-icon"`
5. The Tooltip component with descriptive text

**Optional: Dropdown Menu Title**
For cards with title dropdown menus (like "Att göra"):
```tsx
<h3 className="card-title">
  <span className="position-relative">
    <span className="cursor-pointer" onClick={() => setShowDropdown(!showDropdown)}>
      Card Title Text
    </span>
    {showDropdown && (
      <div className="card-dropdown">
        <div className="card-dropdown-item" onClick={() => { setShowDropdown(false); }}>
          Option 1
        </div>
        <div className="card-dropdown-item" onClick={() => { setShowDropdown(false); }}>
          Option 2
        </div>
      </div>
    )}
  </span>
  <span className="tooltip-wrapper">
    <i className="fa-solid fa-circle-info card-title-icon"></i>
    <Tooltip text="Description of what this card does" />
  </span>
</h3>
```

#### Default State
- **Font Family**: Source Sans Pro
- **Font Size**: 18px
- **Font Weight**: 600 (semi-bold)
- **Color**: `#200a58` (dark purple)
- **Margin**: 0
- **Display**: flex
- **Align Items**: center
- **Gap**: 8px (between title text and tooltip icon)

#### Dark Theme State
- **Color**: `#ffffff` (white)

#### High Contrast Theme State
- **Color**: `#ffff00` (yellow)

### Card Title Icon (`.card-title-icon`)

#### Default State
- **Font Size**: 14px
- **Color**: `#000000` (black)
- **Cursor**: help
- **Purpose**: Info icon for tooltips

#### Dark Theme State
- **Color**: `#ffffff` (white)

### Card Body (`.card-body`)

- **Padding**: 0
- **Purpose**: Container for main card content (DataGrids, forms, lists, etc.)

### Border Utility Classes

#### `.border-top-4`
- **Purpose**: Adds the signature 4px top border to cards
- **Default**: 4px solid `#efefef` (light gray)
- **Dark Theme**: 4px solid `#2b2b2b` (dark gray)
- **CRITICAL**: This class MUST be applied to all card containers

#### `.border-top-1`
- **Purpose**: Adds 1px top border for internal dividers
- **Default**: 1px solid `#efefef` (light gray)

### Card Features and Patterns

#### Standard Features (from "Att göra" template):
1. **Top Border Accent** - 4px colored border at top (REQUIRED)
2. **Header Row** - Title with tooltip and action icons
3. **Content Area** - Flexible body for any content type
4. **Action Icons** - Minimize and maximize/fullscreen controls
5. **Consistent Spacing** - 1.5rem padding throughout

#### Optional Features:
1. **Dropdown Menu** - Title can be clickable with dropdown options
2. **Fullscreen Mode** - `.card-fullscreen` class for fullscreen state
3. **Search Input** - Can include search functionality
4. **Alerts** - Can contain Alert components
5. **Data Tables** - DevExtreme DataGrid integration
6. **Lists** - Collapsible list items with badges

### Card Fullscreen Mode (`.card-fullscreen`)

When a card is in fullscreen mode:
- **Position**: fixed
- **Top/Left/Right**: 0
- **Bottom**: 0
- **Z-Index**: 1000
- **Width**: 100vw
- **Height**: 100vh
- **Margin**: 0

### CRITICAL: Card Design Specifications
- **ALWAYS** follow this exact card structure and styling
- **NEVER** deviate from the specified measurements and colors
- **ALL** cards must have the 4px top border (`.border-top-4` class) and 1px borders on other sides
- **ALL** cards must use `.card-container`, `.card-content-wrapper`, `.card-header-row`, `.card-title`, and `.card-body` classes

### Card Structure Requirements

#### Container (REQUIRED)
- **Background**: `#ffffff` (white)
- **Border**: 1px solid `#efefef` (light gray) on left, right, bottom
- **Top Border**: 4px solid `#efefef` (light gray) via `.border-top-4` class
- **Border Radius**: **4px** (slightly rounded corners)
- **Box Shadow**: None (optional: can add subtle shadow if needed)

#### Top Border Accent
- **CRITICAL**: Every card must have a 5px top border accent
- **Height**: **5px**
- **Width**: Full width of card
- **Background**: `#efefef` (light gray)
- **Position**: Top edge of card, inside the border
- **Border Radius**: Inherit from parent (4px on top corners only)

#### Card Title
- **Font**: Source Sans Pro SemiBold (600), **24px**
- **Color**: `#333333` (dark gray)
- **Line Height**: Normal
- **Padding**: **16px horizontal** (left and right)
- **Margin**: None
- **Display**: Flex row, items centered
- **Gap**: 12px (if icon present, like question mark)

#### Content Area
- **Padding**: **16px horizontal** (left and right), **16px vertical** (top and bottom)
- **Gap**: **32px** between card title and card content sections
- **Background**: Transparent (inherits white from container)

### Layout Structure

```
┌─────────────────────────────────────┐ ← 1px #efefef border
│███████████████████████████████████│ ← 5px #efefef top accent
│                                     │
│  Card Title (24px, 16px padding)   │ ← Title section
│                                     │
│                                     │ ← 32px gap
│  Card Content (16px padding)       │ ← Content section
│                                     │
│                                     │
└─────────────────────────────────────┘ ← 4px border radius
```

### CSS Classes
Define these classes in `/styles/overrides.css`:

- `.card-container` - Main card wrapper
  - Background: `#ffffff`
  - Border: 1px solid `#efefef`
  - Border radius: 4px
  - Display: flex, flex-direction: column
  
- `.card-top-border` - 5px accent border at top
  - Height: 5px
  - Width: 100%
  - Background: `#efefef`
  - Border radius: 4px 4px 0 0 (top corners only)
  
- `.card-content-wrapper` - Content area wrapper
  - Padding: 16px (all sides)
  - Display: flex, flex-direction: column
  - Gap: 32px
  
- `.card-title` - Card title styling
  - Font: Source Sans Pro SemiBold (600)
  - Font size: 24px
  - Color: `#333333`
  - Padding: 0 (padding handled by wrapper)
  - Display: flex, align-items: center
  - Gap: 12px (for icons)

- `.card-body` - Card body content
  - Font: Source Sans Pro Regular (400)
  - Font size: 16px
  - Line height: 20px
  - Color: `#333333`

### Important Notes
- **NEVER** use Tailwind classes for cards
- **ALWAYS** use CSS classes defined in `/styles/overrides.css`
- **NEVER** use inline styles
- **ALWAYS** include the 5px top border accent
- **Top border** must be `#efefef`, not transparent or white
- **Border radius** must be exactly 4px
- **Card title** must be 24px Source Sans Pro SemiBold
- **Padding consistency**: 16px horizontal throughout
- **Gap between title and content**: Always 32px
- **Reference**: See `/src/imports/Cards-14-3572.tsx` for Figma card design reference

### Example Structure
```tsx
<div className="card-container">
  <div className="card-top-border"></div>
  <div className="card-content-wrapper">
    <h2 className="card-title">Card Title</h2>
    <div className="card-body">
      {/* Card content here */}
    </div>
  </div>
</div>
```

---

## CARD TITLE ICON SPACING
- **Question mark icon spacing**: 12px gap between card title text and the question mark icon
- **Implementation**: `.card-title` uses `display: flex; align-items: center; gap: 12px;`
- **Applies to**: All card headers with help/question mark icons

---

## TOOLTIP COMPONENT GUIDELINES

### CRITICAL: Tooltip Template - Lön Card Info Icon

**When a user requests a tooltip, ALWAYS use the black tooltip design from the info icon in the Lön card.**

The **Tooltip component** (`/src/app/components/Tooltip.tsx`) is the **STANDARD TOOLTIP TEMPLATE** for this application.

### Template Reference (Lön Card)

**Location**: `/src/app/components/SalaryCard.tsx` - Info icon tooltip on card title (line 28-31)

```tsx
import { Tooltip } from './Tooltip';

<span className="tooltip-wrapper">
  <i className="fa-solid fa-circle-info card-title-icon"></i>
  <Tooltip text="Översikt av din lön och utbetalningsdatum" />
</span>
```

### Tooltip Component Structure

**File**: `/src/app/components/Tooltip.tsx`

```tsx
import React from 'react';

interface TooltipProps {
  text: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ text }) => {
  return (
    <div className="tooltip-content">
      <p className="tooltip-text">{text}</p>
    </div>
  );
};
```

### Tooltip Styling (MANDATORY)

**All tooltips MUST have these exact styles** (defined in `/src/styles/overrides.css`):

#### Tooltip Container (`.tooltip-content`)
- **Background**: `#151515` (black)
- **Border Radius**: `4px`
- **Padding**: `4px 12px`
- **Position**: Absolute, appears above trigger element
- **Display**: Hidden by default, shown on hover
- **Box Shadow**: `0px 2px 4px rgba(0, 0, 0, 0.2)`
- **Z-index**: `10000` (appears above all content)

#### Tooltip Arrow (`.tooltip-content::after`)
- **Color**: `#151515` (black, matches background)
- **Position**: Centered below tooltip
- **Border Width**: `4px`
- **Triangle**: Points downward

#### Tooltip Text (`.tooltip-text`)
- **Font Family**: `'Source Sans Pro', sans-serif`
- **Font Size**: `14px`
- **Font Weight**: `400`
- **Line Height**: `17px`
- **Color**: `#ffffff` (white)
- **Text Align**: Center
- **Margin**: `0`

### Usage Guidelines

#### Wrapper Structure
- **ALWAYS** use `.tooltip-wrapper` class on the parent element
- **Wrapper Properties**: `position: relative; display: inline-flex;`
- **Trigger**: Any element inside the wrapper (icon, button, text)
- **Behavior**: Tooltip appears on hover

#### Complete Implementation Example
```tsx
<span className="tooltip-wrapper">
  <i className="fa-solid fa-circle-info card-title-icon"></i>
  <Tooltip text="Your helpful tooltip message here" />
</span>
```

#### With Button
```tsx
<span className="tooltip-wrapper">
  <Button
    text="Löneuppgifter"
    icon="fa-solid fa-external-link"
    className="dx-btn-outline"
  />
  <Tooltip text="Navigerar dig till löneuppgifter-modulen" />
</span>
```

### Important Rules

- ✅ **ALWAYS** use black background (`#151515`)
- ✅ **ALWAYS** use white text (`#ffffff`)
- ✅ **ALWAYS** include the downward-pointing arrow
- ✅ **ALWAYS** position tooltip above the trigger element
- ✅ **ALWAYS** use 700ms delay before showing tooltip (defined in CSS)
- ❌ **NEVER** use different colors (no light tooltips, no colored backgrounds)
- ❌ **NEVER** use different positioning (always top-centered)
- ❌ **NEVER** modify the font or sizing (always 14px Source Sans Pro)
- ❌ **NEVER** use standard browser tooltips (the `title` attribute on HTML elements)

### CRITICAL: No Standard Browser Tooltips

**NEVER use the HTML `title` attribute for tooltips.** The `title` attribute creates standard browser tooltips with default browser styling, which does NOT match our design system.

- ❌ **WRONG**: `<div title="Tooltip text">...</div>`
- ❌ **WRONG**: `<button title="Click me">...</button>`
- ❌ **WRONG**: `<input title="Help text" />`
- ✅ **CORRECT**: Always use the Tooltip component with `.tooltip-wrapper`

**Why this matters:**
- Browser tooltips use default system fonts and colors
- Browser tooltips cannot be styled to match our black tooltip design
- Browser tooltips break the visual consistency of the application

**When you need a tooltip:**
1. Use the Tooltip component from `/src/app/components/Tooltip.tsx`
2. Wrap the element in `.tooltip-wrapper`
3. This gives you the black tooltip design with white text

### Summary

**When user requests "add a tooltip":**
1. Use the Tooltip component from `/src/app/components/Tooltip.tsx`
2. Wrap trigger element in `.tooltip-wrapper`
3. Pass tooltip text via `text` prop
4. Styling is automatic via CSS (black background, white text, arrow)
5. Reference the Lön card info icon as the visual template

**Template**: Look exactly like the info icon tooltip in the Lön (Salary) card.

---

## CAROUSEL COMPONENT GUIDELINES

### CRITICAL: Standard Template Carousel

**When a user asks to add a carousel to the template, ALWAYS use this DevExtreme Gallery-based carousel implementation.**

The **Carousel component** (`/src/app/components/Carousel.tsx`) is the **STANDARD CAROUSEL TEMPLATE** for this application.

### Template Reference

**When a user requests a carousel**, implement it EXACTLY like this template:

```tsx
import React from 'react';
import Gallery from 'devextreme-react/gallery';

export const Carousel = () => {
  const galleryRef = React.useRef<Gallery>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const handlePrevious = () => {
    const newIndex = selectedIndex > 0 ? selectedIndex - 1 : slides.length - 1;
    setSelectedIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = selectedIndex < slides.length - 1 ? selectedIndex + 1 : 0;
    setSelectedIndex(newIndex);
  };

  const handleSelectionChanged = (e: any) => {
    if (e.component) {
      const newIndex = e.component.option('selectedIndex');
      setSelectedIndex(newIndex);
    }
  };

  return (
    <div className="carousel-wrapper position-relative">
      <Gallery
        ref={galleryRef}
        dataSource={slides}
        height="auto"
        slideshowDelay={30000}
        loop={true}
        showNavButtons={false}
        showIndicator={false}
        itemRender={renderSlide}
        onSelectionChanged={handleSelectionChanged}
        selectedIndex={selectedIndex}
      />
      <div className="carousel-controls">
        <button 
          onClick={handlePrevious}
          className="carousel-nav-btn carousel-nav-prev"
          aria-label="Previous slide"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <div className="carousel-indicators-spacer">
          {slides.map((slide, index) => (
            <span
              key={slide.id}
              className={`carousel-dot ${index === selectedIndex ? 'active' : ''}`}
            />
          ))}
        </div>
        <button 
          onClick={handleNext}
          className="carousel-nav-btn carousel-nav-next"
          aria-label="Next slide"
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};
```

### Carousel Features

#### DevExtreme Gallery Component
- **ALWAYS** use `import Gallery from 'devextreme-react/gallery';`
- **NEVER** use third-party carousel libraries (react-slick, swiper, etc.)
- **DevExtreme Gallery** provides the core slideshow functionality

#### Carousel Configuration
- **slideshowDelay**: `30000` (30 seconds auto-advance)
- **loop**: `true` (infinite loop)
- **showNavButtons**: `false` (use custom nav buttons)
- **showIndicator**: `false` (use custom dot indicators)
- **height**: `"auto"` (responsive height)

#### Custom Navigation Controls
- **Previous/Next Buttons**: Custom styled buttons with Font Awesome chevron icons
  - Previous: `fa-solid fa-chevron-left`
  - Next: `fa-solid fa-chevron-right`
- **Dot Indicators**: Custom dot pagination between nav buttons
- **Position**: Absolute positioned at bottom of carousel
- **Accessibility**: `aria-label` attributes on navigation buttons

#### Carousel Structure
```tsx
<div className="carousel-wrapper position-relative">
  {/* DevExtreme Gallery */}
  <Gallery {...props} />
  
  {/* Custom Controls */}
  <div className="carousel-controls">
    {/* Previous Button */}
    <button className="carousel-nav-btn carousel-nav-prev">
      <i className="fa-solid fa-chevron-left"></i>
    </button>
    
    {/* Dot Indicators */}
    <div className="carousel-indicators-spacer">
      {slides.map((slide, index) => (
        <span className={`carousel-dot ${index === selectedIndex ? 'active' : ''}`} />
      ))}
    </div>
    
    {/* Next Button */}
    <button className="carousel-nav-btn carousel-nav-next">
      <i className="fa-solid fa-chevron-right"></i>
    </button>
  </div>
</div>
```

#### Slide Content Structure
Each slide should follow this structure:

```tsx
const renderSlide = (item: CarouselSlide) => {
  return (
    <div className="position-relative bg-white rounded-0 overflow-hidden d-flex flex-column-reverse flex-md-row">
      {/* Text Area (Left) */}
      <div className="carousel-text-area">
        <div className="info-banner carousel-banner">
          <i className="fa-solid fa-circle-info"></i>
          <span className="info-banner-text">Information</span>
        </div>
        <h3 className="carousel-title">{item.title}</h3>
        <p className="text-foreground text-opacity-80 small mb-4 banner-text text-wrap">
          {item.description}
        </p>
      </div>
      
      {/* Image Area (Right) */}
      <div className="carousel-image-area">
        <img src={item.image} alt="Carousel slide" className="w-100 h-100 object-fit-cover" />
      </div>
    </div>
  );
};
```

### Carousel Data Structure

```tsx
interface CarouselSlide {
  id: number;
  title: string;
  description: string;
  link?: {
    text: string;
    url: string;
  };
  image: string;
}
```

### State Management
- **selectedIndex**: Track current slide index with `useState`
- **galleryRef**: Reference to Gallery component with `useRef`
- **Controlled component**: Sync selectedIndex between Gallery and custom controls

### Navigation Handlers
```tsx
const handlePrevious = () => {
  const newIndex = selectedIndex > 0 ? selectedIndex - 1 : slides.length - 1;
  setSelectedIndex(newIndex);
};

const handleNext = () => {
  const newIndex = selectedIndex < slides.length - 1 ? selectedIndex + 1 : 0;
  setSelectedIndex(newIndex);
};

const handleSelectionChanged = (e: any) => {
  if (e.component) {
    const newIndex = e.component.option('selectedIndex');
    setSelectedIndex(newIndex);
  }
};
```

### Carousel Styling Requirements

**ALL carousel styles must be defined in `/src/styles/overrides.css`:**

#### Carousel Wrapper
- **Position**: Relative container
- **Background**: White (`#ffffff`)
- **Border Radius**: 0 (square corners)

#### Navigation Buttons (`.carousel-nav-btn`)
- **Size**: 40px × 40px
- **Background**: Semi-transparent white or dark overlay
- **Border**: None
- **Icon**: Font Awesome chevron (14px)
- **Cursor**: Pointer
- **Hover State**: Increase opacity or change background

#### Dot Indicators (`.carousel-dot`)
- **Size**: 8px diameter circles
- **Background**: Gray (`#cccccc`) when inactive
- **Active State**: Primary color (`#5236ab`) when active
- **Gap**: 8px between dots
- **Cursor**: Pointer (if clickable)

#### Controls Container (`.carousel-controls`)
- **Position**: Absolute, bottom of carousel
- **Display**: Flex with space-between
- **Alignment**: Center aligned
- **Padding**: 16px

### Placement in Template
- **Position**: First component in MainContent
- **Full Width**: Carousel spans full content width
- **Margin**: Standard spacing below (gap-4 in flex container)

### When to Use This Carousel
- ✅ User asks: "Add a carousel"
- ✅ User asks: "Create a slideshow"
- ✅ User asks: "Add image slider"
- ✅ User asks: "Add banner carousel"
- ✅ Start page/dashboard carousels

### Carousel Best Practices
1. **Auto-advance**: 30-second delay for comfortable reading
2. **Infinite loop**: Seamless navigation experience
3. **Accessibility**: Include aria-labels on nav buttons
4. **Responsive**: Mobile-friendly with stacked layout
5. **Custom controls**: Consistent with design system
6. **State sync**: Keep selectedIndex synchronized

### Important Notes
- **NEVER** use react-slick, swiper, or other third-party carousel libraries
- **ALWAYS** use DevExtreme Gallery component
- **ALWAYS** include custom navigation controls (buttons + dots)
- **ALWAYS** set `showNavButtons={false}` and `showIndicator={false}` to hide default Gallery controls
- **ALWAYS** use Font Awesome icons for navigation
- **Reference**: See `/src/app/components/Carousel.tsx` for the complete implementation

---

## ALERT COMPONENT GUIDELINES

### Alert Structure
- **ALWAYS** use the custom Alert design exactly as defined below.
- **Purpose**: Display important messages to users (info, warning, error, success).
- **Component Structure**: Horizontal layout with icon, message text, and close button.

### Alert Variants
Alerts come in 4 variants, each with different colors:

1. **Info Alert**
   - Border Color: `#5236ab` (purple)
   - Icon Background: `#5236ab` (purple circle)
   - Icon: Info icon (i)
   - Use Case: General information, tips, non-critical updates

2. **Warning Alert**
   - Border Color: `#F59E0B` (orange)
   - Icon Background: `#F59E0B` (orange circle)
   - Icon: Warning icon (!)
   - Use Case: Caution messages, things to be aware of

3. **Error Alert**
   - Border Color: `#E31937` (red)
   - Icon Background: `#E31937` (red circle)
   - Icon: Error icon (X in circle)
   - Use Case: Errors, failures, critical issues

4. **Success Alert**
   - Border Color: `#10B981` (green)
   - Icon Background: `#10B981` (green circle)
   - Icon: Success icon (checkmark)
   - Use Case: Success messages, confirmations, completed actions

### Container Styling
- **Background**: White (`#ffffff`)
- **Border**: **NONE** - No border around the container
- **Left Border ONLY**: **4px solid** (accent border on left side only, color varies by variant)
  - **CRITICAL**: Only the left border should be visible, NOT a full border
  - Info: `border-left: 4px solid #5236ab`
  - Warning: `border-left: 4px solid #F59E0B`
  - Error: `border-left: 4px solid #E31937`
  - Success: `border-left: 4px solid #10B981`
- **Border Radius**: **0** (sharp square corners)
- **Box Shadow**: `0px 0px 4px 0px rgba(0, 0, 0, 0.25)`
- **Padding**: 20px left, 16px right, 16px top/bottom

### Layout
- **Display**: Flex row
- **Gap**: 16px between icon, message, and close button
- **Alignment**: Items start (top-aligned for multi-line messages)

### Icon Badge
- **Size**: 24px width, 24px height
- **Shape**: Circular (`border-radius: 100px` or `50%`)
- **Background**: Solid color (varies by variant)
- **Padding**: 2px
- **Icon Size**: 20x20px inside badge
- **Icon Color**: White (`#ffffff`)
- **Flex**: No shrink (`flex-shrink: 0`)

### Message Text
- **Font**: Source Sans Pro Regular (400), 16px
- **Color**: `#333333`
- **Line Height**: 20px
- **Flex**: Flex-grow to take available space (`flex: 1 0 0`)
- **Multi-line**: Should wrap naturally for longer messages

### Close Button
- **Size**: 24px width, 24px height
- **Icon Size**: 14x14px (positioned with 20.83% inset = ~5px padding)
- **Icon Color**: `#151515` (dark gray/black)
- **Background**: Transparent (no background)
- **Border**: None
- **Cursor**: Pointer
- **Flex**: No shrink (`flex-shrink: 0`)
- **Interactive**: Should be clickable to dismiss alert

### SVG Icon Paths
Use these exact SVG paths for alert icons:

**Info Icon (i):**
```
M9.99563 6C9.58188 6 9.22917 5.85271 8.9375 5.55812C8.64583 5.26354 8.5 4.90937 8.5 4.49562C8.5 4.08187 8.64729 3.72917 8.94187 3.4375C9.23646 3.14583 9.59062 3 10.0044 3C10.4181 3 10.7708 3.14729 11.0625 3.44188C11.3542 3.73646 11.5 4.09063 11.5 4.50438C11.5 4.91813 11.3527 5.27083 11.0581 5.5625C10.7635 5.85417 10.4094 6 9.99563 6ZM8.75 17V8H11.25V17H8.75Z
```

**Warning Icon (!):**
```
M9 12V3H11V12H9ZM9 17V15H11V17H9Z
```

**Error Icon (X in circle):**
```
M15 6.00714L13.9929 5L10 8.99286L6.00714 5L5 6.00714L8.99286 10L5 13.9929L6.00714 15L10 11.0071L13.9929 15L15 13.9929L11.0071 10L15 6.00714Z
```

**Success Icon (checkmark):**
```
M8.13132 12.8896L5.04946 9.78001L4 10.8315L8.13132 15L17 6.05145L15.9579 5L8.13132 12.8896Z
```

**Close Button Icon (X):**
```
M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z
```

### CSS Classes
Define these classes in `/styles/overrides.css`:

- `.alert-container` - Base alert container
- `.alert-info` - Info variant styling
- `.alert-warning` - Warning variant styling
- `.alert-error` - Error variant styling
- `.alert-success` - Success variant styling
- `.alert-icon-badge` - Icon badge circle
- `.alert-message` - Message text
- `.alert-close-btn` - Close button

### Important Notes
- **NEVER** use Tailwind classes for alerts
- **ALWAYS** use CSS classes defined in `/styles/overrides.css`
- **NEVER** use inline styles
- **ALWAYS** include the 4px left border accent
- **ALWAYS** set border-radius to 0 (sharp corners)
- **ALWAYS** include the box shadow for depth
- **Close button** should dismiss the alert (add onClick handler)
- **Responsive**: Should work well on mobile (stack if needed)
- **Accessibility**: Include proper ARIA labels for icons and close button
- **Reference**: See `/src/imports/Alerts.tsx` for Figma design reference (but convert to CSS classes)

### Example Usage
```tsx
<div className="alert-container alert-info">
  <div className="alert-icon-badge">
    {/* SVG icon here */}
  </div>
  <p className="alert-message">
    Hello! The weather today is looking groovy.
  </p>
  <button className="alert-close-btn" aria-label="Close alert">
    {/* Close icon SVG */}
  </button>
</div>
```

---

## INPUT FIELD COMPONENT GUIDELINES

### CRITICAL: Input Field Design Specifications
- **ALWAYS** follow this exact input field styling
- **NEVER** deviate from the specified border, text, and radius values
- **ALL** input fields (except header search) must use these specifications

### Input Field Styling

#### Default State
- **Border**: 1px solid `#a8a8a8` (gray)
- **Border Radius**: **0** (sharp square corners, no rounded borders)
- **Text Color**: `#333333` (dark gray)
- **Background**: `#ffffff` (white)
- **Font**: Source Sans Pro Regular (400), 16px
- **Font Family**: `'Source Sans Pro', sans-serif`
- **Placeholder Color**: `#666666` (medium gray)

#### Focus State
- **Border Color**: `#a8a8a8` (remains gray, no color change)
- **Outline**: None (removed)
- **All other properties**: Remain the same as default state

#### Input Icons
- **Icon Color**: `#333333` (dark gray, matches text color)
- **Icon Size**: 14px
- **Position**: Absolute positioning (left: 12px, vertically centered)

### Applies To
- ✅ All `<input type="text">` (except `.search-input`)
- ✅ All `<input type="email">`
- ✅ All `<input type="password">`
- ✅ All `<input type="number">`
- ✅ All `<input type="tel">`
- ✅ All `<input type="url">`
- ✅ All `<textarea>` elements
- ✅ All `<select>` elements
- ✅ `.form-control-custom` class

### Exception: Header Search Input
- **The search input in the header (`.search-input`)** is exempt from these rules
- Header search maintains its unique purple underline styling
- Border: None (only bottom border)
- Bottom Border: 2px solid `#5236ab` (purple)

### CSS Classes
Define these classes in `/styles/overrides.css`:

- General input styling (all input types except `.search-input`)
- `.form-control-custom` - Custom form control wrapper
- `.input-icon` - Icon positioning inside input

### Important Notes
- **NEVER** use Tailwind classes for inputs
- **ALWAYS** use CSS classes defined in `/styles/overrides.css`
- **NEVER** use inline styles
- **ALWAYS** set border-radius to 0 (sharp corners)
- **Border color** must be `#a8a8a8`, not `#efefef`
- **Text color** must be `#333333`, not lighter grays
- **Icon color** must match text color (`#333333`)
- **Input sizes**: Maintain existing padding and dimensions (do not change)
- **Reference**: See `/src/imports/FormsInputFieldOutlined-20-77.tsx` for Figma design reference

### Example CSS Implementation
```css
input[type="text"]:not(.search-input),
input[type="email"]:not(.search-input),
textarea,
select {
  border: 1px solid #a8a8a8;
  border-radius: 0;
  color: #333333;
  font-family: 'Source Sans Pro', sans-serif;
  font-size: 16px;
  background-color: #ffffff;
}

input[type="text"]:not(.search-input):focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: #a8a8a8;
}
```

---

## Technology Stack

This application is built using:
- **React** - UI framework
- **DevExtreme** - For all data grids, forms, and complex UI components
- **Bootstrap** - CSS framework for layout, utilities, buttons, and basic form inputs
- **Native HTML Elements** - Buttons with Bootstrap styling

### Component Technology Mapping

**Use DevExtreme for:**
- ✅ DataGrid - All data tables with sorting, filtering, paging
- ✅ Form - Complex form layouts with validation
- ✅ SelectBox - Dropdown selections
- ✅ DateBox - Date pickers
- ✅ TextBox - Text inputs (when using DevExtreme forms)
- ✅ Chart - **ALL charts and graphs** (Line, Area, Bar, Stacked Area, etc.)
- ✅ PieChart - **ALL pie and donut charts**
- ✅ BarChart - **ALL bar charts**
- ✅ Any other complex UI components

**Use Bootstrap/Native HTML for:**
- ✅ Buttons - Native `<button>` elements with Bootstrap button classes
- ✅ Simple form inputs - Native `<input>`, `<select>`, `<textarea>` with Bootstrap form classes (outside DevExtreme forms)
- ✅ Cards - Native `<div>` elements with Bootstrap card classes
- ✅ Layout - Bootstrap grid system and utility classes

---

## DATA TABLE DESIGN SPECIFICATIONS

### CRITICAL: DevExtreme DataGrid Header Border
- **Header Bottom Border**: **ALWAYS 2px solid `#5236ab`** (purple) - Separates header from data rows
- **Header Top Border**: None - No border above the header
- **NEVER** use 1px for the header bottom border - it must be 2px
- **Row Borders**: 1px solid `#efefef` (light gray) - this is correct
- **Header Height**: 34px
- **Header Background**: `#ffffff` (white)
- **Header Text**: Source Sans Pro SemiBold (600), 14px, `#333333`

### CSS Implementation
The following CSS classes in `/styles/overrides.css` control the header border:
- `.dx-datagrid-headers` - Header row container (2px bottom border)
  - `border-bottom: 2px solid #5236ab !important;`
- `.dx-datagrid-headers .dx-datagrid-table` - Header table (2px bottom border)
  - `border-bottom: 2px solid #5236ab !important;`
- `.dx-datagrid-headers .dx-datagrid-content` - Header content (2px bottom border)
  - `border-bottom: 2px solid #5236ab !important;`
- `.dx-datagrid-headers .dx-datagrid-table .dx-row` - Header row (2px bottom border)
  - `border-bottom: 2px solid #5236ab !important;`
- `.dx-datagrid-headers .dx-datagrid-table .dx-row > td` - Header cells (2px bottom border)

### Important Notes
- **ALWAYS** ensure header bottom border is **2px solid #5236ab**
- **ALWAYS** use `!important` flag to override DevExtreme defaults
- The 2px bottom border serves as a visual accent, similar to card top borders
- **Row borders** should remain 1px - only header is 2px
- **Reference**: Data Overview card shows correct 2px header border

---

## DARK MODE STYLING GUIDELINES

### CRITICAL: Dark Mode Implementation
- **ALWAYS** provide dark mode styling for ALL components
- **ALL** dark mode styles must use the `[data-theme="dark"]` selector
- **NEVER** use inline styles - all dark mode styling in `/styles/overrides.css`
- **ALWAYS** maintain consistent color scheme across all components in dark mode

### Dark Mode Color Palette

#### Page Background
- **Background Color**: `#1e1e1e` (very dark gray, almost black)
- **Use**: Main page background, body background

#### Component Backgrounds
- **Card Background**: `#2b2b2b` (dark gray)
  - Use for: Cards, modals, panels, carousel text areas
- **Header Background**: `#2b2b2b` (same as card background - MUST MATCH)
  - Use for: Main header, navigation bars
- **Secondary Background**: `#121212` (darker gray)
  - Use for: Page background, input fields, person search container
- **Alert Background**: `#3a3a3a` (medium dark gray)
  - Use for: Alert components

#### Text Colors
- **Primary Text**: `#ffffff` (white)
  - Use for: All body text, card titles, headings, carousel titles, nav buttons, icons
- **Secondary Text**: `#e0e0e0` (light gray)
  - Use for: Alert messages, secondary information, accordion content
- **Muted Text**: `#a3a3a3` (medium gray)
  - Use for: Placeholders, icons, hints

#### Border Colors
- **Primary Border**: `#3d3d3d` (dark gray)
  - Use for: Card borders, card top borders, dividers, table row borders
- **Input Border**: `#333333` (darker gray)
  - Use for: Input fields, form controls, person search container
- **Header Border**: `#555555` (medium-dark gray)
  - Use for: Header bottom border, subtle separators
- **Focus Border**: `#555555` (medium-dark gray)
  - Use for: Input focus states

#### Button Colors (Dark Mode Secondary Button)
- **Background**: `#121212` (page background)
- **Text Color**: `#ffffff` (white)
- **Border**: `#333333` (dark gray)
- **Hover Background**: `#2b2b2b` (card background)

#### Button Colors (Dark Mode Outline Button)
- **Background**: `#4d4d4d` (medium gray)
- **Text Color**: `#ffffff` (white)
- **Border**: `#666666` (light medium gray)
- **Hover Background**: `#5a5a5a`
- **Hover Border**: `#777777`
- **Focus Background**: `#666666`
- **Focus Border**: `#888888`
- **Active Background**: `#3a3a3a`
- **Active Border**: `#555555`
- **Disabled Background**: `#2b2b2b`
- **Disabled Text**: `rgba(255, 255, 255, 0.45)`
- **Disabled Border**: `#333333`

#### DataGrid/Table Colors (Dark Mode)
- **Header Background**: `#2b2b2b` (card bg color)
- **Header Text**: `#ffffff` (white)
- **Header Border Bottom**: `2px solid #5236ab` (purple - keep same as light mode)
- **Row Background**: `#2b2b2b` (card bg color)
- **Row Text**: `#ffffff` (white)
- **Zebra/Alternating Row**: `#242424` (slightly darker than card bg)
- **Row Border**: `#3d3d3d` (matching card borders)
- **Hover Background**: `#3d3d3d` (medium dark gray)
- **Pagination Background**: `#2b2b2b` (card bg color)
- **Pagination Text**: `#ffffff` (white)

#### Accordion Colors (Dark Mode)
- **Background**: `#2b2b2b` (card background)
- **Border**: `#3d3d3d` (card border)
- **Title Color**: `#ffffff` (white)
- **Content Color**: `#e0e0e0` (light gray)
- **Icon Color**: `#ffffff` (white) - **CRITICAL: Icons must be white, not dark**

#### Carousel Colors (Dark Mode)
- **Text Area Background**: `#2b2b2b` (same as card background)
- **Title Color**: `#ffffff` (white)
- **Controls Background**: `rgba(43, 43, 43, 0.8)` (card bg with opacity)
- **Navigation Buttons**: `#ffffff` (white) - **CRITICAL: Arrow icons must be white**
- **Pagination Dots**: `#ffffff` (white) - **CRITICAL: All dots must be white**
- **Pagination Dots Active**: `#ffffff` (white) - **CRITICAL: Active dot must be white**

#### Input Field Colors (Dark Mode)
- **Background**: `#121212` (page background - black)
- **Border**: `#333333` (dark gray)
- **Text**: `#ffffff` (white)
- **Placeholder**: `#a3a3a3` (medium gray)
- **Focus Border**: `#555555` (slightly lighter gray)
- **Icon Color**: `#a3a3a3` (medium gray)

#### Search Input (Header) Colors (Dark Mode)
- **Background**: `transparent` - **CRITICAL: Must be transparent, not #3a3a3a**
- **Text**: `#ffffff` (white)
- **Placeholder**: `#a3a3a3` (medium gray)
- **Icon**: `#a3a3a3` (medium gray)
- **Border Bottom**: `2px solid #5236ab` (purple - keep same as light mode)

#### Person Search Component (Dark Mode)
- **Container Background**: `#121212` (page background - black)
- **Container Border**: `#333333` (dark gray)
- **Button Hover**: `#2b2b2b` (card background)
- **Content Border**: `#333333` (dark gray)
- **Text Color**: `#ffffff` (white)

#### Add User Button (Dark Mode)
- **Background**: `#121212` (page background - matches secondary buttons)
- **Border**: `1px solid #333333` (dark gray)
- **Text/Icon Color**: `#ffffff` (white)
- **Hover Background**: `#2b2b2b` (card background)
- **Border Radius**: `0` (sharp square corners - no rounding)

### Dark Mode Selector Usage

#### CSS Syntax
```css
/* Light mode (default) */
.component {
  background-color: #ffffff;
  color: #333333;
}

/* Dark mode */
[data-theme="dark"] .component {
  background-color: #2b2b2b;
  color: #ffffff;
}
```

### Component-Specific Dark Mode Rules

#### Cards
- Background: `#2b2b2b`
- Border: `#3d3d3d`
- Top Border: `#3d3d3d` (same as border)
- Title Color: `#ffffff`
- Icon Color: `#a3a3a3`

#### Header
- Background: `#2b2b2b` - **CRITICAL: Must match card background**
- Border: `#555555`
- Box Shadow: `0 1px 3px rgba(0, 0, 0, 0.3)`
- Nav Button Text: `#ffffff`
- Nav Button Hover: `#4a4a4a`
- Icon Button Color: `#ffffff`
- Separator: `#999999`

#### Search Input (Header)
- Background: `transparent` - **CRITICAL: Must be transparent**
- Text: `#ffffff`
- Placeholder: `#a3a3a3`
- Icon: `#a3a3a3`
- Border Bottom: `2px solid #5236ab` (keep purple)

#### Toggle Switch (Dark Mode)
- Background: `#555555`
- Active Background: `#5236ab` (keep purple)

#### Alerts
- Background: `#3a3a3a`
- Box Shadow: `0px 0px 4px 0px rgba(0, 0, 0, 0.5)`
- Message Text: `#e0e0e0`
- Close Button: `#e0e0e0`

#### Accordion
- Background: `#2b2b2b`
- Border: `#3d3d3d`
- Expanded Border: `#3d3d3d` (same as regular border)
- Collapsed Border: `#3d3d3d` (same as regular border)
- Title: `#ffffff`
- Content: `#e0e0e0`
- Icon: `#ffffff` - **CRITICAL: +/- icons must be white**

#### Carousel
- Text Area Background: `#2b2b2b`
- Title: `#ffffff`
- Controls Background: `rgba(43, 43, 43, 0.8)`
- Navigation Buttons: `#ffffff` - **CRITICAL: Arrow icons must be white**
- Pagination Dots (inactive): `#ffffff` - **CRITICAL: Must be white**
- Pagination Dots (active): `#ffffff` - **CRITICAL: Must be white**

### Global CSS Variables (Dark Mode)
Define these in `/styles/globals.css`:

```css
[data-theme="dark"] {
  --primary: #7c5cdb;
  --secondary: #121212;
  --foreground: #ffffff;
  --muted-foreground: #a3a3a3;
  --background: #1e1e1e;
  --border: #333333;
  --card-border: #333333;
}
```

### Important Dark Mode Rules
1. **NEVER** use inline styles for dark mode
2. **ALWAYS** use `[data-theme="dark"]` selector
3. **ALL** dark mode styles in `/styles/overrides.css`
4. **Icon colors** must be white (`#ffffff`) for accordion, carousel, and navigation
5. **Header background** must match card background (`#2b2b2b`)
6. **Search input** background must be transparent
7. **Person search container** must use page background (`#121212`)
8. **Border radius** must be `0` for all buttons (no rounding)
9. **Pagination dots** and **carousel arrows** must be white
10. **All text** must be white or light gray for readability

---

## DROPDOWN DESIGN GUIDELINES

### Dropdown Visual Design Standards
All dropdown/select menus in the application must follow this exact visual design:

**Background and Shadow:**
- Background color: `#f2f1f9` (light lavender)
- Dark mode background: `#2b2b2b`
- Border radius: `4px`
- Shadow: `0px 2px 6px 2px rgba(0,0,0,0.15)`

**Dropdown Structure:**
- Each dropdown item has padding: `12px` horizontal, `8px` vertical
- Section headers are **bold** (font-weight: 700)
- Regular options have normal weight
- Options can have two text lines:
  - **Main text**: 16px, color `#333` (light mode) / `#f5f5f5` (dark mode)
  - **Subtitle text**: 14px, color `#5c5c5c` (light mode) / `#a8a8a8` (dark mode)

**Scrollbar:**
- Custom scrollbar on right side
- Scrollbar color: `#c0c0c0` (light mode) / `#555555` (dark mode)
- Width: `5px`
- Border radius: `5px`
- Position: `8px` from top, right, and bottom

**Hover States:**
- Hover background: `rgba(82, 54, 171, 0.1)` (light purple tint)
- Dark mode hover: `rgba(82, 54, 171, 0.2)`

**CSS Class Names:**
- `.search-dropdown` - Main dropdown container
- `.search-dropdown-item` - Individual dropdown items
- `.search-dropdown-section` - Section header items
- `.search-dropdown-option` - Regular option items
- `.search-dropdown-subtitle` - Subtitle text in options

### Implementation Notes:
- **NO inline styles** - All styling must be in `/styles/overrides.css`
- **NO Tailwind classes** - Use CSS classes only
- Follow the exact color scheme and spacing specified above
- Ensure proper dark mode support for all dropdown elements

---

## ACCORDION COMPONENT

### When to Use Accordions
Accordions are versatile components that can be placed in two ways:
- ✅ **Directly on page background** - Accordions have self-contained styling and can sit directly on the grey page background (`var(--secondary)`) without a card wrapper
- ✅ **Inside cards** - Accordions can also be placed inside card components when design requires containment

**Key Rule**: Unlike DataGrid components which MUST be in cards, accordions are flexible and do NOT require a card wrapper.

### Accordion Placement Examples
```tsx
// Direct placement on page (no card needed)
<div className="w-100">
  <Accordion />
</div>

// Inside a card (optional)
<div className="w-100">
  <FAQCard>  {/* Card contains accordion */}
    <Accordion />
  </FAQCard>
</div>
```

### Accordion Structure & Implementation

#### Basic Accordion Component Structure
```tsx
import React, { useState } from 'react';

const SECTIONS = [
  { 
    id: '1', 
    title: 'Section header 1',
    content: <p>Content for section 1</p>
  },
  { 
    id: '2', 
    title: 'Section header 2',
    content: <p>Content for section 2</p>
  },
];

function PlusIcon() {
  return (
    <div className="accordion-icon">
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
        <path d="M11 13H5V11H11V5H13V11H19V13H13V19H11V13Z" fill="url(#gradient_plus)" className="light-mode-path" />
        <path d="M11 13H5V11H11V5H13V11H19V13H13V19H11V13Z" fill="white" className="dark-mode-path" />
        <defs>
          <linearGradient id="gradient_plus" x1="5" y1="12" x2="19" y2="12" gradientUnits="userSpaceOnUse">
            <stop offset="0.26" stopColor="#5236AB" />
            <stop offset="0.66" stopColor="#E121B4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function MinusIcon() {
  return (
    <div className="accordion-icon">
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
        <path d="M5 13V11H19V13H5Z" fill="url(#gradient_minus)" className="light-mode-path" />
        <path d="M5 13V11H19V13H5Z" fill="white" className="dark-mode-path" />
        <defs>
          <linearGradient id="gradient_minus" x1="5" y1="12" x2="19" y2="12" gradientUnits="userSpaceOnUse">
            <stop offset="0.26" stopColor="#5236AB" />
            <stop offset="0.66" stopColor="#E121B4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export function Accordion() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="d-flex flex-column w-100">
      {SECTIONS.map((section) => {
        const isExpanded = expandedId === section.id;
        return (
          <div 
            key={section.id} 
            className={`accordion-section ${isExpanded ? 'expanded' : 'collapsed'}`}
          >
            <button 
              className="accordion-header" 
              onClick={() => toggleSection(section.id)}
              type="button"
              aria-expanded={isExpanded}
            >
              <span className="accordion-title">{section.title}</span>
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

### Grey Background Container for Accordions

When placing accordions inside a card or container, use the `accordion-container-bg` class to show grey background in the gaps between expanded accordion sections:

```tsx
<div className="card-body">
  <div className="d-flex flex-column w-100 accordion-container-bg">
    {/* Accordion sections go here */}
  </div>
</div>
```

**How it works:**
- The container has `background-color: var(--secondary)` (grey: #f6f8f9)
- Expanded accordions have `margin: 10px 0`, creating vertical gaps
- The grey background shows through these gaps between expanded sections
- **NO padding** on the container - grey only appears in the gaps, not around borders

### Accordion Icons

**CRITICAL**: Accordions MUST use custom gradient SVG icons, NOT Font Awesome icons.

#### Icon Requirements:
- **Collapsed state**: Use `<PlusIcon />` (+ plus icon with gradient)
- **Expanded state**: Use `<MinusIcon />` (- minus icon with gradient)
- **Icon size**: 24px × 24px
- **Gradient colors**: 
  - Stop 1 (26%): `#5236AB` (primary purple)
  - Stop 2 (66%): `#E121B4` (pink)
- **Light mode**: Use gradient fill (`.light-mode-path`)
- **Dark mode**: Use white fill (`.dark-mode-path`)

**NEVER use Font Awesome icons for accordions** - always use the custom gradient SVG icons shown in the implementation above.

### Accordion States & Styling

#### Collapsed State (`.accordion-section.collapsed`)
- **Background**: `var(--background)` (white)
- **Border**: 1px solid `#efefef` (light grey)
- **Border radius**: 4px
- **Margin**: 0 (no margin - sections are flush)
- **Icon**: Plus icon (+)

#### Expanded State (`.accordion-section.expanded`)
- **Background**: `var(--background)` (white)
- **Border**: 1px solid `#cbc3e6` (light purple)
- **Border radius**: 4px
- **Margin**: `10px 0` (vertical margin creates gaps)
- **Icon**: Minus icon (-)
- **Transition**: Smooth border color and margin transition (0.2s ease-in-out)

#### Accordion Header (`.accordion-header`)
- **Padding**: 1rem
- **Background**: `var(--background)` (white)
- **Display**: Flex with space-between alignment
- **Cursor**: Pointer
- **Border**: None
- **Text alignment**: Left
- **Font**: Source Sans Pro, 18px, weight 700 (bold)
- **Color**: `#200a58` (dark purple)

#### Accordion Content (`.accordion-content`)
- **Padding**: `0 1rem 1rem 1rem` (no top padding)
- **Color**: `#333333` (text color)
- **Font size**: 16px
- **Line height**: 1.5
- **List styles**:
  - `<ul>` lists: Disc bullets, 1.5rem left padding
  - `<ol>` lists: Decimal numbers, 1.5rem left padding
  - `<li>` items: 1rem bottom margin
  - `<p>` paragraphs: 1rem bottom margin

### Required CSS Classes

All accordion styling must be in `/src/styles/overrides.css`:

```css
/* ========== ACCORDION COMPONENT ========== */
.accordion-section {
  background-color: var(--background);
  border-radius: 4px;
  overflow: hidden;
  margin: 0;
  border: 1px solid var(--border);
  transition: all 0.2s ease-in-out;
}

.accordion-section.expanded {
  border-color: #cbc3e6;
  margin: 10px 0;
}

.accordion-section.collapsed {
  border-color: #efefef;
}

.accordion-header {
  padding: 1rem;
  background-color: var(--background);
  border: none;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s ease;
}

.accordion-header:hover {
  background-color: #f9f9f9;
}

.accordion-title {
  font-size: 18px;
  font-weight: 700;
  color: #200a58;
  font-family: var(--font-family-base);
  line-height: normal;
}

.accordion-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.accordion-content {
  padding: 0 1rem 1rem 1rem;
  color: #333333;
  font-size: 16px;
  line-height: 1.5;
}

.accordion-content p {
  margin-bottom: 1rem;
}

.accordion-content ul {
  list-style-type: disc;
  padding-left: 1.5rem;
  margin-bottom: 0;
}

.accordion-content ol {
  list-style-type: decimal;
  padding-left: 1.5rem;
  margin-bottom: 0;
}

.accordion-content li {
  margin-bottom: 1rem;
}

/* Accordion container with grey background */
.accordion-container-bg {
  background-color: var(--secondary);
}

/* Show/hide icon paths based on theme */
.light-mode-path {
  display: block;
}

.dark-mode-path {
  display: none;
}

[data-theme="dark"] .light-mode-path {
  display: none;
}

[data-theme="dark"] .dark-mode-path {
  display: block;
}
```

### Dark Mode Support

Dark mode styling for accordions (in `/src/styles/overrides.css`):

```css
[data-theme="dark"] .accordion-section {
  background-color: #1a1a1a;
  border-color: #3a3a3a;
}

[data-theme="dark"] .accordion-section.expanded {
  border-color: #5236ab;
}

[data-theme="dark"] .accordion-section.collapsed {
  border-color: #3a3a3a;
}

[data-theme="dark"] .accordion-header {
  background-color: #1a1a1a;
}

[data-theme="dark"] .accordion-header:hover {
  background-color: #2a2a2a;
}

[data-theme="dark"] .accordion-title {
  color: #ffffff;
}

[data-theme="dark"] .accordion-content {
  color: #f5f5f5;
}
```

### High Contrast Theme Support

High contrast styling for accordions (in `/src/styles/high-contrast.css`):

```css
[data-theme="high-contrast"] .accordion-section {
  background-color: #000000 !important;
  border: 2px solid #ffffff !important;
}

[data-theme="high-contrast"] .accordion-section.expanded {
  border-color: #ffff00 !important;
}

[data-theme="high-contrast"] .accordion-section.collapsed {
  border-color: #ffffff !important;
}

[data-theme="high-contrast"] .accordion-header {
  background-color: #000000 !important;
}

[data-theme="high-contrast"] .accordion-title {
  color: #ffffff !important;
}

[data-theme="high-contrast"] .accordion-content {
  color: #ffffff !important;
}
```

### Accordion Behavior

- **Single expand**: Only one section can be expanded at a time
- **Toggle**: Clicking an expanded section collapses it
- **Icon transition**: Icon changes from + to - on expand
- **Smooth animation**: Border color and margin transition (0.2s)
- **Hover feedback**: Header background changes on hover
- **Keyboard accessible**: Use `<button>` with proper ARIA attributes

### Accordion Usage Guidelines

#### When to Use Accordions
- ✅ FAQ sections
- ✅ Collapsible content sections
- ✅ Settings or configuration panels
- ✅ Step-by-step guides
- ✅ Policy or documentation pages

#### When NOT to Use Accordions
- ❌ For primary navigation (use header menu instead)
- ❌ For form sections (use proper form layout)
- ❌ For data tables (use DataGrid component)
- ❌ When all content should be visible at once

### Implementation Checklist

When creating an accordion:
- [ ] Use custom gradient SVG icons (NOT Font Awesome)
- [ ] Include both PlusIcon and MinusIcon components
- [ ] Apply `.accordion-section`, `.expanded`, and `.collapsed` classes
- [ ] Use `accordion-container-bg` class when placing in cards
- [ ] Ensure unique gradient IDs if multiple accordions on same page
- [ ] Add proper ARIA attributes (`aria-expanded`)
- [ ] Test in light mode, dark mode, and high contrast mode
- [ ] Verify grey background appears only in gaps, not around borders

### Multiple Accordions on Same Page

If you have multiple accordion components on the same page, ensure unique gradient IDs:

```tsx
// First accordion
<linearGradient id="gradient_plus_1" ...>
<linearGradient id="gradient_minus_1" ...>

// Second accordion
<linearGradient id="gradient_plus_2" ...>
<linearGradient id="gradient_minus_2" ...>
```

---

## TOOLTIP GUIDELINES

### Tooltip Design and Implementation

**CRITICAL: ALL tooltips must follow the same design as the info icon tooltip in the Lön (Salary) card**

#### Tooltip Component Reference
- **Template**: The tooltip in `/src/app/components/SalaryCard.tsx` is the **STANDARD TOOLTIP TEMPLATE**
- **Component**: Use `/src/app/components/Tooltip.tsx` for all tooltip implementations
- **Wrapper Class**: `.tooltip-wrapper` - Position relative container
- **Content Class**: `.tooltip-content` - The actual tooltip display

#### Tooltip Visual Design (Mandatory)
- **Background Color**: `#151515` (black) - **NEVER** change this color
- **Text Color**: `#ffffff` (white)
- **Border Radius**: `4px`
- **Padding**: `4px 12px`
- **Font Family**: `'Source Sans Pro', sans-serif` or `'latoweb', sans-serif`
- **Font Size**: `14px`
- **Font Weight**: `400` (regular)
- **Line Height**: `17px`
- **Box Shadow**: `0px 2px 4px rgba(0, 0, 0, 0.2)`
- **Arrow**: Down-pointing triangle using CSS `::after` pseudo-element
  - **Arrow Color**: `#151515` (matches background)
  - **Arrow Size**: `4px` border width

#### Tooltip Behavior
- **Trigger**: Appears on hover over the `.tooltip-wrapper` element
- **Position**: Above the parent element (`bottom: calc(100% + 8px)`)
- **Alignment**: Centered horizontally (`left: 50%`, `transform: translateX(-50%)`)
- **Display**: Hidden by default, shown on hover
- **Z-Index**: `10000` (appears above all other content)
- **White Space**: `nowrap` (single line, no wrapping)

#### Implementation Example
```tsx
import { Tooltip } from './Tooltip';

<span className="tooltip-wrapper">
  <i className="fa-solid fa-circle-info card-title-icon"></i>
  <Tooltip text="Your tooltip text here" />
</span>
```

#### CSS Structure (Already Defined in `/src/styles/overrides.css`)
```css
.tooltip-wrapper {
  position: relative;
  display: inline-flex;
}

.tooltip-content {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background-color: #151515;
  border-radius: 4px;
  padding: 4px 12px;
  display: none;
  white-space: nowrap;
  z-index: 10000;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
}

.tooltip-content::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 4px;
  border-style: solid;
  border-color: #151515 transparent transparent transparent;
}

.tooltip-wrapper:hover .tooltip-content {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

#### When User Requests a Tooltip
1. **ALWAYS** use the Tooltip component from `/src/app/components/Tooltip.tsx`
2. **ALWAYS** use black background (`#151515`) - no exceptions
3. **ALWAYS** wrap the trigger element in `.tooltip-wrapper`
4. **ALWAYS** follow the exact same visual design as the Lön card info icon tooltip
5. **NEVER** create custom tooltip styles or colors
6. **NEVER** use third-party tooltip libraries

#### Common Use Cases
- **Info icons**: `<i className="fa-solid fa-circle-info">` with tooltip
- **Input fields**: Wrap input in tooltip-wrapper to show help text on hover
- **Buttons**: Add tooltips to icon-only buttons for context
- **Labels**: Add tooltips to complex field labels for clarification

---

## Technology Stack

This application is built using:
- **React** - UI framework
- **DevExtreme** - For all data grids, forms, and complex UI components
- **Bootstrap** - CSS framework for layout, utilities, buttons, and basic form inputs
- **Native HTML Elements** - Buttons with Bootstrap styling

### Component Technology Mapping

**Use DevExtreme for:**
- ✅ DataGrid - All data tables with sorting, filtering, paging
- ✅ Form - Complex form layouts with validation
- ✅ SelectBox - Dropdown selections
- ✅ DateBox - Date pickers
- ✅ TextBox - Text inputs (when using DevExtreme forms)
- ✅ Chart - **ALL charts and graphs** (Line, Area, Bar, Stacked Area, etc.)
- ✅ PieChart - **ALL pie and donut charts**
- ✅ BarChart - **ALL bar charts**
- ✅ Any other complex UI components

**Use Bootstrap/Native HTML for:**
- ✅ Buttons - Native `<button>` elements with Bootstrap button classes
- ✅ Simple form inputs - Native `<input>`, `<select>`, `<textarea>` with Bootstrap form classes (outside DevExtreme forms)
- ✅ Cards - Native `<div>` elements with Bootstrap card classes
- ✅ Layout - Bootstrap grid system and utility classes