/**
 * Mapa en Tiempo Real con Tracking Mesh
 * Muestra posiciones de voluntarios, vehículos y eventos en tiempo real
 */

import React, { useState, useEffect, useRef, Fragment } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import io from 'socket.io-client';
import 'leaflet/dist/leaflet.css';

// Fix para iconos de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Iconos personalizados
const createCustomIcon = (color, icon) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          transform: rotate(45deg);
          font-size: 16px;
          color: white;
        ">${icon}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const icons = {
  volunteer: createCustomIcon('#DC2626', '👤'),
  vehicle: createCustomIcon('#2563EB', '🚗'),
  ambulance: createCustomIcon('#DC2626', '🚑'),
  base: createCustomIcon('#059669', '🏠'),
  event: createCustomIcon('#F59E0B', '⚠️'),
  incident: createCustomIcon('#991B1B', '🆘')
};

const LiveMeshMap = ({ mode = 'full', height = '600px', showControls = true }) => {
  const [positions, setPositions] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showTrails, setShowTrails] = useState(false);
  const [trails, setTrails] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState({ volunteers: 0, vehicles: 0, events: 0 });
  
  const socketRef = useRef(null);
  const mapRef = useRef(null);

  // Centro por defecto (Soria, España - ajustar según tu ubicación)
  const defaultCenter = [41.7636, -2.4636];
  const defaultZoom = 12;

  useEffect(() => {
    // Conectar a WebSocket
    const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✓ Conectado al servidor WebSocket');
      setIsConnected(true);
      // Solicitar datos iniciales
      socket.emit('mesh:request-initial-data');
    });

    socket.on('disconnect', () => {
      console.log('✗ Desconectado del servidor WebSocket');
      setIsConnected(false);
    });

    // Recibir posiciones de mesh en tiempo real
    socket.on('mesh:position-update', (data) => {
      console.log('Posición actualizada:', data);
      setPositions(prev => {
        const index = prev.findIndex(p => p.node_id === data.node_id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = data;
          
          // Actualizar trail
          if (showTrails) {
            setTrails(prevTrails => ({
              ...prevTrails,
              [data.node_id]: [
                ...(prevTrails[data.node_id] || []).slice(-50), // Últimos 50 puntos
                [data.latitud, data.longitud]
              ]
            }));
          }
          
          return updated;
        } else {
          return [...prev, data];
        }
      });
    });

    // Recibir actualización de vehículos
    socket.on('vehicle:position-update', (data) => {
      setVehicles(prev => {
        const index = prev.findIndex(v => v.id === data.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = data;
          return updated;
        } else {
          return [...prev, data];
        }
      });
    });

    // Recibir eventos activos
    socket.on('event:update', (data) => {
      setEvents(prev => {
        const index = prev.findIndex(e => e.id === data.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = data;
          return updated;
        } else {
          return [...prev, data];
        }
      });
    });

    // Datos iniciales
    socket.on('mesh:initial-data', (data) => {
      console.log('Datos iniciales recibidos:', data);
      if (data.positions) setPositions(data.positions);
      if (data.vehicles) setVehicles(data.vehicles);
      if (data.events) setEvents(data.events);
    });

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, [showTrails]);

  // Actualizar estadísticas
  useEffect(() => {
    setStats({
      volunteers: positions.filter(p => p.tipo_nodo === 'voluntario').length,
      vehicles: vehicles.filter(v => v.en_servicio).length,
      events: events.filter(e => e.estado === 'activo').length
    });
  }, [positions, vehicles, events]);

  // Filtrar elementos según selección
  const getFilteredItems = () => {
    let filteredPositions = positions;
    let filteredVehicles = vehicles;
    let filteredEvents = events;

    if (selectedFilter !== 'all') {
      if (selectedFilter === 'volunteers') {
        filteredVehicles = [];
        filteredEvents = [];
      } else if (selectedFilter === 'vehicles') {
        filteredPositions = [];
        filteredEvents = [];
      } else if (selectedFilter === 'events') {
        filteredPositions = [];
        filteredVehicles = [];
      }
    }

    return { filteredPositions, filteredVehicles, filteredEvents };
  };

  const { filteredPositions, filteredVehicles, filteredEvents } = getFilteredItems();

  // Calcular tiempo transcurrido
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000); // segundos

    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  // Obtener color según batería
  const getBatteryColor = (battery) => {
    if (battery > 70) return '#10b981';
    if (battery > 30) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="relative" style={{ height }}>
      {/* Controles */}
      {showControls && (
        <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4 space-y-3">
          {/* Estado de conexión */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>

          {/* Estadísticas */}
          <div className="space-y-1 text-sm border-t pt-3">
            <div className="flex justify-between">
              <span className="text-gray-600">👤 Voluntarios:</span>
              <span className="font-semibold text-primary-600">{stats.volunteers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">🚗 Vehículos:</span>
              <span className="font-semibold text-blue-600">{stats.vehicles}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">⚠️ Eventos:</span>
              <span className="font-semibold text-warning-600">{stats.events}</span>
            </div>
          </div>

          {/* Filtros */}
          <div className="border-t pt-3 space-y-2">
            <label className="text-xs font-medium text-gray-700 block">Mostrar:</label>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="input text-sm w-full"
            >
              <option value="all">Todo</option>
              <option value="volunteers">Solo Voluntarios</option>
              <option value="vehicles">Solo Vehículos</option>
              <option value="events">Solo Eventos</option>
            </select>
          </div>

          {/* Toggle trails */}
          <div className="flex items-center space-x-2 border-t pt-3">
            <input
              type="checkbox"
              id="showTrails"
              checked={showTrails}
              onChange={(e) => setShowTrails(e.target.checked)}
              className="rounded text-primary-600"
            />
            <label htmlFor="showTrails" className="text-sm">
              Mostrar rutas
            </label>
          </div>

          {/* Leyenda */}
          <div className="border-t pt-3 space-y-1 text-xs">
            <div className="font-medium text-gray-700 mb-2">Leyenda:</div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-600 rounded-full"></div>
              <span>Voluntario</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
              <span>Vehículo</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-600 rounded-full"></div>
              <span>Base</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <span>Evento</span>
            </div>
          </div>
        </div>
      )}

      {/* Mapa */}
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marcadores de posiciones mesh (voluntarios) */}
        {filteredPositions.map((pos) => (
          <React.Fragment key={pos.node_id}>
            <Marker
              position={[pos.latitud, pos.longitud]}
              icon={icons.volunteer}
            >
              <Popup>
                <div className="text-sm space-y-1">
                  <div className="font-bold text-primary-600">
                    {pos.node_name || pos.node_id}
                  </div>
                  <div className="text-xs text-gray-600">
                    Tipo: {pos.tipo_nodo || 'Voluntario'}
                  </div>
                  <div className="text-xs">
                    Batería: 
                    <span style={{ color: getBatteryColor(pos.bateria) }} className="font-semibold ml-1">
                      {pos.bateria}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Última actualización: {getTimeAgo(pos.timestamp)}
                  </div>
                  {pos.altitud && (
                    <div className="text-xs text-gray-500">
                      Altitud: {pos.altitud}m
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>

            {/* Radio de precisión */}
            {pos.precision && (
              <Circle
                center={[pos.latitud, pos.longitud]}
                radius={pos.precision}
                pathOptions={{
                  color: '#DC2626',
                  fillColor: '#DC2626',
                  fillOpacity: 0.1,
                  weight: 1
                }}
              />
            )}

            {/* Trail (ruta recorrida) */}
            {showTrails && trails[pos.node_id] && trails[pos.node_id].length > 1 && (
              <Polyline
                positions={trails[pos.node_id]}
                pathOptions={{
                  color: '#DC2626',
                  weight: 2,
                  opacity: 0.6
                }}
              />
            )}
          </React.Fragment>
        ))}

        {/* Marcadores de vehículos */}
        {filteredVehicles.map((vehicle) => (
          vehicle.latitud_actual && vehicle.longitud_actual && (
            <React.Fragment key={vehicle.id}>
              <Marker
                position={[vehicle.latitud_actual, vehicle.longitud_actual]}
                icon={vehicle.tipo === 'ambulancia' ? icons.ambulance : icons.vehicle}
              >
                <Popup>
                  <div className="text-sm space-y-1">
                    <div className="font-bold text-blue-600">
                      {vehicle.matricula}
                    </div>
                    <div className="text-xs">
                      Tipo: {vehicle.tipo}
                    </div>
                    <div className="text-xs">
                      Estado: <span className={`font-semibold ${vehicle.disponible ? 'text-green-600' : 'text-red-600'}`}>
                        {vehicle.disponible ? 'Disponible' : 'En servicio'}
                      </span>
                    </div>
                    {vehicle.conductor_actual && (
                      <div className="text-xs text-gray-500">
                        Conductor: {vehicle.conductor_actual}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      Actualizado: {getTimeAgo(vehicle.ultima_actualizacion_gps)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          )
        ))}

        {/* Marcadores de eventos */}
        {filteredEvents.map((event) => (
          event.coordenadas && (
            <React.Fragment key={event.id}>
              <Marker
                position={[event.coordenadas.coordinates[1], event.coordenadas.coordinates[0]]}
                icon={event.tipo === 'emergencia' ? icons.incident : icons.event}
              >
                <Popup>
                  <div className="text-sm space-y-1">
                    <div className="font-bold text-orange-600">
                      {event.titulo}
                    </div>
                    <div className="text-xs">
                      Tipo: {event.tipo}
                    </div>
                    <div className="text-xs">
                      Estado: <span className="font-semibold">{event.estado}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Ubicación: {event.ubicacion}
                    </div>
                    {event.voluntarios_asignados > 0 && (
                      <div className="text-xs">
                        Voluntarios: {event.voluntarios_asignados}/{event.voluntarios_necesarios}
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>

              {/* Círculo de área de evento */}
              <Circle
                center={[event.coordenadas.coordinates[1], event.coordenadas.coordinates[0]]}
                radius={500}
                pathOptions={{
                  color: event.tipo === 'emergencia' ? '#991B1B' : '#F59E0B',
                  fillColor: event.tipo === 'emergencia' ? '#991B1B' : '#F59E0B',
                  fillOpacity: 0.1,
                  weight: 2
                }}
              />
            </React.Fragment>
          )
        ))}
      </MapContainer>

      {/* Indicador de carga */}
      {!isConnected && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-[1000]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Conectando al servidor...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveMeshMap;
