import React from 'react';

interface TooltipProps {
  text: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ text }) => {
  return (
    <div className="tooltip-content">
      <p className="tooltip-text">{text}</p>
    </div>
  );
};
