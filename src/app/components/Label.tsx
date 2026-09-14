import React from 'react';

type LabelType = 'default' | 'info' | 'success' | 'warning' | 'error';
type LabelVariant = 'standard' | 'subtle';

interface LabelProps {
  type?: LabelType;
  variant?: LabelVariant;
  children: React.ReactNode;
}

export const Label: React.FC<LabelProps> = ({
  type = 'default',
  variant = 'standard',
  children
}) => {
  const className = variant === 'standard'
    ? `label-standard label-${type}`
    : `label-subtle label-${type}`;

  return (
    <div className={className}>
      {children}
    </div>
  );
};
