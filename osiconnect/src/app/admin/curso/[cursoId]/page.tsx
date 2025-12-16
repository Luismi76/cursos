"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CursoDTO, ModuloDTO, Usuario, Alumno } from "@/lib/types";
import {
  asignarProfesor,
  matricularAlumno,
  agregarModulo,
  getCursoById,
  getProfesores,
  getAlumnosDisponiblesAdmin,
  actualizarNombreCurso,
  actualizarDescripcionCurso,
} from "@/services/adminService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
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
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import CalendarioCurso from "@/components/common/CalendarioCurso";
import { User, Edit, Save, X } from "lucide-react";
import AvatarAmpliable from "@/components/common/AvatarAmpliable";

export default function AdminCursoPage() {
  const { cursoId } = useParams();
  const [curso, setCurso] = useState<CursoDTO | null>(null);
  const [profesores, setProfesores] = useState<Usuario[]>([]);
  const [alumnosDisponibles, setAlumnosDisponibles] = useState<Alumno[]>([]);
  const [cambiandoProfesor, setCambiandoProfesor] = useState(false);
  const [alumnosPopoverOpen, setAlumnosPopoverOpen] = useState(false);

  const [profesorId, setProfesorId] = useState("");
  const [modulo, setModulo] = useState<ModuloDTO>({
    nombre: "",
    fechaInicio: "",
    fechaFin: "",
  });

  const [nombreCurso, setNombreCurso] = useState("");
  const [editandoNombre, setEditandoNombre] = useState(false);
  const [descripcionCurso, setDescripcionCurso] = useState("");
  const [editandoDescripcion, setEditandoDescripcion] = useState(false);

  useEffect(() => {
    if (typeof cursoId === "string") {
      getCursoById(cursoId)
        .then((data) => {
          setCurso(data);
          setNombreCurso(data.nombre);
          setDescripcionCurso(data.descripcion);
        })
        .catch(() => toast.error("Error al cargar el curso"));
      getProfesores()
        .then(setProfesores)
        .catch(() => toast.error("Error al cargar los profesores"));
    }
  }, [cursoId]);

  const cargarAlumnosDisponibles = async () => {
    try {
      const data = await getAlumnosDisponiblesAdmin(cursoId as string);
      setAlumnosDisponibles(data);
    } catch {
      toast.error("Error al cargar alumnos disponibles");
    }
  };

  const handleAsignarProfesor = async () => {
    try {
      await asignarProfesor(cursoId as string, profesorId);
      toast.success("Profesor asignado");
      setCambiandoProfesor(false);
      const actualizado = await getCursoById(cursoId as string);
      setCurso(actualizado);
    } catch {
      toast.error("Error al asignar profesor");
    }
  };

  const handleMatricularAlumno = async (alumnoId: string) => {
    try {
      await matricularAlumno(cursoId as string, alumnoId);
      toast.success("Alumno matriculado");
      setAlumnosPopoverOpen(false);
      await cargarAlumnosDisponibles();
      const actualizado = await getCursoById(cursoId as string);
      setCurso(actualizado);
    } catch {
      toast.error("Error al matricular alumno");
    }
  };

  if (!curso) return <p className="mt-6 text-center">Cargando curso...</p>;

  return (
    <div className="max-w-5xl mx-auto py-10">
      <div className="mb-4 flex items-center gap-2">
        {editandoNombre ? (
          <>
            <Input
              value={nombreCurso}
              onChange={(e) => setNombreCurso(e.target.value)}
              className="text-2xl font-bold"
            />
            {nombreCurso !== curso.nombre && (
              <Button
                size="sm"
                onClick={async () => {
                  try {
                    await actualizarNombreCurso(cursoId as string, nombreCurso);
                    const actualizado = await getCursoById(cursoId as string);
                    setCurso(actualizado);
                    setEditandoNombre(false);
                    toast.success("Nombre del curso actualizado");
                  } catch {
                    toast.error("Error al actualizar el nombre");
                  }
                }}
              >
                <Save className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setNombreCurso(curso.nombre);
                setEditandoNombre(false);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-foreground">
              {curso.nombre}
            </h1>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditandoNombre(true)}
            >
              <Edit className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      <div className="mb-8">
        {editandoDescripcion ? (
          <div className="space-y-2">
            <Input
              value={descripcionCurso}
              onChange={(e) => setDescripcionCurso(e.target.value)}
            />
            <div className="flex gap-2">
              {descripcionCurso !== curso.descripcion && (
                <Button
                  size="sm"
                  onClick={async () => {
                    try {
                      await actualizarDescripcionCurso(
                        cursoId as string,
                        descripcionCurso
                      );
                      const actualizado = await getCursoById(cursoId as string);
                      setCurso(actualizado);
                      setEditandoDescripcion(false);
                      toast.success("Descripción actualizada");
                    } catch {
                      toast.error("Error al actualizar la descripción");
                    }
                  }}
                >
                  <Save className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDescripcionCurso(curso.descripcion);
                  setEditandoDescripcion(false);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <p className="text-muted-foreground">{curso.descripcion}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditandoDescripcion(true)}
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="resumen" className="space-y-4">
        <TabsList className="mb-6">
          <TabsTrigger value="resumen">📘 Resumen</TabsTrigger>
          <TabsTrigger value="alumnos">🎓 Alumnos</TabsTrigger>
          <TabsTrigger value="profesor">👨‍🏫 Profesor</TabsTrigger>
        </TabsList>
        <TabsContent value="resumen">
          <CalendarioCurso
            cursoId={cursoId as string}
            modo="admin"
            onCrearModulo={async () => {
              try {
                const fecha = new Date().toISOString().split("T")[0];
                await agregarModulo(cursoId as string, {
                  nombre: "Nuevo módulo",
                  fechaInicio: fecha,
                  fechaFin: fecha,
                });
                const actualizado = await getCursoById(cursoId as string);
                setCurso(actualizado);
                toast.success("Módulo creado");
              } catch {
                toast.error("Error al crear módulo");
              }
            }}
          />
        </TabsContent>

        <TabsContent value="alumnos">
          <Card className="p-6 space-y-6 bg-card text-foreground">
            <section>
              <h2 className="text-xl font-semibold mb-2">
                🎓 Matricular alumno
              </h2>
              <Popover
                open={alumnosPopoverOpen}
                onOpenChange={setAlumnosPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="secondary"
                    onClick={cargarAlumnosDisponibles}
                  >
                    Añadir alumno
                  </Button>
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
                            onSelect={() => handleMatricularAlumno(alumno.id)}
                          >
                            {alumno.nombre} ({alumno.email})
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {(curso.alumnos?.length ?? 0) > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {curso.alumnos!.map((alumno) => (
                    <Card
                      key={alumno.id}
                      className="p-4 flex items-center justify-between bg-muted/10"
                    >
                      <div className="flex items-center gap-4">
                        {alumno.avatarUrl ? (
                          <img
                            src={alumno.avatarUrl}
                            alt={alumno.nombre}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{alumno.nombre}</p>
                          <p className="text-sm text-muted-foreground">
                            {alumno.email}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs rounded bg-primary/10 text-primary px-2 py-1">
                        Matriculado
                      </span>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </Card>
        </TabsContent>

        <TabsContent value="profesor">
          <Card className="p-6 space-y-6 bg-card text-foreground">
            <section>
              <h2 className="text-xl font-semibold mb-2">
                👨‍🏫 Profesor asignado
              </h2>
              {!cambiandoProfesor && curso.profesor ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <AvatarAmpliable
                      url={curso.profesor.avatarUrl}
                      alt={`Avatar de ${curso.profesor.nombre}`}
                      size={80}
                    />
                    <div>
                      <p className="text-sm text-muted-foreground">Nombre:</p>
                      <p className="font-medium">{curso.profesor.nombre}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setCambiandoProfesor(true)}
                  >
                    Cambiar profesor
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2 mt-2">
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={profesorId}
                    onChange={(e) => setProfesorId(e.target.value)}
                  >
                    <option value="">Selecciona un profesor</option>
                    {profesores.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} ({p.email})
                      </option>
                    ))}
                  </select>
                  <Button onClick={handleAsignarProfesor}>Asignar</Button>
                </div>
              )}
            </section>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
