# 🏢 Sistema de Paz y Salvos - Propiedad Horizontal Colombia

> Aplicación web modular para la gestión de paz y salvos en propiedades horizontales de Colombia

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)]()
[![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black)]()
[![Status](https://img.shields.io/badge/status-active-success)]()

## 🎯 Descripción del Proyecto

Sistema web responsive para administrar paz y salvos en **propiedad horizontal** en Colombia. Permite a administradores registrar copropiedades y a propietarios consultar el estado de sus inmuebles y descargar paz y salvos cuando estén al día.

### Características Principales
- ✅ **Responsive**: Funciona en computador y móvil
- 🔄 **Fácilmente actualizable**: Sin destruir funcionalidad
- 🔐 **Seguridad web**: Protección de datos sensibles
- 🧩 **Arquitectura modular**: Escalable para nuevos servicios
- 📱 **Validación SMS**: Autenticación por código
- 📊 **Google Sheets**: Consulta datos en tiempo real
- 📄 **Google Docs**: Plantillas automáticas de documentos

## 🏗️ Módulos del Sistema

### A. Admin Sistema 🛠️
- Portal superadministrador
- Gestión completa del sistema
- Configuración de APIs y servicios
- Logs y monitoreo

### B. Administradores PH 🏘️
- Registro y login de administradores
- Gestión de copropiedades
- Conexión con Google Sheets
- Sistema de pagos (20.000 COP/mes)
- Estadísticas de uso

### C. Usuarios Propietarios 🏠 ✅ **COMPLETADO**
- Búsqueda de copropiedades
- Validación por SMS
- Consulta de inmuebles (apartamentos, casas, parqueaderos, bodegas)
- Descarga de paz y salvos (si está al día)

### D. Empresas de Vigilancia 🛡️
- Módulo futuro para empresas de seguridad

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- npm o yarn

### Instalación
```bash
# Clonar repositorio
git clone [repo-url]
cd sistema-ph-colombia/frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### Acceso
- **Desarrollo**: [http://localhost:3001](http://localhost:3001)
- **Módulo Propietarios**: `/propietarios`
- **Admin PH**: `/admin-ph`
- **Admin Sistema**: `/admin-sistema`

## 🔧 Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Servidor desarrollo en :3001

# Compilación
npm run build        # Build completo con lint
npm run build -- --no-lint  # Build solo con verificación de tipos

# Verificación
npm run lint         # ESLint
npm run type-check   # Verificación TypeScript

# Testing (cuando esté configurado)
npm test            # Tests unitarios
```

## 📊 Estado Actual

### ✅ Completado
- **Módulo Propietarios**: Refactorizado y funcional
- **Arquitectura modular**: Implementada
- **Componentes UI**: Base sólida reutilizable
- **Tipos TypeScript**: Centralizados y consistentes
- **Compilación**: Sin errores críticos

### 🚧 En Desarrollo
- **Módulo Admin PH**: Pendiente refactorización
- **Integraciones**: Google APIs, SMS, Bold Payment
- **Testing**: Configuración pendiente

### 🔮 Próximamente
- **Admin Sistema**: Portal superadministrador
- **Empresas Vigilancia**: Módulo futuro
- **PWA**: App móvil

## 🏗️ Arquitectura Técnica

### Stack Principal
- **Frontend**: Next.js 15.3.5 + React 18
- **Styling**: Tailwind CSS
- **Types**: TypeScript 5.0
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP**: Axios

### Estructura del Proyecto
```
src/
├── app/                 # App Router (páginas)
├── components/
│   ├── ui/             # Componentes reutilizables
│   └── features/       # Componentes por funcionalidad
├── hooks/              # Hooks personalizados
├── types/              # Tipos TypeScript
├── lib/                # Utilidades y APIs
└── docs/               # Documentación
```

## 📚 Documentación

- **[Guía de Correcciones](./docs/FRONTEND_REFACTOR_FIXES.md)**: Detalles técnicos de la refactorización
- **[Guía Desarrolladores](./docs/DEVELOPER_GUIDE.md)**: Patrones y mejores prácticas
- **[Changelog](./CHANGELOG.md)**: Historial de cambios

## 🐛 Troubleshooting

### Error de Compilación
```bash
# Ver solo errores de tipos
npm run build -- --no-lint

# Limpiar caché
rm -rf .next/
npm run build
```

### Puerto Ocupado
```bash
# Verificar procesos en puerto 3001
lsof -i :3001

# Cambiar puerto
PORT=3002 npm run dev
```

## 🤝 Contribución

1. Revisar **[Guía Desarrolladores](./docs/DEVELOPER_GUIDE.md)**
2. Seguir patrones establecidos
3. Ejecutar `npm run build` antes de commit
4. Documentar cambios importantes

## 📋 Checklist para Desarrolladores

- [ ] Leer documentación técnica
- [ ] Entender requerimientos del proyecto
- [ ] Configurar entorno local
- [ ] Verificar compilación exitosa
- [ ] Revisar módulos existentes

## 🔒 Consideraciones de Seguridad

- **NO almacenar** datos personales en BD local
- **Consultar en tiempo real** desde Google Sheets
- **Validar números** de teléfono colombianos
- **Rate limiting** para SMS y APIs
- **Tokens JWT** con expiración apropiada

## 📞 Soporte

Para dudas técnicas:
1. Revisar documentación en `/docs/`
2. Verificar errores comunes en guía
3. Consultar changelog para cambios recientes

---

**Proyecto**: Sistema PH Colombia  
**Estado**: ✅ Compilación exitosa  
**Última actualización**: Enero 2025

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
