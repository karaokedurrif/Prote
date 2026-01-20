/**
 * Modelo de Transporte Rural Compartido
 * Gestión de ofertas y solicitudes de viajes compartidos
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transport = sequelize.define('Transport', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tipo: {
    type: DataTypes.ENUM('oferta', 'solicitud'),
    allowNull: false
  },
  conductor_id: {
    type: DataTypes.UUID,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  origen: {
    type: DataTypes.STRING,
    allowNull: false
  },
  destino: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fecha_salida: {
    type: DataTypes.DATE,
    allowNull: false
  },
  hora_salida: {
    type: DataTypes.TIME,
    allowNull: false
  },
  plazas_disponibles: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  plazas_ocupadas: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  precio_por_plaza: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  recurrente: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  dias_recurrencia: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  estado: {
    type: DataTypes.ENUM('activa', 'completa', 'cancelada', 'finalizada'),
    defaultValue: 'activa'
  },
  contacto: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'transporte_rural'
});

module.exports = Transport;
