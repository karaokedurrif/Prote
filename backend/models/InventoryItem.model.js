/**
 * Modelo de Inventario
 * Gestión de equipos, vehículos, radios y material
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventoryItem = sequelize.define('InventoryItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  codigo: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  categoria: {
    type: DataTypes.ENUM(
      'vehiculo',
      'radio',
      'material_sanitario',
      'equipo_rescate',
      'uniformes',
      'herramientas',
      'informatica',
      'otro'
    ),
    allowNull: false
  },
  marca: {
    type: DataTypes.STRING
  },
  modelo: {
    type: DataTypes.STRING
  },
  numero_serie: {
    type: DataTypes.STRING
  },
  fecha_adquisicion: {
    type: DataTypes.DATEONLY
  },
  valor_adquisicion: {
    type: DataTypes.DECIMAL(10, 2)
  },
  estado: {
    type: DataTypes.ENUM('operativo', 'mantenimiento', 'reparacion', 'baja'),
    defaultValue: 'operativo'
  },
  ubicacion: {
    type: DataTypes.STRING
  },
  asignado_a: {
    type: DataTypes.UUID,
    references: {
      model: 'voluntarios',
      key: 'id'
    }
  },
  fecha_ultimo_mantenimiento: {
    type: DataTypes.DATEONLY
  },
  proximo_mantenimiento: {
    type: DataTypes.DATEONLY
  },
  fecha_caducidad: {
    type: DataTypes.DATEONLY
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  stock_minimo: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  observaciones: {
    type: DataTypes.TEXT
  },
  imagenes: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  documentos: {
    type: DataTypes.JSONB,
    defaultValue: []
  }
}, {
  tableName: 'inventario'
});

module.exports = InventoryItem;
