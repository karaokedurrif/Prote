/**
 * Rutas de autenticación
 * Login, registro, recuperación de contraseña
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const { User, Volunteer } = require('../models');
const validate = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const logger = require('../config/logger');

/**
 * POST /api/auth/register
 * Registro de nuevo usuario
 */
router.post('/register',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
    body('nombre').notEmpty().withMessage('El nombre es requerido'),
    body('apellidos').notEmpty().withMessage('Los apellidos son requeridos'),
    body('consentimiento_rgpd').equals('true').withMessage('Debe aceptar la política de privacidad')
  ],
  validate,
  async (req, res) => {
    try {
      const { email, password, nombre, apellidos, telefono } = req.body;
      
      // Verificar si el email ya existe
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }
      
      // Crear usuario
      const user = await User.create({
        email,
        password,
        nombre,
        apellidos,
        telefono,
        rol: 'usuario',
        consentimiento_rgpd: true,
        fecha_consentimiento: new Date()
      });
      
      // Generar token
      const token = jwt.sign(
        { id: user.id, email: user.email, rol: user.rol },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
      
      logger.info(`Nuevo usuario registrado: ${email}`);
      
      res.status(201).json({
        mensaje: 'Usuario registrado correctamente',
        token,
        user: user.toJSON()
      });
      
    } catch (error) {
      logger.error('Error en registro:', error);
      res.status(500).json({ error: 'Error al registrar usuario' });
    }
  }
);

/**
 * POST /api/auth/login
 * Inicio de sesión
 */
router.post('/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es requerida')
  ],
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Buscar usuario
      const user = await User.findOne({ 
        where: { email },
        include: [{ model: Volunteer, as: 'volunteer' }]
      });
      
      if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }
      
      // Verificar si está activo
      if (!user.activo) {
        return res.status(401).json({ error: 'Usuario inactivo. Contacta con el administrador' });
      }
      
      // Verificar contraseña
      const isValidPassword = await user.verificarPassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }
      
      // Generar token
      const token = jwt.sign(
        { id: user.id, email: user.email, rol: user.rol },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
      
      // Actualizar último acceso
      await user.update({ ultimo_acceso: new Date() });
      
      logger.info(`Login exitoso: ${email}`);
      
      res.json({
        mensaje: 'Login exitoso',
        token,
        user: user.toJSON()
      });
      
    } catch (error) {
      logger.error('Error en login:', error);
      res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  }
);

/**
 * GET /api/auth/me
 * Obtener datos del usuario actual
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Volunteer, as: 'volunteer' }]
    });
    
    res.json(user);
  } catch (error) {
    logger.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error al obtener datos del usuario' });
  }
});

/**
 * POST /api/auth/refresh
 * Renovar token
 */
router.post('/refresh', authenticate, async (req, res) => {
  try {
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, rol: req.user.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    res.json({ token });
  } catch (error) {
    logger.error('Error al renovar token:', error);
    res.status(500).json({ error: 'Error al renovar token' });
  }
});

module.exports = router;
