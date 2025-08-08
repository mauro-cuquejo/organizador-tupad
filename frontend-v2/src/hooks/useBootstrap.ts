import { useEffect } from 'react'

export function useBootstrap() {
  useEffect(() => {
    // Función para inicializar Bootstrap
    const initBootstrap = () => {
      if (typeof window !== 'undefined' && (window as any).bootstrap) {
        // Inicializar dropdowns
        const dropdowns = document.querySelectorAll('.dropdown-toggle')
        dropdowns.forEach(dropdown => {
          if (!dropdown.classList.contains('dropdown-initialized')) {
            new (window as any).bootstrap.Dropdown(dropdown)
            dropdown.classList.add('dropdown-initialized')
          }
        })

        // Inicializar collapse
        const collapses = document.querySelectorAll('.collapse')
        collapses.forEach(collapse => {
          if (!collapse.classList.contains('collapse-initialized')) {
            new (window as any).bootstrap.Collapse(collapse, {
              toggle: false
            })
            collapse.classList.add('collapse-initialized')
          }
        })
      }
    }

    // Intentar inicializar inmediatamente
    initBootstrap()

    // Si no funciona, intentar después de un delay
    const timer = setTimeout(initBootstrap, 100)

    // También intentar cuando el DOM cambie
    const observer = new MutationObserver(initBootstrap)
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [])
}
