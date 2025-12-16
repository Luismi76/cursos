"use client";

import { useAuthStore } from "@/hooks/authStore";

export default function NotasPage() {
    const usuario = useAuthStore((state) => state.usuario);

    return (
        <div className="p-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Mis Notas</h1>

                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
                    <p className="text-muted-foreground mb-6">
                        Resumen de todas tus calificaciones en los cursos matriculados.
                    </p>

                    <div className="space-y-6">
                        {/* Curso 1 */}
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold text-lg mb-4">Programación Web</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Prácticas</p>
                                    <p className="text-2xl font-bold">8.5</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Exámenes</p>
                                    <p className="text-2xl font-bold">7.8</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Nota Final</p>
                                    <p className="text-2xl font-bold text-primary">8.2</p>
                                </div>
                            </div>
                        </div>

                        {/* Curso 2 */}
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold text-lg mb-4">Bases de Datos</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Prácticas</p>
                                    <p className="text-2xl font-bold">9.0</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Exámenes</p>
                                    <p className="text-2xl font-bold">8.5</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Nota Final</p>
                                    <p className="text-2xl font-bold text-primary">8.8</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Promedio general */}
                    <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold">Promedio General</span>
                            <span className="text-3xl font-bold text-primary">8.5</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
