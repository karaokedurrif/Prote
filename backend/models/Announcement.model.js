/**
 * Modelo de Anuncio para Tablón Rural
 * Avisos públicos de la asociación
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Announcement = sequelize.define('Announcement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contenido: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM(
      'corte_carretera',
      'evento',
      'transporte',
      'aviso',
      'emergencia',
      'general'
    ),
    defaultValue: 'general'
  },
  prioridad: {
    type: DataTypes.ENUM('baja', 'media', 'alta', 'urgente'),
    defaultValue: 'media'
  },
  municipio: {
    type: DataTypes.STRING
  },
  fecha_inicio: {
    type: DataTypes.DATE,
    allowNull: false
  },
  fecha_fin: {
    type: DataTypes.DATE
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  moderado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  moderador_id: {
    type: DataTypes.UUID,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  autor_id: {
    type: DataTypes.UUID,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  contacto: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'anuncios'
});

module.exports = Announcement;
