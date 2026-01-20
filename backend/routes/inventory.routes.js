/**
 * Rutas de gestión de inventario
 * CRUD de equipos, vehículos y material
 */

const express = require('express');
const router = express.Router();
const { InventoryItem, Volunteer } = require('../models');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const logger = require('../config/logger');

router.use(authenticate);

/**
 * GET /api/inventory
 * Listar inventario
 */
router.get('/', async (req, res) => {
  try {
    const { categoria, estado, asignado } = req.query;
    
    const where = {};
    if (categoria) where.categoria = categoria;
    if (estado) where.estado = estado;
    if (asignado === 'true') {
      where.asignado_a = { [require('sequelize').Op.ne]: null };
    } else if (asignado === 'false') {
      where.asignado_a = null;
    }
    
    const items = await InventoryItem.findAll({
      where,
      include: [{ model: Volunteer, as: 'asignado', include: ['user'] }],
      order: [['codigo', 'ASC']]
    });
    
    res.json(items);
    
  } catch (error) {
    logger.error('Error al listar inventario:', error);
    res.status(500).json({ error: 'Error al obtener inventario' });
  }
});

/**
 * POST /api/inventory
 * Crear nuevo item
 */
router.post('/', authorize('admin', 'coordinador'), async (req, res) => {
  try {
    const item = await InventoryItem.create(req.body);
    
    logger.info(`Item de inventario creado: ${item.codigo}`);
    
    res.status(201).json({
      mensaje: 'Item creado correctamente',
      item
    });
    
  } catch (error) {
    logger.error('Error al crear item:', error);
    res.status(500).json({ error: 'Error al crear item' });
  }
});

/**
 * PUT /api/inventory/:id
 * Actualizar item
 */
router.put('/:id', authorize('admin', 'coordinador'), async (req, res) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }
    
    await item.update(req.body);
    
    res.json({
      mensaje: 'Item actualizado correctamente',
      item
    });
    
  } catch (error) {
    logger.error('Error al actualizar item:', error);
    res.status(500).json({ error: 'Error al actualizar item' });
  }
});

/**
 * GET /api/inventory/low-stock
 * Items con stock bajo
 */
router.get('/low-stock', async (req, res) => {
  try {
    const items = await InventoryItem.findAll({
      where: {
        stock: {
          [require('sequelize').Op.lte]: require('sequelize').col('stock_minimo')
        }
      },
      order: [['stock', 'ASC']]
    });
    
    res.json(items);
    
  } catch (error) {
    logger.error('Error al obtener stock bajo:', error);
    res.status(500).json({ error: 'Error al obtener items con stock bajo' });
  }
});

/**
 * GET /api/inventory/maintenance
 * Items que requieren mantenimiento
 */
router.get('/maintenance', async (req, res) => {
  try {
    const hoy = new Date();
    
    const items = await InventoryItem.findAll({
      where: {
        proximo_mantenimiento: {
          [require('sequelize').Op.lte]: new Date(hoy.setDate(hoy.getDate() + 30))
        },
        estado: 'operativo'
      },
      order: [['proximo_mantenimiento', 'ASC']]
    });
    
    res.json(items);
    
  } catch (error) {
    logger.error('Error al obtener mantenimientos:', error);
    res.status(500).json({ error: 'Error al obtener mantenimientos pendientes' });
  }
});

module.exports = router;
