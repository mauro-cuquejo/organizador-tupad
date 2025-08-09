const { db } = require('../database/init');

// Función para insertar materias
async function insertMaterias() {
    const materias = [
        { nombre: 'Programación 2', codigo: 'PROG2', descripcion: 'Programación orientada a objetos y estructuras de datos avanzadas', creditos: 6 },
        { nombre: 'Bases de Datos 1', codigo: 'BBDD1', descripcion: 'Fundamentos de bases de datos relacionales y SQL', creditos: 6 },
        { nombre: 'Probabilidad y Estadística', codigo: 'PROBA', descripcion: 'Estadística descriptiva e inferencial', creditos: 6 },
        { nombre: 'Inglés', codigo: 'INGLES', descripcion: 'Inglés técnico para informática', creditos: 4 }
    ];

    for (const materia of materias) {
        try {
            await new Promise((resolve, reject) => {
                db.run(
                    'INSERT INTO materias (nombre, codigo, descripcion, creditos) VALUES (?, ?, ?, ?)',
                    [materia.nombre, materia.codigo, materia.descripcion, materia.creditos],
                    function (err) {
                        if (err) {
                            console.error(`Error insertando materia ${materia.nombre}:`, err.message);
                            reject(err);
                        } else {
                            console.log(`✅ Materia insertada: ${materia.nombre} (ID: ${this.lastID})`);
                            resolve();
                        }
                    }
                );
            });
        } catch (error) {
            console.error(`❌ Error con materia ${materia.nombre}:`, error.message);
        }
    }
}

// Función para insertar profesores
async function insertProfesores(profesores) {
    for (const profesor of profesores) {
        try {
            await new Promise((resolve, reject) => {
                db.run(
                    'INSERT INTO profesores (nombre, apellido, email, tipo, telefono) VALUES (?, ?, ?, ?, ?)',
                    [profesor.nombre, profesor.apellido, profesor.email, 'profesor', profesor.telefono || 'sin información'],
                    function (err) {
                        if (err) {
                            console.error(`Error insertando profesor ${profesor.nombre} ${profesor.apellido}:`, err.message);
                            reject(err);
                        } else {
                            console.log(`✅ Profesor insertado: ${profesor.nombre} ${profesor.apellido} (ID: ${this.lastID})`);
                            resolve();
                        }
                    }
                );
            });
        } catch (error) {
            console.error(`❌ Error con profesor ${profesor.nombre} ${profesor.apellido}:`, error.message);
        }
    }
}

// Función para insertar comisiones
async function insertComisiones() {
    const materias = ['PROG2', 'BBDD1', 'PROBA', 'INGLES'];
    const comisiones = ['Comisión A', 'Comisión B'];

    for (const codigoMateria of materias) {
        for (const nombreComision of comisiones) {
            try {
                await new Promise((resolve, reject) => {
                    db.run(
                        'INSERT INTO comisiones (materia_id, nombre, capacidad) VALUES ((SELECT id FROM materias WHERE codigo = ?), ?, ?)',
                        [codigoMateria, nombreComision, 30],
                        function (err) {
                            if (err) {
                                console.error(`Error insertando comisión ${nombreComision} para ${codigoMateria}:`, err.message);
                                reject(err);
                            } else {
                                console.log(`✅ Comisión insertada: ${nombreComision} para ${codigoMateria} (ID: ${this.lastID})`);
                                resolve();
                            }
                        }
                    );
                });
            } catch (error) {
                console.error(`❌ Error con comisión ${nombreComision} para ${codigoMateria}:`, error.message);
            }
        }
    }
}

// Función para insertar horarios
async function insertHorario(horario) {
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
                    horario.codigoMateria,
                    horario.codigoMateria,
                    horario.nombreComision,
                    horario.nombreProfesor,
                    horario.apellidoProfesor,
                    horario.diaSemana,
                    horario.horaInicio,
                    horario.horaFin,
                    horario.tipoClase,
                    horario.linkReunion || 'sin información',
                    horario.tipoReunion || 'sin información'
                ],
                function (err) {
                    if (err) {
                        console.error(`Error insertando horario:`, err.message);
                        reject(err);
                    } else {
                        console.log(`✅ Horario insertado: ${horario.codigoMateria} - ${horario.nombreComision} - ${horario.nombreProfesor} ${horario.apellidoProfesor} (ID: ${this.lastID})`);
                        resolve();
                    }
                }
            );
        });
    } catch (error) {
        console.error(`❌ Error con horario:`, error.message);
    }
}

// Función principal
async function insertCronograma() {
    console.log('🚀 Iniciando inserción de datos del cronograma...\n');

    try {
        // 1. Insertar materias
        console.log('📚 Insertando materias...');
        await insertMaterias();
        console.log('');

        // 2. Insertar profesores (ejemplo - reemplazar con datos reales)
        console.log('👨‍🏫 Insertando profesores...');
        const profesores = [
            { nombre: 'Juan', apellido: 'Pérez', email: 'juan.perez@tupad.edu.ar', telefono: 'sin información' },
            { nombre: 'María', apellido: 'González', email: 'maria.gonzalez@tupad.edu.ar', telefono: 'sin información' },
            { nombre: 'Carlos', apellido: 'López', email: 'carlos.lopez@tupad.edu.ar', telefono: 'sin información' },
            { nombre: 'Ana', apellido: 'Martínez', email: 'ana.martinez@tupad.edu.ar', telefono: 'sin información' }
        ];
        await insertProfesores(profesores);
        console.log('');

        // 3. Insertar comisiones
        console.log('👥 Insertando comisiones...');
        await insertComisiones();
        console.log('');

        // 4. Insertar horarios (ejemplo - reemplazar con datos reales del Excel)
        console.log('📅 Insertando horarios...');
        const horarios = [
            // Programación 2 - Comisión A
            {
                codigoMateria: 'PROG2',
                nombreComision: 'Comisión A',
                nombreProfesor: 'Juan',
                apellidoProfesor: 'Pérez',
                diaSemana: 1,
                horaInicio: '08:00',
                horaFin: '10:00',
                tipoClase: 'teorica',
                linkReunion: 'sin información',
                tipoReunion: 'sin información'
            },
            {
                codigoMateria: 'PROG2',
                nombreComision: 'Comisión A',
                nombreProfesor: 'Juan',
                apellidoProfesor: 'Pérez',
                diaSemana: 3,
                horaInicio: '10:00',
                horaFin: '12:00',
                tipoClase: 'practica',
                linkReunion: 'sin información',
                tipoReunion: 'sin información'
            },
            // Bases de Datos 1 - Comisión A
            {
                codigoMateria: 'BBDD1',
                nombreComision: 'Comisión A',
                nombreProfesor: 'María',
                apellidoProfesor: 'González',
                diaSemana: 2,
                horaInicio: '14:00',
                horaFin: '16:00',
                tipoClase: 'teorica',
                linkReunion: 'sin información',
                tipoReunion: 'sin información'
            },
            {
                codigoMateria: 'BBDD1',
                nombreComision: 'Comisión A',
                nombreProfesor: 'María',
                apellidoProfesor: 'González',
                diaSemana: 4,
                horaInicio: '16:00',
                horaFin: '18:00',
                tipoClase: 'laboratorio',
                linkReunion: 'sin información',
                tipoReunion: 'sin información'
            },
            // Probabilidad y Estadística - Comisión A
            {
                codigoMateria: 'PROBA',
                nombreComision: 'Comisión A',
                nombreProfesor: 'Carlos',
                apellidoProfesor: 'López',
                diaSemana: 5,
                horaInicio: '09:00',
                horaFin: '11:00',
                tipoClase: 'teorica',
                linkReunion: 'sin información',
                tipoReunion: 'sin información'
            },
            {
                codigoMateria: 'PROBA',
                nombreComision: 'Comisión A',
                nombreProfesor: 'Carlos',
                apellidoProfesor: 'López',
                diaSemana: 6,
                horaInicio: '11:00',
                horaFin: '13:00',
                tipoClase: 'practica',
                linkReunion: 'sin información',
                tipoReunion: 'sin información'
            },
            // Inglés - Comisión A
            {
                codigoMateria: 'INGLES',
                nombreComision: 'Comisión A',
                nombreProfesor: 'Ana',
                apellidoProfesor: 'Martínez',
                diaSemana: 1,
                horaInicio: '14:00',
                horaFin: '16:00',
                tipoClase: 'teorica',
                linkReunion: 'sin información',
                tipoReunion: 'sin información'
            }
        ];

        for (const horario of horarios) {
            await insertHorario(horario);
        }

        console.log('\n🎉 ¡Inserción de datos completada exitosamente!');
        console.log('\n📝 Para agregar más horarios del Excel:');
        console.log('1. Edita el array "horarios" en este archivo');
        console.log('2. Agrega objetos con la estructura mostrada arriba');
        console.log('3. Ejecuta este script nuevamente');

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

// Ejecutar el script
if (require.main === module) {
    insertCronograma();
}

module.exports = {
    insertMaterias,
    insertProfesores,
    insertComisiones,
    insertHorario,
    insertCronograma
};