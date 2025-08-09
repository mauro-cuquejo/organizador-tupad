const request = require('supertest');
const express = require('express');
const { initializeDatabase } = require('../../database/init');
const contenidosRoutes = require('../../routes/contenidos');
const { testUsers, createTestUser, clearDatabase, createTestData, generateToken, expectError, expectSuccess } = require('../helpers/testUtils');

// Crear app de prueba
const app = express();
app.use(express.json());
app.use('/api/contenidos', contenidosRoutes);

describe('Contenidos Routes', () => {
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
        it('debería obtener todos los contenidos', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/contenidos')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it('debería filtrar contenidos por materia', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/contenidos')
                .query({ materia_id: 1 })
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach(contenido => {
                expect(contenido.materia_id).toBe(1);
            });
        });

        it('debería filtrar contenidos por semana', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/contenidos')
                .query({ semana: 1 })
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach(contenido => {
                expect(contenido.semana).toBe(1);
            });
        });

        it('debería filtrar contenidos por tipo', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/contenidos')
                .query({ tipo_contenido: 'teoria' })
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach(contenido => {
                expect(contenido.tipo_contenido).toBe('teoria');
            });
        });

        it('debería paginar resultados', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/contenidos')
                .query({ page: 1, limit: 5 })
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeLessThanOrEqual(5);
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .get('/api/contenidos');

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('GET /por-semana', () => {
        it('debería obtener contenidos organizados por semana', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/contenidos/por-semana')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .get('/api/contenidos/por-semana');

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('GET /actual', () => {
        it('debería obtener contenidos de la semana actual', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/contenidos/actual')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .get('/api/contenidos/actual');

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('GET /search/:query', () => {
        it('debería buscar contenidos por query', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/contenidos/search/Introducción')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it('debería retornar array vacío si no encuentra resultados', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/contenidos/search/NoExiste')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(0);
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .get('/api/contenidos/search/Introducción');

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('GET /stats/overview', () => {
        it('debería obtener estadísticas de contenidos', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/contenidos/stats/overview')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(response.body).toHaveProperty('total_contenidos');
            expect(response.body).toHaveProperty('contenidos_por_tipo');
            expect(response.body).toHaveProperty('contenidos_por_materia');
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .get('/api/contenidos/stats/overview');

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('GET /materia/:materiaId', () => {
        it('debería obtener contenidos de una materia específica', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/contenidos/materia/1')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach(contenido => {
                expect(contenido.materia_id).toBe(1);
            });
        });

        it('debería fallar con materia que no existe', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/contenidos/materia/999')
                .set('Authorization', `Bearer ${token}`);

            expectError(response, 404, 'Materia no encontrada');
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .get('/api/contenidos/materia/1');

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('GET /:id', () => {
        it('debería obtener un contenido específico', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/contenidos/1')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('titulo');
            expect(response.body).toHaveProperty('materia_id');
            expect(response.body).toHaveProperty('semana');
            expect(response.body).toHaveProperty('tipo_contenido');
        });

        it('debería fallar con contenido que no existe', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/contenidos/999')
                .set('Authorization', `Bearer ${token}`);

            expectError(response, 404, 'Contenido no encontrado');
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .get('/api/contenidos/1');

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('POST /', () => {
        it('debería crear un nuevo contenido (profesor)', async () => {
            const token = generateToken(profesorUser);
            const newContenido = {
                materia_id: 1,
                titulo: 'Nuevo Contenido',
                descripcion: 'Descripción del nuevo contenido',
                semana: 1,
                tipo_contenido: 'teoria',
                link_contenido: 'https://drive.google.com/test',
                orden: 1
            };

            const response = await request(app)
                .post('/api/contenidos')
                .set('Authorization', `Bearer ${token}`)
                .send(newContenido);

            expectSuccess(response, 201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.titulo).toBe(newContenido.titulo);
            expect(response.body.materia_id).toBe(newContenido.materia_id);
            expect(response.body.semana).toBe(newContenido.semana);
            expect(response.body.tipo_contenido).toBe(newContenido.tipo_contenido);
        });

        it('debería crear un nuevo contenido (admin)', async () => {
            const token = generateToken(adminUser);
            const newContenido = {
                materia_id: 2,
                titulo: 'Otro Contenido',
                descripcion: 'Descripción de otro contenido',
                semana: 2,
                tipo_contenido: 'practica',
                link_contenido: 'https://youtube.com/test',
                orden: 1
            };

            const response = await request(app)
                .post('/api/contenidos')
                .set('Authorization', `Bearer ${token}`)
                .send(newContenido);

            expectSuccess(response, 201);
            expect(response.body).toHaveProperty('id');
        });

        it('debería fallar si no es profesor o admin', async () => {
            const token = generateToken(estudianteUser);
            const newContenido = {
                materia_id: 1,
                titulo: 'Contenido Estudiante',
                descripcion: 'Contenido creado por estudiante',
                semana: 1,
                tipo_contenido: 'teoria'
            };

            const response = await request(app)
                .post('/api/contenidos')
                .set('Authorization', `Bearer ${token}`)
                .send(newContenido);

            expectError(response, 403, 'Permisos insuficientes');
        });

        it('debería fallar con datos inválidos', async () => {
            const token = generateToken(profesorUser);
            const invalidContenido = {
                materia_id: 1,
                titulo: '',
                semana: 0,
                tipo_contenido: 'invalido'
            };

            const response = await request(app)
                .post('/api/contenidos')
                .set('Authorization', `Bearer ${token}`)
                .send(invalidContenido);

            expectError(response, 400);
        });

        it('debería fallar con materia que no existe', async () => {
            const token = generateToken(profesorUser);
            const newContenido = {
                materia_id: 999,
                titulo: 'Contenido',
                semana: 1,
                tipo_contenido: 'teoria'
            };

            const response = await request(app)
                .post('/api/contenidos')
                .set('Authorization', `Bearer ${token}`)
                .send(newContenido);

            expectError(response, 400, 'Materia no encontrada');
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .post('/api/contenidos')
                .send({
                    materia_id: 1,
                    titulo: 'Test',
                    semana: 1,
                    tipo_contenido: 'teoria'
                });

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('PUT /:id', () => {
        it('debería actualizar un contenido existente', async () => {
            const token = generateToken(profesorUser);
            const updateData = {
                titulo: 'Contenido Actualizado',
                descripcion: 'Descripción actualizada',
                link_contenido: 'https://drive.google.com/updated'
            };

            const response = await request(app)
                .put('/api/contenidos/1')
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            expectSuccess(response, 200);
            expect(response.body.titulo).toBe(updateData.titulo);
            expect(response.body.descripcion).toBe(updateData.descripcion);
            expect(response.body.link_contenido).toBe(updateData.link_contenido);
        });

        it('debería fallar si no es profesor o admin', async () => {
            const token = generateToken(estudianteUser);
            const updateData = {
                titulo: 'Actualizado'
            };

            const response = await request(app)
                .put('/api/contenidos/1')
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            expectError(response, 403, 'Permisos insuficientes');
        });

        it('debería fallar con contenido que no existe', async () => {
            const token = generateToken(profesorUser);
            const updateData = {
                titulo: 'Actualizado'
            };

            const response = await request(app)
                .put('/api/contenidos/999')
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            expectError(response, 404, 'Contenido no encontrado');
        });

        it('debería fallar con datos inválidos', async () => {
            const token = generateToken(profesorUser);
            const invalidData = {
                titulo: '',
                semana: 0,
                tipo_contenido: 'invalido'
            };

            const response = await request(app)
                .put('/api/contenidos/1')
                .set('Authorization', `Bearer ${token}`)
                .send(invalidData);

            expectError(response, 400);
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .put('/api/contenidos/1')
                .send({ titulo: 'Actualizado' });

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('DELETE /:id', () => {
        it('debería eliminar un contenido (soft delete)', async () => {
            const token = generateToken(profesorUser);

            const response = await request(app)
                .delete('/api/contenidos/1')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(response.body.message).toBe('Contenido eliminado exitosamente');
        });

        it('debería fallar si no es profesor o admin', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .delete('/api/contenidos/1')
                .set('Authorization', `Bearer ${token}`);

            expectError(response, 403, 'Permisos insuficientes');
        });

        it('debería fallar con contenido que no existe', async () => {
            const token = generateToken(profesorUser);

            const response = await request(app)
                .delete('/api/contenidos/999')
                .set('Authorization', `Bearer ${token}`);

            expectError(response, 404, 'Contenido no encontrado');
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .delete('/api/contenidos/1');

            expectError(response, 401, 'Token de acceso requerido');
        });
    });
});