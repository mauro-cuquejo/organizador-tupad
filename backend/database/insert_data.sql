-- Script SQL para insertar datos básicos del cronograma
-- Ejecutar después de que se haya inicializado la base de datos
-- =====================================================
-- INSERTAR MATERIAS
-- =====================================================
INSERT INTO
    materias (nombre, codigo, descripcion, creditos)
VALUES
    (
        'Programación 2',
        'PROG2',
        'Programación orientada a objetos y estructuras de datos avanzadas',
        6
    ),
    (
        'Bases de Datos 1',
        'BBDD1',
        'Fundamentos de bases de datos relacionales y SQL',
        6
    ),
    (
        'Probabilidad y Estadística',
        'PROBA',
        'Estadística descriptiva e inferencial',
        6
    ),
    (
        'Inglés',
        'INGLES',
        'Inglés técnico para informática',
        4
    );

-- =====================================================
-- INSERTAR PROFESORES
-- =====================================================
-- Nota: Reemplazar con los nombres reales de los profesores del cronograma
INSERT INTO
    profesores (nombre, apellido, email, tipo, telefono)
VALUES
    (
        'Juan',
        'Pérez',
        'juan.perez@tupad.edu.ar',
        'profesor',
        'sin información'
    ),
    (
        'María',
        'González',
        'maria.gonzalez@tupad.edu.ar',
        'profesor',
        'sin información'
    ),
    (
        'Carlos',
        'López',
        'carlos.lopez@tupad.edu.ar',
        'profesor',
        'sin información'
    ),
    (
        'Ana',
        'Martínez',
        'ana.martinez@tupad.edu.ar',
        'profesor',
        'sin información'
    ),
    (
        'Roberto',
        'Fernández',
        'roberto.fernandez@tupad.edu.ar',
        'profesor',
        'sin información'
    ),
    (
        'Laura',
        'Rodríguez',
        'laura.rodriguez@tupad.edu.ar',
        'profesor',
        'sin información'
    ),
    (
        'Diego',
        'Silva',
        'diego.silva@tupad.edu.ar',
        'profesor',
        'sin información'
    ),
    (
        'Patricia',
        'Morales',
        'patricia.morales@tupad.edu.ar',
        'profesor',
        'sin información'
    );

-- =====================================================
-- INSERTAR COMISIONES
-- =====================================================
-- Comisiones para Programación 2
INSERT INTO
    comisiones (materia_id, nombre, capacidad)
VALUES
    (
        (
            SELECT
                id
            FROM
                materias
            WHERE
                codigo = 'PROG2'
        ),
        'Comisión A',
        30
    ),
    (
        (
            SELECT
                id
            FROM
                materias
            WHERE
                codigo = 'PROG2'
        ),
        'Comisión B',
        30
    );

-- Comisiones para Bases de Datos 1
INSERT INTO
    comisiones (materia_id, nombre, capacidad)
VALUES
    (
        (
            SELECT
                id
            FROM
                materias
            WHERE
                codigo = 'BBDD1'
        ),
        'Comisión A',
        25
    ),
    (
        (
            SELECT
                id
            FROM
                materias
            WHERE
                codigo = 'BBDD1'
        ),
        'Comisión B',
        25
    );

-- Comisiones para Probabilidad y Estadística
INSERT INTO
    comisiones (materia_id, nombre, capacidad)
VALUES
    (
        (
            SELECT
                id
            FROM
                materias
            WHERE
                codigo = 'PROBA'
        ),
        'Comisión A',
        35
    ),
    (
        (
            SELECT
                id
            FROM
                materias
            WHERE
                codigo = 'PROBA'
        ),
        'Comisión B',
        35
    );

-- Comisiones para Inglés
INSERT INTO
    comisiones (materia_id, nombre, capacidad)
VALUES
    (
        (
            SELECT
                id
            FROM
                materias
            WHERE
                codigo = 'INGLES'
        ),
        'Comisión A',
        40
    ),
    (
        (
            SELECT
                id
            FROM
                materias
            WHERE
                codigo = 'INGLES'
        ),
        'Comisión B',
        40
    );

-- =====================================================
-- INSERTAR HORARIOS
-- =====================================================
-- Nota: Reemplazar con los horarios reales del cronograma
-- Formato: (materia_id, comision_id, profesor_id, dia_semana, hora_inicio, hora_fin, tipo_clase, link_reunion, tipo_reunion)
-- Ejemplo de estructura para Programación 2 - Comisión A
INSERT INTO
    horarios (
        materia_id,
        comision_id,
        profesor_id,
        dia_semana,
        hora_inicio,
        hora_fin,
        tipo_clase,
        link_reunion,
        tipo_reunion
    )
VALUES
    (
        (
            SELECT
                id
            FROM
                materias
            WHERE
                codigo = 'PROG2'
        ),
        (
            SELECT
                id
            FROM
                comisiones
            WHERE
                materia_id = (
                    SELECT
                        id
                    FROM
                        materias
                    WHERE
                        codigo = 'PROG2'
                )
                AND nombre = 'Comisión A'
        ),
        (
            SELECT
                id
            FROM
                profesores
            WHERE
                nombre = 'Juan'
                AND apellido = 'Pérez'
        ),
        1,
        '08:00',
        '10:00',
        'teorica',
        'sin información',
        'sin información'
    );

-- Ejemplo de estructura para Programación 2 - Comisión A (práctica)
INSERT INTO
    horarios (
        materia_id,
        comision_id,
        profesor_id,
        dia_semana,
        hora_inicio,
        hora_fin,
        tipo_clase,
        link_reunion,
        tipo_reunion
    )
VALUES
    (
        (
            SELECT
                id
            FROM
                materias
            WHERE
                codigo = 'PROG2'
        ),
        (
            SELECT
                id
            FROM
                comisiones
            WHERE
                materia_id = (
                    SELECT
                        id
                    FROM
                        materias
                    WHERE
                        codigo = 'PROG2'
                )
                AND nombre = 'Comisión A'
        ),
        (
            SELECT
                id
            FROM
                profesores
            WHERE
                nombre = 'Juan'
                AND apellido = 'Pérez'
        ),
        3,
        '10:00',
        '12:00',
        'practica',
        'sin información',
        'sin información'
    );

-- Ejemplo de estructura para Bases de Datos 1 - Comisión A
INSERT INTO
    horarios (
        materia_id,
        comision_id,
        profesor_id,
        dia_semana,
        hora_inicio,
        hora_fin,
        tipo_clase,
        link_reunion,
        tipo_reunion
    )
VALUES
    (
        (
            SELECT
                id
            FROM
                materias
            WHERE
                codigo = 'BBDD1'
        ),
        (
            SELECT
                id
            FROM
                comisiones
            WHERE
                materia_id = (
                    SELECT
                        id
                    FROM
                        materias
                    WHERE
                        codigo = 'BBDD1'
                )
                AND nombre = 'Comisión A'
        ),
        (
            SELECT
                id
            FROM
                profesores
            WHERE
                nombre = 'María'
                AND apellido = 'González'
        ),
        2,
        '14:00',
        '16:00',
        'teorica',
        'sin información',
        'sin información'
    );

-- Ejemplo de estructura para Bases de Datos 1 - Comisión A (laboratorio)
INSERT INTO
    horarios (
        materia_id,
        comision_id,
        profesor_id,
        dia_semana,
        hora_inicio,
        hora_fin,
        tipo_clase,
        link_reunion,
        tipo_reunion
    )
VALUES
    (
        (
            SELECT
                id
            FROM
                materias
            WHERE
                codigo = 'BBDD1'
        ),
        (
            SELECT
                id
            FROM
                comisiones
            WHERE
                materia_id = (
                    SELECT
                        id
                    FROM
                        materias
                    WHERE
                        codigo = 'BBDD1'
                )
                AND nombre = 'Comisión A'
        ),
        (
            SELECT
                id
            FROM
                profesores
            WHERE
                nombre = 'María'
                AND apellido = 'González'
        ),
        4,
        '16:00',
        '18:00',
        'laboratorio',
        'sin información',
        'sin información'
    );

-- Ejemplo de estructura para Probabilidad y Estadística - Comisión A
INSERT INTO
    horarios (
        materia_id,
        comision_id,
        profesor_id,
        dia_semana,
        hora_inicio,
        hora_fin,
        tipo_clase,
        link_reunion,
        tipo_reunion
    )
VALUES
    (
        (
            SELECT
                id
            FROM
                materias
            WHERE
                codigo = 'PROBA'
        ),
        (
            SELECT
                id
            FROM
                comisiones
            WHERE
                materia_id = (
                    SELECT
                        id
                    FROM
                        materias
                    WHERE
                        codigo = 'PROBA'
                )
                AND nombre = 'Comisión A'
        ),
        (
            SELECT
                id
            FROM
                profesores
            WHERE
                nombre = 'Carlos'
                AND apellido = 'López'
        ),
        5,
        '09:00',
        '11:00',
        'teorica',
        'sin información',
        'sin información'
    );

-- Ejemplo de estructura para Probabilidad y Estadística - Comisión A (práctica)
INSERT INTO
    horarios (
        materia_id,
        comision_id,
        profesor_id,
        dia_semana,
        hora_inicio,
        hora_fin,
        tipo_clase,
        link_reunion,
        tipo_reunion
    )
VALUES
    (
        (
            SELECT
                id
            FROM
                materias
            WHERE
                codigo = 'PROBA'
        ),
        (
            SELECT
                id
            FROM
                comisiones
            WHERE
                materia_id = (
                    SELECT
                        id
                    FROM
                        materias
                    WHERE
                        codigo = 'PROBA'
                )
                AND nombre = 'Comisión A'
        ),
        (
            SELECT
                id
            FROM
                profesores
            WHERE
                nombre = 'Carlos'
                AND apellido = 'López'
        ),
        6,
        '11:00',
        '13:00',
        'practica',
        'sin información',
        'sin información'
    );

-- Ejemplo de estructura para Inglés - Comisión A
INSERT INTO
    horarios (
        materia_id,
        comision_id,
        profesor_id,
        dia_semana,
        hora_inicio,
        hora_fin,
        tipo_clase,
        link_reunion,
        tipo_reunion
    )
VALUES
    (
        (
            SELECT
                id
            FROM
                materias
            WHERE
                codigo = 'INGLES'
        ),
        (
            SELECT
                id
            FROM
                comisiones
            WHERE
                materia_id = (
                    SELECT
                        id
                    FROM
                        materias
                    WHERE
                        codigo = 'INGLES'
                )
                AND nombre = 'Comisión A'
        ),
        (
            SELECT
                id
            FROM
                profesores
            WHERE
                nombre = 'Ana'
                AND apellido = 'Martínez'
        ),
        1,
        '14:00',
        '16:00',
        'teorica',
        'sin información',
        'sin información'
    );

-- =====================================================
-- INSTRUCCIONES PARA COMPLETAR LOS DATOS
-- =====================================================
/*
 INSTRUCCIONES PARA COMPLETAR EL SCRIPT:
 
 1. PROFESORES:
 - Reemplazar los nombres y apellidos con los reales del cronograma
 - Actualizar los emails con los correos reales
 - Agregar más profesores si es necesario
 
 2. HORARIOS:
 - Copiar la estructura de los ejemplos para cada horario del cronograma
 - Actualizar:
 * materia_id: usar el código correcto (PROG2, BBDD1, PROBA, INGLES)
 * comision_id: usar la comisión correcta (A, B, etc.)
 * profesor_id: usar el nombre y apellido del profesor correcto
 * dia_semana: 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado, 7=Domingo
 * hora_inicio y hora_fin: formato HH:MM (ej: '08:00', '10:00')
 * tipo_clase: 'teorica', 'practica', 'laboratorio'
 * link_reunion: URL de la reunión o 'sin información'
 * tipo_reunion: 'meet', 'teams', 'otro' o 'sin información'
 
 3. COMISIONES:
 - Si hay más comisiones, agregar más INSERT INTO comisiones
 - Si las comisiones tienen nombres específicos, actualizar los nombres
 
 4. EJECUCIÓN:
 - Ejecutar primero las materias
 - Luego los profesores
 - Después las comisiones
 - Finalmente los horarios
 
 EJEMPLO DE HORARIO COMPLETO:
 INSERT INTO horarios (materia_id, comision_id, profesor_id, dia_semana, hora_inicio, hora_fin, tipo_clase, link_reunion, tipo_reunion) VALUES
 ((SELECT id FROM materias WHERE codigo = 'PROG2'),
 (SELECT id FROM comisiones WHERE materia_id = (SELECT id FROM materias WHERE codigo = 'PROG2') AND nombre = 'Comisión A'),
 (SELECT id FROM profesores WHERE nombre = 'NOMBRE_REAL' AND apellido = 'APELLIDO_REAL'),
 1, '08:00', '10:00', 'teorica', 'https://meet.google.com/abc-defg-hij', 'meet');
 */