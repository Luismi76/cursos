"use client";

import { useEffect, useState } from "react";
import { useCursoAdminStore } from "@/hooks/useSecuenciacionStore";
import { TipoEvento } from "@/lib/types"; // Importa el enum para TipoEvento

const moduloColors = [
  "#fca5a5", "#93c5fd", "#86efac", "#fde68a", "#a78bfa",
  "#fb923c", "#ec4899", "#10b981", "#3b82f6", "#4ade80"
];

export default function Leyenda() {
  const { curso } = useCursoAdminStore();
  const [leyenda, setLeyenda] = useState<any[]>([]);

  useEffect(() => {
    if (curso?.modulos) {
      const leyendaModulos = curso.modulos.map((mod, index) => {
        const color = moduloColors[index % moduloColors.length];
        return {
          nombre: mod.nombre,
          fechaInicio: mod.fechaInicio,
          fechaFin: mod.fechaFin,
          color,
          unidades: mod.unidades?.map((uf, idx) => ({
            nombre: uf.nombre,
            fechaInicio: uf.fechaInicio,
            fechaFin: uf.fechaFin,
            color, // ✅ mismo color que el módulo
            patternClass: `uf-pattern-${(idx + 1) % 6}`,
          })),
        };
      });
      setLeyenda(leyendaModulos);
    }
  }, [curso]);

  return (
    <div className="space-y-4">
      <div className="text-lg font-semibold text-gray-700">
        Leyenda de Módulos y Unidades Formativas
      </div>

      <div className="grid grid-cols-2 gap-4">
        {leyenda.map((mod, index) => (
          <div key={index} className="bg-gray-100 p-4 rounded-md shadow-md">
            <div className="font-semibold text-sm mb-2">
              <div
                className="w-4 h-4 inline-block rounded-sm"
                style={{ backgroundColor: mod.color }}
              />
              <span className="ml-2">
                Módulo: {mod.nombre} ({mod.fechaInicio} – {mod.fechaFin})
              </span>
            </div>

            {mod.unidades && mod.unidades.length > 0 && (
              <div className="space-y-2 ml-4">
                <div className="font-medium text-gray-800">Unidades Formativas:</div>
                {mod.unidades.map((uf: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-sm border border-black relative overflow-hidden"
                      style={{ backgroundColor: uf.color }}
                    >
                      <div
                        className={`${uf.patternClass}`}
                        style={{
                          position: "absolute",
                          inset: 0,
                          opacity: 0.5,
                          pointerEvents: "none",
                        }}
                      />
                    </div>

                    <span
                      className="inline-block px-2 py-1 rounded-md border border-black font-semibold text-sm"
                      style={{
                        border: `2px solid ${uf.color}`,
                      }}
                    >
                      📚 {uf.nombre} ({uf.fechaInicio} – {uf.fechaFin})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Aquí mostramos los eventos del curso */}
      {curso?.eventos?.some(() => true) && (
        <div className="mt-6">
          <div className="text-lg font-semibold text-gray-700">Eventos del curso</div>
          <ul className="mt-2 space-y-1 text-sm">
            {curso.eventos.map((ev, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span>
                  {ev.tipo === TipoEvento.ENTREGA && "📬"}
                  {ev.tipo === TipoEvento.EVALUACION && "📝"}
                  {ev.tipo === TipoEvento.OTRO && "🎤"} {/* Ajusta según los tipos que quieras mostrar */}
                </span>
                <span>
                  {ev.titulo} – {ev.fecha}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Mensaje si no hay módulos */}
      {curso?.modulos && curso?.modulos.length === 0 && (
        <div className="text-sm text-gray-500">No hay módulos cargados.</div>
      )}
    </div>
  );
}
