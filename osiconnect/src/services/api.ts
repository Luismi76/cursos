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
// Login logic moved to authService.ts
