import { Bell } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState, useRef } from "react";
import { Notificacion } from "@/lib/types";
import { getMisNotificaciones, marcarNotificacionComoLeida } from "@/services/alumnosService";
import { createNotificationSocket } from "@/hooks/useNotificationSocket";
import { toast } from "sonner";

export function NotificacionesGlobales() {
    const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
    const socketRef = useRef<any>(null);

    useEffect(() => {
        // Carga inicial
        getMisNotificaciones()
            .then(setNotificaciones)
            .catch(err => console.error('Error cargando notificaciones:', err));

        // Conexión Socket
        socketRef.current = createNotificationSocket((nuevaNotif) => {
            setNotificaciones((prev) => [nuevaNotif, ...prev]);
            toast.info("Nueva notificación: " + nuevaNotif.mensaje);
            try {
                const audio = new Audio('/notification.mp3');
                audio.play().catch(e => console.log('Audio play failed', e));
            } catch (e) {
                // ignore
            }
        });

        return () => {
            socketRef.current?.deactivate();
        };
    }, []);

    const noLeidas = notificaciones.filter((n) => !n.leida);

    const handleMarcarLeida = async (n: Notificacion) => {
        if (!n.leida) {
            await marcarNotificacionComoLeida(n.id);
            setNotificaciones((prev) =>
                prev.map((x) =>
                    x.id === n.id ? { ...x, leida: true } : x
                )
            );
        }
    }

    return (
        <Popover>
            <PopoverTrigger className="relative p-2 rounded-full hover:bg-muted transition-colors">
                <Bell className="w-5 h-5" />
                {noLeidas.length > 0 && (
                    <div className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                        {noLeidas.length}
                    </div>
                )}
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b bg-muted/40">
                    <h3 className="font-semibold">Notificaciones</h3>
                </div>
                <div className="max-h-[300px] overflow-y-auto p-2">
                    {notificaciones.length === 0 ? (
                        <p className="text-sm text-center text-muted-foreground py-4">
                            No tienes notificaciones.
                        </p>
                    ) : (
                        <ul className="space-y-1">
                            {notificaciones.map((n) => (
                                <li key={n.id}>
                                    <button
                                        onClick={() => handleMarcarLeida(n)}
                                        className={`text-left w-full px-3 py-2 rounded-md transition-colors ${!n.leida ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted'}`}
                                    >
                                        <p className={`text-sm ${!n.leida ? 'font-semibold' : ''}`}>{n.mensaje}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(n.fecha).toLocaleString()}
                                        </p>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
