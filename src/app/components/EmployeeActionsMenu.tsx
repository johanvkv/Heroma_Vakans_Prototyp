/**
 * EMPLOYEE ACTIONS MENU COMPONENT
 * Three-dot menu for employee rows with actions flyout
 */
import React, { useState, useRef, useEffect } from 'react';

interface EmployeeActionsMenuProps {
  employeeName: string;
}

export const EmployeeActionsMenu: React.FC<EmployeeActionsMenuProps> = ({ employeeName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMenuClick = (action: string) => {
    console.log(`${action} clicked for ${employeeName}`);
    setIsOpen(false);
  };

  return (
    <div className="employee-actions-menu-wrapper" ref={menuRef}>
      <button
        className="employee-actions-menu-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Employee actions"
      >
        <i className="fa-solid fa-ellipsis-vertical"></i>
      </button>

      {isOpen && (
        <div className="employee-actions-flyout">
          <button
            className="employee-actions-item"
            onClick={() => handleMenuClick('Personuppgifter')}
          >
            Personuppgifter
          </button>
          <button
            className="employee-actions-item"
            onClick={() => handleMenuClick('Anställningsuppgifter')}
          >
            Anställningsuppgifter
          </button>
          <button
            className="employee-actions-item"
            onClick={() => handleMenuClick('Saldon')}
          >
            Saldon
          </button>
          <button
            className="employee-actions-item"
            onClick={() => handleMenuClick('Semesteröversikt')}
          >
            Semesteröversikt
          </button>
          <button
            className="employee-actions-item"
            onClick={() => handleMenuClick('Schema')}
          >
            Schema
          </button>
        </div>
      )}
    </div>
  );
};
