/**
 * Índice de modelos
 * Importa y configura las relaciones entre todos los modelos
 */

const sequelize = require('../config/database');

// Importar todos los modelos
const User = require('./User.model');
const Volunteer = require('./Volunteer.model');
const Event = require('./Event.model');
const InventoryItem = require('./InventoryItem.model');
const Invoice = require('./Invoice.model');
const News = require('./News.model');
const Announcement = require('./Announcement.model');
const Grant = require('./Grant.model');
const MeshPosition = require('./MeshPosition.model');
const WeatherData = require('./WeatherData.model');
const Transport = require('./Transport.model');
const Project = require('./Project.model');
const EventVolunteer = require('./EventVolunteer.model');
const Drone = require('./Drone.model');
const RiskMapLayer = require('./RiskMapLayer.model');
const Vehicle = require('./Vehicle.model');
const PublicRegistration = require('./PublicRegistration.model');

// Definir relaciones entre modelos

// User - Volunteer (1:1)
User.hasOne(Volunteer, { foreignKey: 'user_id', as: 'volunteer' });
Volunteer.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Event - User (responsable)
Event.belongsTo(User, { foreignKey: 'responsable_id', as: 'responsable' });

// Event - Volunteer (muchos a muchos)
Event.belongsToMany(Volunteer, { 
  through: EventVolunteer, 
  foreignKey: 'event_id',
  as: 'voluntarios'
});
Volunteer.belongsToMany(Event, { 
  through: EventVolunteer, 
  foreignKey: 'volunteer_id',
  as: 'eventos'
});

// InventoryItem - Volunteer (asignación)
InventoryItem.belongsTo(Volunteer, { foreignKey: 'asignado_a', as: 'asignado' });
Volunteer.hasMany(InventoryItem, { foreignKey: 'asignado_a', as: 'equipamiento' });

// Invoice - Project
Invoice.belongsTo(Project, { foreignKey: 'proyecto_id', as: 'proyecto' });
Project.hasMany(Invoice, { foreignKey: 'proyecto_id', as: 'facturas' });

// Invoice - User (registro)
Invoice.belongsTo(User, { foreignKey: 'usuario_registro', as: 'registrado_por' });

// News - User (autor)
News.belongsTo(User, { foreignKey: 'autor_id', as: 'autor' });
User.hasMany(News, { foreignKey: 'autor_id', as: 'noticias' });

// Announcement - User (autor y moderador)
Announcement.belongsTo(User, { foreignKey: 'autor_id', as: 'autor' });
Announcement.belongsTo(User, { foreignKey: 'moderador_id', as: 'moderador' });

// MeshPosition - Volunteer
MeshPosition.belongsTo(Volunteer, { foreignKey: 'voluntario_id', as: 'voluntario' });
Volunteer.hasMany(MeshPosition, { foreignKey: 'voluntario_id', as: 'posiciones' });

// Transport - User (conductor)
Transport.belongsTo(User, { foreignKey: 'conductor_id', as: 'conductor' });
User.hasMany(Transport, { foreignKey: 'conductor_id', as: 'transportes' });

// Drone - User (piloto)
Drone.belongsTo(User, { foreignKey: 'piloto_id', as: 'piloto' });

// Vehicle - User (responsable y conductor)
Vehicle.belongsTo(User, { foreignKey: 'responsable_id', as: 'responsable' });
Vehicle.belongsTo(User, { foreignKey: 'conductor_actual_id', as: 'conductor_actual' });
Vehicle.belongsTo(Event, { foreignKey: 'servicio_actual_id', as: 'servicio_actual' });

// Exportar todos los modelos
module.exports = {
  sequelize,
  User,
  Volunteer,
  Event,
  EventVolunteer,
  InventoryItem,
  Invoice,
  Project,
  News,
  Announcement,
  Grant,
  MeshPosition,
  WeatherData,
  Transport,
  Drone,
  RiskMapLayer,
  Vehicle,
  PublicRegistration
};
