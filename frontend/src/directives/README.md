# Directivas y Filtros Personalizados

## 📋 **Directivas de Carga (Loading)**

### `loading-spinner`
Muestra un spinner de carga con mensaje personalizable.

```html
<loading-spinner
    loading="ctrl.loading"
    message="Cargando datos..."
    size="sm"
    color="primary">
</loading-spinner>
```

**Parámetros:**
- `loading` (boolean): Controla la visibilidad del spinner
- `message` (string): Mensaje a mostrar debajo del spinner
- `size` (string): Tamaño del spinner ('sm', 'md', 'lg')
- `color` (string): Color del spinner ('primary', 'secondary', 'success', etc.)

### `loading-overlay`
Muestra un overlay de carga sobre el contenido.

```html
<loading-overlay
    loading="ctrl.loading"
    message="Procesando..."
    backdrop="true">
</loading-overlay>
```

### `loading-button`
Convierte un botón en un botón de carga.

```html
<button loading-button
        loading="ctrl.saving"
        loading-text="Guardando..."
        original-text="Guardar">
    Guardar
</button>
```

## 🏷️ **Directivas de Componentes**

### `status-badge`
Muestra un badge de estado con colores automáticos.

```html
<status-badge
    status="activo"
    text="Activo"
    size="sm">
</status-badge>
```

**Estados soportados:**
- `activo` → Verde
- `inactivo` → Gris
- `pendiente` → Amarillo
- `completado` → Azul
- `vencido` → Rojo
- `cancelado` → Negro

### `user-avatar`
Muestra un avatar de usuario con iniciales.

```html
<user-avatar
    name="Juan Pérez"
    email="juan@email.com"
    size="md"
    show-name="true">
</user-avatar>
```

**Tamaños disponibles:**
- `sm` (30px)
- `md` (40px)
- `lg` (60px)

### `info-card`
Crea una tarjeta de información colapsible.

```html
<info-card
    title="Información"
    icon="bi-info-circle"
    color="primary"
    collapsible="true"
    collapsed="false">
    <p>Contenido de la tarjeta...</p>
</info-card>
```

### `confirm-dialog`
Muestra un diálogo de confirmación.

```html
<confirm-dialog
    show="ctrl.showConfirm"
    title="Eliminar elemento"
    message="¿Estás seguro?"
    confirm-text="Eliminar"
    cancel-text="Cancelar"
    on-confirm="ctrl.deleteItem()"
    on-cancel="ctrl.cancelDelete()">
</confirm-dialog>
```

### `file-upload`
Componente de upload de archivos con drag & drop.

```html
<file-upload
    on-file-select="ctrl.handleFiles($files)"
    accept=".pdf,.doc,.docx"
    multiple="true"
    max-size="5242880"
    show-progress="true">
</file-upload>
```

## ✅ **Directivas de Validación**

### `password-strength`
Muestra la fortaleza de una contraseña en tiempo real.

```html
<input type="password" ng-model="ctrl.password">
<div password-strength password="ctrl.password"></div>
```

### `email-validator`
Valida formato de email.

```html
<input type="email"
       ng-model="ctrl.email"
       email-validator>
```

### `phone-validator`
Valida formato de teléfono.

```html
<input type="tel"
       ng-model="ctrl.phone"
       phone-validator>
```

### `number-range`
Valida rango de números.

```html
<input type="number"
       ng-model="ctrl.age"
       number-range min="18" max="100">
```

### `date-validator`
Valida formato de fecha.

```html
<input type="date"
       ng-model="ctrl.birthDate"
       date-validator>
```

### `unique-validator`
Valida unicidad contra el servidor.

```html
<input type="text"
       ng-model="ctrl.username"
       unique-validator
       unique-url="/api/check-username"
       current-id="ctrl.userId">
```

### `form-validator`
Valida formularios completos.

```html
<form form-validator
      form="ctrl.form"
      on-submit="ctrl.submit()">
    <!-- campos del formulario -->
</form>
```

### `auto-focus`
Enfoca automáticamente un elemento.

```html
<input type="text"
       ng-model="ctrl.name"
       auto-focus>
```

### `auto-resize`
Redimensiona automáticamente textareas.

```html
<textarea ng-model="ctrl.description"
          auto-resize
          class="auto-resize">
</textarea>
```

## 🔧 **Filtros Personalizados**

### `formatDate`
Formatea fechas en diferentes formatos.

```html
{{ fecha | formatDate:'short' }}     <!-- 15/03/2024 -->
{{ fecha | formatDate:'long' }}      <!-- 15 de marzo de 2024 -->
{{ fecha | formatDate:'time' }}      <!-- 14:30 -->
{{ fecha | formatDate:'datetime' }}  <!-- 15/03/2024 14:30 -->
{{ fecha | formatDate:'relative' }}  <!-- hace 2 horas -->
```

### `formatFileSize`
Formatea tamaños de archivo.

```html
{{ bytes | formatFileSize }}  <!-- 1.5 MB -->
```

### `formatDuration`
Formatea duración en minutos.

```html
{{ minutes | formatDuration }}  <!-- 2h 30min -->
```

### `formatPhone`
Formatea números de teléfono.

```html
{{ phone | formatPhone }}  <!-- 123 456 789 -->
```

### `formatCurrency`
Formatea monedas.

```html
{{ amount | formatCurrency:'EUR' }}  <!-- 1.234,56 € -->
```

### `truncate`
Trunca texto a una longitud específica.

```html
{{ longText | truncate:50:'...' }}
```

### `capitalize`
Capitaliza la primera letra.

```html
{{ text | capitalize }}  <!-- Hola mundo -->
```

### `titleCase`
Capitaliza cada palabra.

```html
{{ text | titleCase }}  <!-- Hola Mundo -->
```

### `formatPercentage`
Formatea porcentajes.

```html
{{ value | formatPercentage:2 }}  <!-- 85.50% -->
```

### `formatNumber`
Formatea números con decimales.

```html
{{ number | formatNumber:2 }}  <!-- 1,234.56 -->
```

### `formatCreditos`
Formatea créditos académicos.

```html
{{ creditos | formatCreditos }}  <!-- 6 créditos -->
```

### `formatHoras`
Formatea horas.

```html
{{ horas | formatHoras }}  <!-- 45h -->
```

### `formatPuntaje`
Formatea puntajes.

```html
{{ puntaje | formatPuntaje:100 }}  <!-- 85/100 pts -->
```

### `formatEstado`
Formatea estados.

```html
{{ estado | formatEstado }}  <!-- Activo -->
```

### `formatTipo`
Formatea tipos.

```html
{{ tipo | formatTipo }}  <!-- Examen -->
```

### `highlight`
Resalta texto en búsquedas.

```html
{{ text | highlight:searchTerm }}
```

### `orderByProperty`
Ordena arrays por propiedad.

```html
<div ng-repeat="item in items | orderByProperty:'name':false">
```

### `filterByMultiple`
Filtra arrays por múltiples criterios.

```html
<div ng-repeat="item in items | filterByMultiple:filters">
```

## 🎨 **Ejemplos de Uso**

### Formulario con validaciones
```html
<form form-validator form="ctrl.form" on-submit="ctrl.save()">
    <div class="mb-3">
        <label>Email</label>
        <input type="email"
               ng-model="ctrl.email"
               email-validator
               auto-focus
               class="form-control">
    </div>

    <div class="mb-3">
        <label>Contraseña</label>
        <input type="password"
               ng-model="ctrl.password"
               class="form-control">
        <div password-strength password="ctrl.password"></div>
    </div>

    <button type="submit"
            loading-button
            loading="ctrl.saving"
            loading-text="Guardando...">
        Guardar
    </button>
</form>
```

### Tabla con componentes
```html
<table class="table">
    <tr ng-repeat="item in items">
        <td>
            <user-avatar name="{{ item.name }}" size="sm"></user-avatar>
        </td>
        <td>
            <status-badge status="{{ item.status }}"></status-badge>
        </td>
        <td>{{ item.date | formatDate:'short' }}</td>
        <td>{{ item.size | formatFileSize }}</td>
    </tr>
</table>
```

### Upload de archivos
```html
<file-upload
    on-file-select="ctrl.handleFiles($files)"
    accept=".pdf,.doc,.docx"
    multiple="true">
</file-upload>
```

## 📱 **Responsive Design**

Todas las directivas son completamente responsivas y se adaptan automáticamente a diferentes tamaños de pantalla:

- **Desktop**: Tamaños completos
- **Tablet**: Tamaños reducidos
- **Mobile**: Tamaños mínimos y layouts optimizados

## 🎯 **Mejores Prácticas**

1. **Usar directivas específicas** en lugar de código repetitivo
2. **Aprovechar los filtros** para formateo consistente
3. **Validar formularios** con las directivas de validación
4. **Usar loading states** para mejorar UX
5. **Mantener consistencia** en el uso de componentes