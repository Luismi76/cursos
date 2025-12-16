"use client";

import { useParams } from "next/navigation";
import { useAuthStore } from "@/hooks/authStore";

export default function AsistenciaPage() {
    const params = useParams();
    const cursoId = params.cursoId as string;
    const usuario = useAuthStore((state) => state.usuario);
    const esProfesor = usuario?.rol === "PROFESOR";

    return (
        <div className="p-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Asistencia</h1>

                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
                    <p className="text-muted-foreground mb-6">
                        {esProfesor
                            ? "Registra y gestiona la asistencia de los alumnos."
                            : "Consulta tu registro de asistencia."}
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2">Fecha</th>
                                    <th className="text-left p-2">Estado</th>
                                    <th className="text-left p-2">Observaciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="p-2">15/12/2025</td>
                                    <td className="p-2">
                                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                                            ✓ Presente
                                        </span>
                                    </td>
                                    <td className="p-2 text-sm text-muted-foreground">-</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-2">14/12/2025</td>
                                    <td className="p-2">
                                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                                            ✓ Presente
                                        </span>
                                    </td>
                                    <td className="p-2 text-sm text-muted-foreground">-</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-2">13/12/2025</td>
                                    <td className="p-2">
                                        <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                                            ⚠ Retraso
                                        </span>
                                    </td>
                                    <td className="p-2 text-sm text-muted-foreground">15 minutos</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {!esProfesor && (
                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                📊 Asistencia total: 95% (19 de 20 clases)
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
