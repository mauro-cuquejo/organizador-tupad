import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'

export function useAuthInit() {
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])
}
