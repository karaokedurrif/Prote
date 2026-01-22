/**
 * Rutas públicas
 * Información pública del sitio web
 */

const express = require('express');
const router = express.Router();
const { News, Announcement, Event, Transport, PublicRegistration, User } = require('../models');
const { optionalAuth } = require('../middleware/auth.middleware');
const logger = require('../config/logger');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * GET /api/public/news
 * Obtener noticias publicadas
 */
router.get('/news', async (req, res) => {
  try {
    const { page = 1, limit = 10, categoria } = req.query;
    const offset = (page - 1) * limit;
    
    const where = { publicada: true };
    if (categoria) {
      where.categoria = categoria;
    }
    
    const { count, rows: noticias } = await News.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['fecha_publicacion', 'DESC']],
      attributes: { exclude: ['contenido'] } // Excluir contenido completo en listado
    });
    
    res.json({
      noticias,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
    
  } catch (error) {
    logger.error('Error al obtener noticias:', error);
    res.status(500).json({ error: 'Error al obtener noticias' });
  }
});

/**
 * GET /api/public/news/:slug
 * Obtener una noticia específica
 */
router.get('/news/:slug', async (req, res) => {
  try {
    const noticia = await News.findOne({
      where: { slug: req.params.slug, publicada: true }
    });
    
    if (!noticia) {
      return res.status(404).json({ error: 'Noticia no encontrada' });
    }
    
    // Incrementar contador de visitas
    await noticia.increment('visitas');
    
    res.json(noticia);
    
  } catch (error) {
    logger.error('Error al obtener noticia:', error);
    res.status(500).json({ error: 'Error al obtener noticia' });
  }
});

/**
 * GET /api/public/announcements
 * Obtener anuncios activos del tablón rural
 */
router.get('/announcements', async (req, res) => {
  try {
    const { municipio } = req.query;
    
    const where = {
      activo: true,
      moderado: true,
      fecha_inicio: { [require('sequelize').Op.lte]: new Date() }
    };
    
    if (municipio) {
      where.municipio = municipio;
    }
    
    const anuncios = await Announcement.findAll({
      where,
      order: [
        ['prioridad', 'DESC'],
        ['fecha_inicio', 'DESC']
      ],
      limit: 50
    });
    
    res.json(anuncios);
    
  } catch (error) {
    logger.error('Error al obtener anuncios:', error);
    res.status(500).json({ error: 'Error al obtener anuncios' });
  }
});

/**
 * GET /api/public/events
 * Obtener eventos públicos
 */
router.get('/events', async (req, res) => {
  try {
    const eventos = await Event.findAll({
      where: {
        publico: true,
        estado: ['planificado', 'en_curso']
      },
      order: [['fecha_inicio', 'ASC']],
      limit: 20
    });
    
    res.json(eventos);
    
  } catch (error) {
    logger.error('Error al obtener eventos:', error);
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
});

/**
 * GET /api/public/transport
 * Obtener ofertas de transporte rural
 */
router.get('/transport', async (req, res) => {
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
 * POST /api/public/contact
 * Formulario de contacto
 */
router.post('/contact', async (req, res) => {
  try {
    const { nombre, email, telefono, asunto, mensaje } = req.body;
    
    // Aquí se enviaría un email al administrador
    // Por ahora solo registramos en logs
    logger.info(`Contacto recibido: ${nombre} - ${email} - ${asunto}`);
    
    // TODO: Implementar envío de email con nodemailer
    
    res.json({ mensaje: 'Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.' });
    
  } catch (error) {
    logger.error('Error en formulario de contacto:', error);
    res.status(500).json({ error: 'Error al enviar mensaje' });
  }
});

/**
 * POST /api/public/volunteer-request
 * Solicitud de inscripción como voluntario
 */
router.post('/volunteer-request', async (req, res) => {
  try {
    const { 
      nombre, 
      apellidos, 
      email, 
      telefono, 
      municipio, 
      motivacion 
    } = req.body;
    
    // Registrar solicitud
    logger.info(`Solicitud de voluntariado: ${nombre} ${apellidos} - ${email}`);
    
    // TODO: Crear registro pendiente de aprobación
    // TODO: Enviar email de confirmación
    
    res.json({ 
      mensaje: 'Solicitud recibida. Te contactaremos pronto para completar el proceso de incorporación.' 
    });
    
  } catch (error) {
    logger.error('Error en solicitud de voluntariado:', error);
    res.status(500).json({ error: 'Error al enviar solicitud' });
  }
});

/**
 * POST /api/public/register-trial
 * Registro para cuenta trial de ResqNet
 */
router.post('/register-trial', async (req, res) => {
  try {
    const { 
      email, 
      firstName, 
      lastName, 
      organization, 
      phone, 
      country = 'ES', 
      language = 'es' 
    } = req.body;

    // Validación
    if (!email || !firstName || !lastName || !organization) {
      return res.status(400).json({ 
        error: 'Email, nombre, apellidos y organización son obligatorios' 
      });
    }

    // Verificar si ya existe - usar sequelize directamente si hay problemas con el modelo
    let existing = null;
    try {
      existing = await PublicRegistration.findOne({ where: { email } });
    } catch (modelError) {
      logger.error('Error al buscar registro existente:', modelError);
      // Continuar sin verificar duplicados si hay error en el modelo
    }
    
    if (existing) {
      return res.status(400).json({ 
        error: 'Este email ya está registrado. Revisa tu correo para acceder.' 
      });
    }

    // Crear trial (30 días)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 30);

    // Generar token de acceso temporal
    const accessToken = jwt.sign(
      { email, type: 'trial' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Crear usuario trial automático en tabla User
    const password = Math.random().toString(36).slice(-12); // Password temporal
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      nombre: firstName,
      apellidos: lastName,
      rol: 'voluntario', // Rol básico para trials
      activo: true
    });

    // Crear registro público
    const registration = await PublicRegistration.create({
      email,
      firstName,
      lastName,
      organization,
      phone,
      country,
      language,
      trialEndsAt,
      accessToken,
      status: 'active'
    });

    logger.info(`Nueva cuenta trial registrada: ${email} - ${organization}`);

    // TODO: Enviar email de bienvenida con credenciales

    res.json({
      mensaje: 'Cuenta trial creada con éxito. Revisa tu email para acceder.',
      trialEndsAt,
      email,
      token: accessToken
    });

  } catch (error) {
    logger.error('Error en registro trial:', error);
    res.status(500).json({ error: 'Error al crear cuenta trial' });
  }
});

module.exports = router;
