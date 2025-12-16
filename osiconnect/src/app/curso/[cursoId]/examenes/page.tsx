"use client";

import { useParams } from "next/navigation";
import { useAuthStore } from "@/hooks/authStore";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    FileText,
    Plus,
    Calendar,
    Clock,
    Award,
    Pencil,
    Trash2,
    Users,
    ChevronRight,
} from "lucide-react";
import {
    ExamenDTO,
    NotaExamenDTO,
    TipoExamen,
    CrearExamenDTO,
    RegistrarNotaDTO,
    getExamenesCurso,
    getMisNotasExamenes,
    getMiPromedioExamenes,
    crearExamen,
    actualizarExamen,
    eliminarExamen,
    getNotasExamen,
    registrarNotasMultiples,
} from "@/services/examenService";
import { getCursoById } from "@/services/cursoService";
import { AlumnoDTO, CursoDTO } from "@/lib/types";

export default function ExamenesPage() {
    const params = useParams();
    const cursoId = params.cursoId as string;
    const usuario = useAuthStore((state) => state.usuario);
    const esProfesor = usuario?.rol === "PROFESOR" || usuario?.rol === "ADMINISTRADOR";

    const [loading, setLoading] = useState(true);
    const [examenes, setExamenes] = useState<ExamenDTO[]>([]);
    const [curso, setCurso] = useState<CursoDTO | null>(null);

    // Estado para alumno
    const [misNotas, setMisNotas] = useState<NotaExamenDTO[]>([]);
    const [miPromedio, setMiPromedio] = useState<number>(0);

    // Estado para modales
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isNotasModalOpen, setIsNotasModalOpen] = useState(false);
    const [selectedExamen, setSelectedExamen] = useState<ExamenDTO | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form data
    const [formData, setFormData] = useState<CrearExamenDTO>({
        titulo: "",
        descripcion: "",
        fecha: "",
        tipo: "PARCIAL",
        puntuacionMaxima: 10,
    });

    // Notas data
    const [notasExamen, setNotasExamen] = useState<NotaExamenDTO[]>([]);
    const [notasForm, setNotasForm] = useState<Map<string, RegistrarNotaDTO>>(new Map());

    useEffect(() => {
        cargarDatos();
    }, [cursoId, esProfesor]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            if (esProfesor) {
                const [examenesData, cursoData] = await Promise.all([
                    getExamenesCurso(cursoId),
                    getCursoById(cursoId),
                ]);
                setExamenes(examenesData);
                setCurso(cursoData);
            } else {
                const [examenesData, notasData, promedioData] = await Promise.all([
                    getExamenesCurso(cursoId),
                    getMisNotasExamenes(cursoId),
                    getMiPromedioExamenes(cursoId),
                ]);
                setExamenes(examenesData);
                setMisNotas(notasData);
                setMiPromedio(promedioData);
            }
        } catch (error) {
            toast.error("Error al cargar exámenes");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!formData.titulo || !formData.fecha) {
            toast.error("Título y fecha son obligatorios");
            return;
        }

        try {
            setSubmitting(true);
            await crearExamen(cursoId, formData);
            toast.success("Examen creado correctamente");
            setIsCreateModalOpen(false);
            resetForm();
            cargarDatos();
        } catch (error) {
            toast.error("Error al crear examen");
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = async () => {
        if (!selectedExamen || !formData.titulo || !formData.fecha) {
            toast.error("Título y fecha son obligatorios");
            return;
        }

        try {
            setSubmitting(true);
            await actualizarExamen(cursoId, selectedExamen.id, formData);
            toast.success("Examen actualizado correctamente");
            setIsEditModalOpen(false);
            setSelectedExamen(null);
            resetForm();
            cargarDatos();
        } catch (error) {
            toast.error("Error al actualizar examen");
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedExamen) return;

        try {
            setSubmitting(true);
            await eliminarExamen(cursoId, selectedExamen.id);
            toast.success("Examen eliminado correctamente");
            setIsDeleteModalOpen(false);
            setSelectedExamen(null);
            cargarDatos();
        } catch (error) {
            toast.error("Error al eliminar examen");
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const openNotasModal = async (examen: ExamenDTO) => {
        setSelectedExamen(examen);
        try {
            const notas = await getNotasExamen(cursoId, examen.id);
            setNotasExamen(notas);

            // Inicializar formulario de notas con datos existentes
            const formMap = new Map<string, RegistrarNotaDTO>();
            if (curso?.alumnos) {
                curso.alumnos.forEach((alumno: AlumnoDTO) => {
                    const notaExistente = notas.find((n) => n.alumnoId === alumno.id);
                    formMap.set(alumno.id, {
                        alumnoId: alumno.id,
                        nota: notaExistente?.nota ?? null,
                        observaciones: notaExistente?.observaciones || "",
                    });
                });
            }
            setNotasForm(formMap);
            setIsNotasModalOpen(true);
        } catch (error) {
            toast.error("Error al cargar notas");
            console.error(error);
        }
    };

    const handleGuardarNotas = async () => {
        if (!selectedExamen) return;

        try {
            setSubmitting(true);
            const notasArray = Array.from(notasForm.values()).filter((n) => n.nota !== null);
            await registrarNotasMultiples(cursoId, selectedExamen.id, notasArray);
            toast.success("Notas guardadas correctamente");
            setIsNotasModalOpen(false);
            cargarDatos();
        } catch (error) {
            toast.error("Error al guardar notas");
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const openEditModal = (examen: ExamenDTO) => {
        setSelectedExamen(examen);
        setFormData({
            titulo: examen.titulo,
            descripcion: examen.descripcion || "",
            fecha: examen.fecha.slice(0, 16),
            tipo: examen.tipo,
            puntuacionMaxima: examen.puntuacionMaxima,
        });
        setIsEditModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            titulo: "",
            descripcion: "",
            fecha: "",
            tipo: "PARCIAL",
            puntuacionMaxima: 10,
        });
    };

    const getTipoBadge = (tipo: TipoExamen) => {
        switch (tipo) {
            case "PARCIAL":
                return <Badge variant="default">Parcial</Badge>;
            case "FINAL":
                return <Badge variant="destructive">Final</Badge>;
            case "RECUPERACION":
                return <Badge variant="secondary">Recuperación</Badge>;
            case "PRUEBA":
                return <Badge variant="outline">Prueba</Badge>;
        }
    };

    const getEstadoExamen = (fecha: string) => {
        const fechaExamen = new Date(fecha);
        const ahora = new Date();
        if (fechaExamen > ahora) {
            return <Badge className="bg-blue-500">Próximo</Badge>;
        }
        return <Badge variant="secondary">Realizado</Badge>;
    };

    // Vista para ALUMNO
    if (!esProfesor) {
        return (
            <div className="p-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6">Exámenes</h1>

                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">Cargando...</div>
                    ) : (
                        <>
                            {/* Promedio */}
                            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 mb-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Award className="w-8 h-8 text-primary" />
                                        <div>
                                            <div className="text-sm text-muted-foreground">Mi promedio en exámenes</div>
                                            <div className="text-3xl font-bold">{miPromedio.toFixed(2)}</div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {misNotas.length} exámenes calificados
                                    </div>
                                </div>
                            </div>

                            {/* Lista de exámenes */}
                            <div className="space-y-4">
                                {examenes.length === 0 ? (
                                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-8 text-center text-muted-foreground">
                                        No hay exámenes programados
                                    </div>
                                ) : (
                                    examenes.map((examen) => {
                                        const miNota = misNotas.find((n) => n.examenId === examen.id);
                                        return (
                                            <div
                                                key={examen.id}
                                                className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <FileText className="w-5 h-5" />
                                                            <h3 className="font-semibold text-lg">{examen.titulo}</h3>
                                                            {getTipoBadge(examen.tipo)}
                                                            {getEstadoExamen(examen.fecha)}
                                                        </div>
                                                        {examen.descripcion && (
                                                            <p className="text-sm text-muted-foreground mb-2">
                                                                {examen.descripcion}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-4 h-4" />
                                                                {new Date(examen.fecha).toLocaleDateString("es-ES", {
                                                                    weekday: "long",
                                                                    day: "numeric",
                                                                    month: "long",
                                                                    year: "numeric",
                                                                })}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-4 h-4" />
                                                                {new Date(examen.fecha).toLocaleTimeString("es-ES", {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        {miNota ? (
                                                            <div>
                                                                <div className="text-2xl font-bold">
                                                                    {miNota.nota}/{miNota.puntuacionMaxima}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {miNota.observaciones}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-muted-foreground text-sm">
                                                                Sin calificar
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // Vista para PROFESOR/ADMIN
    return (
        <div className="p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8" />
                        <h1 className="text-3xl font-bold">Gestión de Exámenes</h1>
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Examen
                    </Button>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Cargando...</div>
                ) : (
                    <div className="space-y-4">
                        {examenes.length === 0 ? (
                            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-8 text-center text-muted-foreground">
                                No hay exámenes. Crea el primero.
                            </div>
                        ) : (
                            examenes.map((examen) => (
                                <div
                                    key={examen.id}
                                    className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-semibold text-lg">{examen.titulo}</h3>
                                                {getTipoBadge(examen.tipo)}
                                                {getEstadoExamen(examen.fecha)}
                                            </div>
                                            {examen.descripcion && (
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    {examen.descripcion}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(examen.fecha).toLocaleDateString("es-ES")}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {new Date(examen.fecha).toLocaleTimeString("es-ES", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                                <span>Máx: {examen.puntuacionMaxima} pts</span>
                                                {examen.totalNotas !== undefined && (
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-4 h-4" />
                                                        {examen.totalNotas} calificados
                                                    </span>
                                                )}
                                                {examen.promedioNotas !== undefined && examen.promedioNotas !== null && (
                                                    <span>Promedio: {examen.promedioNotas.toFixed(2)}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openNotasModal(examen)}
                                            >
                                                <Award className="w-4 h-4 mr-1" />
                                                Notas
                                                <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditModal(examen)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedExamen(examen);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Modal Crear Examen */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nuevo Examen</DialogTitle>
                        <DialogDescription>Programa un nuevo examen para el curso.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Título</Label>
                            <Input
                                value={formData.titulo}
                                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                placeholder="Ej: Examen Parcial 1"
                            />
                        </div>
                        <div>
                            <Label>Descripción</Label>
                            <Textarea
                                value={formData.descripcion}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                placeholder="Temas a evaluar..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Fecha y Hora</Label>
                                <Input
                                    type="datetime-local"
                                    value={formData.fecha}
                                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Tipo</Label>
                                <Select
                                    value={formData.tipo}
                                    onValueChange={(value: TipoExamen) =>
                                        setFormData({ ...formData, tipo: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PARCIAL">Parcial</SelectItem>
                                        <SelectItem value="FINAL">Final</SelectItem>
                                        <SelectItem value="RECUPERACION">Recuperación</SelectItem>
                                        <SelectItem value="PRUEBA">Prueba</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label>Puntuación Máxima</Label>
                            <Input
                                type="number"
                                value={formData.puntuacionMaxima}
                                onChange={(e) =>
                                    setFormData({ ...formData, puntuacionMaxima: Number(e.target.value) })
                                }
                                min={1}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleCreate} disabled={submitting}>
                            {submitting ? "Creando..." : "Crear Examen"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Editar Examen */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Examen</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Título</Label>
                            <Input
                                value={formData.titulo}
                                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Descripción</Label>
                            <Textarea
                                value={formData.descripcion}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Fecha y Hora</Label>
                                <Input
                                    type="datetime-local"
                                    value={formData.fecha}
                                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Tipo</Label>
                                <Select
                                    value={formData.tipo}
                                    onValueChange={(value: TipoExamen) =>
                                        setFormData({ ...formData, tipo: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PARCIAL">Parcial</SelectItem>
                                        <SelectItem value="FINAL">Final</SelectItem>
                                        <SelectItem value="RECUPERACION">Recuperación</SelectItem>
                                        <SelectItem value="PRUEBA">Prueba</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label>Puntuación Máxima</Label>
                            <Input
                                type="number"
                                value={formData.puntuacionMaxima}
                                onChange={(e) =>
                                    setFormData({ ...formData, puntuacionMaxima: Number(e.target.value) })
                                }
                                min={1}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleEdit} disabled={submitting}>
                            {submitting ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Eliminar */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Eliminar Examen</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de eliminar "{selectedExamen?.titulo}"? Se eliminarán también
                            todas las notas asociadas.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
                            {submitting ? "Eliminando..." : "Eliminar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Notas */}
            <Dialog open={isNotasModalOpen} onOpenChange={setIsNotasModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Calificar: {selectedExamen?.titulo}</DialogTitle>
                        <DialogDescription>
                            Puntuación máxima: {selectedExamen?.puntuacionMaxima} puntos
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-96 overflow-y-auto">
                        <table className="w-full">
                            <thead className="sticky top-0 bg-background">
                                <tr className="border-b">
                                    <th className="text-left p-2">Alumno</th>
                                    <th className="text-left p-2 w-24">Nota</th>
                                    <th className="text-left p-2">Observaciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {curso?.alumnos?.map((alumno: AlumnoDTO) => {
                                    const notaData = notasForm.get(alumno.id);
                                    return (
                                        <tr key={alumno.id} className="border-b">
                                            <td className="p-2">
                                                <div className="font-medium">{alumno.nombre}</div>
                                                <div className="text-xs text-muted-foreground">{alumno.email}</div>
                                            </td>
                                            <td className="p-2">
                                                <Input
                                                    type="number"
                                                    className="w-20"
                                                    min={0}
                                                    max={selectedExamen?.puntuacionMaxima}
                                                    step={0.1}
                                                    value={notaData?.nota ?? ""}
                                                    onChange={(e) => {
                                                        const value = e.target.value === "" ? null : Number(e.target.value);
                                                        setNotasForm((prev) => {
                                                            const nuevo = new Map(prev);
                                                            nuevo.set(alumno.id, {
                                                                ...notaData!,
                                                                nota: value,
                                                            });
                                                            return nuevo;
                                                        });
                                                    }}
                                                />
                                            </td>
                                            <td className="p-2">
                                                <Input
                                                    placeholder="Observaciones..."
                                                    value={notaData?.observaciones || ""}
                                                    onChange={(e) => {
                                                        setNotasForm((prev) => {
                                                            const nuevo = new Map(prev);
                                                            nuevo.set(alumno.id, {
                                                                ...notaData!,
                                                                observaciones: e.target.value,
                                                            });
                                                            return nuevo;
                                                        });
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsNotasModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleGuardarNotas} disabled={submitting}>
                            {submitting ? "Guardando..." : "Guardar Notas"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
