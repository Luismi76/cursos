"use client";

import { useParams } from "next/navigation";
import { useAuthStore } from "@/hooks/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AlumnosPage() {
    const params = useParams();
    const cursoId = params.cursoId as string;
    const usuario = useAuthStore((state) => state.usuario);
    const router = useRouter();

    // Redirect if not professor
    useEffect(() => {
        if (usuario && usuario.rol !== "PROFESOR") {
            router.push(`/curso/${cursoId}/temario`);
        }
    }, [usuario, router, cursoId]);

    if (!usuario || usuario.rol !== "PROFESOR") {
        return null;
    }

    return (
        <div className="p-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Gestión de Alumnos</h1>

                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
                    <p className="text-muted-foreground mb-6">
                        Lista de alumnos matriculados y gestión de calificaciones.
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2">Alumno</th>
                                    <th className="text-left p-2">Email</th>
                                    <th className="text-left p-2">Asistencia</th>
                                    <th className="text-left p-2">Prácticas</th>
                                    <th className="text-left p-2">Exámenes</th>
                                    <th className="text-left p-2">Nota Final</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b hover:bg-muted/50">
                                    <td className="p-2 font-medium">Juan Pérez</td>
                                    <td className="p-2 text-sm text-muted-foreground">juan@example.com</td>
                                    <td className="p-2 text-sm">95%</td>
                                    <td className="p-2 text-sm">8.5</td>
                                    <td className="p-2 text-sm">7.8</td>
                                    <td className="p-2 text-sm font-semibold">8.2</td>
                                </tr>
                                <tr className="border-b hover:bg-muted/50">
                                    <td className="p-2 font-medium">María García</td>
                                    <td className="p-2 text-sm text-muted-foreground">maria@example.com</td>
                                    <td className="p-2 text-sm">100%</td>
                                    <td className="p-2 text-sm">9.2</td>
                                    <td className="p-2 text-sm">9.0</td>
                                    <td className="p-2 text-sm font-semibold">9.1</td>
                                </tr>
                                <tr className="border-b hover:bg-muted/50">
                                    <td className="p-2 font-medium">Carlos López</td>
                                    <td className="p-2 text-sm text-muted-foreground">carlos@example.com</td>
                                    <td className="p-2 text-sm">88%</td>
                                    <td className="p-2 text-sm">7.0</td>
                                    <td className="p-2 text-sm">6.5</td>
                                    <td className="p-2 text-sm font-semibold">6.8</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
