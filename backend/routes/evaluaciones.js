const express = require('express');
const { db } = require('../database/init');
const { authenticateToken, isProfesor } = require('../middleware/auth');
const { validateEvaluacion, validateId, validatePagination } = require('../middleware/validation');
const emailService = require('../services/emailService');
const evaluacionNotificationService = require('../services/evaluacionNotificationService');

const router = express.Router();

// Obtener todas las evaluaciones
router.get('/', authenticateToken, validatePagination, (req, res) => {
    const { page = 1, limit = 20, materia_id, tipo_evaluacion, fecha_desde, fecha_hasta } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = ['e.activo = 1'];
    let params = [];

    if (materia_id) {
        whereConditions.push('e.materia_id = ?');
        params.push(materia_id);
    }

    if (tipo_evaluacion) {
        whereConditions.push('e.tipo_evaluacion = ?');
        params.push(tipo_evaluacion);
    }

    if (fecha_desde) {
        whereConditions.push('e.fecha_evaluacion >= ?');
        params.push(fecha_desde);
    }

    if (fecha_hasta) {
        whereConditions.push('e.fecha_evaluacion <= ?');
        params.push(fecha_hasta);
    }

    const whereClause = 'WHERE ' + whereConditions.join(' AND ');

    const query = `
    SELECT
      e.*,
      m.nombre as materia_nombre,
      m.codigo as materia_codigo,
      COUNT(n.id) as total_notas,
      AVG(n.nota) as promedio_notas
    FROM evaluaciones e
    INNER JOIN materias m ON e.materia_id = m.id
    LEFT JOIN notas n ON e.id = n.evaluacion_id
    ${whereClause}
    GROUP BY e.id
    ORDER BY e.fecha_evaluacion DESC
    LIMIT ? OFFSET ?
  `;

    params.push(limit, offset);

    db.all(query, params, (err, evaluaciones) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        // Contar total de evaluaciones
        const countQuery = `
      SELECT COUNT(*) as total
      FROM evaluaciones e
      INNER JOIN materias m ON e.materia_id = m.id
      ${whereClause}
    `;

        db.get(countQuery, params.slice(0, -2), (err, count) => {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            res.json({
                evaluaciones,
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

// Obtener evaluaciones próximas
router.get('/proximas', authenticateToken, (req, res) => {
    const { dias = 7 } = req.query;
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + parseInt(dias));

    const query = `
    SELECT
      e.*,
      m.nombre as materia_nombre,
      m.codigo as materia_codigo,
      COUNT(n.id) as total_notas
    FROM evaluaciones e
    INNER JOIN materias m ON e.materia_id = m.id
    LEFT JOIN notas n ON e.id = n.evaluacion_id
    WHERE e.fecha_evaluacion BETWEEN date('now') AND date('now', '+' || ? || ' days')
    AND e.activo = 1
    GROUP BY e.id
    ORDER BY e.fecha_evaluacion, e.hora_inicio
  `;

    db.all(query, [dias], (err, evaluaciones) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        res.json({ evaluaciones });
    });
});

// Obtener una evaluación específica
router.get('/:id', authenticateToken, validateId, (req, res) => {
    const evaluacionId = req.params.id;

    const query = `
    SELECT
      e.*,
      m.nombre as materia_nombre,
      m.codigo as materia_codigo,
      COUNT(n.id) as total_notas,
      AVG(n.nota) as promedio_notas,
      MIN(n.nota) as nota_minima,
      MAX(n.nota) as nota_maxima
    FROM evaluaciones e
    INNER JOIN materias m ON e.materia_id = m.id
    LEFT JOIN notas n ON e.id = n.evaluacion_id
    WHERE e.id = ? AND e.activo = 1
    GROUP BY e.id
  `;

    db.get(query, [evaluacionId], (err, evaluacion) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (!evaluacion) {
            return res.status(404).json({ error: 'Evaluación no encontrada' });
        }

        // Obtener notas de la evaluación
        const notasQuery = `
      SELECT
        n.*,
        u.nombre as estudiante_nombre,
        u.apellido as estudiante_apellido,
        u.email as estudiante_email
      FROM notas n
      INNER JOIN usuarios u ON n.usuario_id = u.id
      WHERE n.evaluacion_id = ?
      ORDER BY u.apellido, u.nombre
    `;

        db.all(notasQuery, [evaluacionId], (err, notas) => {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            res.json({
                evaluacion,
                notas
            });
        });
    });
});

// Obtener notas de un usuario específico
router.get('/usuario/:usuarioId/notas', authenticateToken, validateId, (req, res) => {
    const usuarioId = req.params.usuarioId;

    // Verificar que el usuario existe
    db.get('SELECT id, nombre, apellido FROM usuarios WHERE id = ? AND activo = 1', [usuarioId], (err, usuario) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const query = `
      SELECT
        n.*,
        e.titulo as evaluacion_titulo,
        e.tipo_evaluacion,
        e.fecha_evaluacion,
        e.peso,
        m.nombre as materia_nombre,
        m.codigo as materia_codigo
      FROM notas n
      INNER JOIN evaluaciones e ON n.evaluacion_id = e.id
      INNER JOIN materias m ON e.materia_id = m.id
      WHERE n.usuario_id = ? AND e.activo = 1
      ORDER BY e.fecha_evaluacion DESC
    `;

        db.all(query, [usuarioId], (err, notas) => {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            // Calcular estadísticas
            const totalNotas = notas.length;
            const notasAprobadas = notas.filter(n => n.nota >= 6).length;
            const promedio = totalNotas > 0 ? notas.reduce((sum, n) => sum + n.nota, 0) / totalNotas : 0;

            res.json({
                usuario,
                notas,
                estadisticas: {
                    total_notas: totalNotas,
                    notas_aprobadas: notasAprobadas,
                    promedio: Math.round(promedio * 100) / 100,
                    porcentaje_aprobacion: totalNotas > 0 ? Math.round((notasAprobadas / totalNotas) * 100) : 0
                }
            });
        });
    });
});

// Crear nueva evaluación (solo profesores y admin)
router.post('/', authenticateToken, isProfesor, validateEvaluacion, async (req, res) => {
    const {
        materia_id,
        titulo,
        descripcion,
        tipo_evaluacion,
        fecha_evaluacion,
        hora_inicio,
        hora_fin,
        peso,
        link_evaluacion
    } = req.body;

    // Verificar que la materia existe
    db.get('SELECT id, nombre, codigo FROM materias WHERE id = ? AND activo = 1', [materia_id], async (err, materia) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (!materia) {
            return res.status(400).json({ error: 'Materia no encontrada' });
        }

        // Insertar evaluación
        db.run(
            `INSERT INTO evaluaciones (
        materia_id, titulo, descripcion, tipo_evaluacion, fecha_evaluacion,
        hora_inicio, hora_fin, peso, link_evaluacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [materia_id, titulo, descripcion, tipo_evaluacion, fecha_evaluacion, hora_inicio, hora_fin, peso, link_evaluacion],
            async function (err) {
                if (err) {
                    return res.status(500).json({ error: 'Error al crear la evaluación' });
                }

                const evaluacionId = this.lastID;

                const evaluacion = {
                    id: evaluacionId,
                    titulo,
                    descripcion,
                    tipo_evaluacion,
                    fecha_evaluacion,
                    hora_inicio,
                    hora_fin,
                    peso,
                    link_evaluacion
                };

                // Enviar notificación en tiempo real
                try {
                    await evaluacionNotificationService.notifyEvaluacionCreada(evaluacion, materia, req.user.id);
                } catch (notificationError) {
                    console.error('Error al enviar notificación en tiempo real:', notificationError);
                    // No fallamos la operación principal por un error de notificación
                }

                // Enviar notificaciones por email
                try {
                    const evaluacionEmail = {
                        id: evaluacionId,
                        titulo,
                        descripcion,
                        tipo_evaluacion,
                        fecha_evaluacion,
                        hora_inicio,
                        hora_fin,
                        materia_nombre: materia.nombre
                    };

                    // Obtener usuarios que quieren recibir notificaciones de evaluaciones
                    const usuariosQuery = `
            SELECT u.id, u.email, u.nombre, u.apellido
            FROM usuarios u
            INNER JOIN configuracion_notificaciones cn ON u.id = cn.usuario_id
            WHERE cn.notificar_evaluaciones = 1 AND u.activo = 1
          `;

                    db.all(usuariosQuery, [], async (err, usuarios) => {
                        if (err) {
                            console.error('Error obteniendo usuarios para notificaciones:', err);
                        } else {
                            // Enviar notificaciones por email
                            for (const usuario of usuarios) {
                                await emailService.sendEvaluacionNotification(
                                    usuario.email,
                                    usuario.nombre,
                                    evaluacion
                                );

                                // Crear notificación en la base de datos
                                db.run(
                                    `INSERT INTO notificaciones (
                    usuario_id, tipo, titulo, mensaje
                  ) VALUES (?, ?, ?, ?)`,
                                    [
                                        usuario.id,
                                        'evaluacion',
                                        `Nueva evaluación: ${titulo}`,
                                        `Se ha programado una nueva evaluación en ${materia.nombre} para el ${new Date(fecha_evaluacion).toLocaleDateString('es-AR')}`
                                    ]
                                );
                            }
                        }
                    });
                } catch (error) {
                    console.error('Error enviando notificaciones:', error);
                }

                res.status(201).json({
                    message: 'Evaluación creada exitosamente',
                    id: evaluacionId,
                    evaluacion: {
                        id: evaluacionId,
                        materia_id,
                        titulo,
                        descripcion,
                        tipo_evaluacion,
                        fecha_evaluacion,
                        hora_inicio,
                        hora_fin,
                        peso,
                        link_evaluacion
                    }
                });
            }
        );
    });
});

// Actualizar evaluación (solo profesores y admin)
router.put('/:id', authenticateToken, isProfesor, validateId, validateEvaluacion, (req, res) => {
    const evaluacionId = req.params.id;
    const {
        materia_id,
        titulo,
        descripcion,
        tipo_evaluacion,
        fecha_evaluacion,
        hora_inicio,
        hora_fin,
        peso,
        link_evaluacion
    } = req.body;

    // Verificar que la evaluación existe y obtener datos actuales
    db.get('SELECT * FROM evaluaciones WHERE id = ? AND activo = 1', [evaluacionId], (err, evaluacionActual) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (!evaluacionActual) {
            return res.status(404).json({ error: 'Evaluación no encontrada' });
        }

        // Verificar que la materia existe
        db.get('SELECT id, nombre, codigo FROM materias WHERE id = ? AND activo = 1', [materia_id], (err, materia) => {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            if (!materia) {
                return res.status(400).json({ error: 'Materia no encontrada' });
            }

            // Actualizar evaluación
            db.run(
                `UPDATE evaluaciones SET
          materia_id = ?, titulo = ?, descripcion = ?, tipo_evaluacion = ?,
          fecha_evaluacion = ?, hora_inicio = ?, hora_fin = ?, peso = ?,
          link_evaluacion = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
                [materia_id, titulo, descripcion, tipo_evaluacion, fecha_evaluacion, hora_inicio, hora_fin, peso, link_evaluacion, evaluacionId],
                async function (err) {
                    if (err) {
                        return res.status(500).json({ error: 'Error al actualizar la evaluación' });
                    }

                    const evaluacionActualizada = {
                        id: evaluacionId,
                        materia_id,
                        titulo,
                        descripcion,
                        tipo_evaluacion,
                        fecha_evaluacion,
                        hora_inicio,
                        hora_fin,
                        peso,
                        link_evaluacion
                    };

                    // Detectar cambios para la notificación
                    const cambios = {};
                    if (evaluacionActual.titulo !== titulo) cambios.titulo = { anterior: evaluacionActual.titulo, nuevo: titulo };
                    if (evaluacionActual.descripcion !== descripcion) cambios.descripcion = { anterior: evaluacionActual.descripcion, nuevo: descripcion };
                    if (evaluacionActual.tipo_evaluacion !== tipo_evaluacion) cambios.tipo_evaluacion = { anterior: evaluacionActual.tipo_evaluacion, nuevo: tipo_evaluacion };
                    if (evaluacionActual.fecha_evaluacion !== fecha_evaluacion) cambios.fecha_evaluacion = { anterior: evaluacionActual.fecha_evaluacion, nuevo: fecha_evaluacion };
                    if (evaluacionActual.hora_inicio !== hora_inicio) cambios.hora_inicio = { anterior: evaluacionActual.hora_inicio, nuevo: hora_inicio };
                    if (evaluacionActual.hora_fin !== hora_fin) cambios.hora_fin = { anterior: evaluacionActual.hora_fin, nuevo: hora_fin };
                    if (evaluacionActual.peso !== peso) cambios.peso = { anterior: evaluacionActual.peso, nuevo: peso };

                    // Enviar notificación solo si hay cambios
                    if (Object.keys(cambios).length > 0) {
                        try {
                            await evaluacionNotificationService.notifyEvaluacionActualizada(evaluacionActualizada, materia, req.user.id, cambios);
                        } catch (notificationError) {
                            console.error('Error al enviar notificación:', notificationError);
                            // No fallamos la operación principal por un error de notificación
                        }
                    }

                    res.json({
                        message: 'Evaluación actualizada exitosamente',
                        evaluacion: evaluacionActualizada
                    });
                }
            );
        });
    });
});

// Eliminar evaluación (solo profesores y admin)
router.delete('/:id', authenticateToken, isProfesor, validateId, (req, res) => {
    const evaluacionId = req.params.id;

    // Verificar que no hay notas asociadas
    db.get('SELECT COUNT(*) as count FROM notas WHERE evaluacion_id = ?', [evaluacionId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (result.count > 0) {
            return res.status(400).json({
                error: 'No se puede eliminar la evaluación porque tiene notas asociadas'
            });
        }

        // Obtener información de la evaluación antes de eliminarla
        db.get('SELECT e.*, m.nombre as materia_nombre, m.codigo as materia_codigo FROM evaluaciones e INNER JOIN materias m ON e.materia_id = m.id WHERE e.id = ?', [evaluacionId], (err, evaluacion) => {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            db.run('UPDATE evaluaciones SET activo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [evaluacionId], async function (err) {
                if (err) {
                    return res.status(500).json({ error: 'Error interno del servidor' });
                }

                if (this.changes === 0) {
                    return res.status(404).json({ error: 'Evaluación no encontrada' });
                }

                // Enviar notificación
                try {
                    const materia = {
                        id: evaluacion.materia_id,
                        nombre: evaluacion.materia_nombre,
                        codigo: evaluacion.materia_codigo
                    };
                    await evaluacionNotificationService.notifyEvaluacionEliminada(evaluacion, materia, req.user.id);
                } catch (notificationError) {
                    console.error('Error al enviar notificación:', notificationError);
                    // No fallamos la operación principal por un error de notificación
                }

                res.json({ message: 'Evaluación eliminada exitosamente' });
            });
        });
    });
});

// Agregar nota a una evaluación (solo profesores y admin)
router.post('/:id/notas', authenticateToken, isProfesor, validateId, (req, res) => {
    const evaluacionId = req.params.id;
    const { usuario_id, nota, comentarios } = req.body;

    if (!usuario_id || nota === undefined) {
        return res.status(400).json({ error: 'Usuario y nota son requeridos' });
    }

    if (nota < 0 || nota > 10) {
        return res.status(400).json({ error: 'La nota debe estar entre 0 y 10' });
    }

    // Verificar que la evaluación existe
    db.get('SELECT e.*, m.nombre as materia_nombre, m.codigo as materia_codigo FROM evaluaciones e INNER JOIN materias m ON e.materia_id = m.id WHERE e.id = ? AND e.activo = 1', [evaluacionId], (err, evaluacion) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (!evaluacion) {
            return res.status(404).json({ error: 'Evaluación no encontrada' });
        }

        // Verificar que el usuario existe
        db.get('SELECT id FROM usuarios WHERE id = ? AND activo = 1', [usuario_id], (err, usuario) => {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            if (!usuario) {
                return res.status(400).json({ error: 'Usuario no encontrado' });
            }

            // Verificar si ya existe una nota para este usuario en esta evaluación
            db.get('SELECT id FROM notas WHERE evaluacion_id = ? AND usuario_id = ?', [evaluacionId, usuario_id], (err, existing) => {
                if (err) {
                    return res.status(500).json({ error: 'Error interno del servidor' });
                }

                if (existing) {
                    return res.status(400).json({ error: 'Ya existe una nota para este usuario en esta evaluación' });
                }

                // Insertar nota
                db.run(
                    'INSERT INTO notas (evaluacion_id, usuario_id, nota, comentarios) VALUES (?, ?, ?, ?)',
                    [evaluacionId, usuario_id, nota, comentarios],
                    async function (err) {
                        if (err) {
                            return res.status(500).json({ error: 'Error al agregar la nota' });
                        }

                        // Enviar notificación de nota publicada
                        try {
                            const materia = {
                                id: evaluacion.materia_id,
                                nombre: evaluacion.materia_nombre,
                                codigo: evaluacion.materia_codigo
                            };
                            await evaluacionNotificationService.notifyNotaPublicada(evaluacion, materia, nota, req.user.id);
                        } catch (notificationError) {
                            console.error('Error al enviar notificación:', notificationError);
                            // No fallamos la operación principal por un error de notificación
                        }

                        res.status(201).json({
                            message: 'Nota agregada exitosamente',
                            id: this.lastID,
                            nota: {
                                id: this.lastID,
                                evaluacion_id: evaluacionId,
                                usuario_id,
                                nota,
                                comentarios
                            }
                        });
                    }
                );
            });
        });
    });
});

// Actualizar nota (solo profesores y admin)
router.put('/:id/notas/:notaId', authenticateToken, isProfesor, validateId, (req, res) => {
    const evaluacionId = req.params.id;
    const notaId = req.params.notaId;
    const { nota, comentarios } = req.body;

    if (nota === undefined) {
        return res.status(400).json({ error: 'La nota es requerida' });
    }

    if (nota < 0 || nota > 10) {
        return res.status(400).json({ error: 'La nota debe estar entre 0 y 10' });
    }

    // Verificar que la nota existe y pertenece a la evaluación
    db.get('SELECT id FROM notas WHERE id = ? AND evaluacion_id = ?', [notaId, evaluacionId], (err, notaExistente) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (!notaExistente) {
            return res.status(404).json({ error: 'Nota no encontrada' });
        }

        // Actualizar nota
        db.run(
            'UPDATE notas SET nota = ?, comentarios = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [nota, comentarios, notaId],
            function (err) {
                if (err) {
                    return res.status(500).json({ error: 'Error al actualizar la nota' });
                }

                res.json({
                    message: 'Nota actualizada exitosamente',
                    nota: {
                        id: notaId,
                        evaluacion_id: evaluacionId,
                        nota,
                        comentarios
                    }
                });
            }
        );
    });
});

// Eliminar nota (solo profesores y admin)
router.delete('/:id/notas/:notaId', authenticateToken, isProfesor, validateId, (req, res) => {
    const evaluacionId = req.params.id;
    const notaId = req.params.notaId;

    // Verificar que la nota existe y pertenece a la evaluación
    db.get('SELECT id FROM notas WHERE id = ? AND evaluacion_id = ?', [notaId, evaluacionId], (err, nota) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (!nota) {
            return res.status(404).json({ error: 'Nota no encontrada' });
        }

        db.run('DELETE FROM notas WHERE id = ?', [notaId], function (err) {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            res.json({ message: 'Nota eliminada exitosamente' });
        });
    });
});

// Buscar evaluaciones por título
router.get('/search/:query', authenticateToken, (req, res) => {
    const searchQuery = `%${req.params.query}%`;

    const query = `
    SELECT
      e.*,
      m.nombre as materia_nombre,
      m.codigo as materia_codigo,
      COUNT(n.id) as total_notas
    FROM evaluaciones e
    INNER JOIN materias m ON e.materia_id = m.id
    LEFT JOIN notas n ON e.id = n.evaluacion_id
    WHERE e.titulo LIKE ? AND e.activo = 1
    GROUP BY e.id
    ORDER BY e.fecha_evaluacion DESC
    LIMIT 20
  `;

    db.all(query, [searchQuery], (err, evaluaciones) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        res.json({ evaluaciones });
    });
});

// Obtener estadísticas de evaluaciones
router.get('/stats', authenticateToken, (req, res) => {
    const query = `
        SELECT
            COUNT(*) as total_evaluaciones,
            COUNT(CASE WHEN activo = 1 THEN 1 END) as evaluaciones_activas,
            COUNT(CASE WHEN activo = 0 THEN 1 END) as evaluaciones_inactivas,
            COUNT(CASE WHEN fecha_evaluacion >= date('now') THEN 1 END) as evaluaciones_proximas,
            COUNT(CASE WHEN fecha_evaluacion < date('now') THEN 1 END) as evaluaciones_pasadas,
            COUNT(DISTINCT materia_id) as materias_con_evaluaciones,
            COUNT(DISTINCT tipo_evaluacion) as tipos_diferentes
        FROM evaluaciones
    `;

    db.get(query, (err, stats) => {
        if (err) {
            console.error('Error al obtener estadísticas de evaluaciones:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        res.json({ stats });
    });
});

module.exports = router;