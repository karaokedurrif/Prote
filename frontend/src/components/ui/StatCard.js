import React from 'react';

/**
 * Componente StatCard para métricas del dashboard
 */
const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'positive', 
  icon, 
  trend,
  className = '' 
}) => {
  return (
    <div className={`stat-card ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="stat-label">{title}</p>
          <p className="stat-value">{value}</p>
          
          {change && (
            <div className="flex items-center gap-2 mt-2">
              <span className={`stat-change ${changeType}`}>
                {changeType === 'positive' && '↑'}
                {changeType === 'negative' && '↓'}
                {' '}{change}
              </span>
              {trend && <span className="text-xs text-gray-500">{trend}</span>}
            </div>
          )}
        </div>
        
        {icon && (
          <div className="flex-shrink-0 p-3 bg-gradient-primary rounded-lg text-white shadow-medium">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
