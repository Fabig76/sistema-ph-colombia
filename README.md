# Sistema Paz y Salvos PH Colombia

> 🟢 **Estado:** Backend completamente funcional - Última corrección: 2025-07-10

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

## Inicio Rápido

### Opción 1: Desarrollo local

1. Clonar el repositorio
2. Configurar variables de entorno (copiar `.env.example` a `.env`)
3. Instalar dependencias: 
   ```
   cd backend && npm install
   cd ../frontend && npm install
   ```
4. Ejecutar migraciones: `cd backend && npx prisma migrate dev`
5. Cargar datos de prueba: `cd backend && npm run db:seed`
6. Iniciar backend: `cd backend && npm run dev`
7. Iniciar frontend: `cd frontend && npm run dev`

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

## Documentación

Ver carpeta `/docs` para documentación detallada.
