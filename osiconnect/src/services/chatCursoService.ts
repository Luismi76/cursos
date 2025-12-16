// src/services/chatCursoService.ts
import { api } from './api';
import { MensajeCursoDTO } from '@/lib/types';

export const obtenerMensajesCurso = async (cursoId: string): Promise<MensajeCursoDTO[]> => {
  const res = await api.get(`/chat-curso/${cursoId}`);
  return res.data;
};

export const marcarMensajesCursoComoLeidos = async (cursoId: string) => {
  await api.post(`/chat-curso/${cursoId}/leidos`);
};
export const getMensajesCurso = async (cursoId: string): Promise<MensajeCursoDTO[]> => {
  const res = await api.get(`/chat-curso/${cursoId}`);
  return res.data;
};


// ✅ Obtener el número de mensajes no leídos del curso para el usuario actual
export const getMensajesNoLeidos = async (cursoId: string): Promise<number> => {
  const res = await api.get(`/chat-curso/${cursoId}/no-leidos`);
  return res.data;
};

// ✅ Enviar un nuevo mensaje al chat del curso
export const enviarMensajeCurso = async (cursoId: string, contenido: string): Promise<void> => {
  await api.post(`/chat-curso/${cursoId}`, { contenido });
};
