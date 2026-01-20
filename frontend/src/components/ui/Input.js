import React from 'react';

/**
 * Componente Input moderno
 */
const Input = React.forwardRef(({ 
  label,
  error,
  helperText,
  icon,
  className = '',
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {props.required && <span className="text-danger-600 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
        
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-lg border transition-all duration-200
            ${icon ? 'pl-10' : ''}
            ${error 
              ? 'border-danger-500 focus:border-danger-500 focus:ring-2 focus:ring-danger-500/20' 
              : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
            }
            ${className}
          `}
          {...props}
        />
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-danger-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
