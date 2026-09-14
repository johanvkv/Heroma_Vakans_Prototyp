/**
 * BADGE COMPONENT
 * Reusable badge icons for info, success, warning, and error states
 *
 * NO TAILWIND CLASSES - Only CSS classes from overrides.css
 */
import React from 'react';
import svgPaths from '../../imports/DefaultBadges/svg-5jrj20pp1r';

interface BadgeProps {
  type: 'info' | 'success' | 'warning' | 'error';
  size?: number;
}

export const Badge: React.FC<BadgeProps> = ({ type, size = 24 }) => {
  const getPathAndColor = () => {
    switch (type) {
      case 'info':
        return { path: svgPaths.p35de2c00, color: '#5236ab' };
      case 'success':
        return { path: svgPaths.p1e78180, color: '#18a86c' };
      case 'warning':
        return { path: svgPaths.p28251a00, color: '#ab741a' };
      case 'error':
        return { path: svgPaths.peb4e280, color: '#b00020' };
    }
  };

  const { path, color } = getPathAndColor();

  return (
    <div className="badge-wrapper" style={{ width: `${size}px`, height: `${size}px` }}>
      <div className="badge-circle" style={{ backgroundColor: color }}>
        <svg className="badge-icon" viewBox="0 0 20 20" fill="none">
          <mask
            height="20"
            id={`mask_${type}`}
            maskUnits="userSpaceOnUse"
            style={{ maskType: 'alpha' }}
            width="20"
            x="0"
            y="0"
          >
            <rect fill="#D9D9D9" height="20" width="20" />
          </mask>
          <g mask={`url(#mask_${type})`}>
            <path d={path} fill="white" />
          </g>
        </svg>
      </div>
    </div>
  );
};
