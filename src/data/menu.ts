/**
 * Data-driven menu — single source of truth (Phase 2, Item 1).
 *
 * Both the live navigation (`MegaMenu`) and the Page Builder placement selector read from
 * `menu.json` via the helpers below, so they can never drift. When you add a page:
 *   1) add an entry in `menu.json` under the right primary, and
 *   2) register a route in `src/app/routes.tsx`.
 *
 * Structure / levels (mirrors the Heroma menu model):
 *   Primary (level 1)
 *     ├─ `_overviewCards[]` (a reserved level — present in the structure but INTENTIONALLY
 *     │   unused for now; overview cards are added in a later phase)
 *     └─ Secondary sections → `options[]` (the leaf labels)
 * A primary with `_path` is a leaf that navigates directly (e.g. `Hem` → "/", placed first;
 * `Page Builder Studio` → "/components", placed last).
 */
import menuData from './menu.json';

/** An overview card. This level EXISTS in the structure but is intentionally unused here —
 *  it will be populated in a later phase. */
export interface OverviewCard {
  label: string;
  /** Font Awesome class, e.g. "fa-chart-pie". */
  icon: string;
  path: string;
}

/** A leaf label under a secondary section. Objects allow the `highlighted` accent used today. */
export type MenuOption = string | { text: string; highlighted?: boolean };

export interface MenuSecondary {
  options: MenuOption[];
  /** Reserved for Item 4 (role selector) — not populated yet (decision D1). */
  roles?: string[];
}

export interface MenuPrimary {
  _id: string;
  /** Font Awesome class for the level-1 rail. */
  _icon?: string;
  /** When set, the primary is a leaf that navigates here directly. */
  _path?: string;
  /** Renders a "NEW" badge. */
  _new?: boolean;
  /** Renders a divider before this primary in the rail. */
  _dividerBefore?: boolean;
  /** Reserved overview-cards level — present but unused here. */
  _overviewCards?: OverviewCard[];
  /** Secondary sections (any non-reserved key). */
  [section: string]: MenuSecondary | string | boolean | OverviewCard[] | undefined;
}

export type MenuStructure = Record<string, MenuPrimary>;

const RESERVED = new Set(['_id', '_icon', '_path', '_new', '_dividerBefore', '_overviewCards']);

export const menu = menuData as unknown as MenuStructure;

/** Secondary sections of a primary (excludes the reserved `_`-prefixed keys). */
export function getSecondaries(entry: MenuPrimary): Record<string, MenuSecondary> {
  const out: Record<string, MenuSecondary> = {};
  for (const [k, v] of Object.entries(entry)) {
    if (RESERVED.has(k) || v === undefined) continue;
    out[k] = v as MenuSecondary;
  }
  return out;
}

// ─── Derived shapes for the consumers (their existing render logic stays unchanged) ─────

export interface MegaMenuItem {
  id: string;
  label: string;
  icon: string;
  path?: string;
  hasNew?: boolean;
  isDivider?: boolean;
  useSVG?: boolean;
}

/** Level-1 items for the MegaMenu sidebar. Labels are upper-cased as before. */
export function getMegaMenuItems(): MegaMenuItem[] {
  const items: MegaMenuItem[] = [];
  for (const [name, entry] of Object.entries(menu)) {
    if (entry._dividerBefore) {
      items.push({ id: `divider-${entry._id}`, label: '', icon: '', isDivider: true });
    }
    items.push({
      id: entry._id,
      label: name.toUpperCase(),
      icon: entry._icon ?? '',
      path: entry._path,
      hasNew: entry._new,
    });
  }
  return items;
}

export interface MegaMenuSection {
  title: string;
  items: MenuOption[];
}

/** Content sections keyed by primary id, for the MegaMenu main panel + search. */
export function getMegaMenuContent(): Record<string, { sections: MegaMenuSection[]; isPortalView?: boolean; portals?: Array<{ id: string; title: string; description: string; icon: string }> }> {
  const out: Record<string, { sections: MegaMenuSection[]; isPortalView?: boolean; portals?: Array<{ id: string; title: string; description: string; icon: string }> }> = {};
  for (const entry of Object.values(menu)) {
    const sections = Object.entries(getSecondaries(entry)).map(([title, sec]) => ({
      title,
      items: sec.options,
    }));
    if (sections.length > 0) out[entry._id] = { sections };
  }
  return out;
}

export interface PageLocation {
  id: string;
  name: string;
  children?: PageLocation[];
}

/** Placement tree for the Page Builder (all primaries except the Home leaf). */
export function getPageLocations(): PageLocation[] {
  const children: PageLocation[] = [];
  for (const [name, entry] of Object.entries(menu)) {
    if (entry._path === '/') continue; // skip Home (the start page)
    children.push({ id: entry._id, name });
  }
  return [{ id: 'root', name: 'Heroma', children }];
}

/** Display name (the menu.json key) for a placement/location id, e.g. "personal" → "Personal". */
export function getMenuNameById(id: string): string | undefined {
  if (id === 'root') return 'Heroma';
  for (const [name, entry] of Object.entries(menu)) {
    if (entry._id === id) return name;
  }
  return undefined;
}
