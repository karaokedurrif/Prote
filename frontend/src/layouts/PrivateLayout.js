/**
 * Layout privado
 * Layout para área de administración y gestión interna
 */

import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/authStore';

const PrivateLayout = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/voluntarios', icon: '👥', label: 'Voluntarios' },
    { path: '/eventos', icon: '📅', label: 'Eventos' },
    { path: '/inventario', icon: '📦', label: 'Inventario' },
    { path: '/finanzas', icon: '💰', label: 'Finanzas', roles: ['admin', 'tesorero'] },
    { path: '/subvenciones', icon: '🔍', label: 'Subvenciones', roles: ['admin'] },
    { path: '/registros-trial', icon: '🆕', label: 'Registros Trial', roles: ['admin'] },
    { path: '/mapa-mesh', icon: '📡', label: 'Mapa Mesh' },
    { path: '/meteorologia', icon: '🌤️', label: 'Meteorología' },
    { path: '/mapa-riesgos', icon: '🗺️', label: 'Mapa Riesgos' },
    { path: '/drones', icon: '🚁', label: 'Drones' },
  ];
  
  const filteredMenuItems = menuItems.filter(item => 
    !item.roles || item.roles.includes(user?.rol)
  );
  
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h2 className="font-bold text-lg">PC Sistema</h2>
                <p className="text-xs text-gray-400">{user?.rol}</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-800 rounded"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          {filteredMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center px-4 py-3 hover:bg-gray-800 transition"
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="ml-3">{item.label}</span>}
            </Link>
          ))}
        </nav>
        
        <div className="border-t border-gray-800 p-4">
          <Link to="/" className="flex items-center px-2 py-2 hover:bg-gray-800 rounded mb-2">
            <span className="text-xl">🌐</span>
            {sidebarOpen && <span className="ml-3">Sitio público</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center px-2 py-2 hover:bg-gray-800 rounded w-full text-left text-red-400"
          >
            <span className="text-xl">🚪</span>
            {sidebarOpen && <span className="ml-3">Cerrar sesión</span>}
          </button>
        </div>
      </aside>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              Gestión Interna
            </h1>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-medium text-gray-800">{user?.nombre} {user?.apellidos}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.nombre?.charAt(0)}{user?.apellidos?.charAt(0)}
              </div>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PrivateLayout;
