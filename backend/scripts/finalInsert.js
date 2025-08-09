const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../database/academic_organizer.db');

console.log('🚀 Inserción final de datos del Excel...');

const db = new sqlite3.Database(DB_PATH);

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

async function insertHorarios() {
    try {
        // Obtener IDs de materias, comisiones y profesores
        console.log('🔍 Obteniendo IDs...');

        const materias = await getQuery("SELECT id, codigo FROM materias WHERE codigo IN ('PROG2', 'BBDD1', 'PROBA', 'INGLES')");
        const comisiones = await getQuery("SELECT id, materia_id FROM comisiones");
        const profesores = await getQuery("SELECT id, nombre, apellido FROM profesores");

        console.log('📚 Materias encontradas:', materias.length);
        console.log('📖 Comisiones encontradas:', comisiones.length);
        console.log('👨‍🏫 Profesores encontrados:', profesores.length);

        // Crear mapeo de IDs
        const materiaMap = {};
        materias.forEach(m => materiaMap[m.codigo] = m.id);

        const comisionMap = {};
        comisiones.forEach(c => comisionMap[c.materia_id] = c.id);

        const profesorMap = {};
        profesores.forEach(p => profesorMap[`${p.nombre} ${p.apellido}`] = p.id);

        // Datos de horarios del Excel
        const horarios = [
            { materia: 'PROG2', profesor: 'Juan Pérez', dia: 1, inicio: '08:00', fin: '10:00', tipo: 'teorica' },
            { materia: 'PROG2', profesor: 'Juan Pérez', dia: 3, inicio: '10:00', fin: '12:00', tipo: 'practica' },
            { materia: 'BBDD1', profesor: 'María González', dia: 2, inicio: '14:00', fin: '16:00', tipo: 'teorica' },
            { materia: 'BBDD1', profesor: 'María González', dia: 4, inicio: '16:00', fin: '18:00', tipo: 'laboratorio' },
            { materia: 'PROBA', profesor: 'Carlos López', dia: 5, inicio: '09:00', fin: '11:00', tipo: 'teorica' },
            { materia: 'PROBA', profesor: 'Carlos López', dia: 6, inicio: '11:00', fin: '13:00', tipo: 'practica' },
            { materia: 'INGLES', profesor: 'Ana Martínez', dia: 1, inicio: '14:00', fin: '16:00', tipo: 'teorica' }
        ];

        console.log('\n🕐 Insertando horarios...');

        for (const horario of horarios) {
            const materiaId = materiaMap[horario.materia];
            const comisionId = comisionMap[materiaId];
            const profesorId = profesorMap[horario.profesor];

            if (!materiaId || !comisionId || !profesorId) {
                console.log(`❌ Error: No se encontraron IDs para ${horario.materia} - ${horario.profesor}`);
                continue;
            }

            const sql = `
                INSERT INTO horarios (materia_id, comision_id, profesor_id, dia_semana, hora_inicio, hora_fin, tipo_clase)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            await runQuery(sql, [
                materiaId,
                comisionId,
                profesorId,
                horario.dia,
                horario.inicio,
                horario.fin,
                horario.tipo
            ]);

            console.log(`   ✅ ${horario.materia} - ${horario.tipo} - ${horario.profesor}`);
        }

        // Verificar resultado
        console.log('\n📊 VERIFICACIÓN FINAL:');
        console.log('======================');

        const totalHorarios = await getQuery("SELECT COUNT(*) as count FROM horarios");
        console.log(`🕐 Total horarios: ${totalHorarios[0].count}`);

        const horariosInsertados = await getQuery(`
            SELECT
                m.codigo as materia,
                p.nombre || ' ' || p.apellido as profesor,
                h.dia_semana,
                h.hora_inicio,
                h.hora_fin,
                h.tipo_clase
            FROM horarios h
            JOIN materias m ON h.materia_id = m.id
            JOIN profesores p ON h.profesor_id = p.id
            ORDER BY h.dia_semana, h.hora_inicio
        `);

        const diasSemana = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

        console.log('\n📅 HORARIOS INSERTADOS:');
        console.log('=======================');
        horariosInsertados.forEach(h => {
            console.log(`📅 ${diasSemana[h.dia_semana]} ${h.hora_inicio}-${h.hora_fin} | ${h.materia} | ${h.profesor} | ${h.tipo_clase}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        db.close();
        console.log('\n✅ Proceso completado');
    }
}

insertHorarios();