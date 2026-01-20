/**
 * Modelo de Vehículo/Flota
 * Sistema de gestión de vehículos, ambulancias y equipamiento móvil
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vehicle = sequelize.define('Vehicle', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  // Información básica del vehículo
  matricula: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  
  tipo: {
    type: DataTypes.ENUM(
      'vehiculo_intervencion',
      'ambulancia',
      'furgon',
      'todo_terreno',
      '4x4',
      'autoproteccion',
      'logistica',
      'otro'
    ),
    allowNull: false
  },
  
  marca: {
    type: DataTypes.STRING(50)
  },
  
  modelo: {
    type: DataTypes.STRING(50)
  },
  
  año: {
    type: DataTypes.INTEGER
  },
  
  bastidor: {
    type: DataTypes.STRING(50),
    unique: true
  },
  
  // Estado y disponibilidad
  estado: {
    type: DataTypes.ENUM(
      'operativo',
      'mantenimiento',
      'reparacion',
      'averiado',
      'baja_temporal',
      'dado_de_baja'
    ),
    defaultValue: 'operativo'
  },
  
  disponible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  // Localización en tiempo real (GPS)
  ubicacion_actual: {
    type: DataTypes.GEOMETRY('POINT'),
    allowNull: true
  },
  
  latitud_actual: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  
  longitud_actual: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  
  ultima_actualizacion_gps: {
    type: DataTypes.DATE
  },
  
  // Información técnica
  capacidad_pasajeros: {
    type: DataTypes.INTEGER
  },
  
  capacidad_carga_kg: {
    type: DataTypes.INTEGER
  },
  
  equipamiento: {
    type: DataTypes.JSONB,
    defaultValue: []
    // Ejemplo: ["desfibrilador", "camilla", "oxígeno", "emisora"]
  },
  
  caracteristicas: {
    type: DataTypes.JSONB
    // Ejemplo: {"traccion": "4x4", "suspensión": "reforzada", "rotulación": true}
  },
  
  // Mantenimiento
  kilometraje: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  fecha_ultima_revision: {
    type: DataTypes.DATE
  },
  
  proxima_revision: {
    type: DataTypes.DATE
  },
  
  fecha_itv: {
    type: DataTypes.DATE
  },
  
  proxima_itv: {
    type: DataTypes.DATE,
    allowNull: false
  },
  
  historial_mantenimiento: {
    type: DataTypes.JSONB,
    defaultValue: []
    // Array de objetos: [{fecha, tipo, descripcion, coste, proveedor, km}]
  },
  
  // Seguro y documentación
  compañia_seguro: {
    type: DataTypes.STRING(100)
  },
  
  poliza_seguro: {
    type: DataTypes.STRING(50)
  },
  
  vencimiento_seguro: {
    type: DataTypes.DATE
  },
  
  permiso_circulacion: {
    type: DataTypes.STRING(50)
  },
  
  ficha_tecnica: {
    type: DataTypes.TEXT
  },
  
  // Asignación y uso
  base_habitual: {
    type: DataTypes.STRING(100)
    // Base/garaje donde se guarda habitualmente
  },
  
  responsable_id: {
    type: DataTypes.UUID,
    references: {
      model: 'usuarios',
      key: 'id'
    },
    allowNull: true
  },
  
  conductor_actual_id: {
    type: DataTypes.UUID,
    references: {
      model: 'usuarios',
      key: 'id'
    },
    allowNull: true
  },
  
  en_servicio: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  servicio_actual_id: {
    type: DataTypes.UUID,
    references: {
      model: 'eventos',
      key: 'id'
    },
    allowNull: true
  },
  
  // Consumos y costes
  consumo_medio_litros: {
    type: DataTypes.DECIMAL(4, 2)
  },
  
  tipo_combustible: {
    type: DataTypes.ENUM('gasolina', 'diesel', 'hibrido', 'electrico', 'glp')
  },
  
  coste_anual_mantenimiento: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  
  coste_anual_combustible: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  
  // Alertas y notificaciones
  alertas_activas: {
    type: DataTypes.JSONB,
    defaultValue: []
    // Ejemplo: [{tipo: "itv_proxima", fecha: "2024-05-01", dias: 15}]
  },
  
  requiere_atencion: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  // Información adicional
  color: {
    type: DataTypes.STRING(30)
  },
  
  rotulacion: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  señalizacion_luminosa: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  señalizacion_acustica: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  radio_comunicaciones: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  gps_integrado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  dashcam: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  notas: {
    type: DataTypes.TEXT
  },
  
  imagenes: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  
  documentos: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  }
  
}, {
  tableName: 'vehiculos',
  underscored: true,
  timestamps: true
});

// Hooks para gestión automática
Vehicle.beforeSave(async (vehicle) => {
  // Actualizar alertas automáticamente
  const alertas = [];
  const hoy = new Date();
  
  // Alerta ITV próxima (30 días)
  if (vehicle.proxima_itv) {
    const diasITV = Math.floor((new Date(vehicle.proxima_itv) - hoy) / (1000 * 60 * 60 * 24));
    if (diasITV <= 30 && diasITV > 0) {
      alertas.push({
        tipo: 'itv_proxima',
        mensaje: `ITV próxima en ${diasITV} días`,
        fecha: vehicle.proxima_itv,
        dias: diasITV,
        prioridad: diasITV <= 7 ? 'alta' : 'media'
      });
    } else if (diasITV <= 0) {
      alertas.push({
        tipo: 'itv_caducada',
        mensaje: 'ITV CADUCADA',
        fecha: vehicle.proxima_itv,
        dias: diasITV,
        prioridad: 'critica'
      });
    }
  }
  
  // Alerta seguro próximo (15 días)
  if (vehicle.vencimiento_seguro) {
    const diasSeguro = Math.floor((new Date(vehicle.vencimiento_seguro) - hoy) / (1000 * 60 * 60 * 24));
    if (diasSeguro <= 15 && diasSeguro > 0) {
      alertas.push({
        tipo: 'seguro_proximo',
        mensaje: `Seguro vence en ${diasSeguro} días`,
        fecha: vehicle.vencimiento_seguro,
        dias: diasSeguro,
        prioridad: diasSeguro <= 3 ? 'alta' : 'media'
      });
    } else if (diasSeguro <= 0) {
      alertas.push({
        tipo: 'seguro_caducado',
        mensaje: 'SEGURO CADUCADO',
        fecha: vehicle.vencimiento_seguro,
        dias: diasSeguro,
        prioridad: 'critica'
      });
    }
  }
  
  // Alerta revisión próxima (7 días)
  if (vehicle.proxima_revision) {
    const diasRevision = Math.floor((new Date(vehicle.proxima_revision) - hoy) / (1000 * 60 * 60 * 24));
    if (diasRevision <= 7 && diasRevision > 0) {
      alertas.push({
        tipo: 'revision_proxima',
        mensaje: `Revisión programada en ${diasRevision} días`,
        fecha: vehicle.proxima_revision,
        dias: diasRevision,
        prioridad: 'baja'
      });
    }
  }
  
  vehicle.alertas_activas = alertas;
  vehicle.requiere_atencion = alertas.some(a => ['critica', 'alta'].includes(a.prioridad));
  
  // No disponible si tiene alertas críticas o no está operativo
  if (vehicle.requiere_atencion || vehicle.estado !== 'operativo') {
    vehicle.disponible = false;
  }
});

module.exports = Vehicle;
