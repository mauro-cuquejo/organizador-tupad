const { db } = require('../database/init');

// =====================================================
// CONFIGURACIÓN DE DATOS DEL EXCEL
// =====================================================

// Reemplazar estos datos con la información real del cronograma Excel
const PROFESORES_DEL_EXCEL = [
    // Ejemplo: { nombre: 'Juan', apellido: 'Pérez', email: 'juan.perez@tupad.edu.ar', telefono: 'sin información' },
    // Agregar aquí todos los profesores del cronograma
];

const HORARIOS_DEL_EXCEL = [
    // Ejemplo de estructura:
    // {
    //     materia: 'PROG2',           // Código de la materia
    //     comision: 'Comisión A',     // Nombre de la comisión
    //     profesor: { nombre: 'Juan', apellido: 'Pérez' },
    //     dia: 1,                     // 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado, 7=Domingo
    //     horaInicio: '08:00',        // Formato HH:MM
    //     horaFin: '10:00',           // Formato HH:MM
    //     tipoClase: 'teorica',       // 'teorica', 'practica', 'laboratorio'
    //     linkReunion: 'sin información', // URL de la reunión o 'sin información'
    //     tipoReunion: 'sin información'  // 'meet', 'teams', 'otro', 'sin información'
    // },

    // Agregar aquí todos los horarios del cronograma
];

// =====================================================
// FUNCIONES DE INSERCIÓN
// =====================================================

async function insertProfesoresFromExcel() {
    if (PROFESORES_DEL_EXCEL.length === 0) {
        console.log('⚠️  No hay profesores configurados. Edita PROFESORES_DEL_EXCEL en este archivo.');
        return;
    }

    console.log('👨‍🏫 Insertando profesores del Excel...');

    for (const profesor of PROFESORES_DEL_EXCEL) {
        try {
            await new Promise((resolve, reject) => {
                db.run(
                    'INSERT INTO profesores (nombre, apellido, email, tipo, telefono) VALUES (?, ?, ?, ?, ?)',
                    [profesor.nombre, profesor.apellido, profesor.email, 'profesor', profesor.telefono || 'sin información'],
                    function (err) {
                        if (err) {
                            if (err.message.includes('UNIQUE constraint failed')) {
                                console.log(`ℹ️  Profesor ya existe: ${profesor.nombre} ${profesor.apellido}`);
                            } else {
                                console.error(`❌ Error insertando profesor ${profesor.nombre} ${profesor.apellido}:`, err.message);
                            }
                            reject(err);
                        } else {
                            console.log(`✅ Profesor insertado: ${profesor.nombre} ${profesor.apellido} (ID: ${this.lastID})`);
                            resolve();
                        }
                    }
                );
            });
        } catch (error) {
            // Continuar con el siguiente profesor
        }
    }
}

async function insertHorariosFromExcel() {
    if (HORARIOS_DEL_EXCEL.length === 0) {
        console.log('⚠️  No hay horarios configurados. Edita HORARIOS_DEL_EXCEL en este archivo.');
        return;
    }

    console.log('📅 Insertando horarios del Excel...');

    for (const horario of HORARIOS_DEL_EXCEL) {
        try {
            await new Promise((resolve, reject) => {
                db.run(
                    `INSERT INTO horarios (materia_id, comision_id, profesor_id, dia_semana, hora_inicio, hora_fin, tipo_clase, link_reunion, tipo_reunion)
                     VALUES (
                         (SELECT id FROM materias WHERE codigo = ?),
                         (SELECT id FROM comisiones WHERE materia_id = (SELECT id FROM materias WHERE codigo = ?) AND nombre = ?),
                         (SELECT id FROM profesores WHERE nombre = ? AND apellido = ?),
                         ?, ?, ?, ?, ?, ?
                     )`,
                    [
                        horario.materia,
                        horario.materia,
                        horario.comision,
                        horario.profesor.nombre,
                        horario.profesor.apellido,
                        horario.dia,
                        horario.horaInicio,
                        horario.horaFin,
                        horario.tipoClase,
                        horario.linkReunion || 'sin información',
                        horario.tipoReunion || 'sin información'
                    ],
                    function (err) {
                        if (err) {
                            if (err.message.includes('UNIQUE constraint failed')) {
                                console.log(`ℹ️  Horario ya existe: ${horario.materia} - ${horario.comision} - ${horario.profesor.nombre} ${horario.profesor.apellido}`);
                            } else {
                                console.error(`❌ Error insertando horario:`, err.message);
                            }
                            reject(err);
                        } else {
                            console.log(`✅ Horario insertado: ${horario.materia} - ${horario.comision} - ${horario.profesor.nombre} ${horario.profesor.apellido} (ID: ${this.lastID})`);
                            resolve();
                        }
                    }
                );
            });
        } catch (error) {
            // Continuar con el siguiente horario
        }
    }
}

// =====================================================
// FUNCIÓN PRINCIPAL
// =====================================================

async function insertFromExcel() {
    console.log('🚀 Iniciando inserción de datos desde el Excel...\n');

    try {
        // Verificar que las materias existan
        const materias = await new Promise((resolve, reject) => {
            db.all('SELECT codigo FROM materias', (err, rows) => {
                if (err) reject(err);
                else resolve(rows.map(row => row.codigo));
            });
        });

        console.log('📚 Materias disponibles:', materias.join(', '));
        console.log('');

        // Insertar profesores
        await insertProfesoresFromExcel();
        console.log('');

        // Insertar horarios
        await insertHorariosFromExcel();
        console.log('');

        console.log('🎉 ¡Inserción desde Excel completada!');
        console.log('\n📝 Para agregar más datos:');
        console.log('1. Edita PROFESORES_DEL_EXCEL y HORARIOS_DEL_EXCEL en este archivo');
        console.log('2. Ejecuta este script nuevamente');

    } catch (error) {
        console.error('❌ Error durante la inserción:', error);
    } finally {
        // Cerrar la conexión a la base de datos
        db.close((err) => {
            if (err) {
                console.error('Error cerrando la base de datos:', err.message);
            } else {
                console.log('🔒 Conexión a la base de datos cerrada');
            }
        });
    }
}

// =====================================================
// FUNCIONES DE UTILIDAD
// =====================================================

// Función para convertir día de texto a número
function diaToNumber(dia) {
    const dias = {
        'lunes': 1, 'martes': 2, 'miércoles': 3, 'miercoles': 3, 'jueves': 4, 'viernes': 5, 'sábado': 6, 'sabado': 6, 'domingo': 7
    };
    return dias[dia.toLowerCase()] || 1;
}

// Función para convertir tipo de clase de texto a código
function tipoClaseToCode(tipo) {
    const tipos = {
        'teoría': 'teorica', 'teorica': 'teorica', 'teórica': 'teorica',
        'práctica': 'practica', 'practica': 'practica', 'practico': 'practica',
        'laboratorio': 'laboratorio', 'lab': 'laboratorio'
    };
    return tipos[tipo.toLowerCase()] || 'teorica';
}

// Función para convertir tipo de reunión de texto a código
function tipoReunionToCode(tipo) {
    const tipos = {
        'meet': 'meet', 'google meet': 'meet', 'googlemeet': 'meet',
        'teams': 'teams', 'microsoft teams': 'teams', 'microsoftteams': 'teams',
        'zoom': 'otro', 'otro': 'otro'
    };
    return tipos[tipo.toLowerCase()] || 'sin información';
}

// =====================================================
// EJEMPLO DE USO
// =====================================================

/*
EJEMPLO DE CÓMO CONFIGURAR LOS DATOS:

const PROFESORES_DEL_EXCEL = [
    { nombre: 'Juan', apellido: 'Pérez', email: 'juan.perez@tupad.edu.ar', telefono: 'sin información' },
    { nombre: 'María', apellido: 'González', email: 'maria.gonzalez@tupad.edu.ar', telefono: 'sin información' },
    { nombre: 'Carlos', apellido: 'López', email: 'carlos.lopez@tupad.edu.ar', telefono: 'sin información' }
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
*/

// Ejecutar el script
if (require.main === module) {
    insertFromExcel();
}

module.exports = {
    insertProfesoresFromExcel,
    insertHorariosFromExcel,
    insertFromExcel,
    diaToNumber,
    tipoClaseToCode,
    tipoReunionToCode
};