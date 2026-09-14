import React, { useEffect, useRef, useState } from 'react';

interface FavouritesFlyoutProps {
  isOpen: boolean;
  onClose: () => void;
  anchorElement?: HTMLElement | null;
}

interface FavouriteItem {
  id: string;
  label: string;
  link: string;
}

const favouriteItems: FavouriteItem[] = [
  { id: 'registrera', label: 'Registrera', link: '#' },
  { id: 'heroma-miljoer', label: 'Heroma miljöer', link: '#' },
  { id: 'bevakningsoversikt', label: 'Bevakningsöversikt', link: '#' },
  { id: 'filskyffel', label: 'Filskyffel', link: '#' },
  { id: 'bemanning', label: 'Bemanning', link: '#' },
  { id: 'systeminformation', label: 'Systeminformation', link: '#' },
  { id: 'loneuppgifter', label: 'Löneuppgifter', link: '#' },
];

export const FavouritesFlyout: React.FC<FavouritesFlyoutProps> = ({ isOpen, onClose, anchorElement }) => {
  const flyoutRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && anchorElement && flyoutRef.current) {
      const anchorRect = anchorElement.getBoundingClientRect();
      setPosition({
        top: anchorRect.bottom + 8,
        left: anchorRect.left,
      });
    }
  }, [isOpen, anchorElement]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        flyoutRef.current &&
        !flyoutRef.current.contains(event.target as Node) &&
        anchorElement &&
        !anchorElement.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, anchorElement]);

  if (!isOpen) return null;

  return (
    <div 
      className="favourites-flyout" 
      ref={flyoutRef}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="favourites-header">
        <i className="fa-solid fa-plus favourites-header-icon"></i>
        <span className="favourites-header-text">
          Lägg till <span className="favourites-header-highlight">Bemanning</span> Till Favoriter
        </span>
      </div>
      
      <div className="favourites-list">
        {favouriteItems.map((item) => (
          <a 
            key={item.id} 
            href={item.link} 
            className="favourites-item"
            onClick={(e) => {
              e.preventDefault();
              // Handle navigation here
              onClose();
            }}
          >
            {item.label}
          </a>
        ))}
      </div>

      <div className="favourites-footer">
        <a 
          href="#" 
          className="favourites-settings-link"
          onClick={(e) => {
            e.preventDefault();
            // Handle settings navigation here
            onClose();
          }}
        >
          <i className="fa-solid fa-gear favourites-settings-icon"></i>
          <span>Inställningar</span>
        </a>
      </div>
    </div>
  );
};