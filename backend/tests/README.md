# Tests del Backend

Este directorio contiene la suite completa de tests para el backend de TUPAD Organizador Académico.

## 📁 Estructura de Tests

```
tests/
├── setup.js                    # Configuración global de tests
├── helpers/
│   └── testUtils.js           # Utilidades y helpers para tests
├── routes/
│   ├── auth.test.js           # Tests de autenticación
│   ├── horarios.test.js       # Tests de horarios
│   ├── profesores.test.js     # Tests de profesores
│   ├── materias.test.js       # Tests de materias
│   ├── contenidos.test.js     # Tests de contenidos
│   └── evaluaciones.test.js   # Tests de evaluaciones
└── README.md                  # Esta documentación
```

## 🚀 Ejecutar Tests

### Comandos Disponibles

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch (desarrollo)
npm run test:watch

# Ejecutar tests con cobertura
npm run test:coverage

# Ejecutar tests con salida verbose
npm run test:verbose
```

### Ejecutar Tests Específicos

```bash
# Ejecutar tests de un archivo específico
npm test -- auth.test.js

# Ejecutar tests de un directorio específico
npm test -- routes/

# Ejecutar tests que coincidan con un patrón
npm test -- --testNamePattern="debería crear"
```

## 🧪 Tipos de Tests

### 1. Tests de Autenticación (`auth.test.js`)
- ✅ Registro de usuarios
- ✅ Login y logout
- ✅ Gestión de perfiles
- ✅ Cambio de contraseñas
- ✅ Configuración de notificaciones
- ✅ Control de acceso por roles

### 2. Tests de Horarios (`horarios.test.js`)
- ✅ Obtener horarios con filtros
- ✅ Crear, actualizar y eliminar horarios
- ✅ Validación de conflictos de horarios
- ✅ Filtros por día, materia y profesor
- ✅ Control de acceso por roles

### 3. Tests de Profesores (`profesores.test.js`)
- ✅ CRUD completo de profesores
- ✅ Búsqueda y filtros
- ✅ Validación de emails únicos
- ✅ Relaciones con materias y horarios
- ✅ Control de acceso por roles

### 4. Tests de Materias (`materias.test.js`)
- ✅ CRUD completo de materias
- ✅ Validación de códigos únicos
- ✅ Relaciones con horarios y contenidos
- ✅ Cronogramas y evaluaciones
- ✅ Control de acceso por roles

### 5. Tests de Contenidos (`contenidos.test.js`)
- ✅ CRUD completo de contenidos
- ✅ Organización por semanas
- ✅ Filtros por materia y tipo
- ✅ Estadísticas de contenidos
- ✅ Control de acceso por roles

### 6. Tests de Evaluaciones (`evaluaciones.test.js`)
- ✅ CRUD completo de evaluaciones
- ✅ Gestión de notas
- ✅ Evaluaciones próximas
- ✅ Estadísticas de rendimiento
- ✅ Control de acceso por roles

## 🔧 Configuración

### Base de Datos de Tests
- **Tipo**: SQLite en memoria (`:memory:`)
- **Ventajas**:
  - Tests más rápidos
  - Aislamiento completo entre tests
  - No requiere archivos de base de datos

### Variables de Entorno
Los tests usan configuraciones específicas:
- `NODE_ENV=test`
- `DB_PATH=:memory:`
- `JWT_SECRET=test-secret-key`
- `BCRYPT_ROUNDS=4` (menos rondas para tests más rápidos)

### Usuarios de Prueba
Se crean automáticamente usuarios con diferentes roles:
- **Admin**: `admin@test.com`
- **Profesor**: `profesor@test.com`
- **Estudiante**: `estudiante@test.com`

## 📊 Cobertura de Tests

### Endpoints Cubiertos
- ✅ **Auth**: 100% de endpoints
- ✅ **Horarios**: 100% de endpoints
- ✅ **Profesores**: 100% de endpoints
- ✅ **Materias**: 100% de endpoints
- ✅ **Contenidos**: 100% de endpoints
- ✅ **Evaluaciones**: 100% de endpoints

### Casos de Prueba
- ✅ **Casos exitosos**: Todas las operaciones válidas
- ✅ **Casos de error**: Validaciones y errores
- ✅ **Autenticación**: Tokens válidos e inválidos
- ✅ **Autorización**: Control de acceso por roles
- ✅ **Validación**: Datos inválidos y faltantes
- ✅ **Relaciones**: Integridad referencial

## 🛠️ Utilidades de Test

### `testUtils.js`
Contiene funciones helper para tests:

```javascript
// Crear usuarios de prueba
const adminUser = await createTestUser(testUsers.admin);

// Generar tokens JWT
const token = generateToken(adminUser);

// Limpiar base de datos
await clearDatabase();

// Crear datos de prueba
await createTestData();

// Validar respuestas
expectSuccess(response, 200);
expectError(response, 400, 'Mensaje de error');
```

### Funciones de Validación
- `expectSuccess(response, statusCode)`: Valida respuestas exitosas
- `expectError(response, statusCode, message)`: Valida respuestas de error
- `makeRequest(app, method, url, data, token)`: Hacer requests HTTP

## 🔍 Debugging de Tests

### Logs Detallados
```bash
# Ejecutar con logs detallados
npm run test:verbose
```

### Tests Específicos
```bash
# Ejecutar solo un test
npm test -- --testNamePattern="debería crear un nuevo usuario"
```

### Cobertura de Código
```bash
# Ver cobertura detallada
npm run test:coverage
```

## 📝 Escribir Nuevos Tests

### Estructura de un Test
```javascript
describe('Nuevo Endpoint', () => {
  it('debería hacer algo específico', async () => {
    // Arrange
    const token = generateToken(adminUser);
    const data = { /* datos de prueba */ };

    // Act
    const response = await request(app)
      .post('/api/endpoint')
      .set('Authorization', `Bearer ${token}`)
      .send(data);

    // Assert
    expectSuccess(response, 201);
    expect(response.body).toHaveProperty('id');
  });
});
```

### Convenciones de Nomenclatura
- **Describe**: `describe('Endpoint Name', () => {})`
- **Tests**: `it('debería hacer algo específico', async () => {})`
- **Variables**: `camelCase` para variables de prueba
- **Mensajes**: En español, descriptivos

### Casos a Cubrir
1. **Caso exitoso**: Operación válida
2. **Autenticación**: Sin token, token inválido
3. **Autorización**: Permisos insuficientes
4. **Validación**: Datos inválidos
5. **Errores**: Recursos no encontrados
6. **Relaciones**: Integridad referencial

## 🚨 Troubleshooting

### Problemas Comunes

#### 1. Tests Fallan por Base de Datos
```bash
# Limpiar y reinstalar
rm -rf node_modules
npm install
```

#### 2. Tests Lentos
- Verificar que se usa `:memory:` para la base de datos
- Reducir `BCRYPT_ROUNDS` en tests
- Usar `beforeEach` para limpiar datos

#### 3. Tests Intermitentes
- Asegurar aislamiento entre tests
- Usar `clearDatabase()` en `beforeEach`
- Verificar que no hay estado compartido

#### 4. Problemas de Timeout
```bash
# Aumentar timeout para tests específicos
jest.setTimeout(10000);
```

## 📈 Métricas de Calidad

### Cobertura Objetivo
- **Líneas de código**: >90%
- **Funciones**: >95%
- **Branches**: >85%

### Performance
- **Tiempo total**: <30 segundos
- **Tests individuales**: <2 segundos
- **Memoria**: <100MB

### Mantenibilidad
- **Tests por endpoint**: 5-10 tests
- **Reutilización**: Usar helpers comunes
- **Legibilidad**: Tests descriptivos en español

## 🔄 CI/CD

### Integración Continua
Los tests se ejecutan automáticamente en:
- **Push a main**: Tests completos
- **Pull Request**: Tests + cobertura
- **Deploy**: Tests de integración

### Pipeline de Tests
```yaml
# Ejemplo de pipeline
- npm install
- npm run test:coverage
- npm run test:verbose
- Generar reporte de cobertura
```

## 📚 Recursos Adicionales

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Express Testing Guide](https://expressjs.com/en/advanced/best-practices-performance.html#testing)