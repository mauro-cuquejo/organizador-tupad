const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../database/academic_organizer.db');

/**
 * Script para insertar datos desde el cronograma Excel
 * Basado en el archivo insert_from_excel.sql
 */

async function insertExcelData() {
    console.log('🚀 Iniciando inserción de datos del Excel...');

    const db = new sqlite3.Database(DB_PATH);

    try {
        // Verificar que las materias existan
        console.log('📋 Verificando materias existentes...');
        const materias = await query(db, "SELECT id, nombre, codigo FROM materias");
        console.log('✅ Materias encontradas:', materias);

        // Insertar profesores del Excel
        console.log('👨‍🏫 Insertando profesores...');
        const profesores = [
            { nombre: 'Juan', apellido: 'Pérez', email: 'juan.perez@tupad.edu.ar', tipo: 'profesor', telefono: 'sin información' },
            { nombre: 'María', apellido: 'González', email: 'maria.gonzalez@tupad.edu.ar', tipo: 'profesor', telefono: 'sin información' },
            { nombre: 'Carlos', apellido: 'López', email: 'carlos.lopez@tupad.edu.ar', tipo: 'asistente', telefono: 'sin información' },
            { nombre: 'Ana', apellido: 'Martínez', email: 'ana.martinez@tupad.edu.ar', tipo: 'profesor', telefono: 'sin información' }
        ];

        for (const profesor of profesores) {
            await run(db,
                'INSERT OR IGNORE INTO profesores (nombre, apellido, email, tipo, telefono) VALUES (?, ?, ?, ?, ?)',
                [profesor.nombre, profesor.apellido, profesor.email, profesor.tipo, profesor.telefono]
            );
        }
        console.log('✅ Profesores insertados');

        // Verificar comisiones
        console.log('📚 Verificando comisiones...');
        const comisiones = await query(db, "SELECT id, materia_id, nombre FROM comisiones");
        console.log('✅ Comisiones encontradas:', comisiones);

        // Insertar horarios del Excel
        console.log('🕐 Insertando horarios...');

        const horarios = [
            // Programación 2 - Comisión A - Teoría (Lunes 08:00-10:00)
            {
                materia_codigo: 'PROG2',
                comision_nombre: 'Comisión A',
                profesor_nombre: 'Juan',
                profesor_apellido: 'Pérez',
                dia_semana: 1,
                hora_inicio: '08:00',
                hora_fin: '10:00',
                tipo_clase: 'teorica',
                link_reunion: 'sin información',
                tipo_reunion: 'sin información'
            },
            // Programación 2 - Comisión A - Práctica (Miércoles 10:00-12:00)
            {
                materia_codigo: 'PROG2',
                comision_nombre: 'Comisión A',
                profesor_nombre: 'Juan',
                profesor_apellido: 'Pérez',
                dia_semana: 3,
                hora_inicio: '10:00',
                hora_fin: '12:00',
                tipo_clase: 'practica',
                link_reunion: 'sin información',
                tipo_reunion: 'sin información'
            },
            // Bases de Datos 1 - Comisión A - Teoría (Martes 14:00-16:00)
            {
                materia_codigo: 'BBDD1',
                comision_nombre: 'Comisión A',
                profesor_nombre: 'María',
                profesor_apellido: 'González',
                dia_semana: 2,
                hora_inicio: '14:00',
                hora_fin: '16:00',
                tipo_clase: 'teorica',
                link_reunion: 'sin información',
                tipo_reunion: 'sin información'
            },
            // Bases de Datos 1 - Comisión A - Laboratorio (Jueves 16:00-18:00)
            {
                materia_codigo: 'BBDD1',
                comision_nombre: 'Comisión A',
                profesor_nombre: 'María',
                profesor_apellido: 'González',
                dia_semana: 4,
                hora_inicio: '16:00',
                hora_fin: '18:00',
                tipo_clase: 'laboratorio',
                link_reunion: 'sin información',
                tipo_reunion: 'sin información'
            },
            // Probabilidad y Estadística - Comisión A - Teoría (Viernes 09:00-11:00)
            {
                materia_codigo: 'PROBA',
                comision_nombre: 'Comisión A',
                profesor_nombre: 'Carlos',
                profesor_apellido: 'López',
                dia_semana: 5,
                hora_inicio: '09:00',
                hora_fin: '11:00',
                tipo_clase: 'teorica',
                link_reunion: 'sin información',
                tipo_reunion: 'sin información'
            },
            // Probabilidad y Estadística - Comisión A - Práctica (Sábado 11:00-13:00)
            {
                materia_codigo: 'PROBA',
                comision_nombre: 'Comisión A',
                profesor_nombre: 'Carlos',
                profesor_apellido: 'López',
                dia_semana: 6,
                hora_inicio: '11:00',
                hora_fin: '13:00',
                tipo_clase: 'practica',
                link_reunion: 'sin información',
                tipo_reunion: 'sin información'
            },
            // Inglés - Comisión A - Teoría (Lunes 14:00-16:00)
            {
                materia_codigo: 'INGLES',
                comision_nombre: 'Comisión A',
                profesor_nombre: 'Ana',
                profesor_apellido: 'Martínez',
                dia_semana: 1,
                hora_inicio: '14:00',
                hora_fin: '16:00',
                tipo_clase: 'teorica',
                link_reunion: 'sin información',
                tipo_reunion: 'sin información'
            }
        ];

        for (const horario of horarios) {
            const result = await run(db, `
                INSERT INTO horarios (materia_id, comision_id, profesor_id, dia_semana, hora_inicio, hora_fin, tipo_clase, link_reunion, tipo_reunion)
                VALUES (
                    (SELECT id FROM materias WHERE codigo = ?),
                    (SELECT id FROM comisiones WHERE materia_id = (SELECT id FROM materias WHERE codigo = ?) AND nombre = ?),
                    (SELECT id FROM profesores WHERE nombre = ? AND apellido = ?),
                    ?, ?, ?, ?, ?, ?
                )
            `, [
                horario.materia_codigo,
                horario.materia_codigo,
                horario.comision_nombre,
                horario.profesor_nombre,
                horario.profesor_apellido,
                horario.dia_semana,
                horario.hora_inicio,
                horario.hora_fin,
                horario.tipo_clase,
                horario.link_reunion,
                horario.tipo_reunion
            ]);

            console.log(`✅ Horario insertado: ${horario.materia_codigo} - ${horario.tipo_clase} - ${horario.profesor_nombre} ${horario.profesor_apellido}`);
        }

        console.log('✅ Todos los horarios han sido insertados exitosamente');

        // Mostrar resumen
        console.log('\n📊 RESUMEN DE DATOS INSERTADOS:');
        console.log('================================');

        const totalProfesores = await query(db, "SELECT COUNT(*) as count FROM profesores");
        const totalHorarios = await query(db, "SELECT COUNT(*) as count FROM horarios");
        const totalMaterias = await query(db, "SELECT COUNT(*) as count FROM materias");
        const totalComisiones = await query(db, "SELECT COUNT(*) as count FROM comisiones");

        console.log(`👨‍🏫 Profesores: ${totalProfesores[0].count}`);
        console.log(`📚 Materias: ${totalMaterias[0].count}`);
        console.log(`📖 Comisiones: ${totalComisiones[0].count}`);
        console.log(`🕐 Horarios: ${totalHorarios[0].count}`);

        // Mostrar horarios insertados
        console.log('\n📅 HORARIOS INSERTADOS:');
        console.log('=======================');
        const horariosInsertados = await query(db, `
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
            ORDER BY h.dia_semana, h.hora_inicio
        `);

        const diasSemana = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

        horariosInsertados.forEach(h => {
            console.log(`📅 ${diasSemana[h.dia_semana]} ${h.hora_inicio}-${h.hora_fin} | ${h.materia} (${h.comision}) | ${h.profesor} | ${h.tipo_clase}`);
        });

    } catch (error) {
        console.error('❌ Error al insertar datos:', error);
    } finally {
        db.close();
        console.log('\n✅ Proceso completado');
    }
}

// Funciones auxiliares para trabajar con SQLite
function query(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function run(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, changes: this.changes });
        });
    });
}

// Ejecutar el script
insertExcelData().catch(console.error);