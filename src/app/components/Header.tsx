import React, { useState, useEffect, useRef } from 'react';
import heromaLogo from '../../assets/621997f545f4facad483cf2fe8ceed561b2bd70a.png';
import { MegaMenu } from './MegaMenu';
import { AccessibilityPanel } from './AccessibilityPanel';
import { UserProfilePanel } from './UserProfilePanel';
import { FavouritesFlyout } from './FavouritesFlyout';
import { NotificationsFlyout } from './NotificationsFlyout';
import { RoleSelector } from './RoleSelector';
import { CaseActivityModal } from './CaseActivityModal';

export const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [isFavouritesOpen, setIsFavouritesOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCaseActivityOpen, setIsCaseActivityOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const favouritesButtonRef = useRef<HTMLButtonElement>(null);
  const notificationsButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Optional: Check local storage or system preference here
    // const savedTheme = localStorage.getItem('theme');
    // if (savedTheme === 'dark') setIsDarkMode(true);
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
    // localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Open mega menu when user starts typing
    if (value.trim().length > 0) {
      setIsMegaMenuOpen(true);
    } else {
      // Close mega menu when search is cleared
      setIsMegaMenuOpen(false);
    }
  };

  return (
    <>
      <CaseActivityModal isOpen={isCaseActivityOpen} onClose={() => setIsCaseActivityOpen(false)} />
      <MegaMenu 
        isOpen={isMegaMenuOpen} 
        onClose={() => {
          setIsMegaMenuOpen(false);
          setSearchQuery('');
        }}
        searchQuery={searchQuery}
        onOpenAccessibility={() => setIsAccessibilityOpen(true)}
      />
      <AccessibilityPanel isOpen={isAccessibilityOpen} onClose={() => setIsAccessibilityOpen(false)} />
      <UserProfilePanel isOpen={isUserProfileOpen} onClose={() => setIsUserProfileOpen(false)} />
      <FavouritesFlyout 
        isOpen={isFavouritesOpen} 
        onClose={() => setIsFavouritesOpen(false)} 
        anchorElement={favouritesButtonRef.current}
      />
      <NotificationsFlyout 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
        anchorElement={notificationsButtonRef.current}
      />
      
      <header className="main-header">
        {/* Left Section */}
        <div className="d-flex align-items-stretch h-100">
          {/* Logo */}
          <div className="d-flex align-items-stretch">
             <a href="/" className="d-flex align-items-stretch">
               <img src={heromaLogo} alt="HEROMA" className="logo-img" />
             </a>
          </div>

          <div className="d-flex align-items-center header-nav-group">
            <button className="nav-btn ms-3" onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)} data-wizard-target="mega-menu-btn">
              <i className="fa-solid fa-bars"></i>
              <span>Meny</span>
            </button>
            <div className="separator-vertical show-mobile-only"></div>
            <button className="nav-btn-icon show-mobile-only" onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)} data-wizard-target="mobile-search-btn">
              <i className="fa-solid fa-search"></i>
            </button>
            <div className="separator-vertical hide-mobile"></div>
            <button className="nav-btn hide-mobile" data-wizard-target="favorites-btn" ref={favouritesButtonRef} onClick={() => setIsFavouritesOpen(!isFavouritesOpen)}>
              <span>Favoriter</span>
              <i className="fa-solid fa-chevron-down"></i>
            </button>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="center-section hide-mobile">
          <div className="search-input-wrapper" data-wizard-target="search-btn">
            <i className="fa-solid fa-search search-icon"></i>
            <input 
              type="text" 
              placeholder="Sök.." 
              className="search-input"
              value={searchQuery}
              onChange={handleSearchChange}
              onClick={(e) => {
                console.log('Input clicked');
                e.stopPropagation();
              }}
              onFocus={() => console.log('Input focused')}
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="d-flex align-items-center gap-2">
          <div className="d-flex align-items-center gap-2" data-wizard-target="theme-toggle">
             <div className="tooltip-wrapper">
               <div className={`toggle-switch ${isDarkMode ? 'active' : ''} bg-[#cfcfcf]`} onClick={toggleTheme}>
                  <div className="toggle-thumb"></div>
               </div>
               <div className="tooltip-content">
                 <span className="tooltip-text">{isDarkMode ? 'Byt till ljust läge' : 'Byt till mörkt läge'}</span>
               </div>
             </div>
          </div>
          
          <div className="separator-vertical hide-mobile"></div>

          <button className="nav-btn hide-mobile" onClick={() => setIsAccessibilityOpen(!isAccessibilityOpen)} data-wizard-target="accessibility-btn">
            <i className="fa-solid fa-universal-access"></i>
            <span>Tillgänglighet</span>
          </button>
          
          <div className="separator-vertical hide-mobile"></div>

          {/* Combined notifications - shows as single bell on mobile */}
          <button className="nav-btn position-relative notification-combined" ref={notificationsButtonRef} onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}>
            <span className="hide-mobile">Avisering</span>
            <i className="fa-solid fa-chevron-down show-mobile-only"></i>
            <span className="badge">1</span>
          </button>

          <div className="separator-vertical hide-mobile"></div>

          <button className="nav-btn hide-mobile">
            <span>Meddelanden</span>
          </button>

          <div className="separator-vertical hide-mobile"></div>
          <button className="nav-btn case-activity-header-btn" onClick={() => setIsCaseActivityOpen(true)} aria-label="Öppna ärendets händelser och kommunikation">
            <i className="fa-solid fa-comments" />
            <span className="hide-mobile">Ärende</span>
          </button>

          <div className="separator-vertical"></div>

          <div className="d-flex align-items-center gap-2">
            <RoleSelector />
            <div className="separator-vertical"></div>
            <button className="icon-btn" onClick={() => setIsUserProfileOpen(!isUserProfileOpen)}>
               <i className="fa-solid fa-user"></i>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
