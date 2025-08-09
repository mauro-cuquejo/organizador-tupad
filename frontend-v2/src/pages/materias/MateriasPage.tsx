import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { materiasService, type Materia, type MateriasFilters } from '@/services/materiasService'
import toast from 'react-hot-toast'
import {
  BookOpenIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  TableCellsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from '@heroicons/react/24/outline'

export function MateriasPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [materias, setMaterias] = useState<Materia[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalMaterias, setTotalMaterias] = useState(0)
  const [showInactive, setShowInactive] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  // Filtros avanzados
  const [creditosFilter, setCreditosFilter] = useState<string>('')

  const loadMaterias = useCallback(async () => {
    setLoading(true)
    try {
      const params: MateriasFilters = {
        page: currentPage,
        limit: 10,
        activo: showInactive ? undefined : true
      }

      // Aplicar filtros avanzados
      if (creditosFilter) {
        params.creditos = creditosFilter as '1-3' | '4-6' | '7-9' | '10+'
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
  }, [currentPage, showInactive, creditosFilter])

  const searchMaterias = useCallback(async (query: string) => {
    if (!query.trim()) {
      setIsSearching(false)
      loadMaterias()
      return
    }

    setIsSearching(true)
    setLoading(true)
    try {
      const searchResults = await materiasService.search(query)
      setMaterias(searchResults)
      setTotalPages(1)
      setTotalMaterias(searchResults.length)
    } catch (error: any) {
      console.error('Error al buscar materias:', error)
      toast.error('Error al buscar materias')
      // Si falla la búsqueda, cargar todas las materias
      loadMaterias()
    } finally {
      setLoading(false)
      setIsSearching(false)
    }
  }, [loadMaterias])

  useEffect(() => {
    if (searchTerm.trim()) {
      // Debounce para la búsqueda
      const timeoutId = setTimeout(() => {
        searchMaterias(searchTerm)
      }, 500)

      return () => clearTimeout(timeoutId)
    } else {
      loadMaterias()
    }
  }, [searchTerm, searchMaterias, loadMaterias])

  const handleSearch = () => {
    if (searchTerm.trim()) {
      searchMaterias(searchTerm)
    } else {
      loadMaterias()
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setCurrentPage(1)
    setIsSearching(false)
  }

  const handleClearAll = () => {
    setCreditosFilter('')
    setSearchTerm('')
    setCurrentPage(1)
    setIsSearching(false)
  }

  const handleFilterChange = () => {
    setCurrentPage(1)
    // Los filtros se aplicarán automáticamente en el useEffect
  }

  const handleDelete = async (id: number, nombre: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la materia "${nombre}"?`)) {
      try {
        await materiasService.delete(id)
        toast.success('Materia eliminada exitosamente')
        // Recargar datos después de eliminar
        if (searchTerm.trim()) {
          searchMaterias(searchTerm)
        } else {
          loadMaterias()
        }
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
    navigate(`/materias/${id}`)
  }

  // Verificar si hay filtros activos
  const hasActiveFilters = creditosFilter || searchTerm.trim()

  return (
    <div className="materias-page">
      {/* Header */}
      <div className="page-header">
        <div className="row align-items-center">
          <div className="col-md-6">
            <h1 className="page-title">
              <BookOpenIcon className="w-8 h-8 me-2" />
              Gestión de Materias
            </h1>
            <p className="page-subtitle">
              Administra las materias académicas ({totalMaterias} total)
              {isSearching && <span className="ms-2 badge bg-info">Buscando...</span>}
              {hasActiveFilters && <span className="ms-2 badge bg-warning">Filtros activos</span>}
            </p>
          </div>
          <div className="col-md-6 text-end">
            <button
              className="btn btn-light me-2"
              onClick={handleCreateMateria}
            >
              <PlusIcon className="w-4 h-4 me-2" />
              Nueva Materia
            </button>
            <button
              className="btn btn-outline-light me-2"
              onClick={() => toast.success('Función de exportar - En desarrollo')}
            >
              <ArrowDownTrayIcon className="w-4 h-4 me-2" />
              Exportar
            </button>
            <button
              className="btn btn-outline-light"
              onClick={() => toast.success('Función de importar - En desarrollo')}
            >
              <ArrowUpTrayIcon className="w-4 h-4 me-2" />
              Importar
            </button>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="card filters-card mb-4">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">
              <FunnelIcon className="w-5 h-5 me-2" />
              Filtros de Búsqueda
            </h5>
            {hasActiveFilters && (
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={handleClearAll}
              >
                <XMarkIcon className="w-4 h-4 me-1" />
                Limpiar
              </button>
            )}
          </div>
        </div>
        <div className="card-body">
          <div className="row g-3">
            {/* Búsqueda principal */}
            <div className="col-md-6">
              <label className="form-label">Buscar por nombre o código</label>
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
                  disabled={loading}
                >
                  <MagnifyingGlassIcon className="w-4 h-4" />
                </button>
                {searchTerm && (
                  <button
                    className="btn btn-outline-danger"
                    type="button"
                    onClick={handleClearSearch}
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Filtro por créditos */}
            <div className="col-md-3">
              <label className="form-label">Créditos</label>
              <select
                className="form-select"
                value={creditosFilter}
                onChange={(e) => {
                  setCreditosFilter(e.target.value)
                  handleFilterChange()
                }}
                disabled={isSearching}
              >
                <option value="">Todos</option>
                <option value="1-3">1-3 créditos</option>
                <option value="4-6">4-6 créditos</option>
                <option value="7-9">7-9 créditos</option>
                <option value="10+">10+ créditos</option>
              </select>
            </div>

            {/* Filtro por estado */}
            <div className="col-md-3">
              <label className="form-label">Estado</label>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="showInactive"
                  checked={showInactive}
                  onChange={(e) => {
                    setShowInactive(e.target.checked)
                    handleFilterChange()
                  }}
                  disabled={isSearching}
                />
                <label className="form-check-label" htmlFor="showInactive">
                  Mostrar Inactivas
                </label>
              </div>
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
          <p className="mt-3 text-muted">
            {isSearching ? 'Buscando materias...' : 'Cargando materias...'}
          </p>
        </div>
      )}

      {/* Lista de Materias */}
      {!loading && (
        <>
          {materias.length === 0 ? (
            <div className="card">
              <div className="card-body">
                <div className="empty-state">
                  <BookOpenIcon className="w-16 h-16 text-muted mb-3" />
                  <h4>No se encontraron materias</h4>
                  <p>
                    {searchTerm ? `No hay materias que coincidan con "${searchTerm}".` :
                     hasActiveFilters ? 'No hay materias que coincidan con los filtros aplicados.' :
                     'No hay materias registradas.'}
                  </p>
                  {hasActiveFilters && (
                    <div className="mt-3">
                      <button className="btn btn-outline-primary me-2 d-inline-flex align-items-center" style={{ height: '38px' }} onClick={handleClearAll}>
                        <XMarkIcon className="w-4 h-4 me-2" />
                        Limpiar
                      </button>
                    </div>
                  )}
                  <div className="mt-3">
                    <button className="btn btn-primary d-inline-flex align-items-center" style={{ height: '38px' }} onClick={handleCreateMateria}>
                      <PlusIcon className="w-4 h-4 me-2" />
                      Crear primera materia
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-header">
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <h5 className="card-title mb-0">
                      <TableCellsIcon className="w-5 h-5 me-2" />
                      Materias ({totalMaterias})
                      {isSearching && <span className="ms-2 badge bg-info">Resultados de búsqueda</span>}
                      {hasActiveFilters && <span className="ms-2 badge bg-warning">Filtros aplicados</span>}
                    </h5>
                  </div>
                  <div className="col-md-6 text-end">
                    {!isSearching && totalPages > 1 && (
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeftIcon className="w-4 h-4" />
                        </button>
                        <button className="btn btn-outline-primary" disabled>
                          Página {currentPage} de {totalPages}
                        </button>
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage >= totalPages}
                        >
                          <ChevronRightIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Materia</th>
                        <th>Créditos</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materias.map((materia) => (
                        <tr key={materia.id} className="materia-row">
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="materia-icon me-3">
                                <BookOpenIcon className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="fw-bold">{materia.nombre}</div>
                                <small className="text-muted">{materia.codigo}</small>
                                {materia.descripcion && (
                                  <div className="text-truncate-2 text-muted mt-1">
                                    {materia.descripcion}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-info">{materia.creditos} créditos</span>
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
          {!isSearching && totalPages > 1 && (
            <nav className="mt-4">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronDoubleLeftIcon className="w-4 h-4" />
                  </button>
                </li>
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
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
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </li>
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronDoubleRightIcon className="w-4 h-4" />
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
