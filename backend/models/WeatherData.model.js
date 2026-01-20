/**
 * Modelo de Datos Meteorológicos
 * Almacena datos de estaciones meteorológicas locales
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WeatherData = sequelize.define('WeatherData', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  estacion_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  estacion_nombre: {
    type: DataTypes.STRING
  },
  municipio: {
    type: DataTypes.STRING
  },
  latitud: {
    type: DataTypes.DECIMAL(10, 8)
  },
  longitud: {
    type: DataTypes.DECIMAL(11, 8)
  },
  temperatura: {
    type: DataTypes.DECIMAL(5, 2)
  },
  humedad: {
    type: DataTypes.DECIMAL(5, 2)
  },
  presion: {
    type: DataTypes.DECIMAL(7, 2)
  },
  velocidad_viento: {
    type: DataTypes.DECIMAL(5, 2)
  },
  direccion_viento: {
    type: DataTypes.INTEGER
  },
  precipitacion: {
    type: DataTypes.DECIMAL(6, 2)
  },
  indice_uv: {
    type: DataTypes.DECIMAL(4, 2)
  },
  visibilidad: {
    type: DataTypes.INTEGER
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  datos_raw: {
    type: DataTypes.JSONB
  }
}, {
  tableName: 'datos_meteorologicos',
  indexes: [
    {
      fields: ['estacion_id']
    },
    {
      fields: ['timestamp']
    },
    {
      fields: ['municipio']
    }
  ]
});

module.exports = WeatherData;
