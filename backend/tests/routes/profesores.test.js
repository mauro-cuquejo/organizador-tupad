const request = require('supertest');
const express = require('express');
const { initializeDatabase } = require('../../database/init');
const profesoresRoutes = require('../../routes/profesores');
const { testUsers, createTestUser, clearDatabase, createTestData, generateToken, expectError, expectSuccess } = require('../helpers/testUtils');

// Crear app de prueba
const app = express();
app.use(express.json());
app.use('/api/profesores', profesoresRoutes);

describe('Profesores Routes', () => {
    let adminUser, profesorUser, estudianteUser;

    beforeAll(async () => {
        await initializeDatabase();
    });

    beforeEach(async () => {
        await clearDatabase();
        await createTestData();

        // Crear usuarios de prueba
        adminUser = await createTestUser(testUsers.admin);
        profesorUser = await createTestUser(testUsers.profesor);
        estudianteUser = await createTestUser(testUsers.estudiante);
    });

    afterAll(async () => {
        await clearDatabase();
    });

    describe('GET /', () => {
        it('debería obtener todos los profesores', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/profesores')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });

        it('debería filtrar profesores por tipo', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/profesores')
                .query({ tipo: 'profesor' })
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach(profesor => {
                expect(profesor.tipo).toBe('profesor');
            });
        });

        it('debería buscar profesores por nombre', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/profesores')
                .query({ search: 'Juan' })
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach(profesor => {
                expect(profesor.nombre.toLowerCase()).toContain('juan');
            });
        });

        it('debería paginar resultados', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/profesores')
                .query({ page: 1, limit: 5 })
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeLessThanOrEqual(5);
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .get('/api/profesores');

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('GET /search/:query', () => {
        it('debería buscar profesores por query', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/profesores/search/Juan')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach(profesor => {
                expect(profesor.nombre.toLowerCase()).toContain('juan');
            });
        });

        it('debería retornar array vacío si no encuentra resultados', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/profesores/search/NoExiste')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(0);
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .get('/api/profesores/search/Juan');

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('GET /:id', () => {
        it('debería obtener un profesor específico con detalles', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/profesores/1')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('nombre');
            expect(response.body).toHaveProperty('apellido');
            expect(response.body).toHaveProperty('email');
            expect(response.body).toHaveProperty('tipo');
            expect(response.body).toHaveProperty('materias');
            expect(response.body).toHaveProperty('horarios');
        });

        it('debería fallar con profesor que no existe', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/profesores/999')
                .set('Authorization', `Bearer ${token}`);

            expectError(response, 404, 'Profesor no encontrado');
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .get('/api/profesores/1');

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('GET /:id/horarios', () => {
        it('debería obtener horarios de un profesor específico', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/profesores/1/horarios')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach(horario => {
                expect(horario.profesor_id).toBe(1);
            });
        });

        it('debería fallar con profesor que no existe', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/profesores/999/horarios')
                .set('Authorization', `Bearer ${token}`);

            expectError(response, 404, 'Profesor no encontrado');
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .get('/api/profesores/1/horarios');

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('GET /:id/materias', () => {
        it('debería obtener materias de un profesor específico', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/profesores/1/materias')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it('debería fallar con profesor que no existe', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/profesores/999/materias')
                .set('Authorization', `Bearer ${token}`);

            expectError(response, 404, 'Profesor no encontrado');
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .get('/api/profesores/1/materias');

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('POST /', () => {
        it('debería crear un nuevo profesor (admin)', async () => {
            const token = generateToken(adminUser);
            const newProfesor = {
                nombre: 'Nuevo',
                apellido: 'Profesor',
                email: 'nuevo.profesor@test.com',
                tipo: 'profesor',
                telefono: '123456789'
            };

            const response = await request(app)
                .post('/api/profesores')
                .set('Authorization', `Bearer ${token}`)
                .send(newProfesor);

            expectSuccess(response, 201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.nombre).toBe(newProfesor.nombre);
            expect(response.body.apellido).toBe(newProfesor.apellido);
            expect(response.body.email).toBe(newProfesor.email);
            expect(response.body.tipo).toBe(newProfesor.tipo);
        });

        it('debería crear un nuevo profesor (profesor)', async () => {
            const token = generateToken(profesorUser);
            const newProfesor = {
                nombre: 'Otro',
                apellido: 'Profesor',
                email: 'otro.profesor@test.com',
                tipo: 'asistente',
                telefono: '987654321'
            };

            const response = await request(app)
                .post('/api/profesores')
                .set('Authorization', `Bearer ${token}`)
                .send(newProfesor);

            expectSuccess(response, 201);
            expect(response.body).toHaveProperty('id');
        });

        it('debería fallar si no es profesor o admin', async () => {
            const token = generateToken(estudianteUser);
            const newProfesor = {
                nombre: 'Estudiante',
                apellido: 'Profesor',
                email: 'estudiante.profesor@test.com',
                tipo: 'profesor'
            };

            const response = await request(app)
                .post('/api/profesores')
                .set('Authorization', `Bearer ${token}`)
                .send(newProfesor);

            expectError(response, 403, 'Permisos insuficientes');
        });

        it('debería fallar con email duplicado', async () => {
            const token = generateToken(adminUser);
            const duplicateProfesor = {
                nombre: 'Duplicado',
                apellido: 'Profesor',
                email: 'juan.perez@test.com', // Email ya existe
                tipo: 'profesor'
            };

            const response = await request(app)
                .post('/api/profesores')
                .set('Authorization', `Bearer ${token}`)
                .send(duplicateProfesor);

            expectError(response, 400, 'El email ya está registrado');
        });

        it('debería fallar con datos inválidos', async () => {
            const token = generateToken(adminUser);
            const invalidProfesor = {
                nombre: '',
                apellido: '',
                email: 'email-invalido',
                tipo: 'invalido'
            };

            const response = await request(app)
                .post('/api/profesores')
                .set('Authorization', `Bearer ${token}`)
                .send(invalidProfesor);

            expectError(response, 400);
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .post('/api/profesores')
                .send({
                    nombre: 'Test',
                    apellido: 'Profesor',
                    email: 'test@test.com',
                    tipo: 'profesor'
                });

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('PUT /:id', () => {
        it('debería actualizar un profesor existente', async () => {
            const token = generateToken(adminUser);
            const updateData = {
                nombre: 'Juan Actualizado',
                telefono: '111222333'
            };

            const response = await request(app)
                .put('/api/profesores/1')
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            expectSuccess(response, 200);
            expect(response.body.nombre).toBe(updateData.nombre);
            expect(response.body.telefono).toBe(updateData.telefono);
        });

        it('debería fallar si no es profesor o admin', async () => {
            const token = generateToken(estudianteUser);
            const updateData = {
                nombre: 'Actualizado'
            };

            const response = await request(app)
                .put('/api/profesores/1')
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            expectError(response, 403, 'Permisos insuficientes');
        });

        it('debería fallar con profesor que no existe', async () => {
            const token = generateToken(adminUser);
            const updateData = {
                nombre: 'Actualizado'
            };

            const response = await request(app)
                .put('/api/profesores/999')
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            expectError(response, 404, 'Profesor no encontrado');
        });

        it('debería fallar con email duplicado', async () => {
            const token = generateToken(adminUser);
            const updateData = {
                email: 'maria.gonzalez@test.com' // Email de otro profesor
            };

            const response = await request(app)
                .put('/api/profesores/1')
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            expectError(response, 400, 'El email ya está registrado');
        });

        it('debería fallar con datos inválidos', async () => {
            const token = generateToken(adminUser);
            const invalidData = {
                nombre: '',
                email: 'email-invalido',
                tipo: 'invalido'
            };

            const response = await request(app)
                .put('/api/profesores/1')
                .set('Authorization', `Bearer ${token}`)
                .send(invalidData);

            expectError(response, 400);
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .put('/api/profesores/1')
                .send({ nombre: 'Actualizado' });

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('DELETE /:id', () => {
        it('debería eliminar un profesor (soft delete)', async () => {
            const token = generateToken(adminUser);

            const response = await request(app)
                .delete('/api/profesores/1')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(response.body.message).toBe('Profesor eliminado exitosamente');
        });

        it('debería fallar si no es profesor o admin', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .delete('/api/profesores/1')
                .set('Authorization', `Bearer ${token}`);

            expectError(response, 403, 'Permisos insuficientes');
        });

        it('debería fallar con profesor que no existe', async () => {
            const token = generateToken(adminUser);

            const response = await request(app)
                .delete('/api/profesores/999')
                .set('Authorization', `Bearer ${token}`);

            expectError(response, 404, 'Profesor no encontrado');
        });

        it('debería fallar si el profesor tiene horarios asignados', async () => {
            const token = generateToken(adminUser);

            // Intentar eliminar profesor que tiene horarios
            const response = await request(app)
                .delete('/api/profesores/1')
                .set('Authorization', `Bearer ${token}`);

            // Debería fallar porque tiene horarios asignados
            expectError(response, 400, 'No se puede eliminar un profesor con horarios asignados');
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .delete('/api/profesores/1');

            expectError(response, 401, 'Token de acceso requerido');
        });
    });
});