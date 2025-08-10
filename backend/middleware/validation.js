const { body, param, query, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Datos de entrada inválidos',
            details: errors.array()
        });
    }
    next();
};

// Validaciones para autenticación
const validateLogin = [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    handleValidationErrors
];

const validateRegister = [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('nombre').notEmpty().withMessage('El nombre es requerido'),
    body('apellido').notEmpty().withMessage('El apellido es requerido'),
    handleValidationErrors
];

// Validaciones para horarios
const validateHorario = [
    body('materia_id').isInt().withMessage('ID de materia inválido'),
    body('comision_id').isInt().withMessage('ID de comisión inválido'),
    body('profesor_id').isInt().withMessage('ID de profesor inválido'),
    body('dia_semana').isInt({ min: 1, max: 7 }).withMessage('Día de semana debe ser entre 1 y 7'),
    body('hora_inicio').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Formato de hora inválido (HH:MM)'),
    body('hora_fin').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Formato de hora inválido (HH:MM)'),
    body('tipo_clase').isIn(['teorica', 'practica', 'laboratorio']).withMessage('Tipo de clase inválido'),
    handleValidationErrors
];

// Validaciones para profesores
const validateProfesor = [
    body('nombre').notEmpty().withMessage('El nombre es requerido'),
    body('apellido').notEmpty().withMessage('El apellido es requerido'),
    body('email').isEmail().withMessage('Email inválido'),
    body('tipo').isIn(['profesor', 'asistente']).withMessage('Tipo inválido'),
    handleValidationErrors
];

// Validaciones para materias
const validateMateria = [
    body('nombre').notEmpty().withMessage('El nombre es requerido'),
    body('codigo').notEmpty().withMessage('El código es requerido'),
    body('creditos').isInt({ min: 0 }).withMessage('Los créditos deben ser un número entero positivo'),
    handleValidationErrors
];

// Validaciones para contenidos
const validateContenido = [
    body('materia_id').isInt().withMessage('ID de materia inválido'),
    body('titulo').notEmpty().withMessage('El título es requerido'),
    body('semana').isInt({ min: 1 }).withMessage('La semana debe ser un número entero positivo'),
    body('tipo_contenido').isIn(['teoria', 'practica', 'laboratorio', 'evaluacion']).withMessage('Tipo de contenido inválido'),
    handleValidationErrors
];

// Validaciones para evaluaciones
const validateEvaluacion = [
    body('materia_id').isInt().withMessage('ID de materia inválido'),
    body('titulo').notEmpty().withMessage('El título es requerido'),
    body('tipo_evaluacion').isIn(['parcial', 'final', 'trabajo_practico', 'laboratorio']).withMessage('Tipo de evaluación inválido'),
    body('fecha_evaluacion').isISO8601().withMessage('Fecha inválida'),
    body('peso').isFloat({ min: 0, max: 1 }).withMessage('El peso debe ser entre 0 y 1'),
    handleValidationErrors
];

// Validaciones para parámetros de consulta
const validatePagination = [
    query('page').optional().isInt({ min: 1 }).withMessage('Página debe ser un número entero positivo'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite debe ser entre 1 y 100'),
    handleValidationErrors
];

const validateId = [
    param('id').isInt().withMessage('ID inválido'),
    handleValidationErrors
];

const validateMateriaId = [
    param('materiaId').isInt().withMessage('ID de materia inválido'),
    handleValidationErrors
];

// Validaciones para filtros
const validateFiltrosHorarios = [
    query('dia_semana').optional().isInt({ min: 1, max: 7 }).withMessage('Día de semana debe ser entre 1 y 7'),
    query('materia_id').optional().isInt().withMessage('ID de materia inválido'),
    query('profesor_id').optional().isInt().withMessage('ID de profesor inválido'),
    handleValidationErrors
];

const validateFiltrosContenidos = [
    query('materia_id').optional().isInt().withMessage('ID de materia inválido'),
    query('semana').optional().isInt({ min: 1 }).withMessage('Semana debe ser un número entero positivo'),
    query('tipo_contenido').optional().isIn(['teoria', 'practica', 'laboratorio', 'evaluacion']).withMessage('Tipo de contenido inválido'),
    handleValidationErrors
];

module.exports = {
    handleValidationErrors,
    validateLogin,
    validateRegister,
    validateHorario,
    validateProfesor,
    validateMateria,
    validateContenido,
    validateEvaluacion,
    validatePagination,
    validateId,
    validateMateriaId,
    validateFiltrosHorarios,
    validateFiltrosContenidos
};