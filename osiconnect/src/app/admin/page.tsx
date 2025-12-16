"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    crearCurso,
    listarCursos,
    getEstadisticasSistema,
    EstadisticasSistemaDTO,
} from "@/services/adminService";
import { CursoDTO } from "@/lib/types";
import Link from "next/link";
import { useAuthStore } from "@/hooks/authStore";
import {
    Users,
    BookOpen,
    GraduationCap,
    FileText,
    Calendar,
    ClipboardCheck,
    Settings,
    Plus,
    ArrowRight,
    Shield,
    TrendingUp,
    AlertCircle,
} from "lucide-react";

export default function AdminPage() {
    const router = useRouter();
    const usuario = useAuthStore((state) => state.usuario);
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [loading, setLoading] = useState(false);
    const [cursos, setCursos] = useState<CursoDTO[]>([]);
    const [estadisticas, setEstadisticas] = useState<EstadisticasSistemaDTO | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        if (usuario && usuario.rol !== "ADMINISTRADOR") {
            const redirectTo = usuario.rol === "PROFESOR" ? "/profesor" : "/alumno";
            router.replace(redirectTo);
        }
    }, [usuario, router]);

    useEffect(() => {
        if (usuario?.rol === "ADMINISTRADOR") {
            cargarDatos();
        }
    }, [usuario]);

    const cargarDatos = async () => {
        try {
            setLoadingStats(true);
            const [cursosData, statsData] = await Promise.all([
                listarCursos(),
                getEstadisticasSistema(),
            ]);
            setCursos(cursosData);
            setEstadisticas(statsData);
        } catch (error) {
            toast.error("Error al cargar los datos");
        } finally {
            setLoadingStats(false);
        }
    };

    const handleCrearCurso = async () => {
        if (!nombre.trim() || !descripcion.trim()) {
            toast.warning("Rellena todos los campos");
            return;
        }

        try {
            setLoading(true);
            const nuevo = await crearCurso({ nombre, descripcion });
            toast.success("Curso creado correctamente");
            router.push(`/admin/curso/${nuevo.id}`);
        } catch {
            toast.error("Error al crear el curso");
        } finally {
            setLoading(false);
        }
    };

    if (!usuario || usuario.rol !== "ADMINISTRADOR") {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-muted-foreground">Redirigiendo...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Shield className="h-8 w-8" />
                    <h1 className="text-3xl font-bold">Panel de Administración</h1>
                </div>
                <Link href="/admin/usuarios">
                    <Button variant="outline">
                        <Users className="h-4 w-4 mr-2" />
                        Gestionar Usuarios
                    </Button>
                </Link>
            </div>

            {/* Estadísticas del sistema */}
            {loadingStats ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-24 bg-muted rounded-lg animate-pulse"></div>
                    ))}
                </div>
            ) : estadisticas && (
                <>
                    {/* Primera fila: Usuarios */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                                <Users className="h-4 w-4" />
                                Total Usuarios
                            </div>
                            <div className="text-3xl font-bold">{estadisticas.totalUsuarios}</div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                                <GraduationCap className="h-4 w-4" />
                                Alumnos
                            </div>
                            <div className="text-3xl font-bold text-blue-600">{estadisticas.totalAlumnos}</div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                                <BookOpen className="h-4 w-4" />
                                Profesores
                            </div>
                            <div className="text-3xl font-bold text-green-600">{estadisticas.totalProfesores}</div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                                <Shield className="h-4 w-4" />
                                Administradores
                            </div>
                            <div className="text-3xl font-bold text-purple-600">{estadisticas.totalAdministradores}</div>
                        </div>
                    </div>

                    {/* Segunda fila: Cursos y contenido */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                                <BookOpen className="h-4 w-4" />
                                Total Cursos
                            </div>
                            <div className="text-2xl font-bold">{estadisticas.totalCursos}</div>
                            <div className="text-xs text-muted-foreground">
                                {estadisticas.cursosActivos} activos
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                                <FileText className="h-4 w-4" />
                                Prácticas
                            </div>
                            <div className="text-2xl font-bold">{estadisticas.totalPracticas}</div>
                            <div className="text-xs text-muted-foreground">
                                {estadisticas.entregasTotales} entregas
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                                <Calendar className="h-4 w-4" />
                                Exámenes
                            </div>
                            <div className="text-2xl font-bold">{estadisticas.totalExamenes}</div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                                <ClipboardCheck className="h-4 w-4" />
                                Asistencia Media
                            </div>
                            <div className={`text-2xl font-bold ${estadisticas.asistenciaMedia >= 80 ? "text-green-600" : estadisticas.asistenciaMedia >= 60 ? "text-yellow-600" : "text-red-600"}`}>
                                {estadisticas.asistenciaMedia > 0 ? `${estadisticas.asistenciaMedia.toFixed(0)}%` : "-"}
                            </div>
                        </div>
                    </div>

                    {/* Alerta de entregas pendientes */}
                    {estadisticas.entregasPendientes > 0 && (
                        <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-orange-500" />
                                <span className="font-medium text-orange-700 dark:text-orange-300">
                                    Hay {estadisticas.entregasPendientes} entrega{estadisticas.entregasPendientes !== 1 ? "s" : ""} pendiente{estadisticas.entregasPendientes !== 1 ? "s" : ""} de calificar en el sistema
                                </span>
                            </div>
                        </div>
                    )}
                </>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                {/* Crear nuevo curso */}
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Crear nuevo curso
                    </h2>
                    <div className="space-y-3">
                        <Input
                            placeholder="Nombre del curso"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                        />
                        <Textarea
                            placeholder="Descripción del curso"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                        />
                        <Button onClick={handleCrearCurso} disabled={loading} className="w-full">
                            {loading ? "Creando..." : "Crear curso"}
                        </Button>
                    </div>
                </div>

                {/* Accesos rápidos */}
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Accesos rápidos
                    </h2>
                    <div className="space-y-3">
                        <Link href="/admin/usuarios" className="block">
                            <div className="p-3 border rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <p className="font-medium">Gestión de Usuarios</p>
                                        <p className="text-sm text-muted-foreground">
                                            Crear, editar y eliminar usuarios
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Lista de cursos */}
            <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Cursos existentes ({cursos.length})
                </h2>

                {cursos.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-8 text-center">
                        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No hay cursos creados todavía.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {cursos.map((curso) => (
                            <div
                                key={curso.id}
                                className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{curso.nombre}</h3>
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                            {curso.descripcion}
                                        </p>
                                        <div className="flex items-center gap-3 mt-3">
                                            <Badge variant="outline">
                                                <Users className="h-3 w-3 mr-1" />
                                                {curso.alumnos?.length || 0} alumnos
                                            </Badge>
                                            <Badge variant="outline">
                                                <BookOpen className="h-3 w-3 mr-1" />
                                                {curso.modulos?.length || 0} módulos
                                            </Badge>
                                        </div>
                                    </div>
                                    <Link href={`/admin/curso/${curso.id}`}>
                                        <Button variant="secondary" size="sm">
                                            Administrar
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
