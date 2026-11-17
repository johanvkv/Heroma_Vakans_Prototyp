/**
 * Role configuration (Phase 2, Step 3) — single source of truth for the header role selector.
 *
 * To add a role: append an entry below; the context and selector pick it up automatically.
 * Display order is alphabetical (handled in RoleContext), so insertion order here does not matter.
 */
export interface Role {
  /** Stable identifier. */
  id: string;
  /** Display label shown in the header / dropdown. */
  label: string;
}

export const ROLES: Role[] = [
  { id: 'medarbetare', label: 'Medarbetare' },
  { id: 'bestallare', label: 'Beställare' },
  { id: 'bemannare', label: 'Bemannare' },
  { id: 'admin', label: 'Admin' },
];

/** Admin is pre-selected. */
export const DEFAULT_ROLE_ID = 'admin';

export function getRoleById(id: string): Role | undefined {
  return ROLES.find((r) => r.id === id);
}
