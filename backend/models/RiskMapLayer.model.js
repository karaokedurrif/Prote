/**
 * Modelo de Capa de Mapa de Riesgos
 * Gestión de capas interactivas del mapa de riesgos
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RiskMapLayer = sequelize.define('RiskMapLayer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM(
      'inundacion',
      'incendio',
      'personas_vulnerables',
      'rutas_evacuacion',
      'puntos_reunion',
      'recursos',
      'otro'
    ),
    allowNull: false
  },
  geometria: {
    type: DataTypes.GEOMETRY('GEOMETRY'),
    allowNull: false
  },
  propiedades: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  nivel_riesgo: {
    type: DataTypes.ENUM('bajo', 'medio', 'alto', 'critico')
  },
  activa: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#FF0000'
  },
  icono: {
    type: DataTypes.STRING
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  municipio: {
    type: DataTypes.STRING
  },
  creado_por: {
    type: DataTypes.UUID,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  }
}, {
  tableName: 'mapa_riesgos'
});

module.exports = RiskMapLayer;
