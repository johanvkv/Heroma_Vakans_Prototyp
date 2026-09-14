import React, { useState } from 'react';

function ToggleIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="position-relative flex-shrink-0" style={{ width: '24px', height: '24px' }}>
      <svg className="d-block w-100 h-100" fill="none" viewBox="0 0 24 24">
        {/* Horizontal Bar (Minus) */}
        <path d="M5 13V11H19V13H5Z" fill="url(#gradient_toggle)" />
        {/* Vertical Bar (Plus - only when closed) */}
        {!isOpen && <path d="M13 5V19H11V5H13Z" fill="url(#gradient_toggle)" />}
        <defs>
          <linearGradient id="gradient_toggle" x1="5" y1="12" x2="19" y2="12" gradientUnits="userSpaceOnUse">
            <stop offset="0.26" stopColor="#5236AB" />
            <stop offset="0.66" stopColor="#E121B4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export function AccordionSection() {
  // Default to open as per the design screenshot
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="accordion-section">
      <button 
        className="accordion-header" 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        type="button"
      >
        <span className="accordion-title">Section header 1</span>
        <ToggleIcon isOpen={isOpen} />
      </button>
      
      {isOpen && (
        <div className="accordion-content">
          <p className="mb-3">
            This is content for your accordion. Add interesting things in the space to help users. You can even make a bullet list if you want.
          </p>
          <ul>
            <li>List item 1</li>
            <li>List item 2</li>
            <li>List item 3</li>
          </ul>
        </div>
      )}
    </div>
  );
}
