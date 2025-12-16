"use client";

import { useParams } from "next/navigation";
import { useAuthStore } from "@/hooks/authStore";

export default function TemarioPage() {
    const params = useParams();
    const cursoId = params.cursoId as string;
    const usuario = useAuthStore((state) => state.usuario);

    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Temario del Curso</h1>

                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
                    <p className="text-muted-foreground mb-4">
                        Aquí se mostrarán los materiales del curso, documentos, y recursos de aprendizaje.
                    </p>

                    <div className="space-y-4">
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold mb-2">📚 Módulo 1</h3>
                            <p className="text-sm text-muted-foreground">Contenido del primer módulo</p>
                        </div>

                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold mb-2">📚 Módulo 2</h3>
                            <p className="text-sm text-muted-foreground">Contenido del segundo módulo</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
