# Documentación Fase 3: Implementación del Módulo de Propietarios

## Resumen General

Esta fase se ha enfocado en el desarrollo e integración del módulo de propietarios para el sistema "Paz y Salvos PH Colombia", utilizando Next.js como framework principal. Se han implementado utilidades de API simuladas, componentes de navegación, y estructuras base para la autenticación y gestión de datos de propietarios.

## Estructura del Proyecto

```
frontend/
├── src/
│   ├── app/
│   │   ├── propietarios/
│   │   │   ├── layout.tsx       # Layout principal del módulo propietarios
│   │   │   ├── login/           # Páginas de autenticación (pendiente)
│   │   │   ├── registro/        # Páginas de registro (pendiente)
│   │   │   ├── inmuebles/       # Gestión de inmuebles (pendiente)
│   │   │   └── paz-y-salvos/    # Gestión de paz y salvos (pendiente)
│   ├── components/
│   │   ├── propietarios/
│   │   │   └── NavbarPropietarios.tsx  # Barra de navegación para propietarios
│   ├── lib/
│   │   ├── api/
│   │   │   ├── index.ts         # Exportaciones centralizadas de APIs
│   │   │   ├── apiUtils.ts      # Utilidades generales de API (token, auth)
│   │   │   ├── authApi.ts       # API simulada para autenticación
│   │   │   ├── propietariosApi.ts # API simulada para propietarios
│   │   │   └── adminPhApi.ts    # API simulada para administradores PH
│   │   └── utils/
│   │       └── index.ts         # Utilidades generales (validación, formato)
```

## Componentes Implementados

### 1. NavbarPropietarios.tsx

Componente de navegación responsive para el módulo de propietarios que incluye:
- Menú adaptable a dispositivos móviles y desktop
- Avatar con iniciales del usuario y color generado dinámicamente
- Funcionalidad de cierre de sesión
- Enlaces a las diferentes secciones del módulo

Características técnicas:
- Implementación de la función `stringToColor` para generar colores consistentes basados en el nombre del usuario
- Uso de estados para controlar la apertura/cierre del menú móvil
- Integración con las utilidades de autenticación

### 2. Layout de Propietarios

El archivo `layout.tsx` implementa:
- Verificación de autenticación con redirección a login si es necesario
- Estructura base para todas las páginas del módulo propietarios
- Integración con el componente NavbarPropietarios
- Manejo de estados de carga y montaje

## Utilidades API Implementadas

### 1. apiUtils.ts

Funciones para manejo de autenticación y tokens:
- `setToken`: Almacena el token JWT en localStorage
- `getToken`: Recupera el token JWT de localStorage
- `clearAuth`: Elimina datos de autenticación
- `isAuthenticated`: Verifica si el usuario está autenticado
- `getUserData`: Recupera datos del usuario desde localStorage
- `setUserData`: Almacena datos del usuario en localStorage
- `hasRole`: Verifica si el usuario tiene un rol específico

### 2. authApi.ts

Simulación de endpoints de autenticación:
- `loginPropietario`: Autenticación de propietarios
- `registerPropietario`: Registro de nuevos propietarios
- `verifySmsCode`: Verificación de códigos SMS
- `searchCopropiedad`: Búsqueda de copropiedades por NIT o nombre
- `forgotPassword`: Recuperación de contraseña
- `resetPassword`: Restablecimiento de contraseña

### 3. propietariosApi.ts

Simulación de endpoints específicos para propietarios:
- `getInmueblesPropietario`: Obtiene inmuebles asociados al propietario
- `getPazYSalvos`: Obtiene historial de paz y salvos
- `generatePazYSalvo`: Genera un nuevo paz y salvo
- `updateProfilePropietario`: Actualiza datos del perfil

### 4. adminPhApi.ts

Simulación de endpoints para administradores PH:
- `getCopropiedades`: Obtiene copropiedades administradas
- `addCopropiedad`: Agrega nueva copropiedad
- `removeCopropiedad`: Elimina copropiedad
- `getEstadisticas`: Obtiene estadísticas de uso
- `getSubscriptionStatus`: Verifica estado de suscripción
- `updateProfileAdmin`: Actualiza perfil del administrador

## Utilidades Generales

El archivo `utils/index.ts` implementa funciones para:
- Validación y formateo de teléfonos colombianos
- Validación y formateo de NIT
- Formateo de fechas
- Obtención de iniciales a partir de nombres
- Truncado de texto
- Validación de URLs
- Formateo de moneda

## Estado Actual y Próximos Pasos

### Completado:
- ✅ Estructura base del módulo propietarios
- ✅ Componente de navegación responsive
- ✅ Utilidades de API simuladas
- ✅ Funciones de validación y formateo
- ✅ Layout con verificación de autenticación

### Pendiente:
- ⏳ Implementación de páginas específicas (inmuebles, paz y salvos, perfil)
- ⏳ Integración con backend real
- ⏳ Gestión global de estado (Zustand o Context)
- ⏳ Implementación de flujos completos (registro, recuperación de contraseña)
- ⏳ Mejoras de seguridad y manejo de errores
- ⏳ Pruebas unitarias y de integración

## Consideraciones Técnicas

### Autenticación
- Se utiliza JWT almacenado en localStorage
- Verificación de autenticación en el layout principal
- Redirección a login cuando es necesario

### Simulación de API
- Las APIs están simuladas con promesas y timeouts para emular comportamiento asíncrono
- Preparadas para ser reemplazadas por llamadas reales a backend

### Validación
- Implementadas funciones de validación específicas para Colombia (teléfonos, NIT)
- Preparado para integrar con bibliotecas como Zod o Joi

## Guía para Desarrolladores

### Cómo continuar el desarrollo:

1. **Implementación de páginas**:
   - Crear las páginas dentro de los directorios correspondientes en `/app/propietarios/`
   - Utilizar el layout existente que ya maneja la autenticación

2. **Conexión con backend real**:
   - Reemplazar las funciones simuladas en los archivos de API por llamadas reales
   - Mantener la misma estructura de respuesta para compatibilidad

3. **Gestión de estado global**:
   - Implementar store con Zustand siguiendo la estructura técnica definida
   - Centralizar estado de autenticación y datos de usuario

4. **Mejoras de UI/UX**:
   - Seguir los patrones de diseño establecidos
   - Mantener consistencia con los componentes existentes

### Convenciones de código:
- TypeScript para todos los componentes y utilidades
- Nombres de funciones en camelCase
- Nombres de componentes en PascalCase
- Comentarios explicativos en español
- Tipado explícito de parámetros y retornos

---

Documentación preparada: 09/07/2025
