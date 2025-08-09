const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || './database/academic_organizer.db';

// Asegurar que el directorio de la base de datos existe
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH);

function initializeDatabase() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Tabla de usuarios
            db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          nombre TEXT NOT NULL,
          apellido TEXT NOT NULL,
          rol TEXT DEFAULT 'estudiante',
          activo BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

            // Tabla de profesores
            db.run(`
        CREATE TABLE IF NOT EXISTS profesores (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL,
          apellido TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          tipo TEXT DEFAULT 'profesor', -- 'profesor' o 'asistente'
          telefono TEXT,
          activo BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

            // Tabla de materias
            db.run(`
        CREATE TABLE IF NOT EXISTS materias (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL,
          codigo TEXT UNIQUE NOT NULL,
          descripcion TEXT,
          creditos INTEGER DEFAULT 0,
          activo BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

            // Tabla de comisiones
            db.run(`
        CREATE TABLE IF NOT EXISTS comisiones (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          materia_id INTEGER NOT NULL,
          nombre TEXT NOT NULL,
          capacidad INTEGER DEFAULT 0,
          activo BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (materia_id) REFERENCES materias (id)
        )
      `);

            // Tabla de horarios
            db.run(`
        CREATE TABLE IF NOT EXISTS horarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          materia_id INTEGER NOT NULL,
          comision_id INTEGER NOT NULL,
          profesor_id INTEGER NOT NULL,
          dia_semana INTEGER NOT NULL, -- 1=Lunes, 2=Martes, ..., 7=Domingo
          hora_inicio TEXT NOT NULL, -- formato HH:MM
          hora_fin TEXT NOT NULL, -- formato HH:MM
          tipo_clase TEXT DEFAULT 'teorica', -- 'teorica', 'practica', 'laboratorio'
          link_reunion TEXT,
          tipo_reunion TEXT, -- 'meet', 'teams', 'otro'
          link_grabacion TEXT,
          activo BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (materia_id) REFERENCES materias (id),
          FOREIGN KEY (comision_id) REFERENCES comisiones (id),
          FOREIGN KEY (profesor_id) REFERENCES profesores (id)
        )
      `);

            // Tabla de contenidos
            db.run(`
        CREATE TABLE IF NOT EXISTS contenidos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          materia_id INTEGER NOT NULL,
          titulo TEXT NOT NULL,
          descripcion TEXT,
          semana INTEGER NOT NULL,
          orden INTEGER DEFAULT 0,
          tipo_contenido TEXT DEFAULT 'teoria', -- 'teoria', 'practica', 'laboratorio', 'evaluacion'
          link_contenido TEXT,
          archivo_adjunto TEXT,
          activo BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (materia_id) REFERENCES materias (id)
        )
      `);

            // Tabla de evaluaciones
            db.run(`
        CREATE TABLE IF NOT EXISTS evaluaciones (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          materia_id INTEGER NOT NULL,
          titulo TEXT NOT NULL,
          descripcion TEXT,
          tipo_evaluacion TEXT DEFAULT 'parcial', -- 'parcial', 'final', 'trabajo_practico', 'laboratorio'
          fecha_evaluacion DATE NOT NULL,
          hora_inicio TEXT, -- formato HH:MM
          hora_fin TEXT, -- formato HH:MM
          peso DECIMAL(3,2) DEFAULT 1.00,
          link_evaluacion TEXT,
          activo BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (materia_id) REFERENCES materias (id)
        )
      `);

            // Tabla de notas
            db.run(`
        CREATE TABLE IF NOT EXISTS notas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          usuario_id INTEGER NOT NULL,
          evaluacion_id INTEGER NOT NULL,
          nota DECIMAL(4,2),
          comentarios TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
          FOREIGN KEY (evaluacion_id) REFERENCES evaluaciones (id)
        )
      `);

            // Tabla de notificaciones
            db.run(`
        CREATE TABLE IF NOT EXISTS notificaciones (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          usuario_id INTEGER NOT NULL,
          tipo TEXT NOT NULL, -- 'contenido', 'evaluacion', 'recordatorio'
          titulo TEXT NOT NULL,
          mensaje TEXT NOT NULL,
          leida BOOLEAN DEFAULT 0,
          enviada_email BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        )
      `);

            // Tabla de configuración de notificaciones por usuario
            db.run(`
        CREATE TABLE IF NOT EXISTS configuracion_notificaciones (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          usuario_id INTEGER NOT NULL,
          notificar_contenidos BOOLEAN DEFAULT 1,
          notificar_evaluaciones BOOLEAN DEFAULT 1,
          notificar_recordatorios BOOLEAN DEFAULT 1,
          frecuencia_email TEXT DEFAULT 'diaria', -- 'inmediata', 'diaria', 'semanal'
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        )
      `);

            // Crear índices para mejorar el rendimiento
            db.run('CREATE INDEX IF NOT EXISTS idx_horarios_dia_hora ON horarios(dia_semana, hora_inicio)');
            db.run('CREATE INDEX IF NOT EXISTS idx_horarios_materia ON horarios(materia_id)');
            db.run('CREATE INDEX IF NOT EXISTS idx_horarios_profesor ON horarios(profesor_id)');
            db.run('CREATE INDEX IF NOT EXISTS idx_contenidos_materia_semana ON contenidos(materia_id, semana)');
            db.run('CREATE INDEX IF NOT EXISTS idx_evaluaciones_fecha ON evaluaciones(fecha_evaluacion)');
            db.run('CREATE INDEX IF NOT EXISTS idx_notas_usuario ON notas(usuario_id)');

            // Insertar datos de ejemplo si la base está vacía
            db.get("SELECT COUNT(*) as count FROM materias", (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (row.count === 0) {
                    insertSampleData();
                }

                resolve();
            });
        });
    });
}

function insertSampleData() {
    // Insertar materias de ejemplo
    const materias = [
        { nombre: 'Matemática I', codigo: 'MAT101', descripcion: 'Fundamentos de matemática', creditos: 6 },
        { nombre: 'Programación I', codigo: 'PROG101', descripcion: 'Introducción a la programación', creditos: 6 },
        { nombre: 'Física I', codigo: 'FIS101', descripcion: 'Fundamentos de física', creditos: 6 }
    ];

    materias.forEach(materia => {
        db.run(
            'INSERT INTO materias (nombre, codigo, descripcion, creditos) VALUES (?, ?, ?, ?)',
            [materia.nombre, materia.codigo, materia.descripcion, materia.creditos]
        );
    });

    // Insertar profesores de ejemplo
    const profesores = [
        { nombre: 'Juan', apellido: 'Pérez', email: 'juan.perez@tupad.edu.ar', tipo: 'profesor' },
        { nombre: 'María', apellido: 'González', email: 'maria.gonzalez@tupad.edu.ar', tipo: 'profesor' },
        { nombre: 'Carlos', apellido: 'López', email: 'carlos.lopez@tupad.edu.ar', tipo: 'asistente' }
    ];

    profesores.forEach(profesor => {
        db.run(
            'INSERT INTO profesores (nombre, apellido, email, tipo) VALUES (?, ?, ?, ?)',
            [profesor.nombre, profesor.apellido, profesor.email, profesor.tipo]
        );
    });

    // Insertar comisiones de ejemplo después de que se inserten las materias
    setTimeout(() => {
        // Comisiones para Matemática I
        db.run('INSERT INTO comisiones (materia_id, nombre, capacidad) VALUES (1, "Comisión A", 30)');
        db.run('INSERT INTO comisiones (materia_id, nombre, capacidad) VALUES (1, "Comisión B", 30)');

        // Comisiones para Programación I
        db.run('INSERT INTO comisiones (materia_id, nombre, capacidad) VALUES (2, "Comisión A", 25)');
        db.run('INSERT INTO comisiones (materia_id, nombre, capacidad) VALUES (2, "Comisión B", 25)');

        // Comisiones para Física I
        db.run('INSERT INTO comisiones (materia_id, nombre, capacidad) VALUES (3, "Comisión A", 35)');
        db.run('INSERT INTO comisiones (materia_id, nombre, capacidad) VALUES (3, "Comisión B", 35)');

        // Insertar algunos horarios de ejemplo
        setTimeout(() => {
            // Horarios para Matemática I - Comisión A
            db.run(`
        INSERT INTO horarios (materia_id, comision_id, profesor_id, dia_semana, hora_inicio, hora_fin, tipo_clase)
        VALUES (1, 1, 1, 1, '08:00', '10:00', 'teorica')
      `);

            db.run(`
        INSERT INTO horarios (materia_id, comision_id, profesor_id, dia_semana, hora_inicio, hora_fin, tipo_clase)
        VALUES (1, 1, 1, 3, '10:00', '12:00', 'practica')
      `);

            // Horarios para Programación I - Comisión A
            db.run(`
        INSERT INTO horarios (materia_id, comision_id, profesor_id, dia_semana, hora_inicio, hora_fin, tipo_clase)
        VALUES (2, 3, 2, 2, '14:00', '16:00', 'teorica')
      `);

            db.run(`
        INSERT INTO horarios (materia_id, comision_id, profesor_id, dia_semana, hora_inicio, hora_fin, tipo_clase)
        VALUES (2, 3, 2, 4, '16:00', '18:00', 'laboratorio')
      `);

            // Horarios para Física I - Comisión A
            db.run(`
        INSERT INTO horarios (materia_id, comision_id, profesor_id, dia_semana, hora_inicio, hora_fin, tipo_clase)
        VALUES (3, 5, 3, 5, '09:00', '11:00', 'teorica')
      `);

            db.run(`
        INSERT INTO horarios (materia_id, comision_id, profesor_id, dia_semana, hora_inicio, hora_fin, tipo_clase)
        VALUES (3, 5, 3, 6, '11:00', '13:00', 'practica')
      `);

            // Insertar algunos contenidos de ejemplo
            setTimeout(() => {
                // Contenidos para Matemática I
                db.run(`
          INSERT INTO contenidos (materia_id, titulo, descripcion, semana, tipo_contenido)
          VALUES (1, 'Introducción a los números reales', 'Conceptos básicos de números reales y sus propiedades', 1, 'teoria')
        `);

                db.run(`
          INSERT INTO contenidos (materia_id, titulo, descripcion, semana, tipo_contenido)
          VALUES (1, 'Operaciones con números reales', 'Suma, resta, multiplicación y división', 2, 'teoria')
        `);

                // Contenidos para Programación I
                db.run(`
          INSERT INTO contenidos (materia_id, titulo, descripcion, semana, tipo_contenido)
          VALUES (2, 'Introducción a la programación', 'Conceptos básicos de programación y algoritmos', 1, 'teoria')
        `);

                db.run(`
          INSERT INTO contenidos (materia_id, titulo, descripcion, semana, tipo_contenido)
          VALUES (2, 'Variables y tipos de datos', 'Tipos de datos básicos y declaración de variables', 2, 'teoria')
        `);

                // Contenidos para Física I
                db.run(`
          INSERT INTO contenidos (materia_id, titulo, descripcion, semana, tipo_contenido)
          VALUES (3, 'Introducción a la física', 'Conceptos fundamentales de la física', 1, 'teoria')
        `);

                db.run(`
          INSERT INTO contenidos (materia_id, titulo, descripcion, semana, tipo_contenido)
          VALUES (3, 'Medición y unidades', 'Sistema internacional de unidades', 2, 'teoria')
        `);

                // Insertar algunas evaluaciones de ejemplo
                setTimeout(() => {
                    // Evaluaciones para Matemática I
                    db.run(`
            INSERT INTO evaluaciones (materia_id, titulo, descripcion, tipo_evaluacion, fecha_evaluacion, peso)
            VALUES (1, 'Primer Parcial', 'Evaluación de números reales y operaciones básicas', 'parcial', '2024-04-15', 0.3)
          `);

                    db.run(`
            INSERT INTO evaluaciones (materia_id, titulo, descripcion, tipo_evaluacion, fecha_evaluacion, peso)
            VALUES (1, 'Examen Final', 'Evaluación integral de la materia', 'final', '2024-07-20', 0.7)
          `);

                    // Evaluaciones para Programación I
                    db.run(`
            INSERT INTO evaluaciones (materia_id, titulo, descripcion, tipo_evaluacion, fecha_evaluacion, peso)
            VALUES (2, 'Primer Parcial', 'Evaluación de conceptos básicos de programación', 'parcial', '2024-04-20', 0.3)
          `);

                    db.run(`
            INSERT INTO evaluaciones (materia_id, titulo, descripcion, tipo_evaluacion, fecha_evaluacion, peso)
            VALUES (2, 'Proyecto Final', 'Desarrollo de una aplicación completa', 'trabajo_practico', '2024-07-25', 0.7)
          `);

                    // Evaluaciones para Física I
                    db.run(`
            INSERT INTO evaluaciones (materia_id, titulo, descripcion, tipo_evaluacion, fecha_evaluacion, peso)
            VALUES (3, 'Primer Parcial', 'Evaluación de conceptos fundamentales de física', 'parcial', '2024-04-25', 0.3)
          `);

                    db.run(`
            INSERT INTO evaluaciones (materia_id, titulo, descripcion, tipo_evaluacion, fecha_evaluacion, peso)
            VALUES (3, 'Examen Final', 'Evaluación integral de la materia', 'final', '2024-07-30', 0.7)
          `);

                }, 100);
            }, 100);
        }, 100);
    }, 100);
}

function closeDatabase() {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

module.exports = {
    db,
    initializeDatabase,
    closeDatabase
};