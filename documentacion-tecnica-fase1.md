# Documentación Técnica - Sistema de Paz y Salvos PH Colombia
## Fase 1 y 2: Desarrollo de Backend

**Versión:** 1.1.0  
**Fecha:** 09/07/2025  
**Autor:** Equipo de Desarrollo  
**Última actualización:** 09/07/2025

## Índice

1. [Introducción](#1-introducción)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Stack Tecnológico](#3-stack-tecnológico)
4. [Estructura del Proyecto](#4-estructura-del-proyecto)
5. [Módulos Implementados](#5-módulos-implementados)
6. [Servicios Core](#6-servicios-core)
7. [Seguridad](#7-seguridad)
8. [Base de Datos](#8-base-de-datos)
9. [Variables de Entorno](#9-variables-de-entorno)
10. [Instalación y Ejecución](#10-instalación-y-ejecución)
11. [Mejoras de la Fase 2](#11-mejoras-de-la-fase-2)
12. [Contenerización con Docker](#12-contenerización-con-docker)
13. [Próximos Pasos](#13-próximos-pasos)

## 1. Introducción

El Sistema de Paz y Salvos PH Colombia es una aplicación web diseñada para facilitar la gestión de paz y salvos para administradores de propiedad horizontal en Colombia. El sistema permite a los propietarios de inmuebles verificar su estado de cuenta y generar certificados de paz y salvo, mientras que los administradores pueden gestionar sus copropiedades y conectarlas con hojas de Google para mantener la información actualizada.

### 1.1 Objetivos del Sistema

- Proporcionar una plataforma segura y eficiente para la gestión de paz y salvos
- Minimizar el almacenamiento de datos personales mediante consultas en tiempo real
- Optimizar el rendimiento con caché intensivo
- Garantizar la disponibilidad mediante circuit breakers para APIs externas
- Ofrecer una arquitectura modular y escalable

### 1.2 Principios de Diseño

- **No almacenamiento de datos personales**: Los datos de propietarios se consultan en tiempo real desde Google Sheets
- **Caché intensivo**: Minimiza llamadas a APIs externas para optimizar rendimiento
- **Arquitectura modular**: Permite agregar nuevos servicios fácilmente
- **Seguridad robusta**: Validación estricta, rate limiting y autenticación JWT
- **Resiliencia**: Circuit breakers para protección contra fallos en cascada

## 2. Arquitectura del Sistema

El sistema sigue una arquitectura de capas con separación clara de responsabilidades:

```
Frontend (Next.js) → API Gateway → Backend (Express) → Servicios Externos
                                     ↓
                       PostgreSQL + Redis + Google APIs
```

### 2.1 Componentes Principales

- **Frontend**: Aplicación Next.js (React) con SSR y PWA
- **API Gateway**: Gestión de solicitudes, rate limiting y seguridad
- **Backend**: Servicios Express.js con lógica de negocio
- **Servicios Externos**: Google Sheets/Docs, SMS Gateway
- **Almacenamiento**: PostgreSQL (datos del sistema), Redis (caché)

### 2.2 Flujo de Datos

1. El cliente realiza una solicitud desde el frontend
2. La solicitud pasa por el API Gateway para validación y rate limiting
3. El backend procesa la solicitud y consulta los datos necesarios
4. Se utilizan circuit breakers para proteger llamadas a servicios externos
5. Los resultados se almacenan en caché para optimizar futuras consultas
6. Se devuelve la respuesta al cliente

## 3. Stack Tecnológico

### 3.1 Backend

- **Runtime**: Node.js 18.x
- **Framework**: Express.js 5.1.0
- **ORM**: Prisma 6.11.1
- **Base de Datos**: PostgreSQL 14.x
- **Caché**: Redis 6.x (ioredis 5.6.1)
- **Autenticación**: JWT (jsonwebtoken 9.0.2)
- **Validación**: Joi 17.13.3
- **Circuit Breaker**: Opossum 9.0.0
- **Logging**: Winston 3.17.0
- **PDF**: PDFKit 0.17.1
- **Google APIs**: googleapis 152.0.0
- **Colas**: Bull 4.16.5

### 3.2 Infraestructura

- **Entorno**: Node.js en contenedores Docker
- **Base de Datos**: PostgreSQL
- **Caché**: Redis
- **Almacenamiento**: Sistema de archivos local (temporal)
- **APIs Externas**: Google Workspace, SMS Gateway

## 4. Estructura del Proyecto

```
backend/
├── src/                      # Código fuente
│   ├── controllers/          # Controladores para cada módulo
│   │   ├── adminSistemaController.js
│   │   ├── administradorController.js
│   │   ├── authController.js
│   │   └── propietarioController.js
│   ├── middlewares/          # Middlewares
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   ├── rateLimitMiddleware.js
│   │   └── validationMiddleware.js
│   ├── routes/               # Rutas de la API
│   │   ├── adminSistemaRoutes.js
│   │   ├── administradorRoutes.js
│   │   ├── authRoutes.js
│   │   └── propietarioRoutes.js
│   ├── services/             # Servicios
│   │   ├── cacheService.js
│   │   ├── circuitBreakerService.js
│   │   ├── googleSheetsService.js
│   │   ├── pdfService.js
│   │   └── smsService.js
│   ├── utils/                # Utilidades
│   │   ├── errorHandler.js
│   │   └── logger.js
│   ├── app.js                # Configuración de Express
│   └── server.js             # Punto de entrada
├── prisma/                   # Configuración de Prisma ORM
│   ├── schema.prisma         # Esquema de base de datos
│   └── seed.js               # Script de inicialización
├── public/                   # Archivos estáticos
├── tmp/                      # Directorio temporal para PDFs
├── logs/                     # Logs de la aplicación
├── .env.example              # Ejemplo de variables de entorno
└── package.json              # Dependencias y scripts
```

## 5. Módulos Implementados

### 5.1 Módulo de Autenticación

Gestiona el registro, inicio de sesión y recuperación de contraseñas para todos los tipos de usuarios.

**Características principales:**
- Autenticación basada en JWT con tokens de acceso y refresco
- Verificación de teléfono mediante códigos SMS
- Bloqueo temporal después de intentos fallidos
- Validación estricta de datos

### 5.2 Módulo de Administradores

Permite a los administradores de propiedad horizontal gestionar su perfil y copropiedades.

**Características principales:**
- Registro y autenticación con verificación por SMS
- Gestión de perfil personal
- CRUD para copropiedades administradas
- Conexión con hojas de Google Sheets
- Consulta de eventos y estadísticas

**Endpoints implementados:**
```
GET    /api/v1/administradores/perfil
PUT    /api/v1/administradores/perfil
GET    /api/v1/administradores/copropiedades
POST   /api/v1/administradores/copropiedades
GET    /api/v1/administradores/copropiedades/:id
PUT    /api/v1/administradores/copropiedades/:id
DELETE /api/v1/administradores/copropiedades/:id
GET    /api/v1/administradores/copropiedades/:id/eventos
GET    /api/v1/administradores/copropiedades/:id/estadisticas
```

### 5.3 Módulo de Propietarios

Permite a los propietarios consultar su estado de cuenta y generar paz y salvos.

**Características principales:**
- Búsqueda de copropiedad por NIT
- Verificación por SMS sin registro previo
- Consulta de inmuebles asociados
- Verificación de estado de cuenta
- Generación de paz y salvo en PDF

**Endpoints implementados:**
```
POST   /api/v1/propietarios/buscar-copropiedad
POST   /api/v1/propietarios/solicitar-codigo
POST   /api/v1/propietarios/verificar-codigo
GET    /api/v1/propietarios/inmuebles
GET    /api/v1/propietarios/verificar-estado/:inmuebleId
GET    /api/v1/propietarios/generar-paz-y-salvo/:inmuebleId
```

### 5.4 Módulo de Administrador del Sistema

Permite al superadmin gestionar todo el sistema, usuarios y configuraciones.

**Características principales:**
- Estadísticas globales del sistema
- Gestión de administradores
- Gestión de copropiedades
- Consulta de logs del sistema
- Estado y reset de circuit breakers
- Estado y limpieza de caché Redis

**Endpoints implementados:**
```
GET    /api/v1/admin-sistema/estadisticas
GET    /api/v1/admin-sistema/administradores
GET    /api/v1/admin-sistema/administradores/:id
PUT    /api/v1/admin-sistema/administradores/:id/estado
GET    /api/v1/admin-sistema/copropiedades
GET    /api/v1/admin-sistema/copropiedades/:id
PUT    /api/v1/admin-sistema/copropiedades/:id/estado
PUT    /api/v1/admin-sistema/copropiedades/:id/pagos
POST   /api/v1/admin-sistema/registrar
GET    /api/v1/admin-sistema/logs
GET    /api/v1/admin-sistema/circuit-breakers
POST   /api/v1/admin-sistema/circuit-breakers/:nombre/reset
GET    /api/v1/admin-sistema/cache
DELETE /api/v1/admin-sistema/cache/:patron
```

## 6. Servicios Core

### 6.1 Google Sheets Service

Implementa la integración con Google Sheets para consultar datos de propietarios y copropiedades en tiempo real.

**Funcionalidades principales:**
- Autenticación con Google API mediante credenciales de servicio
- Extracción de IDs de hojas desde URLs
- Validación de formato de hoja de cálculo
- Búsqueda de propiedades por identificación
- Verificación de estado de cuenta
- Caché de resultados con Redis
- Circuit breakers para protección contra fallos

**Métodos clave:**
```javascript
// Validar formato de hoja de cálculo
validateSheetFormat(spreadsheetId)

// Buscar propietario por identificación
findPropietarioByIdentificacion(spreadsheetId, identificacion)

// Verificar estado de cuenta
verificarEstadoCuenta(spreadsheetId, inmuebleId)
```

### 6.2 SMS Service

Gestiona el envío y verificación de códigos SMS para autenticación y validación de usuarios.

**Funcionalidades principales:**
- Validación de números de teléfono colombianos
- Generación de códigos aleatorios seguros
- Rate limiting para prevenir abuso
- Integración con proveedor de SMS (simulado)
- Almacenamiento y verificación de códigos
- Expiración automática de códigos

**Métodos clave:**
```javascript
// Enviar código SMS
sendVerificationCode(phoneNumber, type)

// Verificar código SMS
verifyCode(phoneNumber, code, type)
```

### 6.3 Cache Service

Implementa un sistema de caché intensivo con Redis para optimizar el rendimiento.

**Funcionalidades principales:**
- Almacenamiento y recuperación de datos en caché
- Expiración automática de datos
- Patrón getOrSet para minimizar llamadas a APIs externas
- Eliminación por patrón para limpieza selectiva
- Manejo de eventos de conexión y errores

**Métodos clave:**
```javascript
// Obtener o establecer valor en caché
getOrSet(key, fetchFunction, ttl)

// Eliminar por patrón
deleteByPattern(pattern)
```

### 6.4 Circuit Breaker Service

Implementa el patrón Circuit Breaker para proteger llamadas a APIs externas y evitar fallos en cascada.

**Funcionalidades principales:**
- Creación y gestión de circuit breakers
- Monitoreo de estado (abierto, cerrado, semi-abierto)
- Estadísticas de éxitos, fallos y rechazos
- Funciones de fallback para manejo de errores
- Logging de eventos de circuit breaker

**Métodos clave:**
```javascript
// Ejecutar función a través de circuit breaker
execute(name, asyncFunction, args, fallbackFn, options)

// Obtener estadísticas
getStats()
```

### 6.5 PDF Service

Gestiona la generación de documentos PDF para paz y salvos.

**Funcionalidades principales:**
- Generación local de PDFs con PDFKit
- Plantillas personalizables para paz y salvos
- Integración con Google Docs como fallback
- Almacenamiento temporal de archivos
- Eliminación automática de archivos temporales

**Métodos clave:**
```javascript
// Generar paz y salvo en PDF
generatePazYSalvoPDF(datosInmueble, datosCopropiedad, datosAdministrador)
```

## 7. Seguridad

### 7.1 Autenticación y Autorización

- **JWT**: Tokens de acceso con expiración configurable
- **Roles**: Middleware para verificación de roles (administrador, superadmin)
- **Verificación SMS**: Segundo factor para operaciones sensibles
- **Bloqueo temporal**: Después de múltiples intentos fallidos

### 7.2 Protección contra Ataques

- **Rate Limiting**: Límites generales y específicos para APIs sensibles
- **Helmet**: Configuración de cabeceras HTTP de seguridad
- **CORS**: Restricción de orígenes permitidos
- **Validación**: Esquemas Joi para validación estricta de entrada

### 7.3 Manejo de Datos Sensibles

- **No almacenamiento**: Datos personales consultados en tiempo real
- **Redacción en logs**: Eliminación de información sensible en logs
- **HTTPS**: Comunicación cifrada (configuración en producción)
- **Caducidad**: Expiración automática de datos temporales

## 8. Base de Datos

### 8.1 Esquema de Base de Datos

El sistema utiliza PostgreSQL con Prisma ORM para la gestión de datos. Los principales modelos son:

- **AdminSistema**: Administradores del sistema (superadmin)
- **Administrador**: Administradores de propiedad horizontal
- **Copropiedad**: Unidades residenciales administradas
- **CodigoSMS**: Códigos de verificación enviados
- **Evento**: Registro de eventos del sistema
- **Pago**: Pagos realizados por administradores
- **Log**: Logs del sistema para auditoría

### 8.2 Relaciones Principales

```
Administrador 1:N Copropiedad (Un administrador gestiona muchas copropiedades)
Administrador 1:N CodigoSMS (Un administrador recibe muchos códigos)
Copropiedad 1:N Evento (Una copropiedad tiene muchos eventos)
Copropiedad 1:N Pago (Una copropiedad tiene muchos pagos)
```

### 8.3 Enumeraciones

- **TipoCodigoSMS**: REGISTRO, LOGIN, RECUPERACION, VERIFICACION
- **TipoEvento**: REGISTRO_ADMIN, LOGIN_ADMIN, REGISTRO_COPROPIEDAD, GENERACION_PAZ_Y_SALVO, PAGO, ERROR_SISTEMA, CAMBIO_CONFIGURACION
- **EstadoPago**: PENDIENTE, COMPLETADO, FALLIDO, CANCELADO
- **NivelLog**: INFO, WARN, ERROR, DEBUG

## 9. Variables de Entorno

El sistema utiliza variables de entorno para configuración. Las principales son:

### 9.1 Configuración de Base de Datos
```
DATABASE_URL="postgresql://user:password@localhost:5432/ph_colombia"
```

### 9.2 Configuración de JWT
```
JWT_SECRET="clave_secreta_muy_segura"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_EXPIRES_IN="7d"
```

### 9.3 Configuración de Redis
```
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD=""
CACHE_TTL="300" # 5 minutos en segundos
```

### 9.4 Configuración de Google API
```
GOOGLE_APPLICATION_CREDENTIALS="./config/google-credentials.json"
GOOGLE_CLIENT_EMAIL=""
GOOGLE_PRIVATE_KEY=""
```

### 9.5 Configuración de SMS
```
SMS_API_KEY=""
SMS_API_URL=""
SMS_SENDER="PazySalvos"
SMS_EXPIRY_SECONDS="300" # 5 minutos
SMS_MAX_ATTEMPTS="3"
SMS_RATE_LIMIT_WINDOW_MS="3600000" # 1 hora
SMS_RATE_LIMIT_MAX="5" # 5 SMS por hora
```

### 9.6 Configuración de Circuit Breaker
```
CIRCUIT_BREAKER_TIMEOUT="10000" # 10 segundos
CIRCUIT_BREAKER_ERROR_THRESHOLD="50" # 50% de errores
CIRCUIT_BREAKER_RESET_TIMEOUT="30000" # 30 segundos
```

## 10. Instalación y Ejecución

### 10.1 Requisitos Previos

- Node.js 18.x o superior
- PostgreSQL 14.x o superior
- Redis 6.x o superior
- Cuenta de Google Cloud con APIs habilitadas:
  - Google Sheets API
  - Google Drive API
  - Google Docs API

### 10.2 Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/sistema-ph-colombia.git
cd sistema-ph-colombia/backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. Configurar credenciales de Google:
```bash
# Colocar el archivo de credenciales en config/google-credentials.json
# O configurar las variables GOOGLE_CLIENT_EMAIL y GOOGLE_PRIVATE_KEY en .env
```

5. Ejecutar migraciones de base de datos:
```bash
npx prisma migrate dev
```

6. Cargar datos iniciales (opcional):
```bash
npm run seed
```

### 10.3 Ejecución

**Desarrollo:**
```bash
npm run dev
```

**Producción:**
```bash
npm run build
npm start
```

## 11. Mejoras de la Fase 2

En la Fase 2 del desarrollo, se han implementado varias mejoras significativas para aumentar la robustez, monitoreo y facilidad de despliegue del sistema.

### 11.1 Endpoint de Health Check Mejorado

Se ha mejorado el endpoint `/api/v1/health` para proporcionar información detallada sobre el estado de todos los servicios del sistema:

```javascript
app.get('/api/v1/health', async (req, res) => {
  try {
    // Verificar conexión a la base de datos
    let dbStatus = 'disconnected';
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch (dbError) {
      logger.error(`Error en health check - Base de datos: ${dbError.message}`, 'health', { error: dbError });
    }
    
    // Verificar conexión a Redis
    let redisStatus = 'disconnected';
    try {
      const redis = require('./services/cacheService').getClient();
      if (redis && redis.status === 'ready') {
        redisStatus = 'connected';
      }
    } catch (redisError) {
      logger.error(`Error en health check - Redis: ${redisError.message}`, 'health', { error: redisError });
    }
    
    // Verificar circuit breakers
    let circuitBreakersStatus = {};
    try {
      const circuitBreakerService = require('./services/circuitBreakerService');
      const stats = circuitBreakerService.getStats();
      circuitBreakersStatus = stats.reduce((acc, breaker) => {
        acc[breaker.name] = breaker.state;
        return acc;
      }, {});
    } catch (cbError) {
      logger.error(`Error en health check - Circuit Breakers: ${cbError.message}`, 'health', { error: cbError });
    }
    
    // Información del sistema
    const os = require('os');
    const systemInfo = {
      uptime: Math.floor(process.uptime()),
      memory: {
        free: os.freemem(),
        total: os.totalmem(),
        usage: process.memoryUsage()
      },
      cpu: os.cpus().length
    };
    
    res.status(200).json({
      status: 'success',
      message: 'Servidor funcionando correctamente',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || require('../package.json').version,
      services: {
        database: dbStatus,
        redis: redisStatus,
        circuitBreakers: circuitBreakersStatus
      },
      system: systemInfo
    });
  } catch (error) {
    logger.error(`Error en health check: ${error.message}`, 'health', { error });
    res.status(500).json({
      status: 'error',
      message: 'Error al verificar estado del servidor',
      timestamp: new Date().toISOString()
    });
  }
});
```

Este endpoint ahora proporciona:

- Estado de la conexión a la base de datos PostgreSQL
- Estado de la conexión a Redis
- Estado de todos los circuit breakers configurados
- Información del sistema (memoria, CPU, uptime)
- Versión de la aplicación y entorno

### 11.2 Endpoint de API Info

Se ha creado un nuevo endpoint `/api/info` que proporciona información detallada sobre la API:

```javascript
app.get('/api/info', (req, res) => {
  const apiInfo = {
    name: 'Paz y Salvos PH Colombia API',
    version: process.env.npm_package_version || require('../package.json').version,
    description: 'API para el sistema de gestión de paz y salvos para propiedad horizontal en Colombia',
    endpoints: {
      auth: '/api/v1/auth',
      administradores: '/api/v1/administradores',
      propietarios: '/api/v1/propietarios',
      adminSistema: '/api/v1/admin-sistema',
      health: '/api/v1/health',
      info: '/api/info'
    },
    documentation: '/api/docs',
    contact: {
      developer: 'Equipo de Desarrollo Paz y Salvos PH',
      email: 'soporte@pazysalvosph.com'
    },
    features: [
      'Integración con Google Sheets para datos de propietarios',
      'Verificación por SMS para autenticación segura',
      'Generación de paz y salvos en PDF',
      'Caché intensivo para optimizar rendimiento',
      'Circuit breakers para protección contra fallos'
    ],
    timestamp: new Date().toISOString()
  };

  res.status(200).json(apiInfo);
});
```

Este endpoint proporciona:

- Nombre y versión de la API
- Descripción del sistema
- Lista de endpoints disponibles
- Información de contacto
- Características principales

### 11.3 Script de Seed para Autenticación

Se ha creado un script específico para cargar datos de prueba de autenticación (`prisma/seedAuth.js`):

```javascript
// Crear administrador del sistema (superadmin)
const superadminPassword = await bcrypt.hash('superadmin123', SALT_ROUNDS);
const superadmin = await prisma.adminSistema.upsert({
  where: { email: 'superadmin@pazysalvosph.com' },
  update: {},
  create: {
    nombre: 'Super Administrador',
    email: 'superadmin@pazysalvosph.com',
    telefono: '+573001111111',
    password: superadminPassword,
    activo: true
  }
});

// Crear administradores de prueba
const adminPassword = await bcrypt.hash('admin123', SALT_ROUNDS);

const admin1 = await prisma.administrador.upsert({
  where: { email: 'admin1@ejemplo.com' },
  update: {},
  create: {
    nombre: 'Administrador Uno',
    email: 'admin1@ejemplo.com',
    telefono: '+573002222222',
    password: adminPassword,
    activo: true
  }
});
```

Este script crea:

- Usuario superadmin para pruebas
- Administradores de prueba
- Copropiedades de prueba
- Códigos SMS de prueba

Además, se han agregado nuevos scripts en `package.json`:

```json
"scripts": {
  "seed:auth": "node prisma/seedAuth.js",
  "db:reset": "prisma migrate reset --force",
  "db:seed": "npm run seed && npm run seed:auth"
}
```

## 12. Contenerización con Docker

Para facilitar el despliegue del sistema en cualquier entorno, se ha implementado la contenerización completa con Docker.

### 12.1 Dockerfile para Backend

Se ha creado un `Dockerfile` optimizado para el backend:

```dockerfile
FROM node:18-alpine

# Crear directorio de la aplicación
WORKDIR /app

# Instalar dependencias globales
RUN npm install -g prisma

# Copiar archivos de configuración
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm ci

# Generar cliente Prisma
RUN npx prisma generate

# Copiar código fuente
COPY . .

# Crear directorios necesarios
RUN mkdir -p logs tmp

# Exponer puerto
EXPOSE 4000

# Comando para iniciar la aplicación
CMD ["npm", "start"]
```

### 12.2 Docker Compose

Se ha creado un archivo `docker-compose.yml` para orquestar todos los servicios necesarios:

```yaml
version: '3.8'

services:
  # Servicio de la API backend
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: ph-backend
    restart: unless-stopped
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://${POSTGRES_USER:-phuser}:${POSTGRES_PASSWORD:-phpass123}@postgres:5432/${POSTGRES_DB:-ph_colombia}?schema=public
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./backend:/app
      - ./logs:/app/logs
      - ./google-credentials.json:/app/google-credentials.json:ro
    depends_on:
      - postgres
      - redis
    networks:
      - ph-network

  # Servicio de base de datos PostgreSQL
  postgres:
    image: postgres:15-alpine
    container_name: ph-postgres
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=${POSTGRES_USER:-phuser}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-phpass123}
      - POSTGRES_DB=${POSTGRES_DB:-ph_colombia}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - ph-network

  # Servicio de caché Redis
  redis:
    image: redis:7-alpine
    container_name: ph-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: redis-server --requirepass ${REDIS_PASSWORD:-}
    volumes:
      - redis-data:/data
    networks:
      - ph-network
```

### 12.3 Configuración para Docker

Se ha creado un archivo `.env.docker` con variables de entorno específicas para Docker:

```env
# Variables de entorno para Docker
# Copiar este archivo a .env para desarrollo local con Docker

# Base de datos PostgreSQL
DATABASE_URL=postgresql://phuser:phpass123@postgres:5432/ph_colombia?schema=public

# Redis para caché
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=
CACHE_TTL=3600

# JWT (Autenticación)
JWT_SECRET=tu_clave_super_secreta_aqui_cambiar_en_produccion
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

### 12.4 Optimización de Docker

Se ha creado un archivo `.dockerignore` para optimizar el proceso de construcción de la imagen:

```
node_modules
npm-debug.log
yarn-debug.log
yarn-error.log
.env
.env.*
*.log
logs/*
!logs/.gitkeep
tmp/*
!tmp/.gitkeep
.git
.gitignore
.github
.vscode
.idea
*.md
tests
__tests__
coverage
.DS_Store
dist
```

### 12.5 Instrucciones de Despliegue con Docker

Para desplegar el sistema utilizando Docker:

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/sistema-ph-colombia.git
cd sistema-ph-colombia

# 2. Configurar variables de entorno
cp backend/.env.example backend/.env

# 3. Colocar el archivo de credenciales de Google
cp ruta/a/tu/google-credentials.json ./google-credentials.json

# 4. Iniciar todos los servicios con Docker Compose
docker-compose up -d

# 5. Ejecutar migraciones y cargar datos de prueba
docker exec ph-backend npx prisma migrate dev
docker exec ph-backend npm run db:seed
```

## 13. Próximos Pasos

### 13.1 Fase 3: Desarrollo Frontend

- Implementación de interfaz de usuario con Next.js
- Integración con API backend
- Desarrollo de componentes para cada módulo
- Implementación de PWA para acceso móvil

### 11.2 Fase 3: Integración y Pruebas

- Integración completa de frontend y backend
- Pruebas unitarias y de integración
- Pruebas de carga y rendimiento
- Optimización de caché y consultas

### 11.3 Fase 4: Despliegue y Monitoreo

- Configuración de entorno de producción
- Implementación de CI/CD
- Configuración de monitoreo y alertas
- Documentación final y capacitación

### 11.4 Módulos Pendientes

- Implementación del módulo de empresas de vigilancia
- Integración con pasarela de pagos Bold
- Sistema de notificaciones push
- Panel de analíticas avanzadas

---

## Apéndice A: Flujos Principales

### A.1 Flujo de Generación de Paz y Salvo

1. El propietario busca su copropiedad por NIT
2. El sistema envía un código SMS para verificación
3. El propietario introduce el código recibido
4. El sistema consulta los inmuebles asociados al propietario
5. El propietario selecciona un inmueble
6. El sistema verifica el estado de cuenta en Google Sheets
7. Si está al día, se genera el paz y salvo en PDF
8. El propietario puede descargar el documento

### A.2 Flujo de Registro de Copropiedad

1. El administrador inicia sesión en el sistema
2. Accede a la sección de copropiedades
3. Completa el formulario con datos de la copropiedad
4. Proporciona el link de la hoja de Google Sheets
5. El sistema valida el formato de la hoja
6. Se registra la copropiedad en el sistema
7. Se inicia el período de prueba gratuito

---

*Este documento técnico describe el estado actual del desarrollo del Sistema de Paz y Salvos PH Colombia en su Fase 1, centrada en el desarrollo del backend. La documentación se actualizará en fases posteriores del proyecto.*
