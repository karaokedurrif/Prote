import React from 'react';

/**
 * Componente de botón moderno y reutilizable
 * @param {string} variant - Variante del botón: 'primary', 'secondary', 'outline', 'ghost', 'success', 'danger'
 * @param {string} size - Tamaño del botón: 'sm', 'md', 'lg'
 * @param {boolean} loading - Estado de carga
 * @param {boolean} disabled - Estado deshabilitado
 * @param {string} className - Clases adicionales
 * @param {React.ReactNode} children - Contenido del botón
 * @param {React.ReactNode} icon - Icono opcional
 */
const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  disabled = false,
  className = '',
  children,
  icon,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg';
  
  const variants = {
    primary: 'bg-gradient-primary text-white shadow-medium hover:shadow-strong hover:scale-105 focus:ring-primary-500',
    secondary: 'bg-gradient-secondary text-white shadow-medium hover:shadow-strong hover:scale-105 focus:ring-secondary-500',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    success: 'bg-success-600 text-white hover:bg-success-700 shadow-medium hover:shadow-strong focus:ring-success-500',
    danger: 'bg-danger-600 text-white hover:bg-danger-700 shadow-medium hover:shadow-strong focus:ring-danger-500',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-6 py-3 text-base gap-2',
    lg: 'px-8 py-4 text-lg gap-3',
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Cargando...</span>
        </>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
