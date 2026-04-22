import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, leftIcon: LeftIcon, rightIcon: RightIcon, children, disabled, onAnimationStart, onDragStart, onDragEnd, onDrag, onPointerDown, ...props }, ref) => {
    
    
    const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-brand-teal-400/50';
    
    const variants = {
      primary: 'bg-brand-teal-600 text-white shadow-lg shadow-brand-teal-600/20 hover:bg-brand-teal-700',
      secondary: 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-soft-out hover:shadow-soft-hover border border-slate-50 dark:border-slate-700',
      ghost: 'bg-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50',
      danger: 'bg-red-500 text-white shadow-[0_8px_20px_rgba(239,68,68,0.3)] hover:bg-red-600',
    };

    const sizes = {
      sm: 'h-10 px-4 text-xs rounded-xl',
      md: 'h-12 px-6 text-sm rounded-xl',
      lg: 'h-14 px-8 text-base rounded-2xl',
      icon: 'h-12 w-12 rounded-xl p-0',
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.96 }}
        disabled={isLoading || disabled}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
        ) : (
          <>
            {LeftIcon && <LeftIcon size={size === 'sm' ? 14 : 18} className={children ? 'mr-2' : ''} />}
            {children}
            {RightIcon && <RightIcon size={size === 'sm' ? 14 : 18} className={children ? 'ml-2' : ''} />}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
