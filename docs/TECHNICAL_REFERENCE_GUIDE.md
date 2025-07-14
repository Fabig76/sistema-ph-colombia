# GUÍA TÉCNICA DE REFERENCIA - SISTEMA PH COLOMBIA

**Versión:** 2.0  
**Fecha:** 2025-07-10  
**Propósito:** Documento base de consulta para desarrollo y mantenimiento

---

## 🏗️ ARQUITECTURA GENERAL

### Stack Tecnológico Principal

#### Frontend:
- **Framework:** Next.js 15.3.5 (React 18.2.0)
- **Styling:** Tailwind CSS
- **Componentes:** Radix UI, React Hook Form
- **Estado:** Zustand (preparado)
- **Validación:** Zod
- **Queries:** TanStack React Query (preparado)
- **Animaciones:** Framer Motion
- **PWA:** Service Workers

#### Backend:
- **Runtime:** Node.js
- **Framework:** Express.js 4.18.0
- **ORM:** Prisma 6.11.1
- **Base de datos:** PostgreSQL
- **Cache:** Redis
- **Autenticación:** JWT
- **Validación:** Joi
- **Queue:** RabbitMQ + Bull
- **Circuit Breakers:** Opossum

#### Servicios Externos:
- **Google Sheets API:** Datos propietarios en tiempo real
- **Google Docs API:** Plantillas paz y salvos
- **SMS Gateway:** Validación teléfonos
- **Bold Payment:** Pagos administradores PH
- **Docker:** Contenerización completa

---

## 🌐 INTEGRACIÓN GOOGLE APIS

### Google Sheets Service
**Propósito:** Consulta datos propietarios en tiempo real (NO almacenamiento local)

**Funciones principales:**
```javascript
// Validación formato hoja
validateSheetFormat(sheetId)

// Extracción ID de URL
extractSheetId(url)

// Búsqueda propiedades por cédula/teléfono
buscarPropiedadesPorIdentificacion(sheetId, identificacion)

// Verificación estado cuenta
verificarEstadoCuenta(sheetId, inmuebleId)

// Cache management
invalidarCache(sheetId)
```

### Google Docs Service
**Propósito:** Generación PDFs paz y salvos desde plantillas

**Funciones principales:**
```javascript
// Extracción ID documento
extractDocId(url)

// Creación desde plantilla
crearDocumentoDesdeTemplate(templateId, datos)
```

### URLs de Desarrollo:
- **Sheets:** `https://docs.google.com/spreadsheets/d/18v2nv4vROwn7z-JTI2ix__W6No6ZJuGOI3ooOCxn9xI/edit`
- **Docs:** `https://docs.google.com/document/d/1ohOpvNzG1r2R_Dy373wnUKUOK5o0j74sP0V1dw4hv4o/edit`

---

## 🗄️ BASE DE DATOS

### Modelo de Datos (PostgreSQL + Prisma)

```prisma
// Administradores PH
model Administrador {
  id                String    @id @default(cuid())
  nombreCompleto    String
  numeroTelefono    String    @unique
  correoElectronico String    @unique
  contraseña        String
  verificado        Boolean   @default(false)
  bloqueado         Boolean   @default(false)
  fechaRegistro     DateTime  @default(now())
  copropiedades     Copropiedad[]
}

// Copropiedades gestionadas
model Copropiedad {
  id                 String    @id @default(cuid())
  nit                String    @unique
  nombre             String
  numeroResolucion   String
  fechaResolucion    DateTime
  linkGoogleSheet    String
  linkPlantillaPDF   String
  administradorId    String
  administrador      Administrador @relation(fields: [administradorId], references: [id])
  activa             Boolean   @default(true)
  fechaCreacion      DateTime  @default(now())
}

// Códigos SMS temporales
model CodigoSMS {
  id             String    @id @default(cuid())
  numeroTelefono String
  codigo         String
  tipo           String    // 'registro', 'login', 'recuperacion'
  expiresAt      DateTime
  usado          Boolean   @default(false)
  fechaCreacion  DateTime  @default(now())
}
```

### Principio Fundamental:
> **NO SE ALMACENAN DATOS DE PROPIETARIOS**  
> Solo consultas en tiempo real a Google Sheets

---

## 🔧 CONFIGURACIÓN DOCKER

### docker-compose.dev.yml
```yaml
services:
  postgres:
    image: postgres:15-alpine
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: ph_colombia
      POSTGRES_USER: ph_user
      POSTGRES_PASSWORD: ph_password

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    
  rabbitmq:
    image: rabbitmq:3-management-alpine
    ports: ["5672:5672", "15672:15672"]
    
  pgadmin:
    image: dpage/pgadmin4
    ports: ["5050:80"]
```

### Comandos Docker:
```bash
# Iniciar servicios
docker-compose -f docker-compose.dev.yml up -d

# Ver estado
docker-compose -f docker-compose.dev.yml ps

# Logs específicos
docker-compose -f docker-compose.dev.yml logs postgres

# Detener servicios
docker-compose -f docker-compose.dev.yml down
```

---

## 🚀 COMANDOS DE DESARROLLO

### Backend:
```bash
cd backend

# Desarrollo con auto-reload
npm run dev

# Prisma commands
npx prisma db pull          # Sincronizar schema
npx prisma generate         # Generar cliente
npx prisma migrate dev      # Aplicar migraciones
npx prisma studio          # Admin GUI

# Testing Google APIs
curl http://localhost:4000/api/test-google/health
curl http://localhost:4000/api/test-google/summary
curl http://localhost:4000/api/v1/health
```

### Frontend:
```bash
cd frontend

# Desarrollo
npm run dev                 # Puerto por defecto
npx next dev --port 3005   # Puerto específico

# Build y deploy
npm run build
npm run start

# Linting
npm run lint
npm run lint:fix
```

---

## 🔒 VARIABLES DE ENTORNO

### Backend (.env):
```env
# Base de datos
DATABASE_URL="postgresql://ph_user:ph_password@localhost:5432/ph_colombia"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="24h"

# Redis
REDIS_URL="redis://localhost:6379"

# Google APIs
GOOGLE_SHEETS_URL="https://docs.google.com/spreadsheets/d/[ID]/edit"
GOOGLE_DOCS_URL="https://docs.google.com/document/d/[ID]/edit"
GOOGLE_CREDENTIALS_PATH="./config/google-credentials.json"

# SMS Service
SMS_API_KEY="your-sms-api-key"
SMS_API_URL="https://api.sms-provider.com"

# Bold Payment
BOLD_API_KEY="your-bold-api-key"
BOLD_API_URL="https://api.bold.co"

# Configuración general
NODE_ENV="development"
PORT=4000
LOG_LEVEL="info"
```

### Frontend (.env.local):
```env
# API Backend
NEXT_PUBLIC_API_URL="http://localhost:4000"

# Google reCAPTCHA (opcional)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="your-recaptcha-key"

# Analytics (opcional)
NEXT_PUBLIC_GA_ID="your-google-analytics-id"
```

---

## 🛡️ CONSIDERACIONES DE SEGURIDAD

### Rate Limiting:
```javascript
// Express rate limiting
const rateLimit = require('express-rate-limit');

// General API
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // requests por IP
});

// SMS específico
const smsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 3 // máximo 3 SMS por minuto
});
```

### JWT Configuration:
```javascript
// Configuración JWT
{
  secret: process.env.JWT_SECRET,
  expiresIn: '24h',
  algorithm: 'HS256'
}
```

### Validación números Colombia:
```javascript
// Regex teléfonos colombianos
const colombianPhoneRegex = /^(\+57|57)?[0-9]{10}$/;
```

---

## 🔄 FLUJOS PRINCIPALES

### Flujo Administrador PH:
1. **Registro** → SMS verification → Dashboard
2. **Login** → JWT token → Access granted
3. **Registrar Copropiedad** → Validar Google Sheet → Save
4. **Consultar Estadísticas** → Redis cache → Display
5. **Gestionar Pagos** → Bold API → Update status

### Flujo Propietarios:
1. **Buscar Copropiedad** → Google Sheets query
2. **Validar SMS** → SMS service → Access granted
3. **Consultar Inmuebles** → Real-time Google Sheets
4. **Verificar Estado** → Google Sheets + validation
5. **Generar Paz y Salvo** → Google Docs → PDF download

---

## 🚨 SOLUCIÓN DE PROBLEMAS COMUNES

### Error path-to-regexp:
```javascript
// ❌ EVITAR:
app.all('*', handler);

// ✅ USAR:
app.use('*', handler); // o comentar si causa problemas
```

### Database disconnected:
```bash
# Verificar Prisma
npx prisma db pull
npx prisma generate

# Verificar Docker
docker-compose ps
docker-compose logs postgres
```

### Google APIs 403/429:
- Verificar credenciales service account
- Revisar quotas y limits en Google Console
- Implementar exponential backoff

### Redis connection issues:
```bash
# Verificar Redis
docker-compose logs redis
redis-cli ping

# Limpiar cache
redis-cli flushall
```

---

## 📈 MONITOREO Y LOGS

### Health Checks:
```bash
# Backend general
curl http://localhost:4000/api/v1/health

# Google APIs específico
curl http://localhost:4000/api/test-google/summary

# Database status
curl http://localhost:4000/api/v1/health | grep database
```

### Estructura de Logs:
```javascript
// Winston logger configurado
logger.info('Message', 'module', { metadata });
logger.error('Error message', 'module', { error, context });
logger.warn('Warning', 'module', { details });
```

---

## 🔄 PROTOCOLO DE MODIFICACIONES

### Antes de modificar código:

1. **Verificar servicios Docker activos:**
```bash
docker-compose -f docker-compose.dev.yml PS
```

2. **Backup si es cambio mayor:**
```bash
# Ver memoria para comando backup específico
# Último backup: 2025-07-10 (536MB)
```

3. **Testing endpoints críticos:**
```bash
curl http://localhost:4000/api/v1/health
curl http://localhost:4000/api/test-google/summary
```

4. **Después de cambios backend:**
```bash
# Regenerar Prisma si schema cambió
npx prisma generate

# Verificar Google APIs
curl http://localhost:4000/api/test-google/health
```

5. **Después de cambios frontend:**
```bash
npm run build  # Verificar build exitoso
npm run lint   # Verificar no hay errores críticos
```

### Git Workflow:
```bash
git add .
git commit -m "tipo: descripción detallada"
git push origin main
```

---

## 📚 RECURSOS ADICIONALES

### Documentación técnica:
- `GOOGLE_APIS_INTEGRATION_FINAL_REPORT.md` - Último proceso de correcciones
- `FRONTEND_REFACTOR_FIXES.md` - Refactorización frontend  
- `README.md` - Información general del proyecto
- `CHANGELOG.md` - Historial de cambios

### URLs importantes:
- **Health Check:** http://localhost:4000/api/v1/health
- **Google APIs Test:** http://localhost:4000/api/test-google/summary
- **Frontend:** http://localhost:3002
- **PgAdmin:** http://localhost:5050
- **RabbitMQ Management:** http://localhost:15672

---

**⚠️ IMPORTANTE:** Este documento debe mantenerse actualizado con cada cambio significativo en la arquitectura o configuración del proyecto.
