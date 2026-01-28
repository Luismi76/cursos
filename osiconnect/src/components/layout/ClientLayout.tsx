"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { ArrowLeft, MessageSquare, Book } from "lucide-react";
import { UserDropdown } from "@/components/ui/UserDropdown";
import { getMensajesNoLeidos } from "@/services/chatCursoService";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/hooks/authStore";
import { AppSidebar } from "./AppSidebar";
import { MobileBottomNav } from "./MobileBottomNav"; // Import
import { NotificacionesGlobales } from "@/components/common/NotificacionesGlobales";
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
  // const rol = usuario?.rol; // Unused
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

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar (Desktop Only now mostly, mobile handled by BottomNav) */}
      <AppSidebar className="hidden md:block" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300 mb-16 md:mb-0">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b w-full px-4 py-3 flex items-center justify-between h-14 md:h-16">
          <div className="flex items-center gap-4">
            {/* Back Button Logic */}
            {!esInicio && (
              <button
                onClick={() => router.back()}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Volver</span>
              </button>
            )}
            {cursoId && <span className="text-sm font-medium text-muted-foreground hidden sm:inline-block">/ Curso Actual</span>}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Icons */}
            {cursoId && (
              <>
                <Link
                  href={`/curso/${cursoId}/chat`}
                  className="relative text-muted-foreground hover:text-primary transition p-2"
                >
                  <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
                  {noLeidos > 0 && (
                    <Badge className="absolute -top-1 -right-1 text-[10px] h-4 px-1.5 bg-red-500 text-white">
                      {noLeidos}
                    </Badge>
                  )}
                </Link>

                <Link
                  href={`/curso/${cursoId}/wiki`}
                  className="text-sm text-muted-foreground hover:text-primary transition p-2"
                >
                  <Book className="w-5 h-5 md:w-6 md:h-6" />
                </Link>
              </>
            )}
            <ThemeToggle />
            <NotificacionesGlobales />
            <div className="hidden md:block">
              <UserDropdown />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>

      <MobileBottomNav />
      <Toaster />
    </div>
  );
}
