# 🚀 GUÍA DE INICIO DEL SISTEMA - Paz y Salvos PH Colombia

## 📋 ÍNDICE
1. [Pre-requisitos](#pre-requisitos)
2. [Verificación del Entorno](#verificación-del-entorno)
3. [Inicio de Servicios Docker](#inicio-de-servicios-docker)
4. [Inicio del Backend](#inicio-del-backend)
5. [Inicio del Frontend](#inicio-del-frontend)
6. [Verificación de Integración](#verificación-de-integración)
7. [Pruebas de Google APIs](#pruebas-de-google-apis)
8. [Troubleshooting](#troubleshooting)
9. [Checklist de Verificación](#checklist-de-verificación)

---

## 🔧 PRE-REQUISITOS

### Software Requerido:
- **Node.js:** v18+ (verificado: v24.1.0)
- **Docker & Docker Compose:** Última versión
- **Git:** Para clonado y versionado
- **curl:** Para testing de APIs

### Verificación de Instalación:
```bash
node --version    # Debe ser v18+
npm --version     # Debe estar instalado
docker --version  # Docker engine
docker-compose --version  # Docker compose
```

---

## 🔍 VERIFICACIÓN DEL ENTORNO

### 1. Estructura del Proyecto
```
sistema-ph-colombia/
├── backend/           # API Node.js + Express
├── frontend/          # Next.js 15.3.5
├── docs/             # Documentación técnica
├── docker-compose.dev.yml  # Servicios Docker
└── README.md         # Información general
```

### 2. Archivos Críticos Backend
```bash
# Verificar existencia de archivos críticos
ls -la backend/.env                    # ✅ Variables de entorno
ls -la backend/google-credentials.json # ✅ Credenciales Google
ls -la backend/src/app.js             # ✅ Aplicación principal
ls -la backend/src/server.js          # ✅ Servidor
```

### 3. Verificación de Configuración Backend
```bash
cd backend
node check-config.js  # Script de verificación creado
```

**Salida Esperada:**
```
=== VERIFICACIÓN DE CONFIGURACIÓN ===
PORT: 4000                    # ✅ CRÍTICO
NODE_ENV: development         # ✅ 
DATABASE_URL exists: true     # ✅ CRÍTICO
REDIS_URL exists: true        # ✅ CRÍTICO
JWT_SECRET exists: true       # ✅ CRÍTICO
```

### 4. Archivos Críticos Frontend
```bash
# Verificar configuración frontend
ls -la frontend/.env.local            # Variables de entorno
ls -la frontend/package.json          # Dependencias
ls -la frontend/next.config.js        # Configuración Next.js
```

---

## 🐳 INICIO DE SERVICIOS DOCKER

### 1. Iniciar Servicios
```bash
# Desde raíz del proyecto
docker-compose -f docker-compose.dev.yml up -d
```

### 2. Verificar Estado de Servicios
```bash
docker-compose -f docker-compose.dev.yml ps
```

**Estado Esperado:**
```
NAME                    STATUS              PORTS
postgres_ph_colombia    Up (healthy)        0.0.0.0:5432->5432/tcp
redis_ph_colombia       Up (healthy)        0.0.0.0:6379->6379/tcp
rabbitmq_ph_colombia    Up (healthy)        0.0.0.0:5672->5672/tcp, 0.0.0.0:15672->15672/tcp
pgadmin_ph_colombia     Up                  0.0.0.0:8080->80/tcp
```

### 3. Verificar Conectividad Docker
```bash
# PostgreSQL
docker exec postgres_ph_colombia pg_isready -U phuser

# Redis
docker exec redis_ph_colombia redis-cli ping

# RabbitMQ Management
curl -s http://localhost:15672  # Debe devolver HTML
```

### 4. **⚠️ PUNTO CRÍTICO:** Esperar Servicios
```bash
# Esperar que todos los servicios estén healthy
watch 'docker-compose -f docker-compose.dev.yml ps'
# Presionar Ctrl+C cuando todos muestren "(healthy)"
```

---

## 🖥️ INICIO DEL BACKEND

### 1. Preparar Backend
```bash
cd backend

# Instalar/actualizar dependencias
npm install

# Verificar configuración
node check-config.js
```

### 2. **⚠️ VERIFICACIÓN CRÍTICA:** Path-to-regexp Fix
```bash
# Verificar que línea problemática esté comentada
grep -n "app.all('\\*'" src/app.js
```

**Salida Esperada:**
```
217:// app.all('*', (req, res) => {  # ✅ DEBE ESTAR COMENTADA
```

### 3. Iniciar Servidor Backend
```bash
npm run dev
```

**Salida Esperada:**
```
[dotenv@17.2.0] injecting env (32) from .env
2025-XX-XX XX:XX:XX:XXX info: Servidor iniciado en el puerto 4000 en modo development {}
Servidor iniciado en el puerto 4000 en modo development
2025-XX-XX XX:XX:XX:XXX info: Conectado a Redis {}
2025-XX-XX XX:XX:XX:XXX info: Conexión a la base de datos establecida correctamente {}
```

### 4. **✅ VERIFICACIÓN CRÍTICA:** Health Check
```bash
# En nueva terminal
curl -s http://localhost:4000/api/v1/health
```

**Respuesta Esperada:**
```json
{
  "status": "success",
  "message": "Servidor funcionando correctamente",
  "services": {
    "database": "connected",    # ✅ CRÍTICO
    "redis": "connected"        # ✅ CRÍTICO
  }
}
```

### 5. Verificar API Info
```bash
curl -s http://localhost:4000/api/info
```

---

## 🌐 INICIO DEL FRONTEND

### 1. Preparar Frontend
```bash
cd frontend

# Instalar/actualizar dependencias
npm install
```

### 2. Verificar Configuración Frontend
```bash
# Verificar que .env.local tenga configuración correcta
cat .env.local | grep API_URL
```

**Configuración Esperada:**
```
NEXT_PUBLIC_API_URL=http://localhost:4000  # Debe coincidir con backend
```

### 3. **⚠️ PUNTO CRÍTICO:** Verificar Backend Activo
```bash
# Antes de iniciar frontend, verificar backend
curl -s http://localhost:4000/api/v1/health | grep "success"
```

### 4. Iniciar Frontend
```bash
npm run dev
```

**Salida Esperada:**
```
   ▲ Next.js 15.3.5
   - Local:        http://localhost:3002
   - Network:      http://192.168.x.x:3002

 ✓ Ready in 2.3s
```

### 5. **✅ VERIFICACIÓN CRÍTICA:** Frontend Accesible
```bash
# Verificar frontend responde
curl -s http://localhost:3000 | grep "<!DOCTYPE html"
```

---

## 🔗 VERIFICACIÓN DE INTEGRACIÓN

### 1. Puertos del Sistema
| Servicio | Puerto | URL | Estado |
|----------|--------|-----|--------|
| Frontend | 3002 | http://localhost:3002 | ✅ |
| Backend API | 4000 | http://localhost:4000 | ✅ |
| PostgreSQL | 5432 | localhost:5432 | ✅ |
| Redis | 6379 | localhost:6379 | ✅ |
| RabbitMQ | 5672 | localhost:5672 | ✅ |
| RabbitMQ Management | 15672 | http://localhost:15672 | ✅ |
| PgAdmin | 8080 | http://localhost:8080 | ✅ |

### 2. Verificar Comunicación Frontend-Backend
```bash
# Test desde frontend al backend
curl -s -H "Origin: http://localhost:3000" http://localhost:4000/api/v1/health
```

### 3. **⚠️ VERIFICACIÓN CORS:** 
```bash
# Verificar que CORS permite frontend
curl -s -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS http://localhost:4000/api/v1/health
```

---

## 🔌 PRUEBAS DE GOOGLE APIS

### 1. Health Check Google APIs
```bash
curl -s http://localhost:4000/api/test-google/health
```

### 2. Test Google Sheets
```bash
curl -s http://localhost:4000/api/test-google/sheets
```

### 3. Test Google Docs
```bash
curl -s http://localhost:4000/api/test-google/docs
```

### 4. Resumen Completo Google APIs
```bash
curl -s http://localhost:4000/api/test-google/summary
```

**Respuesta Esperada para Summary:**
```json
{
  "status": "success",
  "google_services": {
    "sheets": "✅ functional",
    "docs": "✅ functional"
  }
}
```

---

## 🚨 TROUBLESHOOTING

### Backend No Inicia

#### Problema: Puerto ocupado
```bash
# Verificar qué usa el puerto 4000
lsof -i :4000
# Matar proceso si es necesario
kill -9 <PID>
```

#### Problema: Variables de entorno
```bash
cd backend
node check-config.js
# Verificar que todas las variables críticas existan
```

#### Problema: Path-to-regexp Error
```bash
grep -n "app.all('\\*'" src/app.js
# La línea debe estar comentada con //
```

### Docker No Funciona

#### Problema: Servicios no healthy
```bash
docker-compose -f docker-compose.dev.yml logs postgres
docker-compose -f docker-compose.dev.yml logs redis
docker-compose -f docker-compose.dev.yml logs rabbitmq
```

#### Problema: Puertos ocupados
```bash
# Verificar puertos Docker
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :5672  # RabbitMQ
```

### Frontend No Conecta

#### Problema: API URL incorrecta
```bash
# Verificar configuración
grep API_URL frontend/.env.local
# Debe ser: NEXT_PUBLIC_API_URL=http://localhost:4000
```

#### Problema: CORS
```bash
# Verificar headers CORS
curl -I -H "Origin: http://localhost:3000" http://localhost:4000/api/v1/health
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

### Pre-inicio:
- [ ] Docker y Docker Compose instalados
- [ ] Node.js v18+ instalado
- [ ] Archivos .env configurados
- [ ] google-credentials.json presente

### Servicios Docker:
- [ ] `docker-compose up -d` ejecutado
- [ ] PostgreSQL healthy (puerto 5432)
- [ ] Redis healthy (puerto 6379)
- [ ] RabbitMQ healthy (puerto 5672)
- [ ] PgAdmin accesible (puerto 8080)

### Backend:
- [ ] `npm install` completado
- [ ] Variables de entorno verificadas
- [ ] Línea path-to-regexp comentada
- [ ] `npm run dev` iniciado exitosamente
- [ ] Health check responde con "connected"
- [ ] Puerto 4000 respondiendo

### Frontend:
- [ ] `npm install` completado
- [ ] NEXT_PUBLIC_API_URL configurada
- [ ] `npm run dev` iniciado exitosamente
- [ ] Puerto 3000 accesible
- [ ] Comunicación con backend exitosa

### Google APIs:
- [ ] Health check Google APIs exitoso
- [ ] Test Google Sheets funcional
- [ ] Test Google Docs funcional
- [ ] Summary completo exitoso

### Sistema Completo:
- [ ] Todos los puertos activos
- [ ] Frontend-Backend comunicándose
- [ ] CORS configurado correctamente
- [ ] Logs sin errores críticos
- [ ] APIs externas respondiendo

---

## 📝 COMANDOS RÁPIDOS

### Inicio Completo (Orden Correcto):
```bash
# 1. Servicios Docker
docker-compose -f docker-compose.dev.yml up -d

# 2. Backend (en terminal separada)
cd backend && npm run dev

# 3. Frontend (en terminal separada)
cd frontend && npm run dev

# 4. Verificación
curl http://localhost:4000/api/v1/health
curl http://localhost:3000
```

### Parada Completa:
```bash
# Parar frontend (Ctrl+C en terminal)
# Parar backend (Ctrl+C en terminal)
docker-compose -f docker-compose.dev.yml down
```

### Reinicio Completo:
```bash
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d
cd backend && npm run dev &
cd frontend && npm run dev &
```

---

## 📚 DOCUMENTOS RELACIONADOS

- [TECHNICAL_REFERENCE_GUIDE.md](./TECHNICAL_REFERENCE_GUIDE.md) - Referencia técnica completa
- [GOOGLE_APIS_INTEGRATION_FINAL_REPORT.md](./GOOGLE_APIS_INTEGRATION_FINAL_REPORT.md) - Integración Google APIs
- [README.md](../README.md) - Información general del proyecto

---

**Creado:** 2025-07-12  
**Actualizado:** 2025-07-12  
**Versión:** 1.0  
**Estado:** Verificado y funcional ✅
