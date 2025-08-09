const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db } = require('../../database/init');

// Datos de prueba
const testUsers = {
    admin: {
        email: 'admin@test.com',
        password: 'password123',
        nombre: 'Admin',
        apellido: 'Test',
        rol: 'admin'
    },
    profesor: {
        email: 'profesor@test.com',
        password: 'password123',
        nombre: 'Profesor',
        apellido: 'Test',
        rol: 'profesor'
    },
    estudiante: {
        email: 'estudiante@test.com',
        password: 'password123',
        nombre: 'Estudiante',
        apellido: 'Test',
        rol: 'estudiante'
    }
};

// Función para crear token JWT
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, rol: user.rol },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

// Función para crear usuario de prueba
const createTestUser = async (userData) => {
    const hashedPassword = await bcrypt.hash(userData.password, parseInt(process.env.BCRYPT_ROUNDS));

    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO usuarios (email, password, nombre, apellido, rol) VALUES (?, ?, ?, ?, ?)',
            [userData.email, hashedPassword, userData.nombre, userData.apellido, userData.rol],
            function (err) {
                if (err) {
                    reject(err);
                } else {
                    const user = {
                        id: this.lastID,
                        ...userData,
                        password: hashedPassword
                    };
                    resolve(user);
                }
            }
        );
    });
};

// Función para limpiar la base de datos
const clearDatabase = async () => {
    const tables = [
        'notificaciones',
        'configuracion_notificaciones',
        'notas',
        'evaluaciones',
        'contenidos',
        'horarios',
        'comisiones',
        'profesores',
        'materias',
        'usuarios'
    ];

    for (const table of tables) {
        await new Promise((resolve, reject) => {
            db.run(`DELETE FROM ${table}`, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
};

// Función para crear datos de prueba básicos
const createTestData = async () => {
    // Crear materias de prueba
    const materias = [
        { nombre: 'Matemática I', codigo: 'MAT1', descripcion: 'Matemática básica', creditos: 6 },
        { nombre: 'Programación I', codigo: 'PROG1', descripcion: 'Programación básica', creditos: 6 },
        { nombre: 'Física I', codigo: 'FIS1', descripcion: 'Física básica', creditos: 6 }
    ];

    for (const materia of materias) {
        await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO materias (nombre, codigo, descripcion, creditos) VALUES (?, ?, ?, ?)',
                [materia.nombre, materia.codigo, materia.descripcion, materia.creditos],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }

    // Crear profesores de prueba
    const profesores = [
        { nombre: 'Juan', apellido: 'Pérez', email: 'juan.perez@test.com', tipo: 'profesor', telefono: '123456789' },
        { nombre: 'María', apellido: 'González', email: 'maria.gonzalez@test.com', tipo: 'profesor', telefono: '987654321' }
    ];

    for (const profesor of profesores) {
        await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO profesores (nombre, apellido, email, tipo, telefono) VALUES (?, ?, ?, ?, ?)',
                [profesor.nombre, profesor.apellido, profesor.email, profesor.tipo, profesor.telefono],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }

    // Crear comisiones de prueba
    const comisiones = [
        { materia_id: 1, nombre: 'Comisión A', capacidad: 30 },
        { materia_id: 2, nombre: 'Comisión A', capacidad: 25 },
        { materia_id: 3, nombre: 'Comisión A', capacidad: 35 }
    ];

    for (const comision of comisiones) {
        await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO comisiones (materia_id, nombre, capacidad) VALUES (?, ?, ?)',
                [comision.materia_id, comision.nombre, comision.capacidad],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }

    // Crear horarios de prueba
    const horarios = [
        { materia_id: 1, comision_id: 1, profesor_id: 1, dia_semana: 1, hora_inicio: '08:00', hora_fin: '10:00', tipo_clase: 'teorica', link_reunion: 'https://meet.google.com/test', tipo_reunion: 'meet' },
        { materia_id: 2, comision_id: 2, profesor_id: 2, dia_semana: 2, hora_inicio: '14:00', hora_fin: '16:00', tipo_clase: 'practica', link_reunion: 'https://teams.microsoft.com/test', tipo_reunion: 'teams' }
    ];

    for (const horario of horarios) {
        await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO horarios (materia_id, comision_id, profesor_id, dia_semana, hora_inicio, hora_fin, tipo_clase, link_reunion, tipo_reunion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [horario.materia_id, horario.comision_id, horario.profesor_id, horario.dia_semana, horario.hora_inicio, horario.hora_fin, horario.tipo_clase, horario.link_reunion, horario.tipo_reunion],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }
};

// Función para hacer requests HTTP de prueba
const makeRequest = (app, method, url, data = null, token = null) => {
    const request = require('supertest')(app);
    let req = request[method.toLowerCase()](url);

    if (token) {
        req = req.set('Authorization', `Bearer ${token}`);
    }

    if (data) {
        if (method === 'GET') {
            req = req.query(data);
        } else {
            req = req.send(data);
        }
    }

    return req;
};

// Función para validar respuesta de error
const expectError = (response, statusCode, errorMessage) => {
    expect(response.status).toBe(statusCode);
    expect(response.body).toHaveProperty('error');
    if (errorMessage) {
        expect(response.body.error).toBe(errorMessage);
    }
};

// Función para validar respuesta exitosa
const expectSuccess = (response, statusCode = 200) => {
    expect(response.status).toBe(statusCode);
    expect(response.body).not.toHaveProperty('error');
};

module.exports = {
    testUsers,
    generateToken,
    createTestUser,
    clearDatabase,
    createTestData,
    makeRequest,
    expectError,
    expectSuccess
};