/**
 * Rutas del mapa de riesgos
 */

const express = require('express');
const router = express.Router();
const { RiskMapLayer, User } = require('../models');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth.middleware');
const logger = require('../config/logger');

/**
 * GET /api/risk-map/layers
 * Obtener capas del mapa
 */
router.get('/layers', optionalAuth, async (req, res) => {
  try {
    const { tipo, municipio } = req.query;
    
    const where = { activa: true };
    if (tipo) where.tipo = tipo;
    if (municipio) where.municipio = municipio;
    
    const capas = await RiskMapLayer.findAll({
      where,
      order: [['tipo', 'ASC']]
    });
    
    res.json(capas);
    
  } catch (error) {
    logger.error('Error al obtener capas:', error);
    res.status(500).json({ error: 'Error al obtener capas del mapa' });
  }
});

/**
 * POST /api/risk-map/layers
 * Crear nueva capa
 */
router.post('/layers', authenticate, authorize('admin', 'coordinador'), async (req, res) => {
  try {
    const capaData = {
      ...req.body,
      creado_por: req.user.id
    };
    
    const capa = await RiskMapLayer.create(capaData);
    
    logger.info(`Capa de mapa creada: ${capa.nombre}`);
    
    res.status(201).json({
      mensaje: 'Capa creada correctamente',
      capa
    });
    
  } catch (error) {
    logger.error('Error al crear capa:', error);
    res.status(500).json({ error: 'Error al crear capa' });
  }
});

/**
 * PUT /api/risk-map/layers/:id
 * Actualizar capa
 */
router.put('/layers/:id', authenticate, authorize('admin', 'coordinador'), async (req, res) => {
  try {
    const capa = await RiskMapLayer.findByPk(req.params.id);
    
    if (!capa) {
      return res.status(404).json({ error: 'Capa no encontrada' });
    }
    
    await capa.update(req.body);
    
    res.json({
      mensaje: 'Capa actualizada',
      capa
    });
    
  } catch (error) {
    logger.error('Error al actualizar capa:', error);
    res.status(500).json({ error: 'Error al actualizar capa' });
  }
});

module.exports = router;
