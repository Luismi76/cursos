"use client";

import { useAuthStore } from "@/hooks/authStore";

export default function AdminSettingsPage() {
    const usuario = useAuthStore((state) => state.usuario);

    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Ajustes</h1>

                <div className="space-y-6">
                    {/* Perfil */}
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Información del Perfil</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Nombre</label>
                                <p className="text-muted-foreground">{usuario?.nombre}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Email</label>
                                <p className="text-muted-foreground">{usuario?.email}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Rol</label>
                                <p className="text-muted-foreground">Administrador</p>
                            </div>
                        </div>
                    </div>

                    {/* Notificaciones */}
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Notificaciones</h2>
                        <div className="space-y-3">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" defaultChecked className="rounded" />
                                <span className="text-sm">Notificar nuevos usuarios</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" defaultChecked className="rounded" />
                                <span className="text-sm">Notificar nuevos cursos</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" className="rounded" />
                                <span className="text-sm">Resumen diario por email</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
