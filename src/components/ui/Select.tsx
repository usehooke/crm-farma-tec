import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  containerClassName?: string;
}

const SelectBase: React.ForwardRefRenderFunction<HTMLSelectElement, SelectProps> = (props, ref) => {
  const { label, error, options, containerClassName = '', className = '', id, ...rest } = props;
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${selectId}-error`;

  return (
    <div className={`w-full space-y-2 ${containerClassName}`}>
      {label ? (
        <label 
          htmlFor={selectId} 
          className="text-xs font-black text-slate-500 dark:text-slate-400 ml-2 uppercase tracking-widest"
        >
          {label}
        </label>
      ) : null}
      
      <div className="relative group">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`
            w-full bg-surface shadow-soft-in rounded-xl px-4 py-4 text-sm font-bold text-brand-dark dark:text-white outline-none 
            border-2 border-transparent focus:border-brand-teal-400/30 transition-all appearance-none
            ${error ? 'border-red-300 bg-red-50/5 focus:border-red-400/50' : ''}
            ${rest.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${className}
          `}
          {...rest}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
          <ChevronDown size={18} />
        </div>
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

export const Select = React.forwardRef(SelectBase);

Select.displayName = 'Select';
