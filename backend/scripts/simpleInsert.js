const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../database/academic_organizer.db');

console.log('🚀 Iniciando inserción de datos del Excel...');
console.log('📁 Base de datos:', DB_PATH);

const db = new sqlite3.Database(DB_PATH);

// Función para ejecutar consultas
function runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                console.error('❌ Error:', err.message);
                reject(err);
            } else {
                console.log(`✅ Ejecutado: ${sql.substring(0, 50)}...`);
                resolve({ id: this.lastID, changes: this.changes });
            }
        });
    });
}

// Función para consultar datos
function getQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('❌ Error:', err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

async function insertData() {
    try {
        // 1. Verificar materias existentes
        console.log('\n📋 Verificando materias...');
        const materias = await getQuery("SELECT id, nombre, codigo FROM materias");
        console.log('✅ Materias encontradas:', materias.length);
        materias.forEach(m => console.log(`   - ${m.codigo}: ${m.nombre}`));

        // 2. Insertar profesores
        console.log('\n👨‍🏫 Insertando profesores...');
        const profesores = [
            ['Juan', 'Pérez', 'juan.perez@tupad.edu.ar', 'profesor', 'sin información'],
            ['María', 'González', 'maria.gonzalez@tupad.edu.ar', 'profesor', 'sin información'],
            ['Carlos', 'López', 'carlos.lopez@tupad.edu.ar', 'asistente', 'sin información'],
            ['Ana', 'Martínez', 'ana.martinez@tupad.edu.ar', 'profesor', 'sin información']
        ];

        for (const prof of profesores) {
            await runQuery(
                'INSERT OR IGNORE INTO profesores (nombre, apellido, email, tipo, telefono) VALUES (?, ?, ?, ?, ?)',
                prof
            );
        }

        // 3. Verificar comisiones
        console.log('\n📚 Verificando comisiones...');
        const comisiones = await getQuery("SELECT id, materia_id, nombre FROM comisiones");
        console.log('✅ Comisiones encontradas:', comisiones.length);

        // 4. Insertar horarios
        console.log('\n🕐 Insertando horarios...');

        const horarios = [
            // PROG2 - Lunes 08:00-10:00 - Teoría
            ['PROG2', 'PROG2', 'Comisión A', 'Juan', 'Pérez', 1, '08:00', '10:00', 'teorica'],
            // PROG2 - Miércoles 10:00-12:00 - Práctica
            ['PROG2', 'PROG2', 'Comisión A', 'Juan', 'Pérez', 3, '10:00', '12:00', 'practica'],
            // BBDD1 - Martes 14:00-16:00 - Teoría
            ['BBDD1', 'BBDD1', 'Comisión A', 'María', 'González', 2, '14:00', '16:00', 'teorica'],
            // BBDD1 - Jueves 16:00-18:00 - Laboratorio
            ['BBDD1', 'BBDD1', 'Comisión A', 'María', 'González', 4, '16:00', '18:00', 'laboratorio'],
            // PROBA - Viernes 09:00-11:00 - Teoría
            ['PROBA', 'PROBA', 'Comisión A', 'Carlos', 'López', 5, '09:00', '11:00', 'teorica'],
            // PROBA - Sábado 11:00-13:00 - Práctica
            ['PROBA', 'PROBA', 'Comisión A', 'Carlos', 'López', 6, '11:00', '13:00', 'practica'],
            // INGLES - Lunes 14:00-16:00 - Teoría
            ['INGLES', 'INGLES', 'Comisión A', 'Ana', 'Martínez', 1, '14:00', '16:00', 'teorica']
        ];

        for (const horario of horarios) {
            const sql = `
                INSERT INTO horarios (materia_id, comision_id, profesor_id, dia_semana, hora_inicio, hora_fin, tipo_clase, link_reunion, tipo_reunion)
                VALUES (
                    (SELECT id FROM materias WHERE codigo = ?),
                    (SELECT id FROM comisiones WHERE materia_id = (SELECT id FROM materias WHERE codigo = ?) AND nombre = ?),
                    (SELECT id FROM profesores WHERE nombre = ? AND apellido = ?),
                    ?, ?, ?, 'sin información', 'sin información'
                )
            `;

            // Los parámetros son: [codigo_materia, codigo_materia, nombre_comision, nombre_prof, apellido_prof, dia, hora_inicio, hora_fin, tipo_clase]
            // Total: 9 parámetros para 7 columnas
            await runQuery(sql, horario);
            console.log(`   ✅ ${horario[0]} - ${horario[7]} - ${horario[2]} ${horario[3]}`);
        }

        // 5. Mostrar resumen
        console.log('\n📊 RESUMEN FINAL:');
        console.log('=================');

        const totalProfesores = await getQuery("SELECT COUNT(*) as count FROM profesores");
        const totalHorarios = await getQuery("SELECT COUNT(*) as count FROM horarios");
        const totalMaterias = await getQuery("SELECT COUNT(*) as count FROM materias");

        console.log(`👨‍🏫 Profesores: ${totalProfesores[0].count}`);
        console.log(`📚 Materias: ${totalMaterias[0].count}`);
        console.log(`🕐 Horarios: ${totalHorarios[0].count}`);

        // 6. Mostrar horarios insertados
        console.log('\n📅 HORARIOS INSERTADOS:');
        console.log('=======================');
        const horariosInsertados = await getQuery(`
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
            console.log(`📅 ${diasSemana[h.dia_semana]} ${h.hora_inicio}-${h.hora_fin} | ${h.materia} | ${h.profesor} | ${h.tipo_clase}`);
        });

    } catch (error) {
        console.error('❌ Error general:', error);
    } finally {
        db.close();
        console.log('\n✅ Proceso completado');
    }
}

// Ejecutar
insertData();