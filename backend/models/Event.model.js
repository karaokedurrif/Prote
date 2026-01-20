/**
 * Modelo de Evento
 * Gestión de eventos, servicios preventivos, simulacros y reuniones
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  tipo: {
    type: DataTypes.ENUM(
      'servicio_preventivo',
      'emergencia',
      'simulacro',
      'formacion',
      'reunion',
      'evento_social',
      'otro'
    ),
    allowNull: false
  },
  fecha_inicio: {
    type: DataTypes.DATE,
    allowNull: false
  },
  fecha_fin: {
    type: DataTypes.DATE,
    allowNull: false
  },
  ubicacion: {
    type: DataTypes.STRING
  },
  coordenadas: {
    type: DataTypes.GEOMETRY('POINT')
  },
  municipio: {
    type: DataTypes.STRING
  },
  estado: {
    type: DataTypes.ENUM('planificado', 'en_curso', 'finalizado', 'cancelado'),
    defaultValue: 'planificado'
  },
  responsable_id: {
    type: DataTypes.UUID,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  voluntarios_necesarios: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  voluntarios_asignados: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  equipamiento_necesario: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  notas: {
    type: DataTypes.TEXT
  },
  publico: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  requiere_confirmacion: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'eventos'
});

module.exports = Event;
