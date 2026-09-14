import React from 'react';

type StatusBadgeType = 'offline' | 'available' | 'away' | 'busy';

interface StatusBadgeProps {
  status: StatusBadgeType;
}

const iconMap: Record<StatusBadgeType, string> = {
  offline: 'fa-xmark',
  available: 'fa-check',
  away: 'fa-clock',
  busy: 'fa-minus'
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const className = `status-badge status-badge-${status}`;
  const icon = iconMap[status];

  return (
    <div className={className}>
      <i className={`fa-solid ${icon}`}></i>
    </div>
  );
};
