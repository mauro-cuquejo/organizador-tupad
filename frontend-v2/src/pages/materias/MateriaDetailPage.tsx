import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { materiasService, type Materia } from '@/services/materiasService'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'
import {
  BookOpenIcon,
  ArrowLeftIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  FolderIcon,
  GlobeAltIcon,
  ComputerDesktopIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

interface Profesor {
  id: number
  nombre: string
  apellido: string
  email: string
  especialidad?: string
}

interface Comision {
  id: number
  numero: number
  nombre: string
  profesores: Profesor[]
  horario?: string
  aula?: string
}

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
  semestre: string
  descripcion: string
  objetivos: string[]
  unidades: Unidad[]
  evaluacion: Evaluacion
  recursos: Recursos
  comisiones: Comision[]
}

export function MateriaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { token, isAuthenticated, login } = useAuthStore()
  const [materia, setMateria] = useState<Materia | null>(null)
  const [contenido, setContenido] = useState<ContenidoMateria | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedComision, setSelectedComision] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'general' | 'contenido' | 'evaluacion' | 'recursos'>('general')

  // Estados para el modal de relogin
  const [showReloginModal, setShowReloginModal] = useState(false)
  const [reloginLoading, setReloginLoading] = useState(false)
  const [reloginCredentials, setReloginCredentials] = useState({
    email: '',
    password: ''
  })

  useEffect(() => {
    if (id && isAuthenticated && token) {
      loadMateria()
    }
  }, [id, isAuthenticated, token])

  // Monitorear cambios en materia
  useEffect(() => {
    console.log('🔄 Estado de materia cambió:', materia)
  }, [materia])

  const loadMateria = async () => {
    if (!id) return

    console.log('🔍 Cargando materia con ID:', id)
    console.log('🔑 Estado de autenticación:', { isAuthenticated, hasToken: !!token })

    setLoading(true)
    setError(null)

    try {
      // Verificar autenticación
      if (!isAuthenticated || !token) {
        console.log('❌ Usuario no autenticado o sin token')
        setError('Debes iniciar sesión para ver los detalles de la materia')
        setLoading(false)
        return
      }

      // Cargar datos básicos de la materia
      console.log('📡 Llamando a materiasService.getById...')
      const materiaData = await materiasService.getById(parseInt(id))
      console.log('📦 Respuesta completa del backend:', materiaData)
      setMateria(materiaData.materia)
      console.log('✅ Materia extraída:', materiaData.materia)

      // Simular carga de contenido (en un caso real, esto vendría del backend)
      const contenidoSimulado: ContenidoMateria = {
        nombre: materiaData.materia.nombre,
        codigo: materiaData.materia.codigo,
        creditos: materiaData.materia.creditos,
        horas: 48,
        semestre: "2025-1",
        descripcion: materiaData.materia.descripcion || "Descripción detallada de la materia",
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
        },
        comisiones: [
          {
            id: 1,
            numero: 1,
            nombre: "Comisión 1 - Mañana",
            horario: "Lunes y Miércoles 8:00-10:00",
            aula: "Aula 101",
            profesores: [
              {
                id: 1,
                nombre: "María",
                apellido: "González",
                email: "maria.gonzalez@universidad.edu",
                especialidad: "Gramática"
              },
              {
                id: 2,
                nombre: "Carlos",
                apellido: "Rodríguez",
                email: "carlos.rodriguez@universidad.edu",
                especialidad: "Conversación"
              }
            ]
          },
          {
            id: 2,
            numero: 2,
            nombre: "Comisión 2 - Tarde",
            horario: "Martes y Jueves 14:00-16:00",
            aula: "Aula 102",
            profesores: [
              {
                id: 3,
                nombre: "Ana",
                apellido: "Martínez",
                email: "ana.martinez@universidad.edu",
                especialidad: "Literatura"
              }
            ]
          },
          {
            id: 3,
            numero: 3,
            nombre: "Comisión 3 - Noche",
            horario: "Lunes y Miércoles 18:00-20:00",
            aula: "Aula 103",
            profesores: [
              {
                id: 4,
                nombre: "Luis",
                apellido: "Pérez",
                email: "luis.perez@universidad.edu",
                especialidad: "Escritura"
              },
              {
                id: 5,
                nombre: "Laura",
                apellido: "Fernández",
                email: "laura.fernandez@universidad.edu",
                especialidad: "Pronunciación"
              }
            ]
          }
        ]
      }

      setContenido(contenidoSimulado)
      // Seleccionar la primera comisión por defecto
      if (contenidoSimulado.comisiones.length > 0) {
        setSelectedComision(contenidoSimulado.comisiones[0].id)
      }
    } catch (error: any) {
      console.error('❌ Error al cargar la materia:', error)
      console.error('📋 Detalles del error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })

      let errorMessage = 'Error al cargar los datos de la materia'

      if (error.response?.status === 401) {
        errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.'
        setShowReloginModal(true) // Mostrar modal de relogin
      } else if (error.response?.status === 404) {
        errorMessage = 'La materia no fue encontrada'
      } else if (error.response?.status >= 500) {
        errorMessage = 'Error del servidor. Intenta más tarde.'
      }

      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Función para manejar el relogin
  const handleRelogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reloginCredentials.email || !reloginCredentials.password) {
      toast.error('Por favor, completa todos los campos')
      return
    }

    setReloginLoading(true)
    try {
      await login(reloginCredentials)
      setShowReloginModal(false)
      setReloginCredentials({ email: '', password: '' })
      toast.success('¡Sesión renovada exitosamente!')

      // Recargar la materia después del relogin exitoso
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message || 'Error al iniciar sesión')
    } finally {
      setReloginLoading(false)
    }
  }

  // Función para cerrar el modal y redirigir al login
  const handleRedirectToLogin = () => {
    setShowReloginModal(false)
    navigate('/login', { replace: true })
  }

  const handleBack = () => {
    navigate('/materias')
  }

  const handleComisionChange = (comisionId: number) => {
    setSelectedComision(comisionId)
  }

  const handleProfesorClick = (profesorId: number) => {
    // Navegar a la vista de profesores (implementar más adelante)
    navigate(`/profesores/${profesorId}`)
  }

  const selectedComisionData = contenido?.comisiones.find(c => c.id === selectedComision)

  // Debug: mostrar estado actual
  console.log('🎯 Render - Estado actual:', { materia, contenido, loading, error })

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

  // Mostrar error si hay uno
  if (error) {
    return (
      <div className="text-center py-5">
        <ExclamationTriangleIcon className="w-16 h-16 text-warning mx-auto mb-3" />
        <h4>Error al cargar la materia</h4>
        <p className="text-muted">{error}</p>
        <button className="btn btn-primary d-inline-flex align-items-center" onClick={handleBack}>
          <ArrowLeftIcon className="w-4 h-4 me-2" />
          Volver a Materias
        </button>
      </div>
    )
  }

  if (!materia || !contenido) {
    return (
      <div className="text-center py-5">
        <ExclamationTriangleIcon className="w-16 h-16 text-warning mx-auto mb-3" />
        <h4>Materia no encontrada</h4>
        <p className="text-muted">La materia que buscas no existe o ha sido eliminada.</p>
        <button className="btn btn-primary d-inline-flex align-items-center" onClick={handleBack}>
          <ArrowLeftIcon className="w-4 h-4 me-2" />
          Volver a Materias
        </button>
      </div>
    )
  }

  return (
    <div className="materia-detail-page">
      {/* Título de la materia */}
      <div className="mb-4">
        <h1 className="page-title" style={{ fontSize: '2.5rem', fontWeight: '700', margin: '0', color: '#495057' }}>
          {materia.nombre}
        </h1>
      </div>

      {/* Banner principal con información del curso */}
      <div className="page-header" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
        borderRadius: '0.5rem',
        marginBottom: '2rem'
      }}>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h2 className="page-title" style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              margin: '0',
              color: 'white'
            }}>
              {materia.nombre}
            </h2>
            <p className="text-light mb-0" style={{ fontSize: '1.1rem', opacity: '0.9' }}>
              Información del curso
            </p>
          </div>
          <button
            onClick={() => navigate('/materias')}
            className="btn btn-outline-light"
            style={{ border: '1px solid rgba(255,255,255,0.5)' }}
          >
            <ArrowLeftIcon className="w-4 h-4 me-2" />
            Volver
          </button>
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
                style={{ border: 'none', background: 'none' }}
              >
                <InformationCircleIcon className="w-4 h-4 me-2" />
                Información General
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'contenido' ? 'active' : ''}`}
                onClick={() => setActiveTab('contenido')}
                style={{ border: 'none', background: 'none' }}
              >
                <DocumentTextIcon className="w-4 h-4 me-2" />
                Contenido
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'evaluacion' ? 'active' : ''}`}
                onClick={() => setActiveTab('evaluacion')}
                style={{ border: 'none', background: 'none' }}
              >
                <CheckCircleIcon className="w-4 h-4 me-2" />
                Evaluación
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'recursos' ? 'active' : ''}`}
                onClick={() => setActiveTab('recursos')}
                style={{ border: 'none', background: 'none' }}
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
                <div className="card border-0 bg-light mb-4">
                  <div className="card-body">
                    <h5 className="card-title d-flex align-items-center">
                      <InformationCircleIcon className="w-5 h-5 me-2 text-info" />
                      Descripción
                    </h5>
                    <p className="card-text">{contenido.descripcion}</p>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0 d-flex align-items-center">
                      <AcademicCapIcon className="w-5 h-5 me-2 text-success" />
                      Objetivos del Curso
                    </h5>
                  </div>
                  <div className="card-body">
                    <ul className="list-group list-group-flush">
                      {contenido.objetivos.map((objetivo, index) => (
                        <li key={index} className="list-group-item d-flex align-items-start">
                          <div className="w-2 h-2 bg-success rounded-circle me-3 mt-2" style={{ minWidth: '8px' }}></div>
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
                    <h5 className="mb-0 d-flex align-items-center">
                      <UserGroupIcon className="w-5 h-5 me-2 text-primary" />
                      Comisiones y Profesores
                    </h5>
                  </div>
                  <div className="card-body">
                    {/* Selector de comisión */}
                    <div className="mb-3">
                      <label className="form-label text-muted">Comisión:</label>
                      <select
                        className="form-select"
                        value={selectedComision || ''}
                        onChange={(e) => handleComisionChange(Number(e.target.value))}
                      >
                        {contenido?.comisiones.map((comision) => (
                          <option key={comision.id} value={comision.id}>
                            {comision.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Información de la comisión seleccionada */}
                    {selectedComisionData && (
                      <div>
                        <div className="mb-3">
                          <span className="text-muted">Horario:</span>
                          <div className="badge bg-info ms-2">{selectedComisionData.horario}</div>
                        </div>
                        <div className="mb-3">
                          <span className="text-muted">Aula:</span>
                          <div className="badge bg-secondary ms-2">{selectedComisionData.aula}</div>
                        </div>
                        <div>
                          <span className="text-muted">Profesores:</span>
                          <div className="mt-2">
                            {selectedComisionData.profesores.map((profesor) => (
                              <button
                                key={profesor.id}
                                className="btn btn-outline-primary btn-sm d-block w-100 mb-1 text-start"
                                onClick={() => handleProfesorClick(profesor.id)}
                                style={{ textAlign: 'left' }}
                              >
                                <UserIcon className="w-3 h-3 me-2" />
                                {profesor.nombre} {profesor.apellido}
                                {profesor.especialidad && (
                                  <span className="badge bg-light text-dark ms-2 float-end">
                                    {profesor.especialidad}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
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
              <h4 className="mb-4 d-flex align-items-center">
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
                        <h6 className="mb-2 d-flex align-items-center">
                          <BookOpenIcon className="w-4 h-4 me-2 text-warning" />
                          {tema.titulo}
                        </h6>
                        <p className="text-muted mb-3">{tema.descripcion}</p>

                        <div className="row">
                          <div className="col-md-6">
                            <h6 className="text-primary d-flex align-items-center">
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
                            <h6 className="text-success d-flex align-items-center">
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
              <h4 className="mb-4 d-flex align-items-center">
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
                    <h5 className="mb-0 d-flex align-items-center">
                      <DocumentTextIcon className="w-5 h-5 me-2 text-info" />
                      Bibliografía
                    </h5>
                  </div>
                  <div className="card-body">
                    <ul className="list-group list-group-flush">
                      {contenido.recursos.bibliografia.map((libro, index) => (
                        <li key={index} className="list-group-item d-flex align-items-center">
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
                    <h5 className="mb-0 d-flex align-items-center">
                      <ComputerDesktopIcon className="w-5 h-5 me-2 text-success" />
                      Recursos Digitales
                    </h5>
                  </div>
                  <div className="card-body">
                    <h6 className="text-primary d-flex align-items-center">
                      <GlobeAltIcon className="w-4 h-4 me-2" />
                      Plataformas:
                    </h6>
                    <ul className="list-unstyled">
                      {contenido.recursos.plataformas.map((plataforma, index) => (
                        <li key={index} className="mb-2 d-flex align-items-center">
                          <GlobeAltIcon className="w-4 h-4 text-primary me-2" />
                          {plataforma}
                        </li>
                      ))}
                    </ul>
                    <h6 className="text-success mt-3 d-flex align-items-center">
                      <ComputerDesktopIcon className="w-4 h-4 me-2" />
                      Software:
                    </h6>
                    <ul className="list-unstyled">
                      {contenido.recursos.software.map((software, index) => (
                        <li key={index} className="mb-2 d-flex align-items-center">
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

      {/* Modal de relogin */}
      {showReloginModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Sesión Expirada</h3>
            <p>Tu sesión ha expirado. Por favor, inicia sesión nuevamente para continuar.</p>
            <form onSubmit={handleRelogin}>
              <div className="mb-3">
                <label htmlFor="reloginEmail" className="form-label">Email:</label>
                <input
                  type="email"
                  className="form-control"
                  id="reloginEmail"
                  value={reloginCredentials.email}
                  onChange={(e) => setReloginCredentials({ ...reloginCredentials, email: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="reloginPassword" className="form-label">Contraseña:</label>
                <input
                  type="password"
                  className="form-control"
                  id="reloginPassword"
                  value={reloginCredentials.password}
                  onChange={(e) => setReloginCredentials({ ...reloginCredentials, password: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={reloginLoading}>
                {reloginLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
              <button type="button" className="btn btn-secondary ms-2" onClick={handleRedirectToLogin} disabled={reloginLoading}>
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
