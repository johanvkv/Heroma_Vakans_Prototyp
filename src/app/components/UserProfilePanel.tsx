import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';

interface UserProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfilePanel: React.FC<UserProfilePanelProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const panel = panelRef.current;
    const getFocusable = () => panel?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    ) ?? [];
    getFocusable()[0]?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
      } else if (event.key === 'Tab') {
        const focusable = getFocusable();
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && (document.activeElement === first || !panel?.contains(document.activeElement))) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !panel?.contains(document.activeElement))) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  const openPersoner = () => {
    onClose();
    navigate('/installningar/personer');
  };

  return (
    <>
      {/* Overlay backdrop */}
      {isOpen && <div className="user-profile-overlay" aria-hidden="true" onClick={onClose}></div>}
      
      {/* Side panel */}
      <div className={`user-profile-panel ${isOpen ? 'open' : ''}`} ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="user-profile-title" aria-hidden={!isOpen} inert={!isOpen} tabIndex={-1}>
        {/* Header */}
        <div className="user-profile-header">
          <div>
            <h2 id="user-profile-title" className="user-profile-name">Herman Björklund</h2>
            <div className="user-profile-role">Anställd</div>
            <div className="user-profile-description">
              Systemutveckling/pro Lön, system och support (id: 1000)
            </div>
          </div>
          <button type="button" className="user-profile-close" aria-label="Stäng användarprofil" onClick={onClose}>
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        {/* Menu items */}
        <div className="user-profile-menu">
          <button className="user-profile-menu-item">
            <span>Min profil</span>
          </button>
          
          <button className="user-profile-menu-item">
            <span>Inställningar</span>
          </button>

          <button className="user-profile-menu-item" onClick={openPersoner}>
            <span>Personer</span>
          </button>
          
          <button className="user-profile-menu-item">
            <span>Hjälp</span>
          </button>
          
          <button className="user-profile-menu-item">
            <span>Tillgänglighet</span>
          </button>
          
          <button className="user-profile-menu-item">
            <span>Ändra språk</span>
            <i className="fa-solid fa-chevron-down"></i>
          </button>
          
          <button className="user-profile-menu-item">
            <span>Ändra ansvar</span>
            <i className="fa-solid fa-chevron-down"></i>
          </button>
          
          <button className="user-profile-menu-item">
            <span>Aktivera mobilapp</span>
          </button>
        </div>

        {/* Logout button */}
        <div className="user-profile-footer">
          <button className="user-profile-logout">
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
            <span>Logga ut</span>
          </button>
        </div>
      </div>
    </>
  );
};
