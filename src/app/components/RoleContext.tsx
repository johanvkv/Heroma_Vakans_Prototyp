import React, { createContext, useContext, useMemo, useState } from 'react';
import { ROLES, DEFAULT_ROLE_ID, getRoleById, Role } from '../../data/roles';

/**
 * App-wide selected role (Phase 2, Step 3). Cosmetic for now (decision D5) — the selection is
 * displayed by the header `RoleSelector`; content filtering by role is a later step.
 */
interface RoleContextValue {
  /** Roles in display order: alphabetical by label (Swedish). */
  roles: Role[];
  selectedRoleId: string;
  selectedRole: Role;
  setSelectedRoleId: (id: string) => void;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>(DEFAULT_ROLE_ID);

  const roles = useMemo(
    () => [...ROLES].sort((a, b) => a.label.localeCompare(b.label, 'sv')),
    [],
  );

  const selectedRole = getRoleById(selectedRoleId) ?? roles[0];

  const value: RoleContextValue = { roles, selectedRoleId, selectedRole, setSelectedRoleId };
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within a RoleProvider');
  return ctx;
}
