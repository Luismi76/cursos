"use client";

import { useEffect, useState } from "react";
import {
    getEstadisticasProfesor,
    EstadisticasProfesorDTO,
} from "@/services/profesorService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Users,
    BookOpen,
    FileText,
    Calendar,
    TrendingUp,
    ClipboardCheck,
    ArrowRight,
    GraduationCap,
    AlertCircle,
} from "lucide-react";

export default function PaginaInicioProfesor() {
    const [estadisticas, setEstadisticas] = useState<EstadisticasProfesorDTO | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarEstadisticas();
    }, []);

    const cargarEstadisticas = async () => {
        try {
            setLoading(true);
            const data = await getEstadisticasProfesor();
            setEstadisticas(data);
        } catch (error) {
            console.error("Error al cargar estadísticas", error);
        } finally {
            setLoading(false);
        }
    };

    const getNotaColor = (nota: number) => {
        if (nota >= 7) return "text-green-600";
        if (nota >= 5) return "text-yellow-600";
        if (nota > 0) return "text-red-600";
        return "text-muted-foreground";
    };

    const getAsistenciaColor = (asistencia: number) => {
        if (asistencia >= 90) return "text-green-600";
        if (asistencia >= 75) return "text-yellow-600";
        return "text-red-600";
    };

    if (loading) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-muted rounded w-48"></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-24 bg-muted rounded-lg"></div>
                        ))}
                    </div>
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-32 bg-muted rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!estadisticas) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <p className="text-muted-foreground">Error al cargar las estadísticas.</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <GraduationCap className="h-8 w-8" />
                    <h1 className="text-3xl font-bold">Panel del Profesor</h1>
                </div>
            </div>

            {/* Tarjetas de estadísticas principales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <BookOpen className="h-4 w-4" />
                        Cursos
                    </div>
                    <div className="text-3xl font-bold">{estadisticas.totalCursos}</div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <Users className="h-4 w-4" />
                        Alumnos
                    </div>
                    <div className="text-3xl font-bold">{estadisticas.totalAlumnos}</div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <FileText className="h-4 w-4" />
                        Entregas Pendientes
                    </div>
                    <div className={`text-3xl font-bold ${estadisticas.entregasPendientes > 0 ? "text-orange-500" : "text-green-600"}`}>
                        {estadisticas.entregasPendientes}
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <Calendar className="h-4 w-4" />
                        Exámenes Próximos
                    </div>
                    <div className="text-3xl font-bold">{estadisticas.examenesProximos}</div>
                </div>
            </div>

            {/* Alertas si hay entregas pendientes */}
            {estadisticas.entregasPendientes > 0 && (
                <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                        <span className="font-medium text-orange-700 dark:text-orange-300">
                            Tienes {estadisticas.entregasPendientes} entrega{estadisticas.entregasPendientes !== 1 ? "s" : ""} pendiente{estadisticas.entregasPendientes !== 1 ? "s" : ""} de calificar
                        </span>
                    </div>
                </div>
            )}

            {/* Lista de cursos con estadísticas */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Mis Cursos
                </h2>

                {estadisticas.cursos.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-8 text-center">
                        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No tienes cursos asignados.</p>
                    </div>
                ) : (
                    estadisticas.cursos.map((curso) => (
                        <div
                            key={curso.cursoId}
                            className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden"
                        >
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold">{curso.cursoNombre}</h3>
                                    <Link href={`/profesor/curso/${curso.cursoId}`}>
                                        <Button variant="outline" size="sm">
                                            Ver curso
                                            <ArrowRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </Link>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <div className="text-center p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                                        <div className="text-xs text-muted-foreground mb-1">
                                            <Users className="h-3 w-3 inline mr-1" />
                                            Alumnos
                                        </div>
                                        <div className="text-xl font-bold">{curso.totalAlumnos}</div>
                                    </div>

                                    <div className="text-center p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                                        <div className="text-xs text-muted-foreground mb-1">
                                            <FileText className="h-3 w-3 inline mr-1" />
                                            Pendientes
                                        </div>
                                        <div className={`text-xl font-bold ${curso.entregasPendientes > 0 ? "text-orange-500" : "text-green-600"}`}>
                                            {curso.entregasPendientes}
                                        </div>
                                    </div>

                                    <div className="text-center p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                                        <div className="text-xs text-muted-foreground mb-1">
                                            <Calendar className="h-3 w-3 inline mr-1" />
                                            Exámenes
                                        </div>
                                        <div className="text-xl font-bold">{curso.examenesProximos}</div>
                                    </div>

                                    <div className="text-center p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                                        <div className="text-xs text-muted-foreground mb-1">
                                            <ClipboardCheck className="h-3 w-3 inline mr-1" />
                                            Asistencia
                                        </div>
                                        <div className={`text-xl font-bold ${getAsistenciaColor(curso.asistenciaMedia)}`}>
                                            {curso.asistenciaMedia > 0 ? `${curso.asistenciaMedia.toFixed(0)}%` : "-"}
                                        </div>
                                    </div>

                                    <div className="text-center p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                                        <div className="text-xs text-muted-foreground mb-1">
                                            <TrendingUp className="h-3 w-3 inline mr-1" />
                                            Promedio
                                        </div>
                                        <div className={`text-xl font-bold ${getNotaColor(curso.promedioNotas)}`}>
                                            {curso.promedioNotas > 0 ? curso.promedioNotas.toFixed(1) : "-"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Accesos rápidos */}
                            <div className="border-t bg-zinc-50 dark:bg-zinc-800/50 p-3 flex flex-wrap gap-2">
                                <Link href={`/curso/${curso.cursoId}/alumnos`}>
                                    <Badge variant="outline" className="cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700">
                                        <Users className="h-3 w-3 mr-1" /> Alumnos
                                    </Badge>
                                </Link>
                                <Link href={`/curso/${curso.cursoId}/practicas`}>
                                    <Badge variant="outline" className="cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700">
                                        <FileText className="h-3 w-3 mr-1" /> Prácticas
                                    </Badge>
                                </Link>
                                <Link href={`/curso/${curso.cursoId}/examenes`}>
                                    <Badge variant="outline" className="cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700">
                                        <Calendar className="h-3 w-3 mr-1" /> Exámenes
                                    </Badge>
                                </Link>
                                <Link href={`/curso/${curso.cursoId}/asistencia`}>
                                    <Badge variant="outline" className="cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700">
                                        <ClipboardCheck className="h-3 w-3 mr-1" /> Asistencia
                                    </Badge>
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
