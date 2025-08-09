const express = require('express');
const { db } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Obtener estadísticas generales
router.get('/', authenticateToken, (req, res) => {
    const query = `
        SELECT
            (SELECT COUNT(*) FROM materias WHERE activo = 1) as total_materias,
            (SELECT COUNT(*) FROM horarios WHERE activo = 1) as total_horarios,
            (SELECT COUNT(*) FROM contenidos WHERE activo = 1) as total_contenidos,
            (SELECT COUNT(*) FROM evaluaciones WHERE activo = 1) as total_evaluaciones,
            (SELECT COUNT(*) FROM profesores WHERE activo = 1) as total_profesores,
            (SELECT COUNT(*) FROM usuarios WHERE activo = 1) as total_usuarios,
            (SELECT COUNT(*) FROM notificaciones WHERE leida = 0) as notificaciones_pendientes
    `;

    db.get(query, (err, stats) => {
        if (err) {
            console.error('Error al obtener estadísticas generales:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        res.json({ stats });
    });
});

// Exportar estadísticas
router.get('/export', authenticateToken, (req, res) => {
    const { startDate, endDate, format = 'json' } = req.query;

    let dateFilter = '';
    let params = [];

    if (startDate && endDate) {
        dateFilter = 'WHERE created_at BETWEEN ? AND ?';
        params = [startDate, endDate];
    }

    const query = `
        SELECT
            'materias' as tipo,
            COUNT(*) as cantidad,
            COUNT(CASE WHEN activo = 1 THEN 1 END) as activos,
            COUNT(CASE WHEN activo = 0 THEN 1 END) as inactivos
        FROM materias
        ${dateFilter}

        UNION ALL

        SELECT
            'horarios' as tipo,
            COUNT(*) as cantidad,
            COUNT(CASE WHEN activo = 1 THEN 1 END) as activos,
            COUNT(CASE WHEN activo = 0 THEN 1 END) as inactivos
        FROM horarios
        ${dateFilter}

        UNION ALL

        SELECT
            'contenidos' as tipo,
            COUNT(*) as cantidad,
            COUNT(CASE WHEN activo = 1 THEN 1 END) as activos,
            COUNT(CASE WHEN activo = 0 THEN 1 END) as inactivos
        FROM contenidos
        ${dateFilter}

        UNION ALL

        SELECT
            'evaluaciones' as tipo,
            COUNT(*) as cantidad,
            COUNT(CASE WHEN activo = 1 THEN 1 END) as activos,
            COUNT(CASE WHEN activo = 0 THEN 1 END) as inactivos
        FROM evaluaciones
        ${dateFilter}
    `;

    db.all(query, params, (err, stats) => {
        if (err) {
            console.error('Error al exportar estadísticas:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        const exportData = {
            exportDate: new Date().toISOString(),
            dateRange: startDate && endDate ? { startDate, endDate } : null,
            statistics: stats
        };

        if (format === 'csv') {
            // Convertir a CSV
            const csvHeader = 'Tipo,Cantidad,Activos,Inactivos\n';
            const csvRows = stats.map(stat =>
                `${stat.tipo},${stat.cantidad},${stat.activos},${stat.inactivos}`
            ).join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=estadisticas.csv');
            res.send(csvHeader + csvRows);
        } else {
            res.json(exportData);
        }
    });
});

module.exports = router;