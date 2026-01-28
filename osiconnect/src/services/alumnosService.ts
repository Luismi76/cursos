import { EntregaPractica, Curso, Practica, Notificacion } from '@/lib/types'
import { api } from './api'

export const entregarPractica = async (
  practicaId: string,
  data: { archivoUrl: string; comentario?: string }
): Promise<EntregaPractica> => {
  const res = await api.post(`/alumno/practica/${practicaId}/entregar`, data)
  return res.data
}

export const verMiEntrega = async (
  practicaId: string
): Promise<EntregaPractica | null> => {
  try {
    const res = await api.get(`/alumno/practica/${practicaId}/mi-entrega`)
    return res.data
  } catch (err) {
    throw err
  }
}

export const listarMisEntregas = async (): Promise<EntregaPractica[]> => {
  const token = localStorage.getItem('token')
  /* token removed from log */
  const res = await api.get('/alumno/mis')
  return res.data
}

export const getMisCursos = async (): Promise<Curso[]> => {
  const res = await api.get('/alumno/cursos')
  return res.data
}

export const subirArchivoEntrega = async (
  practicaId: string,
  formData: FormData
): Promise<string> => {
  const res = await api.post(`/alumno/practica/${practicaId}/archivo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.archivoUrl // ajusta si la clave es distinta
}

export const getPracticaAlumno = async (id: string): Promise<Practica> => {
  const res = await api.get(`/practicas/${id}`) // ✅ Ruta correcta
  return res.data
}


export const getEntregaAlumno = async (id: string): Promise<EntregaPractica | null> => {
  const res = await api.get(`/alumno/entrega/${id}`)
  return res.data
}



export async function getMisNotificaciones(): Promise<Notificacion[]> {
  const res = await api.get('/usuarios/notificaciones')
  return res.data
}

// services/alumnosService.ts
export async function getNotificacionesNoLeidas(): Promise<Notificacion[]> {
  const res = await api.get('/usuarios/notificaciones')
  return res.data.filter((n: Notificacion) => !n.leida)
}

export async function marcarNotificacionComoLeida(id: string) {
  await api.put(`/usuarios/notificaciones/${id}/leida`)
}

import { EntregasAgrupadas } from '@/lib/types'

export async function getHistorialCursoAlumno(cursoId: string): Promise<EntregasAgrupadas> {
  const res = await api.get(`/alumno/curso/${cursoId}/historial`)
  return res.data
}

// Estadísticas del dashboard del alumno
export interface ResumenCursoAlumnoDTO {
  cursoId: string
  cursoNombre: string
  notaActual: number | null
  practicasEntregadas: number
  practicasPendientes: number
  porcentajeAsistencia: number
  examenesRealizados: number
  examenesPendientes: number
}

export interface EstadisticasAlumnoDTO {
  totalCursos: number
  totalPracticasEntregadas: number
  totalPracticasPendientes: number
  promedioGeneral: number | null
  porcentajeAsistenciaGlobal: number
  totalExamenesPendientes: number
  cursos: ResumenCursoAlumnoDTO[]
}

export async function getEstadisticasAlumno(): Promise<EstadisticasAlumnoDTO> {
  const res = await api.get('/alumno/estadisticas')
  return res.data
}
