/**
 * Rutas de gestión de voluntarios
 * CRUD y gestión completa de voluntarios
 */

const express = require('express');
const router = express.Router();
const { Volunteer, User, EventVolunteer } = require('../models');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const logger = require('../config/logger');

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * GET /api/volunteers
 * Listar todos los voluntarios
 */
router.get('/', authorize('admin', 'coordinador'), async (req, res) => {
  try {
    const { estado, municipio, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (estado) where.estado = estado;
    if (municipio) where.municipio = municipio;
    
    const { count, rows: voluntarios } = await Volunteer.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['email', 'telefono', 'activo'] }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['fecha_alta', 'DESC']]
    });
    
    res.json({
      voluntarios,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
    
  } catch (error) {
    logger.error('Error al listar voluntarios:', error);
    res.status(500).json({ error: 'Error al obtener voluntarios' });
  }
});

/**
 * GET /api/volunteers/:id
 * Obtener detalles de un voluntario
 */
router.get('/:id', async (req, res) => {
  try {
    const voluntario = await Volunteer.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user' },
        { 
          model: require('../models').Event, 
          as: 'eventos',
          through: { attributes: ['estado', 'horas_servicio'] }
        }
      ]
    });
    
    if (!voluntario) {
      return res.status(404).json({ error: 'Voluntario no encontrado' });
    }
    
    // Solo admin/coordinador o el mismo voluntario puede ver detalles
    if (req.user.rol !== 'admin' && req.user.rol !== 'coordinador' && req.user.id !== voluntario.user_id) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    res.json(voluntario);
    
  } catch (error) {
    logger.error('Error al obtener voluntario:', error);
    res.status(500).json({ error: 'Error al obtener voluntario' });
  }
});

/**
 * POST /api/volunteers
 * Crear nuevo voluntario
 */
router.post('/', authorize('admin', 'coordinador'), async (req, res) => {
  try {
    const voluntarioData = req.body;
    
    const voluntario = await Volunteer.create(voluntarioData);
    
    logger.info(`Voluntario creado: ${voluntario.id}`);
    
    res.status(201).json({
      mensaje: 'Voluntario creado correctamente',
      voluntario
    });
    
  } catch (error) {
    logger.error('Error al crear voluntario:', error);
    res.status(500).json({ error: 'Error al crear voluntario' });
  }
});

/**
 * PUT /api/volunteers/:id
 * Actualizar datos de voluntario
 */
router.put('/:id', async (req, res) => {
  try {
    const voluntario = await Volunteer.findByPk(req.params.id);
    
    if (!voluntario) {
      return res.status(404).json({ error: 'Voluntario no encontrado' });
    }
    
    // Solo admin/coordinador o el mismo voluntario puede actualizar
    if (req.user.rol !== 'admin' && req.user.rol !== 'coordinador' && req.user.id !== voluntario.user_id) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    await voluntario.update(req.body);
    
    logger.info(`Voluntario actualizado: ${voluntario.id}`);
    
    res.json({
      mensaje: 'Voluntario actualizado correctamente',
      voluntario
    });
    
  } catch (error) {
    logger.error('Error al actualizar voluntario:', error);
    res.status(500).json({ error: 'Error al actualizar voluntario' });
  }
});

/**
 * GET /api/volunteers/:id/hours
 * Obtener horas de servicio de un voluntario
 */
router.get('/:id/hours', async (req, res) => {
  try {
    const eventos = await EventVolunteer.findAll({
      where: {
        volunteer_id: req.params.id,
        estado: 'asistio'
      },
      include: [{ model: require('../models').Event, as: 'evento' }]
    });
    
    const totalHoras = eventos.reduce((sum, e) => sum + parseFloat(e.horas_servicio || 0), 0);
    
    res.json({
      total_horas: totalHoras,
      servicios: eventos.length,
      detalle: eventos
    });
    
  } catch (error) {
    logger.error('Error al obtener horas:', error);
    res.status(500).json({ error: 'Error al obtener horas de servicio' });
  }
});

module.exports = router;
