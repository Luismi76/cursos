"use client";

import { useEffect, useRef, useState } from "react";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import "./GanttContextMenu.css";
import { EventoCursoDTO } from "@/lib/types";

export interface TareaGantt {
  id: string | number;
  text: string;
  start_date: string;
  duration: number;
  parent?: string | number;
  type?: string;
  open?: boolean;
  tooltip?: string;
}

interface Props {
  tareas: TareaGantt[];
  eventos?: TareaGantt[];
  onTaskDblClick?: (taskId: string) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskEdit?: (taskId: string) => void;
  onCrearUnidad?: (moduloId: string) => void;
  onUpdateUnidad?: (unidad: {
    id: string;
    nombre: string;
    fechaInicio: string;
    fechaFin: string;
  }) => void;
  onUpdateModulo?: (modulo: {
    id: string;
    nombre: string;
    fechaInicio: string;
    fechaFin: string;
  }) => void;
}

export default function GanttDHTMLX({
  tareas,
  eventos = [],
  onTaskDblClick,
  onTaskDelete,
  onTaskEdit,
  onCrearUnidad,
  onUpdateUnidad,
  onUpdateModulo,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    taskId: null as string | null,
  });

  const esSoloLectura =
    !onTaskDelete &&
    !onTaskEdit &&
    !onCrearUnidad &&
    !onUpdateUnidad &&
    !onUpdateModulo;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const gantt = require("dhtmlx-gantt").default;
    if (!gantt) return;

    // Configuración general
    gantt.config.readonly = esSoloLectura;
    gantt.config.autosize = "y";
    gantt.config.show_grid = false;
    gantt.config.scales = [
      { unit: "month", step: 1, format: "%F %Y" },
      { unit: "day", step: 1, format: "%d" },
    ];
    gantt.config.min_column_width = 15;
    gantt.config.scale_height = 30;

    // Tooltips incluso para milestones
    gantt.config.tooltip_timeout = 10;
    gantt.config.tooltip_hide_timeout = 500;

    gantt.templates.scale_cell_class = (date: Date) =>
      date.getDay() === 0 || date.getDay() === 6
        ? "weekend scale-bold"
        : "scale-bold";

    gantt.templates.timeline_cell_class = (_task: unknown, date: Date) =>
      date.getDay() === 0 || date.getDay() === 6 ? "weekend" : "";

    gantt.templates.task_class = function (
      _start: Date,
      _end: Date,
      task: TareaGantt
    ): string {
      if (String(task.id).startsWith("evento-")) return "evento-gantt";
      if (task.type === "project") return "modulo-gantt";
      if (task.type === "task") return "unidad-gantt";
      return "";
    };

    gantt.templates.tooltip_text = (
      _start: Date,
      _end: Date,
      task: TareaGantt
    ) => task.tooltip || task.text;

    gantt.templates.task_text = function (
      start: Date,
      end: Date,
      task: TareaGantt
    ) {
      return `<div title="${task.tooltip || task.text}">${task.text}</div>`;
    };

    const tareasConEventos: TareaGantt[] = [...tareas, ...eventos];
    gantt.config.xml_date = "%Y-%m-%d";

    if (containerRef.current) {
      setTimeout(() => {
        gantt.plugins({ tooltip: true });
        gantt.config.tooltip_html = true;
        gantt.init(containerRef.current!);
        gantt.clearAll();
        gantt.parse({ data: tareasConEventos });
      }, 0);
    }

    gantt.attachEvent("onTaskDblClick", (id: string) => {
      onTaskDblClick?.(id);
      return false;
    });

    gantt.attachEvent(
      "onContextMenu",
      (taskId: string, _linkId: any, event: MouseEvent) => {
        if (esSoloLectura) return false;
        event.preventDefault();
        if (!taskId) return true;
        setMenu({ visible: true, x: event.clientX, y: event.clientY, taskId });
        return false;
      }
    );

    gantt.attachEvent("onAfterTaskUpdate", (id: string, task: any) => {
      if (esSoloLectura) return false;
      const formatearFecha = (date: Date) => date.toISOString().slice(0, 10);
      const fechaInicio = formatearFecha(task.start_date);
      const fechaFin = formatearFecha(gantt.calculateEndDate(task));
      const actualizado = {
        id: String(id),
        nombre: task.text,
        fechaInicio,
        fechaFin,
      };

      if (task.type === "task") {
        onUpdateUnidad?.(actualizado);
      } else if (task.type === "project") {
        onUpdateModulo?.(actualizado);
      }

      return true;
    });

    return () => {
      gantt.clearAll?.();
      gantt.detachAllEvents?.();
    };
  }, [tareas, eventos]);

  useEffect(() => {
    const close = () => setMenu((m) => ({ ...m, visible: false }));
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  return (
    <div className="relative w-full overflow-x-auto pb-4">
      <div
        ref={containerRef}
        className="w-[1000px] min-w-full sm:min-w-[1000px] min-h-[400px]"
      />

      {!esSoloLectura && menu.visible && menu.taskId && (
        <div
          className="gantt-context-menu"
          style={{ top: menu.y, left: menu.x }}
        >
          <button
            onClick={() => {
              onTaskEdit?.(menu.taskId!);
              setMenu({ ...menu, visible: false });
            }}
          >
            📝 Editar
          </button>
          <button
            onClick={() => {
              onCrearUnidad?.(menu.taskId!);
              setMenu({ ...menu, visible: false });
            }}
          >
            ➕ Crear unidad
          </button>
          <button
            onClick={() => {
              onTaskDelete?.(menu.taskId!);
              setMenu({ ...menu, visible: false });
            }}
          >
            🗑 Eliminar
          </button>
        </div>
      )}
    </div>
  );
}
