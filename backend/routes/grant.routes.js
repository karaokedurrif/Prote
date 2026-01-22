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
 * POST /api/grants/:id/analyze
 * Análisis IA de viabilidad de la subvención
 */
router.post('/:id/analyze', authenticate, async (req, res) => {
  if (!['admin', 'tesorero'].includes(req.user.rol)) {
    return res.status(403).json({ error: 'No autorizado' });
  }
  try {
    const subvencion = await Grant.findByPk(req.params.id);
    
    if (!subvencion) {
      return res.status(404).json({ error: 'Subvención no encontrada' });
    }

    // Análisis de viabilidad basado en múltiples factores
    const analisis = {
      viabilidad: calcularViabilidad(subvencion),
      puntosFuertes: [],
      puntosDebiles: [],
      recomendaciones: [],
      requisitosClaves: [],
      probabilidadExito: 0
    };

    // Puntos fuertes
    if (subvencion.importe_maximo && subvencion.importe_maximo > 10000) {
      analisis.puntosFuertes.push('Cuantía significativa que justifica el esfuerzo');
    }
    if (subvencion.ambito === 'nacional' || subvencion.ambito === 'europeo') {
      analisis.puntosFuertes.push('Ámbito amplio con mayor dotación presupuestaria');
    }
    
    // Puntos débiles
    const diasRestantes = calcularDiasRestantes(subvencion.fecha_limite);
    if (diasRestantes < 15) {
      analisis.puntosDebiles.push('Plazo muy ajustado para preparar documentación');
    }
    
    // Recomendaciones
    analisis.recomendaciones.push('Revisar bases de la convocatoria en detalle');
    analisis.recomendaciones.push('Preparar documentación administrativa con antelación');
    analisis.recomendaciones.push('Contactar con el organismo convocante para resolver dudas');
    
    // Requisitos clave
    analisis.requisitosClaves.push('Estar constituida como asociación sin ánimo de lucro');
    analisis.requisitosClaves.push('Justificar la actividad en Protección Civil');
    analisis.requisitosClaves.push('Presentar memoria de actividades y presupuesto');
    
    // Probabilidad de éxito
    analisis.probabilidadExito = Math.min(95, Math.max(20, 
      (subvencion.relevancia || 50) + (diasRestantes > 20 ? 20 : 0) + 15
    ));
    
    res.json({
      success: true,
      subvencion: {
        titulo: subvencion.titulo,
        organismo: subvencion.organismo,
        importe: subvencion.importe_maximo,
        plazo: subvencion.fecha_limite
      },
      analisis
    });
    
  } catch (error) {
    logger.error('Error en análisis:', error);
    res.status(500).json({ error: 'Error al analizar subvención' });
  }
});

function calcularViabilidad(subvencion) {
  let puntuacion = subvencion.relevancia || 50;
  
  if (subvencion.ambito === 'nacional') puntuacion += 10;
  if (subvencion.ambito === 'europeo') puntuacion += 15;
  if (subvencion.importe_maximo > 50000) puntuacion += 10;
  
  return Math.min(100, Math.max(0, puntuacion));
}

function calcularDiasRestantes(fechaLimite) {
  if (!fechaLimite) return null;
  const hoy = new Date();
  const limite = new Date(fechaLimite);
  const diff = limite - hoy;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * POST /api/grants/:id/generate-document
 * Generar documento de solicitud automáticamente
 */
router.post('/:id/generate-document', authenticate, async (req, res) => {
  if (!['admin', 'tesorero'].includes(req.user.rol)) {
    return res.status(403).json({ error: 'No autorizado' });
  }
  try {
    const subvencion = await Grant.findByPk(req.params.id);
    
    if (!subvencion) {
      return res.status(404).json({ error: 'Subvención no encontrada' });
    }

    const { organizationData } = req.body;
    
    // Datos por defecto de la organización
    const defaultOrgData = {
      nombre: 'Asociación de Protección Civil Palazuelos de Eresma',
      cif: 'G-40123456',
      direccion: 'Plaza Mayor, 1',
      codigoPostal: '40160',
      municipio: 'Palazuelos de Eresma',
      provincia: 'Segovia',
      email: 'info@pcpalazuelos.org',
      telefono: '921 123 456',
      representante: 'Coordinador/a',
      dniRepresentante: '12345678A',
      numVoluntarios: 25,
      anosActividad: 5,
      serviciosAnuales: 50,
      poblacion: 5500,
      ...organizationData
    };
    
    // Generar documento estructurado
    const documento = {
      success: true,
      subvencion: {
        titulo: subvencion.titulo,
        organismo: subvencion.organismo,
        referencia: subvencion.url_convocatoria || 'N/A',
        importe: subvencion.importe_maximo
      },
      organizacion: defaultOrgData,
      secciones: {
        datosIdentificativos: generarDatosIdentificativos(defaultOrgData),
        memoriaActividades: generarMemoriaActividades(defaultOrgData),
        justificacionNecesidad: generarJustificacion(subvencion, defaultOrgData),
        presupuesto: generarPresupuesto(subvencion),
        documentacionRequerida: [
          'CIF de la entidad',
          'Acta de constitución',
          'Estatutos de la asociación',
          'Certificado de cuenta bancaria',
          'Memoria de actividades del último año',
          'Declaración responsable de no incurrir en incompatibilidades'
        ]
      },
      timestamp: new Date()
    };
    
    res.json(documento);
    
  } catch (error) {
    logger.error('Error generando documento:', error);
    res.status(500).json({ error: 'Error al generar documento' });
  }
});

function generarDatosIdentificativos(org) {
  return `
DATOS IDENTIFICATIVOS DE LA ENTIDAD SOLICITANTE

Denominación: ${org.nombre}
CIF: ${org.cif}
Domicilio Social: ${org.direccion}, ${org.codigoPostal} ${org.municipio}
Provincia: ${org.provincia}
Teléfono: ${org.telefono}
Email: ${org.email}

Representante Legal: ${org.representante}
DNI: ${org.dniRepresentante}

Número de voluntarios activos: ${org.numVoluntarios}
Años de actividad: ${org.anosActividad}
Servicios anuales aproximados: ${org.serviciosAnuales}
`.trim();
}

function generarMemoriaActividades(org) {
  return `
MEMORIA DE ACTIVIDADES

La ${org.nombre} lleva ${org.anosActividad} años desarrollando actividades de Protección Civil en el municipio de ${org.municipio}, con un equipo de ${org.numVoluntarios} voluntarios activos.

ACTIVIDADES PRINCIPALES:
- Servicios preventivos en eventos municipales y festividades
- Colaboración con servicios de emergencias (112, bomberos, policía local)
- Formaciones periódicas en primeros auxilios y emergencias
- Campañas de prevención y concienciación ciudadana
- Apoyo en situaciones de emergencia y catástrofes

Durante el último año se han realizado aproximadamente ${org.serviciosAnuales} servicios, incluyendo:
- Servicios preventivos en eventos deportivos y culturales
- Colaboración en operativos de búsqueda y rescate
- Formación a población en autoprotección
- Mantenimiento y actualización de equipamiento
`.trim();
}

function generarJustificacion(subvencion, org) {
  return `
JUSTIFICACIÓN DE LA SOLICITUD

La ${org.nombre} solicita esta subvención para ${subvencion.titulo.toLowerCase()}.

NECESIDAD:
El equipamiento actual de la agrupación requiere renovación y ampliación para poder seguir prestando servicios de calidad a la ciudadanía. Los voluntarios necesitan material adecuado y actualizado conforme a normativa vigente.

OBJETIVOS:
1. Renovar equipamiento obsoleto de protección personal
2. Adquirir material sanitario y de primera intervención
3. Mejorar la capacidad de respuesta en emergencias
4. Garantizar la seguridad de los voluntarios

BENEFICIARIOS:
- Directos: ${org.numVoluntarios} voluntarios de la agrupación
- Indirectos: ${org.poblacion} habitantes del municipio de ${org.municipio}

IMPACTO ESPERADO:
Mayor capacidad de respuesta ante emergencias, mejor protección de voluntarios, servicio de mayor calidad a la comunidad.
`.trim();
}

function generarPresupuesto(subvencion) {
  const importe = subvencion.importe_maximo || 20000;
  return `
PRESUPUESTO ESTIMADO

| Concepto | Cantidad | Precio Unit. | Total |
|----------|----------|--------------|-------|
| Equipos de protección individual (EPIs) | 20 | 150€ | 3.000€ |
| Material sanitario y botiquines | 5 | 400€ | 2.000€ |
| Equipamiento de comunicaciones | 8 | 250€ | 2.000€ |
| Herramientas de intervención | 1 lote | 5.000€ | 5.000€ |
| Material de señalización | 1 lote | 2.000€ | 2.000€ |
| Formación especializada | 4 cursos | 1.000€ | 4.000€ |
| Otros gastos | - | - | 2.000€ |
| **TOTAL PRESUPUESTO** | | | **${Math.min(importe, 20000).toLocaleString()}€** |

IVA: Exento (entidad sin ánimo de lucro)
`.trim();
}

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
