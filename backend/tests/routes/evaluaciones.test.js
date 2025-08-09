const request = require('supertest');
const express = require('express');
const { initializeDatabase } = require('../../database/init');
const evaluacionesRoutes = require('../../routes/evaluaciones');
const { testUsers, createTestUser, clearDatabase, createTestData, generateToken, expectError, expectSuccess } = require('../helpers/testUtils');

// Crear app de prueba
const app = express();
app.use(express.json());
app.use('/api/evaluaciones', evaluacionesRoutes);

describe('Evaluaciones Routes', () => {
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
        it('debería obtener todas las evaluaciones', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/evaluaciones')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it('debería filtrar evaluaciones por materia', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/evaluaciones')
                .query({ materia_id: 1 })
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach(evaluacion => {
                expect(evaluacion.materia_id).toBe(1);
            });
        });

        it('debería filtrar evaluaciones por tipo', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/evaluaciones')
                .query({ tipo_evaluacion: 'parcial' })
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach(evaluacion => {
                expect(evaluacion.tipo_evaluacion).toBe('parcial');
            });
        });

        it('debería paginar resultados', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/evaluaciones')
                .query({ page: 1, limit: 5 })
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeLessThanOrEqual(5);
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .get('/api/evaluaciones');

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('GET /proximas', () => {
        it('debería obtener evaluaciones próximas', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/evaluaciones/proximas')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .get('/api/evaluaciones/proximas');

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('GET /search/:query', () => {
        it('debería buscar evaluaciones por query', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/evaluaciones/search/Parcial')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it('debería retornar array vacío si no encuentra resultados', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/evaluaciones/search/NoExiste')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(0);
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .get('/api/evaluaciones/search/Parcial');

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('GET /:id', () => {
        it('debería obtener una evaluación específica con notas', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/evaluaciones/1')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('titulo');
            expect(response.body).toHaveProperty('materia_id');
            expect(response.body).toHaveProperty('tipo_evaluacion');
            expect(response.body).toHaveProperty('fecha_evaluacion');
            expect(response.body).toHaveProperty('notas');
        });

        it('debería fallar con evaluación que no existe', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/evaluaciones/999')
                .set('Authorization', `Bearer ${token}`);

            expectError(response, 404, 'Evaluación no encontrada');
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .get('/api/evaluaciones/1');

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('GET /usuario/:usuarioId/notas', () => {
        it('debería obtener notas de un usuario específico', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/evaluaciones/usuario/1/notas')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(response.body).toHaveProperty('notas');
            expect(response.body).toHaveProperty('estadisticas');
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .get('/api/evaluaciones/usuario/1/notas');

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('POST /', () => {
        it('debería crear una nueva evaluación (profesor)', async () => {
            const token = generateToken(profesorUser);
            const newEvaluacion = {
                materia_id: 1,
                titulo: 'Nueva Evaluación',
                descripcion: 'Descripción de la nueva evaluación',
                tipo_evaluacion: 'parcial',
                fecha_evaluacion: '2024-12-15T10:00:00.000Z',
                hora_inicio: '10:00',
                hora_fin: '12:00',
                peso: 0.3,
                link_evaluacion: 'https://forms.google.com/test'
            };

            const response = await request(app)
                .post('/api/evaluaciones')
                .set('Authorization', `Bearer ${token}`)
                .send(newEvaluacion);

            expectSuccess(response, 201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.titulo).toBe(newEvaluacion.titulo);
            expect(response.body.materia_id).toBe(newEvaluacion.materia_id);
            expect(response.body.tipo_evaluacion).toBe(newEvaluacion.tipo_evaluacion);
        });

        it('debería crear una nueva evaluación (admin)', async () => {
            const token = generateToken(adminUser);
            const newEvaluacion = {
                materia_id: 2,
                titulo: 'Otra Evaluación',
                descripcion: 'Descripción de otra evaluación',
                tipo_evaluacion: 'final',
                fecha_evaluacion: '2024-12-20T14:00:00.000Z',
                peso: 0.7
            };

            const response = await request(app)
                .post('/api/evaluaciones')
                .set('Authorization', `Bearer ${token}`)
                .send(newEvaluacion);

            expectSuccess(response, 201);
            expect(response.body).toHaveProperty('id');
        });

        it('debería fallar si no es profesor o admin', async () => {
            const token = generateToken(estudianteUser);
            const newEvaluacion = {
                materia_id: 1,
                titulo: 'Evaluación Estudiante',
                tipo_evaluacion: 'parcial',
                fecha_evaluacion: '2024-12-15T10:00:00.000Z',
                peso: 0.3
            };

            const response = await request(app)
                .post('/api/evaluaciones')
                .set('Authorization', `Bearer ${token}`)
                .send(newEvaluacion);

            expectError(response, 403, 'Permisos insuficientes');
        });

        it('debería fallar con datos inválidos', async () => {
            const token = generateToken(profesorUser);
            const invalidEvaluacion = {
                materia_id: 1,
                titulo: '',
                tipo_evaluacion: 'invalido',
                fecha_evaluacion: 'fecha-invalida',
                peso: 2.0
            };

            const response = await request(app)
                .post('/api/evaluaciones')
                .set('Authorization', `Bearer ${token}`)
                .send(invalidEvaluacion);

            expectError(response, 400);
        });

        it('debería fallar con materia que no existe', async () => {
            const token = generateToken(profesorUser);
            const newEvaluacion = {
                materia_id: 999,
                titulo: 'Evaluación',
                tipo_evaluacion: 'parcial',
                fecha_evaluacion: '2024-12-15T10:00:00.000Z',
                peso: 0.3
            };

            const response = await request(app)
                .post('/api/evaluaciones')
                .set('Authorization', `Bearer ${token}`)
                .send(newEvaluacion);

            expectError(response, 400, 'Materia no encontrada');
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .post('/api/evaluaciones')
                .send({
                    materia_id: 1,
                    titulo: 'Test',
                    tipo_evaluacion: 'parcial',
                    fecha_evaluacion: '2024-12-15T10:00:00.000Z',
                    peso: 0.3
                });

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('PUT /:id', () => {
        it('debería actualizar una evaluación existente', async () => {
            const token = generateToken(profesorUser);
            const updateData = {
                titulo: 'Evaluación Actualizada',
                descripcion: 'Descripción actualizada',
                fecha_evaluacion: '2024-12-16T10:00:00.000Z',
                peso: 0.4
            };

            const response = await request(app)
                .put('/api/evaluaciones/1')
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            expectSuccess(response, 200);
            expect(response.body.titulo).toBe(updateData.titulo);
            expect(response.body.descripcion).toBe(updateData.descripcion);
            expect(response.body.peso).toBe(updateData.peso);
        });

        it('debería fallar si no es profesor o admin', async () => {
            const token = generateToken(estudianteUser);
            const updateData = {
                titulo: 'Actualizada'
            };

            const response = await request(app)
                .put('/api/evaluaciones/1')
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            expectError(response, 403, 'Permisos insuficientes');
        });

        it('debería fallar con evaluación que no existe', async () => {
            const token = generateToken(profesorUser);
            const updateData = {
                titulo: 'Actualizada'
            };

            const response = await request(app)
                .put('/api/evaluaciones/999')
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            expectError(response, 404, 'Evaluación no encontrada');
        });

        it('debería fallar con datos inválidos', async () => {
            const token = generateToken(profesorUser);
            const invalidData = {
                titulo: '',
                peso: 2.0,
                tipo_evaluacion: 'invalido'
            };

            const response = await request(app)
                .put('/api/evaluaciones/1')
                .set('Authorization', `Bearer ${token}`)
                .send(invalidData);

            expectError(response, 400);
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .put('/api/evaluaciones/1')
                .send({ titulo: 'Actualizada' });

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('DELETE /:id', () => {
        it('debería eliminar una evaluación (soft delete)', async () => {
            const token = generateToken(profesorUser);

            const response = await request(app)
                .delete('/api/evaluaciones/1')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(response.body.message).toBe('Evaluación eliminada exitosamente');
        });

        it('debería fallar si no es profesor o admin', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .delete('/api/evaluaciones/1')
                .set('Authorization', `Bearer ${token}`);

            expectError(response, 403, 'Permisos insuficientes');
        });

        it('debería fallar con evaluación que no existe', async () => {
            const token = generateToken(profesorUser);

            const response = await request(app)
                .delete('/api/evaluaciones/999')
                .set('Authorization', `Bearer ${token}`);

            expectError(response, 404, 'Evaluación no encontrada');
        });

        it('debería fallar si la evaluación tiene notas asociadas', async () => {
            const token = generateToken(profesorUser);

            // Intentar eliminar evaluación que tiene notas
            const response = await request(app)
                .delete('/api/evaluaciones/1')
                .set('Authorization', `Bearer ${token}`);

            // Debería fallar porque tiene notas asociadas
            expectError(response, 400, 'No se puede eliminar una evaluación con notas asociadas');
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .delete('/api/evaluaciones/1');

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('POST /:id/notas', () => {
        it('debería agregar una nota a una evaluación', async () => {
            const token = generateToken(profesorUser);
            const notaData = {
                usuario_id: 1,
                nota: 8.5,
                comentario: 'Excelente trabajo'
            };

            const response = await request(app)
                .post('/api/evaluaciones/1/notas')
                .set('Authorization', `Bearer ${token}`)
                .send(notaData);

            expectSuccess(response, 201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.nota).toBe(notaData.nota);
            expect(response.body.comentario).toBe(notaData.comentario);
        });

        it('debería fallar si no es profesor o admin', async () => {
            const token = generateToken(estudianteUser);
            const notaData = {
                usuario_id: 1,
                nota: 8.5
            };

            const response = await request(app)
                .post('/api/evaluaciones/1/notas')
                .set('Authorization', `Bearer ${token}`)
                .send(notaData);

            expectError(response, 403, 'Permisos insuficientes');
        });

        it('debería fallar con evaluación que no existe', async () => {
            const token = generateToken(profesorUser);
            const notaData = {
                usuario_id: 1,
                nota: 8.5
            };

            const response = await request(app)
                .post('/api/evaluaciones/999/notas')
                .set('Authorization', `Bearer ${token}`)
                .send(notaData);

            expectError(response, 404, 'Evaluación no encontrada');
        });

        it('debería fallar con datos inválidos', async () => {
            const token = generateToken(profesorUser);
            const invalidNota = {
                usuario_id: 1,
                nota: 15.0 // Nota inválida
            };

            const response = await request(app)
                .post('/api/evaluaciones/1/notas')
                .set('Authorization', `Bearer ${token}`)
                .send(invalidNota);

            expectError(response, 400);
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .post('/api/evaluaciones/1/notas')
                .send({
                    usuario_id: 1,
                    nota: 8.5
                });

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('PUT /:id/notas/:notaId', () => {
        it('debería actualizar una nota existente', async () => {
            const token = generateToken(profesorUser);
            const updateData = {
                nota: 9.0,
                comentario: 'Comentario actualizado'
            };

            const response = await request(app)
                .put('/api/evaluaciones/1/notas/1')
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            expectSuccess(response, 200);
            expect(response.body.nota).toBe(updateData.nota);
            expect(response.body.comentario).toBe(updateData.comentario);
        });

        it('debería fallar si no es profesor o admin', async () => {
            const token = generateToken(estudianteUser);
            const updateData = {
                nota: 9.0
            };

            const response = await request(app)
                .put('/api/evaluaciones/1/notas/1')
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            expectError(response, 403, 'Permisos insuficientes');
        });

        it('debería fallar con nota que no existe', async () => {
            const token = generateToken(profesorUser);
            const updateData = {
                nota: 9.0
            };

            const response = await request(app)
                .put('/api/evaluaciones/1/notas/999')
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            expectError(response, 404, 'Nota no encontrada');
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .put('/api/evaluaciones/1/notas/1')
                .send({ nota: 9.0 });

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('DELETE /:id/notas/:notaId', () => {
        it('debería eliminar una nota', async () => {
            const token = generateToken(profesorUser);

            const response = await request(app)
                .delete('/api/evaluaciones/1/notas/1')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(response.body.message).toBe('Nota eliminada exitosamente');
        });

        it('debería fallar si no es profesor o admin', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .delete('/api/evaluaciones/1/notas/1')
                .set('Authorization', `Bearer ${token}`);

            expectError(response, 403, 'Permisos insuficientes');
        });

        it('debería fallar con nota que no existe', async () => {
            const token = generateToken(profesorUser);

            const response = await request(app)
                .delete('/api/evaluaciones/1/notas/999')
                .set('Authorization', `Bearer ${token}`);

            expectError(response, 404, 'Nota no encontrada');
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .delete('/api/evaluaciones/1/notas/1');

            expectError(response, 401, 'Token de acceso requerido');
        });
    });
});