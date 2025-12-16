import { create } from 'zustand'
import type { Perfil } from '@/lib/types' // o Usuario si prefieres

interface AuthState {
  usuario: Perfil | null
  setUser: (u: Perfil) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>(set => ({
  usuario: null,
  setUser: usuario => set({ usuario }),
  logout: () => {
    localStorage.removeItem('token')
    set({ usuario: null })
  }
}))
