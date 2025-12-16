"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
    LayoutDashboard,
    BookOpen,
    Settings,
    Menu,
    GraduationCap,
    Users,
    FileBarChart,
} from "lucide-react";
import { useAuthStore } from "@/hooks/authStore";
import { useState } from "react";
import { UserDropdown } from "@/components/ui/UserDropdown";
import { CourseSidebar } from "./CourseSidebar";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function AppSidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const usuario = useAuthStore((state) => state.usuario);
    const rol = usuario?.rol;
    const [open, setOpen] = useState(false);

    // Detect if we're in a course context
    const cursoMatch = pathname.match(/\/curso\/([^/]+)/);
    const cursoId = cursoMatch?.[1];
    const isInCourse = !!cursoId;

    // Global navigation (when NOT in a course)
    const globalNavigation = [
        {
            name: "Dashboard",
            href: rol === 'PROFESOR' ? '/profesor' : rol === 'ALUMNO' ? '/alumno' : '/admin',
            icon: LayoutDashboard,
            show: true
        },
        {
            name: "Mis Cursos",
            href: rol === 'PROFESOR' ? '/profesor/curso' : '/alumno/mis-cursos',
            icon: BookOpen,
            show: rol !== 'ADMINISTRADOR'
        },
        {
            name: "Mis Notas",
            href: "/alumno/notas",
            icon: FileBarChart,
            show: rol === 'ALUMNO'
        },
        {
            name: "Usuarios",
            href: "/admin/usuarios",
            icon: Users,
            show: rol === 'ADMINISTRADOR'
        },
        {
            name: "Cursos",
            href: "/admin/curso",
            icon: GraduationCap,
            show: rol === 'ADMINISTRADOR'
        },
        {
            name: "Ajustes",
            href: rol === 'PROFESOR' ? '/profesor/settings' : rol === 'ALUMNO' ? '/alumno/settings' : '/admin/settings',
            icon: Settings,
            show: true
        }
    ];

    const filteredGlobalNav = globalNavigation.filter(item => item.show);

    const GlobalSidebarContent = () => (
        <div className="flex flex-col h-full py-4">
            <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                    SysConnect
                </h2>
                <div className="space-y-1">
                    {filteredGlobalNav.map((item) => (
                        <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
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
            <div className="mt-auto px-3 py-2">
                <div className="flex items-center gap-2 px-4 py-2">
                    <UserDropdown />
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Trigger */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" className="md:hidden fixed top-3 left-4 z-50">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                    {isInCourse && cursoId ? (
                        <CourseSidebar cursoId={cursoId} onNavigate={() => setOpen(false)} />
                    ) : (
                        <GlobalSidebarContent />
                    )}
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar */}
            <div className={cn("hidden border-r bg-background md:block w-64 fixed h-full", className)}>
                {isInCourse && cursoId ? (
                    <CourseSidebar cursoId={cursoId} />
                ) : (
                    <GlobalSidebarContent />
                )}
            </div>
        </>
    );
}
