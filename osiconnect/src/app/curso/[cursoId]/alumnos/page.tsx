"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/authStore";
import { useEffect, useState } from "react";
import { ResumenAlumnoCursoDTO, getResumenAlumnosCurso } from "@/services/notasService";
import { getAlumnosCurso, agregarAlumnoCurso, eliminarAlumnoCurso, getAlumnosDisponibles } from "@/services/profesorService";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Users,
    UserPlus,
    Trash2,
    TrendingUp,
    TrendingDown,
    Award,
    Calendar,
    FileText,
    GraduationCap,
} from "lucide-react";

interface AlumnoDisponible {
    id: string;
    nombre: string;
    email: string;
}

export default function AlumnosPage() {
    const params = useParams();
    const cursoId = params.cursoId as string;
    const usuario = useAuthStore((state) => state.usuario);
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [alumnos, setAlumnos] = useState<ResumenAlumnoCursoDTO[]>([]);
    const [alumnosDisponibles, setAlumnosDisponibles] = useState<AlumnoDisponible[]>([]);
    const [showAgregarModal, setShowAgregarModal] = useState(false);
    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<string>("");

    useEffect(() => {
        if (usuario && usuario.rol !== "PROFESOR") {
            router.push(`/curso/${cursoId}/temario`);
        }
    }, [usuario, router, cursoId]);

    useEffect(() => {
        if (usuario?.rol === "PROFESOR") {
            cargarDatos();
        }
    }, [cursoId, usuario]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const data = await getResumenAlumnosCurso(cursoId);
            setAlumnos(data);
        } catch (error) {
            toast.error("Error al cargar los alumnos");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const abrirModalAgregar = async () => {
        try {
            const disponibles = await getAlumnosDisponibles(cursoId);
            setAlumnosDisponibles(disponibles);
            setAlumnoSeleccionado("");
            setShowAgregarModal(true);
        } catch (error) {
            toast.error("Error al cargar alumnos disponibles");
        }
    };

    const handleAgregarAlumno = async () => {
        if (!alumnoSeleccionado) {
            toast.error("Selecciona un alumno");
            return;
        }
        try {
            const alumno = alumnosDisponibles.find(a => a.id === alumnoSeleccionado);
            if (alumno) {
                await agregarAlumnoCurso(cursoId, alumno.email);
                toast.success("Alumno añadido al curso");
                setShowAgregarModal(false);
                cargarDatos();
            }
        } catch (error) {
            toast.error("Error al añadir el alumno");
        }
    };

    const handleEliminarAlumno = async (alumnoId: string, nombre: string) => {
        if (!confirm(`¿Estás seguro de eliminar a ${nombre} del curso?`)) return;
        try {
            await eliminarAlumnoCurso(cursoId, alumnoId);
            toast.success("Alumno eliminado del curso");
            cargarDatos();
        } catch (error) {
            toast.error("Error al eliminar el alumno");
        }
    };

    const getNotaColor = (nota: number | null) => {
        if (nota === null) return "text-muted-foreground";
        if (nota >= 9) return "text-green-600";
        if (nota >= 7) return "text-blue-600";
        if (nota >= 5) return "text-yellow-600";
        return "text-red-600";
    };

    const getNotaBadge = (nota: number | null) => {
        if (nota === null) return <Badge variant="outline">-</Badge>;
        if (nota >= 9) return <Badge className="bg-green-500">{nota.toFixed(1)}</Badge>;
        if (nota >= 7) return <Badge className="bg-blue-500">{nota.toFixed(1)}</Badge>;
        if (nota >= 5) return <Badge className="bg-yellow-500">{nota.toFixed(1)}</Badge>;
        return <Badge variant="destructive">{nota.toFixed(1)}</Badge>;
    };

    const getAsistenciaBadge = (porcentaje: number) => {
        if (porcentaje >= 90) return <Badge className="bg-green-500">{porcentaje.toFixed(0)}%</Badge>;
        if (porcentaje >= 75) return <Badge className="bg-yellow-500">{porcentaje.toFixed(0)}%</Badge>;
        return <Badge variant="destructive">{porcentaje.toFixed(0)}%</Badge>;
    };

    // Estadísticas generales
    const calcularEstadisticas = () => {
        if (alumnos.length === 0) return { promedio: 0, aprobados: 0, asistenciaMedia: 0 };

        const notasValidas = alumnos.filter(a => a.notaFinal !== null);
        const promedio = notasValidas.length > 0
            ? notasValidas.reduce((sum, a) => sum + (a.notaFinal || 0), 0) / notasValidas.length
            : 0;
        const aprobados = notasValidas.filter(a => (a.notaFinal || 0) >= 5).length;
        const asistenciaMedia = alumnos.reduce((sum, a) => sum + a.porcentajeAsistencia, 0) / alumnos.length;

        return { promedio, aprobados, asistenciaMedia };
    };

    const stats = calcularEstadisticas();

    if (!usuario || usuario.rol !== "PROFESOR") {
        return null;
    }

    return (
        <div className="p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Users className="h-8 w-8" />
                        <h1 className="text-3xl font-bold">Gestión de Alumnos</h1>
                    </div>
                    <Button onClick={abrirModalAgregar}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Añadir Alumno
                    </Button>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-muted-foreground">
                        Cargando alumnos...
                    </div>
                ) : (
                    <>
                        {/* Estadísticas del curso */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                                    <Users className="h-4 w-4" />
                                    Total Alumnos
                                </div>
                                <div className="text-2xl font-bold">{alumnos.length}</div>
                            </div>
                            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                                    <TrendingUp className="h-4 w-4" />
                                    Promedio Curso
                                </div>
                                <div className={`text-2xl font-bold ${getNotaColor(stats.promedio)}`}>
                                    {stats.promedio > 0 ? stats.promedio.toFixed(2) : "-"}
                                </div>
                            </div>
                            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                                    <Award className="h-4 w-4" />
                                    Aprobados
                                </div>
                                <div className="text-2xl font-bold">
                                    {stats.aprobados}/{alumnos.filter(a => a.notaFinal !== null).length}
                                </div>
                            </div>
                            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                                    <Calendar className="h-4 w-4" />
                                    Asistencia Media
                                </div>
                                <div className="text-2xl font-bold">
                                    {stats.asistenciaMedia > 0 ? stats.asistenciaMedia.toFixed(0) : 0}%
                                </div>
                            </div>
                        </div>

                        {/* Tabla de alumnos */}
                        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden">
                            {alumnos.length === 0 ? (
                                <div className="p-8 text-center">
                                    <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">
                                        No hay alumnos matriculados en este curso.
                                    </p>
                                    <Button className="mt-4" onClick={abrirModalAgregar}>
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Añadir primer alumno
                                    </Button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-zinc-50 dark:bg-zinc-800">
                                            <tr>
                                                <th className="text-left p-4 font-medium">Alumno</th>
                                                <th className="text-center p-4 font-medium">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        Asistencia
                                                    </div>
                                                </th>
                                                <th className="text-center p-4 font-medium">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <FileText className="h-4 w-4" />
                                                        Prácticas
                                                    </div>
                                                </th>
                                                <th className="text-center p-4 font-medium">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <GraduationCap className="h-4 w-4" />
                                                        Exámenes
                                                    </div>
                                                </th>
                                                <th className="text-center p-4 font-medium">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Award className="h-4 w-4" />
                                                        Nota Final
                                                    </div>
                                                </th>
                                                <th className="text-center p-4 font-medium">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {alumnos.map((alumno) => (
                                                <tr key={alumno.alumnoId} className="hover:bg-muted/50">
                                                    <td className="p-4">
                                                        <div className="font-medium">{alumno.alumnoNombre}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {alumno.alumnoEmail}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        {getAsistenciaBadge(alumno.porcentajeAsistencia)}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <div className="flex flex-col items-center">
                                                            {getNotaBadge(alumno.notaPracticas)}
                                                            <span className="text-xs text-muted-foreground mt-1">
                                                                {alumno.practicasCalificadas} calif.
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <div className="flex flex-col items-center">
                                                            {getNotaBadge(alumno.notaExamenes)}
                                                            <span className="text-xs text-muted-foreground mt-1">
                                                                {alumno.examenesCalificados} calif.
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className={`text-xl font-bold ${getNotaColor(alumno.notaFinal)}`}>
                                                            {alumno.notaFinal !== null ? alumno.notaFinal.toFixed(2) : "-"}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-500"
                                                            onClick={() => handleEliminarAlumno(alumno.alumnoId, alumno.alumnoNombre)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Leyenda */}
                        {alumnos.length > 0 && (
                            <div className="mt-4 p-4 bg-white dark:bg-zinc-900 rounded-lg shadow">
                                <h3 className="text-sm font-semibold mb-2">Leyenda</h3>
                                <div className="flex flex-wrap gap-2 text-sm">
                                    <span className="flex items-center gap-1">
                                        <Badge className="bg-green-500">9-10</Badge> Excelente
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Badge className="bg-blue-500">7-8.9</Badge> Notable
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Badge className="bg-yellow-500">5-6.9</Badge> Aprobado
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Badge variant="destructive">&lt;5</Badge> Suspenso
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Nota final = 60% Exámenes + 40% Prácticas
                                </p>
                            </div>
                        )}
                    </>
                )}

                {/* Modal Añadir Alumno */}
                <Dialog open={showAgregarModal} onOpenChange={setShowAgregarModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Añadir Alumno al Curso</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            {alumnosDisponibles.length === 0 ? (
                                <p className="text-muted-foreground text-center">
                                    No hay alumnos disponibles para añadir.
                                </p>
                            ) : (
                                <Select value={alumnoSeleccionado} onValueChange={setAlumnoSeleccionado}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un alumno" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {alumnosDisponibles.map((alumno) => (
                                            <SelectItem key={alumno.id} value={alumno.id}>
                                                {alumno.nombre} ({alumno.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowAgregarModal(false)}>
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleAgregarAlumno}
                                disabled={!alumnoSeleccionado || alumnosDisponibles.length === 0}
                            >
                                Añadir
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
