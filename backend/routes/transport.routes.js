/**
 * Rutas de transporte rural compartido
 */

const express = require('express');
const router = express.Router();
const { Transport, User } = require('../models');
const { authenticate, optionalAuth } = require('../middleware/auth.middleware');
const logger = require('../config/logger');

/**
 * GET /api/transport
 * Listar ofertas/solicitudes de transporte (ya definido en public.routes)
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { tipo, origen, destino } = req.query;
    
    const where = {
      estado: 'activa',
      fecha_salida: { [require('sequelize').Op.gte]: new Date() }
    };
    
    if (tipo) where.tipo = tipo;
    if (origen) where.origen = { [require('sequelize').Op.iLike]: `%${origen}%` };
    if (destino) where.destino = { [require('sequelize').Op.iLike]: `%${destino}%` };
    
    const transportes = await Transport.findAll({
      where,
      include: [{ model: User, as: 'conductor', attributes: ['nombre', 'apellidos', 'telefono'] }],
      order: [['fecha_salida', 'ASC']],
      limit: 50
    });
    
    res.json(transportes);
    
  } catch (error) {
    logger.error('Error al obtener transportes:', error);
    res.status(500).json({ error: 'Error al obtener transportes' });
  }
});

/**
 * POST /api/transport
 * Crear oferta/solicitud de transporte
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const transporteData = {
      ...req.body,
      conductor_id: req.user.id
    };
    
    const transporte = await Transport.create(transporteData);
    
    logger.info(`Transporte creado: ${transporte.tipo} de ${transporte.origen} a ${transporte.destino}`);
    
    res.status(201).json({
      mensaje: 'Transporte creado correctamente',
      transporte
    });
    
  } catch (error) {
    logger.error('Error al crear transporte:', error);
    res.status(500).json({ error: 'Error al crear transporte' });
  }
});

/**
 * PUT /api/transport/:id
 * Actualizar transporte
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const transporte = await Transport.findByPk(req.params.id);
    
    if (!transporte) {
      return res.status(404).json({ error: 'Transporte no encontrado' });
    }
    
    // Solo el creador puede modificar
    if (transporte.conductor_id !== req.user.id && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    await transporte.update(req.body);
    
    res.json({
      mensaje: 'Transporte actualizado',
      transporte
    });
    
  } catch (error) {
    logger.error('Error al actualizar transporte:', error);
    res.status(500).json({ error: 'Error al actualizar transporte' });
  }
});

module.exports = router;
