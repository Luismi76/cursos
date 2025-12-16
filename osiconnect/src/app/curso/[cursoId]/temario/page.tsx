"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getCursoById } from "@/services/cursoService";
import { CursoDTO, ModuloDTO, UnidadFormativaDTO } from "@/lib/types";
import { toast } from "sonner";
import {
    BookOpen,
    ChevronDown,
    ChevronRight,
    Calendar,
    FileText,
    GraduationCap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TemarioPage() {
    const params = useParams();
    const cursoId = params.cursoId as string;
    const [curso, setCurso] = useState<CursoDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedModulos, setExpandedModulos] = useState<Set<string>>(new Set());

    useEffect(() => {
        cargarCurso();
    }, [cursoId]);

    const cargarCurso = async () => {
        try {
            setLoading(true);
            const data = await getCursoById(cursoId);
            setCurso(data);
            // Expandir todos los módulos por defecto
            if (data.modulos) {
                setExpandedModulos(new Set(data.modulos.map(m => m.id || "")));
            }
        } catch (error) {
            toast.error("Error al cargar el temario del curso");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleModulo = (moduloId: string) => {
        setExpandedModulos(prev => {
            const next = new Set(prev);
            if (next.has(moduloId)) {
                next.delete(moduloId);
            } else {
                next.add(moduloId);
            }
            return next;
        });
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return null;
        return new Date(dateStr).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const getModuloStatus = (modulo: ModuloDTO) => {
        const now = new Date();
        const inicio = modulo.fechaInicio ? new Date(modulo.fechaInicio) : null;
        const fin = modulo.fechaFin ? new Date(modulo.fechaFin) : null;

        if (!inicio || !fin) return null;

        if (now < inicio) {
            return <Badge variant="outline">Próximamente</Badge>;
        } else if (now > fin) {
            return <Badge className="bg-green-500">Completado</Badge>;
        } else {
            return <Badge className="bg-blue-500">En curso</Badge>;
        }
    };

    const getUnidadStatus = (unidad: UnidadFormativaDTO) => {
        const now = new Date();
        const inicio = unidad.fechaInicio ? new Date(unidad.fechaInicio) : null;
        const fin = unidad.fechaFin ? new Date(unidad.fechaFin) : null;

        if (!inicio || !fin) return null;

        if (now < inicio) {
            return <Badge variant="outline" className="text-xs">Próximamente</Badge>;
        } else if (now > fin) {
            return <Badge className="bg-green-500 text-xs">Completado</Badge>;
        } else {
            return <Badge className="bg-blue-500 text-xs">En curso</Badge>;
        }
    };

    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <BookOpen className="h-8 w-8" />
                    <div>
                        <h1 className="text-3xl font-bold">Temario del Curso</h1>
                        {curso && (
                            <p className="text-muted-foreground">{curso.nombre}</p>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-muted-foreground">
                        Cargando temario...
                    </div>
                ) : !curso ? (
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-8 text-center text-muted-foreground">
                        No se pudo cargar el curso
                    </div>
                ) : curso.modulos.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-8 text-center">
                        <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                            Este curso aún no tiene módulos definidos.
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            El profesor añadirá el contenido próximamente.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Resumen */}
                        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg shadow p-4 mb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    <span className="font-medium">
                                        {curso.modulos.length} módulo{curso.modulos.length !== 1 ? "s" : ""}
                                    </span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {curso.modulos.reduce((acc, m) => acc + (m.unidades?.length || 0), 0)} unidades formativas
                                </div>
                            </div>
                        </div>

                        {/* Lista de módulos */}
                        {curso.modulos.map((modulo, index) => (
                            <div
                                key={modulo.id || index}
                                className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden"
                            >
                                {/* Cabecera del módulo */}
                                <button
                                    onClick={() => toggleModulo(modulo.id || String(index))}
                                    className="w-full p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-primary/10 p-2 rounded-lg">
                                            {expandedModulos.has(modulo.id || String(index)) ? (
                                                <ChevronDown className="h-5 w-5 text-primary" />
                                            ) : (
                                                <ChevronRight className="h-5 w-5 text-primary" />
                                            )}
                                        </div>
                                        <div className="text-left">
                                            <div className="font-semibold flex items-center gap-2">
                                                Módulo {index + 1}: {modulo.nombre}
                                                {getModuloStatus(modulo)}
                                            </div>
                                            {(modulo.fechaInicio || modulo.fechaFin) && (
                                                <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(modulo.fechaInicio)} - {formatDate(modulo.fechaFin)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {modulo.unidades?.length || 0} unidad{(modulo.unidades?.length || 0) !== 1 ? "es" : ""}
                                    </div>
                                </button>

                                {/* Contenido del módulo (unidades) */}
                                {expandedModulos.has(modulo.id || String(index)) && (
                                    <div className="border-t">
                                        {!modulo.unidades || modulo.unidades.length === 0 ? (
                                            <div className="p-4 text-sm text-muted-foreground text-center">
                                                Este módulo aún no tiene unidades definidas.
                                            </div>
                                        ) : (
                                            <div className="divide-y">
                                                {modulo.unidades.map((unidad, uIndex) => (
                                                    <div
                                                        key={unidad.id || uIndex}
                                                        className="p-4 pl-16 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-medium">
                                                                {uIndex + 1}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium flex items-center gap-2">
                                                                    {unidad.nombre}
                                                                    {getUnidadStatus(unidad)}
                                                                </div>
                                                                {(unidad.fechaInicio || unidad.fechaFin) && (
                                                                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                                        <Calendar className="h-3 w-3" />
                                                                        {formatDate(unidad.fechaInicio)} - {formatDate(unidad.fechaFin)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
