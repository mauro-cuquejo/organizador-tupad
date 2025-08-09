const bcrypt = require('bcryptjs');
const { db } = require('../database/init');

/**
 * Script para crear un usuario administrador por defecto
 * Este script debe ejecutarse una sola vez después de la instalación
 */

async function createAdminUser() {
    try {
        console.log('🔧 Creando usuario administrador por defecto...');

        // Datos del administrador por defecto
        const adminData = {
            email: 'admin@tupad.edu.ar',
            password: 'AdminTupad2024!',
            nombre: 'Administrador',
            apellido: 'TUPAD',
            rol: 'admin'
        };

        // Verificar si ya existe un administrador
        db.get('SELECT id FROM usuarios WHERE rol = ?', ['admin'], async (err, row) => {
            if (err) {
                console.error('❌ Error al verificar administrador existente:', err);
                process.exit(1);
            }

            if (row) {
                console.log('⚠️ Ya existe un usuario administrador en la base de datos');
                console.log('📧 Email del administrador existente:', row.email || 'No disponible');
                return;
            }

            // Verificar si el email específico ya existe
            db.get('SELECT id FROM usuarios WHERE email = ?', [adminData.email], async (err, row) => {
                if (err) {
                    console.error('❌ Error al verificar email:', err);
                    process.exit(1);
                }

                if (row) {
                    console.log('⚠️ Ya existe un usuario con el email:', adminData.email);
                    return;
                }

                // Encriptar contraseña
                const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
                const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);

                // Insertar administrador
                db.run(
                    'INSERT INTO usuarios (email, password, nombre, apellido, rol, activo) VALUES (?, ?, ?, ?, ?, ?)',
                    [adminData.email, hashedPassword, adminData.nombre, adminData.apellido, adminData.rol, 1],
                    function (err) {
                        if (err) {
                            console.error('❌ Error al crear administrador:', err);
                            process.exit(1);
                        }

                        const userId = this.lastID;

                        // Crear configuración de notificaciones para el administrador
                        db.run(
                            'INSERT INTO configuracion_notificaciones (usuario_id) VALUES (?)',
                            [userId],
                            function (err) {
                                if (err) {
                                    console.warn('⚠️ Error al crear configuración de notificaciones:', err);
                                }
                            }
                        );

                        console.log('✅ Usuario administrador creado exitosamente');
                        console.log('📧 Email:', adminData.email);
                        console.log('🔑 Contraseña:', adminData.password);
                        console.log('🆔 ID:', userId);
                        console.log('');
                        console.log('⚠️ IMPORTANTE: Cambia la contraseña del administrador después del primer inicio de sesión');
                        console.log('🔒 Por seguridad, esta contraseña debe ser cambiada inmediatamente');

                        process.exit(0);
                    }
                );
            });
        });

    } catch (error) {
        console.error('❌ Error inesperado:', error);
        process.exit(1);
    }
}

// Ejecutar el script
createAdminUser();