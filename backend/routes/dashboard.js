const express = require('express');
const { db } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Obtener actividad reciente
router.get('/activity', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    const query = `
        SELECT
            'evaluacion' as tipo,
            e.id,
            e.titulo as titulo,
            e.fecha_evaluacion as fecha,
            e.materia_id,
            m.nombre as materia_nombre,
            'Nueva evaluación programada' as descripcion
        FROM evaluaciones e
        JOIN materias m ON e.materia_id = m.id
        WHERE e.activo = 1 AND e.fecha_evaluacion >= date('now', '-7 days')

        UNION ALL

        SELECT
            'contenido' as tipo,
            c.id,
            c.titulo as titulo,
            c.created_at as fecha,
            c.materia_id,
            m.nombre as materia_nombre,
            'Nuevo contenido disponible' as descripcion
        FROM contenidos c
        JOIN materias m ON c.materia_id = m.id
        WHERE c.activo = 1 AND c.created_at >= datetime('now', '-7 days')

        ORDER BY fecha DESC
        LIMIT ?
    `;

    db.all(query, [limit], (err, activities) => {
        if (err) {
            console.error('Error al obtener actividad:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        res.json({ activities });
    });
});

// Obtener eventos próximos
router.get('/upcoming', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 5;

    const query = `
        SELECT
            'evaluacion' as tipo,
            e.id,
            e.titulo as titulo,
            e.fecha_evaluacion as fecha,
            e.hora_inicio,
            e.materia_id,
            m.nombre as materia_nombre,
            'Evaluación programada' as descripcion
        FROM evaluaciones e
        JOIN materias m ON e.materia_id = m.id
        WHERE e.activo = 1 AND e.fecha_evaluacion >= date('now')

        UNION ALL

        SELECT
            'horario' as tipo,
            h.id,
            CONCAT(m.nombre, ' - ', h.tipo_clase) as titulo,
            date('now') as fecha,
            h.hora_inicio,
            h.materia_id,
            m.nombre as materia_nombre,
            CONCAT('Clase de ', h.tipo_clase) as descripcion
        FROM horarios h
        JOIN materias m ON h.materia_id = m.id
        WHERE h.activo = 1 AND h.dia_semana = strftime('%w', 'now')

        ORDER BY fecha ASC, hora_inicio ASC
        LIMIT ?
    `;

    db.all(query, [limit], (err, upcoming) => {
        if (err) {
            console.error('Error al obtener eventos próximos:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        res.json({ upcoming });
    });
});

// Obtener estadísticas del dashboard
router.get('/stats', (req, res) => {
    // const userId = req.user.id; // Temporalmente comentado para testing

    const query = `
        SELECT
            (SELECT COUNT(*) FROM materias WHERE activo = 1) as total_materias,
            (SELECT COUNT(*) FROM horarios WHERE activo = 1) as total_horarios,
            (SELECT COUNT(*) FROM contenidos WHERE activo = 1) as total_contenidos,
            (SELECT COUNT(*) FROM evaluaciones WHERE activo = 1) as total_evaluaciones,
            (SELECT COUNT(*) FROM evaluaciones WHERE activo = 1 AND fecha_evaluacion >= date('now')) as evaluaciones_proximas,
            (SELECT COUNT(*) FROM contenidos WHERE activo = 1 AND created_at >= datetime('now', '-7 days')) as contenidos_recientes
    `;

    db.get(query, (err, stats) => {
        if (err) {
            console.error('Error al obtener estadísticas:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        res.json({ stats });
    });
});

module.exports = router;