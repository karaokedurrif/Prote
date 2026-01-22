/**
 * Rutas de datos meteorológicos
 * Acceso a datos de estaciones y alertas
 */

const express = require('express');
const router = express.Router();
const { WeatherData } = require('../models');
const { optionalAuth } = require('../middleware/auth.middleware');
const logger = require('../config/logger');

/**
 * GET /api/weather/current
 * Obtener datos actuales en formato OpenWeatherMap
 */
router.get('/current', optionalAuth, async (req, res) => {
  try {
    const location = req.query.location || 'Palazuelos de Eresma';
    const weatherService = require('../services/weather.service');
    
    // Obtener datos directamente de OpenWeatherMap
    const weatherData = await weatherService.getCurrentWeather(location);
    
    res.json(weatherData);
    
  } catch (error) {
    logger.error('Error al obtener datos meteorológicos:', error);
    res.status(500).json({ error: 'Error al obtener datos meteorológicos' });
  }
});

/**
 * GET /api/weather/history
 * Obtener histórico de una estación
 */
router.get('/history', optionalAuth, async (req, res) => {
  try {
    const { estacion_id, desde, hasta } = req.query;
    
    if (!estacion_id) {
      return res.status(400).json({ error: 'estacion_id es requerido' });
    }
    
    const where = { estacion_id };
    
    if (desde && hasta) {
      where.timestamp = {
        [require('sequelize').Op.between]: [new Date(desde), new Date(hasta)]
      };
    }
    
    const datos = await WeatherData.findAll({
      where,
      order: [['timestamp', 'ASC']],
      limit: 1000
    });
    
    res.json(datos);
    
  } catch (error) {
    logger.error('Error al obtener histórico:', error);
    res.status(500).json({ error: 'Error al obtener histórico' });
  }
});

/**
 * GET /api/weather/alerts
 * Obtener alertas meteorológicas activas
 */
router.get('/alerts', optionalAuth, async (req, res) => {
  try {
    // Obtener últimos datos y verificar umbrales
    const datos = await WeatherData.findAll({
      order: [['timestamp', 'DESC']],
      limit: 10
    });
    
    const alertas = [];
    
    datos.forEach(dato => {
      // Alerta de temperatura extrema
      if (dato.temperatura > 35) {
        alertas.push({
          tipo: 'temperatura_alta',
          nivel: 'alto',
          mensaje: `Temperatura muy alta en ${dato.municipio}: ${dato.temperatura}°C`,
          estacion: dato.estacion_nombre,
          timestamp: dato.timestamp
        });
      }
      
      // Alerta de viento fuerte
      if (dato.velocidad_viento > 60) {
        alertas.push({
          tipo: 'viento_fuerte',
          nivel: 'critico',
          mensaje: `Viento muy fuerte en ${dato.municipio}: ${dato.velocidad_viento} km/h`,
          estacion: dato.estacion_nombre,
          timestamp: dato.timestamp
        });
      }
      
      // Alerta de precipitación intensa
      if (dato.precipitacion > 50) {
        alertas.push({
          tipo: 'precipitacion_intensa',
          nivel: 'alto',
          mensaje: `Precipitación intensa en ${dato.municipio}: ${dato.precipitacion} mm`,
          estacion: dato.estacion_nombre,
          timestamp: dato.timestamp
        });
      }
    });
    
    res.json(alertas);
    
  } catch (error) {
    logger.error('Error al obtener alertas:', error);
    res.status(500).json({ error: 'Error al obtener alertas' });
  }
});

module.exports = router;
