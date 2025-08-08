# TUPAD Organizador - Frontend V2

Frontend moderno para el sistema TUPAD Organizador, construido con React, TypeScript y Vite.

## 🚀 Tecnologías

- **React 18+** - Framework principal
- **TypeScript** - Tipado estático
- **Vite** - Build tool ultra-rápido
- **Tailwind CSS** - Framework de estilos
- **React Router v6** - Enrutamiento
- **Zustand** - Gestión de estado
- **React Hook Form + Zod** - Formularios y validación
- **Axios** - Cliente HTTP
- **Lucide React** - Iconos
- **React Hot Toast** - Notificaciones

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview
```

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes base (Button, Input, etc.)
│   ├── layout/         # Layout components
│   └── auth/           # Componentes de autenticación
├── pages/              # Páginas principales
│   ├── auth/           # Login, Register
│   └── dashboard/      # Dashboard principal
├── hooks/              # Custom hooks
├── services/           # API services
├── stores/             # Estado global (Zustand)
├── types/              # TypeScript types
├── utils/              # Utilidades
└── styles/             # Estilos globales
```

## 🔧 Configuración

### Variables de Entorno

El proyecto está configurado para usar el proxy de Vite que redirige las peticiones `/api` al backend en `http://localhost:3000`.

### Backend

Asegúrate de que el backend esté corriendo en `http://localhost:3000` antes de iniciar el frontend.

## 🎯 Características

### ✅ Implementadas
- [x] Autenticación (Login/Register)
- [x] Rutas protegidas
- [x] Layout responsive
- [x] Dashboard básico
- [x] Gestión de estado global
- [x] Validación de formularios
- [x] Notificaciones
- [x] Tipado TypeScript completo

### 🚧 En Desarrollo
- [ ] Gestión de materias
- [ ] Gestión de horarios
- [ ] Gestión de profesores
- [ ] Sistema de notificaciones
- [ ] Estadísticas
- [ ] Perfil de usuario

## 🔌 Conexión con Backend

El frontend se conecta automáticamente al backend a través del proxy de Vite configurado en `vite.config.ts`:

```typescript
server: {
  port: 3001,
  host: true,
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
}
```

## 🎨 Diseño

- **Framework**: Tailwind CSS
- **Iconos**: Lucide React
- **Fuente**: Inter
- **Paleta**: Colores personalizados con variantes de azul

## 📱 Responsive

El diseño es completamente responsive y funciona en:
- 📱 Móviles
- 📱 Tablets
- 💻 Desktop

## 🚀 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run preview` - Vista previa de producción
- `npm run type-check` - Verificar tipos TypeScript

## 🔒 Seguridad

- Validación de formularios con Zod
- Interceptores de Axios para manejo de errores
- Rutas protegidas
- Persistencia segura del estado de autenticación

## 📄 Licencia

Este proyecto es parte del sistema TUPAD Organizador.
