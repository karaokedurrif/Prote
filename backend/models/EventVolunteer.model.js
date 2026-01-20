/**
 * Modelo de Relación Evento-Voluntario
 * Tabla intermedia para la asignación de voluntarios a eventos
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EventVolunteer = sequelize.define('EventVolunteer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  event_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'eventos',
      key: 'id'
    }
  },
  volunteer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'voluntarios',
      key: 'id'
    }
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'confirmado', 'rechazado', 'asistio', 'no_asistio'),
    defaultValue: 'pendiente'
  },
  rol_en_evento: {
    type: DataTypes.STRING
  },
  horas_servicio: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  observaciones: {
    type: DataTypes.TEXT
  },
  fecha_confirmacion: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'eventos_voluntarios'
});

module.exports = EventVolunteer;
