import React from 'react';

interface CardProps {
  title?: React.ReactNode;
  /** Right-aligned header actions (e.g. a CardMenu or buttons). */
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * Compliant card wrapper (Mode B). Renders the standard card structure
 * (`.card-standard` > `.card-header-wrapper` [title + `.card-header-actions`] +
 * `.card-body-standard`) so non-compliant card markup is impossible.
 */
export const Card: React.FC<CardProps> = ({ title, actions, children, className }) => (
  <div className={`card-standard${className ? ` ${className}` : ''}`}>
    {(title || actions) && (
      <div className="card-header-wrapper">
        {title && <h2 className="card-title-standard">{title}</h2>}
        {actions && <div className="card-header-actions">{actions}</div>}
      </div>
    )}
    <div className="card-body-standard">{children}</div>
  </div>
);
