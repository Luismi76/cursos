"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/authStore";

export default function NotasRedirectPage() {
    const router = useRouter();
    const usuario = useAuthStore((state) => state.usuario);

    useEffect(() => {
        if (usuario?.rol === "ALUMNO") {
            router.replace("/alumno/notas");
        } else if (usuario?.rol === "PROFESOR") {
            router.replace("/profesor");
        } else {
            router.replace("/");
        }
    }, [usuario, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-muted-foreground">Redirigiendo...</p>
        </div>
    );
}
