"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/authStore";
import AvatarAmpliable from "@/components/common/AvatarAmpliable";

export function UserDropdown() {
  const router = useRouter();
  const usuario = useAuthStore((state) => state.usuario);

  if (!usuario) {
    return (
      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-muted">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const logout = () => {
    localStorage.removeItem("token");
    useAuthStore.getState().logout();
    router.push("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full p-1 hover:bg-muted focus:outline-none">
          <AvatarAmpliable
            url={usuario.avatarUrl}
            alt={`Avatar de ${usuario.nombre}`}
            nombre={usuario.nombre}
            size={32}
            ampliable={false}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-white dark:bg-zinc-900 text-black dark:text-white border border-gray-200 dark:border-zinc-700 shadow-lg rounded-md"
      >
        <div className="px-3 py-2 text-sm">
          <div className="font-medium text-foreground">{usuario.nombre}</div>
          {usuario.email && (
            <div className="text-muted-foreground text-xs truncate">
              {usuario.email}
            </div>
          )}
        </div>

        <div className="border-t my-1 dark:border-zinc-700" />

        <DropdownMenuItem onClick={() => router.push("/perfil")}>
          <Settings className="w-4 h-4 mr-2" /> Perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={logout}>
          <LogOut className="w-4 h-4 mr-2" /> Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
