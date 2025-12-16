'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/hooks/authStore'

export default function HomePage() {
  const router = useRouter()
  const usuario = useAuthStore(state => state.usuario)

  useEffect(() => {
    if (usuario === null) {
      router.replace('/login')
    } else if (usuario.rol === 'PROFESOR') {
      router.replace('/profesor')
    } else if (usuario.rol === 'ALUMNO') {
      router.replace('/alumno')
    }
  }, [usuario, router])

  return null
}

