import React, { useState, useRef, useEffect } from 'react';

type ViewMode = 'normal' | 'collapsed' | 'fullscreen';

interface CardMenuProps {
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}

export const CardMenu: React.FC<CardMenuProps> = ({ viewMode = 'normal', onViewModeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const choose = (mode: ViewMode) => {
    onViewModeChange?.(mode);
    setIsOpen(false);
  };

  const isCollapsed = viewMode === 'collapsed';
  const isFullscreen = viewMode === 'fullscreen';
  const isNormal = !isCollapsed && !isFullscreen;

  return (
    <div className="card-menu-wrapper" ref={menuRef}>
      <button
        className="card-menu-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Kortmeny"
      >
        <i className="fa-solid fa-ellipsis-vertical"></i>
      </button>

      {isOpen && (
        <div className="card-menu-flyout">
          {isNormal && (
            <button className="card-menu-item" onClick={() => choose('fullscreen')}>
              <i className="fa-solid fa-expand"></i>
              <span>Helskärm</span>
            </button>
          )}
          {isNormal && (
            <button className="card-menu-item" onClick={() => choose('collapsed')}>
              <i className="fa-solid fa-minus"></i>
              <span>Fäll ihop</span>
            </button>
          )}
          {isCollapsed && (
            <button className="card-menu-item" onClick={() => choose('normal')}>
              <i className="fa-solid fa-plus"></i>
              <span>Fäll ut</span>
            </button>
          )}
          {isFullscreen && (
            <button className="card-menu-item" onClick={() => choose('normal')}>
              <i className="fa-solid fa-compress"></i>
              <span>Minimera</span>
            </button>
          )}
          <button className="card-menu-item" onClick={() => setIsOpen(false)}>
            <i className="fa-solid fa-arrow-up-right-from-square"></i>
            <span>Gå till applikation</span>
          </button>
        </div>
      )}
    </div>
  );
};
