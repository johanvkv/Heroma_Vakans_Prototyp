import React, { useState, useEffect, useRef } from 'react';

interface AccessibilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({ isOpen, onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [activeProfile, setActiveProfile] = useState('kompakt');
  const [largerText, setLargerText] = useState(0); // 0 = off, 1 = small, 2 = medium, 3 = large
  const [largerButtons, setLargerButtons] = useState(false);
  const [zoom, setZoom] = useState(0); // 0 = off, 1 = small, 2 = medium, 3 = large
  const [highlightLinks, setHighlightLinks] = useState(false);
  const [increasedRowSpacing, setIncreasedRowSpacing] = useState(0); // 0 = off, 1 = small, 2 = medium, 3 = large
  const [clearBorders, setClearBorders] = useState(false);
  const [keyboardNavigation, setKeyboardNavigation] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [largerCursor, setLargerCursor] = useState(false);
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

  // Apply/remove accessibility classes when states change
  useEffect(() => {
    // Remove all largerText classes first
    document.documentElement.classList.remove('accessibility-larger-text-1', 'accessibility-larger-text-2', 'accessibility-larger-text-3');
    
    if (largerText > 0) {
      document.documentElement.classList.add(`accessibility-larger-text-${largerText}`);
    }
  }, [largerText]);

  useEffect(() => {
    if (largerButtons) {
      document.documentElement.classList.add('accessibility-larger-buttons');
    } else {
      document.documentElement.classList.remove('accessibility-larger-buttons');
    }
  }, [largerButtons]);

  useEffect(() => {
    // Remove all zoom classes first
    document.documentElement.classList.remove('accessibility-zoom-1', 'accessibility-zoom-2', 'accessibility-zoom-3');
    
    if (zoom > 0) {
      document.documentElement.classList.add(`accessibility-zoom-${zoom}`);
    }
  }, [zoom]);

  useEffect(() => {
    if (highlightLinks) {
      document.documentElement.classList.add('accessibility-highlight-links');
    } else {
      document.documentElement.classList.remove('accessibility-highlight-links');
    }
  }, [highlightLinks]);

  useEffect(() => {
    // Remove all increasedRowSpacing classes first
    document.documentElement.classList.remove('accessibility-increased-row-spacing-1', 'accessibility-increased-row-spacing-2', 'accessibility-increased-row-spacing-3');
    
    if (increasedRowSpacing > 0) {
      document.documentElement.classList.add(`accessibility-increased-row-spacing-${increasedRowSpacing}`);
    }
  }, [increasedRowSpacing]);

  useEffect(() => {
    if (clearBorders) {
      document.documentElement.classList.add('accessibility-clear-borders');
    } else {
      document.documentElement.classList.remove('accessibility-clear-borders');
    }
  }, [clearBorders]);

  useEffect(() => {
    if (keyboardNavigation) {
      document.documentElement.classList.add('accessibility-keyboard-navigation');
    } else {
      document.documentElement.classList.remove('accessibility-keyboard-navigation');
    }
  }, [keyboardNavigation]);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.setAttribute('data-theme', 'high-contrast');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [highContrast]);

  useEffect(() => {
    if (largerCursor) {
      document.documentElement.classList.add('accessibility-larger-cursor');
    } else {
      document.documentElement.classList.remove('accessibility-larger-cursor');
    }
  }, [largerCursor]);

  if (!isOpen) return null;

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
    setActiveProfile('personlig');
  };

  const toggleLargerText = () => {
    setLargerText(largerText === 3 ? 0 : largerText + 1);
    setActiveProfile('personlig');
  };

  const toggleZoom = () => {
    setZoom(zoom === 3 ? 0 : zoom + 1);
    setActiveProfile('personlig');
  };

  const toggleHighlightLinks = () => {
    setHighlightLinks(!highlightLinks);
    setActiveProfile('personlig');
  };

  const toggleIncreasedRowSpacing = () => {
    setIncreasedRowSpacing(increasedRowSpacing === 3 ? 0 : increasedRowSpacing + 1);
    setActiveProfile('personlig');
  };

  const toggleClearBorders = () => {
    setClearBorders(!clearBorders);
    setActiveProfile('personlig');
  };

  const toggleKeyboardNavigation = () => {
    setKeyboardNavigation(!keyboardNavigation);
    setActiveProfile('personlig');
  };

  const toggleLargerCursor = () => {
    setLargerCursor(!largerCursor);
    setActiveProfile('personlig');
  };

  const resetAll = () => {
    setLargerText(0);
    setLargerButtons(false);
    setZoom(0);
    setHighlightLinks(false);
    setIncreasedRowSpacing(0);
    setClearBorders(false);
    setKeyboardNavigation(false);
    setHighContrast(false);
    setLargerCursor(false);
    setActiveProfile('kompakt');
  };

  const handleProfileChange = (profile: string) => {
    setActiveProfile(profile);
    
    // Reset all first - including theme
    setLargerText(0);
    setLargerButtons(false);
    setZoom(0);
    setHighlightLinks(false);
    setIncreasedRowSpacing(0);
    setClearBorders(false);
    setKeyboardNavigation(false);
    setHighContrast(false);
    setLargerCursor(false);
    
    // Apply profile-specific settings
    if (profile === 'visuellt') {
      // Visuellt stöd: Zoom, Markera länkar, Större text, Tydliga ramlinjer, Ökat radavstånd
      setZoom(2); // Changed from 3 to 2 for 130% zoom instead of 140%
      setHighlightLinks(true);
      setLargerText(3);
      setClearBorders(true);
      setIncreasedRowSpacing(3);
    } else if (profile === 'motorik') {
      // Motorikanpassat läge: Större text, Större knappar, Tangentbordsnavigering, Ökat radavstånd
      setLargerText(3);
      setLargerButtons(true);
      setKeyboardNavigation(true);
      setIncreasedRowSpacing(3);
    } else if (profile === 'kognitivt') {
      // Kognitivt stöd: Markera länkar, Större text, Ökat radavstånd, Tydliga ramlinjer
      setHighlightLinks(true);
      setLargerText(3);
      setIncreasedRowSpacing(3);
      setClearBorders(true);
    }
    // Kompakt läge: all settings are already reset above
  };

  return (
    <>
      {/* Backdrop */}
      <div className="accessibility-backdrop" aria-hidden="true" onClick={onClose}></div>
      
      {/* Panel */}
      <div className="accessibility-panel" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="accessibility-panel-title" tabIndex={-1}>
        {/* Header */}
        <div className="accessibility-header">
          <h2 id="accessibility-panel-title" className="accessibility-title">Heroma tillgänglighetsverktyg</h2>
          <button type="button" className="accessibility-close-btn" aria-label="Stäng tillgänglighetspanelen" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Content */}
        <div className="accessibility-content">
          {/* Active Profile Section */}
          <div className="accessibility-section">
            <h3 className="accessibility-section-title">Aktiv profil</h3>
            
            <div className="accessibility-radio-group">
              <label className="accessibility-radio-label">
                <input
                  type="radio"
                  name="profile"
                  value="kompakt"
                  checked={activeProfile === 'kompakt'}
                  onChange={(e) => handleProfileChange(e.target.value)}
                  className="accessibility-radio-input"
                />
                <span className="accessibility-radio-custom"></span>
                <span className="accessibility-radio-text">Kompakt läge (standard)</span>
              </label>

              <label className="accessibility-radio-label">
                <input
                  type="radio"
                  name="profile"
                  value="visuellt"
                  checked={activeProfile === 'visuellt'}
                  onChange={(e) => handleProfileChange(e.target.value)}
                  className="accessibility-radio-input"
                />
                <span className="accessibility-radio-custom"></span>
                <span className="accessibility-radio-text">Visuellt stöd</span>
              </label>

              <label className="accessibility-radio-label">
                <input
                  type="radio"
                  name="profile"
                  value="motorik"
                  checked={activeProfile === 'motorik'}
                  onChange={(e) => handleProfileChange(e.target.value)}
                  className="accessibility-radio-input"
                />
                <span className="accessibility-radio-custom"></span>
                <span className="accessibility-radio-text">Motorikanpassat läge</span>
              </label>

              <label className="accessibility-radio-label">
                <input
                  type="radio"
                  name="profile"
                  value="kognitivt"
                  checked={activeProfile === 'kognitivt'}
                  onChange={(e) => handleProfileChange(e.target.value)}
                  className="accessibility-radio-input"
                />
                <span className="accessibility-radio-custom"></span>
                <span className="accessibility-radio-text">Kognitivt stöd</span>
              </label>
            </div>
          </div>

          {/* Personlig anpassning Section */}
          <div className="accessibility-section accessibility-personlig-section">
            <label className="accessibility-radio-label">
              <input
                type="radio"
                name="profile"
                value="personlig"
                checked={activeProfile === 'personlig'}
                onChange={(e) => setActiveProfile(e.target.value)}
                className="accessibility-radio-input"
              />
              <span className="accessibility-radio-custom"></span>
              <span className="accessibility-radio-text">Personlig anpassning</span>
            </label>
          </div>

          {/* Features Grid */}
          <div className="accessibility-features-grid">
            <button type="button" className={`accessibility-feature-card ${keyboardNavigation ? 'active' : ''}`} aria-pressed={keyboardNavigation} onClick={toggleKeyboardNavigation}>
              <i className="fa-solid fa-keyboard accessibility-feature-icon"></i>
              <span className="accessibility-feature-text">TANGENTBORDS-NAVIGERING</span>
            </button>

            <button type="button" className={`accessibility-feature-card ${largerButtons ? 'active' : ''}`} aria-pressed={largerButtons} onClick={() => { setLargerButtons(!largerButtons); setActiveProfile('personlig'); }}>
              <i className="fa-solid fa-up-right-and-down-left-from-center accessibility-feature-icon"></i>
              <span className="accessibility-feature-text">STÖRRE KNAPPAR & INMATNINGSFÄLT</span>
            </button>

            <button type="button" className={`accessibility-feature-card ${zoom > 0 ? 'active' : ''}`} aria-pressed={zoom > 0} aria-label={`Zoom, nivå ${zoom} av 3`} onClick={toggleZoom}>
              <i className="fa-solid fa-magnifying-glass accessibility-feature-icon"></i>
              <span className="accessibility-feature-text">ZOOM</span>
              <div className="accessibility-steps">
                <span className={`accessibility-step ${zoom >= 1 ? 'active' : ''}`}></span>
                <span className={`accessibility-step ${zoom >= 2 ? 'active' : ''}`}></span>
                <span className={`accessibility-step ${zoom >= 3 ? 'active' : ''}`}></span>
              </div>
            </button>

            <button type="button" className={`accessibility-feature-card ${highlightLinks ? 'active' : ''}`} aria-pressed={highlightLinks} onClick={toggleHighlightLinks}>
              <i className="fa-solid fa-pen accessibility-feature-icon"></i>
              <span className="accessibility-feature-text">MARKERA LÄNKAR</span>
            </button>

            <button type="button" className={`accessibility-feature-card ${largerText > 0 ? 'active' : ''}`} aria-pressed={largerText > 0} aria-label={`Större text, nivå ${largerText} av 3`} onClick={toggleLargerText}>
              <i className="fa-solid fa-text-height accessibility-feature-icon"></i>
              <span className="accessibility-feature-text">STÖRRE TEXT</span>
              <div className="accessibility-steps">
                <span className={`accessibility-step ${largerText >= 1 ? 'active' : ''}`}></span>
                <span className={`accessibility-step ${largerText >= 2 ? 'active' : ''}`}></span>
                <span className={`accessibility-step ${largerText >= 3 ? 'active' : ''}`}></span>
              </div>
            </button>

            <button type="button" className={`accessibility-feature-card ${increasedRowSpacing > 0 ? 'active' : ''}`} aria-pressed={increasedRowSpacing > 0} aria-label={`Ökat radavstånd, nivå ${increasedRowSpacing} av 3`} onClick={toggleIncreasedRowSpacing}>
              <i className="fa-solid fa-align-left accessibility-feature-icon"></i>
              <span className="accessibility-feature-text">ÖKAT RADAVSTÅND</span>
              <div className="accessibility-steps">
                <span className={`accessibility-step ${increasedRowSpacing >= 1 ? 'active' : ''}`}></span>
                <span className={`accessibility-step ${increasedRowSpacing >= 2 ? 'active' : ''}`}></span>
                <span className={`accessibility-step ${increasedRowSpacing >= 3 ? 'active' : ''}`}></span>
              </div>
            </button>

            <button type="button" className={`accessibility-feature-card ${clearBorders ? 'active' : ''}`} aria-pressed={clearBorders} onClick={toggleClearBorders}>
              <i className="fa-solid fa-border-all accessibility-feature-icon"></i>
              <span className="accessibility-feature-text">TYDLIGA RAMLINJER</span>
            </button>

            <button type="button" className={`accessibility-feature-card ${highContrast ? 'active' : ''}`} aria-pressed={highContrast} onClick={toggleHighContrast}>
              <i className="fa-solid fa-circle-half-stroke accessibility-feature-icon"></i>
              <span className="accessibility-feature-text">HIGH CONTRAST</span>
            </button>

            <button type="button" className={`accessibility-feature-card ${largerCursor ? 'active' : ''}`} aria-pressed={largerCursor} onClick={toggleLargerCursor}>
              <i className="fa-solid fa-mouse-pointer accessibility-feature-icon"></i>
              <span className="accessibility-feature-text">STÖRRE MUSEPEKARE</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="accessibility-footer">
          <button type="button" className="accessibility-reset-btn" onClick={resetAll}>
            <i className="fa-solid fa-rotate-left"></i>
            <span>Återställ</span>
          </button>
          <p className="accessibility-copyright">
            Accessibility framework<br />© CGI Inc.
          </p>
        </div>
      </div>
    </>
  );
};
