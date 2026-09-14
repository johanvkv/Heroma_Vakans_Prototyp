import React from 'react';

type DigitBadgeType = 'info' | 'error';
type DigitBadgeSize = 'regular' | 'small';

interface DigitBadgeProps {
  count: number;
  type?: DigitBadgeType;
  size?: DigitBadgeSize;
}

export const DigitBadge: React.FC<DigitBadgeProps> = ({
  count,
  type = 'info',
  size = 'regular'
}) => {
  const isSingleDigit = count >= 0 && count <= 9;
  const className = `digit-badge digit-badge-${type} digit-badge-${size} ${isSingleDigit ? 'digit-badge-single' : ''}`;

  return (
    <div className={className}>
      {count}
    </div>
  );
};
