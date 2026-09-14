/**
 * SIMPLE ACTIONS MENU COMPONENT
 * Three-dot menu with limited actions (Send message and Information)
 */
import React, { useState, useRef, useEffect } from 'react';

interface SimpleActionsMenuProps {
  personName: string;
}

export const SimpleActionsMenu: React.FC<SimpleActionsMenuProps> = ({ personName }) => {
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
    console.log(`${action} clicked for ${personName}`);
    setIsOpen(false);
  };

  return (
    <div className="employee-actions-menu-wrapper" ref={menuRef}>
      <button
        className="employee-actions-menu-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Actions"
      >
        <i className="fa-solid fa-ellipsis-vertical"></i>
      </button>

      {isOpen && (
        <div className="employee-actions-flyout">
          <button
            className="employee-actions-item"
            onClick={() => handleMenuClick('Skicka meddelande')}
          >
            Skicka meddelande
          </button>
          <button
            className="employee-actions-item"
            onClick={() => handleMenuClick('Information')}
          >
            Information
          </button>
        </div>
      )}
    </div>
  );
};
