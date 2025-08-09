const express = require('express');
const { db } = require('../database/init');
const { authenticateToken, isProfesor } = require('../middleware/auth');
const { validateHorario, validateId, validateFiltrosHorarios, validatePagination } = require('../middleware/validation');
const materiaNotificationService = require('../services/materiaNotificationService');

const router = express.Router();

// Obtener todos los horarios con filtros opcionales
router.get('/', authenticateToken, validateFiltrosHorarios, validatePagination, (req, res) => {
    const { dia_semana, materia_id, profesor_id, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = ['h.activo = 1'];
    let params = [];

    if (dia_semana) {
        whereConditions.push('h.dia_semana = ?');
        params.push(dia_semana);
    }

    if (materia_id) {
        whereConditions.push('h.materia_id = ?');
        params.push(materia_id);
    }

    if (profesor_id) {
        whereConditions.push('h.profesor_id = ?');
        params.push(profesor_id);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    const query = `
    SELECT
      h.id,
      h.dia_semana,
      h.hora_inicio,
      h.hora_fin,
      h.tipo_clase,
      h.link_reunion,
      h.tipo_reunion,
      h.link_grabacion,
      m.id as materia_id,
      m.nombre as materia_nombre,
      m.codigo as materia_codigo,
      c.id as comision_id,
      c.nombre as comision_nombre,
      p.id as profesor_id,
      p.nombre as profesor_nombre,
      p.apellido as profesor_apellido,
      p.tipo as profesor_tipo
    FROM horarios h
    INNER JOIN materias m ON h.materia_id = m.id
    INNER JOIN comisiones c ON h.comision_id = c.id
    INNER JOIN profesores p ON h.profesor_id = p.id
    ${whereClause}
    ORDER BY h.dia_semana, h.hora_inicio
    LIMIT ? OFFSET ?
  `;

    params.push(limit, offset);

    db.all(query, params, (err, horarios) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        // Contar total de horarios
        const countQuery = `
      SELECT COUNT(*) as total
      FROM horarios h
      INNER JOIN materias m ON h.materia_id = m.id
      INNER JOIN comisiones c ON h.comision_id = c.id
      INNER JOIN profesores p ON h.profesor_id = p.id
      ${whereClause}
    `;

        db.get(countQuery, params.slice(0, -2), (err, count) => {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            // Agrupar horarios por día
            const horariosPorDia = {};
            const diasSemana = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

            horarios.forEach(horario => {
                const dia = horario.dia_semana;
                if (!horariosPorDia[dia]) {
                    horariosPorDia[dia] = {
                        dia_semana: dia,
                        dia_nombre: diasSemana[dia],
                        horarios: []
                    };
                }
                horariosPorDia[dia].horarios.push(horario);
            });

            res.json({
                horarios: Object.values(horariosPorDia),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: count.total,
                    pages: Math.ceil(count.total / limit)
                }
            });
        });
    });
});

// Obtener horarios por día específico
router.get('/dia/:dia', authenticateToken, (req, res) => {
    const dia = parseInt(req.params.dia);

    if (dia < 1 || dia > 7) {
        return res.status(400).json({ error: 'Día de semana debe ser entre 1 y 7' });
    }

    const query = `
    SELECT
      h.id,
      h.dia_semana,
      h.hora_inicio,
      h.hora_fin,
      h.tipo_clase,
      h.link_reunion,
      h.tipo_reunion,
      h.link_grabacion,
      m.id as materia_id,
      m.nombre as materia_nombre,
      m.codigo as materia_codigo,
      c.id as comision_id,
      c.nombre as comision_nombre,
      p.id as profesor_id,
      p.nombre as profesor_nombre,
      p.apellido as profesor_apellido,
      p.tipo as profesor_tipo
    FROM horarios h
    INNER JOIN materias m ON h.materia_id = m.id
    INNER JOIN comisiones c ON h.comision_id = c.id
    INNER JOIN profesores p ON h.profesor_id = p.id
    WHERE h.dia_semana = ? AND h.activo = 1
    ORDER BY h.hora_inicio
  `;

    db.all(query, [dia], (err, horarios) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        const diasSemana = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

        res.json({
            dia_semana: dia,
            dia_nombre: diasSemana[dia],
            horarios
        });
    });
});

// Obtener horarios por materia
router.get('/materia/:materiaId', authenticateToken, validateId, (req, res) => {
    const materiaId = req.params.materiaId;

    const query = `
    SELECT
      h.id,
      h.dia_semana,
      h.hora_inicio,
      h.hora_fin,
      h.tipo_clase,
      h.link_reunion,
      h.tipo_reunion,
      h.link_grabacion,
      m.id as materia_id,
      m.nombre as materia_nombre,
      m.codigo as materia_codigo,
      c.id as comision_id,
      c.nombre as comision_nombre,
      p.id as profesor_id,
      p.nombre as profesor_nombre,
      p.apellido as profesor_apellido,
      p.tipo as profesor_tipo
    FROM horarios h
    INNER JOIN materias m ON h.materia_id = m.id
    INNER JOIN comisiones c ON h.comision_id = c.id
    INNER JOIN profesores p ON h.profesor_id = p.id
    WHERE h.materia_id = ? AND h.activo = 1
    ORDER BY h.dia_semana, h.hora_inicio
  `;

    db.all(query, [materiaId], (err, horarios) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        // Agrupar por día
        const horariosPorDia = {};
        const diasSemana = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

        horarios.forEach(horario => {
            const dia = horario.dia_semana;
            if (!horariosPorDia[dia]) {
                horariosPorDia[dia] = {
                    dia_semana: dia,
                    dia_nombre: diasSemana[dia],
                    horarios: []
                };
            }
            horariosPorDia[dia].horarios.push(horario);
        });

        res.json({
            materia: {
                id: horarios[0]?.materia_id,
                nombre: horarios[0]?.materia_nombre,
                codigo: horarios[0]?.materia_codigo
            },
            horarios: Object.values(horariosPorDia)
        });
    });
});

// Obtener horarios por profesor
router.get('/profesor/:profesorId', authenticateToken, validateId, (req, res) => {
    const profesorId = req.params.profesorId;

    const query = `
    SELECT
      h.id,
      h.dia_semana,
      h.hora_inicio,
      h.hora_fin,
      h.tipo_clase,
      h.link_reunion,
      h.tipo_reunion,
      h.link_grabacion,
      m.id as materia_id,
      m.nombre as materia_nombre,
      m.codigo as materia_codigo,
      c.id as comision_id,
      c.nombre as comision_nombre,
      p.id as profesor_id,
      p.nombre as profesor_nombre,
      p.apellido as profesor_apellido,
      p.tipo as profesor_tipo
    FROM horarios h
    INNER JOIN materias m ON h.materia_id = m.id
    INNER JOIN comisiones c ON h.comision_id = c.id
    INNER JOIN profesores p ON h.profesor_id = p.id
    WHERE h.profesor_id = ? AND h.activo = 1
    ORDER BY h.dia_semana, h.hora_inicio
  `;

    db.all(query, [profesorId], (err, horarios) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        // Agrupar por día
        const horariosPorDia = {};
        const diasSemana = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

        horarios.forEach(horario => {
            const dia = horario.dia_semana;
            if (!horariosPorDia[dia]) {
                horariosPorDia[dia] = {
                    dia_semana: dia,
                    dia_nombre: diasSemana[dia],
                    horarios: []
                };
            }
            horariosPorDia[dia].horarios.push(horario);
        });

        res.json({
            profesor: {
                id: horarios[0]?.profesor_id,
                nombre: horarios[0]?.profesor_nombre,
                apellido: horarios[0]?.profesor_apellido,
                tipo: horarios[0]?.profesor_tipo
            },
            horarios: Object.values(horariosPorDia)
        });
    });
});

// Obtener conteo de horarios
router.get('/count', authenticateToken, (req, res) => {
    const { activo, materia_id, profesor_id } = req.query;

    let whereConditions = ['1=1'];
    let params = [];

    if (activo !== undefined) {
        whereConditions.push('activo = ?');
        params.push(activo === 'true' ? 1 : 0);
    }

    if (materia_id) {
        whereConditions.push('materia_id = ?');
        params.push(materia_id);
    }

    if (profesor_id) {
        whereConditions.push('profesor_id = ?');
        params.push(profesor_id);
    }

    const whereClause = 'WHERE ' + whereConditions.join(' AND ');
    const query = `SELECT COUNT(*) as count FROM horarios ${whereClause}`;

    db.get(query, params, (err, result) => {
        if (err) {
            console.error('Error al obtener conteo de horarios:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        res.json({ count: result.count });
    });
});

// Obtener horarios semanales
router.get('/weekly', authenticateToken, (req, res) => {
    const query = `
        SELECT
            h.dia_semana,
            COUNT(*) as total_horarios,
            COUNT(DISTINCT h.materia_id) as materias_diferentes,
            COUNT(DISTINCT h.profesor_id) as profesores_diferentes
        FROM horarios h
        WHERE h.activo = 1
        GROUP BY h.dia_semana
        ORDER BY h.dia_semana
    `;

    db.all(query, (err, weekly) => {
        if (err) {
            console.error('Error al obtener horarios semanales:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        res.json({ weekly });
    });
});

// Obtener un horario específico
router.get('/:id', authenticateToken, validateId, (req, res) => {
    const horarioId = req.params.id;

    const query = `
    SELECT
      h.*,
      m.nombre as materia_nombre,
      m.codigo as materia_codigo,
      c.nombre as comision_nombre,
      p.nombre as profesor_nombre,
      p.apellido as profesor_apellido,
      p.tipo as profesor_tipo
    FROM horarios h
    INNER JOIN materias m ON h.materia_id = m.id
    INNER JOIN comisiones c ON h.comision_id = c.id
    INNER JOIN profesores p ON h.profesor_id = p.id
    WHERE h.id = ? AND h.activo = 1
  `;

    db.get(query, [horarioId], (err, horario) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (!horario) {
            return res.status(404).json({ error: 'Horario no encontrado' });
        }

        res.json(horario);
    });
});

// Crear nuevo horario (solo profesores y admin)
router.post('/', authenticateToken, isProfesor, validateHorario, (req, res) => {
    const {
        materia_id,
        comision_id,
        profesor_id,
        dia_semana,
        hora_inicio,
        hora_fin,
        tipo_clase,
        link_reunion,
        tipo_reunion,
        link_grabacion
    } = req.body;

    // Verificar que la materia existe
    db.get('SELECT id, nombre, codigo FROM materias WHERE id = ? AND activo = 1', [materia_id], (err, materia) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (!materia) {
            return res.status(400).json({ error: 'Materia no encontrada' });
        }

        // Verificar que la comisión existe
        db.get('SELECT id FROM comisiones WHERE id = ? AND materia_id = ? AND activo = 1', [comision_id, materia_id], (err, comision) => {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            if (!comision) {
                return res.status(400).json({ error: 'Comisión no encontrada para esta materia' });
            }

            // Verificar que el profesor existe
            db.get('SELECT id, nombre, apellido, tipo FROM profesores WHERE id = ? AND activo = 1', [profesor_id], (err, profesor) => {
                if (err) {
                    return res.status(500).json({ error: 'Error interno del servidor' });
                }

                if (!profesor) {
                    return res.status(400).json({ error: 'Profesor no encontrado' });
                }

                // Verificar que no hay conflicto de horarios
                const conflictQuery = `
          SELECT id FROM horarios
          WHERE dia_semana = ?
          AND ((hora_inicio <= ? AND hora_fin > ?) OR (hora_inicio < ? AND hora_fin >= ?))
          AND materia_id = ?
          AND activo = 1
        `;

                db.get(conflictQuery, [dia_semana, hora_inicio, hora_inicio, hora_fin, hora_fin, materia_id], (err, conflict) => {
                    if (err) {
                        return res.status(500).json({ error: 'Error interno del servidor' });
                    }

                    if (conflict) {
                        return res.status(400).json({ error: 'Conflicto de horarios para esta materia' });
                    }

                    // Insertar horario
                    const insertQuery = `
            INSERT INTO horarios (
              materia_id, comision_id, profesor_id, dia_semana, hora_inicio, hora_fin,
              tipo_clase, link_reunion, tipo_reunion, link_grabacion
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

                    db.run(insertQuery, [
                        materia_id, comision_id, profesor_id, dia_semana, hora_inicio, hora_fin,
                        tipo_clase, link_reunion, tipo_reunion, link_grabacion
                    ], async function (err) {
                        if (err) {
                            return res.status(500).json({ error: 'Error al crear el horario' });
                        }

                        // Obtener información completa para la notificación
                        const horarioCompleto = {
                            id: this.lastID,
                            materia_id,
                            comision_id,
                            profesor_id,
                            dia_semana,
                            hora_inicio,
                            hora_fin,
                            tipo_clase,
                            link_reunion,
                            tipo_reunion,
                            link_grabacion
                        };

                        // Enviar notificaciones
                        try {
                            // Notificación de horario asignado
                            await materiaNotificationService.notifyHorarioAsignado(
                                { id: materia_id, nombre: materia.nombre },
                                horarioCompleto,
                                req.user.id
                            );

                            // Notificación de profesor asignado
                            await materiaNotificationService.notifyProfesorAsignado(
                                { id: materia_id, nombre: materia.nombre },
                                { id: profesor_id, nombre: profesor.nombre, apellido: profesor.apellido },
                                horarioCompleto,
                                req.user.id
                            );
                        } catch (notificationError) {
                            console.error('Error al enviar notificaciones:', notificationError);
                            // No fallamos la operación principal por un error de notificación
                        }

                        res.status(201).json({
                            message: 'Horario creado exitosamente',
                            id: this.lastID
                        });
                    });
                });
            });
        });
    });
});

// Actualizar horario (solo profesores y admin)
router.put('/:id', authenticateToken, isProfesor, validateId, validateHorario, (req, res) => {
    const horarioId = req.params.id;
    const {
        materia_id,
        comision_id,
        profesor_id,
        dia_semana,
        hora_inicio,
        hora_fin,
        tipo_clase,
        link_reunion,
        tipo_reunion,
        link_grabacion
    } = req.body;

    // Verificar que el horario existe
    db.get('SELECT id FROM horarios WHERE id = ? AND activo = 1', [horarioId], (err, horario) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (!horario) {
            return res.status(404).json({ error: 'Horario no encontrado' });
        }

        // Verificar conflictos de horarios (excluyendo el horario actual)
        const conflictQuery = `
      SELECT id FROM horarios
      WHERE dia_semana = ?
      AND ((hora_inicio <= ? AND hora_fin > ?) OR (hora_inicio < ? AND hora_fin >= ?))
      AND materia_id = ?
      AND id != ?
      AND activo = 1
    `;

        db.get(conflictQuery, [dia_semana, hora_inicio, hora_inicio, hora_fin, hora_fin, materia_id, horarioId], (err, conflict) => {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            if (conflict) {
                return res.status(400).json({ error: 'Conflicto de horarios para esta materia' });
            }

            // Actualizar horario
            const updateQuery = `
        UPDATE horarios SET
          materia_id = ?, comision_id = ?, profesor_id = ?, dia_semana = ?,
          hora_inicio = ?, hora_fin = ?, tipo_clase = ?, link_reunion = ?,
          tipo_reunion = ?, link_grabacion = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

            db.run(updateQuery, [
                materia_id, comision_id, profesor_id, dia_semana, hora_inicio, hora_fin,
                tipo_clase, link_reunion, tipo_reunion, link_grabacion, horarioId
            ], function (err) {
                if (err) {
                    return res.status(500).json({ error: 'Error al actualizar el horario' });
                }

                res.json({ message: 'Horario actualizado exitosamente' });
            });
        });
    });
});

// Eliminar horario (solo profesores y admin)
router.delete('/:id', authenticateToken, isProfesor, validateId, (req, res) => {
    const horarioId = req.params.id;

    db.run('UPDATE horarios SET activo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [horarioId], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Horario no encontrado' });
        }

        res.json({ message: 'Horario eliminado exitosamente' });
    });
});

module.exports = router;