import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Alert, Modal } from '../../components/ui';
import api from '../../services/api';

export default function GrantsPage() {
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedGrant, setSelectedGrant] = useState(null);
  const [scraping, setScraping] = useState(false);

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
    if (!search.trim()) {
      fetchGrants();
      return;
    }
    setLoading(true);
    try {
      const response = await api.get('/grants', { params: { buscar: search } });
      setGrants(response.data);
    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSearch = async () => {
    setScraping(true);
    try {
      const response = await api.post('/grants/scrape');
      alert(`Scraping completado: ${response.data.nuevas || 0} subvenciones nuevas encontradas`);
      fetchGrants();
    } catch (error) {
      console.error('Error en scraping:', error);
      alert('Error al buscar subvenciones automáticamente');
    } finally {
      setScraping(false);
    }
  };

  const calculateDaysRemaining = (fechaLimite) => {
    if (!fechaLimite) return null;
    const today = new Date();
    const deadline = new Date(fechaLimite);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyBadge = (fechaLimite) => {
    const diasRestantes = calculateDaysRemaining(fechaLimite);
    if (diasRestantes === null) return <Badge color="gray">Sin fecha</Badge>;
    if (diasRestantes < 0) return <Badge color="gray">Cerrada</Badge>;
    if (diasRestantes < 7) return <Badge color="red">Urgente</Badge>;
    if (diasRestantes < 30) return <Badge color="orange">Próximo</Badge>;
    return <Badge color="green">Abierta</Badge>;
  };

  const filteredGrants = grants.filter(g => {
    if (filter === 'all') return true;
    if (filter === 'urgente') {
      const dias = calculateDaysRemaining(g.fecha_limite);
      return dias !== null && dias > 0 && dias < 7;
    }
    if (filter === 'abierta') return g.estado === 'abierta';
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
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleAutoSearch}
                disabled={scraping}
              >
                {scraping ? '⏳ Buscando...' : '🔍 Buscar nuevas'}
              </Button>
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
        <Button variant={filter === 'abierta' ? 'primary' : 'outline'} onClick={() => setFilter('abierta')}>✅ Abiertas</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-50">
          <div className="text-sm text-green-600 font-semibold">Abiertas</div>
          <div className="text-3xl font-bold text-green-900 mt-2">
            {grants.filter(g => g.estado === 'abierta').length}
          </div>
        </Card>
        <Card className="bg-orange-50">
          <div className="text-sm text-orange-600 font-semibold">Urgentes (&lt;7 días)</div>
          <div className="text-3xl font-bold text-orange-900 mt-2">
            {grants.filter(g => {
              const dias = calculateDaysRemaining(g.fecha_limite);
              return dias !== null && dias > 0 && dias < 7;
            }).length}
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
          {filteredGrants.map((grant) => {
            const diasRestantes = calculateDaysRemaining(grant.fecha_limite);
            return (
              <Card key={grant.id} className="hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg text-gray-900">{grant.titulo}</h3>
                      {getUrgencyBadge(grant.fecha_limite)}
                      <Badge color="purple">{grant.organismo}</Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{grant.descripcion}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">💰 Importe:</span>
                        <div className="font-semibold text-green-600">
                          {grant.importe_maximo ? `Hasta ${Number(grant.importe_maximo).toLocaleString()}€` : 'Variable'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">📅 Plazo:</span>
                        <div className="font-semibold">
                          {grant.fecha_limite ? new Date(grant.fecha_limite).toLocaleDateString('es-ES') : 'No especificado'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">⏰ Quedan:</span>
                        <div className={`font-semibold ${
                          diasRestantes === null ? 'text-gray-600' :
                          diasRestantes < 0 ? 'text-gray-600' :
                          diasRestantes < 7 ? 'text-red-600' :
                          diasRestantes < 30 ? 'text-orange-600' :
                          'text-green-600'
                        }`}>
                          {diasRestantes === null ? 'N/A' : diasRestantes < 0 ? 'Cerrada' : `${diasRestantes} días`}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">🎯 Relevancia:</span>
                        <div className="font-semibold text-blue-600">{grant.relevancia || 0}%</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Button 
                      size="sm" 
                      className="bg-blue-500 hover:bg-blue-600"
                      onClick={() => setSelectedGrant(grant)}
                    >
                      Ver detalles
                    </Button>
                    <Button size="sm" variant="outline">📄 Generar doc</Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de detalles */}
      {selectedGrant && (
        <Modal
          isOpen={!!selectedGrant}
          onClose={() => setSelectedGrant(null)}
          title={selectedGrant.titulo}
        >
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-1">Organismo convocante</h4>
              <p>{selectedGrant.organismo}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-700 mb-1">Descripción</h4>
              <p className="text-gray-600">{selectedGrant.descripcion}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Ámbito</h4>
                <Badge>{selectedGrant.ambito}</Badge>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Estado</h4>
                <Badge color={selectedGrant.estado === 'abierta' ? 'green' : 'gray'}>
                  {selectedGrant.estado}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Importe máximo</h4>
                <p className="text-green-600 font-bold">
                  {selectedGrant.importe_maximo ? `${Number(selectedGrant.importe_maximo).toLocaleString()}€` : 'No especificado'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Fecha límite</h4>
                <p className="font-semibold">
                  {selectedGrant.fecha_limite ? new Date(selectedGrant.fecha_limite).toLocaleDateString('es-ES') : 'No especificado'}
                </p>
              </div>
            </div>

            {selectedGrant.requisitos && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Requisitos</h4>
                <p className="text-gray-600 text-sm">{selectedGrant.requisitos}</p>
              </div>
            )}

            {selectedGrant.url_convocatoria && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">URL Convocatoria</h4>
                <a 
                  href={selectedGrant.url_convocatoria} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm break-all"
                >
                  {selectedGrant.url_convocatoria}
                </a>
              </div>
            )}

            {selectedGrant.palabras_clave && selectedGrant.palabras_clave.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Palabras clave</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedGrant.palabras_clave.map((palabra, idx) => (
                    <Badge key={idx} color="blue" size="sm">{palabra}</Badge>
                  ))}
                </div>
              </div>
            )}

            {selectedGrant.notas && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Notas internas</h4>
                <p className="text-gray-600 text-sm">{selectedGrant.notas}</p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                📄 Generar documentación
              </Button>
              <Button variant="outline" className="flex-1">
                📊 Análisis IA
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
