"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    FileBarChart,
    BookOpen,
    FileText,
    Calendar,
    Award,
    TrendingUp,
} from "lucide-react";
import {
    ResumenNotasCursoDTO,
    getMisNotas,
    getPromedioGeneral,
} from "@/services/notasService";
import Link from "next/link";

export default function NotasPage() {
    const [loading, setLoading] = useState(true);
    const [notas, setNotas] = useState<ResumenNotasCursoDTO[]>([]);
    const [promedioGeneral, setPromedioGeneral] = useState<number>(0);

    useEffect(() => {
        cargarNotas();
    }, []);

    const cargarNotas = async () => {
        try {
            setLoading(true);
            const [notasData, promedioData] = await Promise.all([
                getMisNotas(),
                getPromedioGeneral(),
            ]);
            setNotas(notasData);
            setPromedioGeneral(promedioData);
        } catch (error) {
            toast.error("Error al cargar las notas");
            console.error(error);
        } finally {
            setLoading(false);
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
        if (nota === null) return <Badge variant="outline">Sin calificar</Badge>;
        if (nota >= 9) return <Badge className="bg-green-500">Excelente</Badge>;
        if (nota >= 7) return <Badge className="bg-blue-500">Notable</Badge>;
        if (nota >= 5) return <Badge className="bg-yellow-500">Aprobado</Badge>;
        return <Badge variant="destructive">Suspenso</Badge>;
    };

    const getAsistenciaBadge = (porcentaje: number) => {
        if (porcentaje >= 90) return <Badge className="bg-green-500">{porcentaje}%</Badge>;
        if (porcentaje >= 75) return <Badge className="bg-yellow-500">{porcentaje}%</Badge>;
        return <Badge variant="destructive">{porcentaje}%</Badge>;
    };

    return (
        <div className="p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <FileBarChart className="h-8 w-8" />
                    <h1 className="text-3xl font-bold">Mis Notas</h1>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-muted-foreground">
                        Cargando notas...
                    </div>
                ) : (
                    <>
                        {/* Promedio General */}
                        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg shadow p-6 mb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary/20 p-3 rounded-full">
                                        <Award className="h-8 w-8 text-primary" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">
                                            Promedio General
                                        </div>
                                        <div className={`text-4xl font-bold ${getNotaColor(promedioGeneral)}`}>
                                            {promedioGeneral > 0 ? promedioGeneral.toFixed(2) : "-"}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-muted-foreground">
                                        Cursos matriculados
                                    </div>
                                    <div className="text-2xl font-semibold">{notas.length}</div>
                                </div>
                            </div>
                        </div>

                        {/* Estadísticas rápidas */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                                    <FileText className="h-4 w-4" />
                                    Exámenes
                                </div>
                                <div className="text-2xl font-bold">
                                    {notas.reduce((acc, n) => acc + n.examenesCalificados, 0)}
                                </div>
                            </div>
                            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                                    <BookOpen className="h-4 w-4" />
                                    Prácticas
                                </div>
                                <div className="text-2xl font-bold">
                                    {notas.reduce((acc, n) => acc + n.practicasCalificadas, 0)}
                                </div>
                            </div>
                            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                                    <Calendar className="h-4 w-4" />
                                    Asistencia Media
                                </div>
                                <div className="text-2xl font-bold">
                                    {notas.length > 0
                                        ? (notas.reduce((acc, n) => acc + n.porcentajeAsistencia, 0) / notas.length).toFixed(0)
                                        : 0}%
                                </div>
                            </div>
                            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                                    <TrendingUp className="h-4 w-4" />
                                    Aprobados
                                </div>
                                <div className="text-2xl font-bold">
                                    {notas.filter(n => n.notaFinal !== null && n.notaFinal >= 5).length}/{notas.length}
                                </div>
                            </div>
                        </div>

                        {/* Notas por curso */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Detalle por Curso</h2>

                            {notas.length === 0 ? (
                                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-8 text-center text-muted-foreground">
                                    No estás matriculado en ningún curso
                                </div>
                            ) : (
                                notas.map((curso) => (
                                    <div
                                        key={curso.cursoId}
                                        className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden"
                                    >
                                        <div className="p-4 border-b bg-zinc-50 dark:bg-zinc-800">
                                            <div className="flex items-center justify-between">
                                                <Link
                                                    href={`/curso/${curso.cursoId}/temario`}
                                                    className="font-semibold text-lg hover:text-primary transition-colors"
                                                >
                                                    {curso.cursoNombre}
                                                </Link>
                                                {getNotaBadge(curso.notaFinal)}
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {/* Prácticas */}
                                                <div className="text-center p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                                                    <div className="text-xs text-muted-foreground mb-1">
                                                        Prácticas
                                                    </div>
                                                    <div className={`text-2xl font-bold ${getNotaColor(curso.notaPracticas)}`}>
                                                        {curso.notaPracticas !== null
                                                            ? curso.notaPracticas.toFixed(1)
                                                            : "-"}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {curso.practicasCalificadas} calificadas
                                                    </div>
                                                </div>

                                                {/* Exámenes */}
                                                <div className="text-center p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                                                    <div className="text-xs text-muted-foreground mb-1">
                                                        Exámenes
                                                    </div>
                                                    <div className={`text-2xl font-bold ${getNotaColor(curso.notaExamenes)}`}>
                                                        {curso.notaExamenes !== null
                                                            ? curso.notaExamenes.toFixed(1)
                                                            : "-"}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {curso.examenesCalificados} calificados
                                                    </div>
                                                </div>

                                                {/* Asistencia */}
                                                <div className="text-center p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                                                    <div className="text-xs text-muted-foreground mb-1">
                                                        Asistencia
                                                    </div>
                                                    <div className="text-2xl font-bold">
                                                        {getAsistenciaBadge(curso.porcentajeAsistencia)}
                                                    </div>
                                                </div>

                                                {/* Nota Final */}
                                                <div className="text-center p-3 bg-primary/10 rounded-lg">
                                                    <div className="text-xs text-muted-foreground mb-1">
                                                        Nota Final
                                                    </div>
                                                    <div className={`text-2xl font-bold ${getNotaColor(curso.notaFinal)}`}>
                                                        {curso.notaFinal !== null
                                                            ? curso.notaFinal.toFixed(2)
                                                            : "-"}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        60% exám. + 40% prác.
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Leyenda */}
                        <div className="mt-6 p-4 bg-white dark:bg-zinc-900 rounded-lg shadow">
                            <h3 className="text-sm font-semibold mb-2">Leyenda de calificaciones</h3>
                            <div className="flex flex-wrap gap-2">
                                <Badge className="bg-green-500">Excelente (9-10)</Badge>
                                <Badge className="bg-blue-500">Notable (7-8.9)</Badge>
                                <Badge className="bg-yellow-500">Aprobado (5-6.9)</Badge>
                                <Badge variant="destructive">Suspenso (&lt;5)</Badge>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
