"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    BookOpen,
    FileText,
    ClipboardList,
    Calendar,
    MessageSquare,
    BookMarked,
    Users,
    ArrowLeft,
} from "lucide-react";
import { useRol } from "@/hooks/useRol";
import { useEffect, useState } from "react";

interface CourseSidebarProps {
    cursoId: string;
    onNavigate?: () => void;
}

export function CourseSidebar({ cursoId, onNavigate }: CourseSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const rol = useRol();
    const [cursoNombre, setCursoNombre] = useState<string>("Curso");

    // Cargar nombre del curso
    useEffect(() => {
        import("@/services/cursoService").then(({ getCursoById }) => {
            getCursoById(cursoId)
                .then((curso) => setCursoNombre(curso.nombre))
                .catch(() => setCursoNombre("Curso"));
        });
    }, [cursoId]);

    const navigation = [
        {
            name: "Temario",
            href: `/curso/${cursoId}/temario`,
            icon: BookOpen,
            show: true,
        },
        {
            name: "Prácticas",
            href: `/curso/${cursoId}/practicas`,
            icon: FileText,
            show: true,
        },
        {
            name: "Exámenes",
            href: `/curso/${cursoId}/examenes`,
            icon: ClipboardList,
            show: true,
        },
        {
            name: "Asistencia",
            href: `/curso/${cursoId}/asistencia`,
            icon: Calendar,
            show: true,
        },
        {
            name: "Chat",
            href: `/curso/${cursoId}/chat`,
            icon: MessageSquare,
            show: true,
        },
        {
            name: "Wiki",
            href: `/curso/${cursoId}/wiki`,
            icon: BookMarked,
            show: true,
        },
        {
            name: "Alumnos",
            href: `/curso/${cursoId}/alumnos`,
            icon: Users,
            show: rol === "PROFESOR",
        },
    ];

    const filteredNav = navigation.filter((item) => item.show);

    const handleBack = () => {
        const backRoute =
            rol === "PROFESOR"
                ? "/profesor/curso"
                : rol === "ALUMNO"
                    ? "/alumno/mis-cursos"
                    : "/";
        router.push(backRoute);
    };

    return (
        <div className="flex flex-col h-full py-4">
            {/* Header */}
            <div className="px-3 py-2 border-b mb-2">
                <Button
                    variant="ghost"
                    className="w-full justify-start mb-2"
                    onClick={handleBack}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a Mis Cursos
                </Button>
                <h2 className="px-4 text-sm font-semibold text-muted-foreground truncate">
                    {cursoNombre}
                </h2>
            </div>

            {/* Navigation */}
            <div className="px-3 flex-1 overflow-y-auto">
                <div className="space-y-1">
                    {filteredNav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onNavigate}
                        >
                            <Button
                                variant={pathname === item.href ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start",
                                    pathname === item.href && "bg-secondary"
                                )}
                            >
                                <item.icon className="mr-2 h-4 w-4" />
                                {item.name}
                            </Button>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Footer info */}
            <div className="px-3 py-2 border-t mt-auto">
                <p className="text-xs text-muted-foreground text-center">
                    Navegación del curso
                </p>
            </div>
        </div>
    );
}
