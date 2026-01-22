/**
 * Rutas de gestión de subvenciones
 * Búsqueda y gestión de convocatorias
 */

const express = require('express');
const router = express.Router();
const { Grant } = require('../models');
const { authenticate } = require('../middleware/auth.middleware');
const logger = require('../config/logger');
const grantDocumentGenerator = require('../services/grantDocumentGenerator.service');
const advancedGrantScraper = require('../services/advancedGrantScraper.service');

// Middleware de autenticación aplicado por ruta

/**
 * GET /api/grants
 * Listar subvenciones
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { estado, ambito, buscar } = req.query;
    
    const where = {};
    if (estado) where.estado = estado;
    if (ambito) where.ambito = ambito;
    
    if (buscar) {
      where[require('sequelize').Op.or] = [
        { titulo: { [require('sequelize').Op.iLike]: `%${buscar}%` } },
        { descripcion: { [require('sequelize').Op.iLike]: `%${buscar}%` } },
        { organismo: { [require('sequelize').Op.iLike]: `%${buscar}%` } }
      ];
    }
    
    const subvenciones = await Grant.findAll({
      where,
      order: [['relevancia', 'DESC'], ['fecha_limite', 'ASC']]
    });
    
    res.json(subvenciones);
    
  } catch (error) {
    logger.error('Error al listar subvenciones:', error);
    res.status(500).json({ error: 'Error al obtener subvenciones' });
  }
});

/**
 * POST /api/grants
 * Crear/registrar subvención manualmente
 */
router.post('/', authenticate, async (req, res) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'No autorizado' });
  }
  try {
    const subvencion = await Grant.create(req.body);
    
    logger.info(`Subvención registrada: ${subvencion.titulo}`);
    
    res.status(201).json({
      mensaje: 'Subvención registrada correctamente',
      subvencion
    });
    
  } catch (error) {
    logger.error('Error al crear subvención:', error);
    res.status(500).json({ error: 'Error al crear subvención' });
  }
});

/**
 * PUT /api/grants/:id/apply
 * Marcar subvención como solicitada
 */
router.put('/:id/apply', authenticate, async (req, res) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'No autorizado' });
  }
  try {
    const subvencion = await Grant.findByPk(req.params.id);
    
    if (!subvencion) {
      return res.status(404).json({ error: 'Subvención no encontrada' });
    }
    
    await subvencion.update({
      solicitada: true,
      fecha_solicitud: new Date()
    });
    
    res.json({
      mensaje: 'Subvención marcada como solicitada',
      subvencion
    });
    
  } catch (error) {
    logger.error('Error al actualizar subvención:', error);
    res.status(500).json({ error: 'Error al actualizar subvención' });
  }
});

/**
 * GET /api/grants/alerts
 * Obtener subvenciones que requieren atención
 */
router.get('/alerts', authenticate, async (req, res) => {
  try {
    const hoy = new Date();
    const enDiezDias = new Date(hoy.setDate(hoy.getDate() + 10));
    
    const alertas = await Grant.findAll({
      where: {
        estado: 'abierta',
        fecha_limite: {
          [require('sequelize').Op.lte]: enDiezDias
        },
        solicitada: false,
        alertada: false
      },
      order: [['fecha_limite', 'ASC']]
    });
    
    res.json(alertas);
    
  } catch (error) {
    logger.error('Error al obtener alertas:', error);
    res.status(500).json({ error: 'Error al obtener alertas' });
  }
});

/**
 * POST /api/grants/:id/generate-document
 * Generar documento de solicitud automáticamente
 */
router.post('/:id/generate-document', authenticate, async (req, res) => {
  if (!['admin', 'tesorero'].includes(req.user.rol)) {
    return res.status(403).json({ error: 'No autorizado' });
  }
  try {
    const { organizationData } = req.body;
    
    // Datos por defecto de la organización
    const defaultOrgData = {
      nombre: 'Asociación de Protección Civil',
      cif: 'G-00000000',
      direccion: 'C/ Principal, 1',
      codigoPostal: '00000',
      municipio: 'Tu Municipio',
      provincia: 'Tu Provincia',
      email: 'info@proteccioncivil.org',
      telefono: '000 000 000',
      representante: 'Presidente/a',
      dniRepresentante: '00000000X',
      numVoluntarios: 50,
      anosActividad: 10,
      serviciosAnuales: 100,
      poblacion: 50000,
      ...organizationData
    };
    
    const result = await grantDocumentGenerator.generateApplication(
      req.params.id,
      defaultOrgData
    );
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }
    
    res.json(result);
    
  } catch (error) {
    logger.error('Error generando documento:', error);
    res.status(500).json({ error: 'Error al generar documento' });
  }
});

/**
 * POST /api/grants/scrape
 * Ejecutar scraping automático y devolver resultados
 */
router.post('/scrape', authenticate, async (req, res) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'No autorizado' });
  }
  try {
    logger.info('Iniciando scraping de subvenciones...');
    const result = await advancedGrantScraper.runManualScraping();
    
    res.json({ 
      mensaje: 'Scraping completado',
      nuevas: result.nuevas || 0,
      actualizadas: result.actualizadas || 0,
      total: result.total || 0,
      timestamp: new Date()
    });
    
  } catch (error) {
    logger.error('Error en scraping:', error);
    res.status(500).json({ error: 'Error al realizar scraping' });
  }
});

/**
 * POST /api/grants/scrape/manual
 * Ejecutar scraping manual de todas las fuentes
 */
router.post('/scrape/manual', authenticate, async (req, res) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'No autorizado' });
  }
  try {
    // Ejecutar scraping en segundo plano
    advancedGrantScraper.runManualScraping().catch(err => {
      logger.error('Error en scraping manual:', err);
    });
    
    res.json({ 
      mensaje: 'Scraping iniciado. Se notificará cuando termine.',
      timestamp: new Date()
    });
    
  } catch (error) {
    logger.error('Error iniciando scraping manual:', error);
    res.status(500).json({ error: 'Error al iniciar scraping' });
  }
});

module.exports = router;
