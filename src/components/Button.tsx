import React from 'react';

export type ButtonVariant = 'primary' | 'outline' | 'outline-dark' | 'ghost' | 'square-icon' | 'pill-icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', children, className = '', ...props }, ref) => {
    // Base styles: near-square radius (rounded-[2px]), transitions, single line, focus visible
    let baseStyles = 'inline-flex items-center justify-center font-medium transition-colors cursor-pointer select-none whitespace-nowrap shrink-0 rounded-[2px] disabled:opacity-50 disabled:cursor-not-allowed';

    let variantStyles = '';
    let sizeStyles = '';

    switch (variant) {
      case 'primary':
        variantStyles = 'bg-[#69388F] text-white hover:bg-[#7B43A6] active:bg-[#572E77] border border-transparent shadow-none';
        sizeStyles = size === 'sm' ? 'px-3 py-1.5 text-xs' : size === 'lg' ? 'px-6 py-3 text-sm tracking-wide' : 'px-4 py-2 text-xs md:text-sm';
        break;
      case 'outline':
        // Outlined for light surfaces (Shop by Category, Best Sellers)
        variantStyles = 'bg-transparent text-[#26102C] border border-[#DCD7DF] hover:border-[#26102C] hover:bg-[#F7F5F8] active:bg-[#EFEFEF]';
        sizeStyles = size === 'sm' ? 'px-3 py-1.5 text-xs' : size === 'lg' ? 'px-5 py-2.5 text-sm' : 'px-4 py-2 text-xs';
        break;
      case 'outline-dark':
        // Outlined for dark hero header
        variantStyles = 'bg-transparent text-white/90 border border-white/25 hover:border-white hover:text-white hover:bg-white/5 active:bg-white/10';
        sizeStyles = size === 'sm' ? 'px-3 py-1.5 text-xs' : size === 'lg' ? 'px-5 py-2.5 text-sm' : 'px-3.5 py-1.5 text-xs';
        break;
      case 'ghost':
        variantStyles = 'bg-transparent text-white/85 hover:text-white underline-offset-4 hover:underline border-b border-transparent hover:border-white/50';
        sizeStyles = 'px-3 py-2 text-xs md:text-sm';
        break;
      case 'square-icon':
        variantStyles = 'bg-transparent border border-white/25 text-white/90 hover:border-white hover:text-white hover:bg-white/5 active:bg-white/10';
        sizeStyles = 'w-9 h-9 min-w-[36px] min-h-[36px] p-0';
        break;
      case 'pill-icon':
        variantStyles = 'bg-[#69388F] text-white hover:bg-[#7B43A6] active:bg-[#572E77] rounded-full';
        sizeStyles = 'w-10 h-10 min-w-[40px] min-h-[40px] p-0';
        break;
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
