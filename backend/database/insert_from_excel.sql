-- Script SQL para insertar datos desde el cronograma Excel
-- Reemplazar los valores entre <> con los datos reales del Excel
-- =====================================================
-- 1. INSERTAR MATERIAS (ya están definidas)
-- =====================================================
-- Las materias ya están insertadas con los códigos:
-- PROG2 = Programación 2
-- BBDD1 = Bases de Datos 1
-- PROBA = Probabilidad y Estadística
-- INGLES = Inglés
-- =====================================================
-- 2. INSERTAR PROFESORES DESDE EL EXCEL
-- =====================================================
-- Reemplazar con los nombres reales del cronograma
-- Formato: INSERT INTO profesores (nombre, apellido, email, tipo, telefono) VALUES ('NOMBRE', 'APELLIDO', 'EMAIL', 'profesor', 'TELEFONO');
-- Ejemplo (reemplazar con datos reales):
-- INSERT INTO profesores (nombre, apellido, email, tipo, telefono) VALUES ('Juan', 'Pérez', 'juan.perez@tupad.edu.ar', 'profesor', 'sin información');
-- INSERT INTO profesores (nombre, apellido, email, tipo, telefono) VALUES ('María', 'González', 'maria.gonzalez@tupad.edu.ar', 'profesor', 'sin información');
-- =====================================================
-- 3. INSERTAR COMISIONES (si no están definidas)
-- =====================================================
-- Si las comisiones tienen nombres específicos, actualizar aquí
-- Por defecto se usan "Comisión A", "Comisión B", etc.
-- =====================================================
-- 4. INSERTAR HORARIOS DESDE EL EXCEL
-- =====================================================
-- ESTRUCTURA PARA COPIAR Y PEGAR CON DATOS REALES:
/*
 INSERT INTO horarios (materia_id, comision_id, profesor_id, dia_semana, hora_inicio, hora_fin, tipo_clase, link_reunion, tipo_reunion) VALUES
 ((SELECT id FROM materias WHERE codigo = '<CODIGO_MATERIA>'),
 (SELECT id FROM comisiones WHERE materia_id = (SELECT id FROM materias WHERE codigo = '<CODIGO_MATERIA>') AND nombre = '<NOMBRE_COMISION>'),
 (SELECT id FROM profesores WHERE nombre = '<NOMBRE_PROFESOR>' AND apellido = '<APELLIDO_PROFESOR>'),
 <DIA_SEMANA>, '<HORA_INICIO>', '<HORA_FIN>', '<TIPO_CLASE>', '<LINK_REUNION>', '<TIPO_REUNION>');
 */
-- =====================================================
-- EJEMPLOS CON DATOS DE PRUEBA
-- =====================================================
-- Programación 2 - Comisión A - Teoría
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

-- Programación 2 - Comisión A - Práctica
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

-- Bases de Datos 1 - Comisión A - Teoría
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

-- Bases de Datos 1 - Comisión A - Laboratorio
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

-- Probabilidad y Estadística - Comisión A - Teoría
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

-- Probabilidad y Estadística - Comisión A - Práctica
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

-- Inglés - Comisión A - Teoría
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
-- GUÍA DE CÓDIGOS PARA REEMPLAZAR
-- =====================================================
/*
 CÓDIGOS DE MATERIAS:
 - PROG2 = Programación 2
 - BBDD1 = Bases de Datos 1
 - PROBA = Probabilidad y Estadística
 - INGLES = Inglés
 
 DÍAS DE LA SEMANA:
 - 1 = Lunes
 - 2 = Martes
 - 3 = Miércoles
 - 4 = Jueves
 - 5 = Viernes
 - 6 = Sábado
 - 7 = Domingo
 
 TIPOS DE CLASE:
 - 'teorica'
 - 'practica'
 - 'laboratorio'
 
 TIPOS DE REUNIÓN:
 - 'meet'
 - 'teams'
 - 'otro'
 - 'sin información'
 
 FORMATO DE HORA:
 - HH:MM (ejemplo: '08:00', '10:30', '14:15')
 
 COMISIONES:
 - 'Comisión A'
 - 'Comisión B'
 - 'Comisión C'
 - etc. (o el nombre específico que tengan en el Excel)
 */
-- =====================================================
-- PLANTILLA PARA COPIAR Y PEGAR
-- =====================================================
/*
 -- Copiar esta plantilla y reemplazar los valores:
 INSERT INTO horarios (materia_id, comision_id, profesor_id, dia_semana, hora_inicio, hora_fin, tipo_clase, link_reunion, tipo_reunion) VALUES
 ((SELECT id FROM materias WHERE codigo = 'PROG2'),
 (SELECT id FROM comisiones WHERE materia_id = (SELECT id FROM materias WHERE codigo = 'PROG2') AND nombre = 'Comisión A'),
 (SELECT id FROM profesores WHERE nombre = 'NOMBRE_PROFESOR' AND apellido = 'APELLIDO_PROFESOR'),
 1, '08:00', '10:00', 'teorica', 'sin información', 'sin información');
 */