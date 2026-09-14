import React from 'react';

type IconBadgeType = 'info' | 'success' | 'warning' | 'error';

interface IconBadgeProps {
  type: IconBadgeType;
  icon: string; // Font Awesome icon class (e.g., 'fa-info')
}

export const IconBadge: React.FC<IconBadgeProps> = ({ type, icon }) => {
  const className = `icon-badge icon-badge-${type}`;

  return (
    <div className={className}>
      <i className={`fa-solid ${icon}`}></i>
    </div>
  );
};
