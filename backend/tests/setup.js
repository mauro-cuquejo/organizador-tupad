const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.test') });

// Configuración global para tests
global.testTimeout = 10000;

// Mock de console.log para tests más limpios
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
    // Silenciar logs durante los tests
    console.log = jest.fn();
    console.error = jest.fn();
});

afterAll(() => {
    // Restaurar console original
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
});

// Configuración de variables de entorno para tests
process.env.NODE_ENV = 'test';
process.env.DB_PATH = ':memory:'; // Usar base de datos en memoria para tests
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';
process.env.BCRYPT_ROUNDS = '4'; // Menos rondas para tests más rápidos
process.env.RATE_LIMIT_WINDOW_MS = '60000';
process.env.RATE_LIMIT_MAX_REQUESTS = '1000';