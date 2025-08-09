const jwt = require('jsonwebtoken');
const { db } = require('../database/init');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido o expirado' });
        }

        // Verificar que el usuario existe y está activo
        db.get(
            'SELECT id, email, nombre, apellido, rol FROM usuarios WHERE id = ? AND activo = 1',
            [user.id],
            (err, row) => {
                if (err) {
                    return res.status(500).json({ error: 'Error interno del servidor' });
                }

                if (!row) {
                    return res.status(403).json({ error: 'Usuario no encontrado o inactivo' });
                }

                req.user = row;
                next();
            }
        );
    });
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Autenticación requerida' });
        }

        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({ error: 'Permisos insuficientes' });
        }

        next();
    };
};

const isAdmin = requireRole(['admin']);
const isProfesor = requireRole(['profesor', 'admin']);
const isEstudiante = requireRole(['estudiante', 'profesor', 'admin']);

module.exports = {
    authenticateToken,
    requireRole,
    isAdmin,
    isProfesor,
    isEstudiante
};