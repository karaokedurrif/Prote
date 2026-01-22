import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge } from '../../components/ui';
import api from '../../services/api';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadge = (tipo) => {
    const types = {
      'emergencia': { color: 'red', label: '🚨 Emergencia' },
      'preventivo': { color: 'blue', label: '🛡️ Preventivo' },
      'formacion': { color: 'purple', label: '📚 Formación' },
      'social': { color: 'green', label: '🤝 Social' }
    };
    const type = types[tipo] || { color: 'gray', label: tipo };
    return <Badge color={type.color}>{type.label}</Badge>;
  };

  const filteredEvents = filter === 'all' ? events : events.filter(e => e.tipo === filter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Eventos</h1>
          <p className="text-gray-600 mt-1">Planificación y seguimiento de actividades</p>
        </div>
        <Button className="bg-blue-500 hover:bg-blue-600">+ Nuevo Evento</Button>
      </div>

      <div className="flex gap-2">
        <Button 
          variant={filter === 'all' ? 'primary' : 'outline'}
          onClick={() => setFilter('all')}
        >
          Todos
        </Button>
        <Button 
          variant={filter === 'emergencia' ? 'primary' : 'outline'}
          onClick={() => setFilter('emergencia')}
        >
          🚨 Emergencias
        </Button>
        <Button 
          variant={filter === 'preventivo' ? 'primary' : 'outline'}
          onClick={() => setFilter('preventivo')}
        >
          🛡️ Preventivos
        </Button>
        <Button 
          variant={filter === 'formacion' ? 'primary' : 'outline'}
          onClick={() => setFilter('formacion')}
        >
          📚 Formación
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-red-50">
          <div className="text-sm text-red-600 font-semibold">Emergencias</div>
          <div className="text-3xl font-bold text-red-900 mt-2">
            {events.filter(e => e.tipo === 'emergencia').length}
          </div>
        </Card>
        <Card className="bg-blue-50">
          <div className="text-sm text-blue-600 font-semibold">Preventivos</div>
          <div className="text-3xl font-bold text-blue-900 mt-2">
            {events.filter(e => e.tipo === 'preventivo').length}
          </div>
        </Card>
        <Card className="bg-purple-50">
          <div className="text-sm text-purple-600 font-semibold">Formación</div>
          <div className="text-3xl font-bold text-purple-900 mt-2">
            {events.filter(e => e.tipo === 'formacion').length}
          </div>
        </Card>
        <Card className="bg-green-50">
          <div className="text-sm text-green-600 font-semibold">Este Mes</div>
          <div className="text-3xl font-bold text-green-900 mt-2">
            {events.filter(e => new Date(e.fecha_inicio).getMonth() === new Date().getMonth()).length}
          </div>
        </Card>
      </div>

      <Card>
        <Table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Tipo</th>
              <th>Fecha</th>
              <th>Ubicación</th>
              <th>Voluntarios</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center py-8">Cargando...</td></tr>
            ) : filteredEvents.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-8 text-gray-500">No hay eventos</td></tr>
            ) : (
              filteredEvents.map((event) => (
                <tr key={event.id}>
                  <td className="font-semibold">{event.titulo}</td>
                  <td>{getTypeBadge(event.tipo)}</td>
                  <td>{new Date(event.fecha_inicio).toLocaleDateString('es-ES')}</td>
                  <td className="text-sm text-gray-600">{event.ubicacion}</td>
                  <td>
                    <Badge color="blue">{event.voluntarios_necesarios || 0} necesarios</Badge>
                  </td>
                  <td>
                    <Button size="sm" variant="outline">Ver</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
