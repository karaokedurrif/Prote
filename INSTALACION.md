# 🚀 Instalación de Node.js

Para poder ejecutar este proyecto, necesitas instalar Node.js y npm primero.

## 📦 Instalación en Linux (Ubuntu/Debian)

### Opción 1: Usando NodeSource (Recomendado - Versión más reciente)

```bash
# Descargar e instalar Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version
npm --version
```

### Opción 2: Usando el gestor de paquetes de Ubuntu

```bash
# Instalar Node.js y npm
sudo apt update
sudo apt install nodejs npm

# Verificar instalación
node --version
npm --version
```

### Opción 3: Usando NVM (Node Version Manager) - Más flexible

```bash
# Instalar NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Recargar la terminal
source ~/.bashrc

# Instalar Node.js LTS
nvm install --lts
nvm use --lts

# Verificar instalación
node --version
npm --version
```

## ⚡ Después de instalar Node.js

Una vez instalado Node.js, ejecuta los siguientes comandos:

### 1. Instalar dependencias del Backend

```bash
cd /home/durrif2/Documentos/Prote/backend
npm install
```

### 2. Instalar dependencias del Frontend

```bash
cd /home/durrif2/Documentos/Prote/frontend
npm install
```

### 3. Configurar variables de entorno

```bash
# Backend
cd /home/durrif2/Documentos/Prote/backend
cp .env.example .env
# Editar .env con tus credenciales

# Frontend
cd /home/durrif2/Documentos/Prote/frontend
cp .env.example .env
# Editar .env si es necesario
```

### 4. Inicializar la base de datos

```bash
cd /home/durrif2/Documentos/Prote/backend
npm run migrate
npm run seed
```

### 5. Ejecutar la aplicación

```bash
# Terminal 1 - Backend
cd /home/durrif2/Documentos/Prote/backend
npm run dev

# Terminal 2 - Frontend
cd /home/durrif2/Documentos/Prote/frontend
npm start
```

## 🎨 Nuevas Características Visuales

✅ **Logo moderno** - Escudo de Protección Civil con gradiente y diseño profesional
✅ **Paleta de colores elegante** - Gradientes, sombras y animaciones suaves
✅ **Componentes UI reutilizables**:
   - Button (con variantes primary, secondary, outline, success, danger)
   - Card (con header, body, footer)
   - Badge (diferentes colores y tamaños)
   - Input (con validación y estados de error)
   - Alert (info, success, warning, danger)
   - StatCard (para métricas del dashboard)
   - Table (tablas elegantes y responsivas)
   - Modal (ventanas modales modernas)

✅ **Animaciones** - fade-in, slide-up, scale-in, pulse-soft
✅ **Tipografía moderna** - Fuentes Inter y Poppins
✅ **Diseño responsivo** - Optimizado para móvil, tablet y desktop
✅ **Efectos visuales** - Sombras suaves, hover effects, gradientes

## 📁 Ubicación de archivos creados

```
frontend/
├── src/
│   ├── assets/
│   │   ├── logo.svg          # Logo principal (200x200)
│   │   └── favicon.svg       # Favicon (32x32)
│   ├── components/
│   │   └── ui/
│   │       ├── Button.js
│   │       ├── Badge.js
│   │       ├── Card.js
│   │       ├── Input.js
│   │       ├── Alert.js
│   │       ├── StatCard.js
│   │       ├── Table.js
│   │       ├── Modal.js
│   │       └── index.js      # Barrel export
│   ├── layouts/
│   │   └── PublicLayout.js   # Layout actualizado con logo
│   ├── pages/
│   │   └── public/
│   │       └── HomePage.js   # Página de inicio renovada
│   ├── index.css             # Estilos globales mejorados
│   └── tailwind.config.js    # Tema personalizado extendido
```

## 🎨 Cómo usar los componentes UI

```javascript
import { Button, Card, Badge, Alert } from '../components/ui';

// Botón
<Button variant="primary" size="md">Guardar</Button>

// Card
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardBody>
    Contenido
  </CardBody>
</Card>

// Badge
<Badge variant="success">Activo</Badge>

// Alert
<Alert variant="info" title="Información">
  Este es un mensaje informativo
</Alert>
```

## 💡 Acceso al sistema

Después de ejecutar `npm run seed`, puedes acceder con:

- **Admin**: admin@proteccioncivil.org / Admin123!
- **Coordinador**: coord@proteccioncivil.org / Coord123!
- **Voluntario**: voluntario@proteccioncivil.org / Volun123!

## 🆘 Problemas comunes

### Error: `npm: command not found`
Solución: Instala Node.js usando las instrucciones anteriores

### Error: `EACCES: permission denied`
Solución: No uses `sudo npm install`, configura npm para uso sin sudo:
```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Error de conexión a PostgreSQL
Solución: Asegúrate de que PostgreSQL está instalado y corriendo:
```bash
sudo systemctl status postgresql
sudo systemctl start postgresql
```
