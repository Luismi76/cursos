"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/authStore";
import { getMisCursos } from "@/services/alumnosService";
import { getCursosProfesor } from "@/services/profesorService";
import { Curso } from "@/lib/types";
import { BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function WikiIndexPage() {
    const router = useRouter();
    const usuario = useAuthStore((state) => state.usuario);
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarCursos();
    }, [usuario]);

    const cargarCursos = async () => {
        try {
            setLoading(true);
            if (usuario?.rol === "ALUMNO") {
                const data = await getMisCursos();
                setCursos(data);
            } else if (usuario?.rol === "PROFESOR") {
                const data = await getCursosProfesor();
                setCursos(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Si solo hay un curso, redirigir directamente
    useEffect(() => {
        if (!loading && cursos.length === 1) {
            router.replace(`/curso/${cursos[0].id}/wiki`);
        }
    }, [loading, cursos, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-muted-foreground">Cargando...</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <BookOpen className="h-8 w-8" />
                    <h1 className="text-3xl font-bold">Wiki del Curso</h1>
                </div>

                {cursos.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-8 text-center">
                        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                            No estás inscrito en ningún curso.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-muted-foreground">
                            Selecciona un curso para acceder a su wiki:
                        </p>
                        {cursos.map((curso) => (
                            <Link
                                key={curso.id}
                                href={`/curso/${curso.id}/wiki`}
                                className="block bg-white dark:bg-zinc-900 rounded-lg shadow p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold">{curso.nombre}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {curso.descripcion}
                                        </p>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
