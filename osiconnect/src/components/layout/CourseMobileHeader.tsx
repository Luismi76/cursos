"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    BookOpen,
    FileText,
    MessageSquare,
    BookMarked,
    Calendar,
    Users,
    ClipboardList
} from "lucide-react";
import { useRol } from "@/hooks/useRol";

interface CourseMobileHeaderProps {
    cursoId: string;
}

export function CourseMobileHeader({ cursoId }: CourseMobileHeaderProps) {
    const pathname = usePathname();
    const rol = useRol();

    const tabs = [
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
            name: "Asistencia",
            href: `/curso/${cursoId}/asistencia`,
            icon: Calendar,
            show: true,
        },
        {
            name: "Alumnos",
            href: `/curso/${cursoId}/alumnos`,
            icon: Users,
            show: rol === "PROFESOR",
        },
    ];

    const filteredTabs = tabs.filter(t => t.show);

    return (
        <div className="md:hidden sticky top-14 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b overflow-x-auto no-scrollbar">
            <div className="flex items-center px-4 h-12 gap-6 min-w-max">
                {filteredTabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={cn(
                                "flex items-center gap-2 text-sm font-medium transition-colors relative h-full",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.name}
                            {isActive && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
