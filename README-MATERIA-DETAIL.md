# Página de Detalle de Materia - TUPaD

## 📋 Descripción

Se ha implementado una nueva funcionalidad para visualizar el contenido detallado de una materia. Esta página permite a los usuarios explorar toda la información relacionada con una materia específica de manera organizada y visualmente atractiva.

## 🎯 Funcionalidades Implementadas

### 1. **Página de Detalle de Materia** (`MateriaDetailPage.tsx`)

- **Navegación**: Acceso desde la lista de materias mediante el botón "Ver detalles"
- **Información General**:
  - Nombre, código, créditos, horas, semestre
  - Descripción detallada de la materia
  - Objetivos del curso
  - Información del docente

### 2. **Sistema de Pestañas**

La página organiza la información en 4 pestañas principales:

#### 📊 **Información General**
- Descripción completa de la materia
- Objetivos del curso con iconos
- Información del curso (docente, créditos, horas, semestre)

#### 📚 **Contenido**
- Unidades del curso organizadas por número
- Temas dentro de cada unidad
- Actividades específicas por tema
- Recursos necesarios para cada tema

#### ✅ **Evaluación**
- Sistema de evaluación con porcentajes
- Fechas de parciales y examen final
- Criterios de participación
- Visualización con badges de colores

#### 📁 **Recursos**
- Bibliografía recomendada
- Plataformas digitales
- Software y herramientas

### 3. **Script de Extracción de PDF** (`extract-pdf-content.js`)

- **Propósito**: Procesar PDFs de programas de materias para extraer información estructurada
- **Funcionalidades**:
  - Simulación de extracción de contenido (preparado para integración con librerías reales)
  - Generación de archivo JSON estructurado
  - Generación de archivo HTML para previsualización
  - Organización automática de unidades, temas, actividades y recursos

### 4. **Integración con Navegación**

- **Botón "Ver detalles"** en la lista de materias
- **Navegación fluida** entre páginas
- **Botones de acción** según rol del usuario (admin/profesor)

## 🎨 Diseño y UX

### **Características Visuales**
- **Iconos consistentes** de Heroicons
- **Badges informativos** para estados y porcentajes
- **Cards organizadas** para mejor legibilidad
- **Colores temáticos** para diferentes secciones
- **Responsive design** para dispositivos móviles

### **Interactividad**
- **Tabs de navegación** para organizar contenido
- **Botones de acción** contextuales
- **Estados de carga** con spinners
- **Mensajes de error** informativos

## 🚀 Tecnologías Utilizadas

### **Frontend**
- **React 18** con TypeScript
- **React Router v6** para navegación
- **Tailwind CSS v4** para estilos
- **Heroicons** para iconografía
- **React Hot Toast** para notificaciones

### **Backend Integration**
- **Zustand** para manejo de estado
- **Axios** para peticiones HTTP
- **TypeScript interfaces** para tipado

## 📁 Estructura de Archivos

```
frontend-v2/src/pages/materias/
├── MateriasPage.tsx           # Lista de materias (actualizado)
├── MateriaDetailPage.tsx      # Nueva página de detalles
└── ...

scripts/
├── extract-pdf-content.js     # Script de extracción de PDF
└── ...

output/
├── contenido-ingles.json      # JSON estructurado del contenido
└── contenido-ingles.html      # HTML generado para previsualización
```

## 🔄 Flujo de Usuario

1. **Acceso**: Usuario navega a `/materias`
2. **Selección**: Hace clic en "Ver detalles" de una materia
3. **Exploración**: Navega por las diferentes pestañas de información
4. **Interacción**: Utiliza los botones de acción según su rol

## 🎯 Próximos Pasos

### **Mejoras Planificadas**
- [ ] **Integración real de PDF**: Conectar con librerías como `pdf-parse` o `pdf2pic`
- [ ] **Editor de contenido**: Permitir edición directa del contenido de materias
- [ ] **Exportación**: Generar PDFs o documentos del contenido
- [ ] **Búsqueda interna**: Búsqueda dentro del contenido de la materia
- [ ] **Comentarios**: Sistema de comentarios y notas por tema
- [ ] **Progreso**: Seguimiento del progreso del estudiante

### **Integración Backend**
- [ ] **API endpoints** para contenido de materias
- [ ] **Base de datos** para almacenar contenido estructurado
- [ ] **Sistema de versionado** para cambios en contenido
- [ ] **Permisos granularizados** por sección

## 🧪 Testing

### **Casos de Prueba**
- [x] Navegación desde lista de materias
- [x] Carga de datos simulados
- [x] Cambio entre pestañas
- [x] Responsive design
- [x] Estados de error y carga
- [ ] Integración con API real
- [ ] Permisos de usuario

## 📊 Métricas de Éxito

- **Usabilidad**: Tiempo de navegación < 30 segundos
- **Performance**: Carga de página < 2 segundos
- **Accesibilidad**: Cumplimiento con WCAG 2.1
- **Satisfacción**: Feedback positivo de usuarios

## 🔧 Configuración

### **Requisitos**
- Node.js 18+
- React 18+
- TypeScript 5+

### **Instalación**
```bash
# Clonar repositorio
git clone [repository-url]

# Instalar dependencias
npm install

# Ejecutar script de extracción
node scripts/extract-pdf-content.js

# Iniciar aplicación
npm run dev
```

## 📞 Soporte

Para preguntas o problemas relacionados con esta funcionalidad, contactar al equipo de desarrollo de TUPaD.
