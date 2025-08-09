# 🔒 Seguridad de Administradores - TUPAD Organizador

## 📋 Resumen de Mejoras Implementadas

Se han implementado mejoras de seguridad importantes para la gestión de roles de administrador en el sistema TUPAD Organizador.

## 🛡️ Cambios de Seguridad

### 1. **Registro Público Restringido**
- ❌ **Antes**: Los usuarios podían registrarse como administradores desde el formulario público
- ✅ **Ahora**: Solo se permiten roles de "Estudiante" y "Profesor" en el registro público
- 🔧 **Implementación**:
  - Frontend: Removida opción de administrador del formulario de registro
  - Backend: Validación que fuerza el rol a "estudiante" si se intenta registrar como admin

### 2. **Usuario Administrador por Defecto**
- ✅ **Creado**: Usuario administrador automático al instalar el sistema
- 📧 **Email**: `admin@tupad.edu.ar`
- 🔑 **Contraseña**: `AdminTupad2024!`
- ⚠️ **Importante**: Cambiar contraseña después del primer login

### 3. **Gestión de Usuarios por Administradores**
- ✅ **Nueva funcionalidad**: Panel de administración para gestionar usuarios
- 🔧 **Características**:
  - Ver todos los usuarios del sistema
  - Cambiar roles de usuarios
  - Activar/desactivar usuarios
  - Cambiar contraseñas
  - Eliminar usuarios
  - Estadísticas de usuarios

### 4. **Protecciones de Seguridad**
- 🛡️ **Último Administrador**: No se puede eliminar/desactivar el último administrador
- 🔒 **Validaciones**: Verificaciones en backend para prevenir acciones peligrosas
- 👥 **Autorización**: Solo administradores pueden acceder a la gestión de usuarios

## 🚀 Cómo Usar

### **Acceso al Panel de Administración**
1. Inicia sesión como administrador
2. Navega a `/admin/usuarios`
3. Gestiona usuarios desde la interfaz

### **Crear Nuevos Administradores**
1. Ve al panel de administración
2. Haz clic en "Nuevo Usuario"
3. Completa los datos y selecciona rol "Administrador"
4. Guarda el usuario

### **Cambiar Roles de Usuarios**
1. En la lista de usuarios, haz clic en el botón de editar (lápiz)
2. Cambia el rol en el modal
3. Guarda los cambios

## 📁 Archivos Modificados

### **Backend**
- `routes/auth.js` - Validación de roles en registro
- `routes/usuarios.js` - Nueva ruta para gestión de usuarios
- `server.js` - Agregada ruta de usuarios
- `scripts/createAdminUser.js` - Script para crear admin por defecto

### **Frontend**
- `controllers/auth.controller.js` - Roles restringidos en registro
- `controllers/admin.controller.js` - Controlador para gestión de usuarios
- `views/admin/usuarios.html` - Vista de gestión de usuarios
- `app.js` - Nueva ruta para panel de administración

## 🔐 Credenciales del Administrador

```
Email: admin@tupad.edu.ar
Contraseña: AdminTupad2024!
```

**⚠️ IMPORTANTE**: Cambia esta contraseña inmediatamente después del primer inicio de sesión.

## 🛠️ Scripts Disponibles

### **Crear Usuario Administrador**
```bash
cd backend
node scripts/createAdminUser.js
```

Este script:
- Verifica si ya existe un administrador
- Crea un usuario administrador por defecto
- Configura notificaciones automáticamente
- Muestra las credenciales de acceso

## 📊 Funcionalidades del Panel de Administración

### **Estadísticas**
- Total de usuarios
- Usuarios activos/inactivos
- Distribución por roles
- Usuarios recientes

### **Filtros y Búsqueda**
- Búsqueda por nombre, email
- Filtro por rol
- Filtro por estado (activo/inactivo)

### **Acciones Disponibles**
- ✅ Editar información de usuario
- 🔑 Cambiar contraseña
- 🔄 Activar/desactivar usuario
- 🗑️ Eliminar usuario (con protecciones)

## 🔒 Medidas de Seguridad

### **Validaciones Backend**
- Verificación de permisos de administrador
- Protección del último administrador
- Validación de roles válidos
- Sanitización de datos

### **Validaciones Frontend**
- Interfaz intuitiva con confirmaciones
- Deshabilitación de acciones peligrosas
- Feedback visual de estados
- Validación de formularios

## 🚨 Consideraciones de Seguridad

1. **Contraseña del Administrador**: Cambiar inmediatamente después de la instalación
2. **Acceso al Panel**: Solo usuarios con rol "admin" pueden acceder
3. **Último Administrador**: El sistema protege automáticamente al último admin
4. **Auditoría**: Todas las acciones quedan registradas en logs

## 📝 Próximos Pasos Recomendados

1. ✅ Cambiar contraseña del administrador por defecto
2. ✅ Crear usuarios administradores adicionales
3. ✅ Configurar políticas de contraseñas
4. ✅ Implementar autenticación de dos factores (futuro)
5. ✅ Configurar logs de auditoría (futuro)

## 🆘 Soporte

Si encuentras problemas con la gestión de administradores:

1. Verifica que estés logueado como administrador
2. Revisa los logs del servidor
3. Confirma que el usuario tenga permisos de administrador
4. Contacta al equipo de desarrollo

---

**🔒 Seguridad primero, funcionalidad después**