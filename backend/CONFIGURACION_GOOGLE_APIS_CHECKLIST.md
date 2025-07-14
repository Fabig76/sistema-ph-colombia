# ✅ CHECKLIST CONFIGURACIÓN GOOGLE APIS

Usa esta lista para completar la configuración paso a paso.

## 🌐 **GOOGLE CLOUD CONSOLE** (Requerido)

### PASO 1: Crear Proyecto
- [ ] Ir a https://console.cloud.google.com/
- [ ] Crear nuevo proyecto "Sistema-PH-Colombia"
- [ ] Anotar el PROJECT_ID generado

### PASO 2: Habilitar APIs
- [ ] Google Sheets API
- [ ] Google Drive API  
- [ ] Google Docs API

### PASO 3: Crear Service Account
- [ ] Nombre: `sistema-ph-service`
- [ ] Rol: `Editor de proyecto`
- [ ] Crear nueva clave JSON
- [ ] Descargar archivo JSON

### PASO 4: Configurar Localmente
- [ ] Renombrar archivo descargado a `google-credentials.json`
- [ ] Mover a `backend/config/google-credentials.json`
- [ ] Ejecutar test: `node test-google-api.js`

## 📋 **TESTING INMEDIATO**

### Verificar Configuración
```bash
cd backend
node test-google-api.js
```

**Resultado esperado:**
```
✅ Google Sheets API: OK
✅ Google Drive API: OK  
✅ Google Docs API: OK
🎉 TODAS LAS APIS CONFIGURADAS CORRECTAMENTE
```

### Probar Integración Completa
```bash
cd backend
node src/scripts/test-google-integration.js
```

## 🔗 **CONFIGURAR PERMISOS SHEETS**

### Para Cada Google Sheet:
- [ ] Abrir el Google Sheet
- [ ] Compartir con email del service account
- [ ] Permisos: **Lector**
- [ ] Desactivar "Notificar personas"

**Email del service account:** `sistema-ph-service@sistema-ph-colombia.iam.gserviceaccount.com`

## 📄 **CREAR PLANTILLAS GOOGLE DOCS**

### Plantilla Paz y Salvo:
- [ ] Crear documento en Google Docs
- [ ] Agregar placeholders obligatorios:
  - `{{NOMBRE_COPROPIEDAD}}`
  - `{{NIT_COPROPIEDAD}}`
  - `{{NOMBRE_PROPIETARIO}}`
  - `{{CEDULA_PROPIETARIO}}`
  - `{{TELEFONO_PROPIETARIO}}`
  - `{{INMUEBLE}}`
  - `{{TIPO_INMUEBLE}}`
  - `{{FECHA_ACTUAL}}`
- [ ] Compartir con service account (permisos: Editor)

## ✅ ESTRUCTURA GOOGLE SHEETS REQUERIDA

### Columnas A-K (Orden Exacto):
- [ ] **A**: NIT - Número identificación tributaria
- [ ] **B**: COPROPIEDAD - Nombre copropiedad  
- [ ] **C**: TELEFONO - Teléfono propietario
- [ ] **D**: PROPIETARIO - Nombre propietario
- [ ] **E**: NUMERO - Número apartamento/casa
- [ ] **F**: TIPO - Tipo inmueble
- [ ] **G**: TORRE - Torre/bloque/fase
- [ ] **H**: ESTADO_CUENTA - Estado cuenta
- [ ] **I**: SALDO - Saldo pendiente
- [ ] **J**: EMAIL - Correo electrónico
- [ ] **K**: OBSERVACIONES - Notas adicionales

## 🚀 **VERIFICACIÓN FINAL**

### Checklist Completo:
- [ ] ✅ Proyecto Google Cloud creado
- [ ] ✅ 3 APIs habilitadas
- [ ] ✅ Service Account creado
- [ ] ✅ Credenciales JSON descargadas
- [ ] ✅ Archivo local configurado
- [ ] ✅ Test básico exitoso
- [ ] ✅ Sheets compartidas con service account
- [ ] ✅ Plantilla Google Docs creada
- [ ] ✅ Test completo exitoso

### Comandos de Verificación:
```bash
# Test básico
node test-google-api.js

# Test completo
node src/scripts/test-google-integration.js

# Iniciar servidor
npm run dev
```

## 🔧 **TROUBLESHOOTING**

### Error: "ENOENT: no such file or directory"
- Verificar que existe `backend/config/google-credentials.json`
- Verificar que el path en `.env` es correcto

### Error: "Error: 7 PERMISSION_DENIED"
- Verificar que las APIs están habilitadas
- Verificar que el service account tiene permisos

### Error: "The caller does not have permission"
- Compartir el Google Sheet con el service account
- Verificar que los permisos son "Lector" mínimo

---

## 🎯 **SIGUIENTE PASO**

Una vez completada esta configuración, tu sistema estará listo para:
- ✅ Consultar Google Sheets en tiempo real
- ✅ Generar PDFs desde plantillas Google Docs
- ✅ Flujo completo de paz y salvos funcional
- ✅ Integración frontend-backend completa
