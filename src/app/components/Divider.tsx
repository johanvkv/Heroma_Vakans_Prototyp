import React from 'react';

interface DividerProps {
  width?: number; // 1-12 for col-span
}

export const Divider: React.FC<DividerProps> = ({ width = 12 }) => {
  return (
    <div className="divider-component" style={{ width: '100%' }}>
      <hr className="divider-line" />
    </div>
  );
};
