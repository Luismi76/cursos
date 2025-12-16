"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Curso, EntregaPractica, EntregasAgrupadas } from "@/lib/types";
import {
  getMisCursos,
  listarMisEntregas,
  getHistorialCursoAlumno,
} from "@/services/alumnosService";
import CursoAlumnoPage from "./CursoAlumnoPage";

export default function CursoAlumnoClient() {
  const { cursoId } = useParams() as { cursoId: string };

  const [curso, setCurso] = useState<Curso | null>(null);
  const [entregas, setEntregas] = useState<EntregaPractica[]>([]);
  const [historial, setHistorial] = useState<EntregasAgrupadas | null>(null);

  useEffect(() => {
    const cargar = async () => {
      const cursos = await getMisCursos();
      const curso = cursos.find((c) => c.id === cursoId);
      setCurso(curso || null);

      const [misEntregas, hist] = await Promise.all([
        listarMisEntregas(),
        getHistorialCursoAlumno(cursoId),
      ]);

      setEntregas(misEntregas);
      setHistorial(hist);
    };

    if (cursoId) {
      cargar();
    }
  }, [cursoId]);

  if (!curso) return <p className="p-6">Cargando curso...</p>;

  return (
    <CursoAlumnoPage
      cursoId={cursoId}
      curso={curso}
      entregas={entregas}
      historial={historial}
    />
  );
}
