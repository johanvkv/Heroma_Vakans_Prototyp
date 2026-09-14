import React from 'react';

interface SpacerProps {
  isPreview?: boolean;
}

export const Spacer: React.FC<SpacerProps> = ({ isPreview = false }) => {
  return <div className={`spacer-component ${isPreview ? 'spacer-preview' : ''}`}></div>;
};
