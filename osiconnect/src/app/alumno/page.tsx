"use client";

import { useEffect, useState } from "react";
import { getPerfil } from "@/services/usuarioService";
import {
    getMisCursos,
    listarMisEntregas,
    getMisNotificaciones,
    getEstadisticasAlumno,
    EstadisticasAlumnoDTO,
} from "@/services/alumnosService";
import {
    Curso,
    EntregaPractica,
    Practica,
    Perfil,
    Notificacion,
} from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    BookOpen,
    CalendarDays,
    FileText,
    Send,
    Bell,
    GraduationCap,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle,
    ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { NotificacionesAlumno } from "@/components/alumnos/NotificacionesAlumno";

interface PracticaConCurso extends Practica {
    cursoId: string;
}

export default function DashboardAlumnoPage() {
    const [perfil, setPerfil] = useState<Perfil | null>(null);
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [entregas, setEntregas] = useState<EntregaPractica[]>([]);
    const [pendientes, setPendientes] = useState<PracticaConCurso[]>([]);
    const [proximas, setProximas] = useState<PracticaConCurso[]>([]);
    const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
    const [estadisticas, setEstadisticas] = useState<EstadisticasAlumnoDTO | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPerfil().then(setPerfil);
    }, []);

    useEffect(() => {
        if (!perfil) return;

        const cargarDatos = async () => {
            try {
                const [cursosData, entregasData, notifsData, statsData] = await Promise.all([
                    getMisCursos(),
                    listarMisEntregas(),
                    getMisNotificaciones(),
                    getEstadisticasAlumno(),
                ]);

                const entregadasIds = new Set(entregasData.map((e) => e.practica.id));
                const ahora = new Date();
                const pendientesArr: PracticaConCurso[] = [];
                const proximasArr: PracticaConCurso[] = [];

                cursosData.forEach((curso) => {
                    curso.practicas?.forEach((p) => {
                        const vencimiento = new Date(p.fechaEntrega);
                        const practicaExtendida: PracticaConCurso = {
                            ...p,
                            cursoId: curso.id,
                        };

                        if (!entregadasIds.has(p.id)) {
                            pendientesArr.push(practicaExtendida);
                            if (vencimiento > ahora) proximasArr.push(practicaExtendida);
                        }
                    });
                });

                // Ordenar por fecha de entrega
                proximasArr.sort((a, b) => new Date(a.fechaEntrega).getTime() - new Date(b.fechaEntrega).getTime());

                setCursos(cursosData);
                setEntregas(entregasData);
                setPendientes(pendientesArr);
                setProximas(proximasArr.slice(0, 5)); // Solo las 5 más próximas
                setNotificaciones(notifsData);
                setEstadisticas(statsData);
            } catch (error) {
                console.error("Error al cargar datos:", error);
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, [perfil]);

    if (!perfil || loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando tu dashboard...</p>
                </div>
            </div>
        );
    }

    const getNotaColor = (nota: number | null) => {
        if (nota === null) return "text-muted-foreground";
        if (nota >= 7) return "text-green-500";
        if (nota >= 5) return "text-yellow-500";
        return "text-red-500";
    };

    const getAsistenciaColor = (porcentaje: number) => {
        if (porcentaje >= 80) return "bg-green-500";
        if (porcentaje >= 60) return "bg-yellow-500";
        return "bg-red-500";
    };

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                        <AvatarImage src={perfil.avatarUrl || ""} />
                        <AvatarFallback className="text-xl">{perfil.nombre?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-2xl font-bold">Hola, {perfil.nombre}</h1>
                        <p className="text-sm text-muted-foreground">{perfil.email}</p>
                    </div>
                </div>
                <NotificacionesAlumno />
            </div>

            {/* Estadísticas principales */}
            {estadisticas && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-200 dark:border-blue-800">
                        <CardContent className="p-4 text-center">
                            <BookOpen className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                            <p className="text-3xl font-bold">{estadisticas.totalCursos}</p>
                            <p className="text-xs text-muted-foreground">Cursos</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-200 dark:border-green-800">
                        <CardContent className="p-4 text-center">
                            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                            <p className="text-3xl font-bold">{estadisticas.totalPracticasEntregadas}</p>
                            <p className="text-xs text-muted-foreground">Entregadas</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-200 dark:border-orange-800">
                        <CardContent className="p-4 text-center">
                            <Clock className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                            <p className="text-3xl font-bold">{estadisticas.totalPracticasPendientes}</p>
                            <p className="text-xs text-muted-foreground">Pendientes</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-200 dark:border-purple-800">
                        <CardContent className="p-4 text-center">
                            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                            <p className={`text-3xl font-bold ${getNotaColor(estadisticas.promedioGeneral)}`}>
                                {estadisticas.promedioGeneral !== null ? estadisticas.promedioGeneral.toFixed(1) : "-"}
                            </p>
                            <p className="text-xs text-muted-foreground">Promedio</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-200 dark:border-cyan-800">
                        <CardContent className="p-4 text-center">
                            <GraduationCap className="w-8 h-8 mx-auto mb-2 text-cyan-500" />
                            <p className="text-3xl font-bold">{estadisticas.porcentajeAsistenciaGlobal.toFixed(0)}%</p>
                            <p className="text-xs text-muted-foreground">Asistencia</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-200 dark:border-red-800">
                        <CardContent className="p-4 text-center">
                            <CalendarDays className="w-8 h-8 mx-auto mb-2 text-red-500" />
                            <p className="text-3xl font-bold">{estadisticas.totalExamenesPendientes}</p>
                            <p className="text-xs text-muted-foreground">Exámenes</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Grid de contenido principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna izquierda - Mis cursos (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Mis cursos con detalles */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5" />
                                Mis cursos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {estadisticas?.cursos.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-4 text-center">
                                    No estás inscrito en ningún curso.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {estadisticas?.cursos.map((curso) => (
                                        <Link
                                            key={curso.cursoId}
                                            href={`/curso/${curso.cursoId}`}
                                            className="block"
                                        >
                                            <div className="p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="font-medium">{curso.cursoNombre}</h3>
                                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                    <div>
                                                        <span className="text-muted-foreground">Nota:</span>
                                                        <span className={`ml-2 font-semibold ${getNotaColor(curso.notaActual)}`}>
                                                            {curso.notaActual !== null ? curso.notaActual.toFixed(1) : "-"}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Prácticas:</span>
                                                        <span className="ml-2">
                                                            {curso.practicasEntregadas}/{curso.practicasEntregadas + curso.practicasPendientes}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Exámenes:</span>
                                                        <span className="ml-2">{curso.examenesRealizados}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-muted-foreground">Asistencia:</span>
                                                        <div className="flex-1 max-w-16">
                                                            <Progress
                                                                value={curso.porcentajeAsistencia}
                                                                className="h-2"
                                                            />
                                                        </div>
                                                        <span className="text-xs">{curso.porcentajeAsistencia.toFixed(0)}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Últimas entregas */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <Send className="w-5 h-5" />
                                Últimas entregas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {entregas.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-4 text-center">
                                    No has entregado ninguna práctica.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {entregas.slice(0, 5).map((e) => (
                                        <div key={e.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{e.practica.titulo}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Entregada el {new Date(e.fechaEntrega).toLocaleDateString("es-ES")}
                                                </p>
                                            </div>
                                            <div className="ml-4">
                                                {e.nota !== null ? (
                                                    <Badge variant={e.nota >= 5 ? "default" : "destructive"}>
                                                        {e.nota.toFixed(1)}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary">Pendiente</Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Columna derecha (1/3) */}
                <div className="space-y-6">
                    {/* Próximas entregas */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-orange-500" />
                                Próximas entregas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {proximas.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-4 text-center">
                                    No hay entregas próximas
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {proximas.map((p) => {
                                        const diasRestantes = Math.ceil(
                                            (new Date(p.fechaEntrega).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                                        );
                                        return (
                                            <Link
                                                key={p.id}
                                                href={`/curso/${p.cursoId}/practicas`}
                                                className="block"
                                            >
                                                <div className="p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                                                    <p className="font-medium text-sm truncate">{p.titulo}</p>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(p.fechaEntrega).toLocaleDateString("es-ES")}
                                                        </span>
                                                        <Badge
                                                            variant={diasRestantes <= 2 ? "destructive" : diasRestantes <= 7 ? "secondary" : "outline"}
                                                            className="text-xs"
                                                        >
                                                            {diasRestantes} días
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Notificaciones recientes */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="w-5 h-5" />
                                Notificaciones
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {notificaciones.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-4 text-center">
                                    Sin notificaciones
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {notificaciones.slice(0, 5).map((n) => (
                                        <div key={n.id} className={`p-3 rounded-lg ${n.leida ? "bg-accent/30" : "bg-primary/10 border border-primary/20"}`}>
                                            <p className="text-sm">{n.mensaje}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {new Date(n.fecha).toLocaleDateString("es-ES", {
                                                    day: "numeric",
                                                    month: "short",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
