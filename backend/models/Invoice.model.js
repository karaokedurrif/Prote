/**
 * Modelo de Factura/Transacción Financiera
 * Gestión de gastos, ingresos y facturación
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  numero_factura: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('ingreso', 'gasto'),
    allowNull: false
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: false
  },
  concepto: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  importe: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  iva: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 21.00
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  proveedor_cliente: {
    type: DataTypes.STRING
  },
  cif_nif: {
    type: DataTypes.STRING
  },
  metodo_pago: {
    type: DataTypes.ENUM('efectivo', 'transferencia', 'tarjeta', 'domiciliacion', 'otro'),
    defaultValue: 'transferencia'
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'pagada', 'cobrada', 'cancelada'),
    defaultValue: 'pendiente'
  },
  fecha_vencimiento: {
    type: DataTypes.DATEONLY
  },
  proyecto_id: {
    type: DataTypes.UUID,
    references: {
      model: 'proyectos',
      key: 'id'
    }
  },
  usuario_registro: {
    type: DataTypes.UUID,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  archivo_factura: {
    type: DataTypes.STRING
  },
  observaciones: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'facturas'
});

module.exports = Invoice;
