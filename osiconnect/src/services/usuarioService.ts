import { api } from './api'
import { Usuario } from '@/lib/types'

export const getPerfil = async (): Promise<Usuario> => {
  const res = await api.get('/usuarios/perfil')
  return res.data
}

export const actualizarPerfil = async (data: {
  nombre: string
  avatarUrl?: string
}): Promise<Usuario> => {
  const res = await api.put('/usuarios/perfil', data)
  return res.data
}

export const subirAvatar = async (formData: FormData): Promise<string> => {
  const res = await api.post('/usuarios/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  // Puedes devolver la URL directamente si el backend lo responde
  // o construirla si solo devuelve un OK:
  const base = process.env.NEXT_PUBLIC_API_URL || ''
  return `${base}/uploads/avatars/${res.data}`
}

export const updatePerfil = async (data: { nombre?: string; avatarUrl?: string }) => {
  const res = await api.put('/usuarios/perfil', data)
  return res.data
}