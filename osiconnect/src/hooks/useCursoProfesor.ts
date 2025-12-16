import { useEffect, useState } from "react";
import { getCurso } from "@/services/profesorService";
import { CursoDTO } from "@/lib/types";

export function useCursoProfesor(cursoId: string) {
  const [curso, setCurso] = useState<CursoDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cursoId) return;

    setLoading(true);
    getCurso(cursoId)
      .then((data) => {
        setCurso(data);
        setError(null);
      })
      .catch((err) => {
        console.error("Error al cargar curso:", err);
        setError("No se pudo cargar el curso");
      })
      .finally(() => setLoading(false));
  }, [cursoId]);

  return { curso, loading, error };
}
