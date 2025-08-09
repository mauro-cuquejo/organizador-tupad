import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { materiasService, type Materia } from '@/services/materiasService'
import toast from 'react-hot-toast'
import {
  BookOpenIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

export function MateriasPage() {
  const { user } = useAuthStore()
  const [materias, setMaterias] = useState<Materia[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalMaterias, setTotalMaterias] = useState(0)
  const [showInactive, setShowInactive] = useState(false)

  const loadMaterias = async () => {
    setLoading(true)
    try {
      const params = {
        page: currentPage,
        limit: 10,
        activo: showInactive ? undefined : true
      }

      const response = await materiasService.getAll(params)
      setMaterias(response.materias)
      setTotalPages(response.pagination.pages)
      setTotalMaterias(response.pagination.total)
    } catch (error: any) {
      console.error('Error al cargar materias:', error)
      toast.error('Error al cargar las materias')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMaterias()
  }, [currentPage, showInactive])

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      setLoading(true)
      try {
        // Implementar búsqueda cuando esté disponible
        toast.success(`Buscando: ${searchTerm}`)
      } catch (error) {
        toast.error('Error en la búsqueda')
      } finally {
        setLoading(false)
      }
    } else {
      loadMaterias()
    }
  }

  const handleDelete = async (id: number, nombre: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la materia "${nombre}"?`)) {
      try {
        await materiasService.delete(id)
        toast.success('Materia eliminada exitosamente')
        loadMaterias()
      } catch (error: any) {
        console.error('Error al eliminar materia:', error)
        toast.error('Error al eliminar la materia')
      }
    }
  }

  const handleCreateMateria = () => {
    toast.success('Función de crear materia - En desarrollo')
  }

  const handleEditMateria = (id: number) => {
    toast.success(`Editando materia ${id} - En desarrollo`)
  }

  const handleViewMateria = (id: number) => {
    toast.success(`Viendo materia ${id} - En desarrollo`)
  }

  return (
    <div className="materias-page">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">
            <BookOpenIcon className="w-6 h-6 me-2" />
            Materias
          </h1>
          <p className="text-muted mb-0">
            Gestiona las materias del sistema ({totalMaterias} total)
          </p>
        </div>
        <div>
          <button
            className="btn btn-primary"
            onClick={handleCreateMateria}
          >
            <PlusIcon className="w-4 h-4 me-2" />
            Nueva Materia
          </button>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar materias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={handleSearch}
                >
                  <MagnifyingGlassIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="showInactive"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="showInactive">
                  Mostrar inactivas
                </label>
              </div>
            </div>
            <div className="col-md-3 text-end">
              <button
                className="btn btn-outline-secondary"
                onClick={loadMaterias}
                disabled={loading}
              >
                <FunnelIcon className="w-4 h-4 me-1" />
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando materias...</p>
        </div>
      )}

      {/* Lista de Materias */}
      {!loading && (
        <>
          {materias.length === 0 ? (
            <div className="text-center py-5">
              <BookOpenIcon className="w-12 h-12 text-muted mb-3" />
              <h5>No se encontraron materias</h5>
              <p className="text-muted">
                {searchTerm ? 'No hay materias que coincidan con tu búsqueda.' : 'No hay materias registradas.'}
              </p>
            </div>
          ) : (
            <div className="card">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Créditos</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materias.map((materia) => (
                        <tr key={materia.id}>
                          <td>
                            <strong>{materia.codigo}</strong>
                          </td>
                          <td>{materia.nombre}</td>
                          <td>
                            <span className="text-muted">
                              {materia.descripcion?.length > 50
                                ? `${materia.descripcion.substring(0, 50)}...`
                                : materia.descripcion || 'Sin descripción'}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-info">{materia.creditos}</span>
                          </td>
                          <td>
                            <span className={`badge ${materia.activo ? 'bg-success' : 'bg-secondary'}`}>
                              {materia.activo ? 'Activa' : 'Inactiva'}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleViewMateria(materia.id)}
                                title="Ver detalles"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </button>
                              {(user?.rol === 'admin' || user?.rol === 'profesor') && (
                                <>
                                  <button
                                    className="btn btn-sm btn-outline-warning"
                                    onClick={() => handleEditMateria(materia.id)}
                                    title="Editar"
                                  >
                                    <PencilIcon className="w-4 h-4" />
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDelete(materia.id, materia.nombre)}
                                    title="Eliminar"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <nav className="mt-4">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </button>
                </li>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  </li>
                ))}

                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  )
}
