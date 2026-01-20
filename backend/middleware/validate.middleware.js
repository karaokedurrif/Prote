/**
 * Middleware de validación
 * Valida datos de entrada usando express-validator
 */

const { validationResult } = require('express-validator');

/**
 * Middleware para verificar resultados de validación
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Errores de validación',
      detalles: errors.array()
    });
  }
  
  next();
};

module.exports = validate;
