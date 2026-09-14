import React from 'react';

interface IconProps {
  /** Font Awesome class, e.g. "fa-regular fa-user". */
  name: string;
  className?: string;
}

/**
 * Single choke-point for icons — Font Awesome only (CLAUDE.md rule 3). Decorative by
 * default (`aria-hidden`); routing all icons through here makes them trivial to audit
 * and to lint against Lucide.
 */
export const Icon: React.FC<IconProps> = ({ name, className }) => (
  <i className={`${name}${className ? ` ${className}` : ''}`} aria-hidden="true"></i>
);
