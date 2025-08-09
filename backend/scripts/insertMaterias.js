const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../database/academic_organizer.db');

console.log('📚 Insertando materias del Excel...');

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

async function insertMaterias() {
    try {
        // Materias del Excel
        const materias = [
            ['PROG2', 'Programación 2', 'Programación orientada a objetos y estructuras de datos'],
            ['BBDD1', 'Bases de Datos 1', 'Fundamentos de bases de datos relacionales'],
            ['PROBA', 'Probabilidad y Estadística', 'Estadística descriptiva e inferencial'],
            ['INGLES', 'Inglés', 'Inglés técnico para informática']
        ];

        console.log('📚 Insertando materias del Excel...');

        for (const materia of materias) {
            await runQuery(
                'INSERT OR IGNORE INTO materias (codigo, nombre, descripcion) VALUES (?, ?, ?)',
                materia
            );
            console.log(`   ✅ ${materia[0]}: ${materia[1]}`);
        }

        // Crear comisiones para cada materia
        console.log('\n📖 Creando comisiones...');
        const materiasInsertadas = await getQuery("SELECT id, codigo FROM materias WHERE codigo IN ('PROG2', 'BBDD1', 'PROBA', 'INGLES')");

        for (const materia of materiasInsertadas) {
            await runQuery(
                'INSERT OR IGNORE INTO comisiones (materia_id, nombre, capacidad) VALUES (?, ?, ?)',
                [materia.id, 'Comisión A', 30]
            );
            console.log(`   ✅ Comisión A creada para ${materia.codigo}`);
        }

        // Verificar resultado
        console.log('\n📊 VERIFICACIÓN FINAL:');
        console.log('======================');

        const materiasFinal = await getQuery("SELECT codigo, nombre FROM materias ORDER BY codigo");
        const comisionesFinal = await getQuery("SELECT COUNT(*) as count FROM comisiones");

        console.log('📚 Materias en la base de datos:');
        materiasFinal.forEach(m => console.log(`   ${m.codigo}: ${m.nombre}`));
        console.log(`📖 Total comisiones: ${comisionesFinal[0].count}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        db.close();
        console.log('\n✅ Proceso completado');
    }
}

insertMaterias();