import { useEffect, useState } from 'react'
import { getPerfil } from '@/services/usuarioService'

export function useRol() {
  const [rol, setRol] = useState<'ALUMNO' | 'PROFESOR' | 'ADMINISTRADOR' | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    getPerfil()
      .then((perfil) => {
        setRol(perfil.rol as 'ALUMNO' | 'PROFESOR' | 'ADMINISTRADOR')
      })
      .catch(() => {
        // opcional: limpiar sesión si el token es inválido
        setRol(null)
      })
  }, [])

  return rol
}
