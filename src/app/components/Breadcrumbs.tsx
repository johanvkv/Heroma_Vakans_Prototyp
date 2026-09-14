import React from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ 
  items, 
  showBackButton = true,
  onBackClick 
}) => {
  return (
    <div className="breadcrumbs">
      {showBackButton && (
        <>
          <button className="breadcrumb-back" onClick={onBackClick}>
            <i className="fa-solid fa-chevron-left"></i>
            Tillbaka
          </button>
          <span className="breadcrumb-separator">|</span>
        </>
      )}
      <span className="breadcrumb-label">Här är du:</span>
      {items.map((item, index) => {
        if (item.isActive) {
          return (
            <span key={index} className="breadcrumb-current">{item.label}</span>
          );
        }
        
        return (
          <span key={index} className="breadcrumb-item-wrapper">
            <a href={item.href || '#'} className="breadcrumb-link">
              {item.label}
            </a>
            {index < items.length - 1 && (
              <span className="breadcrumb-chevron">
                <i className="fa-solid fa-caret-right"></i>
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
};