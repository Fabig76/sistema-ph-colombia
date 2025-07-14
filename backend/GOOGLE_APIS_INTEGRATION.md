# 🔗 Integración Google APIs - Paz y Salvo PH

## 📋 Resumen

Esta documentación describe la **integración completa** de Google Sheets y Google Docs APIs para el módulo de Paz y Salvos del sistema de Propiedad Horizontal. La implementación permite consultas en tiempo real y generación dinámica de documentos PDF.

## 🏗️ Arquitectura Implementada

### Servicios Personalizados

#### 1. **googleSheetsService.custom.js**
- ✅ Validación estructura de hojas específicas
- ✅ Búsqueda de propietarios por teléfono normalizado
- ✅ Verificación estado de cuenta y pagos
- ✅ Cache inteligente de datos
- ✅ Manejo robusto de errores

#### 2. **googleDocsService.custom.js**
- ✅ Validación de plantillas con placeholders
- ✅ Copia y personalización de documentos
- ✅ Reemplazo dinámico de variables
- ✅ Exportación a PDF con almacenamiento temporal
- ✅ Limpieza automática de archivos

#### 3. **propietarioController.updated.js**
- ✅ Integración completa con servicios personalizados
- ✅ Flujo completo: validación → consulta → generación
- ✅ Manejo de errores y logging detallado
- ✅ Endpoint de descarga de PDFs

## 🔧 Configuración

### Variables de Entorno Requeridas

```env
# Autenticación Google (Opción 1: Service Account Key)
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json

# Autenticación Google (Opción 2: Variables directas)
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Configuración PDFs
PDF_TMP_DIR=./temp/pdfs
PDF_FILE_EXPIRY_MS=3600000  # 1 hora

# Cache
CACHE_TTL_GOOGLE_SHEETS=300  # 5 minutos
```

### Permisos Google APIs

1. **Google Sheets API**: habilitada
2. **Google Docs API**: habilitada  
3. **Google Drive API**: habilitada (para exportar PDFs)
4. **Service Account** con permisos:
   - Lector en Google Sheets específicas
   - Editor en carpeta temporal Google Drive
   - Lector en plantillas Google Docs

## 📊 Estructura Google Sheets Requerida

### Columnas Obligatorias (A1:H1)
```
A: NIT_COPROPIEDAD
B: NOMBRE_COPROPIEDAD  
C: PROPIETARIO
D: TELEFONO
E: EMAIL
F: INMUEBLE
G: TIPO
H: ESTADO_CUENTA
```

### Filas de Datos (A2:H...)
```
A2: 900123456-7
B2: CONJUNTO RESIDENCIAL EJEMPLO
C2: JUAN PÉREZ LÓPEZ - CC 12345678
D2: 3001234567
H2: AL DÍA
I2: 0
J2: juan.perez@email.com
K2: -
```

## 📄 Estructura Plantilla Google Docs

### Placeholders Obligatorios
```
{{NOMBRE_COPROPIEDAD}}    - Nombre de la copropiedad
{{NIT_COPROPIEDAD}}       - NIT de la copropiedad
{{NOMBRE_PROPIETARIO}}    - Nombre completo del propietario
{{CEDULA_PROPIETARIO}}    - Cédula del propietario
{{TELEFONO_PROPIETARIO}}  - Teléfono del propietario
{{INMUEBLE}}              - Identificación del inmueble
{{TIPO_INMUEBLE}}         - Tipo de inmueble
{{FECHA_ACTUAL}}          - Fecha de generación
```

### Placeholders Opcionales
```
{{TORRE}}                 - Torre (si aplica)
{{EMAIL}}                 - Email del propietario
{{ESTADO_CUENTA}}         - Estado actual de la cuenta
```

## 🚀 Funcionalidades Implementadas

### 1. **Búsqueda de Copropiedad**
```http
GET /api/propietarios/buscar-copropiedad/:nit
```
- Busca copropiedad por NIT
- Valida estructura Google Sheets
- Verifica concordancia NIT

### 2. **Solicitar Código SMS**
```http
POST /api/propietarios/solicitar-codigo
Body: { nit, telefono }
```
- Normaliza teléfono
- Busca propietario en hoja
- Envía código SMS verificación

### 3. **Consultar Inmuebles**
```http
POST /api/propietarios/consultar-inmuebles
Body: { nit, cedula, telefono, codigoVerificacion }
```
- Verifica código SMS
- Consulta datos tiempo real
- Valida cédula propietario
- Retorna información inmuebles

### 4. **Generar Paz y Salvo**
```http
POST /api/propietarios/generar-paz-y-salvo
Body: { nit, cedula, telefono, codigoVerificacion }
```
- Verifica propietario al día
- Copia plantilla Google Docs
- Reemplaza placeholders
- Genera PDF descargable
- Programa limpieza automática

### 5. **Descargar PDF**
```http
GET /api/propietarios/descargar-paz-y-salvo/:filename
```
- Valida archivo temporal
- Configura headers descarga
- Stream archivo PDF

## 🧪 Testing

### Script de Pruebas
```bash
cd backend
node src/scripts/test-google-integration.js
```

### Pruebas Incluidas
- ✅ Conexión Google APIs
- ✅ Validación estructura hojas
- ✅ Búsqueda propietarios
- ✅ Validación plantillas
- ✅ Generación PDFs
- ✅ Limpieza archivos temporales

## 🔒 Seguridad

### Medidas Implementadas
- **Tokens JWT**: Control acceso endpoints
- **Validación SMS**: Verificación identidad
- **Cache TTL**: Expiración automática datos
- **Limpieza archivos**: Eliminación automática PDFs
- **Logs auditoria**: Registro todas las operaciones
- **Normalización datos**: Consistencia teléfonos

### Sin Almacenamiento Local
- ❌ **NO** se almacenan datos personales
- ✅ **Solo** consultas tiempo real Google Sheets
- ✅ **PDFs temporales** con expiración automática
- ✅ **Cache mínimo** solo para rendimiento

## 📈 Beneficios Obtenidos

### Funcionalidad
- 🔄 **Datos tiempo real** desde Google Sheets
- 📄 **PDFs dinámicos** desde plantillas Google Docs
- 🔐 **Verificación SMS** segura
- 📱 **API REST** completa para frontend

### Rendimiento
- ⚡ **Cache inteligente** reduce consultas
- 🗂️ **Archivos temporales** optimizan memoria
- 🔄 **Limpieza automática** evita acumulación

### Mantenimiento
- 📝 **Logging detallado** facilita debug
- 🏗️ **Código modular** simplifica actualizaciones
- 🧪 **Testing automatizado** valida funcionalidad

## 🔮 Próximos Pasos

### Integración Frontend
- [ ] Conectar APIs con componentes React
- [ ] Implementar descarga PDFs
- [ ] Manejo estados carga/error
- [ ] Testing E2E completo

### Optimizaciones
- [ ] Cache Redis para alta concurrencia
- [ ] Webhooks Google Sheets cambios
- [ ] Firma digital PDFs
- [ ] Métricas uso APIs

### Monitoreo
- [ ] Dashboard uso Google APIs
- [ ] Alertas limites cuotas
- [ ] Logs centralizados
- [ ] Performance monitoring

---

## 🎯 Estado Actual: **COMPLETO** ✅

La integración de Google APIs está **100% implementada y funcional**. El backend puede:

1. ✅ Validar estructuras Google Sheets reales
2. ✅ Consultar propietarios tiempo real  
3. ✅ Generar PDFs desde plantillas Google Docs
4. ✅ Manejar archivos temporales con limpieza
5. ✅ Proveer APIs REST completas para frontend

**El sistema está listo para conectar con el frontend y realizar pruebas completas end-to-end.**
