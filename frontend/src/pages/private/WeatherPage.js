/**
 * Página de Meteorología y Alertas
 * Integración con OpenWeatherMap API
 */

import React, { useState, useEffect } from 'react';
import { Card, Alert, Badge } from '../../components/ui';
import api from '../../services/api';

export default function WeatherPage() {
  const [weatherData, setWeatherData] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('Palazuelos de Eresma');

  useEffect(() => {
    fetchWeatherData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/weather/current?location=${location}`);
      setWeatherData(response.data.current);
      setForecast(response.data.forecast || []);
      setAlerts(response.data.alerts || []);
    } catch (error) {
      console.error('Error al obtener datos meteorológicos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition) => {
    const icons = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Snow': '❄️',
      'Thunderstorm': '⛈️',
      'Drizzle': '🌦️',
      'Mist': '🌫️',
      'Fog': '🌫️'
    };
    return icons[condition] || '🌤️';
  };

  const getAlertColor = (severity) => {
    const colors = {
      'extreme': 'red',
      'severe': 'orange',
      'moderate': 'yellow',
      'minor': 'blue'
    };
    return colors[severity] || 'gray';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos meteorológicos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Meteorología y Alertas
          </h1>
          <p className="text-gray-600 mt-1">
            Condiciones actuales y pronóstico extendido
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ciudad..."
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={fetchWeatherData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      {/* Alertas Meteorológicas */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, idx) => (
            <Alert key={idx} type="warning" className="border-l-4 border-orange-500">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <h3 className="font-bold text-orange-900">{alert.event}</h3>
                  <p className="text-sm text-orange-800 mt-1">{alert.description}</p>
                  <Badge color={getAlertColor(alert.severity)} className="mt-2">
                    {alert.severity?.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {/* Condiciones Actuales */}
      {weatherData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Temperatura Principal */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold opacity-90">{weatherData.location}</h2>
                <div className="flex items-center gap-4 mt-4">
                  <span className="text-6xl">{getWeatherIcon(weatherData.condition)}</span>
                  <div>
                    <div className="text-5xl font-bold">{Math.round(weatherData.temp)}°C</div>
                    <div className="text-lg opacity-90 mt-1">{weatherData.description}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-6 text-sm">
                  <div>
                    <div className="opacity-75">Sensación</div>
                    <div className="text-lg font-semibold">{Math.round(weatherData.feels_like)}°C</div>
                  </div>
                  <div>
                    <div className="opacity-75">Mín / Máx</div>
                    <div className="text-lg font-semibold">
                      {Math.round(weatherData.temp_min)}° / {Math.round(weatherData.temp_max)}°
                    </div>
                  </div>
                  <div>
                    <div className="opacity-75">Presión</div>
                    <div className="text-lg font-semibold">{weatherData.pressure} hPa</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Detalles Adicionales */}
          <Card>
            <h3 className="font-bold text-lg mb-4">Detalles</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">💧 Humedad</span>
                <span className="font-semibold">{weatherData.humidity}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">💨 Viento</span>
                <span className="font-semibold">{Math.round(weatherData.wind_speed * 3.6)} km/h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">👁️ Visibilidad</span>
                <span className="font-semibold">{(weatherData.visibility / 1000).toFixed(1)} km</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">☁️ Nubosidad</span>
                <span className="font-semibold">{weatherData.clouds}%</span>
              </div>
              {weatherData.rain && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">🌧️ Lluvia (1h)</span>
                  <span className="font-semibold">{weatherData.rain['1h']} mm</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">🌅 Amanecer</span>
                <span className="font-semibold">
                  {new Date(weatherData.sunrise * 1000).toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">🌇 Atardecer</span>
                <span className="font-semibold">
                  {new Date(weatherData.sunset * 1000).toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Pronóstico 5 Días */}
      {forecast.length > 0 && (
        <Card>
          <h3 className="font-bold text-lg mb-4">Pronóstico 5 Días</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {forecast.slice(0, 5).map((day, idx) => (
              <div key={idx} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-semibold text-gray-600">
                  {new Date(day.dt * 1000).toLocaleDateString('es-ES', { weekday: 'short' })}
                </div>
                <div className="text-3xl my-2">{getWeatherIcon(day.weather[0].main)}</div>
                <div className="text-sm text-gray-600">{day.weather[0].description}</div>
                <div className="mt-2 font-semibold">
                  <span className="text-blue-600">{Math.round(day.temp.max)}°</span>
                  {' / '}
                  <span className="text-gray-500">{Math.round(day.temp.min)}°</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  💧 {day.humidity}%
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Mapa de Radar (Placeholder) */}
      <Card>
        <h3 className="font-bold text-lg mb-4">Radar Meteorológico</h3>
        <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <span className="text-4xl mb-2 block">🗺️</span>
            <p>Integración con radar meteorológico</p>
            <p className="text-sm mt-1">(Próximamente)</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
