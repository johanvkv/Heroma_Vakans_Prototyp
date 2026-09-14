import React from 'react';

export const SkeletonLoader = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-top-border"></div>
      <div className="skeleton-content">
        <div className="skeleton-item skeleton-title-lg"></div>
        <div className="skeleton-item skeleton-title-md"></div>
        <div className="skeleton-item skeleton-line"></div>
        <div className="skeleton-item skeleton-line"></div>
        <div className="skeleton-item skeleton-line"></div>
        <div className="skeleton-item skeleton-title-md"></div>
        <div className="skeleton-item skeleton-line"></div>
        <div className="skeleton-item skeleton-line"></div>
        <div className="skeleton-item skeleton-line"></div>
        <div className="skeleton-item skeleton-title-md"></div>
        <div className="skeleton-item skeleton-line-sm"></div>
        <div className="skeleton-item skeleton-line-sm"></div>
        <div className="skeleton-item skeleton-line-sm"></div>
      </div>
    </div>
  );
};
