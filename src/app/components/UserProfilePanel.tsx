import React from 'react';
import { useNavigate } from 'react-router';

interface UserProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfilePanel: React.FC<UserProfilePanelProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const openPersoner = () => {
    onClose();
    navigate('/installningar/personer');
  };

  return (
    <>
      {/* Overlay backdrop */}
      {isOpen && <div className="user-profile-overlay" onClick={onClose}></div>}
      
      {/* Side panel */}
      <div className={`user-profile-panel ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="user-profile-header">
          <div>
            <h2 className="user-profile-name">Herman Björklund</h2>
            <div className="user-profile-role">Anställd</div>
            <div className="user-profile-description">
              Systemutveckling/pro Lön, system och support (id: 1000)
            </div>
          </div>
          <button className="user-profile-close" onClick={onClose}>
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