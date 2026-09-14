> This is the SHORT design-system summary that the platform auto-injects.
> The COMPLETE, authoritative specification is in `/Guidelines.md` at the repo root.
> For any detailed component spec (button states, card borders, accordion icons,
> dark mode, inputs, tables, tooltips, dropdowns) READ `/Guidelines.md` before coding.
> The always-read essentials also live in `/CLAUDE.md`.

# Design System Guidelines

## ⚠️ CRITICAL RULES - READ FIRST ⚠️

### ABSOLUTELY NO INLINE STYLES
- **NEVER** write `style={{}}` in any React component
- **NEVER** use inline CSS of any kind
- **ALL** styling must be defined in CSS files (`/styles/globals.css` or `/styles/overrides.css`)
- **ALWAYS** use CSS classes from `/styles/overrides.css` for all styling needs
- **ALWAYS** use CSS variables from `/styles/globals.css` (e.g., `var(--primary)`, `var(--card-border)`)

### ABSOLUTELY NO LUCIDE REACT - ONLY FONT AWESOME
- **NEVER** use `lucide-react` package or any Lucide icons
- **NEVER** import from `lucide-react`
- **ONLY** use **Font Awesome** for ALL icons
- **ALWAYS** use Font Awesome class names: `<i className="fa-light fa-icon-name"></i>`
- **ALWAYS** use Font Awesome icon variants: `fa-light`, `fa-regular`, `fa-solid`, `fa-duotone`
- Example: `<i className="fa-light fa-filter"></i>` for filter icon
- Example: `<i className="fa-light fa-settings"></i>` for settings icon
- Example: `<i className="fa-light fa-user"></i>` for user icon

#### Font Awesome Setup
Font Awesome is included via CDN in `/styles/globals.css`. The following import is required at the top of the file:

```css
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');
```

**Important Notes:**
- The Font Awesome CDN link is already included in the project
- This provides access to all Font Awesome icon variants: `fa-light`, `fa-regular`, `fa-solid`, `fa-duotone`
- **NOTE**: `fa-light` and `fa-duotone` require Font Awesome Pro. If you don't have a Pro license, use `fa-regular` or `fa-solid` instead
- No additional imports or setup needed in React components - just use the `<i className="fa-light fa-icon-name"></i>` syntax

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
  - ✅ Any other complex UI components
- **Bootstrap is allowed ONLY for:**
  - ✅ Layout (grid system, containers, rows, columns)
  - ✅ Utility classes (spacing, display, flex)
  - ✅ Simple buttons (native `<button>` with Bootstrap classes)
  - ✅ Simple cards (native `<div>` with Bootstrap card classes)
  - ✅ Simple form inputs (native `<input>`, `<select>`, `<textarea>` outside DevExtreme forms)

### Component Defaults Must Be Overridden
- **WARNING**: ShadCN and Bootstrap components have default styling (gap, typography, spacing, etc.)
- **ALWAYS** explicitly set CSS classes to override these defaults
- **NEVER** rely on component defaults - they do not match our design system
- Example: A button component may have default padding/font - you **MUST** apply `.btn-standard` or similar class to override it

### Font Family Rule
- **ONLY** use **Lato** (`latoweb`) for all text, via `var(--font-family-base)` /
  `var(--font-family-primary)` (and `latowebheavy` / `var(--font-family-heavy)` for bold text)
- **NEVER** use Source Sans Pro, Arial, Helvetica, or any other font family

### ABSOLUTELY NO TAILWIND
- **NEVER** use Tailwind CSS classes (e.g., `w-4`, `h-4`, `text-xl`, `p-4`, etc.)
- **ONLY** use CSS classes from `/styles/overrides.css` and `/styles/globals.css`
- **ONLY** use Bootstrap utility classes (e.g., `container`, `row`, `col-md-8`, `d-flex`, etc.)
- **ALL** custom styling must be in CSS files, not Tailwind classes

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
