const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../database/init');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const { validateLogin, validateRegister, validateId } = require('../middleware/validation');
const emailService = require('../services/emailService');

const router = express.Router();

// Registro de usuario
router.post('/register', validateRegister, async (req, res) => {
    try {
        const { email, password, nombre, apellido, rol = 'estudiante' } = req.body;

        // Forzar rol de estudiante para registros públicos (no permitir admin)
        const finalRol = rol === 'admin' ? 'estudiante' : rol;

        // Verificar si el usuario ya existe
        db.get('SELECT id FROM usuarios WHERE email = ?', [email], async (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            if (row) {
                return res.status(400).json({ error: 'El email ya está registrado' });
            }

            // Encriptar contraseña
            const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Insertar nuevo usuario
            db.run(
                'INSERT INTO usuarios (email, password, nombre, apellido, rol) VALUES (?, ?, ?, ?, ?)',
                [email, hashedPassword, nombre, apellido, finalRol],
                function (err) {
                    if (err) {
                        return res.status(500).json({ error: 'Error al crear el usuario' });
                    }

                    const userId = this.lastID;

                    // Crear configuración de notificaciones por defecto
                    db.run(
                        'INSERT INTO configuracion_notificaciones (usuario_id) VALUES (?)',
                        [userId]
                    );

                    // Generar token JWT
                    const token = jwt.sign(
                        { id: userId, email, rol },
                        process.env.JWT_SECRET,
                        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
                    );

                    // Enviar email de bienvenida
                    emailService.sendWelcomeEmail(email, nombre);

                    res.status(201).json({
                        message: 'Usuario registrado exitosamente',
                        token,
                        user: {
                            id: userId,
                            email,
                            nombre,
                            apellido,
                            rol: finalRol
                        }
                    });
                }
            );
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Login de usuario
router.post('/login', validateLogin, (req, res) => {
    const { email, password } = req.body;

    db.get(
        'SELECT id, email, password, nombre, apellido, rol, activo FROM usuarios WHERE email = ?',
        [email],
        async (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            if (!user) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            if (!user.activo) {
                return res.status(401).json({ error: 'Usuario inactivo' });
            }

            // Verificar contraseña
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            // Generar token JWT
            const token = jwt.sign(
                { id: user.id, email: user.email, rol: user.rol },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
            );

            res.json({
                message: 'Login exitoso',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    nombre: user.nombre,
                    apellido: user.apellido,
                    rol: user.rol
                }
            });
        }
    );
});

// Obtener perfil del usuario autenticado
router.get('/profile', authenticateToken, (req, res) => {
    res.json({
        user: req.user
    });
});

// Actualizar perfil del usuario
router.put('/profile', authenticateToken, (req, res) => {
    const { nombre, apellido } = req.body;
    const userId = req.user.id;

    if (!nombre || !apellido) {
        return res.status(400).json({ error: 'Nombre y apellido son requeridos' });
    }

    db.run(
        'UPDATE usuarios SET nombre = ?, apellido = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [nombre, apellido, userId],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Error al actualizar el perfil' });
            }

            res.json({
                message: 'Perfil actualizado exitosamente',
                user: {
                    id: userId,
                    email: req.user.email,
                    nombre,
                    apellido,
                    rol: req.user.rol
                }
            });
        }
    );
});

// Cambiar contraseña
router.put('/change-password', authenticateToken, (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Contraseña actual y nueva son requeridas' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar contraseña actual
    db.get('SELECT password FROM usuarios WHERE id = ?', [userId], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Contraseña actual incorrecta' });
        }

        // Encriptar nueva contraseña
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Actualizar contraseña
        db.run(
            'UPDATE usuarios SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [hashedNewPassword, userId],
            function (err) {
                if (err) {
                    return res.status(500).json({ error: 'Error al cambiar la contraseña' });
                }

                res.json({ message: 'Contraseña cambiada exitosamente' });
            }
        );
    });
});

// Obtener configuración de notificaciones
router.get('/notifications/config', authenticateToken, (req, res) => {
    const userId = req.user.id;

    db.get(
        'SELECT * FROM configuracion_notificaciones WHERE usuario_id = ?',
        [userId],
        (err, config) => {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            if (!config) {
                // Crear configuración por defecto si no existe
                db.run(
                    'INSERT INTO configuracion_notificaciones (usuario_id) VALUES (?)',
                    [userId],
                    function (err) {
                        if (err) {
                            return res.status(500).json({ error: 'Error al crear configuración' });
                        }

                        res.json({
                            notificar_contenidos: true,
                            notificar_evaluaciones: true,
                            notificar_recordatorios: true,
                            frecuencia_email: 'diaria'
                        });
                    }
                );
            } else {
                res.json(config);
            }
        }
    );
});

// Actualizar configuración de notificaciones
router.put('/notifications/config', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { notificar_contenidos, notificar_evaluaciones, notificar_recordatorios, frecuencia_email } = req.body;

    db.run(
        `UPDATE configuracion_notificaciones
     SET notificar_contenidos = ?, notificar_evaluaciones = ?, notificar_recordatorios = ?,
         frecuencia_email = ?, updated_at = CURRENT_TIMESTAMP
     WHERE usuario_id = ?`,
        [notificar_contenidos, notificar_evaluaciones, notificar_recordatorios, frecuencia_email, userId],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Error al actualizar configuración' });
            }

            res.json({ message: 'Configuración actualizada exitosamente' });
        }
    );
});

// Obtener notificaciones del usuario
router.get('/notifications', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    db.all(
        `SELECT * FROM notificaciones
     WHERE usuario_id = ?
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
        [userId, limit, offset],
        (err, notifications) => {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            // Contar total de notificaciones
            db.get(
                'SELECT COUNT(*) as total FROM notificaciones WHERE usuario_id = ?',
                [userId],
                (err, count) => {
                    if (err) {
                        return res.status(500).json({ error: 'Error interno del servidor' });
                    }

                    res.json({
                        notifications,
                        pagination: {
                            page: parseInt(page),
                            limit: parseInt(limit),
                            total: count.total,
                            pages: Math.ceil(count.total / limit)
                        }
                    });
                }
            );
        }
    );
});

// Marcar notificación como leída
router.put('/notifications/:id/read', authenticateToken, validateId, (req, res) => {
    const userId = req.user.id;
    const notificationId = req.params.id;

    db.run(
        'UPDATE notificaciones SET leida = 1 WHERE id = ? AND usuario_id = ?',
        [notificationId, userId],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Notificación no encontrada' });
            }

            res.json({ message: 'Notificación marcada como leída' });
        }
    );
});

// Rutas solo para administradores
router.get('/users', authenticateToken, isAdmin, (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    db.all(
        `SELECT id, email, nombre, apellido, rol, activo, created_at
     FROM usuarios
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
        [limit, offset],
        (err, users) => {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            db.get('SELECT COUNT(*) as total FROM usuarios', (err, count) => {
                if (err) {
                    return res.status(500).json({ error: 'Error interno del servidor' });
                }

                res.json({
                    users,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: count.total,
                        pages: Math.ceil(count.total / limit)
                    }
                });
            });
        }
    );
});

// Exportar datos del usuario
router.get('/export-data', authenticateToken, (req, res) => {
    const userId = req.user.id;

    // Obtener datos del usuario
    db.get('SELECT id, email, nombre, apellido, rol, created_at FROM usuarios WHERE id = ?', [userId], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Obtener datos relacionados
        db.all('SELECT * FROM notificaciones WHERE usuario_id = ? ORDER BY created_at DESC', [userId], (err, notifications) => {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            const userData = {
                user: {
                    ...user,
                    password: undefined // No incluir contraseña
                },
                notifications: notifications,
                exportDate: new Date().toISOString()
            };

            res.json(userData);
        });
    });
});

// Eliminar cuenta del usuario
router.delete('/account', authenticateToken, (req, res) => {
    const userId = req.user.id;

    // Verificar que no sea el último administrador
    db.get('SELECT COUNT(*) as adminCount FROM usuarios WHERE rol = "admin" AND activo = 1', (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        db.get('SELECT rol FROM usuarios WHERE id = ?', [userId], (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            if (user.rol === 'admin' && result.adminCount <= 1) {
                return res.status(400).json({
                    error: 'No se puede eliminar el último administrador del sistema'
                });
            }

            // Marcar usuario como inactivo
            db.run('UPDATE usuarios SET activo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [userId], function (err) {
                if (err) {
                    return res.status(500).json({ error: 'Error interno del servidor' });
                }

                res.json({ message: 'Cuenta eliminada exitosamente' });
            });
        });
    });
});

module.exports = router;