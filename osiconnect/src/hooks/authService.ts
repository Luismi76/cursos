import { api } from '@/services/api';

export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  const data = response.data;
  // Guardar el token si lo recibes
  if (data?.token) {
    localStorage.setItem('token', data.token);
  }
  return data;
};

export const getPerfil = async () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const response = await api.get('/auth/perfil');
    return response.data;
  } catch (err) {
    console.warn("⚠️ Falló la carga del perfil:", err);
    return null; // o lanza error si prefieres
  }
};

