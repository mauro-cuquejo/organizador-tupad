const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../database/academic_organizer.db');

console.log('🔍 Verificando datos insertados...');

const db = new sqlite3.Database(DB_PATH);

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

async function verifyData() {
    try {
        console.log('\n📊 ESTADO ACTUAL DE LA BASE DE DATOS:');
        console.log('=====================================');

        // Contar registros
        const materias = await getQuery("SELECT COUNT(*) as count FROM materias");
        const profesores = await getQuery("SELECT COUNT(*) as count FROM profesores");
        const comisiones = await getQuery("SELECT COUNT(*) as count FROM comisiones");
        const horarios = await getQuery("SELECT COUNT(*) as count FROM horarios");

        console.log(`📚 Materias: ${materias[0].count}`);
        console.log(`👨‍🏫 Profesores: ${profesores[0].count}`);
        console.log(`📖 Comisiones: ${comisiones[0].count}`);
        console.log(`🕐 Horarios: ${horarios[0].count}`);

        // Mostrar materias
        console.log('\n📚 MATERIAS:');
        console.log('============');
        const materiasList = await getQuery("SELECT id, codigo, nombre FROM materias ORDER BY codigo");
        materiasList.forEach(m => console.log(`   ${m.codigo}: ${m.nombre}`));

        // Mostrar profesores
        console.log('\n👨‍🏫 PROFESORES:');
        console.log('===============');
        const profesoresList = await getQuery("SELECT id, nombre, apellido, email, tipo FROM profesores ORDER BY nombre");
        profesoresList.forEach(p => console.log(`   ${p.nombre} ${p.apellido} (${p.tipo}) - ${p.email}`));

        // Mostrar horarios
        console.log('\n📅 HORARIOS COMPLETOS:');
        console.log('======================');
        const horariosList = await getQuery(`
            SELECT
                m.codigo as materia_codigo,
                m.nombre as materia_nombre,
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

        horariosList.forEach(h => {
            console.log(`   📅 ${diasSemana[h.dia_semana]} ${h.hora_inicio}-${h.hora_fin} | ${h.materia_codigo} (${h.comision}) | ${h.profesor} | ${h.tipo_clase}`);
        });

        // Verificar que todos los datos del Excel estén presentes
        console.log('\n✅ VERIFICACIÓN DE DATOS DEL EXCEL:');
        console.log('===================================');

        const materiasEsperadas = ['PROG2', 'BBDD1', 'PROBA', 'INGLES'];
        const profesoresEsperados = ['Juan Pérez', 'María González', 'Carlos López', 'Ana Martínez'];

        const materiasCodigos = materiasList.map(m => m.codigo);
        const profesoresNombres = profesoresList.map(p => `${p.nombre} ${p.apellido}`);

        console.log('📚 Materias esperadas vs encontradas:');
        materiasEsperadas.forEach(codigo => {
            const encontrada = materiasCodigos.includes(codigo);
            console.log(`   ${codigo}: ${encontrada ? '✅' : '❌'}`);
        });

        console.log('\n👨‍🏫 Profesores esperados vs encontrados:');
        profesoresEsperados.forEach(nombre => {
            const encontrado = profesoresNombres.includes(nombre);
            console.log(`   ${nombre}: ${encontrado ? '✅' : '❌'}`);
        });

        console.log(`\n🕐 Horarios insertados: ${horariosList.length} (esperados: 7)`);

        if (horariosList.length === 7) {
            console.log('✅ Todos los horarios del Excel han sido insertados correctamente');
        } else {
            console.log('❌ Faltan algunos horarios del Excel');
        }

    } catch (error) {
        console.error('❌ Error al verificar datos:', error);
    } finally {
        db.close();
        console.log('\n✅ Verificación completada');
    }
}

verifyData();