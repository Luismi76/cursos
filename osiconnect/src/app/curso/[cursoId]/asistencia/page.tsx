"use client";

import { useParams } from "next/navigation";
import { useAuthStore } from "@/hooks/authStore";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    Calendar,
    Check,
    X,
    Clock,
    FileCheck,
    Users,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    XCircle,
    AlertCircle,
    FileCheck2,
    UserCheck,
} from "lucide-react";
import {
    AsistenciaDTO,
    EstadoAsistencia,
    EstadisticasAsistenciaDTO,
    RegistroAsistenciaDTO,
    getMiAsistencia,
    getMisEstadisticas,
    getAsistenciaPorFecha,
    getFechasConAsistencia,
    registrarAsistenciaMultiple,
} from "@/services/asistenciaService";
import { getCursoById } from "@/services/cursoService";
import { AlumnoDTO, CursoDTO } from "@/lib/types";

export default function AsistenciaPage() {
    const params = useParams();
    const cursoId = params.cursoId as string;
    const usuario = useAuthStore((state) => state.usuario);
    const esProfesor = usuario?.rol === "PROFESOR" || usuario?.rol === "ADMINISTRADOR";

    // Estado común
    const [loading, setLoading] = useState(true);

    // Estado para alumno
    const [miAsistencia, setMiAsistencia] = useState<AsistenciaDTO[]>([]);
    const [misEstadisticas, setMisEstadisticas] = useState<EstadisticasAsistenciaDTO | null>(null);

    // Estado para profesor
    const [curso, setCurso] = useState<CursoDTO | null>(null);
    const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(
        new Date().toISOString().split("T")[0]
    );
    const [asistenciaDelDia, setAsistenciaDelDia] = useState<Map<string, RegistroAsistenciaDTO>>(new Map());
    const [fechasRegistradas, setFechasRegistradas] = useState<string[]>([]);
    const [guardando, setGuardando] = useState(false);
    const [mostrarObservaciones, setMostrarObservaciones] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (esProfesor) {
            cargarDatosProfesor();
        } else {
            cargarDatosAlumno();
        }
    }, [cursoId, esProfesor]);

    useEffect(() => {
        if (esProfesor && curso) {
            cargarAsistenciaDelDia();
        }
    }, [fechaSeleccionada, curso]);

    const cargarDatosAlumno = async () => {
        try {
            setLoading(true);
            const [asistencia, estadisticas] = await Promise.all([
                getMiAsistencia(cursoId),
                getMisEstadisticas(cursoId),
            ]);
            setMiAsistencia(asistencia);
            setMisEstadisticas(estadisticas);
        } catch (error) {
            toast.error("Error al cargar tu asistencia");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const cargarDatosProfesor = async () => {
        try {
            setLoading(true);
            const [cursoData, fechas] = await Promise.all([
                getCursoById(cursoId),
                getFechasConAsistencia(cursoId),
            ]);
            setCurso(cursoData);
            setFechasRegistradas(fechas);

            if (cursoData.alumnos) {
                const mapaInicial = new Map<string, RegistroAsistenciaDTO>();
                cursoData.alumnos.forEach((alumno: AlumnoDTO) => {
                    mapaInicial.set(alumno.id, {
                        alumnoId: alumno.id,
                        fecha: fechaSeleccionada,
                        estado: "PRESENTE",
                    });
                });
                setAsistenciaDelDia(mapaInicial);
            }
        } catch (error) {
            toast.error("Error al cargar datos del curso");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const cargarAsistenciaDelDia = async () => {
        if (!curso?.alumnos) return;

        try {
            const asistencia = await getAsistenciaPorFecha(cursoId, fechaSeleccionada);

            const mapaAsistencia = new Map<string, RegistroAsistenciaDTO>();
            const observacionesVisibles = new Set<string>();

            curso.alumnos.forEach((alumno: AlumnoDTO) => {
                const existente = asistencia.find((a) => a.alumnoId === alumno.id);
                if (existente) {
                    mapaAsistencia.set(alumno.id, {
                        alumnoId: alumno.id,
                        fecha: fechaSeleccionada,
                        estado: existente.estado,
                        observaciones: existente.observaciones || undefined,
                    });
                    if (existente.observaciones) {
                        observacionesVisibles.add(alumno.id);
                    }
                } else {
                    mapaAsistencia.set(alumno.id, {
                        alumnoId: alumno.id,
                        fecha: fechaSeleccionada,
                        estado: "PRESENTE",
                    });
                }
            });

            setAsistenciaDelDia(mapaAsistencia);
            setMostrarObservaciones(observacionesVisibles);
        } catch (error) {
            console.error("Error al cargar asistencia del día:", error);
        }
    };

    const actualizarEstadoAlumno = (alumnoId: string, estado: EstadoAsistencia) => {
        setAsistenciaDelDia((prev) => {
            const nuevo = new Map(prev);
            const actual = nuevo.get(alumnoId);
            if (actual) {
                nuevo.set(alumnoId, { ...actual, estado });
            }
            return nuevo;
        });
    };

    const actualizarObservaciones = (alumnoId: string, observaciones: string) => {
        setAsistenciaDelDia((prev) => {
            const nuevo = new Map(prev);
            const actual = nuevo.get(alumnoId);
            if (actual) {
                nuevo.set(alumnoId, { ...actual, observaciones: observaciones || undefined });
            }
            return nuevo;
        });
    };

    const toggleObservaciones = (alumnoId: string) => {
        setMostrarObservaciones((prev) => {
            const nuevo = new Set(prev);
            if (nuevo.has(alumnoId)) {
                nuevo.delete(alumnoId);
            } else {
                nuevo.add(alumnoId);
            }
            return nuevo;
        });
    };

    const marcarTodos = (estado: EstadoAsistencia) => {
        setAsistenciaDelDia((prev) => {
            const nuevo = new Map(prev);
            nuevo.forEach((registro, alumnoId) => {
                nuevo.set(alumnoId, { ...registro, estado });
            });
            return nuevo;
        });
    };

    const guardarAsistencia = async () => {
        try {
            setGuardando(true);
            const registros = Array.from(asistenciaDelDia.values());
            await registrarAsistenciaMultiple(cursoId, registros);
            toast.success("Asistencia guardada correctamente");

            if (!fechasRegistradas.includes(fechaSeleccionada)) {
                setFechasRegistradas((prev) => [fechaSeleccionada, ...prev].sort().reverse());
            }
        } catch (error) {
            toast.error("Error al guardar la asistencia");
            console.error(error);
        } finally {
            setGuardando(false);
        }
    };

    const cambiarFecha = (dias: number) => {
        const fecha = new Date(fechaSeleccionada);
        fecha.setDate(fecha.getDate() + dias);
        setFechaSeleccionada(fecha.toISOString().split("T")[0]);
    };

    const getEstadoBadge = (estado: EstadoAsistencia) => {
        switch (estado) {
            case "PRESENTE":
                return (
                    <Badge variant="default" className="bg-green-500">
                        <Check className="w-3 h-3 mr-1" /> Presente
                    </Badge>
                );
            case "AUSENTE":
                return (
                    <Badge variant="destructive">
                        <X className="w-3 h-3 mr-1" /> Ausente
                    </Badge>
                );
            case "RETRASO":
                return (
                    <Badge variant="secondary" className="bg-yellow-500 text-white">
                        <Clock className="w-3 h-3 mr-1" /> Retraso
                    </Badge>
                );
            case "JUSTIFICADO":
                return (
                    <Badge variant="outline">
                        <FileCheck className="w-3 h-3 mr-1" /> Justificado
                    </Badge>
                );
        }
    };

    // Contar estados actuales
    const contarEstados = () => {
        const estados = { PRESENTE: 0, AUSENTE: 0, RETRASO: 0, JUSTIFICADO: 0 };
        asistenciaDelDia.forEach((registro) => {
            estados[registro.estado]++;
        });
        return estados;
    };

    const estadosActuales = contarEstados();

    // Vista para ALUMNO
    if (!esProfesor) {
        return (
            <div className="p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <Calendar className="h-8 w-8" />
                        <h1 className="text-3xl font-bold">Mi Asistencia</h1>
                    </div>

                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Cargando...
                        </div>
                    ) : (
                        <>
                            {/* Estadísticas */}
                            {misEstadisticas && (
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                                    <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg shadow p-4 text-center">
                                        <div className="text-3xl font-bold text-primary">
                                            {misEstadisticas.porcentajeAsistencia}%
                                        </div>
                                        <div className="text-xs text-muted-foreground">Asistencia Total</div>
                                    </div>
                                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4 text-center">
                                        <div className="text-2xl font-bold text-green-500">
                                            {misEstadisticas.presentes}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Presentes</div>
                                    </div>
                                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4 text-center">
                                        <div className="text-2xl font-bold text-red-500">
                                            {misEstadisticas.ausentes}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Ausentes</div>
                                    </div>
                                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4 text-center">
                                        <div className="text-2xl font-bold text-yellow-500">
                                            {misEstadisticas.retrasos}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Retrasos</div>
                                    </div>
                                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4 text-center">
                                        <div className="text-2xl font-bold text-blue-500">
                                            {misEstadisticas.justificados}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Justificados</div>
                                    </div>
                                </div>
                            )}

                            {/* Historial */}
                            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow">
                                <div className="p-4 border-b">
                                    <h2 className="font-semibold">Historial de Asistencia</h2>
                                </div>
                                <div className="divide-y">
                                    {miAsistencia.length === 0 ? (
                                        <div className="p-8 text-center text-muted-foreground">
                                            No hay registros de asistencia
                                        </div>
                                    ) : (
                                        miAsistencia.map((registro) => (
                                            <div
                                                key={registro.id}
                                                className="p-4 flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                                    <span>
                                                        {new Date(registro.fecha).toLocaleDateString("es-ES", {
                                                            weekday: "long",
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {registro.observaciones && (
                                                        <span className="text-sm text-muted-foreground max-w-48 truncate">
                                                            {registro.observaciones}
                                                        </span>
                                                    )}
                                                    {getEstadoBadge(registro.estado)}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
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
                        <Users className="h-8 w-8" />
                        <h1 className="text-3xl font-bold">Control de Asistencia</h1>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Cargando...</div>
                ) : (
                    <>
                        {/* Selector de fecha */}
                        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4 mb-4">
                            <div className="flex items-center justify-between">
                                <Button variant="outline" size="sm" onClick={() => cambiarFecha(-1)}>
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <div className="flex items-center gap-4">
                                    <Calendar className="w-5 h-5 text-muted-foreground" />
                                    <Input
                                        type="date"
                                        value={fechaSeleccionada}
                                        onChange={(e) => setFechaSeleccionada(e.target.value)}
                                        className="w-auto"
                                    />
                                    <span className="text-sm text-muted-foreground hidden sm:inline">
                                        {new Date(fechaSeleccionada).toLocaleDateString("es-ES", {
                                            weekday: "long",
                                            day: "numeric",
                                            month: "long",
                                        })}
                                    </span>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => cambiarFecha(1)}>
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                            {fechasRegistradas.includes(fechaSeleccionada) && (
                                <div className="mt-2 text-center">
                                    <Badge variant="secondary">Ya hay asistencia registrada</Badge>
                                </div>
                            )}
                        </div>

                        {/* Acciones rápidas y resumen */}
                        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4 mb-4">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex flex-wrap gap-2">
                                    <span className="text-sm text-muted-foreground self-center mr-2">Marcar todos:</span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-950"
                                        onClick={() => marcarTodos("PRESENTE")}
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-1" />
                                        Presente
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950"
                                        onClick={() => marcarTodos("AUSENTE")}
                                    >
                                        <XCircle className="w-4 h-4 mr-1" />
                                        Ausente
                                    </Button>
                                </div>
                                <div className="flex gap-4 text-sm">
                                    <span className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        {estadosActuales.PRESENTE}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        {estadosActuales.AUSENTE}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        {estadosActuales.RETRASO}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        {estadosActuales.JUSTIFICADO}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Lista de alumnos con toggle rápido */}
                        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden">
                            {!curso?.alumnos || curso.alumnos.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    No hay alumnos matriculados en este curso
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {curso.alumnos.map((alumno: AlumnoDTO) => {
                                        const registro = asistenciaDelDia.get(alumno.id);
                                        const estadoActual = registro?.estado || "PRESENTE";
                                        const tieneObservaciones = mostrarObservaciones.has(alumno.id);

                                        return (
                                            <div key={alumno.id} className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 min-w-0 mr-4">
                                                        <div className="font-medium truncate">{alumno.nombre}</div>
                                                        <div className="text-xs text-muted-foreground truncate">
                                                            {alumno.email}
                                                        </div>
                                                    </div>

                                                    {/* Botones de toggle rápido */}
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => actualizarEstadoAlumno(alumno.id, "PRESENTE")}
                                                            className={`p-2 rounded-lg transition-all ${
                                                                estadoActual === "PRESENTE"
                                                                    ? "bg-green-500 text-white shadow-md"
                                                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-green-100 dark:hover:bg-green-900 hover:text-green-600"
                                                            }`}
                                                            title="Presente"
                                                        >
                                                            <CheckCircle2 className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => actualizarEstadoAlumno(alumno.id, "AUSENTE")}
                                                            className={`p-2 rounded-lg transition-all ${
                                                                estadoActual === "AUSENTE"
                                                                    ? "bg-red-500 text-white shadow-md"
                                                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600"
                                                            }`}
                                                            title="Ausente"
                                                        >
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => actualizarEstadoAlumno(alumno.id, "RETRASO")}
                                                            className={`p-2 rounded-lg transition-all ${
                                                                estadoActual === "RETRASO"
                                                                    ? "bg-yellow-500 text-white shadow-md"
                                                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-yellow-100 dark:hover:bg-yellow-900 hover:text-yellow-600"
                                                            }`}
                                                            title="Retraso"
                                                        >
                                                            <AlertCircle className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => actualizarEstadoAlumno(alumno.id, "JUSTIFICADO")}
                                                            className={`p-2 rounded-lg transition-all ${
                                                                estadoActual === "JUSTIFICADO"
                                                                    ? "bg-blue-500 text-white shadow-md"
                                                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600"
                                                            }`}
                                                            title="Justificado"
                                                        >
                                                            <FileCheck2 className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => toggleObservaciones(alumno.id)}
                                                            className={`p-2 rounded-lg ml-2 transition-all ${
                                                                tieneObservaciones
                                                                    ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                                                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                                            }`}
                                                            title="Añadir nota"
                                                        >
                                                            <span className="text-xs font-medium">Nota</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Campo de observaciones expandible */}
                                                {tieneObservaciones && (
                                                    <div className="mt-3">
                                                        <Input
                                                            placeholder="Observaciones..."
                                                            value={registro?.observaciones || ""}
                                                            onChange={(e) =>
                                                                actualizarObservaciones(alumno.id, e.target.value)
                                                            }
                                                            className="text-sm"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Botón guardar fijo */}
                        {curso?.alumnos && curso.alumnos.length > 0 && (
                            <div className="sticky bottom-6 mt-6 flex justify-center">
                                <Button
                                    onClick={guardarAsistencia}
                                    disabled={guardando}
                                    size="lg"
                                    className="shadow-lg"
                                >
                                    <UserCheck className="w-5 h-5 mr-2" />
                                    {guardando ? "Guardando..." : "Guardar Asistencia"}
                                </Button>
                            </div>
                        )}

                        {/* Fechas con asistencia */}
                        {fechasRegistradas.length > 0 && (
                            <div className="mt-6 bg-white dark:bg-zinc-900 rounded-lg shadow p-4">
                                <h3 className="font-semibold mb-3">Días con asistencia registrada</h3>
                                <div className="flex flex-wrap gap-2">
                                    {fechasRegistradas.slice(0, 14).map((fecha) => (
                                        <Button
                                            key={fecha}
                                            variant={fecha === fechaSeleccionada ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setFechaSeleccionada(fecha)}
                                        >
                                            {new Date(fecha).toLocaleDateString("es-ES", {
                                                day: "2-digit",
                                                month: "short",
                                            })}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
