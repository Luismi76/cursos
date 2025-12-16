"use client";

import { useEffect, useState } from "react";
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
import { Gantt, Task, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { v4 as uuidv4 } from "uuid";
import { Plus } from "lucide-react";

interface Props {
  cursoId: string;
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
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [modoCreacion, setModoCreacion] = useState(false);
  const [formValues, setFormValues] = useState({
    nombre: "",
    fechaInicio: "",
    fechaFin: "",
  });

  useEffect(() => {
    fetchCurso(cursoId);
  }, [cursoId]);

  const handleEditClick = (task: Task) => {
    setModoCreacion(false);
    setEditingTask(task);
    setFormValues({
      nombre: task.name,
      fechaInicio: task.start.toISOString().split("T")[0],
      fechaFin: task.end.toISOString().split("T")[0],
    });
    setOpenDialog(true);
  };

  const handleSaveEdit = async () => {
    const { nombre, fechaInicio, fechaFin } = formValues;
    try {
      if (modoCreacion) {
        await addModulo(cursoId, { nombre, fechaInicio, fechaFin });
        toast.success("Módulo creado");
      } else if (editingTask?.type === "project") {
        await updateModulo({
          id: editingTask.id,
          nombre,
          fechaInicio,
          fechaFin,
        });
        toast.success("Módulo actualizado");
      } else if (editingTask) {
        await updateUnidad({
          id: editingTask.id,
          nombre,
          fechaInicio,
          fechaFin,
          moduloId: editingTask.project!,
        });
        toast.success("Unidad actualizada");
      }
      setOpenDialog(false);
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
    setEditingTask(null);
    const hoy = new Date().toISOString().split("T")[0];
    setFormValues({ nombre: "", fechaInicio: hoy, fechaFin: hoy });
    setOpenDialog(true);
  };

  const handleCrearUnidad = async () => {
    if (!editingTask || editingTask.type !== "project") return;
    const nombre = prompt("Nombre de la unidad formativa:");
    if (!nombre) return;
    const hoy = new Date().toISOString().split("T")[0];
    try {
      await addUnidad(editingTask.id, {
        nombre,
        fechaInicio: hoy,
        fechaFin: hoy,
      });
      toast.success("Unidad creada");
      fetchCurso(cursoId);
    } catch {
      toast.error("Error al crear unidad");
    }
  };

  const isValidDate = (d: any): d is Date => d instanceof Date && !isNaN(d.getTime());

  const tasks: Task[] = [];

  for (const mod of curso?.modulos || []) {
    if (!mod.fechaInicio || !mod.fechaFin || !mod.nombre) continue;

    const modStart = new Date(mod.fechaInicio);
    const modEnd = new Date(mod.fechaFin);

    if (!isValidDate(modStart) || !isValidDate(modEnd)) continue;

    const modId = mod.id ?? uuidv4();

    tasks.push({
      id: modId,
      name: mod.nombre,
      type: "project",
      start: modStart,
      end: modEnd,
      progress: 0,
      isDisabled: true,
    });

    for (const uf of mod.unidades ?? []) {
      if (!uf.fechaInicio || !uf.fechaFin || !uf.nombre) continue;

      const ufStart = new Date(uf.fechaInicio);
      const ufEnd = new Date(uf.fechaFin);

      if (!isValidDate(ufStart) || !isValidDate(ufEnd)) continue;

      tasks.push({
        id: uf.id ?? uuidv4(),
        name: uf.nombre,
        type: "task",
        start: ufStart,
        end: ufEnd,
        progress: 0,
        project: modId,
      });
    }
  }

  return (
    <div className="relative space-y-4">
      <h2 className="text-2xl font-bold">Secuenciación del curso</h2>

      <Card className="p-2 overflow-x-auto">
        <div className="min-h-[400px]">
          {tasks.length > 0 ? (
            <Gantt
              tasks={tasks}
              viewMode={ViewMode.Day}
              columnWidth={50}
              listCellWidth=""
              onDoubleClick={handleEditClick}
              onDateChange={() => {}}
              onDelete={(task) => handleDeleteTask(task.id)}
            />
          ) : (
            <p className="text-center text-sm text-muted-foreground">No hay tareas válidas para mostrar.</p>
          )}
        </div>
      </Card>

      <Button
        onClick={handleAbrirModalCrearModulo}
        className="fixed bottom-6 right-6 rounded-full shadow-lg"
      >
        <Plus className="mr-2" /> Módulo
      </Button>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modoCreacion
                ? "Crear nuevo módulo"
                : editingTask?.type === "project"
                ? "Editar módulo"
                : "Editar unidad"}
            </DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Nombre"
            value={formValues.nombre}
            onChange={(e) => setFormValues((v) => ({ ...v, nombre: e.target.value }))}
          />
          <div className="flex gap-2">
            <Input
              type="date"
              value={formValues.fechaInicio}
              onChange={(e) => setFormValues((v) => ({ ...v, fechaInicio: e.target.value }))}
            />
            <Input
              type="date"
              value={formValues.fechaFin}
              onChange={(e) => setFormValues((v) => ({ ...v, fechaFin: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSaveEdit}>Guardar</Button>
            {!modoCreacion && editingTask?.type === "project" && (
              <Button variant="outline" onClick={handleCrearUnidad}>
                + Unidad
              </Button>
            )}
            {!modoCreacion && (
              <Button
                variant="destructive"
                onClick={() => {
                  if (!editingTask) return;
                  handleDeleteTask(editingTask.id);
                  setOpenDialog(false);
                }}
              >
                Eliminar
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
