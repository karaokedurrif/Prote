import React from 'react';

/**
 * Componente Badge moderno
 * @param {string} variant - Variante del badge: 'primary', 'secondary', 'success', 'warning', 'danger', 'info'
 * @param {string} size - Tamaño: 'sm', 'md', 'lg'
 * @param {React.ReactNode} icon - Icono opcional
 */
const Badge = ({ 
  variant = 'primary', 
  size = 'md',
  icon,
  children, 
  className = '' 
}) => {
  const baseClasses = 'inline-flex items-center rounded-full font-medium';
  
  const variants = {
    primary: 'bg-primary-100 text-primary-800 ring-1 ring-inset ring-primary-600/20',
    secondary: 'bg-secondary-100 text-secondary-800 ring-1 ring-inset ring-secondary-600/20',
    success: 'bg-success-100 text-success-800 ring-1 ring-inset ring-success-600/20',
    warning: 'bg-warning-100 text-warning-800 ring-1 ring-inset ring-warning-600/20',
    danger: 'bg-danger-100 text-danger-800 ring-1 ring-inset ring-danger-600/20',
    info: 'bg-secondary-100 text-secondary-800 ring-1 ring-inset ring-secondary-600/20',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-xs gap-1.5',
    lg: 'px-4 py-1.5 text-sm gap-2',
  };

  return (
    <span className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
