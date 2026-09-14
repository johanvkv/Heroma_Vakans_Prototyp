import React from 'react';

type IndicatorBadgeType = 'info' | 'success' | 'warning' | 'error';

interface IndicatorBadgeProps {
  type: IndicatorBadgeType;
}

export const IndicatorBadge: React.FC<IndicatorBadgeProps> = ({ type }) => {
  const className = `indicator-badge indicator-badge-${type}`;

  return <div className={className} />;
};
