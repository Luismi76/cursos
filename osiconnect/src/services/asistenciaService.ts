import { api } from "@/services/api";

export type EstadoAsistencia = "PRESENTE" | "AUSENTE" | "RETRASO" | "JUSTIFICADO";

export interface AsistenciaDTO {
    id: string;
    alumnoId: string;
    alumnoNombre: string;
    cursoId: string;
    fecha: string;
    estado: EstadoAsistencia;
    observaciones: string | null;
}

export interface RegistroAsistenciaDTO {
    alumnoId: string;
    fecha: string;
    estado: EstadoAsistencia;
    observaciones?: string;
}

export interface EstadisticasAsistenciaDTO {
    alumnoId: string;
    alumnoNombre: string;
    totalClases: number;
    presentes: number;
    ausentes: number;
    retrasos: number;
    justificados: number;
    porcentajeAsistencia: number;
}

// Profesor/Admin: obtener toda la asistencia del curso
export async function getAsistenciaCurso(cursoId: string): Promise<AsistenciaDTO[]> {
    const res = await api.get(`/curso/${cursoId}/asistencia`);
    return res.data;
}

// Profesor/Admin: obtener asistencia por fecha
export async function getAsistenciaPorFecha(cursoId: string, fecha: string): Promise<AsistenciaDTO[]> {
    const res = await api.get(`/curso/${cursoId}/asistencia/fecha/${fecha}`);
    return res.data;
}

// Profesor/Admin: obtener fechas con asistencia registrada
export async function getFechasConAsistencia(cursoId: string): Promise<string[]> {
    const res = await api.get(`/curso/${cursoId}/asistencia/fechas`);
    return res.data;
}

// Alumno: obtener mi asistencia
export async function getMiAsistencia(cursoId: string): Promise<AsistenciaDTO[]> {
    const res = await api.get(`/curso/${cursoId}/asistencia/mi-asistencia`);
    return res.data;
}

// Alumno: obtener mis estadísticas
export async function getMisEstadisticas(cursoId: string): Promise<EstadisticasAsistenciaDTO> {
    const res = await api.get(`/curso/${cursoId}/asistencia/mi-asistencia/estadisticas`);
    return res.data;
}

// Profesor/Admin: obtener asistencia de un alumno
export async function getAsistenciaAlumno(cursoId: string, alumnoId: string): Promise<AsistenciaDTO[]> {
    const res = await api.get(`/curso/${cursoId}/asistencia/alumno/${alumnoId}`);
    return res.data;
}

// Profesor/Admin: obtener estadísticas de un alumno
export async function getEstadisticasAlumno(cursoId: string, alumnoId: string): Promise<EstadisticasAsistenciaDTO> {
    const res = await api.get(`/curso/${cursoId}/asistencia/alumno/${alumnoId}/estadisticas`);
    return res.data;
}

// Profesor/Admin: registrar asistencia individual
export async function registrarAsistencia(cursoId: string, registro: RegistroAsistenciaDTO): Promise<AsistenciaDTO> {
    const res = await api.post(`/curso/${cursoId}/asistencia`, registro);
    return res.data;
}

// Profesor/Admin: registrar asistencia múltiple
export async function registrarAsistenciaMultiple(cursoId: string, registros: RegistroAsistenciaDTO[]): Promise<void> {
    await api.post(`/curso/${cursoId}/asistencia/multiple`, registros);
}

// Profesor/Admin: actualizar asistencia
export async function actualizarAsistencia(
    cursoId: string,
    asistenciaId: string,
    estado: EstadoAsistencia,
    observaciones?: string
): Promise<AsistenciaDTO> {
    const res = await api.put(`/curso/${cursoId}/asistencia/${asistenciaId}`, {
        estado,
        observaciones: observaciones || null
    });
    return res.data;
}

// Profesor/Admin: eliminar registro de asistencia
export async function eliminarAsistencia(cursoId: string, asistenciaId: string): Promise<void> {
    await api.delete(`/curso/${cursoId}/asistencia/${asistenciaId}`);
}
