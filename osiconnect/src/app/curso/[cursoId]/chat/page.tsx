"use client";

import { useParams } from "next/navigation";
import { useAuthStore } from "@/hooks/authStore";
import UnifiedChat from "@/components/common/UnifiedChat";

export default function ChatCursoPage() {
    const params = useParams();
    const cursoId = params.cursoId as string;
    const usuario = useAuthStore((state) => state.usuario);

    if (!usuario) {
        return <div>Cargando...</div>;
    }

    return (
        <div className="h-[calc(100vh-4rem)] p-4">
            <UnifiedChat
                cursoId={cursoId}
                usuarioId={usuario.id}
                usuarioNombre={usuario.nombre}
                fullPage={true}
            />
        </div>
    );
}
