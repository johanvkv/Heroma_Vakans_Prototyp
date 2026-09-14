import React, { useEffect, useRef, useState } from 'react';

interface NotificationsFlyoutProps {
  isOpen: boolean;
  onClose: () => void;
  anchorElement?: HTMLElement | null;
}

interface NotificationCategory {
  id: string;
  label: string;
  count: number;
}

const notificationCategories: NotificationCategory[] = [
  { id: 'information', label: 'Information', count: 1 },
];

export const NotificationsFlyout: React.FC<NotificationsFlyoutProps> = ({ isOpen, onClose, anchorElement }) => {
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
      className="notifications-flyout" 
      ref={flyoutRef}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="notifications-list">
        {notificationCategories.map((category) => (
          <a 
            key={category.id} 
            href="#" 
            className="notifications-item"
            onClick={(e) => {
              e.preventDefault();
              // Handle navigation here
              onClose();
            }}
          >
            <span className="notifications-item-label">{category.label}</span>
            {category.count > 0 && (
              <span className="notifications-item-badge">{category.count}</span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
};