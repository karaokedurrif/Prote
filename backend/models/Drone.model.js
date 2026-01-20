/**
 * Modelo de Dron
 * Gestión de drones y vuelos
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Drone = sequelize.define('Drone', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  modelo: {
    type: DataTypes.STRING
  },
  numero_serie: {
    type: DataTypes.STRING
  },
  estado: {
    type: DataTypes.ENUM('operativo', 'mantenimiento', 'baja'),
    defaultValue: 'operativo'
  },
  tipo_vuelo: {
    type: DataTypes.ENUM('reconocimiento', 'busqueda', 'formacion', 'otro')
  },
  fecha_vuelo: {
    type: DataTypes.DATE
  },
  duracion_minutos: {
    type: DataTypes.INTEGER
  },
  piloto_id: {
    type: DataTypes.UUID,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  ubicacion_vuelo: {
    type: DataTypes.STRING
  },
  coordenadas: {
    type: DataTypes.GEOMETRY('POINT')
  },
  proposito: {
    type: DataTypes.TEXT
  },
  archivos_multimedia: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  observaciones: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'drones'
});

module.exports = Drone;
