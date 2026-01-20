/**
 * Middleware de autenticación JWT
 * Verifica y valida tokens de acceso
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../config/logger');

/**
 * Middleware para verificar token JWT
 */
const authenticate = async (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'No se proporcionó token de autenticación' 
      });
    }
    
    const token = authHeader.substring(7); // Remover 'Bearer '
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuario
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Usuario no encontrado' 
      });
    }
    
    if (!user.activo) {
      return res.status(401).json({ 
        error: 'Usuario inactivo' 
      });
    }
    
    // Actualizar último acceso
    await user.update({ ultimo_acceso: new Date() });
    
    // Añadir usuario a la petición
    req.user = user;
    next();
    
  } catch (error) {
    logger.error('Error en autenticación:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    
    return res.status(500).json({ error: 'Error de autenticación' });
  }
};

/**
 * Middleware para verificar roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'No autenticado' 
      });
    }
    
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ 
        error: 'No tienes permisos para realizar esta acción',
        rol_requerido: roles,
        tu_rol: req.user.rol
      });
    }
    
    next();
  };
};

/**
 * Middleware opcional de autenticación
 * Añade el usuario si existe token, pero no falla si no hay
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      
      if (user && user.activo) {
        req.user = user;
      }
    }
  } catch (error) {
    // Ignorar errores en autenticación opcional
  }
  
  next();
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth
};
