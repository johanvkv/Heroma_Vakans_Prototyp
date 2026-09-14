import React from 'react';

type Variant = 'primary' | 'secondary' | 'tertiary';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** Font Awesome icon class, e.g. "fa-regular fa-plus". Rendered before the label. */
  icon?: string;
}

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  tertiary: 'btn-tertiary',
};

/**
 * Compliant button wrapper (Mode B). Bakes in the correct `.btn-*` class so the wrong
 * class cannot be applied. Native `<button>` + our CSS classes (CLAUDE.md rule 8).
 * Defaults to `type="button"` to avoid accidental form submits; override via props.
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  icon,
  children,
  className,
  type,
  ...rest
}) => (
  <button
    type={type ?? 'button'}
    className={`${VARIANT_CLASS[variant]}${className ? ` ${className}` : ''}`}
    {...rest}
  >
    {icon && <i className={icon} aria-hidden="true"></i>}
    {children}
  </button>
);

export const PrimaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (p) => (
  <Button variant="primary" {...p} />
);
export const SecondaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (p) => (
  <Button variant="secondary" {...p} />
);
export const TertiaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (p) => (
  <Button variant="tertiary" {...p} />
);
