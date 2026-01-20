/**
 * Componente de ruta protegida
 * Requiere autenticación para acceder
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user.rol !== requiredRole && user.rol !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="card max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para acceder a esta sección.</p>
          <button
            onClick={() => window.history.back()}
            className="btn-primary mt-4"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }
  
  return children;
};

export default ProtectedRoute;
