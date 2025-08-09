const request = require('supertest');
const express = require('express');
const { initializeDatabase } = require('../../database/init');
const authRoutes = require('../../routes/auth');
const { testUsers, createTestUser, clearDatabase, generateToken, expectError, expectSuccess } = require('../helpers/testUtils');

// Crear app de prueba
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
    let adminUser, profesorUser, estudianteUser;

    beforeAll(async () => {
        await initializeDatabase();
    });

    beforeEach(async () => {
        await clearDatabase();

        // Crear usuarios de prueba
        adminUser = await createTestUser(testUsers.admin);
        profesorUser = await createTestUser(testUsers.profesor);
        estudianteUser = await createTestUser(testUsers.estudiante);
    });

    afterAll(async () => {
        await clearDatabase();
    });

    describe('POST /register', () => {
        it('debería registrar un nuevo usuario exitosamente', async () => {
            const newUser = {
                email: 'nuevo@test.com',
                password: 'password123',
                nombre: 'Nuevo',
                apellido: 'Usuario'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(newUser);

            expectSuccess(response, 201);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe(newUser.email);
            expect(response.body.user.nombre).toBe(newUser.nombre);
            expect(response.body.user.apellido).toBe(newUser.apellido);
            expect(response.body.user.rol).toBe('estudiante'); // Rol por defecto
        });

        it('debería fallar si el email ya existe', async () => {
            const existingUser = {
                email: adminUser.email,
                password: 'password123',
                nombre: 'Otro',
                apellido: 'Usuario'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(existingUser);

            expectError(response, 400, 'El email ya está registrado');
        });

        it('debería fallar con datos inválidos', async () => {
            const invalidUser = {
                email: 'email-invalido',
                password: '123', // Muy corta
                nombre: '',
                apellido: ''
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(invalidUser);

            expectError(response, 400);
            expect(response.body).toHaveProperty('details');
        });

        it('debería fallar con campos faltantes', async () => {
            const incompleteUser = {
                email: 'test@test.com',
                password: 'password123'
                // Faltan nombre y apellido
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(incompleteUser);

            expectError(response, 400);
        });
    });

    describe('POST /login', () => {
        it('debería hacer login exitosamente con credenciales válidas', async () => {
            const loginData = {
                email: adminUser.email,
                password: testUsers.admin.password
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData);

            expectSuccess(response, 200);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe(adminUser.email);
            expect(response.body.user.rol).toBe(adminUser.rol);
        });

        it('debería fallar con credenciales incorrectas', async () => {
            const invalidLogin = {
                email: adminUser.email,
                password: 'password-incorrecto'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(invalidLogin);

            expectError(response, 401, 'Credenciales inválidas');
        });

        it('debería fallar con email que no existe', async () => {
            const nonExistentUser = {
                email: 'noexiste@test.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(nonExistentUser);

            expectError(response, 401, 'Credenciales inválidas');
        });

        it('debería fallar con datos inválidos', async () => {
            const invalidData = {
                email: 'email-invalido',
                password: '123'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(invalidData);

            expectError(response, 400);
        });
    });

    describe('GET /profile', () => {
        it('debería obtener el perfil del usuario autenticado', async () => {
            const token = generateToken(adminUser);

            const response = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('email');
            expect(response.body).toHaveProperty('nombre');
            expect(response.body).toHaveProperty('apellido');
            expect(response.body).toHaveProperty('rol');
            expect(response.body.email).toBe(adminUser.email);
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .get('/api/auth/profile');

            expectError(response, 401, 'Token de acceso requerido');
        });

        it('debería fallar con token inválido', async () => {
            const response = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', 'Bearer token-invalido');

            expectError(response, 403, 'Token inválido o expirado');
        });
    });

    describe('PUT /profile', () => {
        it('debería actualizar el perfil del usuario', async () => {
            const token = generateToken(adminUser);
            const updateData = {
                nombre: 'Nuevo Nombre',
                apellido: 'Nuevo Apellido'
            };

            const response = await request(app)
                .put('/api/auth/profile')
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            expectSuccess(response, 200);
            expect(response.body.nombre).toBe(updateData.nombre);
            expect(response.body.apellido).toBe(updateData.apellido);
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .put('/api/auth/profile')
                .send({ nombre: 'Nuevo' });

            expectError(response, 401, 'Token de acceso requerido');
        });

        it('debería fallar con datos inválidos', async () => {
            const token = generateToken(adminUser);
            const invalidData = {
                nombre: '',
                apellido: ''
            };

            const response = await request(app)
                .put('/api/auth/profile')
                .set('Authorization', `Bearer ${token}`)
                .send(invalidData);

            expectError(response, 400);
        });
    });

    describe('PUT /change-password', () => {
        it('debería cambiar la contraseña exitosamente', async () => {
            const token = generateToken(adminUser);
            const passwordData = {
                currentPassword: testUsers.admin.password,
                newPassword: 'nuevaPassword123'
            };

            const response = await request(app)
                .put('/api/auth/change-password')
                .set('Authorization', `Bearer ${token}`)
                .send(passwordData);

            expectSuccess(response, 200);
            expect(response.body.message).toBe('Contraseña actualizada exitosamente');
        });

        it('debería fallar con contraseña actual incorrecta', async () => {
            const token = generateToken(adminUser);
            const passwordData = {
                currentPassword: 'password-incorrecto',
                newPassword: 'nuevaPassword123'
            };

            const response = await request(app)
                .put('/api/auth/change-password')
                .set('Authorization', `Bearer ${token}`)
                .send(passwordData);

            expectError(response, 400, 'Contraseña actual incorrecta');
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .put('/api/auth/change-password')
                .send({
                    currentPassword: 'old',
                    newPassword: 'new'
                });

            expectError(response, 401, 'Token de acceso requerido');
        });

        it('debería fallar con nueva contraseña muy corta', async () => {
            const token = generateToken(adminUser);
            const passwordData = {
                currentPassword: testUsers.admin.password,
                newPassword: '123'
            };

            const response = await request(app)
                .put('/api/auth/change-password')
                .set('Authorization', `Bearer ${token}`)
                .send(passwordData);

            expectError(response, 400);
        });
    });

    describe('GET /users (Admin only)', () => {
        it('debería permitir a admin obtener lista de usuarios', async () => {
            const token = generateToken(adminUser);

            const response = await request(app)
                .get('/api/auth/users')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });

        it('debería denegar acceso a usuarios no admin', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/auth/users')
                .set('Authorization', `Bearer ${token}`);

            expectError(response, 403, 'Permisos insuficientes');
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .get('/api/auth/users');

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('GET /notifications/config', () => {
        it('debería obtener configuración de notificaciones del usuario', async () => {
            const token = generateToken(adminUser);

            const response = await request(app)
                .get('/api/auth/notifications/config')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(response.body).toHaveProperty('email_notificaciones');
            expect(response.body).toHaveProperty('app_notificaciones');
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .get('/api/auth/notifications/config');

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('PUT /notifications/config', () => {
        it('debería actualizar configuración de notificaciones', async () => {
            const token = generateToken(adminUser);
            const configData = {
                email_notificaciones: false,
                app_notificaciones: true
            };

            const response = await request(app)
                .put('/api/auth/notifications/config')
                .set('Authorization', `Bearer ${token}`)
                .send(configData);

            expectSuccess(response, 200);
            expect(response.body.email_notificaciones).toBe(configData.email_notificaciones);
            expect(response.body.app_notificaciones).toBe(configData.app_notificaciones);
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .put('/api/auth/notifications/config')
                .send({ email_notificaciones: false });

            expectError(response, 401, 'Token de acceso requerido');
        });
    });
});