import React, { useState } from 'react';
import svgPathsInfo from '@/imports/svg-8740js4xob';
import svgPathsWarning from '@/imports/svg-omegp7lg12';
import svgPathsError from '@/imports/svg-o4vnmz36x5';
import svgPathsSuccess from '@/imports/svg-3w3hmu9tfx';

type AlertVariant = 'info' | 'warning' | 'error' | 'success';

interface AlertProps {
  variant: AlertVariant;
  message: string;
  onClose?: () => void;
  dismissible?: boolean;
  showLink?: boolean;
  linkText?: string;
  isEditable?: boolean;
  onMessageChange?: (message: string) => void;
}

const iconPaths = {
  info: svgPathsInfo.p9238b00,
  warning: svgPathsWarning.p2ede8370,
  error: svgPathsError.p67e52f0,
  success: svgPathsSuccess.p3f86ee00,
};

const closeIconPath = svgPathsInfo.p2404b080;

export function Alert({
  variant,
  message,
  onClose,
  dismissible = true,
  showLink = false,
  linkText = 'Action link',
  isEditable = false,
  onMessageChange
}: AlertProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(message);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleSave = () => {
    if (onMessageChange && editValue.trim()) {
      onMessageChange(editValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(message);
      setIsEditing(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`alert-container alert-${variant}`}>
      <div className="alert-icon-badge">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d={iconPaths[variant]} fill="#ffffff" />
        </svg>
      </div>
      <div className="alert-message" style={{ flex: 1 }}>
        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            autoFocus
            style={{
              width: '100%',
              border: '1px solid var(--border)',
              borderRadius: '2px',
              padding: '4px 8px',
              fontSize: '14px',
              fontFamily: 'inherit',
              backgroundColor: 'var(--background)'
            }}
          />
        ) : (
          <span
            onClick={() => isEditable && setIsEditing(true)}
            style={{ cursor: isEditable ? 'pointer' : 'default' }}
            title={isEditable ? 'Click to edit' : undefined}
          >
            {message}
          </span>
        )}
        {showLink && !isEditing && (
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            style={{
              marginLeft: '8px',
              textDecoration: 'underline',
              color: 'inherit',
              fontWeight: 600
            }}
          >
            {linkText}
          </a>
        )}
      </div>
      {dismissible && (
        <button
          className="alert-close-btn"
          onClick={handleClose}
          aria-label="Close alert"
          type="button"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d={closeIconPath} fill="currentColor" />
          </svg>
        </button>
      )}
    </div>
  );
}