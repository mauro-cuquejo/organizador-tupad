const fs = require('fs');
const path = require('path');

// Función para simular la extracción de contenido del PDF
// En un caso real, usarías una librería como pdf-parse o pdf2pic
function extractPDFContent(pdfPath) {
    // Simulación del contenido extraído del PDF
    const contenidoMateria = {
        nombre: "Inglés I",
        codigo: "ING001",
        creditos: 3,
        horas: 48,
        docente: "Por asignar",
        semestre: "2025-1",

        // Información general
        descripcion: "Curso de inglés nivel básico para estudiantes universitarios",
        objetivos: [
            "Desarrollar competencias comunicativas básicas en inglés",
            "Adquirir vocabulario esencial para la comunicación cotidiana",
            "Comprender estructuras gramaticales fundamentales",
            "Desarrollar habilidades de lectura y escritura básicas"
        ],

        // Unidades del curso
        unidades: [
            {
                numero: 1,
                titulo: "Introducción al Inglés Básico",
                duracion: "2 semanas",
                horas: 8,
                temas: [
                    {
                        titulo: "Saludos y presentaciones",
                        descripcion: "Aprender a saludar y presentarse en inglés",
                        actividades: [
                            "Diálogos de presentación",
                            "Práctica de pronunciación",
                            "Ejercicios de vocabulario"
                        ],
                        recursos: [
                            "Audios de pronunciación",
                            "Tarjetas de vocabulario",
                            "Presentaciones en PowerPoint"
                        ]
                    },
                    {
                        titulo: "Alfabeto y números",
                        descripcion: "Conocer el alfabeto inglés y números del 1 al 100",
                        actividades: [
                            "Dictado de letras y números",
                            "Juegos de memoria",
                            "Ejercicios de escritura"
                        ],
                        recursos: [
                            "Videos del alfabeto",
                            "Aplicaciones interactivas",
                            "Material impreso"
                        ]
                    }
                ]
            },
            {
                numero: 2,
                titulo: "Gramática Básica",
                duracion: "3 semanas",
                horas: 12,
                temas: [
                    {
                        titulo: "Verbo 'To Be'",
                        descripcion: "Uso del verbo ser/estar en presente",
                        actividades: [
                            "Ejercicios de conjugación",
                            "Construcción de oraciones",
                            "Práctica oral"
                        ],
                        recursos: [
                            "Tablas de conjugación",
                            "Ejercicios interactivos",
                            "Videos explicativos"
                        ]
                    },
                    {
                        titulo: "Artículos y sustantivos",
                        descripcion: "Uso de artículos (a, an, the) y plurales",
                        actividades: [
                            "Identificación de artículos",
                            "Formación de plurales",
                            "Ejercicios de completar"
                        ],
                        recursos: [
                            "Reglas gramaticales",
                            "Ejercicios en línea",
                            "Material de apoyo"
                        ]
                    }
                ]
            },
            {
                numero: 3,
                titulo: "Comunicación Cotidiana",
                duracion: "3 semanas",
                horas: 12,
                temas: [
                    {
                        titulo: "Conversaciones básicas",
                        descripcion: "Desarrollar habilidades conversacionales básicas",
                        actividades: [
                            "Role-plays",
                            "Diálogos guiados",
                            "Práctica en parejas"
                        ],
                        recursos: [
                            "Scripts de diálogos",
                            "Audios de referencia",
                            "Guías de conversación"
                        ]
                    },
                    {
                        titulo: "Descripción de personas y lugares",
                        descripcion: "Aprender a describir características físicas y lugares",
                        actividades: [
                            "Descripción de fotos",
                            "Presentación de lugares",
                            "Ejercicios de vocabulario descriptivo"
                        ],
                        recursos: [
                            "Imágenes de referencia",
                            "Lista de adjetivos",
                            "Ejemplos de descripciones"
                        ]
                    }
                ]
            },
            {
                numero: 4,
                titulo: "Lectura y Escritura",
                duracion: "2 semanas",
                horas: 8,
                temas: [
                    {
                        titulo: "Comprensión lectora",
                        descripcion: "Desarrollar habilidades de lectura comprensiva",
                        actividades: [
                            "Lectura de textos cortos",
                            "Preguntas de comprensión",
                            "Resúmenes escritos"
                        ],
                        recursos: [
                            "Textos adaptados",
                            "Ejercicios de comprensión",
                            "Guías de lectura"
                        ]
                    },
                    {
                        titulo: "Escritura básica",
                        descripcion: "Aprender a escribir textos simples en inglés",
                        actividades: [
                            "Escritura de oraciones",
                            "Composición de párrafos",
                            "Corrección de textos"
                        ],
                        recursos: [
                            "Modelos de escritura",
                            "Rubricas de evaluación",
                            "Herramientas de corrección"
                        ]
                    }
                ]
            }
        ],

        // Evaluación
        evaluacion: {
            parcial1: {
                porcentaje: 25,
                fecha: "Semana 6",
                contenido: "Unidades 1-2"
            },
            parcial2: {
                porcentaje: 25,
                fecha: "Semana 10",
                contenido: "Unidades 2-3"
            },
            final: {
                porcentaje: 30,
                fecha: "Semana 14",
                contenido: "Todo el curso"
            },
            participacion: {
                porcentaje: 20,
                descripcion: "Participación en clase y tareas"
            }
        },

        // Recursos adicionales
        recursos: {
            bibliografia: [
                "Basic English Grammar by Betty Schrampfer Azar",
                "English File Elementary by Clive Oxenden",
                "Essential Grammar in Use by Raymond Murphy"
            ],
            plataformas: [
                "Duolingo",
                "BBC Learning English",
                "English Central"
            ],
            software: [
                "Grammarly",
                "Cambridge Dictionary",
                "Oxford Learner's Dictionary"
            ]
        }
    };

    return contenidoMateria;
}

// Función para generar la tabla HTML
function generateHTMLTable(contenido) {
    let html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${contenido.nombre} - Contenido</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        .content-card {
            border-left: 4px solid #007bff;
            margin-bottom: 1rem;
        }
        .unit-card {
            border: 1px solid #dee2e6;
            border-radius: 0.375rem;
            margin-bottom: 1.5rem;
        }
        .topic-item {
            background-color: #f8f9fa;
            border-radius: 0.25rem;
            padding: 0.75rem;
            margin-bottom: 0.5rem;
        }
        .evaluation-badge {
            font-size: 0.875rem;
        }
    </style>
</head>
<body>
    <div class="container-fluid py-4">
        <!-- Header -->
        <div class="row mb-4">
            <div class="col-12">
                <div class="card content-card">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-md-8">
                                <h1 class="card-title mb-2">
                                    <i class="bi bi-book text-primary"></i>
                                    ${contenido.nombre}
                                </h1>
                                <p class="card-subtitle text-muted">
                                    Código: ${contenido.codigo} | Créditos: ${contenido.creditos} | Horas: ${contenido.horas} | Semestre: ${contenido.semestre}
                                </p>
                                <p class="card-text">${contenido.descripcion}</p>
                            </div>
                            <div class="col-md-4 text-end">
                                <span class="badge bg-primary fs-6">${contenido.docente}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Objetivos -->
        <div class="row mb-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">
                            <i class="bi bi-target text-success"></i>
                            Objetivos del Curso
                        </h5>
                    </div>
                    <div class="card-body">
                        <ul class="list-group list-group-flush">
                            ${contenido.objetivos.map(objetivo => `
                                <li class="list-group-item">
                                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                                    ${objetivo}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <!-- Unidades -->
        <div class="row mb-4">
            <div class="col-12">
                <h3 class="mb-3">
                    <i class="bi bi-collection text-info"></i>
                    Unidades del Curso
                </h3>
                ${contenido.unidades.map(unidad => `
                    <div class="card unit-card">
                        <div class="card-header">
                            <div class="row align-items-center">
                                <div class="col-md-8">
                                    <h5 class="mb-0">
                                        <span class="badge bg-info me-2">Unidad ${unidad.numero}</span>
                                        ${unidad.titulo}
                                    </h5>
                                </div>
                                <div class="col-md-4 text-end">
                                    <span class="badge bg-secondary">${unidad.horas} horas</span>
                                    <span class="badge bg-light text-dark">${unidad.duracion}</span>
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            ${unidad.temas.map(tema => `
                                <div class="topic-item">
                                    <h6 class="mb-2">
                                        <i class="bi bi-bookmark text-warning"></i>
                                        ${tema.titulo}
                                    </h6>
                                    <p class="mb-2 text-muted">${tema.descripcion}</p>

                                    <div class="row">
                                        <div class="col-md-6">
                                            <h6 class="text-primary">
                                                <i class="bi bi-activity"></i>
                                                Actividades:
                                            </h6>
                                            <ul class="list-unstyled">
                                                ${tema.actividades.map(actividad => `
                                                    <li><i class="bi bi-dot text-primary"></i> ${actividad}</li>
                                                `).join('')}
                                            </ul>
                                        </div>
                                        <div class="col-md-6">
                                            <h6 class="text-success">
                                                <i class="bi bi-folder"></i>
                                                Recursos:
                                            </h6>
                                            <ul class="list-unstyled">
                                                ${tema.recursos.map(recurso => `
                                                    <li><i class="bi bi-dot text-success"></i> ${recurso}</li>
                                                `).join('')}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- Evaluación -->
        <div class="row mb-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">
                            <i class="bi bi-clipboard-check text-danger"></i>
                            Sistema de Evaluación
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-3 mb-3">
                                <div class="card text-center">
                                    <div class="card-body">
                                        <h6 class="card-title">Primer Parcial</h6>
                                        <span class="badge bg-primary evaluation-badge">${contenido.evaluacion.parcial1.porcentaje}%</span>
                                        <p class="card-text small mt-2">${contenido.evaluacion.parcial1.fecha}</p>
                                        <p class="card-text small text-muted">${contenido.evaluacion.parcial1.contenido}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3 mb-3">
                                <div class="card text-center">
                                    <div class="card-body">
                                        <h6 class="card-title">Segundo Parcial</h6>
                                        <span class="badge bg-warning text-dark evaluation-badge">${contenido.evaluacion.parcial2.porcentaje}%</span>
                                        <p class="card-text small mt-2">${contenido.evaluacion.parcial2.fecha}</p>
                                        <p class="card-text small text-muted">${contenido.evaluacion.parcial2.contenido}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3 mb-3">
                                <div class="card text-center">
                                    <div class="card-body">
                                        <h6 class="card-title">Examen Final</h6>
                                        <span class="badge bg-danger evaluation-badge">${contenido.evaluacion.final.porcentaje}%</span>
                                        <p class="card-text small mt-2">${contenido.evaluacion.final.fecha}</p>
                                        <p class="card-text small text-muted">${contenido.evaluacion.final.contenido}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3 mb-3">
                                <div class="card text-center">
                                    <div class="card-body">
                                        <h6 class="card-title">Participación</h6>
                                        <span class="badge bg-success evaluation-badge">${contenido.evaluacion.participacion.porcentaje}%</span>
                                        <p class="card-text small mt-2">Continua</p>
                                        <p class="card-text small text-muted">${contenido.evaluacion.participacion.descripcion}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recursos -->
        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">
                            <i class="bi bi-journal-text text-info"></i>
                            Bibliografía
                        </h5>
                    </div>
                    <div class="card-body">
                        <ul class="list-group list-group-flush">
                            ${contenido.recursos.bibliografia.map(libro => `
                                <li class="list-group-item">
                                    <i class="bi bi-book text-info me-2"></i>
                                    ${libro}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">
                            <i class="bi bi-laptop text-success"></i>
                            Recursos Digitales
                        </h5>
                    </div>
                    <div class="card-body">
                        <h6 class="text-primary">Plataformas:</h6>
                        <ul class="list-unstyled">
                            ${contenido.recursos.plataformas.map(plataforma => `
                                <li><i class="bi bi-globe text-primary me-2"></i>${plataforma}</li>
                            `).join('')}
                        </ul>
                        <h6 class="text-success mt-3">Software:</h6>
                        <ul class="list-unstyled">
                            ${contenido.recursos.software.map(software => `
                                <li><i class="bi bi-download text-success me-2"></i>${software}</li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

    return html;
}

// Función principal
function main() {
    const pdfPath = path.join(__dirname, '../fuentes de datos/00 - Programa Ingles I - TUPaD - 2025.pdf');
    const outputPath = path.join(__dirname, '../output/contenido-ingles.html');

    console.log('Extrayendo contenido del PDF...');
    const contenido = extractPDFContent(pdfPath);

    console.log('Generando tabla HTML...');
    const html = generateHTMLTable(contenido);

    // Crear directorio de salida si no existe
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Guardar archivo HTML
    fs.writeFileSync(outputPath, html);
    console.log(`Archivo HTML generado: ${outputPath}`);

    // También guardar JSON para uso posterior
    const jsonPath = path.join(__dirname, '../output/contenido-ingles.json');
    fs.writeFileSync(jsonPath, JSON.stringify(contenido, null, 2));
    console.log(`Archivo JSON generado: ${jsonPath}`);
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main();
}

module.exports = {
    extractPDFContent,
    generateHTMLTable
};
