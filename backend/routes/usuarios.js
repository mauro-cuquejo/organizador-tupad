const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../database/init');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const { validateId } = require('../middleware/validation');

const router = express.Router();

// Obtener todos los usuarios (solo administradores)
router.get('/', authenticateToken, isAdmin, (req, res) => {
    const query = `
        SELECT id, email, nombre, apellido, rol, activo,
               created_at, updated_at
        FROM usuarios
        ORDER BY created_at DESC
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error al obtener usuarios:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        res.json({
            usuarios: rows,
            total: rows.length
        });
    });
});

// Obtener un usuario específico (solo administradores)
router.get('/:id', authenticateToken, isAdmin, validateId, (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT id, email, nombre, apellido, rol, activo,
               created_at, updated_at
        FROM usuarios
        WHERE id = ?
    `;

    db.get(query, [id], (err, row) => {
        if (err) {
            console.error('Error al obtener usuario:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (!row) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ usuario: row });
    });
});

// Actualizar rol de usuario (solo administradores)
router.patch('/:id/rol', authenticateToken, isAdmin, validateId, (req, res) => {
    const { id } = req.params;
    const { rol } = req.body;

    // Validar rol
    const rolesValidos = ['estudiante', 'profesor', 'admin'];
    if (!rolesValidos.includes(rol)) {
        return res.status(400).json({ error: 'Rol inválido' });
    }

    // Verificar que no se cambie el rol del último administrador
    if (rol !== 'admin') {
        db.get('SELECT COUNT(*) as count FROM usuarios WHERE rol = ?', ['admin'], (err, row) => {
            if (err) {
                console.error('Error al verificar administradores:', err);
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            if (row.count <= 1) {
                return res.status(400).json({
                    error: 'No se puede cambiar el rol del último administrador del sistema'
                });
            }

            updateUserRole();
        });
    } else {
        updateUserRole();
    }

    function updateUserRole() {
        const query = `
            UPDATE usuarios
            SET rol = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        db.run(query, [rol, id], function (err) {
            if (err) {
                console.error('Error al actualizar rol:', err);
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.json({
                message: 'Rol actualizado exitosamente',
                usuario: { id, rol }
            });
        });
    }
});

// Activar/desactivar usuario (solo administradores)
router.patch('/:id/estado', authenticateToken, isAdmin, validateId, (req, res) => {
    const { id } = req.params;
    const { activo } = req.body;

    // Validar estado
    if (typeof activo !== 'boolean') {
        return res.status(400).json({ error: 'Estado inválido' });
    }

    // Verificar que no se desactive el último administrador
    if (!activo) {
        db.get('SELECT rol FROM usuarios WHERE id = ?', [id], (err, row) => {
            if (err) {
                console.error('Error al verificar rol del usuario:', err);
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            if (row && row.rol === 'admin') {
                db.get('SELECT COUNT(*) as count FROM usuarios WHERE rol = ? AND activo = 1', ['admin'], (err, adminRow) => {
                    if (err) {
                        console.error('Error al verificar administradores activos:', err);
                        return res.status(500).json({ error: 'Error interno del servidor' });
                    }

                    if (adminRow.count <= 1) {
                        return res.status(400).json({
                            error: 'No se puede desactivar el último administrador del sistema'
                        });
                    }

                    updateUserStatus();
                });
            } else {
                updateUserStatus();
            }
        });
    } else {
        updateUserStatus();
    }

    function updateUserStatus() {
        const query = `
            UPDATE usuarios
            SET activo = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        db.run(query, [activo ? 1 : 0, id], function (err) {
            if (err) {
                console.error('Error al actualizar estado:', err);
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.json({
                message: `Usuario ${activo ? 'activado' : 'desactivado'} exitosamente`,
                usuario: { id, activo }
            });
        });
    }
});

// Cambiar contraseña de usuario (solo administradores)
router.patch('/:id/password', authenticateToken, isAdmin, validateId, async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    // Validar contraseña
    if (!password || password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    try {
        // Encriptar nueva contraseña
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const query = `
            UPDATE usuarios
            SET password = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        db.run(query, [hashedPassword, id], function (err) {
            if (err) {
                console.error('Error al actualizar contraseña:', err);
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.json({
                message: 'Contraseña actualizada exitosamente',
                usuario: { id }
            });
        });
    } catch (error) {
        console.error('Error al encriptar contraseña:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Eliminar usuario (solo administradores)
router.delete('/:id', authenticateToken, isAdmin, validateId, (req, res) => {
    const { id } = req.params;

    // Verificar que no se elimine el último administrador
    db.get('SELECT rol FROM usuarios WHERE id = ?', [id], (err, row) => {
        if (err) {
            console.error('Error al verificar rol del usuario:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (row && row.rol === 'admin') {
            db.get('SELECT COUNT(*) as count FROM usuarios WHERE rol = ?', ['admin'], (err, adminRow) => {
                if (err) {
                    console.error('Error al verificar administradores:', err);
                    return res.status(500).json({ error: 'Error interno del servidor' });
                }

                if (adminRow.count <= 1) {
                    return res.status(400).json({
                        error: 'No se puede eliminar el último administrador del sistema'
                    });
                }

                deleteUser();
            });
        } else {
            deleteUser();
        }
    });

    function deleteUser() {
        // Eliminar en cascada (configuraciones de notificaciones, etc.)
        db.run('DELETE FROM configuracion_notificaciones WHERE usuario_id = ?', [id], (err) => {
            if (err) {
                console.warn('Error al eliminar configuraciones de notificaciones:', err);
            }
        });

        // Eliminar usuario
        db.run('DELETE FROM usuarios WHERE id = ?', [id], function (err) {
            if (err) {
                console.error('Error al eliminar usuario:', err);
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.json({
                message: 'Usuario eliminado exitosamente',
                usuario: { id }
            });
        });
    }
});

// Obtener estadísticas de usuarios (solo administradores)
router.get('/stats/overview', authenticateToken, isAdmin, (req, res) => {
    const queries = {
        total: 'SELECT COUNT(*) as count FROM usuarios',
        activos: 'SELECT COUNT(*) as count FROM usuarios WHERE activo = 1',
        inactivos: 'SELECT COUNT(*) as count FROM usuarios WHERE activo = 0',
        estudiantes: 'SELECT COUNT(*) as count FROM usuarios WHERE rol = ?',
        profesores: 'SELECT COUNT(*) as count FROM usuarios WHERE rol = ?',
        administradores: 'SELECT COUNT(*) as count FROM usuarios WHERE rol = ?',
        recientes: 'SELECT COUNT(*) as count FROM usuarios WHERE created_at >= datetime("now", "-7 days")'
    };

    const stats = {};

    // Ejecutar todas las consultas
    const promises = Object.keys(queries).map(key => {
        return new Promise((resolve, reject) => {
            const query = queries[key];
            const params = key === 'estudiantes' ? ['estudiante'] :
                key === 'profesores' ? ['profesor'] :
                    key === 'administradores' ? ['admin'] : [];

            db.get(query, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    stats[key] = row.count;
                    resolve();
                }
            });
        });
    });

    Promise.all(promises)
        .then(() => {
            res.json({ stats });
        })
        .catch(err => {
            console.error('Error al obtener estadísticas:', err);
            res.status(500).json({ error: 'Error interno del servidor' });
        });
});

module.exports = router;