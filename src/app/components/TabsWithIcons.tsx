import React, { useState } from 'react';

interface Tab {
  id: string;
  label: string;
}

interface TabsWithIconsProps {
  tabs?: Tab[];
  activeTab?: number;
}

export const TabsWithIcons: React.FC<TabsWithIconsProps> = ({
  tabs = [
    { id: '1', label: 'Selected tab' },
    { id: '2', label: 'Default tab' },
    { id: '3', label: 'Default tab' }
  ],
  activeTab = 0
}) => {
  const [selectedIndex, setSelectedIndex] = useState(activeTab);

  return (
    <div className="tabs-container">
      <div className="tabs-wrapper">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            className={`tab-item tab-item-with-icon ${index === selectedIndex ? 'tab-item-active' : ''}`}
            onClick={() => setSelectedIndex(index)}
          >
            <i className={`fa-solid fa-bell ${index === selectedIndex ? 'tab-icon-active' : 'tab-icon'}`}></i>
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tabs-line"></div>
    </div>
  );
};
