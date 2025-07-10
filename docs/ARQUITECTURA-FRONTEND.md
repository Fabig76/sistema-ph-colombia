# Arquitectura Frontend - Sistema de Paz y Salvos PH Colombia

## Visión General

El frontend del Sistema de Paz y Salvos PH Colombia está construido con Next.js 14, utilizando React 18 y TypeScript para proporcionar una experiencia de usuario moderna, responsive y de alto rendimiento. La arquitectura está diseñada para ser modular, escalable y fácil de mantener, siguiendo las mejores prácticas de desarrollo web.

## Stack Tecnológico

- **Framework**: Next.js 14.0.0
- **Biblioteca UI**: React 18.2.0
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Gestión de Estado**: 
  - Local: React Hooks (useState, useEffect)
  - Global: Zustand (en implementación)
- **Formularios**: React Hook Form con Zod (validación)
- **Peticiones HTTP**: Fetch API con wrapper personalizado
- **Notificaciones**: React Hot Toast
- **Componentes UI**: Componentes personalizados + Radix UI

## Estructura de Directorios

```
frontend/
├── public/              # Archivos estáticos
├── src/
│   ├── app/             # Rutas y páginas (App Router de Next.js)
│   │   ├── admin/       # Módulo de administrador del sistema
│   │   ├── admin-ph/    # Módulo de administradores PH
│   │   ├── propietarios/ # Módulo de propietarios
│   │   └── page.tsx     # Página principal
│   ├── components/      # Componentes reutilizables
│   │   ├── admin/       # Componentes específicos para admin
│   │   ├── admin-ph/    # Componentes específicos para admin-ph
│   │   ├── propietarios/ # Componentes específicos para propietarios
│   │   └── ui/          # Componentes UI genéricos
│   ├── lib/             # Utilidades y lógica de negocio
│   │   ├── api/         # Servicios de API y utilidades
│   │   ├── hooks/       # Custom hooks
│   │   ├── store/       # Gestión de estado global (Zustand)
│   │   └── utils/       # Funciones utilitarias
│   ├── types/           # Definiciones de tipos TypeScript
│   └── styles/          # Estilos globales
├── tailwind.config.js   # Configuración de Tailwind CSS
└── next.config.js       # Configuración de Next.js
```

## Patrones Arquitectónicos

### 1. Arquitectura Modular por Dominio

La aplicación está organizada en módulos que representan dominios de negocio:

- **Admin**: Gestión del sistema completo
- **Admin-PH**: Gestión de copropiedades por administradores
- **Propietarios**: Consulta y generación de paz y salvos

Cada módulo tiene sus propios componentes, páginas y lógica de negocio, lo que permite un desarrollo paralelo y aislado.

### 2. Patrón de Presentación-Contenedor

- **Componentes de Presentación**: Enfocados en la UI, reciben props y renderizan la interfaz
- **Componentes Contenedores**: Manejan la lógica de negocio, estado y comunicación con APIs

### 3. Gestión de Estado

- **Estado Local**: Usando React Hooks para componentes individuales
- **Estado Global**: Implementando Zustand para estado compartido entre componentes
- **Estado de Servidor**: Utilizando React Query para datos del servidor (en implementación)

### 4. Autenticación y Autorización

- JWT almacenado en localStorage con manejo seguro
- Verificación de roles y permisos
- Protección de rutas a nivel de layout
- Redirección automática para rutas protegidas

## Flujo de Datos

1. **Solicitud de Datos**:
   - Componentes llaman a funciones de API
   - Las funciones de API utilizan apiUtils para manejar tokens y headers

2. **Procesamiento de Respuestas**:
   - Manejo centralizado de errores
   - Transformación de datos cuando es necesario
   - Actualización del estado local o global

3. **Renderizado**:
   - Componentes consumen el estado y se renderizan
   - Manejo de estados de carga y error

## Estrategias de Optimización

- **Code Splitting**: Automático con Next.js
- **Lazy Loading**: Para componentes grandes y rutas
- **Memoización**: Con React.memo y useMemo para componentes costosos
- **Caché**: Implementación de caché para reducir llamadas a API

## Seguridad Frontend

- Sanitización de inputs
- Protección contra XSS
- Validación de datos en cliente
- Manejo seguro de tokens
- No almacenamiento de datos sensibles en localStorage sin encriptación

## Convenciones de Código

- **Nomenclatura**:
  - Componentes: PascalCase
  - Funciones y variables: camelCase
  - Constantes: UPPER_SNAKE_CASE
  - Tipos y interfaces: PascalCase

- **Estructura de Componentes**:
  - Imports
  - Tipos/Interfaces
  - Componente
  - Exportación

- **Comentarios**:
  - JSDoc para funciones públicas
  - Comentarios en español para explicar lógica compleja

## Integración con Backend

- Comunicación a través de API REST
- Endpoints organizados por dominio
- Manejo de errores centralizado
- Circuit breakers para prevenir cascadas de fallos

## Estrategia de Pruebas

- **Pruebas Unitarias**: Para utilidades y componentes aislados
- **Pruebas de Integración**: Para flujos completos
- **Pruebas E2E**: Para escenarios críticos

## Consideraciones para Desarrollo Futuro

- Implementación de PWA para experiencia móvil mejorada
- Migración completa a Server Components donde sea beneficioso
- Implementación de análisis y telemetría
- Mejoras de accesibilidad (WCAG)

---

Documento actualizado: 09/07/2025
