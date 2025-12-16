"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { ArrowLeft, MessageCircle, MessageSquare, Book } from "lucide-react";
import { UserDropdown } from "@/components/ui/UserDropdown";
import {
  getMensajesNoLeidos,
  marcarMensajesCursoComoLeidos,
} from "@/services/chatCursoService";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/hooks/authStore";
import { AppSidebar } from "./AppSidebar";
import { NotificacionesGlobales } from "@/components/common/NotificacionesGlobales";
import UnifiedChat from "@/components/common/UnifiedChat";
import { ThemeToggle } from "@/components/theme/ThemeToggle";


export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { setUser } = useAuthStore();
  const usuario = useAuthStore((state) => state.usuario);
  const rol = usuario?.rol;
  const match = pathname.match(/\/curso\/([^/]+)/);
  const cursoId = match?.[1];

  const [noLeidos, setNoLeidos] = useState<number>(0);

  // Recuperar sesión al recargar
  useEffect(() => {
    // Intentar cargar perfil si no hay usuario en store
    if (!usuario) {
      import("@/services/api").then(({ api }) => {
        api.get("/usuarios/perfil")
          .then((res) => setUser(res.data))
          .catch(() => {
            // Si falla, redirigir a login
            router.replace("/login");
          });
      });
    }
  }, [usuario, setUser, router]);

  useEffect(() => {
    if (!cursoId) return;

    const cargarNoLeidos = async () => {
      const sinLeer = await getMensajesNoLeidos(cursoId);
      setNoLeidos(sinLeer);
    };

    cargarNoLeidos();
    const interval = setInterval(cargarNoLeidos, 10000);
    return () => clearInterval(interval);
  }, [cursoId]);

  const esInicio =
    pathname === "/alumno" ||
    pathname === "/profesor" ||
    pathname === "/dashboard" ||
    pathname === "/admin";

  const home =
    rol === "ALUMNO"
      ? "/alumno"
      : rol === "PROFESOR"
        ? "/profesor"
        : rol === "ADMINISTRADOR"
          ? "/admin"
          : "/";

  return (
    <div className="min-h-screen flex">
      {/* Sidebar (Desktop & Mobile) */}
      <AppSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b w-full px-6 py-3 flex items-center justify-between h-16">
          <div className="flex items-center gap-4 ml-10 md:ml-0">
            {/* Espacio reservado para el trigger movil que está 'fixed' */}
            {!esInicio && (
              <button
                onClick={() => router.back()}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Volver
              </button>
            )}
            {cursoId && <span className="text-sm font-medium text-muted-foreground hidden sm:inline-block">/ Curso Actual</span>}
          </div>

          <div className="flex items-center gap-4">
            {cursoId && (
              <>
                <Link
                  href={`/curso/${cursoId}/chat`}
                  className="relative text-muted-foreground hover:text-primary transition"
                  title="Chat del curso"
                >
                  <MessageSquare className="w-6 h-6" />
                  {noLeidos > 0 && (
                    <Badge className="absolute -top-1 -right-1 text-[10px] h-4 px-1.5 bg-red-500 text-white">
                      {noLeidos}
                    </Badge>
                  )}
                </Link>

                <Link
                  href={`/curso/${cursoId}/wiki`}
                  className="text-sm text-muted-foreground hover:text-primary transition"
                  title="Wiki del curso"
                >
                  <Book className="w-6 h-6" />
                </Link>
              </>
            )}
            <ThemeToggle />
            <NotificacionesGlobales />
            <UserDropdown user={usuario} />
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>

      <Toaster />
    </div>
  );
}

