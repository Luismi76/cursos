import { create } from "zustand";
import {
  agregarModulo,
  agregarUnidadFormativa,
  actualizarUnidad,
  actualizarModulo,
  eliminarModulo as apiEliminarModulo,
  eliminarUnidad as apiEliminarUnidad,

} from "@/services/adminService";
import { getCursoById } from "@/services/cursoService";

import { CursoDTO, ModuloDTO, UnidadFormativaDTO } from "@/lib/types";

interface CursoAdminState {
  curso: CursoDTO | null;
  fetchCurso: (cursoId: string) => Promise<void>;
  addModulo: (cursoId: string, modulo: ModuloDTO) => Promise<void>;
  addUnidad: (moduloId: string, unidad: UnidadFormativaDTO) => Promise<void>;
  updateUnidad: (unidad: UnidadFormativaDTO) => Promise<void>;
  updateModulo: (modulo: ModuloDTO) => Promise<void>;
  eliminarModulo: (id: string) => Promise<void>;
  eliminarUnidad: (id: string) => Promise<void>;
}

export const useCursoAdminStore = create<CursoAdminState>((set, get) => ({
  curso: null,

  fetchCurso: async (cursoId: string) => {
    const curso = await getCursoById(cursoId);
    set({ curso });
  },

  addModulo: async (cursoId, modulo) => {
    const nuevo = await agregarModulo(cursoId, modulo);
    set((state) => ({
      curso: {
        ...state.curso!,
        modulos: [...(state.curso?.modulos || []), { ...nuevo, unidades: [] }],
      },
    }));
  },

  addUnidad: async (moduloId, unidad) => {
    await agregarUnidadFormativa(moduloId, unidad);
    const cursoId = get().curso?.id;
    if (cursoId) await get().fetchCurso(cursoId);
  },

  updateUnidad: async (unidad) => {
    await actualizarUnidad(unidad);
    const cursoId = get().curso?.id;
    if (cursoId) await get().fetchCurso(cursoId);
  },

  eliminarModulo: async (id) => {
    await apiEliminarModulo(id);
    set((state) => ({
      curso: {
        ...state.curso!,
        modulos: (state.curso?.modulos || []).filter((m) => m.id !== id),
      },
    }));
  },

  updateModulo: async (modulo: ModuloDTO) => {
    const actualizado = await actualizarModulo(modulo); // esta función ya está en tu `adminService.ts`
    set((state) => ({
      curso: {
        ...state.curso!,
        modulos: state.curso!.modulos.map((m) =>
          m.id === modulo.id ? { ...m, ...actualizado } : m
        ),
      },
    }));
  },

  eliminarUnidad: async (id) => {
    await apiEliminarUnidad(id);
    const cursoId = get().curso?.id;
    if (cursoId) await get().fetchCurso(cursoId);
  },
}));
