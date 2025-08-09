const request = require('supertest');
const express = require('express');
const { initializeDatabase } = require('../../database/init');
const materiasRoutes = require('../../routes/materias');
const { testUsers, createTestUser, clearDatabase, createTestData, generateToken, expectError, expectSuccess } = require('../helpers/testUtils');

// Crear app de prueba
const app = express();
app.use(express.json());
app.use('/api/materias', materiasRoutes);

describe('Materias Routes', () => {
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
        it('debería obtener todas las materias', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/materias')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });

        it('debería filtrar materias por créditos', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/materias')
                .query({ creditos: 6 })
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach(materia => {
                expect(materia.creditos).toBe(6);
            });
        });

        it('debería buscar materias por nombre', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/materias')
                .query({ search: 'Matemática' })
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach(materia => {
                expect(materia.nombre.toLowerCase()).toContain('matemática');
            });
        });

        it('debería paginar resultados', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/materias')
                .query({ page: 1, limit: 5 })
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeLessThanOrEqual(5);
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .get('/api/materias');

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('GET /search/:query', () => {
        it('debería buscar materias por query', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/materias/search/Matemática')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach(materia => {
                expect(materia.nombre.toLowerCase()).toContain('matemática');
            });
        });

        it('debería retornar array vacío si no encuentra resultados', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/materias/search/NoExiste')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(0);
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .get('/api/materias/search/Matemática');

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('GET /:id', () => {
        it('debería obtener una materia específica con detalles', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/materias/1')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('nombre');
            expect(response.body).toHaveProperty('codigo');
            expect(response.body).toHaveProperty('descripcion');
            expect(response.body).toHaveProperty('creditos');
            expect(response.body).toHaveProperty('horarios');
            expect(response.body).toHaveProperty('cronograma');
            expect(response.body).toHaveProperty('evaluaciones');
        });

        it('debería fallar con materia que no existe', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/materias/999')
                .set('Authorization', `Bearer ${token}`);

            expectError(response, 404, 'Materia no encontrada');
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .get('/api/materias/1');

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('GET /:id/horarios', () => {
        it('debería obtener horarios de una materia específica', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/materias/1/horarios')
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
                .get('/api/materias/999/horarios')
                .set('Authorization', `Bearer ${token}`);

            expectError(response, 404, 'Materia no encontrada');
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .get('/api/materias/1/horarios');

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('GET /:id/cronograma', () => {
        it('debería obtener cronograma de una materia específica', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/materias/1/cronograma')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it('debería fallar con materia que no existe', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/materias/999/cronograma')
                .set('Authorization', `Bearer ${token}`);

            expectError(response, 404, 'Materia no encontrada');
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .get('/api/materias/1/cronograma');

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('GET /:id/evaluaciones', () => {
        it('debería obtener evaluaciones de una materia específica', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/materias/1/evaluaciones')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it('debería fallar con materia que no existe', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .get('/api/materias/999/evaluaciones')
                .set('Authorization', `Bearer ${token}`);

            expectError(response, 404, 'Materia no encontrada');
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .get('/api/materias/1/evaluaciones');

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('POST /', () => {
        it('debería crear una nueva materia (admin)', async () => {
            const token = generateToken(adminUser);
            const newMateria = {
                nombre: 'Nueva Materia',
                codigo: 'NUEVA',
                descripcion: 'Descripción de la nueva materia',
                creditos: 4
            };

            const response = await request(app)
                .post('/api/materias')
                .set('Authorization', `Bearer ${token}`)
                .send(newMateria);

            expectSuccess(response, 201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.nombre).toBe(newMateria.nombre);
            expect(response.body.codigo).toBe(newMateria.codigo);
            expect(response.body.descripcion).toBe(newMateria.descripcion);
            expect(response.body.creditos).toBe(newMateria.creditos);
        });

        it('debería crear una nueva materia (profesor)', async () => {
            const token = generateToken(profesorUser);
            const newMateria = {
                nombre: 'Otra Materia',
                codigo: 'OTRA',
                descripcion: 'Descripción de otra materia',
                creditos: 6
            };

            const response = await request(app)
                .post('/api/materias')
                .set('Authorization', `Bearer ${token}`)
                .send(newMateria);

            expectSuccess(response, 201);
            expect(response.body).toHaveProperty('id');
        });

        it('debería fallar si no es profesor o admin', async () => {
            const token = generateToken(estudianteUser);
            const newMateria = {
                nombre: 'Materia Estudiante',
                codigo: 'EST',
                descripcion: 'Materia creada por estudiante',
                creditos: 4
            };

            const response = await request(app)
                .post('/api/materias')
                .set('Authorization', `Bearer ${token}`)
                .send(newMateria);

            expectError(response, 403, 'Permisos insuficientes');
        });

        it('debería fallar con código duplicado', async () => {
            const token = generateToken(adminUser);
            const duplicateMateria = {
                nombre: 'Materia Duplicada',
                codigo: 'MAT1', // Código ya existe
                descripcion: 'Materia con código duplicado',
                creditos: 4
            };

            const response = await request(app)
                .post('/api/materias')
                .set('Authorization', `Bearer ${token}`)
                .send(duplicateMateria);

            expectError(response, 400, 'El código ya está registrado');
        });

        it('debería fallar con datos inválidos', async () => {
            const token = generateToken(adminUser);
            const invalidMateria = {
                nombre: '',
                codigo: '',
                descripcion: '',
                creditos: -1
            };

            const response = await request(app)
                .post('/api/materias')
                .set('Authorization', `Bearer ${token}`)
                .send(invalidMateria);

            expectError(response, 400);
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .post('/api/materias')
                .send({
                    nombre: 'Test',
                    codigo: 'TEST',
                    descripcion: 'Test materia',
                    creditos: 4
                });

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('PUT /:id', () => {
        it('debería actualizar una materia existente', async () => {
            const token = generateToken(adminUser);
            const updateData = {
                nombre: 'Matemática I Actualizada',
                descripcion: 'Descripción actualizada',
                creditos: 8
            };

            const response = await request(app)
                .put('/api/materias/1')
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            expectSuccess(response, 200);
            expect(response.body.nombre).toBe(updateData.nombre);
            expect(response.body.descripcion).toBe(updateData.descripcion);
            expect(response.body.creditos).toBe(updateData.creditos);
        });

        it('debería fallar si no es profesor o admin', async () => {
            const token = generateToken(estudianteUser);
            const updateData = {
                nombre: 'Actualizada'
            };

            const response = await request(app)
                .put('/api/materias/1')
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            expectError(response, 403, 'Permisos insuficientes');
        });

        it('debería fallar con materia que no existe', async () => {
            const token = generateToken(adminUser);
            const updateData = {
                nombre: 'Actualizada'
            };

            const response = await request(app)
                .put('/api/materias/999')
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            expectError(response, 404, 'Materia no encontrada');
        });

        it('debería fallar con código duplicado', async () => {
            const token = generateToken(adminUser);
            const updateData = {
                codigo: 'PROG1' // Código de otra materia
            };

            const response = await request(app)
                .put('/api/materias/1')
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            expectError(response, 400, 'El código ya está registrado');
        });

        it('debería fallar con datos inválidos', async () => {
            const token = generateToken(adminUser);
            const invalidData = {
                nombre: '',
                creditos: -1
            };

            const response = await request(app)
                .put('/api/materias/1')
                .set('Authorization', `Bearer ${token}`)
                .send(invalidData);

            expectError(response, 400);
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .put('/api/materias/1')
                .send({ nombre: 'Actualizada' });

            expectError(response, 401, 'Token de acceso requerido');
        });
    });

    describe('DELETE /:id', () => {
        it('debería eliminar una materia (soft delete)', async () => {
            const token = generateToken(adminUser);

            const response = await request(app)
                .delete('/api/materias/1')
                .set('Authorization', `Bearer ${token}`);

            expectSuccess(response, 200);
            expect(response.body.message).toBe('Materia eliminada exitosamente');
        });

        it('debería fallar si no es profesor o admin', async () => {
            const token = generateToken(estudianteUser);

            const response = await request(app)
                .delete('/api/materias/1')
                .set('Authorization', `Bearer ${token}`);

            expectError(response, 403, 'Permisos insuficientes');
        });

        it('debería fallar con materia que no existe', async () => {
            const token = generateToken(adminUser);

            const response = await request(app)
                .delete('/api/materias/999')
                .set('Authorization', `Bearer ${token}`);

            expectError(response, 404, 'Materia no encontrada');
        });

        it('debería fallar si la materia tiene horarios asignados', async () => {
            const token = generateToken(adminUser);

            // Intentar eliminar materia que tiene horarios
            const response = await request(app)
                .delete('/api/materias/1')
                .set('Authorization', `Bearer ${token}`);

            // Debería fallar porque tiene horarios asignados
            expectError(response, 400, 'No se puede eliminar una materia con horarios, contenidos o evaluaciones asociados');
        });

        it('debería fallar sin token de autenticación', async () => {
            const response = await request(app)
                .delete('/api/materias/1');

            expectError(response, 401, 'Token de acceso requerido');
        });
    });
});