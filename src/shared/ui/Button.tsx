import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'inverse' | 'outline-inverse' | 'text';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-[2px] border font-semibold uppercase tracking-[0.12em] ' +
  'transition-all duration-150 cursor-pointer select-none text-center active:scale-[0.98] ' +
  'disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 aria-disabled:cursor-not-allowed aria-disabled:opacity-50';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-primary border-brand-primary text-surface-primary hover:bg-brand-primary-hover active:bg-brand-primary-active shadow-sm hover:shadow',
  secondary:
    'bg-transparent border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-surface-primary',
  inverse:
    'bg-surface-primary border-surface-primary text-brand-primary hover:bg-surface-secondary hover:border-surface-secondary shadow-sm hover:shadow',
  'outline-inverse':
    'bg-transparent border-accent-silver text-surface-primary hover:bg-surface-primary hover:text-brand-primary hover:border-surface-primary',
  text:
    'border-transparent bg-transparent text-brand-primary underline underline-offset-4 decoration-accent-silver hover:decoration-brand-primary px-0',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-4 text-xs',
  md: 'min-h-11 px-5 text-xs',
  lg: 'min-h-12 px-7 text-[0.8125rem]',
};

/** Class string shared by <Button> and anchors styled as buttons. */
export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className = ''): string {
  const sizeClass = variant === 'text' ? 'min-h-11 text-xs' : sizes[size];
  return `${base} ${variants[variant]} ${sizeClass} ${className}`.trim();
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', type = 'button', ...props }, ref) => (
    <button ref={ref} type={type} className={buttonClasses(variant, size, className)} {...props} />
  ),
);

Button.displayName = 'Button';
export default Button;
