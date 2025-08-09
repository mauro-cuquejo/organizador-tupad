# Directorio de Tests

Este directorio contiene archivos de prueba para verificar el funcionamiento del sistema TUPAD.

## Archivos de Prueba

### `test-notifications.html`
- **Propósito**: Verificar que el sistema de notificaciones funciona correctamente
- **Funcionalidad**:
  - Test del endpoint de salud (`/api/health`)
  - Test del endpoint de notificaciones (`/api/notificaciones/check`)
- **Uso**: Abrir en el navegador para ejecutar las pruebas automáticamente

### `test-login.html`
- **Propósito**: Verificar que el sistema de autenticación funciona correctamente
- **Funcionalidad**:
  - Test del endpoint de salud (`/api/health`)
  - Test del login (`/api/auth/login`)
  - Test del perfil de usuario (`/api/auth/profile`)
- **Uso**: Abrir en el navegador y usar los botones para ejecutar tests individuales o completos

### `test-login-no-adblock.html`
- **Propósito**: Verificar que el sistema de autenticación funciona sin bloqueador de anuncios
- **Funcionalidad**:
  - Test del endpoint de salud (`/api/health`)
  - Test del login (`/api/auth/login`)
  - Test del perfil de usuario (`/api/auth/profile`)
- **Uso**: Deshabilitar bloqueador de anuncios y abrir en el navegador
- **Nota**: Especialmente útil para debugging problemas de bloqueo de peticiones HTTP

## Cómo Usar

1. **Asegúrate de que el backend esté corriendo** en `http://localhost:3000`
2. **Abre el archivo HTML** en tu navegador
3. **Revisa los logs** en la consola del navegador para ver los resultados

## Estructura

```
tests/
├── README.md                    # Este archivo
├── test-notifications.html      # Test del sistema de notificaciones
├── test-login.html              # Test del sistema de autenticación
├── test-login-no-adblock.html   # Test de login sin bloqueador
└── [futuros archivos de prueba]
```

## Notas

- Los archivos de prueba son independientes y no requieren configuración adicional
- Se ejecutan en el navegador para simular el entorno real del frontend
- Útiles para debugging y verificación de funcionalidad
