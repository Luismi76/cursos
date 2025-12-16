"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useAlumnosCurso } from "@/hooks/useAlumnosCurso";
import { usePracticasCurso } from "@/hooks/usePracticasCurso";
import { useCursoProfesor } from "@/hooks/useCursoProfesor"; // ✅ NUEVO
import {
  agregarAlumnoCurso,
  eliminarAlumnoCurso,
  getAlumnosDisponibles,
  crearPracticaCurso,
  editarPracticaCurso,
  eliminarPracticaCurso,
} from "@/services/profesorService";
import { Practica, Alumno } from "@/lib/types";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
  CommandGroup,
} from "@/components/ui/command";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Trash2, User } from "lucide-react";
import { toast } from "sonner";
import ListaPracticasCurso from "@/components/practicas/ListaPracticasCurso";
import FormularioCrearPractica from "@/components/practicas/FormularioCrearPractica";
import CalendarioCurso from "@/components/common/CalendarioCurso";
import { z } from "zod";

const schema = z.object({
  titulo: z.string(),
  descripcion: z.string(),
  fechaEntrega: z.date(),
});

type PracticaFormValues = z.infer<typeof schema>;

export default function CursoPage() {
  const params = useParams();
  const cursoId = typeof params.cursoId === "string" ? params.cursoId : "";

  const { curso } = useCursoProfesor(cursoId); // ✅ CURSO
  const { alumnos, refetch: refetchAlumnos } = useAlumnosCurso(cursoId);
  const { practicas, refetch: refetchPracticas } = usePracticasCurso(cursoId);

  const [alumnosDisponibles, setAlumnosDisponibles] = useState<Alumno[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [loadingForm, setLoadingForm] = useState(false);
  const [modoCreacion, setModoCreacion] = useState(false);

  const practicaEditando = practicas.find((p) => p.id === editandoId) || null;

  const cargarAlumnosDisponibles = async () => {
    const data = await getAlumnosDisponibles(cursoId);
    setAlumnosDisponibles(data);
  };

  const handleAgregarAlumno = async (id: string) => {
    await agregarAlumnoCurso(cursoId, id);
    toast.success("Alumno agregado");
    setPopoverOpen(false);
    refetchAlumnos();
  };

  const handleEliminarAlumno = async (id: string) => {
    if (!confirm("¿Eliminar alumno del curso?")) return;
    await eliminarAlumnoCurso(cursoId, id);
    toast.success("Alumno eliminado");
    refetchAlumnos();
  };

  const handleGuardarPractica = async (values: PracticaFormValues) => {
    setLoadingForm(true);
    try {
      if (editandoId) {
        await editarPracticaCurso(cursoId, editandoId, {
          ...values,
          fechaEntrega: values.fechaEntrega.toISOString(),
        });
        toast.success("Práctica actualizada");
      } else {
        await crearPracticaCurso(cursoId, {
          ...values,
          fechaEntrega: values.fechaEntrega.toISOString(),
        });
        toast.success("Práctica creada");
      }
      setEditandoId(null);
      setModoCreacion(false);
      await refetchPracticas();
    } catch (e) {
      toast.error("Error al guardar práctica");
    } finally {
      setLoadingForm(false);
    }
  };

  const handleEliminarPractica = async (id: string) => {
    if (!confirm("¿Eliminar esta práctica?")) return;
    await eliminarPracticaCurso(cursoId, id);
    toast.success("Práctica eliminada");
    refetchPracticas();
  };

  return (
    <div className="p-2 max-w-6xl mx-auto">
      <Tabs defaultValue="resumen" className="space-y-4">
        <TabsList className="mb-4">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="alumnos">Alumnos</TabsTrigger>
          <TabsTrigger value="practicas">Prácticas</TabsTrigger>
        </TabsList>

        {/* TAB: RESUMEN */}
        <TabsContent value="resumen">
          <h2 className="text-xl font-semibold mb-1">
            {curso?.nombre ? `📘 ${curso.nombre}` : "Secuenciación del curso"}
          </h2>
          {curso?.descripcion && (
            <p className="text-gray-600 mb-4">{curso.descripcion}</p>
          )}
          <CalendarioCurso
            cursoId={cursoId}
            modo="profesor"
            practicas={practicas.map((p) => ({
              id: p.id,
              titulo: p.titulo,
              fechaEntrega: p.fechaEntrega,
            }))}
          />
        </TabsContent>

        {/* TAB: ALUMNOS */}
        <TabsContent value="alumnos">
          <h2 className="text-xl font-semibold mb-2">Alumnos</h2>

          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button onClick={cargarAlumnosDisponibles}>Añadir alumno</Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder="Buscar alumno..." />
                <CommandList>
                  <CommandEmpty>No encontrado</CommandEmpty>
                  <CommandGroup>
                    {alumnosDisponibles.map((alumno) => (
                      <CommandItem
                        key={alumno.id}
                        onSelect={() => handleAgregarAlumno(alumno.email)}
                      >
                        {alumno.nombre} ({alumno.email})
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {alumnos.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between border px-4 py-2 rounded shadow-sm bg-white"
              >
                <div className="flex items-center gap-3">
                  {a.avatarUrl ? (
                    <img
                      src={a.avatarUrl}
                      alt={a.nombre}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                  <div className="text-sm">
                    <div className="font-medium">{a.nombre}</div>
                    <div className="text-gray-500">{a.email}</div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEliminarAlumno(a.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* TAB: PRÁCTICAS */}
        <TabsContent value="practicas">
          <h2 className="text-xl font-semibold mb-2">Prácticas</h2>
          <Button onClick={() => setModoCreacion(!modoCreacion)}>
            {modoCreacion ? "Cancelar" : "Nueva práctica"}
          </Button>

          {(modoCreacion || editandoId !== null) && (
            <FormularioCrearPractica
              onSubmit={handleGuardarPractica}
              initialValues={
                practicaEditando
                  ? {
                      titulo: practicaEditando.titulo,
                      descripcion: JSON.parse(practicaEditando.descripcion),
                      fechaEntrega: new Date(practicaEditando.fechaEntrega),
                    }
                  : undefined
              }
            />
          )}
          <ListaPracticasCurso
            practicas={practicas}
            rol="profesor"
            cursoId={cursoId}
            onEditar={(id) => setEditandoId(id)}
            onEliminar={(id) => handleEliminarPractica(id)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
