import { api } from "@/services/api"; // ajusta si tu ruta de cliente cambia
import {
  CursoDTO,
  ModuloDTO,
  UnidadFormativaDTO,
  EventoCursoDTO,
  Usuario
} from "@/lib/types";

export const crearCurso = async (curso: { nombre: string; descripcion: string }) => {
  const response = await api.post<CursoDTO>("/admin/curso", curso);
  return response.data;
};

export const asignarProfesor = async (cursoId: string, profesorId: string) => {
  await api.post(`/admin/curso/${cursoId}/profesor/${profesorId}`);
};

export const matricularAlumno = async (cursoId: string, alumnoId: string) => {
  await api.post(`/admin/curso/${cursoId}/alumno/${alumnoId}`);
};

export const agregarModulo = async (cursoId: string, modulo: ModuloDTO): Promise<ModuloDTO> => {
  const res = await api.post(`/admin/curso/${cursoId}/modulo`, modulo);
  return res.data;
};

export const agregarUnidadFormativa = async (moduloId: string, unidad: UnidadFormativaDTO) => {
  await api.post(`/admin/modulo/${moduloId}/unidad`, unidad);
};

export const crearEventoAdmin = async (cursoId: string, evento: EventoCursoDTO) => {
  await api.post(`/admin/curso/${cursoId}/evento`, evento);
};

export const listarCursos = async (): Promise<CursoDTO[]> => {
  const response = await api.get("/admin/cursos")
  return response.data
}

export const getCursoById = async (cursoId: string): Promise<CursoDTO> => {
  const response = await api.get(`/admin/curso/${cursoId}`); // ✅ CORRECTO
  console.log("Estos son los módulos de este curso: ", response.data);
  return response.data;
}

export async function getProfesores(): Promise<Usuario[]> {
  const res = await api.get('/admin/profesores')
  return res.data
}

export const getAlumnosDisponiblesAdmin = async (cursoId: string) => {
  const res = await api.get(`/admin/curso/${cursoId}/alumnos-disponibles`)
  return res.data
}

export const getAlumnosCursoAdmin = async (cursoId: string) => {
  const res = await api.get(`/admin/curso/${cursoId}/alumnos`);
  return res.data;
};

export async function actualizarModulo(modulo: ModuloDTO) {
  const res = await api.put(`/admin/modulo/${modulo.id}`, modulo);
  return res.data;
}

export async function eliminarModulo(id: string) {
  await api.delete(`/admin/modulo/${id}`);
}

export async function actualizarUnidad(unidad: UnidadFormativaDTO) {
  const res = await api.put(`/admin/unidad/${unidad.id}`, unidad);
  return res.data;
}


export async function eliminarUnidad(id: string) {
  await api.delete(`/admin/unidad/${id}`);
}

export async function actualizarNombreCurso(cursoId: string, nombre: string) {
  const res = await api.put(`/admin/curso/${cursoId}/nombre`, { nombre });
  return res.data;
}

export async function actualizarDescripcionCurso(cursoId: string, descripcion: string) {
  const res = await api.put(`/admin/curso/${cursoId}/descripcion`, { descripcion });
  return res.data;
}

// Gestión de usuarios

export async function getUsuarios(): Promise<Usuario[]> {
  const res = await api.get('/admin/usuarios');
  return res.data;
}

export async function crearUsuario(usuario: { nombre: string; email: string; password: string; rol: string }): Promise<Usuario> {
  const res = await api.post('/admin/usuarios', usuario);
  return res.data;
}

export async function actualizarUsuario(id: string, usuario: { nombre: string; email: string; rol: string }): Promise<Usuario> {
  const res = await api.put(`/admin/usuarios/${id}`, usuario);
  return res.data;
}

export async function eliminarUsuario(id: string): Promise<void> {
  await api.delete(`/admin/usuarios/${id}`);
}
