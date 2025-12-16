import { api } from "@/services/api";
import { CursoDTO } from "@/lib/types";

export const getCursoById = async (cursoId: string): Promise<CursoDTO> => {
  const response = await api.get<CursoDTO>(`/cursos/${cursoId}`);
  return response.data;
};
