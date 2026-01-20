/**
 * Modelo de Posición Mesh
 * Almacena posiciones GPS recibidas de nodos Meshtastic
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MeshPosition = sequelize.define('MeshPosition', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  node_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  node_name: {
    type: DataTypes.STRING
  },
  latitud: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false
  },
  longitud: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false
  },
  altitud: {
    type: DataTypes.DECIMAL(8, 2)
  },
  precision: {
    type: DataTypes.DECIMAL(6, 2)
  },
  bateria: {
    type: DataTypes.INTEGER
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  tipo_nodo: {
    type: DataTypes.ENUM('voluntario', 'vehiculo', 'base', 'sensor', 'otro'),
    defaultValue: 'otro'
  },
  voluntario_id: {
    type: DataTypes.UUID,
    references: {
      model: 'voluntarios',
      key: 'id'
    }
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'mesh_positions',
  indexes: [
    {
      fields: ['node_id']
    },
    {
      fields: ['timestamp']
    },
    {
      fields: ['voluntario_id']
    }
  ]
});

module.exports = MeshPosition;
