import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { Notificacion } from "@/lib/types";
import { getMisNotificaciones, marcarNotificacionComoLeida } from "@/services/alumnosService";

export function NotificacionesAlumno() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

  useEffect(() => {
    getMisNotificaciones().then(setNotificaciones);
  }, []);

  const noLeidas = notificaciones.filter((n) => !n.leida);

  return (
    <Popover>
      <PopoverTrigger className="relative">
        <Bell className="w-5 h-5" />
        {noLeidas.length > 0 && (
          <div className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] font-bold rounded-full px-1.5 h-5 min-w-[20px] flex items-center justify-center shadow-md">
            {noLeidas.length}
          </div>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <h3 className="font-semibold mb-2">Notificaciones</h3>
        {notificaciones.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tienes notificaciones.
          </p>
        ) : (
          <ul className="space-y-2">
            {notificaciones.map((n) => (
              <li key={n.id}>
                <button
                  onClick={async () => {
                    await marcarNotificacionComoLeida(n.id);
                    setNotificaciones((prev) =>
                      prev.map((x) =>
                        x.id === n.id ? { ...x, leida: true } : x
                      )
                    );
                  }}
                  className="text-left w-full hover:bg-muted px-2 py-1 rounded"
                >
                  <p>{n.mensaje}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(n.fecha).toLocaleString()}
                  </p>
                </button>

                <p className="text-xs text-muted-foreground">
                  {new Date(n.fecha).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
