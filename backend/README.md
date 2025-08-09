# Backend - Organizador Académico TUPAD

Backend desarrollado en Node.js con Express y SQLite para el sistema de organización académica de TUPAD.

## Características

- **Autenticación JWT**: Sistema de login y registro con tokens JWT
- **Gestión de Horarios**: Manejo de horarios de cursada con filtros por día, materia y profesor
- **Gestión de Profesores**: Información de profesores con materias y horarios
- **Gestión de Materias**: Cronograma de contenidos organizado por semana
- **Gestión de Contenidos**: Contenidos de materias con notificaciones por email
- **Gestión de Evaluaciones**: Evaluaciones con notas y estadísticas
- **Notificaciones**: Sistema de notificaciones por email y en la aplicación
- **Base de Datos SQLite**: Base de datos ligera y portable
- **Validación**: Validación de datos con express-validator
- **Seguridad**: Middleware de seguridad con helmet y rate limiting

## Estructura del Proyecto

```
backend/
├── database/
│   └── init.js              # Inicialización de la base de datos
├── middleware/
│   ├── auth.js              # Middleware de autenticación
│   └── validation.js        # Middleware de validación
├── routes/
│   ├── auth.js              # Rutas de autenticación
│   ├── horarios.js          # Rutas de horarios
│   ├── profesores.js        # Rutas de profesores
│   ├── materias.js          # Rutas de materias
│   ├── contenidos.js        # Rutas de contenidos
│   └── evaluaciones.js      # Rutas de evaluaciones
├── services/
│   └── emailService.js      # Servicio de email
├── server.js                # Servidor principal
├── package.json             # Dependencias
├── env.example              # Variables de entorno de ejemplo
└── README.md               # Documentación
```

## Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd organizador-tupad/backend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp env.example .env
   ```

   Editar el archivo `.env` con tus configuraciones:
   ```env
   PORT=3000
   NODE_ENV=development
   DB_PATH=./database/academic_organizer.db
   JWT_SECRET=tu_jwt_secret_super_seguro_aqui
   JWT_EXPIRES_IN=24h
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=tu_email@gmail.com
   EMAIL_PASS=tu_password_de_aplicacion
   EMAIL_FROM=tu_email@gmail.com
   BCRYPT_ROUNDS=12
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Ejecutar el servidor**
   ```bash
   # Desarrollo
   npm run dev

   # Producción
   npm start
   ```

## Base de Datos

La aplicación utiliza SQLite como base de datos. Al iniciar el servidor, se crean automáticamente las siguientes tablas:

- **usuarios**: Información de usuarios del sistema
- **profesores**: Información de profesores y asistentes
- **materias**: Materias del plan de estudios
- **comisiones**: Comisiones de cada materia
- **horarios**: Horarios de cursada
- **contenidos**: Contenidos de materias organizados por semana
- **evaluaciones**: Evaluaciones programadas
- **notas**: Notas de los estudiantes
- **notificaciones**: Notificaciones del sistema
- **configuracion_notificaciones**: Configuración de notificaciones por usuario

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login de usuario
- `GET /api/auth/profile` - Obtener perfil del usuario
- `PUT /api/auth/profile` - Actualizar perfil
- `PUT /api/auth/change-password` - Cambiar contraseña
- `GET /api/auth/notifications/config` - Obtener configuración de notificaciones
- `PUT /api/auth/notifications/config` - Actualizar configuración de notificaciones
- `GET /api/auth/notifications` - Obtener notificaciones del usuario
- `PUT /api/auth/notifications/:id/read` - Marcar notificación como leída

### Horarios
- `GET /api/horarios` - Obtener todos los horarios (con filtros)
- `GET /api/horarios/dia/:dia` - Obtener horarios por día
- `GET /api/horarios/materia/:materiaId` - Obtener horarios por materia
- `GET /api/horarios/profesor/:profesorId` - Obtener horarios por profesor
- `GET /api/horarios/:id` - Obtener horario específico
- `POST /api/horarios` - Crear nuevo horario
- `PUT /api/horarios/:id` - Actualizar horario
- `DELETE /api/horarios/:id` - Eliminar horario

### Profesores
- `GET /api/profesores` - Obtener todos los profesores
- `GET /api/profesores/:id` - Obtener profesor específico
- `GET /api/profesores/:id/horarios` - Obtener horarios del profesor
- `GET /api/profesores/:id/materias` - Obtener materias del profesor
- `POST /api/profesores` - Crear nuevo profesor
- `PUT /api/profesores/:id` - Actualizar profesor
- `DELETE /api/profesores/:id` - Eliminar profesor
- `GET /api/profesores/search/:query` - Buscar profesores

### Materias
- `GET /api/materias` - Obtener todas las materias
- `GET /api/materias/:id` - Obtener materia específica
- `GET /api/materias/:id/horarios` - Obtener horarios de la materia
- `GET /api/materias/:id/cronograma` - Obtener cronograma de la materia
- `GET /api/materias/:id/evaluaciones` - Obtener evaluaciones de la materia
- `POST /api/materias` - Crear nueva materia
- `PUT /api/materias/:id` - Actualizar materia
- `DELETE /api/materias/:id` - Eliminar materia
- `GET /api/materias/search/:query` - Buscar materias

### Contenidos
- `GET /api/contenidos` - Obtener todos los contenidos (con filtros)
- `GET /api/contenidos/por-semana` - Obtener contenidos organizados por semana
- `GET /api/contenidos/actual` - Obtener contenido de la semana actual
- `GET /api/contenidos/:id` - Obtener contenido específico
- `POST /api/contenidos` - Crear nuevo contenido
- `PUT /api/contenidos/:id` - Actualizar contenido
- `DELETE /api/contenidos/:id` - Eliminar contenido
- `GET /api/contenidos/search/:query` - Buscar contenidos
- `GET /api/contenidos/stats/overview` - Estadísticas de contenidos
- `GET /api/contenidos/materia/:materiaId` - Obtener contenidos por materia

### Evaluaciones
- `GET /api/evaluaciones` - Obtener todas las evaluaciones (con filtros)
- `GET /api/evaluaciones/proximas` - Obtener evaluaciones próximas
- `GET /api/evaluaciones/:id` - Obtener evaluación específica
- `GET /api/evaluaciones/usuario/:usuarioId/notas` - Obtener notas de un usuario
- `POST /api/evaluaciones` - Crear nueva evaluación
- `PUT /api/evaluaciones/:id` - Actualizar evaluación
- `DELETE /api/evaluaciones/:id` - Eliminar evaluación
- `POST /api/evaluaciones/:id/notas` - Agregar nota a evaluación
- `PUT /api/evaluaciones/:id/notas/:notaId` - Actualizar nota
- `DELETE /api/evaluaciones/:id/notas/:notaId` - Eliminar nota
- `GET /api/evaluaciones/search/:query` - Buscar evaluaciones

## Autenticación

La API utiliza JWT (JSON Web Tokens) para la autenticación. Para acceder a endpoints protegidos, incluye el token en el header:

```
Authorization: Bearer <tu-token-jwt>
```

## Roles de Usuario

- **estudiante**: Acceso básico a ver información
- **profesor**: Puede crear y editar contenido, horarios, evaluaciones
- **admin**: Acceso completo al sistema

## Notificaciones

El sistema incluye un sistema de notificaciones por email para:

- Nuevos contenidos publicados
- Evaluaciones próximas
- Recordatorios personalizados

Los usuarios pueden configurar sus preferencias de notificación en `/api/auth/notifications/config`.

## Validación

Todos los endpoints incluyen validación de datos usando express-validator:

- Validación de tipos de datos
- Validación de formatos (email, fechas, etc.)
- Validación de rangos y límites
- Validación de campos requeridos

## Seguridad

- **Helmet**: Headers de seguridad
- **Rate Limiting**: Límite de requests por IP
- **CORS**: Configuración de CORS para desarrollo y producción
- **BCrypt**: Encriptación de contraseñas
- **JWT**: Tokens seguros con expiración

## Scripts Disponibles

```bash
npm start          # Iniciar servidor en producción
npm run dev        # Iniciar servidor en desarrollo con nodemon
npm test           # Ejecutar tests (pendiente de implementar)
```

## Configuración de Email

Para habilitar las notificaciones por email, configura las variables de entorno:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_de_aplicacion
EMAIL_FROM=tu_email@gmail.com
```

**Nota**: Para Gmail, necesitas usar una "Contraseña de aplicación" en lugar de tu contraseña normal.

## Desarrollo

### Estructura de la Base de Datos

La base de datos se inicializa automáticamente con datos de ejemplo:

- 3 materias de ejemplo (Matemática I, Programación I, Física I)
- 3 profesores de ejemplo (Juan Pérez, María González, Carlos López)

### Logs

El servidor incluye logging básico que muestra:
- Timestamp de cada request
- Método HTTP y ruta
- Errores del servidor

### Manejo de Errores

Todos los endpoints incluyen manejo de errores consistente:
- Errores de validación (400)
- Errores de autenticación (401, 403)
- Errores de recursos no encontrados (404)
- Errores internos del servidor (500)

## Producción

Para desplegar en producción:

1. Configurar `NODE_ENV=production`
2. Configurar un JWT_SECRET seguro
3. Configurar las variables de email
4. Configurar CORS para tu dominio
5. Usar un proceso manager como PM2
6. Configurar un proxy reverso (nginx)

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## Licencia

MIT License