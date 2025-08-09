const express = require('express');
const { db } = require('../database/init');
const { authenticateToken, isProfesor } = require('../middleware/auth');
const { validateProfesor, validateId, validatePagination } = require('../middleware/validation');
const profesorNotificationService = require('../services/profesorNotificationService');

const router = express.Router();

// Obtener todos los profesores
router.get('/', authenticateToken, validatePagination, (req, res) => {
    const { page = 1, limit = 20, tipo, activo } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = ['1=1'];
    let params = [];

    if (tipo) {
        whereConditions.push('tipo = ?');
        params.push(tipo);
    }

    if (activo !== undefined) {
        whereConditions.push('activo = ?');
        params.push(activo === 'true' ? 1 : 0);
    }

    const whereClause = 'WHERE ' + whereConditions.join(' AND ');

    const query = `
    SELECT
      p.*,
      COUNT(DISTINCT h.materia_id) as total_materias,
      COUNT(DISTINCT h.id) as total_horarios
    FROM profesores p
    LEFT JOIN horarios h ON p.id = h.profesor_id AND h.activo = 1
    ${whereClause}
    GROUP BY p.id
    ORDER BY p.apellido, p.nombre
    LIMIT ? OFFSET ?
  `;

    params.push(limit, offset);

    db.all(query, params, (err, profesores) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        // Contar total de profesores
        const countQuery = `
      SELECT COUNT(*) as total
      FROM profesores p
      ${whereClause}
    `;

        db.get(countQuery, params.slice(0, -2), (err, count) => {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            res.json({
                profesores,
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

// Obtener un profesor específico con información detallada
router.get('/:id', authenticateToken, validateId, (req, res) => {
    const profesorId = req.params.id;

    // Obtener información básica del profesor
    db.get(
        'SELECT * FROM profesores WHERE id = ?',
        [profesorId],
        (err, profesor) => {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            if (!profesor) {
                return res.status(404).json({ error: 'Profesor no encontrado' });
            }

            // Obtener materias que dicta
            const materiasQuery = `
        SELECT DISTINCT
          m.id,
          m.nombre,
          m.codigo,
          m.descripcion,
          m.creditos
        FROM materias m
        INNER JOIN horarios h ON m.id = h.materia_id
        WHERE h.profesor_id = ? AND m.activo = 1 AND h.activo = 1
        ORDER BY m.nombre
      `;

            db.all(materiasQuery, [profesorId], (err, materias) => {
                if (err) {
                    return res.status(500).json({ error: 'Error interno del servidor' });
                }

                // Obtener horarios del profesor
                const horariosQuery = `
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
            c.nombre as comision_nombre
          FROM horarios h
          INNER JOIN materias m ON h.materia_id = m.id
          INNER JOIN comisiones c ON h.comision_id = c.id
          WHERE h.profesor_id = ? AND h.activo = 1
          ORDER BY h.dia_semana, h.hora_inicio
        `;

                db.all(horariosQuery, [profesorId], (err, horarios) => {
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

                    // Obtener estadísticas
                    const statsQuery = `
            SELECT
              COUNT(DISTINCT h.materia_id) as total_materias,
              COUNT(DISTINCT h.id) as total_horarios,
              COUNT(DISTINCT h.comision_id) as total_comisiones
            FROM horarios h
            WHERE h.profesor_id = ? AND h.activo = 1
          `;

                    db.get(statsQuery, [profesorId], (err, stats) => {
                        if (err) {
                            return res.status(500).json({ error: 'Error interno del servidor' });
                        }

                        res.json({
                            profesor,
                            materias,
                            horarios: Object.values(horariosPorDia),
                            estadisticas: stats
                        });
                    });
                });
            });
        }
    );
});

// Obtener horarios de un profesor
router.get('/:id/horarios', authenticateToken, validateId, (req, res) => {
    const profesorId = req.params.id;

    // Verificar que el profesor existe
    db.get('SELECT id, nombre, apellido FROM profesores WHERE id = ? AND activo = 1', [profesorId], (err, profesor) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (!profesor) {
            return res.status(404).json({ error: 'Profesor no encontrado' });
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
        c.nombre as comision_nombre
      FROM horarios h
      INNER JOIN materias m ON h.materia_id = m.id
      INNER JOIN comisiones c ON h.comision_id = c.id
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
                profesor,
                horarios: Object.values(horariosPorDia)
            });
        });
    });
});

// Obtener materias de un profesor
router.get('/:id/materias', authenticateToken, validateId, (req, res) => {
    const profesorId = req.params.id;

    // Verificar que el profesor existe
    db.get('SELECT id, nombre, apellido FROM profesores WHERE id = ? AND activo = 1', [profesorId], (err, profesor) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (!profesor) {
            return res.status(404).json({ error: 'Profesor no encontrado' });
        }

        const query = `
      SELECT DISTINCT
        m.id,
        m.nombre,
        m.codigo,
        m.descripcion,
        m.creditos,
        COUNT(DISTINCT h.id) as total_horarios,
        COUNT(DISTINCT h.comision_id) as total_comisiones
      FROM materias m
      INNER JOIN horarios h ON m.id = h.materia_id
      WHERE h.profesor_id = ? AND m.activo = 1 AND h.activo = 1
      GROUP BY m.id
      ORDER BY m.nombre
    `;

        db.all(query, [profesorId], (err, materias) => {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            res.json({
                profesor,
                materias
            });
        });
    });
});

// Crear nuevo profesor (solo profesores y admin)
router.post('/', authenticateToken, isProfesor, validateProfesor, (req, res) => {
    const { nombre, apellido, email, tipo, telefono } = req.body;

    // Verificar que el email no esté duplicado
    db.get('SELECT id FROM profesores WHERE email = ?', [email], (err, existing) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (existing) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        // Insertar profesor
        db.run(
            'INSERT INTO profesores (nombre, apellido, email, tipo, telefono) VALUES (?, ?, ?, ?, ?)',
            [nombre, apellido, email, tipo, telefono],
            async function (err) {
                if (err) {
                    return res.status(500).json({ error: 'Error al crear el profesor' });
                }

                const profesor = {
                    id: this.lastID,
                    nombre,
                    apellido,
                    email,
                    tipo,
                    telefono
                };

                // Enviar notificación en tiempo real
                try {
                    await profesorNotificationService.notifyProfesorCreado(profesor, req.user.id);
                } catch (notificationError) {
                    console.error('Error al enviar notificación en tiempo real:', notificationError);
                    // No fallamos la operación principal por un error de notificación
                }

                res.status(201).json({
                    message: 'Profesor creado exitosamente',
                    id: this.lastID,
                    profesor: profesor
                });
            }
        );
    });
});

// Actualizar profesor (solo profesores y admin)
router.put('/:id', authenticateToken, isProfesor, validateId, validateProfesor, (req, res) => {
    const profesorId = req.params.id;
    const { nombre, apellido, email, tipo, telefono } = req.body;

    // Verificar que el profesor existe y obtener datos actuales
    db.get('SELECT * FROM profesores WHERE id = ?', [profesorId], (err, profesorActual) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (!profesorActual) {
            return res.status(404).json({ error: 'Profesor no encontrado' });
        }

        // Verificar que el email no esté duplicado (excluyendo el profesor actual)
        db.get('SELECT id FROM profesores WHERE email = ? AND id != ?', [email, profesorId], (err, existing) => {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            if (existing) {
                return res.status(400).json({ error: 'El email ya está registrado' });
            }

            // Actualizar profesor
            db.run(
                'UPDATE profesores SET nombre = ?, apellido = ?, email = ?, tipo = ?, telefono = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [nombre, apellido, email, tipo, telefono, profesorId],
                async function (err) {
                    if (err) {
                        return res.status(500).json({ error: 'Error al actualizar el profesor' });
                    }

                    const profesorActualizado = {
                        id: profesorId,
                        nombre,
                        apellido,
                        email,
                        tipo,
                        telefono
                    };

                    // Detectar cambios para la notificación
                    const cambios = {};
                    if (profesorActual.nombre !== nombre) cambios.nombre = { anterior: profesorActual.nombre, nuevo: nombre };
                    if (profesorActual.apellido !== apellido) cambios.apellido = { anterior: profesorActual.apellido, nuevo: apellido };
                    if (profesorActual.email !== email) cambios.email = { anterior: profesorActual.email, nuevo: email };
                    if (profesorActual.tipo !== tipo) cambios.tipo = { anterior: profesorActual.tipo, nuevo: tipo };
                    if (profesorActual.telefono !== telefono) cambios.telefono = { anterior: profesorActual.telefono, nuevo: telefono };

                    // Enviar notificación solo si hay cambios
                    if (Object.keys(cambios).length > 0) {
                        try {
                            await profesorNotificationService.notifyProfesorActualizado(profesorActualizado, req.user.id, cambios);
                        } catch (notificationError) {
                            console.error('Error al enviar notificación:', notificationError);
                            // No fallamos la operación principal por un error de notificación
                        }
                    }

                    res.json({
                        message: 'Profesor actualizado exitosamente',
                        profesor: profesorActualizado
                    });
                }
            );
        });
    });
});

// Eliminar profesor (solo profesores y admin)
router.delete('/:id', authenticateToken, isProfesor, validateId, (req, res) => {
    const profesorId = req.params.id;

    // Verificar que el profesor no tenga horarios asignados
    db.get('SELECT COUNT(*) as count FROM horarios WHERE profesor_id = ? AND activo = 1', [profesorId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (result.count > 0) {
            return res.status(400).json({
                error: 'No se puede eliminar el profesor porque tiene horarios asignados'
            });
        }

        // Obtener información del profesor antes de eliminarlo
        db.get('SELECT * FROM profesores WHERE id = ?', [profesorId], (err, profesor) => {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            if (!profesor) {
                return res.status(404).json({ error: 'Profesor no encontrado' });
            }

            // Marcar como inactivo
            db.run('UPDATE profesores SET activo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [profesorId], async function (err) {
                if (err) {
                    return res.status(500).json({ error: 'Error interno del servidor' });
                }

                if (this.changes === 0) {
                    return res.status(404).json({ error: 'Profesor no encontrado' });
                }

                // Enviar notificación
                try {
                    await profesorNotificationService.notifyProfesorEliminado(profesor, req.user.id);
                } catch (notificationError) {
                    console.error('Error al enviar notificación:', notificationError);
                    // No fallamos la operación principal por un error de notificación
                }

                res.json({ message: 'Profesor eliminado exitosamente' });
            });
        });
    });
});

// Buscar profesores por nombre o email
router.get('/search/:query', authenticateToken, (req, res) => {
    const searchQuery = `%${req.params.query}%`;

    const query = `
    SELECT
      p.*,
      COUNT(DISTINCT h.materia_id) as total_materias
    FROM profesores p
    LEFT JOIN horarios h ON p.id = h.profesor_id AND h.activo = 1
    WHERE (p.nombre LIKE ? OR p.apellido LIKE ? OR p.email LIKE ?) AND p.activo = 1
    GROUP BY p.id
    ORDER BY p.apellido, p.nombre
    LIMIT 10
  `;

    db.all(query, [searchQuery, searchQuery, searchQuery], (err, profesores) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        res.json({ profesores });
    });
});

module.exports = router;