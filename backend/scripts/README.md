# Scripts de Inserción de Datos

Este directorio contiene scripts para insertar datos del cronograma Excel en la base de datos.

## 📁 Archivos Disponibles

### 1. `insert_data.sql`
Script SQL básico con ejemplos de inserción de datos.

**Uso:**
```bash
# Ejecutar directamente en SQLite
sqlite3 database/academic_organizer.db < scripts/insert_data.sql
```

### 2. `insert_from_excel.sql`
Script SQL más específico para datos del cronograma Excel.

**Uso:**
```bash
# Ejecutar directamente en SQLite
sqlite3 database/academic_organizer.db < scripts/insert_from_excel.sql
```

### 3. `insertCronograma.js`
Script de Node.js que inserta datos de ejemplo y proporciona una estructura fácil de modificar.

**Uso:**
```bash
cd backend
node scripts/insertCronograma.js
```

### 4. `insertFromExcel.js`
Script de Node.js específico para insertar datos reales del Excel.

**Uso:**
```bash
cd backend
node scripts/insertFromExcel.js
```

## 🚀 Guía de Uso

### Paso 1: Preparar los Datos

1. **Abrir el archivo `insertFromExcel.js`**
2. **Editar `PROFESORES_DEL_EXCEL`** con los datos reales:
   ```javascript
   const PROFESORES_DEL_EXCEL = [
       { nombre: 'Juan', apellido: 'Pérez', email: 'juan.perez@tupad.edu.ar', telefono: 'sin información' },
       { nombre: 'María', apellido: 'González', email: 'maria.gonzalez@tupad.edu.ar', telefono: 'sin información' },
       // Agregar más profesores...
   ];
   ```

3. **Editar `HORARIOS_DEL_EXCEL`** con los horarios reales:
   ```javascript
   const HORARIOS_DEL_EXCEL = [
       {
           materia: 'PROG2',           // Código de la materia
           comision: 'Comisión A',     // Nombre de la comisión
           profesor: { nombre: 'Juan', apellido: 'Pérez' },
           dia: 1,                     // 1=Lunes, 2=Martes, etc.
           horaInicio: '08:00',        // Formato HH:MM
           horaFin: '10:00',           // Formato HH:MM
           tipoClase: 'teorica',       // 'teorica', 'practica', 'laboratorio'
           linkReunion: 'sin información', // URL o 'sin información'
           tipoReunion: 'sin información'  // 'meet', 'teams', 'otro', 'sin información'
       },
       // Agregar más horarios...
   ];
   ```

### Paso 2: Ejecutar el Script

```bash
cd backend
node scripts/insertFromExcel.js
```

## 📋 Códigos de Referencia

### Materias
- `PROG2` = Programación 2
- `BBDD1` = Bases de Datos 1
- `PROBA` = Probabilidad y Estadística
- `INGLES` = Inglés

### Días de la Semana
- `1` = Lunes
- `2` = Martes
- `3` = Miércoles
- `4` = Jueves
- `5` = Viernes
- `6` = Sábado
- `7` = Domingo

### Tipos de Clase
- `'teorica'` = Clase teórica
- `'practica'` = Clase práctica
- `'laboratorio'` = Laboratorio

### Tipos de Reunión
- `'meet'` = Google Meet
- `'teams'` = Microsoft Teams
- `'otro'` = Otro tipo
- `'sin información'` = Sin información disponible

## 🔧 Funciones de Utilidad

El script `insertFromExcel.js` incluye funciones de utilidad:

### `diaToNumber(dia)`
Convierte nombre del día a número:
```javascript
diaToNumber('lunes') // Retorna 1
diaToNumber('martes') // Retorna 2
```

### `tipoClaseToCode(tipo)`
Convierte tipo de clase a código:
```javascript
tipoClaseToCode('teoría') // Retorna 'teorica'
tipoClaseToCode('práctica') // Retorna 'practica'
```

### `tipoReunionToCode(tipo)`
Convierte tipo de reunión a código:
```javascript
tipoReunionToCode('google meet') // Retorna 'meet'
tipoReunionToCode('microsoft teams') // Retorna 'teams'
```

## 📝 Ejemplo Completo

```javascript
const PROFESORES_DEL_EXCEL = [
    { nombre: 'Juan', apellido: 'Pérez', email: 'juan.perez@tupad.edu.ar', telefono: 'sin información' },
    { nombre: 'María', apellido: 'González', email: 'maria.gonzalez@tupad.edu.ar', telefono: 'sin información' }
];

const HORARIOS_DEL_EXCEL = [
    {
        materia: 'PROG2',
        comision: 'Comisión A',
        profesor: { nombre: 'Juan', apellido: 'Pérez' },
        dia: 1,
        horaInicio: '08:00',
        horaFin: '10:00',
        tipoClase: 'teorica',
        linkReunion: 'https://meet.google.com/abc-defg-hij',
        tipoReunion: 'meet'
    },
    {
        materia: 'BBDD1',
        comision: 'Comisión A',
        profesor: { nombre: 'María', apellido: 'González' },
        dia: 2,
        horaInicio: '14:00',
        horaFin: '16:00',
        tipoClase: 'teorica',
        linkReunion: 'sin información',
        tipoReunion: 'sin información'
    }
];
```

## ⚠️ Notas Importantes

1. **Ejecutar primero el servidor** para que se cree la base de datos:
   ```bash
   npm run dev
   ```

2. **Verificar que las materias existan** antes de insertar horarios

3. **Los datos se insertan de forma segura** - si ya existen, no se duplican

4. **Para datos faltantes**, usar `'sin información'` como valor por defecto

5. **El script maneja errores** y continúa con el siguiente registro si hay problemas

## 🔍 Verificar Datos Insertados

Para verificar que los datos se insertaron correctamente:

```bash
# Conectar a la base de datos
sqlite3 database/academic_organizer.db

# Ver materias
SELECT * FROM materias;

# Ver profesores
SELECT * FROM profesores;

# Ver horarios
SELECT
    m.nombre as materia,
    c.nombre as comision,
    p.nombre || ' ' || p.apellido as profesor,
    h.dia_semana,
    h.hora_inicio,
    h.hora_fin,
    h.tipo_clase
FROM horarios h
JOIN materias m ON h.materia_id = m.id
JOIN comisiones c ON h.comision_id = c.id
JOIN profesores p ON h.profesor_id = p.id
ORDER BY h.dia_semana, h.hora_inicio;
```