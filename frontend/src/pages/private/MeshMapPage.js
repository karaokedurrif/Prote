/**
 * Página de Mapa en Tiempo Real
 * Visualización de posiciones mesh, vehículos y eventos
 */

import React, { useState } from 'react';
import LiveMeshMap from '../../components/LiveMeshMap';
import { Card } from '../../components/ui';

export default function MeshMapPage() {
  const [activeTab, setActiveTab] = useState('map');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">
            Mapa en Tiempo Real
          </h1>
          <p className="mt-1 text-gray-600">
            Tracking GPS de voluntarios (red mesh), vehículos y eventos activos
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('map')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'map'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🗺️ Mapa en Vivo
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'stats'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📊 Estadísticas
          </button>
        </nav>
      </div>

      {/* Contenido */}
      {activeTab === 'map' && (
        <Card>
          <Card.Body className="p-0">
            <LiveMeshMap height="calc(100vh - 300px)" />
          </Card.Body>
        </Card>
      )}

      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <Card.Body>
              <div className="text-center">
                <div className="text-4xl mb-2">📡</div>
                <div className="text-3xl font-bold text-primary-600">12</div>
                <div className="text-sm text-gray-600">Nodos activos</div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <div className="text-center">
                <div className="text-4xl mb-2">🚗</div>
                <div className="text-3xl font-bold text-blue-600">5</div>
                <div className="text-sm text-gray-600">Vehículos en servicio</div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <div className="text-center">
                <div className="text-4xl mb-2">⚠️</div>
                <div className="text-3xl font-bold text-warning-600">2</div>
                <div className="text-sm text-gray-600">Eventos activos</div>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}

      {/* Información adicional */}
      <Card className="bg-blue-50 border-blue-200">
        <Card.Body>
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Sobre el sistema de tracking</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  El sistema utiliza tecnología LoRa/Meshtastic para tracking GPS de bajo consumo.
                  Cada voluntario lleva un dispositivo que transmite su posición cada 30 segundos,
                  creando una red mesh que funciona incluso sin cobertura móvil.
                </p>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
