// src/components/alumno/CursoAlumnoPage.tsx
"use client";

import { useEffect, useState } from "react";
import { Curso, EntregaPractica, EntregasAgrupadas } from "@/lib/types";
import {
  getMisCursos,
  listarMisEntregas,
  getHistorialCursoAlumno,
} from "@/services/alumnosService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TarjetaPracticaAlumno from "@/components/practicas/TarjetaPractica";
import { AlertCircle, Clock, CheckCircle } from "lucide-react";
import ReactCalendarHeatmap, { HeatmapValue } from "react-calendar-heatmap";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-calendar-heatmap/dist/styles.css";
import "react-tooltip/dist/react-tooltip.css";

interface EventoCurso extends HeatmapValue {
  tipo: string;
  descripcion: string;
}

export default function CursoAlumnoPage({ cursoId }: { cursoId: string }) {
  const [curso, setCurso] = useState<Curso | null>(null);
  const [entregas, setEntregas] = useState<EntregaPractica[]>([]);
  const [historial, setHistorial] = useState<EntregasAgrupadas | null>(null);
  const [eventos, setEventos] = useState<EventoCurso[]>([]);

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

      const eventos: EventoCurso[] = [
        ...(curso?.practicas?.map((p) => ({
          date: p.fechaEntrega,
          count: 1,
          tipo: "entrega",
          descripcion: p.titulo,
        })) ?? []),
      ];
      setEventos(eventos);
    };

    cargar();
  }, [cursoId]);

  if (!curso) return <p className="p-6">Cargando curso...</p>;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Encabezado del curso */}
      <div>
        <h1 className="text-2xl font-bold mb-1">{curso.nombre}</h1>
        <p className="text-muted-foreground text-sm mb-4">
          {curso.descripcion || "Sin descripción"}
        </p>
      </div>

      {/* Calendario visual */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Calendario de eventos del curso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReactCalendarHeatmap
              startDate={new Date(new Date().getFullYear(), 0, 1)}
              endDate={new Date()}
              values={eventos as HeatmapValue[]}
              classForValue={(value: HeatmapValue) => {
                const v = value as EventoCurso;
                if (!v || !v.tipo) return "color-empty";
                return "color-filled";
              }}
              tooltipDataAttrs={(value) => {
                const v = value as EventoCurso;

                if (v && typeof v.tipo === "string" && v.descripcion) {
                  return {
                    "data-tooltip-id": "curso-heatmap-tooltip",
                    "data-tooltip-content": `${v.tipo.toUpperCase()}: ${
                      v.descripcion
                    }`,
                  };
                }

                // Devolver un objeto con valores vacíos seguros
                return {
                  "data-tooltip-id": "curso-heatmap-tooltip",
                  "data-tooltip-content": "",
                };
              }}
            />
            <ReactTooltip id="curso-heatmap-tooltip" />
          </CardContent>
        </Card>
      </section>

      {/* Sección de prácticas */}
      <section>
        <h2 className="text-xl font-semibold">Tus prácticas</h2>
        {curso.practicas && curso.practicas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {curso.practicas.map((practica) => {
              const entrega = entregas.find(
                (e) => e.practica.id === practica.id
              );
              return (
                <TarjetaPracticaAlumno
                  key={practica.id}
                  practica={practica}
                  entrega={entrega}
                  cursoId={curso.id}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mt-2">
            Este curso no tiene prácticas.
          </p>
        )}
      </section>

      {/* Estado del alumno en el curso */}
      {historial && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold mt-6">
            ⏱️ Estado de tus entregas
          </h2>

          {/* Calificadas */}
          {historial.entregadas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" /> Entregadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {historial.entregadas.map((e) => (
                    <li key={e.id}>
                      <span className="font-medium">{e.practica.titulo}</span>
                      {" — "}entregada el{" "}
                      {new Date(e.fechaEntrega).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Pendientes */}
          {historial.pendientes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-700">
                  <Clock className="w-5 h-5" /> Pendientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {historial.pendientes.map((p) => (
                    <li key={p.id}>
                      <span className="font-medium">{p.titulo}</span>
                      {" — "}entrega antes del{" "}
                      {new Date(p.fechaEntrega).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Fuera de plazo */}
          {historial.fueraDePlazo.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" /> Fuera de plazo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {historial.fueraDePlazo.map((p) => (
                    <li key={p.id}>
                      <span className="font-medium">{p.titulo}</span>
                      {" — "}vencida el{" "}
                      {new Date(p.fechaEntrega).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </section>
      )}
    </div>
  );
}
