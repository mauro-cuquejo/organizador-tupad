import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { materiasService, type Materia } from '@/services/materiasService'
import toast from 'react-hot-toast'
import {
  BookOpenIcon,
  ArrowLeftIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  FolderIcon,
  GlobeAltIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline'

interface Tema {
  titulo: string
  descripcion: string
  actividades: string[]
  recursos: string[]
}

interface Unidad {
  numero: number
  titulo: string
  duracion: string
  horas: number
  temas: Tema[]
}

interface Evaluacion {
  parcial1: {
    porcentaje: number
    fecha: string
    contenido: string
  }
  parcial2: {
    porcentaje: number
    fecha: string
    contenido: string
  }
  final: {
    porcentaje: number
    fecha: string
    contenido: string
  }
  participacion: {
    porcentaje: number
    descripcion: string
  }
}

interface Recursos {
  bibliografia: string[]
  plataformas: string[]
  software: string[]
}

interface ContenidoMateria {
  nombre: string
  codigo: string
  creditos: number
  horas: number
  docente: string
  semestre: string
  descripcion: string
  objetivos: string[]
  unidades: Unidad[]
  evaluacion: Evaluacion
  recursos: Recursos
}

export function MateriaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [materia, setMateria] = useState<Materia | null>(null)
  const [contenido, setContenido] = useState<ContenidoMateria | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    const loadMateria = async () => {
      if (!id) return

      setLoading(true)
      try {
        // Cargar datos básicos de la materia
        const materiaData = await materiasService.getById(parseInt(id))
        setMateria(materiaData)

        // Simular carga de contenido (en un caso real, esto vendría del backend)
        const contenidoSimulado: ContenidoMateria = {
          nombre: materiaData.nombre,
          codigo: materiaData.codigo,
          creditos: materiaData.creditos,
          horas: 48,
          docente: "Por asignar",
          semestre: "2025-1",
          descripcion: materiaData.descripcion || "Descripción detallada de la materia",
          objetivos: [
            "Desarrollar competencias comunicativas básicas",
            "Adquirir vocabulario esencial para la comunicación cotidiana",
            "Comprender estructuras gramaticales fundamentales",
            "Desarrollar habilidades de lectura y escritura básicas"
          ],
          unidades: [
            {
              numero: 1,
              titulo: "Introducción y Fundamentos",
              duracion: "2 semanas",
              horas: 8,
              temas: [
                {
                  titulo: "Conceptos básicos",
                  descripcion: "Introducción a los conceptos fundamentales de la materia",
                  actividades: [
                    "Lectura de material introductorio",
                    "Ejercicios de aplicación",
                    "Discusiones en grupo"
                  ],
                  recursos: [
                    "Material de lectura",
                    "Presentaciones",
                    "Videos explicativos"
                  ]
                }
              ]
            },
            {
              numero: 2,
              titulo: "Desarrollo de Competencias",
              duracion: "3 semanas",
              horas: 12,
              temas: [
                {
                  titulo: "Aplicación práctica",
                  descripcion: "Desarrollo de habilidades prácticas en la materia",
                  actividades: [
                    "Ejercicios prácticos",
                    "Proyectos individuales",
                    "Evaluaciones formativas"
                  ],
                  recursos: [
                    "Guías de práctica",
                    "Herramientas digitales",
                    "Material de apoyo"
                  ]
                }
              ]
            }
          ],
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
          recursos: {
            bibliografia: [
              "Libro de texto principal de la materia",
              "Material complementario recomendado",
              "Artículos académicos relevantes"
            ],
            plataformas: [
              "Plataforma de aprendizaje virtual",
              "Recursos digitales complementarios"
            ],
            software: [
              "Herramientas específicas de la materia",
              "Software de simulación"
            ]
          }
        }

        setContenido(contenidoSimulado)
      } catch (error: any) {
        console.error('Error al cargar la materia:', error)
        toast.error('Error al cargar los datos de la materia')
      } finally {
        setLoading(false)
      }
    }

    loadMateria()
  }, [id])

  const handleBack = () => {
    navigate('/materias')
  }

  const handleEdit = () => {
    toast.success('Función de editar materia - En desarrollo')
  }

  const handleDelete = async () => {
    if (!materia) return

    if (window.confirm(`¿Estás seguro de que quieres eliminar la materia "${materia.nombre}"?`)) {
      try {
        await materiasService.delete(materia.id)
        toast.success('Materia eliminada exitosamente')
        navigate('/materias')
      } catch (error: any) {
        console.error('Error al eliminar materia:', error)
        toast.error('Error al eliminar la materia')
      }
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3 text-muted">Cargando detalles de la materia...</p>
      </div>
    )
  }

  if (!materia || !contenido) {
    return (
      <div className="text-center py-5">
        <ExclamationTriangleIcon className="w-16 h-16 text-warning mx-auto mb-3" />
        <h4>Materia no encontrada</h4>
        <p className="text-muted">La materia que buscas no existe o ha sido eliminada.</p>
        <button className="btn btn-primary" onClick={handleBack}>
          <ArrowLeftIcon className="w-4 h-4 me-2" />
          Volver a Materias
        </button>
      </div>
    )
  }

  return (
    <div className="materia-detail-page">
      {/* Header */}
      <div className="page-header mb-4">
        <div className="row align-items-center">
          <div className="col-md-8">
            <div className="d-flex align-items-center">
              <button className="btn btn-outline-secondary me-3" onClick={handleBack}>
                <ArrowLeftIcon className="w-4 h-4" />
              </button>
              <div>
                <h1 className="page-title mb-1">
                  <BookOpenIcon className="w-8 h-8 me-2 text-primary" />
                  {materia.nombre}
                </h1>
                <p className="page-subtitle text-muted mb-0">
                  Código: {materia.codigo} | Créditos: {materia.creditos} | Horas: {contenido.horas} | Semestre: {contenido.semestre}
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4 text-end">
            <div className="btn-group" role="group">
              <button className="btn btn-outline-primary" onClick={() => toast.success('Función de vista previa - En desarrollo')}>
                <EyeIcon className="w-4 h-4 me-1" />
                Vista Previa
              </button>
              {(user?.rol === 'admin' || user?.rol === 'profesor') && (
                <>
                  <button className="btn btn-outline-warning" onClick={handleEdit}>
                    <PencilIcon className="w-4 h-4 me-1" />
                    Editar
                  </button>
                  <button className="btn btn-outline-danger" onClick={handleDelete}>
                    <TrashIcon className="w-4 h-4 me-1" />
                    Eliminar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="card mb-4">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'general' ? 'active' : ''}`}
                onClick={() => setActiveTab('general')}
              >
                <InformationCircleIcon className="w-4 h-4 me-2" />
                Información General
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'contenido' ? 'active' : ''}`}
                onClick={() => setActiveTab('contenido')}
              >
                <DocumentTextIcon className="w-4 h-4 me-2" />
                Contenido
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'evaluacion' ? 'active' : ''}`}
                onClick={() => setActiveTab('evaluacion')}
              >
                <CheckCircleIcon className="w-4 h-4 me-2" />
                Evaluación
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'recursos' ? 'active' : ''}`}
                onClick={() => setActiveTab('recursos')}
              >
                <FolderIcon className="w-4 h-4 me-2" />
                Recursos
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body">
          {/* Tab: Información General */}
          {activeTab === 'general' && (
            <div className="row">
              <div className="col-md-8">
                <div className="card border-0 bg-light">
                  <div className="card-body">
                    <h5 className="card-title">
                      <InformationCircleIcon className="w-5 h-5 me-2 text-info" />
                      Descripción
                    </h5>
                    <p className="card-text">{contenido.descripcion}</p>
                  </div>
                </div>

                <div className="card mt-4">
                  <div className="card-header">
                    <h5 className="mb-0">
                      <AcademicCapIcon className="w-5 h-5 me-2 text-success" />
                      Objetivos del Curso
                    </h5>
                  </div>
                  <div className="card-body">
                    <ul className="list-group list-group-flush">
                      {contenido.objetivos.map((objetivo, index) => (
                        <li key={index} className="list-group-item">
                          <CheckCircleIcon className="w-4 h-4 text-success me-2" />
                          {objetivo}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">
                      <UserIcon className="w-5 h-5 me-2 text-primary" />
                      Información del Curso
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="text-muted">Docente:</span>
                      <span className="badge bg-primary">{contenido.docente}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="text-muted">Créditos:</span>
                      <span className="badge bg-info">{contenido.creditos}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="text-muted">Horas:</span>
                      <span className="badge bg-secondary">{contenido.horas}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted">Semestre:</span>
                      <span className="badge bg-light text-dark">{contenido.semestre}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Contenido */}
          {activeTab === 'contenido' && (
            <div>
              <h4 className="mb-4">
                <DocumentTextIcon className="w-6 h-6 me-2 text-info" />
                Unidades del Curso
              </h4>
              {contenido.unidades.map((unidad, index) => (
                <div key={index} className="card mb-4">
                  <div className="card-header">
                    <div className="row align-items-center">
                      <div className="col-md-8">
                        <h5 className="mb-0">
                          <span className="badge bg-info me-2">Unidad {unidad.numero}</span>
                          {unidad.titulo}
                        </h5>
                      </div>
                      <div className="col-md-4 text-end">
                        <span className="badge bg-secondary me-2">{unidad.horas} horas</span>
                        <span className="badge bg-light text-dark">{unidad.duracion}</span>
                      </div>
                    </div>
                  </div>
                  <div className="card-body">
                    {unidad.temas.map((tema, temaIndex) => (
                      <div key={temaIndex} className="border rounded p-3 mb-3 bg-light">
                        <h6 className="mb-2">
                          <BookOpenIcon className="w-4 h-4 me-2 text-warning" />
                          {tema.titulo}
                        </h6>
                        <p className="text-muted mb-3">{tema.descripcion}</p>

                        <div className="row">
                          <div className="col-md-6">
                            <h6 className="text-primary">
                              <GlobeAltIcon className="w-4 h-4 me-2" />
                              Actividades:
                            </h6>
                            <ul className="list-unstyled">
                              {tema.actividades.map((actividad, actIndex) => (
                                <li key={actIndex} className="mb-1">
                                  <span className="text-primary">•</span> {actividad}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="col-md-6">
                            <h6 className="text-success">
                              <FolderIcon className="w-4 h-4 me-2" />
                              Recursos:
                            </h6>
                            <ul className="list-unstyled">
                              {tema.recursos.map((recurso, recIndex) => (
                                <li key={recIndex} className="mb-1">
                                  <span className="text-success">•</span> {recurso}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab: Evaluación */}
          {activeTab === 'evaluacion' && (
            <div>
              <h4 className="mb-4">
                <CheckCircleIcon className="w-6 h-6 me-2 text-danger" />
                Sistema de Evaluación
              </h4>
              <div className="row">
                <div className="col-md-3 mb-3">
                  <div className="card text-center">
                    <div className="card-body">
                      <h6 className="card-title">Primer Parcial</h6>
                      <span className="badge bg-primary fs-6">{contenido.evaluacion.parcial1.porcentaje}%</span>
                      <p className="card-text small mt-2">{contenido.evaluacion.parcial1.fecha}</p>
                      <p className="card-text small text-muted">{contenido.evaluacion.parcial1.contenido}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="card text-center">
                    <div className="card-body">
                      <h6 className="card-title">Segundo Parcial</h6>
                      <span className="badge bg-warning text-dark fs-6">{contenido.evaluacion.parcial2.porcentaje}%</span>
                      <p className="card-text small mt-2">{contenido.evaluacion.parcial2.fecha}</p>
                      <p className="card-text small text-muted">{contenido.evaluacion.parcial2.contenido}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="card text-center">
                    <div className="card-body">
                      <h6 className="card-title">Examen Final</h6>
                      <span className="badge bg-danger fs-6">{contenido.evaluacion.final.porcentaje}%</span>
                      <p className="card-text small mt-2">{contenido.evaluacion.final.fecha}</p>
                      <p className="card-text small text-muted">{contenido.evaluacion.final.contenido}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="card text-center">
                    <div className="card-body">
                      <h6 className="card-title">Participación</h6>
                      <span className="badge bg-success fs-6">{contenido.evaluacion.participacion.porcentaje}%</span>
                      <p className="card-text small mt-2">Continua</p>
                      <p className="card-text small text-muted">{contenido.evaluacion.participacion.descripcion}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Recursos */}
          {activeTab === 'recursos' && (
            <div className="row">
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">
                      <DocumentTextIcon className="w-5 h-5 me-2 text-info" />
                      Bibliografía
                    </h5>
                  </div>
                  <div className="card-body">
                    <ul className="list-group list-group-flush">
                      {contenido.recursos.bibliografia.map((libro, index) => (
                        <li key={index} className="list-group-item">
                          <BookOpenIcon className="w-4 h-4 text-info me-2" />
                          {libro}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">
                      <ComputerDesktopIcon className="w-5 h-5 me-2 text-success" />
                      Recursos Digitales
                    </h5>
                  </div>
                  <div className="card-body">
                    <h6 className="text-primary">
                      <GlobeAltIcon className="w-4 h-4 me-2" />
                      Plataformas:
                    </h6>
                    <ul className="list-unstyled">
                      {contenido.recursos.plataformas.map((plataforma, index) => (
                        <li key={index} className="mb-2">
                          <GlobeAltIcon className="w-4 h-4 text-primary me-2" />
                          {plataforma}
                        </li>
                      ))}
                    </ul>
                    <h6 className="text-success mt-3">
                      <ComputerDesktopIcon className="w-4 h-4 me-2" />
                      Software:
                    </h6>
                    <ul className="list-unstyled">
                      {contenido.recursos.software.map((software, index) => (
                        <li key={index} className="mb-2">
                          <ComputerDesktopIcon className="w-4 h-4 text-success me-2" />
                          {software}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
