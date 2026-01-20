/**
 * Rutas de Gestión de Flotas (Vehículos/Ambulancias)
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const Vehicle = require('../models/Vehicle.model');
const { Op } = require('sequelize');
const logger = require('../config/logger');

// Obtener todos los vehículos
router.get('/', authenticate, async (req, res) => {
  try {
    const { tipo, estado, disponible } = req.query;
    
    const where = {};
    if (tipo) where.tipo = tipo;
    if (estado) where.estado = estado;
    if (disponible !== undefined) where.disponible = disponible === 'true';
    
    const vehicles = await Vehicle.findAll({
      where,
      order: [['matricula', 'ASC']]
    });
    
    res.json(vehicles);
  } catch (error) {
    logger.error('Error obteniendo vehículos:', error);
    res.status(500).json({ error: 'Error al obtener vehículos' });
  }
});

// Obtener vehículo por ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    
    res.json(vehicle);
  } catch (error) {
    logger.error('Error obteniendo vehículo:', error);
    res.status(500).json({ error: 'Error al obtener vehículo' });
  }
});

// Crear nuevo vehículo
router.post('/', authenticate, async (req, res) => {
  try {
    // Solo admin y tesorero pueden crear vehículos
    if (!['admin', 'tesorero'].includes(req.user.rol)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const vehicle = await Vehicle.create(req.body);
    logger.info(`Vehículo creado: ${vehicle.matricula}`);
    
    res.status(201).json(vehicle);
  } catch (error) {
    logger.error('Error creando vehículo:', error);
    res.status(400).json({ error: error.message });
  }
});

// Actualizar vehículo
router.put('/:id', authenticate, async (req, res) => {
  try {
    if (!['admin', 'tesorero', 'coordinador'].includes(req.user.rol)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const vehicle = await Vehicle.findByPk(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    
    await vehicle.update(req.body);
    logger.info(`Vehículo actualizado: ${vehicle.matricula}`);
    
    res.json(vehicle);
  } catch (error) {
    logger.error('Error actualizando vehículo:', error);
    res.status(400).json({ error: error.message });
  }
});

// Actualizar posición GPS del vehículo
router.post('/:id/position', authenticate, async (req, res) => {
  try {
    const { latitud, longitud } = req.body;
    
    const vehicle = await Vehicle.findByPk(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    
    await vehicle.update({
      latitud_actual: latitud,
      longitud_actual: longitud,
      ultima_actualizacion_gps: new Date()
    });
    
    // Emitir actualización vía WebSocket
    const io = req.app.get('io');
    if (io) {
      io.emit('vehicle:position-update', {
        id: vehicle.id,
        matricula: vehicle.matricula,
        tipo: vehicle.tipo,
        latitud_actual: latitud,
        longitud_actual: longitud,
        en_servicio: vehicle.en_servicio,
        disponible: vehicle.disponible,
        ultima_actualizacion_gps: vehicle.ultima_actualizacion_gps
      });
    }
    
    res.json({ success: true, vehicle });
  } catch (error) {
    logger.error('Error actualizando posición:', error);
    res.status(400).json({ error: error.message });
  }
});

// Asignar vehículo a servicio
router.post('/:id/assign', authenticate, async (req, res) => {
  try {
    const { conductor_id, servicio_id } = req.body;
    
    const vehicle = await Vehicle.findByPk(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    
    if (!vehicle.disponible) {
      return res.status(400).json({ error: 'Vehículo no disponible' });
    }
    
    await vehicle.update({
      conductor_actual_id: conductor_id,
      servicio_actual_id: servicio_id,
      en_servicio: true,
      disponible: false
    });
    
    logger.info(`Vehículo ${vehicle.matricula} asignado a servicio`);
    
    res.json({ success: true, vehicle });
  } catch (error) {
    logger.error('Error asignando vehículo:', error);
    res.status(400).json({ error: error.message });
  }
});

// Liberar vehículo de servicio
router.post('/:id/release', authenticate, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    
    await vehicle.update({
      conductor_actual_id: null,
      servicio_actual_id: null,
      en_servicio: false,
      disponible: vehicle.estado === 'operativo' && !vehicle.requiere_atencion
    });
    
    logger.info(`Vehículo ${vehicle.matricula} liberado de servicio`);
    
    res.json({ success: true, vehicle });
  } catch (error) {
    logger.error('Error liberando vehículo:', error);
    res.status(400).json({ error: error.message });
  }
});

// Registrar mantenimiento
router.post('/:id/maintenance', authenticate, async (req, res) => {
  try {
    const { tipo, descripcion, coste, proveedor } = req.body;
    
    const vehicle = await Vehicle.findByPk(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    
    const nuevoMantenimiento = {
      fecha: new Date(),
      tipo,
      descripcion,
      coste: parseFloat(coste) || 0,
      proveedor,
      km: vehicle.kilometraje,
      usuario: req.user.id
    };
    
    const historial = vehicle.historial_mantenimiento || [];
    historial.push(nuevoMantenimiento);
    
    await vehicle.update({
      historial_mantenimiento: historial,
      fecha_ultima_revision: new Date(),
      coste_anual_mantenimiento: (vehicle.coste_anual_mantenimiento || 0) + nuevoMantenimiento.coste
    });
    
    logger.info(`Mantenimiento registrado para ${vehicle.matricula}`);
    
    res.json({ success: true, vehicle });
  } catch (error) {
    logger.error('Error registrando mantenimiento:', error);
    res.status(400).json({ error: error.message });
  }
});

// Obtener vehículos con alertas
router.get('/alerts/active', authenticate, async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll({
      where: {
        requiere_atencion: true
      },
      order: [['matricula', 'ASC']]
    });
    
    res.json(vehicles);
  } catch (error) {
    logger.error('Error obteniendo alertas:', error);
    res.status(500).json({ error: 'Error al obtener alertas' });
  }
});

// Obtener estadísticas de flota
router.get('/stats/summary', authenticate, async (req, res) => {
  try {
    const total = await Vehicle.count();
    const operativos = await Vehicle.count({ where: { estado: 'operativo' } });
    const disponibles = await Vehicle.count({ where: { disponible: true } });
    const enServicio = await Vehicle.count({ where: { en_servicio: true } });
    const conAlertas = await Vehicle.count({ where: { requiere_atencion: true } });
    
    const porTipo = await Vehicle.findAll({
      attributes: [
        'tipo',
        [require('sequelize').fn('COUNT', require('sequelize').col('tipo')), 'count']
      ],
      group: ['tipo']
    });
    
    res.json({
      total,
      operativos,
      disponibles,
      enServicio,
      conAlertas,
      porTipo: porTipo.reduce((acc, item) => {
        acc[item.tipo] = parseInt(item.get('count'));
        return acc;
      }, {})
    });
  } catch (error) {
    logger.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// Eliminar vehículo (dar de baja)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    // Solo admin puede eliminar
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const vehicle = await Vehicle.findByPk(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    
    // No eliminar realmente, solo marcar como dado de baja
    await vehicle.update({
      estado: 'dado_de_baja',
      disponible: false,
      en_servicio: false
    });
    
    logger.info(`Vehículo dado de baja: ${vehicle.matricula}`);
    
    res.json({ success: true, message: 'Vehículo dado de baja correctamente' });
  } catch (error) {
    logger.error('Error dando de baja vehículo:', error);
    res.status(500).json({ error: 'Error al dar de baja vehículo' });
  }
});

module.exports = router;
