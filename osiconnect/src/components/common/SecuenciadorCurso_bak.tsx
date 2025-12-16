"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCursoAdminStore } from "@/hooks/useSecuenciacionStore";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import type { TareaGantt } from "@/components/common/GanttDHTMLX";
import { TipoEvento, VisibilidadEvento, EventoCursoDTO } from "@/lib/types";
import { crearEventoAdmin as crearEvento } from "@/services/adminService";

const GanttDHTMLX = dynamic(() => import("@/components/common/GanttDHTMLX"), {
  ssr: false,
});

interface Props {
  cursoId: string;
}

function parseFecha(fecha: string): string {
  return fecha.slice(0, 10);
}

function calcularDuracion(fechaInicio: string, fechaFin: string): number {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const diffMs = fin.getTime() - inicio.getTime();
  const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDias || 1;
}

export default function SecuenciacionCurso({ cursoId }: Props) {
  const {
    curso,
    fetchCurso,
    addModulo,
    addUnidad,
    updateUnidad,
    updateModulo,
    eliminarModulo,
    eliminarUnidad,
  } = useCursoAdminStore();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modoCreacion, setModoCreacion] = useState(false);
  const [formValues, setFormValues] = useState({ nombre: "", fechaInicio: "", fechaFin: "" });
  const [moduloIdCreacionUnidad, setModuloIdCreacionUnidad] = useState<string | null>(null);

  const [openCrearEvento, setOpenCrearEvento] = useState(false);
  const [formEvento, setFormEvento] = useState<EventoCursoDTO>({
    titulo: "",
    descripcion: "",
    tipo: TipoEvento.EVALUACION,
    visiblePara: VisibilidadEvento.ALUMNO,
    fecha: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchCurso(cursoId);
  }, [cursoId]);

  const modulosYUnidades: TareaGantt[] = curso?.modulos.flatMap((mod) => {
    if (!mod.id || !mod.nombre || !mod.fechaInicio || !mod.fechaFin) return [];
    const modTarea: TareaGantt = {
      id: mod.id,
      text: mod.nombre,
      start_date: parseFecha(mod.fechaInicio),
      duration: calcularDuracion(mod.fechaInicio, mod.fechaFin),
      type: "project",
      open: true,
      parent: "0",
    };
    const unidades: TareaGantt[] = (mod.unidades ?? []).filter(
      (uf): uf is { id: string; nombre: string; fechaInicio: string; fechaFin: string } =>
        !!uf.id && !!uf.nombre && !!uf.fechaInicio && !!uf.fechaFin
    ).map((uf) => ({
      id: uf.id,
      text: uf.nombre,
      start_date: parseFecha(uf.fechaInicio),
      duration: calcularDuracion(uf.fechaInicio, uf.fechaFin),
      parent: mod.id,
      type: "task",
    }));
    return [modTarea, ...unidades];
  }) ?? [];

  const tareas: TareaGantt[] = modulosYUnidades;
  const eventosCurso: TareaGantt[] = (curso?.eventos ?? []).map((evento) => {
  const icono =
    evento.tipo === "EVALUACION" ? "📝" :
    evento.tipo === "ENTREGA" ? "📬" :
    evento.tipo === "OTRO" ? "🎤" :
    "📌";

  return {
    id: `evento-${evento.titulo}-${evento.fecha}`,
    text: `${icono} ${evento.titulo}`,
    start_date: evento.fecha,
    duration: 1,
    type: "milestone",
    parent: "0",
    tooltip: `<b>${evento.titulo}</b><br/>${evento.descripcion}<br/><i>Visible para: ${evento.visiblePara}</i>`,
  };
});


  const handleGuardarEvento = async () => {
    try {
      await crearEvento(cursoId, formEvento);
      toast.success("Evento creado");
      setOpenCrearEvento(false);
      fetchCurso(cursoId);
    } catch {
      toast.error("Error al crear el evento");
    }
  };

  const handleEditClick = (id: string) => {
    const modulo = curso?.modulos.find((m) => m.id === id);
    const unidad = curso?.modulos.flatMap((m) => m.unidades ?? []).find((u) => u.id === id);
    const item = modulo ?? unidad;
    if (!item) return;
    setModoCreacion(false);
    setModuloIdCreacionUnidad(null);
    setEditingId(id);
    setFormValues({ nombre: item.nombre, fechaInicio: item.fechaInicio ?? "", fechaFin: item.fechaFin ?? "" });
    setOpenDialog(true);
  };

  const handleSaveEdit = async () => {
    const { nombre, fechaInicio, fechaFin } = formValues;
    try {
      if (modoCreacion) {
        if (moduloIdCreacionUnidad) {
          await addUnidad(moduloIdCreacionUnidad, { nombre, fechaInicio, fechaFin });
          toast.success("Unidad creada");
        } else {
          await addModulo(cursoId, { nombre, fechaInicio, fechaFin });
          toast.success("Módulo creado");
        }
      } else if (editingId) {
        const esModulo = curso?.modulos.some((m) => m.id === editingId);
        if (esModulo) {
          await updateModulo({ id: editingId, nombre, fechaInicio, fechaFin });
          toast.success("Módulo actualizado");
        } else {
          const moduloId = curso?.modulos.find((m) => m.unidades?.some((u) => u.id === editingId))?.id;
          if (moduloId) {
            await updateUnidad({ id: editingId, nombre, fechaInicio, fechaFin, moduloId });
            toast.success("Unidad actualizada");
          }
        }
      }
      setOpenDialog(false);
      setModuloIdCreacionUnidad(null);
      fetchCurso(cursoId);
    } catch {
      toast.error("Error al guardar los cambios");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const modulo = curso?.modulos.find((m) => m.id === taskId);
    if (modulo) {
      if (confirm("¿Eliminar este módulo y todas sus unidades?")) {
        await eliminarModulo(taskId);
        toast.success("Módulo eliminado");
        fetchCurso(cursoId);
      }
      return;
    }
    for (const m of curso?.modulos || []) {
      const uf = m.unidades?.find((u) => u.id === taskId);
      if (uf) {
        if (confirm("¿Eliminar esta unidad formativa?")) {
          await eliminarUnidad(taskId);
          toast.success("Unidad eliminada");
          fetchCurso(cursoId);
        }
        return;
      }
    }
  };

  const handleAbrirModalCrearModulo = () => {
    setModoCreacion(true);
    setEditingId(null);
    setModuloIdCreacionUnidad(null);
    const hoy = new Date().toISOString().split("T")[0];
    setFormValues({ nombre: "", fechaInicio: hoy, fechaFin: hoy });
    setOpenDialog(true);
  };

  const handleCrearUnidad = (moduloId: string) => {
    setModoCreacion(true);
    setEditingId(null);
    setModuloIdCreacionUnidad(moduloId);
    const hoy = new Date().toISOString().split("T")[0];
    setFormValues({ nombre: "", fechaInicio: hoy, fechaFin: hoy });
    setOpenDialog(true);
  };

  return (
    <div className="relative space-y-4">
      <h2 className="text-2xl font-bold">Secuenciación del curso</h2>
      <Card className="p-2 overflow-x-auto">
        <div className="min-h-[400px]">
          {tareas.length > 0 ? (
            <GanttDHTMLX
  tareas={tareas}
  eventos={[...eventosCurso]}
  onTaskEdit={handleEditClick}
  onTaskDelete={handleDeleteTask}
  onCrearUnidad={handleCrearUnidad}
  onUpdateUnidad={(unidad) => {
    const moduloId = curso?.modulos.find((m) =>
      m.unidades?.some((u) => u.id === unidad.id)
    )?.id;
    if (!moduloId) return;
    updateUnidad({ ...unidad, moduloId });
    toast.success("Unidad actualizada");
  }}
  onUpdateModulo={(modulo) => {
    updateModulo(modulo);
    toast.success("Módulo actualizado");
  }}
/>

          ) : (
            <p className="text-center text-sm text-muted-foreground">No hay tareas válidas para mostrar.</p>
          )}
        </div>
      </Card>
      <Button onClick={handleAbrirModalCrearModulo} className="fixed bottom-6 right-6 rounded-full shadow-lg">
        <Plus className="mr-2" /> Módulo
      </Button>
      <Button onClick={() => setOpenCrearEvento(true)} className="fixed bottom-6 right-36 rounded-full shadow-lg">
        <Plus className="mr-2" /> Evento
      </Button>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modoCreacion ? (moduloIdCreacionUnidad ? "Crear unidad formativa" : "Crear nuevo módulo") : curso?.modulos.some((m) => m.id === editingId) ? "Editar módulo" : "Editar unidad"}</DialogTitle>
          </DialogHeader>
          <Input placeholder="Nombre" value={formValues.nombre} onChange={(e) => setFormValues((v) => ({ ...v, nombre: e.target.value }))} />
          <div className="flex gap-2">
            <Input type="date" value={formValues.fechaInicio} onChange={(e) => setFormValues((v) => ({ ...v, fechaInicio: e.target.value }))} />
            <Input type="date" value={formValues.fechaFin} onChange={(e) => setFormValues((v) => ({ ...v, fechaFin: e.target.value }))} />
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSaveEdit}>Guardar</Button>
            {!modoCreacion && curso?.modulos.some((m) => m.id === editingId) && (
              <Button variant="outline" onClick={() => handleCrearUnidad(editingId!)}>+ Unidad</Button>
            )}
            {!modoCreacion && (
              <Button variant="destructive" onClick={() => { if (!editingId) return; handleDeleteTask(editingId); setOpenDialog(false); }}>
                Eliminar
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={openCrearEvento} onOpenChange={setOpenCrearEvento}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear evento</DialogTitle>
          </DialogHeader>
          <Input placeholder="Título" value={formEvento.titulo} onChange={(e) => setFormEvento((v) => ({ ...v, titulo: e.target.value }))} />
          <Input placeholder="Descripción" value={formEvento.descripcion} onChange={(e) => setFormEvento((v) => ({ ...v, descripcion: e.target.value }))} />
          <div className="flex gap-2">
            <select className="border rounded px-2 py-1" value={formEvento.tipo} onChange={(e) => setFormEvento((v) => ({ ...v, tipo: e.target.value as TipoEvento }))}>
              {Object.values(TipoEvento).map((tipo) => (<option key={tipo} value={tipo}>{tipo}</option>))}
            </select>
            <select className="border rounded px-2 py-1" value={formEvento.visiblePara} onChange={(e) => setFormEvento((v) => ({ ...v, visiblePara: e.target.value as VisibilidadEvento }))}>
              {Object.values(VisibilidadEvento).map((v) => (<option key={v} value={v}>{v}</option>))}
            </select>
            <Input type="date" value={formEvento.fecha} onChange={(e) => setFormEvento((v) => ({ ...v, fecha: e.target.value }))} />
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={handleGuardarEvento}>Guardar</Button>
            <Button variant="outline" onClick={() => setOpenCrearEvento(false)}>Cancelar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
