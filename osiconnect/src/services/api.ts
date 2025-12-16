import axios from 'axios';

// Usar variable de entorno o placeholder durante build
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Instancia principal de axios
export const api = axios.create({
  baseURL: `${API_URL}`,
  withCredentials: true, // ✅ Enviar cookies automáticamente
  headers: {
    'Content-Type': 'application/json',
  },
});

// ❌ ELIMINADO: interceptor que añade Authorization header
// Las cookies se envían automáticamente

// Función de login que obtiene el token
export const login = async (email: string, password: string) => {
  const response = await axios.post(
    `${API_URL}/auth/login`,
    { email, password },
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true, // ✅ Recibir cookie del servidor
    }
  );
  return response.data; // Solo devuelve el usuario (sin token)
};
