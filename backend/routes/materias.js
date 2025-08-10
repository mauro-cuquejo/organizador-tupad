const express = require('express');
const { db } = require('../database/init');
const { authenticateToken, isProfesor } = require('../middleware/auth');
const { validateMateria, validateId, validatePagination } = require('../middleware/validation');
const materiaNotificationService = require('../services/materiaNotificationService');

const router = express.Router();

// Obtener todas las materias
router.get('/', authenticateToken, validatePagination, (req, res) => {
    const { page = 1, limit = 20, activo, creditos, nombre, codigo } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = ['1=1'];
    let params = [];

    // Filtro por estado activo/inactivo
    if (activo !== undefined) {
        whereConditions.push('m.activo = ?');
        params.push(activo === 'true' ? 1 : 0);
    }

    // Filtro por créditos
    if (creditos) {
        if (creditos === '1-3') {
            whereConditions.push('m.creditos BETWEEN 1 AND 3');
        } else if (creditos === '4-6') {
            whereConditions.push('m.creditos BETWEEN 4 AND 6');
        } else if (creditos === '7-9') {
            whereConditions.push('m.creditos BETWEEN 7 AND 9');
        } else if (creditos === '10+') {
            whereConditions.push('m.creditos >= 10');
        }
    }

    // Filtro por nombre (búsqueda parcial)
    if (nombre && nombre.trim()) {
        whereConditions.push('m.nombre LIKE ?');
        params.push(`%${nombre.trim()}%`);
    }

    // Filtro por código (búsqueda parcial)
    if (codigo && codigo.trim()) {
        whereConditions.push('m.codigo LIKE ?');
        params.push(`%${codigo.trim()}%`);
    }

    const whereClause = 'WHERE ' + whereConditions.join(' AND ');

    const query = `
    SELECT
      m.*,
      COUNT(DISTINCT h.id) as total_horarios,
      COUNT(DISTINCT c.id) as total_contenidos,
      COUNT(DISTINCT e.id) as total_evaluaciones
    FROM materias m
    LEFT JOIN horarios h ON m.id = h.materia_id AND h.activo = 1
    LEFT JOIN contenidos c ON m.id = c.materia_id AND c.activo = 1
    LEFT JOIN evaluaciones e ON m.id = e.materia_id AND e.activo = 1
    ${whereClause}
    GROUP BY m.id
    ORDER BY m.nombre
    LIMIT ? OFFSET ?
  `;
    console.log(query);

    params.push(limit, offset);

    db.all(query, params, (err, materias) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor:' + err });
        }

        // Contar total de materias con los mismos filtros
        const countQuery = `
      SELECT COUNT(*) as total
      FROM materias m
      ${whereClause}
    `;

        db.get(countQuery, params.slice(0, -2), (err, count) => {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            res.json({
                materias,
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

// Obtener conteo de materias
router.get('/count', authenticateToken, (req, res) => {
    const { activo } = req.query;

    let whereConditions = ['1=1'];
    let params = [];

    if (activo !== undefined) {
        whereConditions.push('activo = ?');
        params.push(activo === 'true' ? 1 : 0);
    }

    const whereClause = 'WHERE ' + whereConditions.join(' AND ');
    const query = `SELECT COUNT(*) as count FROM materias ${whereClause}`;

    db.get(query, params, (err, result) => {
        if (err) {
            console.error('Error al obtener conteo de materias:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        res.json({ count: result.count });
    });
});

// Obtener estadísticas de materias
router.get('/stats', authenticateToken, (req, res) => {
    const query = `
        SELECT
            COUNT(*) as total_materias,
            COUNT(CASE WHEN activo = 1 THEN 1 END) as materias_activas,
            COUNT(CASE WHEN activo = 0 THEN 1 END) as materias_inactivas,
            COUNT(DISTINCT codigo) as materias_unicas
        FROM materias
    `;

    db.get(query, (err, stats) => {
        if (err) {
            console.error('Error al obtener estadísticas de materias:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        res.json({ stats });
    });
});

// Buscar materias por nombre o código
router.get('/search/:query', authenticateToken, (req, res) => {
    const searchQuery = `%${req.params.query}%`;

    const query = `
    SELECT
      m.*,
      COUNT(DISTINCT h.id) as total_horarios
    FROM materias m
    LEFT JOIN horarios h ON m.id = h.materia_id AND h.activo = 1
    WHERE (m.nombre LIKE ? OR m.codigo LIKE ?) AND m.activo = 1
    GROUP BY m.id
    ORDER BY m.nombre
    LIMIT 10
  `;

    db.all(query, [searchQuery, searchQuery], (err, materias) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        res.json({ materias });
    });
});

// Obtener una materia específica con información detallada
router.get('/:id', authenticateToken, validateId, (req, res) => {
    const materiaId = req.params.id;

    // Obtener información básica de la materia
    db.get(
        'SELECT * FROM materias WHERE id = ?',
        [materiaId],
        (err, materia) => {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            if (!materia) {
                return res.status(404).json({ error: 'Materia no encontrada' });
            }

            // Obtener horarios de la materia
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
          c.id as comision_id,
          c.nombre as comision_nombre,
          p.id as profesor_id,
          p.nombre as profesor_nombre,
          p.apellido as profesor_apellido,
          p.tipo as profesor_tipo
        FROM horarios h
        INNER JOIN comisiones c ON h.comision_id = c.id
        INNER JOIN profesores p ON h.profesor_id = p.id
        WHERE h.materia_id = ? AND h.activo = 1
        ORDER BY h.dia_semana, h.hora_inicio
      `;

            db.all(horariosQuery, [materiaId], (err, horarios) => {
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

                // Obtener contenidos organizados por semana
                const contenidosQuery = `
          SELECT
            c.*,
            COUNT(DISTINCT e.id) as total_evaluaciones_semana
          FROM contenidos c
          LEFT JOIN evaluaciones e ON c.materia_id = e.materia_id
            AND e.fecha_evaluacion BETWEEN
              date('now', 'weekday 0', '-6 days', '+' || (c.semana - 1) || ' weeks')
              AND date('now', 'weekday 0', '-6 days', '+' || c.semana || ' weeks', '-1 day')
          WHERE c.materia_id = ? AND c.activo = 1
          GROUP BY c.id
          ORDER BY c.semana, c.orden
        `;

                db.all(contenidosQuery, [materiaId], (err, contenidos) => {
                    if (err) {
                        return res.status(500).json({ error: 'Error interno del servidor' });
                    }

                    // Agrupar contenidos por semana
                    const contenidosPorSemana = {};
                    contenidos.forEach(contenido => {
                        const semana = contenido.semana;
                        if (!contenidosPorSemana[semana]) {
                            contenidosPorSemana[semana] = {
                                semana: semana,
                                contenidos: []
                            };
                        }
                        contenidosPorSemana[semana].contenidos.push(contenido);
                    });

                    // Obtener evaluaciones
                    const evaluacionesQuery = `
            SELECT
              e.*,
              COUNT(n.id) as total_notas
            FROM evaluaciones e
            LEFT JOIN notas n ON e.id = n.evaluacion_id
            WHERE e.materia_id = ? AND e.activo = 1
            GROUP BY e.id
            ORDER BY e.fecha_evaluacion
          `;

                    db.all(evaluacionesQuery, [materiaId], (err, evaluaciones) => {
                        if (err) {
                            return res.status(500).json({ error: 'Error interno del servidor' });
                        }

                        // Obtener estadísticas
                        const statsQuery = `
              SELECT
                COUNT(DISTINCT h.id) as total_horarios,
                COUNT(DISTINCT c.id) as total_contenidos,
                COUNT(DISTINCT e.id) as total_evaluaciones,
                COUNT(DISTINCT h.profesor_id) as total_profesores,
                COUNT(DISTINCT h.comision_id) as total_comisiones
              FROM materias m
              LEFT JOIN horarios h ON m.id = h.materia_id AND h.activo = 1
              LEFT JOIN contenidos c ON m.id = c.materia_id AND c.activo = 1
              LEFT JOIN evaluaciones e ON m.id = e.materia_id AND e.activo = 1
              WHERE m.id = ?
            `;

                        db.get(statsQuery, [materiaId], (err, stats) => {
                            if (err) {
                                return res.status(500).json({ error: 'Error interno del servidor' });
                            }

                            res.json({
                                materia,
                                horarios: Object.values(horariosPorDia),
                                cronograma: Object.values(contenidosPorSemana),
                                evaluaciones,
                                estadisticas: stats
                            });
                        });
                    });
                });
            });
        }
    );
});

// Obtener horarios de una materia
router.get('/:id/horarios', authenticateToken, validateId, (req, res) => {
    const materiaId = req.params.id;

    // Verificar que la materia existe
    db.get('SELECT id, nombre, codigo FROM materias WHERE id = ? AND activo = 1', [materiaId], (err, materia) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (!materia) {
            return res.status(404).json({ error: 'Materia no encontrada' });
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
        c.id as comision_id,
        c.nombre as comision_nombre,
        p.id as profesor_id,
        p.nombre as profesor_nombre,
        p.apellido as profesor_apellido,
        p.tipo as profesor_tipo
      FROM horarios h
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
                materia,
                horarios: Object.values(horariosPorDia)
            });
        });
    });
});

// Obtener cronograma de contenidos de una materia
router.get('/:id/cronograma', authenticateToken, validateId, (req, res) => {
    const materiaId = req.params.id;

    // Verificar que la materia existe
    db.get('SELECT id, nombre, codigo FROM materias WHERE id = ? AND activo = 1', [materiaId], (err, materia) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (!materia) {
            return res.status(404).json({ error: 'Materia no encontrada' });
        }

        const query = `
      SELECT
        c.*,
        COUNT(DISTINCT e.id) as total_evaluaciones_semana
      FROM contenidos c
      LEFT JOIN evaluaciones e ON c.materia_id = e.materia_id
        AND e.fecha_evaluacion BETWEEN
          date('now', 'weekday 0', '-6 days', '+' || (c.semana - 1) || ' weeks')
          AND date('now', 'weekday 0', '-6 days', '+' || c.semana || ' weeks', '-1 day')
      WHERE c.materia_id = ? AND c.activo = 1
      GROUP BY c.id
      ORDER BY c.semana, c.orden
    `;

        db.all(query, [materiaId], (err, contenidos) => {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            // Agrupar por semana
            const contenidosPorSemana = {};
            contenidos.forEach(contenido => {
                const semana = contenido.semana;
                if (!contenidosPorSemana[semana]) {
                    contenidosPorSemana[semana] = {
                        semana: semana,
                        contenidos: []
                    };
                }
                contenidosPorSemana[semana].contenidos.push(contenido);
            });

            res.json({
                materia,
                cronograma: Object.values(contenidosPorSemana)
            });
        });
    });
});

// Obtener evaluaciones de una materia
router.get('/:id/evaluaciones', authenticateToken, validateId, (req, res) => {
    const materiaId = req.params.id;

    // Verificar que la materia existe
    db.get('SELECT id, nombre, codigo FROM materias WHERE id = ? AND activo = 1', [materiaId], (err, materia) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (!materia) {
            return res.status(404).json({ error: 'Materia no encontrada' });
        }

        const query = `
      SELECT
        e.*,
        COUNT(n.id) as total_notas,
        AVG(n.nota) as promedio_notas
      FROM evaluaciones e
      LEFT JOIN notas n ON e.id = n.evaluacion_id
      WHERE e.materia_id = ? AND e.activo = 1
      GROUP BY e.id
      ORDER BY e.fecha_evaluacion
    `;

        db.all(query, [materiaId], (err, evaluaciones) => {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            res.json({
                materia,
                evaluaciones
            });
        });
    });
});

// Obtener objetivos de una materia
router.get('/:id/objetivos', authenticateToken, validateId, (req, res) => {
    const materiaId = req.params.id;

    // Verificar que la materia existe
    db.get('SELECT id, nombre, codigo FROM materias WHERE id = ? AND activo = 1', [materiaId], (err, materia) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (!materia) {
            return res.status(404).json({ error: 'Materia no encontrada' });
        }

        const query = `
      SELECT id, descripcion, orden
      FROM objetivos_materia
      WHERE materia_id = ? AND activo = 1
      ORDER BY orden
    `;

        db.all(query, [materiaId], (err, objetivos) => {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            res.json({
                materia,
                objetivos
            });
        });
    });
});

// Obtener recursos de una materia
router.get('/:id/recursos', authenticateToken, validateId, (req, res) => {
    const materiaId = req.params.id;

    // Verificar que la materia existe
    db.get('SELECT id, nombre, codigo FROM materias WHERE id = ? AND activo = 1', [materiaId], (err, materia) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (!materia) {
            return res.status(404).json({ error: 'Materia no encontrada' });
        }

        const query = `
      SELECT id, tipo, nombre, descripcion, link, orden
      FROM recursos_materia
      WHERE materia_id = ? AND activo = 1
      ORDER BY orden
    `;

        db.all(query, [materiaId], (err, recursos) => {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            res.json({
                materia,
                recursos
            });
        });
    });
});

// Crear nueva materia (solo profesores y admin)
router.post('/', authenticateToken, isProfesor, validateMateria, (req, res) => {
    const { nombre, codigo, descripcion, creditos } = req.body;

    // Verificar que el código no esté duplicado
    db.get('SELECT id FROM materias WHERE codigo = ?', [codigo], (err, existing) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (existing) {
            return res.status(400).json({ error: 'El código ya está registrado' });
        }

        // Insertar materia
        db.run(
            'INSERT INTO materias (nombre, codigo, descripcion, creditos) VALUES (?, ?, ?, ?)',
            [nombre, codigo, descripcion, creditos],
            async function (err) {
                if (err) {
                    return res.status(500).json({ error: 'Error al crear la materia' });
                }

                const materia = {
                    id: this.lastID,
                    nombre,
                    codigo,
                    descripcion,
                    creditos
                };

                // Enviar notificación
                try {
                    await materiaNotificationService.notifyMateriaCreada(materia, req.user.id);
                } catch (notificationError) {
                    console.error('Error al enviar notificación:', notificationError);
                    // No fallamos la operación principal por un error de notificación
                }

                res.status(201).json({
                    message: 'Materia creada exitosamente',
                    id: this.lastID,
                    materia: materia
                });
            }
        );
    });
});

// Actualizar materia (solo profesores y admin)
router.put('/:id', authenticateToken, isProfesor, validateId, validateMateria, (req, res) => {
    const materiaId = req.params.id;
    const { nombre, codigo, descripcion, creditos } = req.body;

    // Verificar que la materia existe y obtener datos actuales
    db.get('SELECT * FROM materias WHERE id = ?', [materiaId], (err, materiaActual) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (!materiaActual) {
            return res.status(404).json({ error: 'Materia no encontrada' });
        }

        // Verificar que el código no esté duplicado (excluyendo la materia actual)
        db.get('SELECT id FROM materias WHERE codigo = ? AND id != ?', [codigo, materiaId], (err, existing) => {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            if (existing) {
                return res.status(400).json({ error: 'El código ya está registrado' });
            }

            // Actualizar materia
            db.run(
                'UPDATE materias SET nombre = ?, codigo = ?, descripcion = ?, creditos = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [nombre, codigo, descripcion, creditos, materiaId],
                async function (err) {
                    if (err) {
                        return res.status(500).json({ error: 'Error al actualizar la materia' });
                    }

                    const materiaActualizada = {
                        id: materiaId,
                        nombre,
                        codigo,
                        descripcion,
                        creditos
                    };

                    // Detectar cambios para la notificación
                    const cambios = {};
                    if (materiaActual.nombre !== nombre) cambios.nombre = { anterior: materiaActual.nombre, nuevo: nombre };
                    if (materiaActual.codigo !== codigo) cambios.codigo = { anterior: materiaActual.codigo, nuevo: codigo };
                    if (materiaActual.descripcion !== descripcion) cambios.descripcion = { anterior: materiaActual.descripcion, nuevo: descripcion };
                    if (materiaActual.creditos !== creditos) cambios.creditos = { anterior: materiaActual.creditos, nuevo: creditos };

                    // Enviar notificación solo si hay cambios
                    if (Object.keys(cambios).length > 0) {
                        try {
                            await materiaNotificationService.notifyMateriaActualizada(materiaActualizada, req.user.id, cambios);
                        } catch (notificationError) {
                            console.error('Error al enviar notificación:', notificationError);
                            // No fallamos la operación principal por un error de notificación
                        }
                    }

                    res.json({
                        message: 'Materia actualizada exitosamente',
                        materia: materiaActualizada
                    });
                }
            );
        });
    });
});

// Eliminar materia (solo profesores y admin)
router.delete('/:id', authenticateToken, isProfesor, validateId, (req, res) => {
    const materiaId = req.params.id;

    // Verificar que la materia no tenga horarios, contenidos o evaluaciones
    db.get(
        `SELECT
      (SELECT COUNT(*) FROM horarios WHERE materia_id = ? AND activo = 1) as horarios,
      (SELECT COUNT(*) FROM contenidos WHERE materia_id = ? AND activo = 1) as contenidos,
      (SELECT COUNT(*) FROM evaluaciones WHERE materia_id = ? AND activo = 1) as evaluaciones`,
        [materiaId, materiaId, materiaId],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            if (result.horarios > 0 || result.contenidos > 0 || result.evaluaciones > 0) {
                return res.status(400).json({
                    error: 'No se puede eliminar la materia porque tiene horarios, contenidos o evaluaciones asociados'
                });
            }

            // Obtener información de la materia antes de eliminarla
            db.get('SELECT * FROM materias WHERE id = ?', [materiaId], (err, materia) => {
                if (err) {
                    return res.status(500).json({ error: 'Error interno del servidor' });
                }

                // Marcar como inactiva
                db.run('UPDATE materias SET activo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [materiaId], async function (err) {
                    if (err) {
                        return res.status(500).json({ error: 'Error interno del servidor' });
                    }

                    if (this.changes === 0) {
                        return res.status(404).json({ error: 'Materia no encontrada' });
                    }

                    // Enviar notificación
                    try {
                        await materiaNotificationService.notifyMateriaEliminada(materia, req.user.id);
                    } catch (notificationError) {
                        console.error('Error al enviar notificación:', notificationError);
                        // No fallamos la operación principal por un error de notificación
                    }

                    res.json({ message: 'Materia eliminada exitosamente' });
                });
            });
        }
    );
});

module.exports = router;