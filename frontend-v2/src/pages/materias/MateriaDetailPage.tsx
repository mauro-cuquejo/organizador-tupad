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

// Interfaces simplificadas para datos del backend
interface ContenidoBackend {
  id: number
  titulo: string
  descripcion: string
  semana: number
  tipo_contenido: string
  unidad_numero?: number
  tema_numero?: number
  horas_estimadas?: number
  duracion_semanas?: string
  actividades?: string
  recursos?: string
  orden_unidad?: number
  orden_tema?: number
}

interface ObjetivoMateria {
  id: number
  descripcion: string
  orden: number
}

interface RecursoMateria {
  id: number
  tipo: string
  nombre: string
  descripcion?: string
  link?: string
  orden: number
}

export function MateriaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { token, isAuthenticated, login } = useAuthStore()
  const [materia, setMateria] = useState<Materia | null>(null)
  const [contenidos, setContenidos] = useState<ContenidoBackend[]>([])
  const [objetivos, setObjetivos] = useState<ObjetivoMateria[]>([])
  const [recursos, setRecursos] = useState<RecursoMateria[]>([])
  const [evaluaciones, setEvaluaciones] = useState<any[]>([])
  const [comisiones, setComisiones] = useState<any[]>([])
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

      // Cargar datos adicionales de la materia
      console.log('📚 Cargando objetivos, recursos y contenidos...')

      try {
        // Cargar objetivos
        const objetivosData = await materiasService.getObjetivos(parseInt(id))
        setObjetivos(objetivosData)
        console.log('✅ Objetivos cargados:', objetivosData)

        // Cargar recursos
        const recursosData = await materiasService.getRecursos(parseInt(id))
        setRecursos(recursosData)
        console.log('✅ Recursos cargados:', recursosData)

        // Cargar contenidos
        const contenidosData = await materiasService.getContenidos(parseInt(id))
        setContenidos(contenidosData)
        console.log('✅ Contenidos cargados:', contenidosData)

        // Extraer evaluaciones y comisiones de la respuesta principal
        setEvaluaciones(materiaData.evaluaciones || [])

        // Procesar horarios para convertirlos en comisiones
        const comisionesProcesadas = procesarHorariosEnComisiones(materiaData.horarios || [])
        setComisiones(comisionesProcesadas)

        // Seleccionar la primera comisión por defecto si existe
        if (comisionesProcesadas.length > 0) {
          setSelectedComision(comisionesProcesadas[0].id)
        }
      } catch (error) {
        console.warn('⚠️ Algunos datos adicionales no pudieron cargarse:', error)
        // Continuar sin estos datos
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

  // Función para procesar los datos de horarios y convertirlos en comisiones
  const procesarHorariosEnComisiones = (horariosData: any[]) => {
    if (!horariosData || !Array.isArray(horariosData)) return [];

    // Crear un mapa para agrupar por comisión
    const comisionesMap = new Map();

    horariosData.forEach((dia: any) => {
      if (dia.horarios && Array.isArray(dia.horarios)) {
        dia.horarios.forEach((horario: any) => {
          const comisionId = horario.comision_id;

          if (!comisionesMap.has(comisionId)) {
            comisionesMap.set(comisionId, {
              id: comisionId,
              nombre: horario.comision_nombre,
              horario: `${dia.dia_nombre} ${horario.hora_inicio}-${horario.hora_fin}`,
              aula: 'Por definir', // Por ahora hardcodeado
              profesores: []
            });
          }

          // Agregar profesor si no existe
          const comision = comisionesMap.get(comisionId);
          const profesorExistente = comision.profesores.find((p: any) => p.id === horario.profesor_id);

          if (!profesorExistente) {
            comision.profesores.push({
              id: horario.profesor_id,
              nombre: horario.profesor_nombre,
              apellido: horario.profesor_apellido,
              especialidad: horario.profesor_tipo
            });
          }

          // Agregar horario adicional si es diferente
          if (!comision.horario.includes(horario.hora_inicio)) {
            comision.horario += `, ${dia.dia_nombre} ${horario.hora_inicio}-${horario.hora_fin}`;
          }
        });
      }
    });

    return Array.from(comisionesMap.values());
  };

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

  const selectedComisionData = comisiones.find(c => c.id === selectedComision)

  // Debug: mostrar estado actual
  console.log('🎯 Render - Estado actual:', { materia, contenidos, objetivos, recursos, evaluaciones, comisiones, loading, error })
  console.log('🔍 selectedComision:', selectedComision)
  console.log('🔍 selectedComisionData:', selectedComisionData)
  console.log('🔍 comisiones:', comisiones)

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

  if (!materia) {
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
      {/* Banner principal con información del curso */}
      <div className="page-header" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
        borderRadius: '0.5rem',
        marginBottom: '2rem'
      }}>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h1 className="page-title" style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              margin: '0',
              color: 'white'
            }}>
              {materia.nombre}
            </h1>
            <p className="text-light mb-0" style={{ fontSize: '1.1rem', opacity: '0.9' }}>
              Información del curso
            </p>
          </div>
          <button
            onClick={() => navigate('/materias')}
            className="btn btn-outline-light d-flex align-items-center"
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
                    <p className="card-text">{materia?.descripcion || "Descripción detallada de la materia"}</p>
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
                      {objetivos.map((objetivo, index) => (
                        <li key={index} className="list-group-item d-flex align-items-start">
                          <div className="w-2 h-2 bg-success rounded-circle me-3 mt-2" style={{ minWidth: '8px' }}></div>
                          {objetivo.descripcion}
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
                        {comisiones.map((comision) => (
                          <option key={comision.id} value={comision.id}>
                            {comision.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Información de la comisión seleccionada */}
                    {selectedComisionData && selectedComisionData.profesores ? (
                      <div>
                        <div className="mb-3">
                          <span className="text-muted">Horario:</span>
                          <div className="badge bg-info ms-2">{selectedComisionData.horario || 'No definido'}</div>
                        </div>
                        <div className="mb-3">
                          <span className="text-muted">Aula:</span>
                          <div className="badge bg-secondary ms-2">{selectedComisionData.aula || 'No definida'}</div>
                        </div>
                        <div>
                          <span className="text-muted">Profesores:</span>
                          <div className="mt-2">
                            {Array.isArray(selectedComisionData.profesores) && selectedComisionData.profesores.map((profesor: any) => (
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
                    ) : (
                      <div className="text-muted text-center py-3">
                        <InformationCircleIcon className="w-8 h-8 mx-auto mb-2" />
                        <p>No hay comisiones disponibles para esta materia</p>
                      </div>
                    )}

                    <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
                      <span className="text-muted">Créditos:</span>
                      <span className="badge bg-info">{materia?.creditos || 0}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="text-muted">Horas:</span>
                      <span className="badge bg-secondary">48</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted">Semestre:</span>
                      <span className="badge bg-light text-dark">2025-1</span>
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
              {contenidos.length > 0 ? (
                // Agrupar contenidos por unidad
                Array.from(new Set(contenidos.map(c => c.unidad_numero).filter(Boolean))).sort().map((unidadNumero) => {
                  const contenidosUnidad = contenidos.filter(c => c.unidad_numero === unidadNumero)
                  return (
                    <div key={unidadNumero} className="card mb-4">
                      <div className="card-header">
                        <h5 className="mb-0">Unidad {unidadNumero}</h5>
                      </div>
                      <div className="card-body">
                        {contenidosUnidad.map((contenido) => (
                          <div key={contenido.id} className="mb-3 p-3 border rounded">
                            <h6 className="fw-bold">{contenido.titulo}</h6>
                            <p className="text-muted mb-2">{contenido.descripcion}</p>
                            {contenido.actividades && (
                              <div className="mb-2">
                                <small className="text-muted">Actividades:</small>
                                <ul className="list-unstyled ms-3">
                                  {JSON.parse(contenido.actividades).map((actividad: string, i: number) => (
                                    <li key={i} className="small">• {actividad}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {contenido.recursos && (
                              <div>
                                <small className="text-muted">Recursos:</small>
                                <ul className="list-unstyled ms-3">
                                  {JSON.parse(contenido.recursos).map((recurso: string, i: number) => (
                                    <li key={i} className="small">• {recurso}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center text-muted py-5">
                  <DocumentTextIcon className="w-16 h-16 mx-auto mb-3 text-muted" />
                  <p>No hay contenidos disponibles para esta materia</p>
                </div>
              )}
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
                      <span className="badge bg-primary fs-6">30%</span>
                      <p className="card-text small mt-2">Semana 8</p>
                      <p className="card-text small text-muted">Gramática y vocabulario básico</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="card text-center">
                    <div className="card-body">
                      <h6 className="card-title">Segundo Parcial</h6>
                      <span className="badge bg-warning text-dark fs-6">30%</span>
                      <p className="card-text small mt-2">Semana 16</p>
                      <p className="card-text small text-muted">Comprensión y expresión oral</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="card text-center">
                    <div className="card-body">
                      <h6 className="card-title">Examen Final</h6>
                      <span className="badge bg-danger fs-6">30%</span>
                      <p className="card-text small mt-2">Semana 18</p>
                      <p className="card-text small text-muted">Evaluación integral del curso</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="card text-center">
                    <div className="card-body">
                      <h6 className="card-title">Participación</h6>
                      <span className="badge bg-success fs-6">10%</span>
                      <p className="card-text small mt-2">Continua</p>
                      <p className="card-text small text-muted">Asistencia y participación en clase</p>
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
                      <li className="list-group-item d-flex align-items-center">
                        <BookOpenIcon className="w-4 h-4 text-info me-2" />
                        English Grammar in Use - Raymond Murphy
                      </li>
                      <li className="list-group-item d-flex align-items-center">
                        <BookOpenIcon className="w-4 h-4 text-info me-2" />
                        Oxford Advanced Learner's Dictionary
                      </li>
                      <li className="list-group-item d-flex align-items-center">
                        <BookOpenIcon className="w-4 h-4 text-info me-2" />
                        Practical English Usage - Michael Swan
                      </li>
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
                      <li className="mb-2 d-flex align-items-center">
                        <GlobeAltIcon className="w-4 h-4 text-primary me-2" />
                        Duolingo
                      </li>
                      <li className="mb-2 d-flex align-items-center">
                        <GlobeAltIcon className="w-4 h-4 text-primary me-2" />
                        BBC Learning English
                      </li>
                      <li className="mb-2 d-flex align-items-center">
                        <GlobeAltIcon className="w-4 h-4 text-primary me-2" />
                        Cambridge English
                      </li>
                    </ul>
                    <h6 className="text-success mt-3 d-flex align-items-center">
                      <ComputerDesktopIcon className="w-4 h-4 me-2" />
                      Software:
                    </h6>
                    <ul className="list-unstyled">
                      <li className="mb-2 d-flex align-items-center">
                        <ComputerDesktopIcon className="w-4 h-4 text-success me-2" />
                        Microsoft Teams
                      </li>
                      <li className="mb-2 d-flex align-items-center">
                        <ComputerDesktopIcon className="w-4 h-4 text-success me-2" />
                        Zoom
                      </li>
                      <li className="mb-2 d-flex align-items-center">
                        <ComputerDesktopIcon className="w-4 h-4 text-success me-2" />
                        Google Meet
                      </li>
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
