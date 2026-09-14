import React, { useState } from 'react';

interface SegmentedButtonsProps {
  type?: 'text' | 'icons-text' | 'icons';
  options?: string[];
}

export const SegmentedButtons: React.FC<SegmentedButtonsProps> = ({
  type = 'text',
  options = ['Walk', 'Train', 'Car']
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const getIcon = (option: string) => {
    const iconMap: { [key: string]: string } = {
      'Walk': 'fa-person-walking',
      'Train': 'fa-train',
      'Car': 'fa-car'
    };
    return iconMap[option] || 'fa-circle';
  };

  return (
    <div className="segmented-buttons">
      {options.map((option, index) => {
        const isFirst = index === 0;
        const isLast = index === options.length - 1;
        const isSelected = selectedIndex === index;

        return (
          <button
            key={index}
            className={`segmented-button ${isSelected ? 'segmented-button-selected' : ''} ${isFirst ? 'segmented-button-first' : ''} ${isLast ? 'segmented-button-last' : ''}`}
            onClick={() => setSelectedIndex(index)}
          >
            {type !== 'text' && (
              <i className={`fa-solid ${getIcon(option)} segmented-button-icon`}></i>
            )}
            {isSelected && type !== 'text' && (
              <i className="fa-solid fa-check segmented-button-check"></i>
            )}
            {type !== 'icons' && <span>{option}</span>}
          </button>
        );
      })}
    </div>
  );
};
