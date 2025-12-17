"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/hooks/authStore";
import { Practica, EntregaPractica, EntregasAgrupadas } from "@/lib/types";
import {
    getPracticasCurso,
    crearPracticaCurso,
    eliminarPracticaCurso,
    editarPracticaCurso,
    getEntregasPractica,
    calificarEntrega,
} from "@/services/profesorService";
import {
    getHistorialCursoAlumno,
    entregarPractica,
    subirArchivoEntrega,
    verMiEntrega,
} from "@/services/alumnosService";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    FileText,
    Plus,
    Calendar,
    CheckCircle,
    Clock,
    AlertCircle,
    Upload,
    Eye,
    Trash2,
    Edit,
    Users,
    Award,
} from "lucide-react";

export default function PracticasPage() {
    const params = useParams();
    const cursoId = params.cursoId as string;
    const usuario = useAuthStore((state) => state.usuario);
    const esProfesor = usuario?.rol === "PROFESOR" || usuario?.rol === "ADMINISTRADOR";
    const esAlumno = usuario?.rol === "ALUMNO";

    // Estado común
    const [loading, setLoading] = useState(true);

    // Estado para profesor
    const [practicas, setPracticas] = useState<Practica[]>([]);
    const [showCrearModal, setShowCrearModal] = useState(false);
    const [showEditarModal, setShowEditarModal] = useState(false);
    const [showEntregasModal, setShowEntregasModal] = useState(false);
    const [practicaSeleccionada, setPracticaSeleccionada] = useState<Practica | null>(null);
    const [entregas, setEntregas] = useState<EntregaPractica[]>([]);
    const [formData, setFormData] = useState({
        titulo: "",
        descripcion: "",
        fechaEntrega: "",
    });

    // Estado para alumno
    const [historial, setHistorial] = useState<EntregasAgrupadas | null>(null);
    const [showEntregarModal, setShowEntregarModal] = useState(false);
    const [practicaParaEntregar, setPracticaParaEntregar] = useState<Practica | null>(null);
    const [archivo, setArchivo] = useState<File | null>(null);
    const [comentarioEntrega, setComentarioEntrega] = useState("");
    const [subiendoArchivo, setSubiendoArchivo] = useState(false);

    // Calificación
    const [showCalificarModal, setShowCalificarModal] = useState(false);
    const [entregaParaCalificar, setEntregaParaCalificar] = useState<EntregaPractica | null>(null);
    const [calificacionData, setCalificacionData] = useState({ nota: "", comentario: "" });

    useEffect(() => {
        cargarDatos();
    }, [cursoId]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            if (esProfesor) {
                const data = await getPracticasCurso(cursoId);
                setPracticas(data);
            } else if (esAlumno) {
                const data = await getHistorialCursoAlumno(cursoId);
                setHistorial(data);
            }
        } catch (error) {
            toast.error("Error al cargar las prácticas");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // === FUNCIONES PROFESOR ===

    const handleCrearPractica = async () => {
        if (!formData.titulo || !formData.fechaEntrega) {
            toast.error("Título y fecha de entrega son obligatorios");
            return;
        }
        try {
            await crearPracticaCurso(cursoId, formData);
            toast.success("Práctica creada correctamente");
            setShowCrearModal(false);
            setFormData({ titulo: "", descripcion: "", fechaEntrega: "" });
            cargarDatos();
        } catch (error) {
            toast.error("Error al crear la práctica");
        }
    };

    const handleEditarPractica = async () => {
        if (!practicaSeleccionada) return;
        try {
            await editarPracticaCurso(cursoId, practicaSeleccionada.id, formData);
            toast.success("Práctica actualizada");
            setShowEditarModal(false);
            cargarDatos();
        } catch (error) {
            toast.error("Error al editar la práctica");
        }
    };

    const handleEliminarPractica = async (practicaId: string) => {
        if (!confirm("¿Estás seguro de eliminar esta práctica?")) return;
        try {
            await eliminarPracticaCurso(cursoId, practicaId);
            toast.success("Práctica eliminada");
            cargarDatos();
        } catch (error) {
            toast.error("Error al eliminar la práctica");
        }
    };

    const verEntregas = async (practica: Practica) => {
        try {
            const data = await getEntregasPractica(practica.id);
            setEntregas(data);
            setPracticaSeleccionada(practica);
            setShowEntregasModal(true);
        } catch (error) {
            toast.error("Error al cargar las entregas");
        }
    };

    const abrirCalificar = (entrega: EntregaPractica) => {
        setEntregaParaCalificar(entrega);
        setCalificacionData({
            nota: entrega.nota?.toString() || "",
            comentario: entrega.comentarioProfesor || "",
        });
        setShowCalificarModal(true);
    };

    const handleCalificar = async () => {
        if (!entregaParaCalificar) return;
        const nota = parseFloat(calificacionData.nota);
        if (isNaN(nota) || nota < 0 || nota > 10) {
            toast.error("La nota debe ser un número entre 0 y 10");
            return;
        }
        try {
            await calificarEntrega(entregaParaCalificar.id, {
                nota,
                comentarioProfesor: calificacionData.comentario,
            });
            toast.success("Entrega calificada");
            setShowCalificarModal(false);
            if (practicaSeleccionada) {
                verEntregas(practicaSeleccionada);
            }
        } catch (error) {
            toast.error("Error al calificar");
        }
    };

    // === FUNCIONES ALUMNO ===

    const abrirEntregarModal = (practica: Practica) => {
        setPracticaParaEntregar(practica);
        setArchivo(null);
        setComentarioEntrega("");
        setShowEntregarModal(true);
    };

    const handleEntregar = async () => {
        if (!practicaParaEntregar || !archivo) {
            toast.error("Debes seleccionar un archivo");
            return;
        }
        try {
            setSubiendoArchivo(true);
            const formData = new FormData();
            formData.append("archivo", archivo);
            const archivoUrl = await subirArchivoEntrega(practicaParaEntregar.id, formData);
            await entregarPractica(practicaParaEntregar.id, {
                archivoUrl,
                comentario: comentarioEntrega,
            });
            toast.success("Práctica entregada correctamente");
            setShowEntregarModal(false);
            cargarDatos();
        } catch (error) {
            toast.error("Error al entregar la práctica");
        } finally {
            setSubiendoArchivo(false);
        }
    };

    // === HELPERS ===

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const isVencida = (fechaEntrega: string) => {
        return new Date(fechaEntrega) < new Date();
    };

    const getEstadoBadge = (entrega: EntregaPractica | null, practica: Practica) => {
        if (entrega) {
            if (entrega.nota !== null) {
                return <Badge className="bg-green-500">Calificada: {entrega.nota}</Badge>;
            }
            return <Badge className="bg-blue-500">Entregada</Badge>;
        }
        if (isVencida(practica.fechaEntrega)) {
            return <Badge variant="destructive">Vencida</Badge>;
        }
        return <Badge variant="outline">Pendiente</Badge>;
    };

    // === RENDER ===

    if (loading) {
        return (
            <div className="p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center py-8 text-muted-foreground">
                        Cargando prácticas...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8" />
                        <h1 className="text-3xl font-bold">Prácticas</h1>
                    </div>
                    {esProfesor && (
                        <Button onClick={() => setShowCrearModal(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Nueva Práctica
                        </Button>
                    )}
                </div>

                {/* VISTA PROFESOR */}
                {esProfesor ? (
                    <div className="space-y-4">
                        {practicas.length === 0 ? (
                            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-8 text-center text-muted-foreground">
                                No hay prácticas creadas. Crea la primera práctica para comenzar.
                            </div>
                        ) : (
                            practicas.map((practica) => (
                                <div
                                    key={practica.id}
                                    className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg">{practica.titulo}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {practica.descripcion}
                                            </p>
                                            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    Entrega: {formatDate(practica.fechaEntrega)}
                                                </span>
                                                {isVencida(practica.fechaEntrega) && (
                                                    <Badge variant="outline" className="text-yellow-600">
                                                        Plazo vencido
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => verEntregas(practica)}
                                            >
                                                <Users className="h-4 w-4 mr-1" />
                                                Entregas
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setPracticaSeleccionada(practica);
                                                    setFormData({
                                                        titulo: practica.titulo,
                                                        descripcion: practica.descripcion,
                                                        fechaEntrega: practica.fechaEntrega.split("T")[0],
                                                    });
                                                    setShowEditarModal(true);
                                                }}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500"
                                                onClick={() => handleEliminarPractica(practica.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    /* VISTA ALUMNO */
                    <div className="space-y-6">
                        {/* Pendientes */}
                        {historial?.pendientes && historial.pendientes.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-yellow-500" />
                                    Pendientes ({historial.pendientes.length})
                                </h2>
                                <div className="space-y-3">
                                    {historial.pendientes.map((practica) => (
                                        <div
                                            key={practica.id}
                                            className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold">{practica.titulo}</h3>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {practica.descripcion}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                                        <Calendar className="h-4 w-4" />
                                                        Entrega: {formatDate(practica.fechaEntrega)}
                                                    </div>
                                                </div>
                                                <Button onClick={() => abrirEntregarModal(practica)}>
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Entregar
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Entregadas */}
                        {historial?.entregadas && historial.entregadas.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    Entregadas ({historial.entregadas.length})
                                </h2>
                                <div className="space-y-3">
                                    {historial.entregadas.map((entrega) => (
                                        <div
                                            key={entrega.id}
                                            className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold">{entrega.practica.titulo}</h3>
                                                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                                        <Calendar className="h-4 w-4" />
                                                        Entregado: {formatDate(entrega.fechaEntrega)}
                                                    </div>
                                                    {entrega.comentario && (
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            Tu comentario: {entrega.comentario}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    {entrega.nota !== null ? (
                                                        <div>
                                                            <Badge className="bg-green-500 text-lg px-3 py-1">
                                                                {entrega.nota}
                                                            </Badge>
                                                            {entrega.comentarioProfesor && (
                                                                <p className="text-xs text-muted-foreground mt-1 max-w-48">
                                                                    {entrega.comentarioProfesor}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <Badge variant="outline">Pendiente de calificar</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Fuera de plazo */}
                        {historial?.fueraDePlazo && historial.fueraDePlazo.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                    Fuera de plazo ({historial.fueraDePlazo.length})
                                </h2>
                                <div className="space-y-3">
                                    {historial.fueraDePlazo.map((practica) => (
                                        <div
                                            key={practica.id}
                                            className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4 border-l-4 border-red-500"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold">{practica.titulo}</h3>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {practica.descripcion}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2 text-sm text-red-500">
                                                        <Calendar className="h-4 w-4" />
                                                        Venció: {formatDate(practica.fechaEntrega)}
                                                    </div>
                                                </div>
                                                <Badge variant="destructive">No entregada</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sin prácticas */}
                        {(!historial ||
                            (historial.pendientes.length === 0 &&
                                historial.entregadas.length === 0 &&
                                historial.fueraDePlazo.length === 0)) && (
                            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-8 text-center text-muted-foreground">
                                No hay prácticas asignadas en este curso.
                            </div>
                        )}
                    </div>
                )}

                {/* MODAL CREAR PRÁCTICA */}
                <Dialog open={showCrearModal} onOpenChange={setShowCrearModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Nueva Práctica</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>Título</Label>
                                <Input
                                    value={formData.titulo}
                                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                    placeholder="Título de la práctica"
                                />
                            </div>
                            <div>
                                <Label>Descripción</Label>
                                <Textarea
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    placeholder="Descripción de la práctica"
                                />
                            </div>
                            <div>
                                <Label>Fecha de entrega</Label>
                                <Input
                                    type="date"
                                    value={formData.fechaEntrega}
                                    onChange={(e) => setFormData({ ...formData, fechaEntrega: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowCrearModal(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleCrearPractica}>Crear</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* MODAL EDITAR PRÁCTICA */}
                <Dialog open={showEditarModal} onOpenChange={setShowEditarModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Editar Práctica</DialogTitle>
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
                            <div>
                                <Label>Fecha de entrega</Label>
                                <Input
                                    type="date"
                                    value={formData.fechaEntrega}
                                    onChange={(e) => setFormData({ ...formData, fechaEntrega: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowEditarModal(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleEditarPractica}>Guardar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* MODAL VER ENTREGAS */}
                <Dialog open={showEntregasModal} onOpenChange={setShowEntregasModal}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>
                                Entregas: {practicaSeleccionada?.titulo}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="max-h-96 overflow-y-auto space-y-3">
                            {entregas.length === 0 ? (
                                <p className="text-muted-foreground text-center py-4">
                                    No hay entregas para esta práctica.
                                </p>
                            ) : (
                                entregas.map((entrega) => (
                                    <div
                                        key={entrega.id}
                                        className="border rounded-lg p-3 flex items-center justify-between"
                                    >
                                        <div>
                                            <p className="font-medium">{entrega.alumno.nombre}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {entrega.alumno.email}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Entregado: {formatDate(entrega.fechaEntrega)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {entrega.archivoUrl && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => window.open(entrega.archivoUrl, "_blank")}
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Ver
                                                </Button>
                                            )}
                                            <Button size="sm" onClick={() => abrirCalificar(entrega)}>
                                                <Award className="h-4 w-4 mr-1" />
                                                {entrega.nota !== null ? `${entrega.nota}` : "Calificar"}
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* MODAL CALIFICAR */}
                <Dialog open={showCalificarModal} onOpenChange={setShowCalificarModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                Calificar: {entregaParaCalificar?.alumno.nombre}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>Nota (0-10)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="10"
                                    step="0.1"
                                    value={calificacionData.nota}
                                    onChange={(e) =>
                                        setCalificacionData({ ...calificacionData, nota: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <Label>Comentario</Label>
                                <Textarea
                                    value={calificacionData.comentario}
                                    onChange={(e) =>
                                        setCalificacionData({ ...calificacionData, comentario: e.target.value })
                                    }
                                    placeholder="Comentario para el alumno"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowCalificarModal(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleCalificar}>Guardar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* MODAL ENTREGAR (ALUMNO) */}
                <Dialog open={showEntregarModal} onOpenChange={setShowEntregarModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Entregar: {practicaParaEntregar?.titulo}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>Archivo</Label>
                                <Input
                                    type="file"
                                    onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                                />
                            </div>
                            <div>
                                <Label>Comentario (opcional)</Label>
                                <Textarea
                                    value={comentarioEntrega}
                                    onChange={(e) => setComentarioEntrega(e.target.value)}
                                    placeholder="Añade un comentario a tu entrega"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowEntregarModal(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleEntregar} disabled={subiendoArchivo || !archivo}>
                                {subiendoArchivo ? "Subiendo..." : "Entregar"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
