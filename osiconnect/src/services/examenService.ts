import { api } from "@/services/api";

export type TipoExamen = "PARCIAL" | "FINAL" | "RECUPERACION" | "PRUEBA";

export interface ExamenDTO {
    id: string;
    titulo: string;
    descripcion: string | null;
    cursoId: string;
    fecha: string;
    tipo: TipoExamen;
    puntuacionMaxima: number;
    totalNotas?: number;
    promedioNotas?: number;
}

export interface CrearExamenDTO {
    titulo: string;
    descripcion?: string;
    fecha: string;
    tipo: TipoExamen;
    puntuacionMaxima?: number;
}

export interface NotaExamenDTO {
    id: string;
    examenId: string;
    examenTitulo: string;
    alumnoId: string;
    alumnoNombre: string;
    nota: number | null;
    puntuacionMaxima: number;
    observaciones: string | null;
    fechaCalificacion: string;
}

export interface RegistrarNotaDTO {
    alumnoId: string;
    nota: number | null;
    observaciones?: string;
}

// Obtener todos los exámenes del curso
export async function getExamenesCurso(cursoId: string): Promise<ExamenDTO[]> {
    const res = await api.get(`/curso/${cursoId}/examenes`);
    return res.data;
}

// Obtener próximos exámenes
export async function getProximosExamenes(cursoId: string): Promise<ExamenDTO[]> {
    const res = await api.get(`/curso/${cursoId}/examenes/proximos`);
    return res.data;
}

// Obtener exámenes pasados
export async function getExamenesPasados(cursoId: string): Promise<ExamenDTO[]> {
    const res = await api.get(`/curso/${cursoId}/examenes/pasados`);
    return res.data;
}

// Crear examen (profesor/admin)
export async function crearExamen(cursoId: string, examen: CrearExamenDTO): Promise<ExamenDTO> {
    const res = await api.post(`/curso/${cursoId}/examenes`, examen);
    return res.data;
}

// Actualizar examen (profesor/admin)
export async function actualizarExamen(cursoId: string, examenId: string, examen: CrearExamenDTO): Promise<ExamenDTO> {
    const res = await api.put(`/curso/${cursoId}/examenes/${examenId}`, examen);
    return res.data;
}

// Eliminar examen (profesor/admin)
export async function eliminarExamen(cursoId: string, examenId: string): Promise<void> {
    await api.delete(`/curso/${cursoId}/examenes/${examenId}`);
}

// Obtener notas de un examen (profesor/admin)
export async function getNotasExamen(cursoId: string, examenId: string): Promise<NotaExamenDTO[]> {
    const res = await api.get(`/curso/${cursoId}/examenes/${examenId}/notas`);
    return res.data;
}

// Obtener mis notas (alumno)
export async function getMisNotasExamenes(cursoId: string): Promise<NotaExamenDTO[]> {
    const res = await api.get(`/curso/${cursoId}/examenes/mis-notas`);
    return res.data;
}

// Obtener mi promedio (alumno)
export async function getMiPromedioExamenes(cursoId: string): Promise<number> {
    const res = await api.get(`/curso/${cursoId}/examenes/mi-promedio`);
    return res.data;
}

// Registrar nota individual (profesor/admin)
export async function registrarNota(cursoId: string, examenId: string, nota: RegistrarNotaDTO): Promise<NotaExamenDTO> {
    const res = await api.post(`/curso/${cursoId}/examenes/${examenId}/notas`, nota);
    return res.data;
}

// Registrar múltiples notas (profesor/admin)
export async function registrarNotasMultiples(cursoId: string, examenId: string, notas: RegistrarNotaDTO[]): Promise<void> {
    await api.post(`/curso/${cursoId}/examenes/${examenId}/notas/multiple`, notas);
}

// Eliminar nota (profesor/admin)
export async function eliminarNota(cursoId: string, notaId: string): Promise<void> {
    await api.delete(`/curso/${cursoId}/examenes/notas/${notaId}`);
}
