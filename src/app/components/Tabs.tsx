import React, { useState } from 'react';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs?: Tab[];
  activeTab?: number;
}

export const Tabs: React.FC<TabsProps> = ({
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
            className={`tab-item ${index === selectedIndex ? 'tab-item-active' : ''}`}
            onClick={() => setSelectedIndex(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tabs-line"></div>
    </div>
  );
};
