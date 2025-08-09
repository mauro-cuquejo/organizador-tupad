const request = require('supertest');
const express = require('express');
const { initializeDatabase } = require('../../database/init');
const horariosRoutes = require('../../routes/horarios');
const { testUsers, createTestUser, clearDatabase, createTestData, generateToken, expectError, expectSuccess } = require('../helpers/testUtils');

// Crear app de prueba
const app = express();
app.use(express.json());
app.use('/api/horarios', horariosRoutes);

describe('Horarios Routes', () => {
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
        it('debería obtener todos los horarios', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/horarios')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });

        it('debería filtrar horarios por día de semana', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/horarios')
                .query({ dia_semana: 1 })
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach(horario => {
                expect(horario.dia_semana).toBe(1);
            });
        });

        it('debería filtrar horarios por materia', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/horarios')
                .query({ materia_id: 1 })
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach(horario => {
                expect(horario.materia_id).toBe(1);
            });
        });

        it('debería filtrar horarios por profesor', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/horarios')
                .query({ profesor_id: 1 })
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach(horario => {
                expect(horario.profesor_id).toBe(1);
            });
        });

        it('debería paginar resultados', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/horarios')
                .query({ page: 1, limit: 5 })
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeLessThanOrEqual(5);
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .get('/api/horarios');

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('GET /dia/:dia', () => {
        it('debería obtener horarios por día específico', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/horarios/dia/1')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach(horario => {
                expect(horario.dia_semana).toBe(1);
            });
        });

        it('debería fallar con día inválido', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/horarios/dia/8')
                .set('Authorization', `Bearer ${token}`);

            expectError(response, 400);
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .get('/api/horarios/dia/1');

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('GET /materia/:materiaId', () => {
        it('debería obtener horarios por materia', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/horarios/materia/1')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach(horario => {
                expect(horario.materia_id).toBe(1);
            });
        });

        it('debería fallar con materia que no existe', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/horarios/materia/999')
                .set('Authorization', `Bearer ${token}`);

            expectError(response, 404, 'Materia no encontrada');
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .get('/api/horarios/materia/1');

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('GET /profesor/:profesorId', () => {
        it('debería obtener horarios por profesor', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/horarios/profesor/1')
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
                .get('/api/horarios/profesor/999')
                .set('Authorization', `Bearer ${token}`);

            expectError(response, 404, 'Profesor no encontrado');
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .get('/api/horarios/profesor/1');

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('GET /:id', () => {
        it('debería obtener un horario específico', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/horarios/1')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('materia_id');
            expect(response.body).toHaveProperty('profesor_id');
            expect(response.body).toHaveProperty('dia_semana');
        });

        it('debería fallar con horario que no existe', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/horarios/999')
                .set('Authorization', `Bearer ${token}`);

            expectError(response, 404, 'Horario no encontrado');
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .get('/api/horarios/1');

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('POST /', () => {
        it('debería crear un nuevo horario (profesor)', async () => {
            const token = generateToken(profesorUser);
            const newHorario = {
                materia_id: 1,
                comision_id: 1,
                profesor_id: 1,
                dia_semana: 3,
                hora_inicio: '10:00',
                hora_fin: '12:00',
                tipo_clase: 'practica',
                link_reunion: 'https://meet.google.com/test',
                tipo_reunion: 'meet'
            };

            const response = await request(app)
                .post('/api/horarios')
                .set('Authorization', `Bearer ${token}`)
                .send(newHorario);

            expectSuccess(response, 201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.materia_id).toBe(newHorario.materia_id);
            expect(response.body.profesor_id).toBe(newHorario.profesor_id);
            expect(response.body.dia_semana).toBe(newHorario.dia_semana);
        });

        it('debería crear un nuevo horario (admin)', async () => {
            const token = generateToken(adminUser);
            const newHorario = {
                materia_id: 2,
                comision_id: 2,
                profesor_id: 2,
                dia_semana: 4,
                hora_inicio: '14:00',
                hora_fin: '16:00',
                tipo_clase: 'laboratorio',
                link_reunion: 'https://teams.microsoft.com/test',
                tipo_reunion: 'teams'
            };

            const response = await request(app)
                .post('/api/horarios')
                .set('Authorization', `Bearer ${token}`)
                .send(newHorario);

            expectSuccess(response, 201);
            expect(response.body).toHaveProperty('id');
        });

        it('debería fallar si no es profesor o admin', async () => {
            const token = generateToken(estudianteUser);
            const newHorario = {
                materia_id: 1,
                comision_id: 1,
                profesor_id: 1,
                dia_semana: 3,
                hora_inicio: '10:00',
                hora_fin: '12:00',
                tipo_clase: 'practica'
            };

            const response = await request(app)
                .post('/api/horarios')
                .set('Authorization', `Bearer ${token}`)
                .send(newHorario);

            expectError(response, 403, 'Permisos insuficientes');
        });

        it('debería fallar con datos inválidos', async () => {
            const token = generateToken(profesorUser);
            const invalidHorario = {
                materia_id: 1,
                comision_id: 1,
                profesor_id: 1,
                dia_semana: 8, // Día inválido
                hora_inicio: '25:00', // Hora inválida
                hora_fin: '26:00',
                tipo_clase: 'invalido'
            };

            const response = await request(app)
                .post('/api/horarios')
                .set('Authorization', `Bearer ${token}`)
                .send(invalidHorario);

            expectError(response, 400);
        });

        it('debería fallar con conflicto de horarios', async () => {
            const token = generateToken(profesorUser);
            const conflictingHorario = {
                materia_id: 1,
                comision_id: 1,
                profesor_id: 1,
                dia_semana: 1,
                hora_inicio: '08:00',
                hora_fin: '10:00',
                tipo_clase: 'teorica'
            };

            const response = await request(app)
                .post('/api/horarios')
                .set('Authorization', `Bearer ${token}`)
                .send(conflictingHorario);

            expectError(response, 409, 'Conflicto de horarios');
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .post('/api/horarios')
                .send({
                    materia_id: 1,
                    comision_id: 1,
                    profesor_id: 1,
                    dia_semana: 3,
                    hora_inicio: '10:00',
                    hora_fin: '12:00',
                    tipo_clase: 'practica'
                });

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('PUT /:id', () => {
        it('debería actualizar un horario existente', async () => {
            const token = generateToken(profesorUser);
            const updateData = {
                hora_inicio: '09:00',
                hora_fin: '11:00',
                link_reunion: 'https://meet.google.com/updated'
            };

            const response = await request(app)
                .put('/api/horarios/1')
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            expectSuccess(response, 200);
            expect(response.body.hora_inicio).toBe(updateData.hora_inicio);
            expect(response.body.hora_fin).toBe(updateData.hora_fin);
            expect(response.body.link_reunion).toBe(updateData.link_reunion);
        });

        it('debería fallar si no es profesor o admin', async () => {
            const token = generateToken(estudianteUser);
            const updateData = {
                hora_inicio: '09:00',
                hora_fin: '11:00'
            };

            const response = await request(app)
                .put('/api/horarios/1')
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            expectError(response, 403, 'Permisos insuficientes');
        });

        it('debería fallar con horario que no existe', async () => {
            const token = generateToken(profesorUser);
            const updateData = {
                hora_inicio: '09:00',
                hora_fin: '11:00'
            };

            const response = await request(app)
                .put('/api/horarios/999')
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            expectError(response, 404, 'Horario no encontrado');
        });

        it('debería fallar con datos inválidos', async () => {
            const token = generateToken(profesorUser);
            const invalidData = {
                hora_inicio: '25:00',
                hora_fin: '26:00'
            };

            const response = await request(app)
                .put('/api/horarios/1')
                .set('Authorization', `Bearer ${token}`)
                .send(invalidData);

            expectError(response, 400);
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .put('/api/horarios/1')
                .send({ hora_inicio: '09:00' });

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('DELETE /:id', () => {
        it('debería eliminar un horario (soft delete)', async () => {
            const token = generateToken(profesorUser);

            const response = await request(app)
                .delete('/api/horarios/1')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(response.body.message).toBe('Horario eliminado exitosamente');
        });

        it('debería fallar si no es profesor o admin', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .delete('/api/horarios/1')
                .set('Authorization', `Bearer ${token}`);

            expectError(response, 403, 'Permisos insuficientes');
        });

        it('debería fallar con horario que no existe', async () => {
            const token = generateToken(profesorUser);

            const response = await request(app)
                .delete('/api/horarios/999')
                .set('Authorization', `Bearer ${token}`);

            expectError(response, 404, 'Horario no encontrado');
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .delete('/api/horarios/1');

            expectError(response, 401, 'Token de acceso requerido');
        });
    });
});