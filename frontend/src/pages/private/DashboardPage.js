/**
 * Página del dashboard principal
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import { Card } from '../../components/ui';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    volunteers: 0,
    events: 0,
    inventory: 0,
    grants: 0,
    finances: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Intentar obtener estadísticas del backend
      const [volunteers, events, inventory, grants] = await Promise.all([
        api.get('/volunteers').catch(() => ({ data: [] })),
        api.get('/events').catch(() => ({ data: [] })),
        api.get('/inventory').catch(() => ({ data: [] })),
        api.get('/grants').catch(() => ({ data: [] }))
      ]);

      setStats({
        volunteers: volunteers.data?.length || volunteers.data?.total || 0,
        events: events.data?.length || events.data?.total || 0,
        inventory: inventory.data?.length || inventory.data?.total || 0,
        grants: grants.data?.length || grants.data?.total || 0,
        finances: 0
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Bienvenido, {user?.nombre}
        </h1>
        <p className="text-gray-600 mt-2">
          Panel de control del sistema de gestión ResqNet
        </p>
      </div>
      
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Link to="/voluntarios" className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100">Voluntarios</p>
              <p className="text-3xl font-bold mt-2">{loading ? '...' : stats.volunteers}</p>
            </div>
            <div className="text-4xl opacity-50">👥</div>
          </div>
        </Link>
        
        <Link to="/eventos" className="card bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100">Eventos</p>
              <p className="text-3xl font-bold mt-2">{loading ? '...' : stats.events}</p>
            </div>
            <div className="text-4xl opacity-50">📅</div>
          </div>
        </Link>
        
        <Link to="/inventario" className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100">Equipos</p>
              <p className="text-3xl font-bold mt-2">{loading ? '...' : stats.inventory}</p>
            </div>
            <div className="text-4xl opacity-50">📦</div>
          </div>
        </Link>
        
        <Link to="/subvenciones" className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-orange-100">Subvenciones</p>
              <p className="text-3xl font-bold mt-2">{loading ? '...' : stats.grants}</p>
            </div>
            <div className="text-4xl opacity-50">🔍</div>
          </div>
        </Link>
      </div>
            </div>
            <div className="text-4xl opacity-50">📦</div>
          </div>
        </div>
        
        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-orange-100">Balance</p>
              <p className="text-3xl font-bold mt-2">+12.5k€</p>
            </div>
            <div className="text-4xl opacity-50">💰</div>
          </div>
        </div>
      </div>
      
      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/eventos" className="card hover:shadow-lg transition">
          <div className="flex items-center">
            <div className="text-4xl mr-4">📅</div>
            <div>
              <h3 className="font-bold text-lg">Gestionar Eventos</h3>
              <p className="text-gray-600 text-sm">Crear y asignar servicios</p>
            </div>
          </div>
        </Link>
        
        <Link to="/voluntarios" className="card hover:shadow-lg transition">
          <div className="flex items-center">
            <div className="text-4xl mr-4">👥</div>
            <div>
              <h3 className="font-bold text-lg">Voluntarios</h3>
              <p className="text-gray-600 text-sm">Fichas y disponibilidad</p>
            </div>
          </div>
        </Link>
        
        <Link to="/mapa-mesh" className="card hover:shadow-lg transition">
          <div className="flex items-center">
            <div className="text-4xl mr-4">📡</div>
            <div>
              <h3 className="font-bold text-lg">Mapa en Tiempo Real</h3>
              <p className="text-gray-600 text-sm">Posiciones mesh</p>
            </div>
          </div>
        </Link>
        
        <Link to="/inventario" className="card hover:shadow-lg transition">
          <div className="flex items-center">
            <div className="text-4xl mr-4">📦</div>
            <div>
              <h3 className="font-bold text-lg">Inventario</h3>
              <p className="text-gray-600 text-sm">Equipos y mantenimiento</p>
            </div>
          </div>
        </Link>
        
        <Link to="/meteorologia" className="card hover:shadow-lg transition">
          <div className="flex items-center">
            <div className="text-4xl mr-4">🌤️</div>
            <div>
              <h3 className="font-bold text-lg">Meteorología</h3>
              <p className="text-gray-600 text-sm">Alertas y previsión</p>
            </div>
          </div>
        </Link>
        
        <Link to="/subvenciones" className="card hover:shadow-lg transition">
          <div className="flex items-center">
            <div className="text-4xl mr-4">🔍</div>
            <div>
              <h3 className="font-bold text-lg">Subvenciones</h3>
              <p className="text-gray-600 text-sm">Buscar financiación</p>
            </div>
          </div>
        </Link>
      </div>
      
      {/* Alertas recientes */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Alertas Recientes</h2>
        <div className="card">
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
              <span className="text-2xl mr-3">⚠️</span>
              <div className="flex-1">
                <p className="font-medium">3 equipos requieren mantenimiento</p>
                <p className="text-sm text-gray-600">Vencimiento próximo en 7 días</p>
              </div>
              <Link to="/inventario" className="text-primary-600 font-medium hover:underline">
                Ver
              </Link>
            </div>
            
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-2xl mr-3">📢</span>
              <div className="flex-1">
                <p className="font-medium">Nueva subvención detectada</p>
                <p className="text-sm text-gray-600">Equipamiento de protección civil - hasta 50.000€</p>
              </div>
              <Link to="/subvenciones" className="text-primary-600 font-medium hover:underline">
                Ver
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
