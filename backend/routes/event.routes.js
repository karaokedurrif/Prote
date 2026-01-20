/**
 * Rutas de gestión de eventos
 * Calendario, planificación y asignación de voluntarios
 */

const express = require('express');
const router = express.Router();
const { Event, EventVolunteer, Volunteer, User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const logger = require('../config/logger');

router.use(authenticate);

/**
 * GET /api/events
 * Listar eventos
 */
router.get('/', async (req, res) => {
  try {
    const { tipo, estado, desde, hasta } = req.query;
    
    const where = {};
    if (tipo) where.tipo = tipo;
    if (estado) where.estado = estado;
    
    if (desde && hasta) {
      where.fecha_inicio = {
        [require('sequelize').Op.between]: [new Date(desde), new Date(hasta)]
      };
    }
    
    const eventos = await Event.findAll({
      where,
      include: [
        { model: User, as: 'responsable', attributes: ['nombre', 'apellidos'] }
      ],
      order: [['fecha_inicio', 'ASC']]
    });
    
    res.json(eventos);
    
  } catch (error) {
    logger.error('Error al listar eventos:', error);
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
});

/**
 * POST /api/events
 * Crear nuevo evento
 */
router.post('/', authorize('admin', 'coordinador'), async (req, res) => {
  try {
    const eventoData = {
      ...req.body,
      responsable_id: req.body.responsable_id || req.user.id
    };
    
    const evento = await Event.create(eventoData);
    
    logger.info(`Evento creado: ${evento.titulo}`);
    
    res.status(201).json({
      mensaje: 'Evento creado correctamente',
      evento
    });
    
  } catch (error) {
    logger.error('Error al crear evento:', error);
    res.status(500).json({ error: 'Error al crear evento' });
  }
});

/**
 * POST /api/events/:id/volunteers
 * Asignar voluntario a evento
 */
router.post('/:id/volunteers', async (req, res) => {
  try {
    const { volunteer_id, rol_en_evento } = req.body;
    
    const evento = await Event.findByPk(req.params.id);
    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    
    // Verificar si ya está asignado
    const existing = await EventVolunteer.findOne({
      where: {
        event_id: req.params.id,
        volunteer_id
      }
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Voluntario ya asignado a este evento' });
    }
    
    // Crear asignación
    const asignacion = await EventVolunteer.create({
      event_id: req.params.id,
      volunteer_id,
      rol_en_evento,
      estado: evento.requiere_confirmacion ? 'pendiente' : 'confirmado'
    });
    
    // Actualizar contador
    await evento.increment('voluntarios_asignados');
    
    logger.info(`Voluntario ${volunteer_id} asignado a evento ${evento.titulo}`);
    
    res.status(201).json({
      mensaje: 'Voluntario asignado correctamente',
      asignacion
    });
    
  } catch (error) {
    logger.error('Error al asignar voluntario:', error);
    res.status(500).json({ error: 'Error al asignar voluntario' });
  }
});

/**
 * PUT /api/events/:id/volunteers/:volunteerId
 * Actualizar estado de asignación
 */
router.put('/:id/volunteers/:volunteerId', async (req, res) => {
  try {
    const { estado, horas_servicio } = req.body;
    
    const asignacion = await EventVolunteer.findOne({
      where: {
        event_id: req.params.id,
        volunteer_id: req.params.volunteerId
      }
    });
    
    if (!asignacion) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }
    
    await asignacion.update({ estado, horas_servicio });
    
    // Si asistió, actualizar horas del voluntario
    if (estado === 'asistio' && horas_servicio) {
      const voluntario = await Volunteer.findByPk(req.params.volunteerId);
      await voluntario.increment('horas_servicio', { by: parseFloat(horas_servicio) });
      await voluntario.increment('servicios_realizados');
    }
    
    res.json({
      mensaje: 'Asignación actualizada',
      asignacion
    });
    
  } catch (error) {
    logger.error('Error al actualizar asignación:', error);
    res.status(500).json({ error: 'Error al actualizar asignación' });
  }
});

module.exports = router;
