// src/services/wikiService.ts

import { AportacionWiki } from "@/lib/types";
import { api } from "@/services/api";

// ✅ Obtener el contenido HTML de la wiki de un curso
export async function getWikiCurso(cursoId: string): Promise<string> {
  const res = await api.get(`/wiki/${cursoId}`);
  return res.data; // se espera un string HTML
}

// ✅ Obtener las aportaciones de los alumnos
export async function getAportacionesWiki(cursoId: string): Promise<AportacionWiki[]> {
  const res = await api.get(`/wiki/${cursoId}/aportaciones`);
  return res.data;
}

// ✅ Enviar una nueva aportación del alumno
export async function crearAportacionWiki(cursoId: string, texto: string) {
  await api.post(`/wiki/${cursoId}/aportaciones`, texto, {
    headers: { "Content-Type": "text/plain" },
  });
}

import { OutputData } from "@editorjs/editorjs";

export async function actualizarWikiCurso(
  cursoId: string,
  contenido: OutputData
) {
  return api.put(`/wiki/${cursoId}`, contenido);
}
