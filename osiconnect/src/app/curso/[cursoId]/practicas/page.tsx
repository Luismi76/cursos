"use client";

import { useParams } from "next/navigation";
import { useAuthStore } from "@/hooks/authStore";

export default function PracticasPage() {
    const params = useParams();
    const cursoId = params.cursoId as string;
    const usuario = useAuthStore((state) => state.usuario);
    const esProfesor = usuario?.rol === "PROFESOR";

    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Prácticas</h1>

                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
                    <p className="text-muted-foreground mb-4">
                        {esProfesor
                            ? "Gestiona las prácticas del curso, crea nuevas actividades y revisa entregas."
                            : "Consulta las prácticas asignadas y envía tus entregas."}
                    </p>

                    <div className="space-y-4">
                        <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold">✏️ Práctica 1</h3>
                                <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                                    Pendiente
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">Descripción de la práctica</p>
                            <p className="text-xs text-muted-foreground mt-2">Fecha límite: 20/12/2025</p>
                        </div>

                        <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold">✏️ Práctica 2</h3>
                                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                                    Entregada
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">Descripción de la práctica</p>
                            <p className="text-xs text-muted-foreground mt-2">Calificación: 8.5</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
