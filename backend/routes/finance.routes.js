/**
 * Rutas de gestión financiera
 * Facturas, gastos, ingresos e informes
 */

const express = require('express');
const router = express.Router();
const { Invoice, Project, User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const ExcelJS = require('exceljs');
const logger = require('../config/logger');

router.use(authenticate);

/**
 * GET /api/finance/invoices
 * Listar facturas
 */
router.get('/invoices', authorize('admin', 'tesorero'), async (req, res) => {
  try {
    const { tipo, estado, desde, hasta } = req.query;
    
    const where = {};
    if (tipo) where.tipo = tipo;
    if (estado) where.estado = estado;
    
    if (desde && hasta) {
      where.fecha = {
        [require('sequelize').Op.between]: [desde, hasta]
      };
    }
    
    const facturas = await Invoice.findAll({
      where,
      include: [
        { model: Project, as: 'proyecto' },
        { model: User, as: 'registrado_por', attributes: ['nombre', 'apellidos'] }
      ],
      order: [['fecha', 'DESC']]
    });
    
    res.json(facturas);
    
  } catch (error) {
    logger.error('Error al listar facturas:', error);
    res.status(500).json({ error: 'Error al obtener facturas' });
  }
});

/**
 * POST /api/finance/invoices
 * Crear nueva factura
 */
router.post('/invoices', authorize('admin', 'tesorero'), async (req, res) => {
  try {
    const facturaData = {
      ...req.body,
      usuario_registro: req.user.id
    };
    
    const factura = await Invoice.create(facturaData);
    
    logger.info(`Factura creada: ${factura.numero_factura}`);
    
    res.status(201).json({
      mensaje: 'Factura creada correctamente',
      factura
    });
    
  } catch (error) {
    logger.error('Error al crear factura:', error);
    res.status(500).json({ error: 'Error al crear factura' });
  }
});

/**
 * GET /api/finance/summary
 * Resumen financiero
 */
router.get('/summary', authorize('admin', 'tesorero'), async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    
    const where = {};
    if (desde && hasta) {
      where.fecha = {
        [require('sequelize').Op.between]: [desde, hasta]
      };
    }
    
    const ingresos = await Invoice.sum('total', {
      where: { ...where, tipo: 'ingreso', estado: 'cobrada' }
    }) || 0;
    
    const gastos = await Invoice.sum('total', {
      where: { ...where, tipo: 'gasto', estado: 'pagada' }
    }) || 0;
    
    const pendientes_cobro = await Invoice.sum('total', {
      where: { ...where, tipo: 'ingreso', estado: 'pendiente' }
    }) || 0;
    
    const pendientes_pago = await Invoice.sum('total', {
      where: { ...where, tipo: 'gasto', estado: 'pendiente' }
    }) || 0;
    
    res.json({
      ingresos: parseFloat(ingresos),
      gastos: parseFloat(gastos),
      balance: parseFloat(ingresos) - parseFloat(gastos),
      pendientes_cobro: parseFloat(pendientes_cobro),
      pendientes_pago: parseFloat(pendientes_pago)
    });
    
  } catch (error) {
    logger.error('Error al obtener resumen:', error);
    res.status(500).json({ error: 'Error al obtener resumen financiero' });
  }
});

/**
 * GET /api/finance/export
 * Exportar a Excel
 */
router.get('/export', authorize('admin', 'tesorero'), async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    
    const where = {};
    if (desde && hasta) {
      where.fecha = {
        [require('sequelize').Op.between]: [desde, hasta]
      };
    }
    
    const facturas = await Invoice.findAll({
      where,
      order: [['fecha', 'ASC']]
    });
    
    // Crear libro Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Facturas');
    
    // Definir columnas
    worksheet.columns = [
      { header: 'Nº Factura', key: 'numero_factura', width: 15 },
      { header: 'Fecha', key: 'fecha', width: 12 },
      { header: 'Tipo', key: 'tipo', width: 10 },
      { header: 'Concepto', key: 'concepto', width: 30 },
      { header: 'Proveedor/Cliente', key: 'proveedor_cliente', width: 25 },
      { header: 'Base', key: 'importe', width: 12 },
      { header: 'IVA', key: 'iva', width: 8 },
      { header: 'Total', key: 'total', width: 12 },
      { header: 'Estado', key: 'estado', width: 12 }
    ];
    
    // Añadir datos
    facturas.forEach(f => {
      worksheet.addRow({
        numero_factura: f.numero_factura,
        fecha: f.fecha,
        tipo: f.tipo,
        concepto: f.concepto,
        proveedor_cliente: f.proveedor_cliente,
        importe: parseFloat(f.importe),
        iva: parseFloat(f.iva),
        total: parseFloat(f.total),
        estado: f.estado
      });
    });
    
    // Enviar archivo
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=facturas_${Date.now()}.xlsx`);
    
    await workbook.xlsx.write(res);
    res.end();
    
  } catch (error) {
    logger.error('Error al exportar:', error);
    res.status(500).json({ error: 'Error al exportar datos' });
  }
});

module.exports = router;
