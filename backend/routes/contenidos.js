const express = require('express');
const { db } = require('../database/init');
const { authenticateToken, isProfesor } = require('../middleware/auth');
const { validateContenido, validateId, validateFiltrosContenidos, validatePagination } = require('../middleware/validation');
const emailService = require('../services/emailService');
const contenidoNotificationService = require('../services/contenidoNotificationService');

const router = express.Router();

// Obtener todos los contenidos con filtros opcionales
router.get('/', authenticateToken, validateFiltrosContenidos, validatePagination, (req, res) => {
    const { materia_id, semana, tipo_contenido, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = ['c.activo = 1'];
    let params = [];

    if (materia_id) {
        whereConditions.push('c.materia_id = ?');
        params.push(materia_id);
    }

    if (semana) {
        whereConditions.push('c.semana = ?');
        params.push(semana);
    }

    if (tipo_contenido) {
        whereConditions.push('c.tipo_contenido = ?');
        params.push(tipo_contenido);
    }

    const whereClause = 'WHERE ' + whereConditions.join(' AND ');

    const query = `
    SELECT
      c.*,
      m.nombre as materia_nombre,
      m.codigo as materia_codigo
    FROM contenidos c
    INNER JOIN materias m ON c.materia_id = m.id
    ${whereClause}
    ORDER BY c.semana DESC, c.orden, c.created_at DESC
    LIMIT ? OFFSET ?
  `;

    params.push(limit, offset);

    db.all(query, params, (err, contenidos) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        // Contar total de contenidos
        const countQuery = `
      SELECT COUNT(*) as total
      FROM contenidos c
      INNER JOIN materias m ON c.materia_id = m.id
      ${whereClause}
    `;

        db.get(countQuery, params.slice(0, -2), (err, count) => {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            res.json({
                contenidos,
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

// Obtener contenidos organizados por semana
router.get('/por-semana', authenticateToken, validateFiltrosContenidos, (req, res) => {
    const { materia_id, tipo_contenido } = req.query;

    let whereConditions = ['c.activo = 1'];
    let params = [];

    if (materia_id) {
        whereConditions.push('c.materia_id = ?');
        params.push(materia_id);
    }

    if (tipo_contenido) {
        whereConditions.push('c.tipo_contenido = ?');
        params.push(tipo_contenido);
    }

    const whereClause = 'WHERE ' + whereConditions.join(' AND ');

    const query = `
    SELECT
      c.*,
      m.nombre as materia_nombre,
      m.codigo as materia_codigo
    FROM contenidos c
    INNER JOIN materias m ON c.materia_id = m.id
    ${whereClause}
    ORDER BY c.semana, c.orden
  `;

    db.all(query, params, (err, contenidos) => {
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
            contenidos: Object.values(contenidosPorSemana)
        });
    });
});

// Obtener contenido actual (de la semana actual)
router.get('/actual', authenticateToken, (req, res) => {
    const semanaActual = Math.ceil((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24 * 7));

    const query = `
    SELECT
      c.*,
      m.nombre as materia_nombre,
      m.codigo as materia_codigo
    FROM contenidos c
    INNER JOIN materias m ON c.materia_id = m.id
    WHERE c.semana = ? AND c.activo = 1
    ORDER BY c.orden
  `;

    db.all(query, [semanaActual], (err, contenidos) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        res.json({
            semana: semanaActual,
            contenidos
        });
    });
});

// Obtener conteo de contenidos
router.get('/count', authenticateToken, (req, res) => {
    const { activo, materia_id, tipo_contenido } = req.query;

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

    if (tipo_contenido) {
        whereConditions.push('tipo_contenido = ?');
        params.push(tipo_contenido);
    }

    const whereClause = 'WHERE ' + whereConditions.join(' AND ');
    const query = `SELECT COUNT(*) as count FROM contenidos ${whereClause}`;

    db.get(query, params, (err, result) => {
        if (err) {
            console.error('Error al obtener conteo de contenidos:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        res.json({ count: result.count });
    });
});

// Obtener un contenido específico
router.get('/:id', authenticateToken, validateId, (req, res) => {
    const contenidoId = req.params.id;

    const query = `
    SELECT
      c.*,
      m.nombre as materia_nombre,
      m.codigo as materia_codigo
    FROM contenidos c
    INNER JOIN materias m ON c.materia_id = m.id
    WHERE c.id = ? AND c.activo = 1
  `;

    db.get(query, [contenidoId], (err, contenido) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (!contenido) {
            return res.status(404).json({ error: 'Contenido no encontrado' });
        }

        res.json(contenido);
    });
});

// Crear nuevo contenido (solo profesores y admin)
router.post('/', authenticateToken, isProfesor, validateContenido, async (req, res) => {
    const {
        materia_id,
        titulo,
        descripcion,
        semana,
        orden = 0,
        tipo_contenido,
        link_contenido,
        archivo_adjunto
    } = req.body;

    // Verificar que la materia existe
    db.get('SELECT id, nombre FROM materias WHERE id = ? AND activo = 1', [materia_id], async (err, materia) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (!materia) {
            return res.status(400).json({ error: 'Materia no encontrada' });
        }

        // Insertar contenido
        db.run(
            `INSERT INTO contenidos (
        materia_id, titulo, descripcion, semana, orden, tipo_contenido,
        link_contenido, archivo_adjunto
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [materia_id, titulo, descripcion, semana, orden, tipo_contenido, link_contenido, archivo_adjunto],
            async function (err) {
                if (err) {
                    return res.status(500).json({ error: 'Error al crear el contenido' });
                }

                const contenidoId = this.lastID;

                const contenido = {
                    id: contenidoId,
                    titulo,
                    descripcion,
                    semana,
                    orden,
                    tipo_contenido,
                    link_contenido,
                    archivo_adjunto
                };

                // Enviar notificación en tiempo real
                try {
                    await contenidoNotificationService.notifyContenidoCreado(contenido, materia, req.user.id);
                } catch (notificationError) {
                    console.error('Error al enviar notificación en tiempo real:', notificationError);
                    // No fallamos la operación principal por un error de notificación
                }

                // Enviar notificaciones por email a usuarios que tengan habilitadas las notificaciones
                try {
                    const contenidoEmail = {
                        id: contenidoId,
                        titulo,
                        descripcion,
                        semana,
                        tipo_contenido,
                        link_contenido,
                        materia_nombre: materia.nombre
                    };

                    // Obtener usuarios que quieren recibir notificaciones de contenidos
                    const usuariosQuery = `
            SELECT u.id, u.email, u.nombre, u.apellido
            FROM usuarios u
            INNER JOIN configuracion_notificaciones cn ON u.id = cn.usuario_id
            WHERE cn.notificar_contenidos = 1 AND u.activo = 1
          `;

                    db.all(usuariosQuery, [], async (err, usuarios) => {
                        if (err) {
                            console.error('Error obteniendo usuarios para notificaciones:', err);
                        } else {
                            // Enviar notificaciones por email
                            for (const usuario of usuarios) {
                                await emailService.sendContenidoNotification(
                                    usuario.email,
                                    usuario.nombre,
                                    contenido
                                );

                                // Crear notificación en la base de datos
                                db.run(
                                    `INSERT INTO notificaciones (
                    usuario_id, tipo, titulo, mensaje
                  ) VALUES (?, ?, ?, ?)`,
                                    [
                                        usuario.id,
                                        'contenido',
                                        `Nuevo contenido: ${titulo}`,
                                        `Se ha publicado nuevo contenido en ${materia.nombre} para la semana ${semana}`
                                    ]
                                );
                            }
                        }
                    });
                } catch (error) {
                    console.error('Error enviando notificaciones:', error);
                }

                res.status(201).json({
                    message: 'Contenido creado exitosamente',
                    id: contenidoId,
                    contenido: {
                        id: contenidoId,
                        materia_id,
                        titulo,
                        descripcion,
                        semana,
                        orden,
                        tipo_contenido,
                        link_contenido,
                        archivo_adjunto
                    }
                });
            }
        );
    });
});

// Actualizar contenido (solo profesores y admin)
router.put('/:id', authenticateToken, isProfesor, validateId, validateContenido, (req, res) => {
    const contenidoId = req.params.id;
    const {
        materia_id,
        titulo,
        descripcion,
        semana,
        orden,
        tipo_contenido,
        link_contenido,
        archivo_adjunto
    } = req.body;

    // Verificar que el contenido existe y obtener datos actuales
    db.get('SELECT * FROM contenidos WHERE id = ? AND activo = 1', [contenidoId], (err, contenidoActual) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (!contenidoActual) {
            return res.status(404).json({ error: 'Contenido no encontrado' });
        }

        // Verificar que la materia existe
        db.get('SELECT id, nombre, codigo FROM materias WHERE id = ? AND activo = 1', [materia_id], (err, materia) => {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            if (!materia) {
                return res.status(400).json({ error: 'Materia no encontrada' });
            }

            // Actualizar contenido
            db.run(
                `UPDATE contenidos SET
          materia_id = ?, titulo = ?, descripcion = ?, semana = ?, orden = ?,
          tipo_contenido = ?, link_contenido = ?, archivo_adjunto = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
                [materia_id, titulo, descripcion, semana, orden, tipo_contenido, link_contenido, archivo_adjunto, contenidoId],
                async function (err) {
                    if (err) {
                        return res.status(500).json({ error: 'Error al actualizar el contenido' });
                    }

                    const contenidoActualizado = {
                        id: contenidoId,
                        materia_id,
                        titulo,
                        descripcion,
                        semana,
                        orden,
                        tipo_contenido,
                        link_contenido,
                        archivo_adjunto
                    };

                    // Detectar cambios para la notificación
                    const cambios = {};
                    if (contenidoActual.titulo !== titulo) cambios.titulo = { anterior: contenidoActual.titulo, nuevo: titulo };
                    if (contenidoActual.descripcion !== descripcion) cambios.descripcion = { anterior: contenidoActual.descripcion, nuevo: descripcion };
                    if (contenidoActual.semana !== semana) cambios.semana = { anterior: contenidoActual.semana, nuevo: semana };
                    if (contenidoActual.orden !== orden) cambios.orden = { anterior: contenidoActual.orden, nuevo: orden };
                    if (contenidoActual.tipo_contenido !== tipo_contenido) cambios.tipo_contenido = { anterior: contenidoActual.tipo_contenido, nuevo: tipo_contenido };
                    if (contenidoActual.link_contenido !== link_contenido) cambios.link_contenido = { anterior: contenidoActual.link_contenido, nuevo: link_contenido };
                    if (contenidoActual.archivo_adjunto !== archivo_adjunto) cambios.archivo_adjunto = { anterior: contenidoActual.archivo_adjunto, nuevo: archivo_adjunto };

                    // Enviar notificación solo si hay cambios
                    if (Object.keys(cambios).length > 0) {
                        try {
                            await contenidoNotificationService.notifyContenidoActualizado(contenidoActualizado, materia, req.user.id, cambios);
                        } catch (notificationError) {
                            console.error('Error al enviar notificación:', notificationError);
                            // No fallamos la operación principal por un error de notificación
                        }
                    }

                    res.json({
                        message: 'Contenido actualizado exitosamente',
                        contenido: contenidoActualizado
                    });
                }
            );
        });
    });
});

// Eliminar contenido (solo profesores y admin)
router.delete('/:id', authenticateToken, isProfesor, validateId, (req, res) => {
    const contenidoId = req.params.id;

    // Obtener información del contenido antes de eliminarlo
    db.get('SELECT c.*, m.nombre as materia_nombre, m.codigo as materia_codigo FROM contenidos c INNER JOIN materias m ON c.materia_id = m.id WHERE c.id = ?', [contenidoId], (err, contenido) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (!contenido) {
            return res.status(404).json({ error: 'Contenido no encontrado' });
        }

        db.run('UPDATE contenidos SET activo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [contenidoId], async function (err) {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Contenido no encontrado' });
            }

            // Enviar notificación
            try {
                const materia = {
                    id: contenido.materia_id,
                    nombre: contenido.materia_nombre,
                    codigo: contenido.materia_codigo
                };
                await contenidoNotificationService.notifyContenidoEliminado(contenido, materia, req.user.id);
            } catch (notificationError) {
                console.error('Error al enviar notificación:', notificationError);
                // No fallamos la operación principal por un error de notificación
            }

            res.json({ message: 'Contenido eliminado exitosamente' });
        });
    });
});

// Buscar contenidos por título o descripción
router.get('/search/:query', authenticateToken, (req, res) => {
    const searchQuery = `%${req.params.query}%`;

    const query = `
    SELECT
      c.*,
      m.nombre as materia_nombre,
      m.codigo as materia_codigo
    FROM contenidos c
    INNER JOIN materias m ON c.materia_id = m.id
    WHERE (c.titulo LIKE ? OR c.descripcion LIKE ?) AND c.activo = 1
    ORDER BY c.semana DESC, c.orden
    LIMIT 20
  `;

    db.all(query, [searchQuery, searchQuery], (err, contenidos) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        res.json({ contenidos });
    });
});

// Obtener estadísticas de contenidos
router.get('/stats/overview', authenticateToken, (req, res) => {
    const statsQuery = `
    SELECT
      COUNT(*) as total_contenidos,
      COUNT(DISTINCT materia_id) as total_materias,
      COUNT(DISTINCT semana) as total_semanas,
      COUNT(CASE WHEN tipo_contenido = 'teoria' THEN 1 END) as contenidos_teoria,
      COUNT(CASE WHEN tipo_contenido = 'practica' THEN 1 END) as contenidos_practica,
      COUNT(CASE WHEN tipo_contenido = 'laboratorio' THEN 1 END) as contenidos_laboratorio,
      COUNT(CASE WHEN tipo_contenido = 'evaluacion' THEN 1 END) as contenidos_evaluacion
    FROM contenidos
    WHERE activo = 1
  `;

    db.get(statsQuery, [], (err, stats) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        res.json(stats);
    });
});

// Obtener contenidos por materia
router.get('/materia/:materiaId', authenticateToken, validateId, (req, res) => {
    const materiaId = req.params.materiaId;

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
        m.nombre as materia_nombre,
        m.codigo as materia_codigo
      FROM contenidos c
      INNER JOIN materias m ON c.materia_id = m.id
      WHERE c.materia_id = ? AND c.activo = 1
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
                contenidos: Object.values(contenidosPorSemana)
            });
        });
    });
});

module.exports = router;