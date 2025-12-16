import { Curso, Practica, CrearPracticaDTO, CursoDTO } from '@/lib/types'
import { api } from './api'

export interface ResumenCursoProfesorDTO {
  cursoId: string;
  cursoNombre: string;
  totalAlumnos: number;
  entregasPendientes: number;
  examenesProximos: number;
  asistenciaMedia: number;
  promedioNotas: number;
}

export interface EstadisticasProfesorDTO {
  totalCursos: number;
  totalAlumnos: number;
  entregasPendientes: number;
  examenesProximos: number;
  asistenciaMedia: number;
  cursos: ResumenCursoProfesorDTO[];
}

export const getEstadisticasProfesor = async (): Promise<EstadisticasProfesorDTO> => {
  const response = await api.get('/profesor/estadisticas')
  return response.data
}

export const getCursosProfesor = async (): Promise<Curso[]> => {
  const response = await api.get('/profesor/cursos')
  return response.data
}

export const getCurso = async (cursoId: string): Promise<CursoDTO> => {
  const response = await api.get(`/profesor/curso/${cursoId}`)
  return response.data
}


export const crearCurso = async (data: { nombre: string; descripcion: string }): Promise<Curso> => {
  const response = await api.post('/profesor/curso', data)
  return response.data
}


export const getAlumnosCurso = async (cursoId: string) => {
  const res = await api.get(`/profesor/curso/${cursoId}/alumnos`);
  return res.data
}

export const agregarAlumnoCurso = async (cursoId: string, email: string) => {
  await api.post(`/profesor/curso/${cursoId}/alumnos`, { email });
}

export const eliminarAlumnoCurso = async (cursoId: string, alumnoId: string) => {
  await api.delete(`/profesor/curso/${cursoId}/alumnos/${alumnoId}`);
};

export const getAlumnosDisponibles = async (cursoId: string) => {
  const res = await api.get(`/profesor/curso/${cursoId}/alumnos-disponibles`)
  return res.data
}

export const getPracticasCurso = async (cursoId: string): Promise<Practica[]> => {
  const res = await api.get(`/profesor/curso/${cursoId}/practicas`)
  return res.data
}

export const crearPracticaCurso = async (cursoId: string, data: CrearPracticaDTO): Promise<Practica> => {
  const res = await api.post(`/profesor/curso/${cursoId}/practicas`, data)
  return res.data
}

export const eliminarPracticaCurso = async (cursoId: string, practicaId: string) => {
  await api.delete(`/profesor/curso/${cursoId}/practicas/${practicaId}`)
}

export const editarPracticaCurso = async (
  cursoId: string,
  practicaId: string,
  data: { titulo: string; descripcion: string; fechaEntrega: string }
) => {
  await api.put(`/profesor/curso/${cursoId}/practicas/${practicaId}`, data)
}

export const calificarEntrega = async (
  entregaId: string,
  data: { nota: number; comentarioProfesor: string }
) => {
  await api.put(`/profesor/entrega/${entregaId}/calificar`, data)
}

import { EntregaPractica } from '@/lib/types' // o EntregaPracticaDTO si lo usas

export const getEntregasPractica = async (practicaId: string): Promise<EntregaPractica[]> => {
  const res = await api.get(`/profesor/practica/${practicaId}/entregas`)
  return res.data
}