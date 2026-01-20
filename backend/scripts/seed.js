/**
 * Script de semillas (datos de ejemplo)
 * Inserta datos iniciales para desarrollo y pruebas
 */

const models = require('../models');
const logger = require('../config/logger');

async function seed() {
  try {
    logger.info('Insertando datos de ejemplo...');
    
    // Usuarios de prueba
    const adminUser = await models.User.create({
      email: 'admin@proteccioncivil.org',
      password: 'Admin123!',
      nombre: 'Admin',
      apellidos: 'Sistema',
      telefono: '941123456',
      rol: 'admin',
      activo: true,
      consentimiento_rgpd: true,
      fecha_consentimiento: new Date()
    });
    
    const tesoreroUser = await models.User.create({
      email: 'tesorero@proteccioncivil.org',
      password: 'Tesorero123!',
      nombre: 'María',
      apellidos: 'García López',
      telefono: '941123457',
      rol: 'tesorero',
      activo: true,
      consentimiento_rgpd: true,
      fecha_consentimiento: new Date()
    });
    
    const voluntarioUser = await models.User.create({
      email: 'voluntario@proteccioncivil.org',
      password: 'Voluntario123!',
      nombre: 'Juan',
      apellidos: 'Pérez Martínez',
      telefono: '941123458',
      rol: 'voluntario',
      activo: true,
      consentimiento_rgpd: true,
      fecha_consentimiento: new Date()
    });
    
    logger.info('✓ Usuarios creados');
    
    // Voluntarios
    const voluntario1 = await models.Volunteer.create({
      user_id: voluntarioUser.id,
      dni: '12345678A',
      fecha_nacimiento: '1990-05-15',
      direccion: 'Calle Mayor, 10',
      municipio: 'Aldeanueva de Ebro',
      codigo_postal: '26559',
      telefono_emergencia: '666777888',
      contacto_emergencia: 'Ana Pérez (madre)',
      grupo_sanguineo: 'O+',
      talla_uniforme: 'M',
      numero_calzado: '42',
      fecha_alta: new Date('2022-01-15'),
      estado: 'activo',
      especialidades: ['primeros_auxilios', 'conductor'],
      formacion: [
        { curso: 'Primeros Auxilios', fecha: '2022-02-20', horas: 20 },
        { curso: 'Prevención de Incendios', fecha: '2022-06-10', horas: 30 }
      ],
      disponibilidad: {
        lunes: { disponible: false, horario: '' },
        martes: { disponible: false, horario: '' },
        miercoles: { disponible: false, horario: '' },
        jueves: { disponible: false, horario: '' },
        viernes: { disponible: true, horario: '18:00-22:00' },
        sabado: { disponible: true, horario: 'Todo el día' },
        domingo: { disponible: true, horario: 'Todo el día' }
      },
      horas_servicio: 245,
      servicios_realizados: 52
    });
    
    logger.info('✓ Voluntarios creados');
    
    // Eventos
    const evento1 = await models.Event.create({
      titulo: 'Servicio preventivo Fiestas Patronales',
      descripcion: 'Servicio de seguridad y atención en fiestas del pueblo',
      tipo: 'servicio_preventivo',
      fecha_inicio: new Date('2024-08-15T10:00:00'),
      fecha_fin: new Date('2024-08-15T22:00:00'),
      ubicacion: 'Plaza del Ayuntamiento',
      municipio: 'Aldeanueva de Ebro',
      estado: 'planificado',
      responsable_id: adminUser.id,
      voluntarios_necesarios: 6,
      voluntarios_asignados: 0,
      equipamiento_necesario: ['radio', 'botiquín', 'chaleco'],
      publico: true
    });
    
    logger.info('✓ Eventos creados');
    
    // Inventario
    await models.InventoryItem.create({
      codigo: 'VEH-001',
      nombre: 'Vehículo 4x4 Toyota Hilux',
      descripcion: 'Vehículo todo terreno para emergencias',
      categoria: 'vehiculo',
      marca: 'Toyota',
      modelo: 'Hilux 2020',
      numero_serie: 'TOY123456',
      fecha_adquisicion: '2020-03-15',
      valor_adquisicion: 35000,
      estado: 'operativo',
      ubicacion: 'Garaje municipal',
      fecha_ultimo_mantenimiento: '2024-01-10',
      proximo_mantenimiento: '2024-07-10'
    });
    
    await models.InventoryItem.create({
      codigo: 'RAD-001',
      nombre: 'Emisora portátil PMR446',
      categoria: 'radio',
      marca: 'Motorola',
      modelo: 'T92',
      estado: 'operativo',
      ubicacion: 'Sede central',
      stock: 12,
      stock_minimo: 8
    });
    
    logger.info('✓ Inventario creado');
    
    // Noticias
    await models.News.create({
      titulo: 'Inauguración de nueva sede',
      slug: 'inauguracion-nueva-sede',
      resumen: 'Hemos inaugurado nuestra nueva sede en el centro del municipio',
      contenido: 'El pasado sábado inauguramos nuestra nueva sede central con la presencia del alcalde y autoridades locales. Las nuevas instalaciones cuentan con sala de formación, almacén de material y garaje para vehículos.',
      imagen_destacada: '/uploads/images/sede.jpg',
      categoria: 'general',
      autor_id: adminUser.id,
      publicada: true,
      fecha_publicacion: new Date('2024-01-20'),
      destacada: true,
      etiquetas: ['sede', 'inauguración', 'instalaciones']
    });
    
    logger.info('✓ Noticias creadas');
    
    // Anuncios
    await models.Announcement.create({
      titulo: 'Corte de carretera por obras',
      contenido: 'Se informa del corte de la carretera LR-123 entre las 8:00 y 18:00 horas por obras de asfaltado',
      tipo: 'corte_carretera',
      prioridad: 'alta',
      municipio: 'Aldeanueva de Ebro',
      fecha_inicio: new Date(),
      fecha_fin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      activo: true,
      moderado: true,
      moderador_id: adminUser.id,
      autor_id: adminUser.id,
      contacto: '941123456'
    });
    
    logger.info('✓ Anuncios creados');
    
    // Proyecto
    const proyecto = await models.Project.create({
      nombre: 'Renovación de equipamiento 2024',
      descripcion: 'Proyecto de renovación y ampliación del equipamiento de emergencias',
      tipo: 'proyecto_propio',
      estado: 'en_curso',
      fecha_inicio: '2024-01-01',
      fecha_fin: '2024-12-31',
      presupuesto: 45000,
      gastado: 12500,
      responsable_id: adminUser.id
    });
    
    // Facturas
    await models.Invoice.create({
      numero_factura: 'F-2024-001',
      tipo: 'gasto',
      categoria: 'Material',
      concepto: 'Compra de 10 chalecos reflectantes',
      descripcion: 'Chalecos reflectantes alta visibilidad',
      fecha: '2024-01-15',
      importe: 150.00,
      iva: 21.00,
      total: 181.50,
      proveedor_cliente: 'Uniformes del Norte S.L.',
      cif_nif: 'B12345678',
      metodo_pago: 'transferencia',
      estado: 'pagada',
      proyecto_id: proyecto.id,
      usuario_registro: adminUser.id
    });
    
    logger.info('✓ Proyectos y facturas creados');
    
    // Subvenciones
    await models.Grant.create({
      titulo: 'Ayudas para equipamiento de protección civil 2024',
      organismo: 'Ministerio del Interior - Dirección General de Protección Civil',
      descripcion: 'Subvenciones destinadas a la adquisición de equipamiento y material para agrupaciones de voluntarios',
      url_convocatoria: 'https://www.boe.es/ejemplo-convocatoria-2024',
      ambito: 'nacional',
      importe_maximo: 60000,
      fecha_publicacion: '2024-01-10',
      fecha_limite: '2024-03-31',
      estado: 'abierta',
      requisitos: 'Estar registrados como agrupación de voluntarios. Presentar memoria de actividades.',
      palabras_clave: ['protección civil', 'voluntarios', 'equipamiento'],
      relevancia: 95,
      solicitada: false
    });
    
    logger.info('✓ Subvenciones creadas');
    
    // Transporte
    await models.Transport.create({
      tipo: 'oferta',
      conductor_id: voluntarioUser.id,
      origen: 'Aldeanueva de Ebro',
      destino: 'Logroño',
      fecha_salida: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      hora_salida: '08:00',
      plazas_disponibles: 3,
      plazas_ocupadas: 0,
      precio_por_plaza: 5,
      descripcion: 'Viaje regular a Logroño para trabajo',
      estado: 'activa',
      contacto: '666777888'
    });
    
    logger.info('✓ Transporte creado');
    
    logger.info('');
    logger.info('=================================================');
    logger.info('✓ Datos de ejemplo insertados correctamente');
    logger.info('=================================================');
    logger.info('');
    logger.info('Usuarios de prueba:');
    logger.info('  Admin:');
    logger.info('    Email: admin@proteccioncivil.org');
    logger.info('    Password: Admin123!');
    logger.info('');
    logger.info('  Tesorero:');
    logger.info('    Email: tesorero@proteccioncivil.org');
    logger.info('    Password: Tesorero123!');
    logger.info('');
    logger.info('  Voluntario:');
    logger.info('    Email: voluntario@proteccioncivil.org');
    logger.info('    Password: Voluntario123!');
    logger.info('');
    
    process.exit(0);
    
  } catch (error) {
    logger.error('Error al insertar datos:', error);
    process.exit(1);
  }
}

seed();
