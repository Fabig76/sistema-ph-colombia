# Sistema Paz y Salvos PH Colombia

> 🟢 **Estado:** Sistema completamente funcional - Frontend + Backend + APIs operativas  
> 📖 **Documentación:** Guías de inicio completas y verificadas - 2025-07-12

Sistema web modular para administración de propiedades horizontales en Colombia, especializado en la generación de paz y salvos.

## Características Principales

- **Arquitectura modular** con 4 módulos principales:
  - Admin Sistema (superadmin)
  - Administradores de unidades residenciales
  - Usuarios propietarios
  - Empresas de vigilancia (módulo futuro)
- **No almacenamiento de datos personales** - Solo consultas en tiempo real a Google Sheets
- **Caché intensivo** con Redis para optimizar rendimiento
- **Integración con Google Workspace** (Sheets para datos, Docs para plantillas)
- **Validación por SMS** con protección contra abusos
- **Generación local de PDFs** con fallback a Google Docs
- **Modelo de suscripción** por copropiedad (20.000 COP mensual, 60 días gratis)

## Stack Tecnológico

- **Frontend**: Next.js, React, Tailwind CSS, React Hook Form, Zustand, TanStack Query
- **Backend**: Node.js/Express, Prisma ORM, JWT, Redis, Bull, PDFKit, Opossum
- **Infraestructura**: Docker, PostgreSQL, Redis, RabbitMQ, Nginx
- **Integraciones**: Google APIs, SMS (Hablame.co), Bold Pagos

## Requisitos

- Node.js 20+
- Docker y Docker Compose
- Cuenta de Google Cloud Platform (para APIs)
- Cuenta en servicio SMS (Hablame.co o similar)
- Cuenta en Bold para pagos

## 🚀 Inicio Rápido

### 📋 Guía Completa de Inicio

**Para iniciar el sistema completo paso a paso, consulta:**
- 📖 **[SYSTEM_STARTUP_GUIDE.md](./docs/SYSTEM_STARTUP_GUIDE.md)** - Guía detallada de inicio
- 📊 **[SYSTEM_STARTUP_EXECUTION_REPORT.md](./docs/SYSTEM_STARTUP_EXECUTION_REPORT.md)** - Proceso verificado

### ⚡ Inicio Rápido (Orden Correcto):

1. **Servicios Docker:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **Backend:** (nueva terminal)
   ```bash
   cd backend && npm install && npm run dev
   ```

3. **Frontend:** (nueva terminal)
   ```bash
   cd frontend && npm install && npm run dev
   ```

4. **Verificación:**
   ```bash
   curl http://localhost:4000/api/v1/health  # Backend
   curl http://localhost:3002                # Frontend
   ```

### 🔍 Puntos Críticos:
- ✅ **Backend:** Puerto 4000 (verificar con health check)
- ✅ **Frontend:** Puerto 3002 (o el que asigne Next.js)
- ✅ **Docker:** Todos los servicios "healthy"
- ✅ **Google APIs:** Credenciales configuradas

### Opción 2: Usando Docker (recomendado)

1. Clonar el repositorio
2. Configurar variables de entorno:
   ```
   cp backend/.env.example backend/.env
   ```
3. Colocar el archivo de credenciales de Google en la raíz del proyecto:
   ```
   cp ruta/a/tu/google-credentials.json ./google-credentials.json
   ```
4. Iniciar todos los servicios con Docker Compose:
   ```
   docker-compose up -d
   ```
5. Ejecutar migraciones y cargar datos de prueba:
   ```
   docker exec ph-backend npx prisma migrate dev
   docker exec ph-backend npm run db:seed
   ```
6. Acceder a la aplicación:
   - Backend: http://localhost:4000
   - API Health: http://localhost:4000/api/v1/health
   - API Info: http://localhost:4000/api/info
   - Prisma Studio: http://localhost:5555 (ejecutar `docker exec ph-backend npx prisma studio`)

### Verificación de la instalación

1. Verificar estado de los servicios:
   ```
   docker-compose ps
   ```
2. Ver logs del backend:
   ```
   docker logs -f ph-backend
   ```
3. Probar el endpoint de health check:
   ```
   curl http://localhost:4000/api/v1/health
   ```

## 📝 Correcciones Recientes

### ✅ Versión 1.0.1 (2025-07-10)
**Corrección crítica del backend:**
- **Problema resuelto:** Error `path-to-regexp` que impedía el inicio del servidor
- **Causa:** Incompatibilidad del patrón `app.all('*')` con path-to-regexp v8+
- **Solución:** Comentario temporal de catch-all route problemática
- **Estado:** ✅ Backend completamente funcional y estable
- **Documentación completa:** Ver `BACKEND_FIX_DOCUMENTATION.md`

### 🔍 Verificaciones Post-Corrección
```bash
# Verificar estado del backend
curl http://localhost:4000/api/v1/health
# Debería responder: {"status":"success",...}

# Verificar información de la API
curl http://localhost:4000/api/info
# Debería responder: {"name":"Paz y Salvos PH Colombia API",...}
```

---

## 📚 Documentación Técnica

### Documentos de Referencia Principal:
- **[TECHNICAL_REFERENCE_GUIDE.md](./docs/TECHNICAL_REFERENCE_GUIDE.md)** - 📖 Guía técnica completa y documento base de consulta
- **[GOOGLE_APIS_INTEGRATION_FINAL_REPORT.md](./docs/GOOGLE_APIS_INTEGRATION_FINAL_REPORT.md)** - 🔧 Reporte final del proceso de integración Google APIs

### Documentación por Módulos:
- **[FRONTEND_REFACTOR_FIXES.md](./docs/FRONTEND_REFACTOR_FIXES.md)** - Refactorización frontend y correcciones
- **[DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md)** - Guía rápida para desarrolladores
- **[CHANGELOG.md](./docs/CHANGELOG.md)** - Historial detallado de cambios

### 🎯 Documentos Críticos para Desarrollo:

#### Para Nuevos Desarrolladores:
1. **Inicio rápido:** `TECHNICAL_REFERENCE_GUIDE.md` (secciones: Stack, Configuración, Comandos)
2. **Solución problemas:** `TECHNICAL_REFERENCE_GUIDE.md` (sección: Solución de Problemas)
3. **Últimas correcciones:** `GOOGLE_APIS_INTEGRATION_FINAL_REPORT.md`

#### Para Modificaciones al Sistema:
1. **Antes de modificar:** Revisar "Protocolo de Modificaciones" en `TECHNICAL_REFERENCE_GUIDE.md`
2. **Tecnologías implicadas:** Sección "Stack Tecnológico" y "Integración Google APIs"
3. **Configuración Docker:** Sección "Configuración Docker" para servicios
4. **Variables de entorno:** Sección "Variables de Entorno" para configuraciones

#### Para Resolución de Errores:
1. **Errores comunes:** `TECHNICAL_REFERENCE_GUIDE.md` (sección: Solución de Problemas)
2. **Health checks:** Comandos de verificación de servicios
3. **Logs y monitoreo:** Configuración de logging y debugging

### 📋 Estado Actual Documentado:
- ✅ **Backend:** Completamente funcional con Google APIs integradas
- ✅ **Frontend:** Arquitectura modular refactorizada
- ✅ **Docker:** Todos los servicios configurados (PostgreSQL, Redis, RabbitMQ)
- ✅ **Testing:** Endpoints de prueba Google APIs funcionales
- ✅ **Documentación:** Guías técnicas completas disponibles

Ver carpeta `/docs` para documentación completa.
