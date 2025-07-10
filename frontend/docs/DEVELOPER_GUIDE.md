# 👨‍💻 Guía Rápida para Desarrolladores

## 🚀 Inicio Rápido

### Configuración Inicial
```bash
cd frontend/
npm install
npm run dev  # Servidor en http://localhost:3001
```

### Verificar Estado
```bash
npm run build  # Debe compilar sin errores
```

---

## 🏗️ Arquitectura del Proyecto

### Módulos Principales
```
📁 Módulo A - Admin Sistema (/admin-sistema)
   └── Superadministrador para gestión completa

📁 Módulo B - Admin PH (/admin-ph) 
   └── Administradores de copropiedades
   
📁 Módulo C - Propietarios (/propietarios) ✅ REFACTORIZADO
   └── Usuarios propietarios de inmuebles
   
📁 Módulo D - Vigilancia (/vigilancia)
   └── Empresas de vigilancia (futuro)
```

### Flujo del Usuario Propietario
```
1. SearchStep     → Buscar copropiedad
2. PhoneStep      → Ingresar número celular  
3. VerificationStep → Validar código SMS
4. ResultsStep    → Ver inmuebles y descargar paz y salvos
```

---

## 📂 Estructura de Archivos

### Componentes
```typescript
// Componentes UI reutilizables
/components/ui/Button.tsx       // Botones estándar
/components/ui/Input.tsx        // Inputs con validación
/components/ui/Card.tsx         // Tarjetas de contenido
/components/ui/Modal.tsx        // Modales y dialogs

// Componentes por funcionalidad
/components/features/propietarios/
├── PropietariosFlow.tsx        // Flujo principal
└── steps/                      // Pasos del flujo
    ├── SearchStep.tsx
    ├── PhoneStep.tsx
    ├── VerificationStep.tsx
    └── ResultsStep.tsx
```

### Hooks Personalizados
```typescript
/hooks/useAuth.ts              // Autenticación
/hooks/useCopropiedad.ts       // Gestión copropiedades
```

### Tipos TypeScript
```typescript
/types/auth.ts                 // Tipos autenticación
/types/copropiedad.ts          // Tipos core del negocio
```

---

## 🔧 Patrones de Código

### Componente Step
```typescript
interface StepProps {
  // Props específicas del paso
  onNext: (data: any) => void
  loading: boolean
}

const Step: React.FC<StepProps> = ({ onNext, loading }) => {
  // Lógica del componente
  return (
    <div className="space-y-6">
      {/* UI del paso */}
    </div>
  )
}

export default Step  // ✅ Siempre export default
```

### Hook Personalizado
```typescript
interface UseFeatureReturn {
  // Estado
  data: DataType[]
  loading: boolean
  error: string | null
  
  // Acciones
  fetchData: () => Promise<void>
  updateData: (data: DataType) => void
}

export const useFeature = (): UseFeatureReturn => {
  const [state, setState] = useState({
    data: [],
    loading: false,
    error: null
  })
  
  // Implementación
  
  return {
    ...state,
    fetchData,
    updateData
  }
}
```

### Componente UI
```typescript
interface ComponentProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  onClick?: () => void
}

export const Component: React.FC<ComponentProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  onClick
}) => {
  // Implementación con Tailwind CSS
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={loading}
      onClick={onClick}
    >
      {loading ? 'Cargando...' : children}
    </button>
  )
}

export default Component
```

---

## 🐛 Debugging

### Errores Comunes

#### 1. Error de Compilación TypeScript
```bash
# Ver errores de tipos sin lint
npm run build -- --no-lint

# Revisar:
# - Interfaces en /types/
# - Export/import statements
# - Props de componentes
```

#### 2. Componente No Encontrado
```typescript
// ❌ Problema común
export const Component = () => {}  // Sin default export

// ✅ Solución
export const Component = () => {}
export default Component  // Añadir default export
```

#### 3. Props Type Error
```typescript
// ❌ Error común
<Component properties={data} />  // Nombre incorrecto

// ✅ Solución
<Component propiedades={data} />  // Verificar interface
```

### Comandos de Debug
```bash
# Verificar compilación
npm run build

# Limpiar caché
rm -rf .next/
npm run build

# Ver dependencias
npm ls

# Verificar puertos
lsof -i :3001
```

---

## 📋 Checklist para Nuevas Features

### Antes de Empezar
- [ ] Revisar requerimientos del proyecto
- [ ] Identificar módulo correspondiente (A, B, C, D)
- [ ] Verificar tipos TypeScript necesarios

### Durante Desarrollo
- [ ] Crear interfaces TypeScript
- [ ] Implementar hook si es necesario
- [ ] Crear componentes UI reutilizables
- [ ] Añadir export default a componentes
- [ ] Usar patrones establecidos

### Antes de Commit
- [ ] `npm run build` sin errores
- [ ] Probar funcionalidad en navegador
- [ ] Verificar responsive design
- [ ] Documentar cambios importantes

---

## 🔐 Consideraciones de Seguridad

### Datos Sensibles
```typescript
// ❌ NO hacer
const userData = {
  nombre: 'Juan Pérez',
  cedula: '12345678'  // NO almacenar en BD
}

// ✅ Hacer
const userReference = {
  telefono: '3001234567',  // Solo referencia
  copropiedadId: 'abc123'
}
// Consultar datos en tiempo real desde Google Sheets
```

### APIs Externas  
```typescript
// Siempre manejar errores y timeouts
const fetchFromGoogleSheets = async () => {
  try {
    const response = await fetch(url, { timeout: 5000 })
    return await response.json()
  } catch (error) {
    console.error('Error Google Sheets:', error)
    throw new Error('No se pudieron consultar los datos')
  }
}
```

---

## 🚀 Próximas Funcionalidades

### Integraciones Pendientes
- **Google Sheets API**: Consulta propietarios en tiempo real
- **Google Docs API**: Plantillas de paz y salvos  
- **SMS Service**: Envío códigos de validación
- **Bold Payment**: Pagos de administradores
- **PDF Generation**: Generación documentos

### Módulos por Desarrollar
- **Admin PH**: Dashboard para administradores
- **Admin Sistema**: Portal superadministrador
- **Vigilancia**: Portal empresas de seguridad

---

## 📊 Métricas de Calidad

### Objetivos
- ✅ **Compilación**: 0 errores críticos
- 🎯 **Bundle Size**: < 1MB
- 🎯 **First Paint**: < 1.5s  
- 🎯 **Code Coverage**: > 80%

### Herramientas
```bash
# Análisis de bundle
npm run analyze

# Testing (cuando esté configurado)
npm test

# Lint
npm run lint
```

---

## 📞 Recursos

- **Requerimientos**: Ver memoria del proyecto
- **Arquitectura**: `/docs/FRONTEND_REFACTOR_FIXES.md`
- **Colombia PH**: Entender normativa propiedad horizontal
- **Google APIs**: Documentación oficial para integraciones

**¡Listo para desarrollar! 🚀**
