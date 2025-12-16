// src/hooks/chatService.ts
import { api } from "./api";
import { Usuario } from '@/lib/types';

export const obtenerMensajes = async (remitenteId: string, receptorId: string) => {
  const response = await api.get(`/chat/${remitenteId}/${receptorId}`);
  return response.data;
};

export const obtenerUsuarios = async (): Promise<Usuario[]> => {
  const res = await api.get('/usuarios');
  return res.data;
};