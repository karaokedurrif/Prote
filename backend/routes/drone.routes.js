/**
 * Rutas de gestión de drones
 */

const express = require('express');
const router = express.Router();
const { Drone, User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const logger = require('../config/logger');

router.use(authenticate);

/**
 * GET /api/drones
 * Listar drones y vuelos
 */
router.get('/', async (req, res) => {
  try {
    const { estado } = req.query;
    
    const where = {};
    if (estado) where.estado = estado;
    
    const drones = await Drone.findAll({
      where,
      include: [{ model: User, as: 'piloto', attributes: ['nombre', 'apellidos'] }],
      order: [['fecha_vuelo', 'DESC']]
    });
    
    res.json(drones);
    
  } catch (error) {
    logger.error('Error al listar drones:', error);
    res.status(500).json({ error: 'Error al obtener drones' });
  }
});

/**
 * POST /api/drones
 * Registrar vuelo de dron
 */
router.post('/', authorize('admin', 'coordinador'), async (req, res) => {
  try {
    const drone = await Drone.create(req.body);
    
    logger.info(`Vuelo de dron registrado: ${drone.nombre}`);
    
    res.status(201).json({
      mensaje: 'Vuelo registrado correctamente',
      drone
    });
    
  } catch (error) {
    logger.error('Error al registrar vuelo:', error);
    res.status(500).json({ error: 'Error al registrar vuelo' });
  }
});

module.exports = router;
