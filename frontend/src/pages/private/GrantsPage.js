import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Alert } from '../../components/ui';
import api from '../../services/api';

export default function GrantsPage() {
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchGrants();
  }, []);

  const fetchGrants = async () => {
    try {
      const response = await api.get('/grants');
      setGrants(response.data);
    } catch (error) {
      console.error('Error al cargar subvenciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await api.post('/grants/search', { keywords: search });
      setGrants(response.data);
    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyBadge = (diasRestantes) => {
    if (diasRestantes < 7) return <Badge color="red">Urgente</Badge>;
    if (diasRestantes < 30) return <Badge color="orange">Próximo</Badge>;
    return <Badge color="green">Abierto</Badge>;
  };

  const filteredGrants = grants.filter(g => {
    if (filter === 'all') return true;
    if (filter === 'urgente') return g.dias_restantes < 7;
    if (filter === 'abierto') return g.estado === 'abierto';
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Buscador de Subvenciones</h1>
        <p className="text-gray-600 mt-1">Sistema inteligente de búsqueda y seguimiento de financiación</p>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <span className="text-3xl">🤖</span>
          <div className="flex-1">
            <h3 className="font-bold text-blue-900">Asistente IA de Subvenciones</h3>
            <p className="text-sm text-blue-800 mt-1">
              Scraping automático de portales oficiales, análisis de viabilidad y generación de documentación
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">🔍 Buscar nuevas</Button>
              <Button size="sm" variant="outline">📄 Generar solicitud</Button>
              <Button size="sm" variant="outline">📊 Análisis viabilidad</Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por palabras clave..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button onClick={handleSearch} className="bg-blue-500 hover:bg-blue-600">
          🔍 Buscar
        </Button>
      </div>

      <div className="flex gap-2">
        <Button variant={filter === 'all' ? 'primary' : 'outline'} onClick={() => setFilter('all')}>Todas</Button>
        <Button variant={filter === 'urgente' ? 'primary' : 'outline'} onClick={() => setFilter('urgente')}>⚠️ Urgentes</Button>
        <Button variant={filter === 'abierto' ? 'primary' : 'outline'} onClick={() => setFilter('abierto')}>✅ Abiertas</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-50">
          <div className="text-sm text-green-600 font-semibold">Abiertas</div>
          <div className="text-3xl font-bold text-green-900 mt-2">
            {grants.filter(g => g.estado === 'abierto').length}
          </div>
        </Card>
        <Card className="bg-orange-50">
          <div className="text-sm text-orange-600 font-semibold">Urgentes (&lt;7 días)</div>
          <div className="text-3xl font-bold text-orange-900 mt-2">
            {grants.filter(g => g.dias_restantes < 7).length}
          </div>
        </Card>
        <Card className="bg-blue-50">
          <div className="text-sm text-blue-600 font-semibold">Total Encontradas</div>
          <div className="text-3xl font-bold text-blue-900 mt-2">{grants.length}</div>
        </Card>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Buscando subvenciones...</p>
        </div>
      ) : filteredGrants.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-500">
            <span className="text-4xl block mb-2">🔍</span>
            <p>No se encontraron subvenciones</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredGrants.map((grant) => (
            <Card key={grant.id} className="hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{grant.titulo}</h3>
                    {getUrgencyBadge(grant.dias_restantes)}
                    <Badge color="purple">{grant.organismo}</Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{grant.descripcion}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">💰 Importe:</span>
                      <div className="font-semibold text-green-600">
                        {grant.importe_max ? `Hasta ${grant.importe_max.toLocaleString()}€` : 'Variable'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">📅 Plazo:</span>
                      <div className="font-semibold">{new Date(grant.fecha_fin).toLocaleDateString('es-ES')}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">⏰ Quedan:</span>
                      <div className={`font-semibold ${
                        grant.dias_restantes < 7 ? 'text-red-600' :
                        grant.dias_restantes < 30 ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        {grant.dias_restantes} días
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">🎯 Viabilidad:</span>
                      <div className="font-semibold text-blue-600">{grant.viabilidad || 'N/A'}%</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <Button size="sm" className="bg-blue-500 hover:bg-blue-600">Ver detalles</Button>
                  <Button size="sm" variant="outline">📄 Generar doc</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
