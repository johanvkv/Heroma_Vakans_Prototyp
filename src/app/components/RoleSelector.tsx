import React, { useState, useRef, useEffect } from 'react';
import { useRole } from './RoleContext';

/**
 * Header role selector (Phase 2, Step 3). Mode B — native markup + our CSS classes + Font Awesome.
 * Trigger shows the current role; the dropdown lists all roles alphabetically (Admin pre-selected)
 * with a check on the active one. Opening user settings stays on the separate user-icon button.
 */
export const RoleSelector: React.FC = () => {
  const { roles, selectedRoleId, selectedRole, setSelectedRoleId } = useRole();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="employee-actions-menu-wrapper" ref={wrapperRef}>
      <button
        className="nav-btn hide-mobile"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Byt roll"
        data-wizard-target="user-profile-btn"
      >
        <span>{selectedRole.label}</span>
        <i className="fa-solid fa-chevron-down small"></i>
      </button>

      {isOpen && (
        <div className="employee-actions-flyout" role="menu">
          {roles.map((role) => (
            <button
              key={role.id}
              className="employee-actions-item"
              role="menuitemradio"
              aria-checked={role.id === selectedRoleId}
              onClick={() => {
                setSelectedRoleId(role.id);
                setIsOpen(false);
              }}
            >
              <i
                className={`fa-solid fa-check me-2${role.id === selectedRoleId ? '' : ' invisible'}`}
                aria-hidden="true"
              ></i>
              <span>{role.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
