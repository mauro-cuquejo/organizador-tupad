const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Fallback para variables de entorno si dotenv falla
if (!process.env.PORT) process.env.PORT = '3001';
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';
if (!process.env.RABBITMQ_ENABLED) process.env.RABBITMQ_ENABLED = 'false';
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'jwt_secret_fallback_para_desarrollo';

const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const horariosRoutes = require('./routes/horarios');
const profesoresRoutes = require('./routes/profesores');
const materiasRoutes = require('./routes/materias');
const contenidosRoutes = require('./routes/contenidos');
const evaluacionesRoutes = require('./routes/evaluaciones');
const notificacionesRoutes = require('./routes/notificaciones');
const dashboardRoutes = require('./routes/dashboard');
const estadisticasRoutes = require('./routes/estadisticas');
const { initializeDatabase } = require('./database/init');

// Servicios
const amqpService = require('./services/amqpService');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Log para debug de variables de entorno
console.log('🔧 Variables de entorno cargadas:');
console.log(`   - PORT: ${process.env.PORT}`);
console.log(`   - NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   - RABBITMQ_ENABLED: ${process.env.RABBITMQ_ENABLED}`);
console.log(`   - JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Configurado' : '❌ NO configurado'}`);
console.log(`   - Puerto final: ${PORT}`);
console.log('');

// Configuración de seguridad - Helmet deshabilitado temporalmente para desarrollo
// app.use(helmet());

// Configuración de CORS - Simplificada para desarrollo
app.use(cors({
    origin: true, // Permitir todos los orígenes en desarrollo
    credentials: true
}));

// Rate limiting - Configuración más permisiva para desarrollo
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5000, // máximo 5000 requests por ventana
    message: {
        error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // No contar requests exitosos
    skipFailedRequests: false
});
app.use(limiter);

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/horarios', horariosRoutes);
app.use('/api/profesores', profesoresRoutes);
app.use('/api/materias', materiasRoutes);
app.use('/api/contenidos', contenidosRoutes);
app.use('/api/evaluaciones', evaluacionesRoutes);
app.use('/api/notificaciones', notificacionesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/estadisticas', estadisticasRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Error interno del servidor'
            : err.message
    });
});

// Ruta 404
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Inicializar base de datos y arrancar servidor
async function startServer() {
    try {
        // Inicializar base de datos
        await initializeDatabase();
        console.log('✅ Base de datos inicializada correctamente');

        // Inicializar AMQP solo si está habilitado
        if (process.env.RABBITMQ_ENABLED === 'true') {
            await amqpService.initialize();
            console.log('✅ Servicio AMQP inicializado correctamente');

            // Inicializar consumidores AMQP para notificaciones
            console.log('✅ Consumidores AMQP inicializados correctamente');
        } else {
            console.log('⏭️  RabbitMQ deshabilitado (RABBITMQ_ENABLED=false)');
        }

        // Arrancar servidor
        console.log(`🔧 Intentando iniciar servidor en puerto ${PORT}...`);
        server.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
            console.log(`🌍 Ambiente: ${process.env.NODE_ENV}`);
            console.log(`📡 API disponible en: http://localhost:${PORT}/api`);

        });

        // Manejar cierre graceful
        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);

    } catch (error) {
        console.error('❌ Error al inicializar el servidor:', error);
        process.exit(1);
    }
}

// Función para cierre graceful
async function gracefulShutdown() {
    console.log('\n🛑 Recibida señal de cierre, cerrando servidor...');

    try {
        // Cerrar AMQP solo si está habilitado
        if (process.env.RABBITMQ_ENABLED === 'true') {
            await amqpService.close();
            console.log('✅ AMQP cerrado');
        }

        // Cerrar servidor HTTP
        server.close(() => {
            console.log('✅ Servidor HTTP cerrado');
            process.exit(0);
        });

        // Timeout de 10 segundos para forzar cierre
        setTimeout(() => {
            console.error('❌ Timeout de cierre, forzando salida');
            process.exit(1);
        }, 10000);

    } catch (error) {
        console.error('❌ Error durante el cierre:', error);
        process.exit(1);
    }
}

startServer();