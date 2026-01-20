# Sistema de Gestión para Asociación de Voluntarios de Protección Civil

Sistema integral de gestión web y móvil para asociaciones de voluntarios de protección civil en entornos rurales. Incluye ERP completo, comunicaciones mesh (Meshtastic), gestión de emergencias, asistente IA y múltiples módulos innovadores.

## 🚀 Características Principales

### Funcionalidades Públicas
- 🏠 Página de inicio con misión y llamadas a la acción
- 👥 Sección "Quiénes somos" con historia y estructura
- 🚨 Áreas de actividad (emergencias, preventivos, formación, proyectos sociales)
- 📋 Tablón de anuncios rural con moderación
- 🚗 Sistema de transporte rural compartido
- 📰 Noticias y galería multimedia
- 📞 Formularios de contacto y voluntariado

### Funcionalidades Privadas (ERP)
- 🔐 Autenticación JWT con roles y permisos
- 💰 Gestión financiera (facturas, gastos, informes)
- 📦 Inventario y logística (equipos, mantenimiento, uniformes)
- 👷 Gestión de voluntarios (fichas, formación, turnos, horas)
- 📅 Calendario de eventos y planificación
- 🔍 Buscador inteligente de subvenciones
- 🤖 Asistente de IA para financiación

### Módulos Innovadores
- 📡 Comunicaciones mesh con Meshtastic (LoRa)
- 🗺️ Mapa en tiempo real con geolocalización
- 🌤️ Alertas meteorológicas y estaciones locales
- 🚙 Carsharing rural con reservas
- 🚁 Gestión de drones y sensores IoT
- 🗺️ Mapa de riesgos interactivo (inundaciones, incendios)
- 🌍 Multilingüe (español/inglés) y accesible (WCAG)

## 🛠️ Tecnologías

### Frontend
- **React 18** - Framework UI
- **Tailwind CSS** - Estilos y diseño responsive
- **React Router** - Navegación
- **Axios** - Cliente HTTP
- **Leaflet** - Mapas interactivos
- **Socket.io-client** - WebSockets para tiempo real
- **React Query** - Gestión de estado del servidor
- **React Hook Form** - Gestión de formularios
- **i18next** - Internacionalización

### Backend
- **Node.js 18+** - Runtime
- **Express** - Framework web
- **PostgreSQL** - Base de datos
- **Sequelize** - ORM
- **JWT** - Autenticación
- **Socket.io** - WebSockets
- **Nodemailer** - Envío de emails
- **node-cron** - Tareas programadas
- **Multer** - Upload de archivos
- **Jest** - Testing

### Servicios Externos
- **Meshtastic** - Comunicaciones LoRa
- **OpenWeatherMap API** - Datos meteorológicos
- **OpenAI API** - Asistente IA (opcional)

## 📋 Requisitos Previos

- Node.js 18+ y npm
- PostgreSQL 14+
- Git

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd Prote
```

### 2. Configurar Backend

```bash
cd backend
npm install
```

Crear archivo `.env` en `backend/`:

```env
# Servidor
PORT=5000
NODE_ENV=development

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=proteccion_civil
DB_USER=postgres
DB_PASSWORD=tu_password

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura_cambiala
JWT_EXPIRES_IN=7d

# Email (configurar con tu proveedor SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# APIs Externas
OPENWEATHER_API_KEY=tu_api_key
OPENAI_API_KEY=tu_api_key_opcional

# Meshtastic
MESHTASTIC_SERIAL_PORT=/dev/ttyUSB0

# Uploads
MAX_FILE_SIZE=10485760
```

### 3. Configurar Base de Datos

```bash
# Crear base de datos PostgreSQL
createdb proteccion_civil

# O usando psql:
psql -U postgres
CREATE DATABASE proteccion_civil;
\q

# Ejecutar migraciones
cd backend
npm run migrate

# Insertar datos de ejemplo
npm run seed
```

### 4. Configurar Frontend

```bash
cd frontend
npm install
```

Crear archivo `.env` en `frontend/`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=http://localhost:5000
REACT_APP_MAPBOX_TOKEN=tu_token_mapbox_opcional
```

## 🎯 Ejecución

### Desarrollo

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm start
```

El backend estará en `http://localhost:5000` y el frontend en `http://localhost:3000`

### Producción

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Servir con nginx o servidor estático
```

## 🧪 Testing

```bash
# Backend
cd backend
npm test
npm run test:coverage

# Frontend
cd frontend
npm test
```

## 📁 Estructura del Proyecto

```
Prote/
├── backend/                    # Servidor Node.js + Express
│   ├── config/                 # Configuración (DB, JWT, etc.)
│   ├── controllers/            # Controladores de rutas
│   ├── models/                 # Modelos Sequelize
│   ├── routes/                 # Definición de rutas
│   ├── middleware/             # Middleware (auth, validación)
│   ├── services/               # Lógica de negocio
│   ├── utils/                  # Utilidades
│   ├── tests/                  # Tests unitarios e integración
│   └── server.js               # Punto de entrada
├── frontend/                   # Aplicación React
│   ├── public/                 # Archivos estáticos
│   └── src/
│       ├── components/         # Componentes reutilizables
│       ├── pages/              # Páginas/vistas
│       ├── layouts/            # Layouts (público, privado)
│       ├── services/           # Servicios API
│       ├── hooks/              # Hooks personalizados
│       ├── context/            # Context API
│       ├── utils/              # Utilidades
│       └── App.js              # Componente raíz
├── docs/                       # Documentación adicional
├── db/                         # Scripts de BD
└── README.md                   # Este archivo
```

## 👤 Usuarios de Prueba

Después de ejecutar `npm run seed`, tendrás estos usuarios:

```
Admin:
- Email: admin@proteccioncivil.org
- Password: Admin123!

Tesorero:
- Email: tesorero@proteccioncivil.org
- Password: Tesorero123!

Voluntario:
- Email: voluntario@proteccioncivil.org
- Password: Voluntario123!
```

## 🔐 Seguridad

- ✅ Autenticación JWT con tokens seguros
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Validación de datos de entrada
- ✅ Protección contra SQL injection (ORM)
- ✅ CORS configurado
- ✅ Rate limiting en endpoints
- ✅ Sanitización de inputs
- ✅ HTTPS recomendado en producción
- ✅ Variables de entorno para secretos
- ✅ Cumplimiento RGPD

## 📖 Documentación API

La documentación completa de la API está disponible en `/docs/API.md`

Endpoints principales:
- `POST /api/auth/login` - Autenticación
- `GET /api/public/news` - Noticias públicas
- `GET /api/volunteers` - Gestión de voluntarios (privado)
- `GET /api/inventory` - Inventario (privado)
- `WS /mesh/positions` - WebSocket para posiciones mesh

## 🌍 Internacionalización

El sistema soporta:
- 🇪🇸 Español (por defecto)
- 🇬🇧 Inglés

Los archivos de traducción están en `frontend/src/i18n/`

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte o consultas:
- Email: dev@proteccioncivil.org
- Documentación: `/docs`
- Issues: GitHub Issues

## 🙏 Agradecimientos

Desarrollado para apoyar el trabajo esencial de las asociaciones de voluntarios de protección civil en entornos rurales.

---

**Nota:** Este es un sistema completo y modular. Puedes activar/desactivar módulos según las necesidades específicas de tu asociación editando la configuración.
