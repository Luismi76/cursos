"use client";

import { useParams } from "next/navigation";
import { useAuthStore } from "@/hooks/authStore";

export default function ExamenesPage() {
    const params = useParams();
    const cursoId = params.cursoId as string;
    const usuario = useAuthStore((state) => state.usuario);
    const esProfesor = usuario?.rol === "PROFESOR";

    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Exámenes</h1>

                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
                    <p className="text-muted-foreground mb-4">
                        {esProfesor
                            ? "Gestiona los exámenes del curso, programa fechas y registra calificaciones."
                            : "Consulta las fechas de exámenes y tus calificaciones."}
                    </p>

                    <div className="space-y-4">
                        <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold">📝 Examen Parcial 1</h3>
                                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                    Próximo
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">Temas 1-5</p>
                            <p className="text-xs text-muted-foreground mt-2">📅 Fecha: 22/12/2025</p>
                        </div>

                        <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold">📝 Examen Final</h3>
                                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">
                                    Programado
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">Todos los temas</p>
                            <p className="text-xs text-muted-foreground mt-2">📅 Fecha: 15/01/2026</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
