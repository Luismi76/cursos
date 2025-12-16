import { TareaGantt } from "@/components/common/GanttDHTMLX";
import { CursoDTO } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

export function transformCursoToTareas(curso: CursoDTO | null | undefined): TareaGantt[] {
  if (!curso?.modulos) return [];

  return curso.modulos.flatMap((mod) => {
    const { id: modId = uuidv4(), nombre, fechaInicio, fechaFin, unidades } = mod;
    if (!nombre || !fechaInicio || !fechaFin) return [];

    const modTarea: TareaGantt = {
      id: modId,
      text: nombre,
      start_date: fechaInicio,
      duration:
        (new Date(fechaFin).getTime() - new Date(fechaInicio).getTime()) /
          (1000 * 60 * 60 * 24) +
        1,
    };

    const tareasUnidades: TareaGantt[] =
      unidades
        ?.filter((uf) => uf.nombre && uf.fechaInicio && uf.fechaFin)
        .map((uf) => ({
          id: uf.id ?? uuidv4(),
          text: uf.nombre!,
          start_date: uf.fechaInicio!,
          duration:
            (new Date(uf.fechaFin!).getTime() - new Date(uf.fechaInicio!).getTime()) /
              (1000 * 60 * 60 * 24) +
            1,
          parent: modId,
        })) ?? [];

    return [modTarea, ...tareasUnidades];
  });
}
