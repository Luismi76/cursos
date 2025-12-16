"use client";

import { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import multiMonthPlugin from "@fullcalendar/multimonth";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  LayoutGrid,
  ChevronDown,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useCursoAdminStore } from "@/hooks/useSecuenciacionStore";
import type { EventInput } from "@fullcalendar/core";
import "@/components/common/CalendarioCurso.css";
import Leyenda from "@/components/common/Leyenda";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EditorModulo } from "@/components/common/EditorModulo";
import {
  actualizarModulo,
  eliminarModulo,
  actualizarUnidad,
  eliminarUnidad,
  agregarModulo as crearModulo,
} from "@/services/adminService";
import { toast } from "sonner";

interface Props {
  cursoId: string;
  modo?: "admin" | "profesor" | "alumno";
  practicas?: {
    id: string;
    titulo: string;
    fechaEntrega: string;
  }[];
  onCrearModulo?: () => void;
}

function esFinDeSemana(fechaISO: string): boolean {
  const dia = new Date(fechaISO).getDay();
  return dia === 0 || dia === 6;
}

function ajustarFechaLaboral(fechaISO: string, hacia: "inicio" | "fin"): string {
  const fecha = new Date(fechaISO);
  const dia = fecha.getDay();
  if (hacia === "inicio") {
    if (dia === 6) fecha.setDate(fecha.getDate() + 2);
    else if (dia === 0) fecha.setDate(fecha.getDate() + 1);
  } else {
    if (dia === 6) fecha.setDate(fecha.getDate() - 1);
    else if (dia === 0) fecha.setDate(fecha.getDate() - 2);
  }
  return fecha.toISOString().split("T")[0];
}

function generarClaseVisual(id: string | undefined, titulo: string): string {
  const base = id || titulo;
  const hash = [...base].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `uf-pattern-${hash % 6}`;
}

export default function CalendarioCurso({
  cursoId,
  modo = "admin",
  practicas,
}: Props) {
  const [vista, setVista] = useState<"multiMonth" | "dayGridMonth">("multiMonth");
  const [mostrarResumen, setMostrarResumen] = useState(false);
  const calendarRef = useRef<FullCalendar | null>(null);
  const { curso, fetchCurso } = useCursoAdminStore();

  const [moduloEnEdicion, setModuloEnEdicion] = useState<any | null>(null);
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [nuevoModulo, setNuevoModulo] = useState(false);
  const [domReady, setDomReady] = useState(false);

  useEffect(() => {
    fetchCurso(cursoId, modo);
  }, [cursoId, modo]);

  useEffect(() => {
    if (curso?.modulos && curso.modulos.length > 0) {
      const raf = requestAnimationFrame(() => setDomReady(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [curso]);

  useEffect(() => {
    if (curso?.modulos?.length && calendarRef.current) {
      const primeraFecha = curso.modulos.find((m) => m.fechaInicio)?.fechaInicio;
      if (primeraFecha) {
        calendarRef.current.getApi().gotoDate(primeraFecha);
      }
    }
  }, [curso]);

  const moduloColors = [
    "#f87171", "#60a5fa", "#34d399", "#fbbf24",
    "#a78bfa", "#fb923c", "#ec4899", "#10b981", "#3b82f6",
  ];

  const fechaInicialCurso =
    curso?.modulos?.find((m) => m.fechaInicio)?.fechaInicio ??
    new Date().toISOString().split("T")[0];

  const eventos: EventInput[] = [
    ...(curso?.modulos.flatMap((mod, index) => {
      const moduloColor = moduloColors[index % moduloColors.length];
      const items: EventInput[] = [];
      if (mod.fechaInicio && mod.fechaFin) {
        const actual = new Date(mod.fechaInicio);
        const fin = new Date(mod.fechaFin);
        while (actual <= fin) {
          const iso = actual.toISOString().split("T")[0];
          if (!esFinDeSemana(iso)) {
            items.push({ start: iso, end: iso, backgroundColor: moduloColor, display: "background" });
          }
          actual.setDate(actual.getDate() + 1);
        }
      }
      mod.unidades?.forEach((uf) => {
        if (uf.fechaInicio && uf.fechaFin) {
          const inicioAjustado = ajustarFechaLaboral(uf.fechaInicio, "inicio");
          const finAjustado = ajustarFechaLaboral(uf.fechaFin, "fin");
          let actual = new Date(inicioAjustado);
          const fin = new Date(finAjustado);
          while (actual <= fin) {
            const iso = actual.toISOString().split("T")[0];
            if (!esFinDeSemana(iso)) {
              items.push({
                id: `${uf.id}-${iso}`,
                title: "",
                start: iso,
                allDay: true,
                display: "background",
                classNames: [generarClaseVisual(uf.id, uf.nombre)],
                overlap: false,
              });
            }
            actual.setDate(actual.getDate() + 1);
          }
        }
      });
      return items;
    }) ?? []),
    ...(curso?.eventos
      ?.filter((e) => !esFinDeSemana(e.fecha))
      .map((evento) => ({
        title: `${
          evento.tipo === "EVALUACION"
            ? "📝"
            : evento.tipo === "ENTREGA"
            ? "📬"
            : "🎤"
        } ${evento.titulo}`,
        start: evento.fecha,
        allDay: true,
        color:
          evento.tipo === "EVALUACION"
            ? "#f59e0b"
            : evento.tipo === "ENTREGA"
            ? "#ef4444"
            : "#8b5cf6",
        textColor: "white",
      })) ?? []),
    ...(practicas
      ?.filter((p) => p.fechaEntrega && !esFinDeSemana(p.fechaEntrega))
      .map((p) => ({
        title: `📌 Entrega: ${p.titulo}`,
        start: p.fechaEntrega,
        allDay: true,
        color: "#7f1d1d",
        textColor: "white",
      })) ?? []),
  ];

  const fechasEventos = [
    ...(curso?.modulos.flatMap((m) => [m.fechaInicio, m.fechaFin].filter(Boolean)) ?? []),
    ...(curso?.modulos.flatMap(
      (m) => m.unidades?.flatMap((u) => [u.fechaInicio, u.fechaFin].filter(Boolean)) ?? []
    ) ?? []),
    ...(curso?.eventos?.map((e) => e.fecha) ?? []),
    ...(practicas?.map((p) => p.fechaEntrega) ?? []),
  ].map((f) => new Date(f!));

  const fechasValidas = fechasEventos.filter((d) => !isNaN(d.getTime()));
  const fechaMinima = fechasValidas.length
    ? new Date(Math.min(...fechasValidas.map((d) => d.getTime())))
    : new Date();
  const fechaMaxima = fechasValidas.length
    ? new Date(Math.max(...fechasValidas.map((d) => d.getTime())))
    : new Date();
  const visibleRange = {
    start: new Date(fechaMinima.getFullYear(), fechaMinima.getMonth(), 1),
    end: new Date(fechaMaxima.getFullYear(), fechaMaxima.getMonth() + 1, 1),
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" /> Calendario del curso
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setVista((v) => (v === "dayGridMonth" ? "multiMonth" : "dayGridMonth"))
          }
        >
          <LayoutGrid className="w-4 h-4 mr-1" />
          {vista === "dayGridMonth" ? "Vista anual" : "Vista mensual"}
        </Button>
      </div>

      <div className="space-y-2">
        <button
          className="flex items-center text-sm text-gray-700 hover:text-black transition"
          onClick={() => setMostrarResumen((prev) => !prev)}
        >
          {mostrarResumen ? (
            <ChevronDown className="w-4 h-4 mr-1" />
          ) : (
            <ChevronRight className="w-4 h-4 mr-1" />
          )}
          {mostrarResumen ? "Ocultar resumen del curso" : "Mostrar resumen del curso"}
        </button>
        {mostrarResumen && <Leyenda />}
      </div>

      <Card className="p-4">
       {domReady && curso?.modulos && curso.modulos.length > 0 && (
          <FullCalendar
            ref={calendarRef}
            plugins={[multiMonthPlugin, dayGridPlugin, interactionPlugin]}
            initialView={vista}
            initialDate={fechaInicialCurso}
            locale={esLocale}
            height="auto"
            scrollTimeReset={false}
            events={eventos}
            visibleRange={visibleRange}
            eventClick={(info) => {
              const fechaStr = info.event.startStr;
              const mod = curso?.modulos.find(
                (m) =>
                  m.fechaInicio &&
                  m.fechaFin &&
                  m.fechaInicio <= fechaStr &&
                  m.fechaFin >= fechaStr
              );
              if (mod) {
                setModuloEnEdicion(mod);
                setDialogAbierto(true);
              }
            }}
            views={{
              multiMonthYear: {
                type: "multiMonth",
                duration: { months: 3 },
                multiMonthMinWidth: 200,
              },
              dayGridMonth: { type: "dayGridMonth" },
            }}
            eventClassNames={(arg) =>
              arg.event.title?.startsWith("UF:")
                ? [generarClaseVisual(arg.event.id, arg.event.title ?? "UF")]
                : []
            }
          />
        )}
      </Card>

      <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl p-6">
          {moduloEnEdicion && (
            <EditorModulo
              modulo={moduloEnEdicion}
              onUpdateModulo={async (modificado) => {
                if (nuevoModulo) {
                  await crearModulo(cursoId, modificado);
                  toast.success("Módulo creado");
                } else {
                  await actualizarModulo(modificado);
                  toast.success("Módulo actualizado");
                }
                await fetchCurso(cursoId, modo);
                setDialogAbierto(false);
                setNuevoModulo(false);
              }}
              onDeleteModulo={async (id) => {
                await eliminarModulo(id);
                toast.success("Módulo eliminado");
                await fetchCurso(cursoId, modo);
                setDialogAbierto(false);
              }}
              onUpdateUnidad={async (unidad) => {
                await actualizarUnidad(unidad);
                toast.success("Unidad actualizada");
                await fetchCurso(cursoId, modo);
              }}
              onDeleteUnidad={async (id) => {
                await eliminarUnidad(id);
                toast.success("Unidad eliminada");
                await fetchCurso(cursoId, modo);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {modo === "admin" && (
        <Button
          className="fixed bottom-6 right-6 rounded-full shadow-xl z-50"
          size="icon"
          onClick={() => {
            setModuloEnEdicion({
              nombre: "",
              fechaInicio: "",
              fechaFin: "",
              unidades: [],
            });
            setDialogAbierto(true);
            setNuevoModulo(true);
          }}
        >
          <Plus className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
}
