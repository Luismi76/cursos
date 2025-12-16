"use client";

import { useParams } from "next/navigation";
import { useAuthStore } from "@/hooks/authStore";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    Calendar,
    Check,
    X,
    Clock,
    FileCheck,
    Users,
    ChevronLeft,
    ChevronRight,
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

            // Inicializar el mapa de asistencia con los alumnos
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

            // Primero poner todos como pendientes
            curso.alumnos.forEach((alumno: AlumnoDTO) => {
                const existente = asistencia.find((a) => a.alumnoId === alumno.id);
                if (existente) {
                    mapaAsistencia.set(alumno.id, {
                        alumnoId: alumno.id,
                        fecha: fechaSeleccionada,
                        estado: existente.estado,
                        observaciones: existente.observaciones || undefined,
                    });
                } else {
                    mapaAsistencia.set(alumno.id, {
                        alumnoId: alumno.id,
                        fecha: fechaSeleccionada,
                        estado: "PRESENTE",
                    });
                }
            });

            setAsistenciaDelDia(mapaAsistencia);
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

    const guardarAsistencia = async () => {
        try {
            setGuardando(true);
            const registros = Array.from(asistenciaDelDia.values());
            await registrarAsistenciaMultiple(cursoId, registros);
            toast.success("Asistencia guardada correctamente");

            // Actualizar fechas registradas si es nueva
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

    // Vista para ALUMNO
    if (!esProfesor) {
        return (
            <div className="p-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6">Mi Asistencia</h1>

                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Cargando...
                        </div>
                    ) : (
                        <>
                            {/* Estadísticas */}
                            {misEstadisticas && (
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4 text-center">
                                        <div className="text-2xl font-bold text-primary">
                                            {misEstadisticas.porcentajeAsistencia}%
                                        </div>
                                        <div className="text-xs text-muted-foreground">Asistencia</div>
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
                                        <div className="text-2xl font-bold">
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
                                                        <span className="text-sm text-muted-foreground">
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
                        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4 mb-6">
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
                                    <span className="text-sm text-muted-foreground">
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
                                    <Badge variant="secondary">Ya hay asistencia registrada para este día</Badge>
                                </div>
                            )}
                        </div>

                        {/* Tabla de asistencia */}
                        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-zinc-50 dark:bg-zinc-800">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                                            Alumno
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                                            Estado
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                                            Observaciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                    {!curso?.alumnos || curso.alumnos.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                                                No hay alumnos matriculados en este curso
                                            </td>
                                        </tr>
                                    ) : (
                                        curso.alumnos.map((alumno: AlumnoDTO) => {
                                            const registro = asistenciaDelDia.get(alumno.id);
                                            return (
                                                <tr key={alumno.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium">{alumno.nombre}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {alumno.email}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Select
                                                            value={registro?.estado || "PRESENTE"}
                                                            onValueChange={(value: EstadoAsistencia) =>
                                                                actualizarEstadoAlumno(alumno.id, value)
                                                            }
                                                        >
                                                            <SelectTrigger className="w-40">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="PRESENTE">
                                                                    <span className="flex items-center gap-2">
                                                                        <Check className="w-3 h-3 text-green-500" />
                                                                        Presente
                                                                    </span>
                                                                </SelectItem>
                                                                <SelectItem value="AUSENTE">
                                                                    <span className="flex items-center gap-2">
                                                                        <X className="w-3 h-3 text-red-500" />
                                                                        Ausente
                                                                    </span>
                                                                </SelectItem>
                                                                <SelectItem value="RETRASO">
                                                                    <span className="flex items-center gap-2">
                                                                        <Clock className="w-3 h-3 text-yellow-500" />
                                                                        Retraso
                                                                    </span>
                                                                </SelectItem>
                                                                <SelectItem value="JUSTIFICADO">
                                                                    <span className="flex items-center gap-2">
                                                                        <FileCheck className="w-3 h-3" />
                                                                        Justificado
                                                                    </span>
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Input
                                                            placeholder="Observaciones..."
                                                            value={registro?.observaciones || ""}
                                                            onChange={(e) =>
                                                                actualizarObservaciones(alumno.id, e.target.value)
                                                            }
                                                            className="max-w-xs"
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Botón guardar */}
                        {curso?.alumnos && curso.alumnos.length > 0 && (
                            <div className="mt-6 flex justify-end">
                                <Button onClick={guardarAsistencia} disabled={guardando}>
                                    {guardando ? "Guardando..." : "Guardar Asistencia"}
                                </Button>
                            </div>
                        )}

                        {/* Fechas con asistencia */}
                        {fechasRegistradas.length > 0 && (
                            <div className="mt-6 bg-white dark:bg-zinc-900 rounded-lg shadow p-4">
                                <h3 className="font-semibold mb-3">Días con asistencia registrada</h3>
                                <div className="flex flex-wrap gap-2">
                                    {fechasRegistradas.slice(0, 10).map((fecha) => (
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
