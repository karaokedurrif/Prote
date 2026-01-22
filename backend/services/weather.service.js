/**
 * Servicio de datos meteorológicos
 * Obtiene datos de APIs y genera alertas
 */

const axios = require('axios');
const { WeatherData } = require('../models');
const logger = require('../config/logger');

class WeatherService {
  constructor() {
    this.io = null;
    this.monitoringInterval = null;
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    
    // Estaciones locales configuradas
    this.estaciones = [
      {
        id: 'EST001',
        nombre: 'Palazuelos de Eresma',
        municipio: 'Palazuelos de Eresma',
        latitud: 40.9167,
        longitud: -4.0333
      }
    ];
  }

  /**
   * Obtener clima actual para el frontend
   */
  async getCurrentWeather(location = 'Palazuelos de Eresma') {
    try {
      if (!this.apiKey) {
        throw new Error('API key de OpenWeather no configurada');
      }

      // Obtener datos actuales
      const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)},ES&appid=${this.apiKey}&units=metric&lang=es`;
      const currentResponse = await axios.get(currentUrl);
      const current = currentResponse.data;

      // Obtener pronóstico
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)},ES&appid=${this.apiKey}&units=metric&lang=es`;
      const forecastResponse = await axios.get(forecastUrl);
      
      // Procesar pronóstico (agrupar por día)
      const dailyForecast = this.processForecast(forecastResponse.data.list);

      return {
        current: {
          location: current.name,
          temp: current.main.temp,
          feels_like: current.main.feels_like,
          temp_min: current.main.temp_min,
          temp_max: current.main.temp_max,
          pressure: current.main.pressure,
          humidity: current.main.humidity,
          visibility: current.visibility,
          wind_speed: current.wind.speed,
          wind_deg: current.wind.deg,
          clouds: current.clouds.all,
          condition: current.weather[0].main,
          description: current.weather[0].description,
          icon: current.weather[0].icon,
          sunrise: current.sys.sunrise,
          sunset: current.sys.sunset,
          rain: current.rain || null
        },
        forecast: dailyForecast,
        alerts: []
      };
    } catch (error) {
      logger.error('Error obteniendo clima:', error.message);
      throw error;
    }
  }

  /**
   * Procesar pronóstico para obtener datos diarios
   */
  processForecast(list) {
    const dailyData = {};
    
    list.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString('es-ES');
      if (!dailyData[date]) {
        dailyData[date] = {
          dt: item.dt,
          temp: { min: item.main.temp, max: item.main.temp },
          humidity: item.main.humidity,
          weather: item.weather
        };
      } else {
        dailyData[date].temp.min = Math.min(dailyData[date].temp.min, item.main.temp);
        dailyData[date].temp.max = Math.max(dailyData[date].temp.max, item.main.temp);
      }
    });

    return Object.values(dailyData).slice(0, 5);
  }

  /**
   * Iniciar monitoreo meteorológico
   */
  startWeatherMonitoring(io) {
    this.io = io;
    
    // Obtener datos cada hora
    this.monitoringInterval = setInterval(() => {
      this.fetchAllWeatherData();
    }, 60 * 60 * 1000); // 1 hora
    
    // Obtener datos inmediatamente
    this.fetchAllWeatherData();
    
    logger.info('Monitoreo meteorológico iniciado');
  }

  /**
   * Obtener datos de todas las estaciones
   */
  async fetchAllWeatherData() {
    for (const estacion of this.estaciones) {
      await this.fetchStationData(estacion);
    }
  }

  /**
   * Obtener datos de una estación específica
   */
  async fetchStationData(estacion) {
    try {
      if (!this.apiKey) {
        logger.warn('API key de OpenWeather no configurada, usando datos simulados');
        return this.saveSimulatedData(estacion);
      }
      
      // Llamar a OpenWeatherMap API
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${estacion.latitud}&lon=${estacion.longitud}&appid=${this.apiKey}&units=metric&lang=es`;
      
      const response = await axios.get(url);
      const data = response.data;
      
      // Guardar en base de datos
      const weatherData = await WeatherData.create({
        estacion_id: estacion.id,
        estacion_nombre: estacion.nombre,
        municipio: estacion.municipio,
        latitud: estacion.latitud,
        longitud: estacion.longitud,
        temperatura: data.main.temp,
        humedad: data.main.humidity,
        presion: data.main.pressure,
        velocidad_viento: data.wind.speed * 3.6, // m/s a km/h
        direccion_viento: data.wind.deg,
        precipitacion: data.rain ? data.rain['1h'] || 0 : 0,
        visibilidad: data.visibility,
        datos_raw: data,
        timestamp: new Date()
      });
      
      // Verificar alertas
      this.checkAlerts(weatherData);
      
      logger.debug(`Datos meteorológicos actualizados: ${estacion.nombre}`);
      
    } catch (error) {
      logger.error(`Error al obtener datos meteorológicos de ${estacion.nombre}:`, error.message);
      // Usar datos simulados en caso de error
      this.saveSimulatedData(estacion);
    }
  }

  /**
   * Guardar datos simulados (desarrollo/pruebas)
   */
  async saveSimulatedData(estacion) {
    try {
      const weatherData = await WeatherData.create({
        estacion_id: estacion.id,
        estacion_nombre: estacion.nombre,
        municipio: estacion.municipio,
        latitud: estacion.latitud,
        longitud: estacion.longitud,
        temperatura: 15 + Math.random() * 15,
        humedad: 40 + Math.random() * 40,
        presion: 1000 + Math.random() * 30,
        velocidad_viento: Math.random() * 40,
        direccion_viento: Math.floor(Math.random() * 360),
        precipitacion: Math.random() < 0.3 ? Math.random() * 10 : 0,
        indice_uv: Math.random() * 10,
        visibilidad: 5000 + Math.random() * 5000,
        timestamp: new Date()
      });
      
      this.checkAlerts(weatherData);
      
    } catch (error) {
      logger.error('Error al guardar datos simulados:', error);
    }
  }

  /**
   * Verificar umbrales y generar alertas
   */
  checkAlerts(weatherData) {
    const alertas = [];
    
    // Alerta de temperatura extrema
    if (weatherData.temperatura > 35) {
      alertas.push({
        tipo: 'temperatura_alta',
        nivel: 'alto',
        mensaje: `Temperatura muy alta en ${weatherData.municipio}: ${weatherData.temperatura.toFixed(1)}°C`,
        datos: weatherData
      });
    } else if (weatherData.temperatura < 0) {
      alertas.push({
        tipo: 'helada',
        nivel: 'medio',
        mensaje: `Riesgo de heladas en ${weatherData.municipio}: ${weatherData.temperatura.toFixed(1)}°C`,
        datos: weatherData
      });
    }
    
    // Alerta de viento fuerte
    if (weatherData.velocidad_viento > 60) {
      alertas.push({
        tipo: 'viento_fuerte',
        nivel: 'critico',
        mensaje: `Viento muy fuerte en ${weatherData.municipio}: ${weatherData.velocidad_viento.toFixed(0)} km/h`,
        datos: weatherData
      });
    } else if (weatherData.velocidad_viento > 40) {
      alertas.push({
        tipo: 'viento_moderado',
        nivel: 'medio',
        mensaje: `Viento moderado en ${weatherData.municipio}: ${weatherData.velocidad_viento.toFixed(0)} km/h`,
        datos: weatherData
      });
    }
    
    // Alerta de precipitación intensa
    if (weatherData.precipitacion > 50) {
      alertas.push({
        tipo: 'precipitacion_intensa',
        nivel: 'alto',
        mensaje: `Precipitación intensa en ${weatherData.municipio}: ${weatherData.precipitacion.toFixed(1)} mm`,
        datos: weatherData
      });
    }
    
    // Índice de riesgo de incendio (basado en temperatura, humedad y viento)
    const riesgoIncendio = this.calcularRiesgoIncendio(weatherData);
    if (riesgoIncendio >= 80) {
      alertas.push({
        tipo: 'riesgo_incendio',
        nivel: 'critico',
        mensaje: `Riesgo CRÍTICO de incendio en ${weatherData.municipio}`,
        datos: { ...weatherData.toJSON(), indice_riesgo: riesgoIncendio }
      });
    } else if (riesgoIncendio >= 60) {
      alertas.push({
        tipo: 'riesgo_incendio',
        nivel: 'alto',
        mensaje: `Riesgo ALTO de incendio en ${weatherData.municipio}`,
        datos: { ...weatherData.toJSON(), indice_riesgo: riesgoIncendio }
      });
    }
    
    // Emitir alertas vía WebSocket
    if (alertas.length > 0 && this.io) {
      alertas.forEach(alerta => {
        this.io.to('weather-alerts').emit('weather-alert', alerta);
        logger.warn(`ALERTA METEOROLÓGICA: ${alerta.mensaje}`);
      });
    }
  }

  /**
   * Calcular índice de riesgo de incendio
   */
  calcularRiesgoIncendio(weatherData) {
    let indice = 0;
    
    // Factor temperatura (0-40 puntos)
    if (weatherData.temperatura > 30) {
      indice += 40;
    } else if (weatherData.temperatura > 25) {
      indice += 30;
    } else if (weatherData.temperatura > 20) {
      indice += 20;
    }
    
    // Factor humedad (0-30 puntos, inverso)
    if (weatherData.humedad < 30) {
      indice += 30;
    } else if (weatherData.humedad < 50) {
      indice += 20;
    } else if (weatherData.humedad < 70) {
      indice += 10;
    }
    
    // Factor viento (0-30 puntos)
    if (weatherData.velocidad_viento > 40) {
      indice += 30;
    } else if (weatherData.velocidad_viento > 25) {
      indice += 20;
    } else if (weatherData.velocidad_viento > 15) {
      indice += 10;
    }
    
    return indice;
  }

  /**
   * Detener monitoreo
   */
  stopWeatherMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      logger.info('Monitoreo meteorológico detenido');
    }
  }
}

module.exports = new WeatherService();
