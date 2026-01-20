/**
 * Modelo de Proyecto
 * Gestión de proyectos y líneas de financiación
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  tipo: {
    type: DataTypes.ENUM(
      'subvencion',
      'donacion',
      'convenio',
      'proyecto_propio',
      'otro'
    ),
    defaultValue: 'proyecto_propio'
  },
  estado: {
    type: DataTypes.ENUM(
      'planificacion',
      'en_curso',
      'finalizado',
      'cancelado',
      'evaluacion'
    ),
    defaultValue: 'planificacion'
  },
  fecha_inicio: {
    type: DataTypes.DATEONLY
  },
  fecha_fin: {
    type: DataTypes.DATEONLY
  },
  presupuesto: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  gastado: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  responsable_id: {
    type: DataTypes.UUID,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  documentos: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  observaciones: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'proyectos'
});

module.exports = Project;
