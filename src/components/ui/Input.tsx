import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: LucideIcon;
  containerClassName?: string;
}

const InputBase: React.ForwardRefRenderFunction<HTMLInputElement, InputProps> = (props, ref) => {
  const { 
    label, 
    error, 
    leftIcon: LeftIcon, 
    containerClassName = '', 
    className = '', 
    id, 
    ...rest 
  } = props;
  
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${inputId}-error`;

  return (
    <div className={`w-full space-y-2 ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={inputId} 
          className="text-xs font-black text-slate-500 dark:text-slate-400 ml-2 uppercase tracking-widest block"
        >
          {label}
        </label>
      )}
      
      <div className="relative group">
        {LeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-teal-600 transition-colors">
            <LeftIcon size={18} />
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`
            w-full bg-white dark:bg-slate-800 shadow-soft-in rounded-xl px-4 py-3.5 text-base font-bold text-brand-dark dark:text-white outline-none 
            border-2 border-slate-100 dark:border-slate-700 focus:border-brand-teal-600 focus:bg-white transition-all 
            placeholder:text-slate-400 dark:placeholder:text-slate-500
            ${LeftIcon ? 'pl-11' : ''}
            ${error ? 'border-red-300 bg-red-50/5 focus:border-red-400/50' : ''}
            ${rest.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${className}
          `}
          {...rest}
        />
      </div>
      
      {error && (
        <p 
          id={errorId} 
          className="text-[10px] font-black text-red-500 ml-3 uppercase tracking-tighter"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export const Input = React.forwardRef(InputBase);

Input.displayName = 'Input';
