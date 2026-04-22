import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface NeoCardProps extends HTMLMotionProps<'div'> {
    children: React.ReactNode;
    variant?: 'default' | 'glass' | 'dark' | 'teal';
    className?: string;
    noPadding?: boolean;
}

export const NeoCard = ({ 
    children, 
    variant = 'default', 
    className = '', 
    noPadding = false,
    ...props 
}: NeoCardProps) => {
    const variants = {
        default: 'bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 shadow-soft-out',
        glass: 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl',
        dark: 'bg-brand-dark dark:bg-slate-950 text-white border border-white/5 shadow-2xl',
        teal: 'bg-gradient-to-br from-brand-teal to-brand-teal-600 text-white shadow-lg shadow-brand-teal/20'
    };

    return (
        <motion.div
            className={`
                rounded-[40px] 
                ${variants[variant]} 
                ${noPadding ? '' : 'p-8'} 
                transition-all duration-300
                ${className}
            `}
            {...props}
        >
            {children}
        </motion.div>
    );
};
