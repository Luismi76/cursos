import { api } from "@/services/api";

export interface ResumenNotasCursoDTO {
    cursoId: string;
    cursoNombre: string;
    notaPracticas: number | null;
    practicasCalificadas: number;
    notaExamenes: number | null;
    examenesCalificados: number;
    porcentajeAsistencia: number;
    notaFinal: number | null;
}

export interface ResumenAlumnoCursoDTO {
    alumnoId: string;
    alumnoNombre: string;
    alumnoEmail: string;
    notaPracticas: number | null;
    practicasCalificadas: number;
    notaExamenes: number | null;
    examenesCalificados: number;
    porcentajeAsistencia: number;
    notaFinal: number | null;
}

// Obtener resumen de notas en todos los cursos del alumno
export async function getMisNotas(): Promise<ResumenNotasCursoDTO[]> {
    const res = await api.get('/notas/mis-notas');
    return res.data;
}

// Obtener resumen de notas de un curso específico
export async function getMisNotasCurso(cursoId: string): Promise<ResumenNotasCursoDTO> {
    const res = await api.get(`/notas/mis-notas/curso/${cursoId}`);
    return res.data;
}

// Obtener promedio general del alumno
export async function getPromedioGeneral(): Promise<number> {
    const res = await api.get('/notas/promedio-general');
    return res.data;
}

// Obtener resumen de todos los alumnos de un curso (para profesores)
export async function getResumenAlumnosCurso(cursoId: string): Promise<ResumenAlumnoCursoDTO[]> {
    const res = await api.get(`/notas/curso/${cursoId}/alumnos`);
    return res.data;
}
