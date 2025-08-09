# Compatibilidad con Bloqueadores de Anuncios

## Descripción

El sistema TUPAD está diseñado para funcionar correctamente en navegadores con bloqueadores de anuncios como Brave, uBlock Origin, AdBlock Plus, etc.

## Características

### 🔍 Detección Automática
- Detecta automáticamente la presencia de bloqueadores de anuncios
- Activa modo fallback cuando es necesario
- Muestra notificaciones informativas al usuario

### 🔄 Modo Fallback
- Usa `fetch()` nativo como alternativa a `$http` de AngularJS
- Mantiene toda la funcionalidad del sistema
- Headers personalizados para evitar detección

### 🛡️ Configuración de Seguridad
- CSP configurado para permitir conexiones locales
- Headers adicionales para evitar bloqueos
- Modo desarrollo optimizado

## Cómo Funciona

### 1. Detección
```javascript
// Intenta cargar un archivo típicamente bloqueado
$http.get('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js')
```

### 2. Fallback
```javascript
// Si falla, usa fetch nativo
fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Cache-Control': 'no-cache'
    },
    body: JSON.stringify(data)
})
```

### 3. Notificación
- Muestra mensaje informativo al usuario
- Indica que el sistema funciona en modo compatible
- Sugiere deshabilitar bloqueador para mejor experiencia

## Navegadores Compatibles

- ✅ **Brave** (con bloqueador integrado)
- ✅ **Chrome** (con extensiones de bloqueo)
- ✅ **Firefox** (con uBlock Origin)
- ✅ **Edge** (con bloqueadores)
- ✅ **Safari** (con bloqueadores)

## Configuración Recomendada

### Para Desarrollo
```javascript
// Deshabilitar bloqueador para localhost
// En Brave: Settings > Shields > Site and shield settings > localhost:8080
// En uBlock Origin: Click en el icono > Deshabilitar para este sitio
```

### Para Producción
```javascript
// El sistema funciona automáticamente
// No requiere configuración adicional
```

## Logs de Consola

### Modo Normal
```
✅ No se detectó bloqueador de anuncios
🔒 CSP configurado para compatibilidad con bloqueadores
```

### Modo Fallback
```
⚠️ Bloqueador de anuncios detectado, activando modo fallback
🚫 Bloqueador de anuncios detectado - Sistema funcionando en modo fallback
💡 El sistema funcionará en modo fallback
```

## Troubleshooting

### Problema: Login no funciona
**Solución:** Verificar que el bloqueador no esté bloqueando `localhost:3000`

### Problema: Errores de CORS
**Solución:** El sistema maneja automáticamente los errores de CORS

### Problema: Peticiones bloqueadas
**Solución:** El modo fallback debería activarse automáticamente

## Archivos Relacionados

- `src/services/adblock-detector.service.js` - Servicio principal
- `src/services/api.service.js` - API con fallback
- `security-config.js` - Configuración de seguridad
- `app.js` - Inicialización del sistema

## Notas Técnicas

- El sistema usa `fetch()` nativo como fallback
- Headers personalizados para evitar detección
- Timeout de 3 segundos para detección
- Modo desarrollo optimizado para localhost
- CSP configurado para permitir conexiones locales
