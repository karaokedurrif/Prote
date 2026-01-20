/**
 * Rutas de comunicaciones mesh (Meshtastic)
 * Posiciones GPS y mensajería
 */

const express = require('express');
const router = express.Router();
const { MeshPosition, Volunteer } = require('../models');
const { authenticate } = require('../middleware/auth.middleware');
const logger = require('../config/logger');

router.use(authenticate);

/**
 * GET /api/mesh/positions
 * Obtener últimas posiciones de nodos
 */
router.get('/positions', async (req, res) => {
  try {
    const { tipo_nodo, ultimas_horas = 24 } = req.query;
    
    const where = {
      timestamp: {
        [require('sequelize').Op.gte]: new Date(Date.now() - ultimas_horas * 60 * 60 * 1000)
      }
    };
    
    if (tipo_nodo) {
      where.tipo_nodo = tipo_nodo;
    }
    
    const posiciones = await MeshPosition.findAll({
      where,
      include: [{ model: Volunteer, as: 'voluntario', include: ['user'] }],
      order: [['timestamp', 'DESC']],
      limit: 500
    });
    
    res.json(posiciones);
    
  } catch (error) {
    logger.error('Error al obtener posiciones mesh:', error);
    res.status(500).json({ error: 'Error al obtener posiciones' });
  }
});

/**
 * GET /api/mesh/positions/:nodeId/track
 * Obtener track completo de un nodo
 */
router.get('/positions/:nodeId/track', async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    
    const where = { node_id: req.params.nodeId };
    
    if (desde && hasta) {
      where.timestamp = {
        [require('sequelize').Op.between]: [new Date(desde), new Date(hasta)]
      };
    }
    
    const track = await MeshPosition.findAll({
      where,
      order: [['timestamp', 'ASC']],
      limit: 5000
    });
    
    res.json(track);
    
  } catch (error) {
    logger.error('Error al obtener track:', error);
    res.status(500).json({ error: 'Error al obtener track' });
  }
});

/**
 * GET /api/mesh/nodes
 * Obtener lista de nodos activos
 */
router.get('/nodes', async (req, res) => {
  try {
    // Obtener nodos con actividad en las últimas 6 horas
    const horasAtras = 6;
    
    const nodos = await MeshPosition.findAll({
      attributes: [
        'node_id',
        'node_name',
        'tipo_nodo',
        [require('sequelize').fn('MAX', require('sequelize').col('timestamp')), 'ultima_actualizacion'],
        [require('sequelize').fn('MAX', require('sequelize').col('bateria')), 'bateria']
      ],
      where: {
        timestamp: {
          [require('sequelize').Op.gte]: new Date(Date.now() - horasAtras * 60 * 60 * 1000)
        }
      },
      group: ['node_id', 'node_name', 'tipo_nodo'],
      order: [[require('sequelize').fn('MAX', require('sequelize').col('timestamp')), 'DESC']]
    });
    
    res.json(nodos);
    
  } catch (error) {
    logger.error('Error al obtener nodos:', error);
    res.status(500).json({ error: 'Error al obtener nodos' });
  }
});

module.exports = router;
