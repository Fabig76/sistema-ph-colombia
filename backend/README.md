# Backend - Sistema de Paz y Salvos PH Colombia

Sistema de gestión para administradores de propiedad horizontal en Colombia, enfocado en la generación de paz y salvos y consulta de estado de cuenta para propietarios.

## Características principales

- Arquitectura modular y escalable
- Integración con Google Sheets y Google Docs
- Generación de PDFs localmente y mediante Google Docs
- Sistema de autenticación con JWT y verificación por SMS
- Caché intensivo con Redis para optimizar rendimiento
- Circuit breakers para protección contra fallos en APIs externas
- Validación robusta de datos con Joi
- Logging avanzado con Winston

## Estructura del proyecto

```
backend/
├── src/                      # Código fuente
│   ├── controllers/          # Controladores para cada módulo
│   ├── middlewares/          # Middlewares de autenticación, validación, etc.
│   ├── models/               # Modelos Prisma (schema.prisma)
│   ├── routes/               # Rutas de la API
│   ├── services/             # Servicios para lógica de negocio
│   ├── utils/                # Utilidades y helpers
│   ├── app.js                # Configuración de Express
│   └── server.js             # Punto de entrada principal
├── prisma/                   # Configuración de Prisma ORM
├── public/                   # Archivos estáticos
├── tmp/                      # Directorio temporal para PDFs
├── logs/                     # Logs de la aplicación
├── .env.example              # Ejemplo de variables de entorno
├── .env                      # Variables de entorno (no incluido en git)
└── package.json              # Dependencias y scripts
```

## Módulos principales

1. **Administrador del sistema (superadmin)**
   - Gestión global del sistema
   - Monitoreo y estadísticas
   - Gestión de usuarios y copropiedades

2. **Administradores de unidades residenciales**
   - Registro y autenticación
   - Gestión de copropiedades
   - Conexión con hojas de Google

3. **Usuarios propietarios**
   - Consulta de inmuebles
   - Verificación de estado de cuenta
   - Generación de paz y salvos

4. **Empresas de vigilancia** (para desarrollo futuro)

## Requisitos previos

- Node.js 18.x o superior
- PostgreSQL 14.x o superior
- Redis 6.x o superior
- Cuenta de Google Cloud con APIs habilitadas:
  - Google Sheets API
  - Google Drive API
  - Google Docs API

## Instalación

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

## Ejecución

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm start
```

## Documentación API

La documentación de la API está disponible en `/api/docs` cuando el servidor está en ejecución.

## Principios de diseño

- **No almacenamiento de datos personales**: Los datos de propietarios se consultan en tiempo real desde Google Sheets.
- **Caché intensivo**: Minimiza llamadas a APIs externas para optimizar rendimiento.
- **Circuit breakers**: Protege contra fallos en cascada cuando un servicio externo está fallando.
- **Seguridad**: Validación robusta, rate limiting, y bloqueo temporal después de intentos fallidos.
- **Modularidad**: Arquitectura que permite agregar nuevos servicios fácilmente.

## Flujo de generación de paz y salvos

1. El propietario busca su copropiedad por NIT
2. Se verifica mediante SMS que es el propietario
3. Se consultan sus inmuebles en Google Sheets
4. Se verifica el estado de cuenta del inmueble
5. Si está al día, se genera el paz y salvo usando:
   - Generación local con PDFKit (principal)
   - Generación con Google Docs (fallback)

## Licencia

Este proyecto es privado y confidencial. Todos los derechos reservados.
