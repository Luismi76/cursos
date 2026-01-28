// types.ts
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: "ALUMNO" | "PROFESOR" | "ADMINISTRADOR";
  avatarUrl?: string; // ← Añadido
}
export interface Curso {
  id: string;
  nombre: string;
  descripcion: string;
  profesor: Usuario;
  alumnos: Usuario[];
  practicas?: Practica[];
}

export interface Alumno {
  id: string;
  nombre: string;
  email: string;
}

export type Practica = {
  id: string;
  titulo: string;
  descripcion: string;
  fechaEntrega: string; // ISO string, ej: "2025-05-10T00:00:00Z"
};

export type CrearPracticaDTO = {
  titulo: string;
  descripcion: string;
  fechaEntrega: string;
};

export interface EntregaPractica {
  id: string;
  practica: {
    id: string;
    titulo: string;
  };
  alumno: {
    id: string;
    nombre: string;
    email: string;
  };
  comentario: string;
  archivoUrl: string;
  fechaEntrega: string; // formato ISO, ej. "2025-05-10T18:30:00Z"
  nota: number | null;
  comentarioProfesor: string | null;
}

// lib/types.ts

export interface Perfil {
  id: number;
  nombre: string;
  email: string;
  rol: "ALUMNO" | "PROFESOR" | "ADMINISTRADOR";
  avatarUrl?: string;
}

// Agrupación para las entregas de una práctica

// DTO para calificar una entrega
export interface CalificacionDTO {
  nota: number;
  comentario: string;
}

export interface Notificacion {
  id: string;
  mensaje: string;
  tipo: string;
  leida: boolean;
  fecha: string; // ISO string
}

export interface EntregasAgrupadas {
  entregadas: EntregaPractica[];
  pendientes: Practica[];
  fueraDePlazo: Practica[];
}

// CursoDTO.ts
export interface CursoDTO {
  id: string;
  nombre: string;
  descripcion: string;
  profesorNombre?: string;
  alumnos?: AlumnoDTO[];
  modulos: ModuloDTO[];
  practicas?: PracticaDTO[];
}

// ModuloDTO.ts
export interface ModuloDTO {
  id?: string;
  nombre: string;
  fechaInicio?: string; // ← puede no estar definida al principio
  fechaFin?: string;
  unidades?: UnidadFormativaDTO[];
}

// UnidadFormativaDTO.ts
export interface UnidadFormativaDTO {
  id?: string;
  nombre: string;
  fechaInicio?: string;
  fechaFin?: string;
  moduloId?: string; // ✅ Añadir esta línea
}


// EventoCursoDTO.ts
export interface EventoCursoDTO {
  titulo: string;
  descripcion?: string;
  tipo: TipoEvento;
  visiblePara: VisibilidadEvento;
  fecha: string;
}

// enums
export enum TipoEvento {
  INICIO_CURSO = "INICIO_CURSO",
  FIN_CURSO = "FIN_CURSO",
  INICIO_MODULO = "INICIO_MODULO",
  FIN_MODULO = "FIN_MODULO",
  INICIO_UF = "INICIO_UF",
  FIN_UF = "FIN_UF",
  ENTREGA = "ENTREGA",
  EVALUACION = "EVALUACION",
  OTRO = "OTRO",
}

export type VisibilidadEvento = "ADMIN" | "PROFESOR" | "ALUMNO";

// AlumnoDTO.ts (simplificado)
export interface AlumnoDTO {
  id: string;
  nombre: string;
  email: string;
}

// PracticaDTO.ts (simplificado, si lo necesitas)
export interface PracticaDTO {
  id: string;
  titulo: string;
  descripcion: string;
  fechaEntrega: string;
}

export interface MensajeCursoDTO {
  id: string;
  contenido: string;
  fechaEnvio: string; // ISO String
  autor: {
    id?: string;
    nombre: string;
    avatarUrl?: string;
  };
}

export interface AportacionWiki {
  id: string;
  contenido: string;
  fecha: string;
  autor: {
    id: string;
    nombre: string;
  };
}
