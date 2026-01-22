/**
 * Rutas de administración
 * Gestión de registros trial y usuarios
 */

const express = require('express');
const router = express.Router();
const { PublicRegistration, User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const logger = require('../config/logger');

/**
 * GET /api/admin/trial-registrations
 * Obtener todos los registros trial
 */
router.get('/trial-registrations', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const registrations = await PublicRegistration.findAll({
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['accessToken'] }
    });
    
    res.json(registrations);
  } catch (error) {
    logger.error('Error al obtener registros trial:', error);
    res.status(500).json({ error: 'Error al obtener registros trial' });
  }
});

/**
 * POST /api/admin/trial-registrations/:id/approve
 * Aprobar un registro trial
 */
router.post('/trial-registrations/:id/approve', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const registration = await PublicRegistration.findByPk(req.params.id);
    
    if (!registration) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    
    // Actualizar estado a activo
    await registration.update({ status: 'active' });
    
    logger.info(`Registro trial aprobado: ${registration.email}`);
    res.json({ message: 'Registro aprobado', registration });
    
  } catch (error) {
    logger.error('Error al aprobar registro:', error);
    res.status(500).json({ error: 'Error al aprobar registro' });
  }
});

/**
 * DELETE /api/admin/trial-registrations/:id
 * Rechazar/eliminar un registro trial
 */
router.delete('/trial-registrations/:id', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const registration = await PublicRegistration.findByPk(req.params.id);
    
    if (!registration) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    
    // Buscar y eliminar usuario asociado si existe
    const user = await User.findOne({ where: { email: registration.email } });
    if (user) {
      await user.destroy();
    }
    
    await registration.destroy();
    
    logger.info(`Registro trial rechazado: ${registration.email}`);
    res.json({ message: 'Registro rechazado y eliminado' });
    
  } catch (error) {
    logger.error('Error al rechazar registro:', error);
    res.status(500).json({ error: 'Error al rechazar registro' });
  }
});

module.exports = router;
