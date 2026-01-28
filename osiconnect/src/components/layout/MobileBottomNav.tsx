"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    GraduationCap,
    BookOpen,
    User
} from "lucide-react";
// import { useAuthStore } from "@/hooks/authStore";
import { useRol } from "@/hooks/useRol";

export function MobileBottomNav() {
    const pathname = usePathname();
    const rol = useRol();

    // Hide if in specific full-screen flows if needed, currenty simple check
    const isHidden = false;

    if (isHidden) return null;

    const navigation = [
        {
            name: "Inicio",
            href: rol === 'PROFESOR' ? '/profesor' : rol === 'ALUMNO' ? '/alumno' : '/admin',
            icon: LayoutDashboard,
        },
        {
            name: "Cursos",
            href: rol === 'PROFESOR' ? '/profesor' : '/alumno/mis-cursos',
            icon: BookOpen,
            show: rol !== 'ADMINISTRADOR'
        },
        {
            name: "Admin",
            href: "/admin/curso",
            icon: GraduationCap,
            show: rol === 'ADMINISTRADOR'
        },
        {
            name: "Perfil",
            href: rol === 'PROFESOR' ? '/profesor/settings' : rol === 'ALUMNO' ? '/alumno/settings' : '/admin/settings',
            icon: User,
        },
    ];

    const filteredNav = navigation.filter(item => item.show !== false);

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border/50 pb-safe">
            <div className="flex items-center justify-around h-16">
                {filteredNav.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", isActive && "fill-current/20")} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
