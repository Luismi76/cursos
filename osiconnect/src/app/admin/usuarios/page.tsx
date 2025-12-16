"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Usuario } from "@/lib/types";
import {
    getUsuarios,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
} from "@/services/adminService";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, Users } from "lucide-react";

type Rol = "ALUMNO" | "PROFESOR" | "ADMINISTRADOR";

interface FormData {
    nombre: string;
    email: string;
    password: string;
    rol: Rol;
}

const initialFormData: FormData = {
    nombre: "",
    email: "",
    password: "",
    rol: "ALUMNO",
};

export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        try {
            setLoading(true);
            const data = await getUsuarios();
            setUsuarios(data);
        } catch (error) {
            toast.error("Error al cargar usuarios");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsuarios = usuarios.filter(
        (u) =>
            u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = async () => {
        if (!formData.nombre || !formData.email || !formData.password) {
            toast.error("Todos los campos son obligatorios");
            return;
        }

        try {
            setSubmitting(true);
            await crearUsuario(formData);
            toast.success("Usuario creado correctamente");
            setIsCreateModalOpen(false);
            setFormData(initialFormData);
            cargarUsuarios();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Error al crear usuario");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = async () => {
        if (!selectedUsuario || !formData.nombre || !formData.email) {
            toast.error("Nombre y email son obligatorios");
            return;
        }

        try {
            setSubmitting(true);
            await actualizarUsuario(String(selectedUsuario.id), {
                nombre: formData.nombre,
                email: formData.email,
                rol: formData.rol,
            });
            toast.success("Usuario actualizado correctamente");
            setIsEditModalOpen(false);
            setSelectedUsuario(null);
            setFormData(initialFormData);
            cargarUsuarios();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Error al actualizar usuario");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedUsuario) return;

        try {
            setSubmitting(true);
            await eliminarUsuario(String(selectedUsuario.id));
            toast.success("Usuario eliminado correctamente");
            setIsDeleteModalOpen(false);
            setSelectedUsuario(null);
            cargarUsuarios();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Error al eliminar usuario");
        } finally {
            setSubmitting(false);
        }
    };

    const openEditModal = (usuario: Usuario) => {
        setSelectedUsuario(usuario);
        setFormData({
            nombre: usuario.nombre,
            email: usuario.email,
            password: "",
            rol: usuario.rol,
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (usuario: Usuario) => {
        setSelectedUsuario(usuario);
        setIsDeleteModalOpen(true);
    };

    const getRolBadgeVariant = (rol: Rol) => {
        switch (rol) {
            case "ADMINISTRADOR":
                return "destructive";
            case "PROFESOR":
                return "default";
            case "ALUMNO":
                return "secondary";
            default:
                return "outline";
        }
    };

    const getRolLabel = (rol: Rol) => {
        switch (rol) {
            case "ADMINISTRADOR":
                return "Admin";
            case "PROFESOR":
                return "Profesor";
            case "ALUMNO":
                return "Alumno";
            default:
                return rol;
        }
    };

    return (
        <div className="p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <Users className="h-8 w-8" />
                        <h1 className="text-3xl font-bold">Usuarios</h1>
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Usuario
                    </Button>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre o email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-zinc-50 dark:bg-zinc-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                    Nombre
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                    Rol
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                        Cargando usuarios...
                                    </td>
                                </tr>
                            ) : filteredUsuarios.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                        {searchTerm ? "No se encontraron usuarios" : "No hay usuarios registrados"}
                                    </td>
                                </tr>
                            ) : (
                                filteredUsuarios.map((usuario) => (
                                    <tr key={usuario.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium">{usuario.nombre}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                                            {usuario.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant={getRolBadgeVariant(usuario.rol)}>
                                                {getRolLabel(usuario.rol)}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditModal(usuario)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openDeleteModal(usuario)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Stats */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4">
                        <div className="text-sm text-muted-foreground">Total Usuarios</div>
                        <div className="text-2xl font-bold">{usuarios.length}</div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4">
                        <div className="text-sm text-muted-foreground">Profesores</div>
                        <div className="text-2xl font-bold">
                            {usuarios.filter((u) => u.rol === "PROFESOR").length}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4">
                        <div className="text-sm text-muted-foreground">Alumnos</div>
                        <div className="text-2xl font-bold">
                            {usuarios.filter((u) => u.rol === "ALUMNO").length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nuevo Usuario</DialogTitle>
                        <DialogDescription>
                            Crea un nuevo usuario en el sistema.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="nombre">Nombre</Label>
                            <Input
                                id="nombre"
                                value={formData.nombre}
                                onChange={(e) =>
                                    setFormData({ ...formData, nombre: e.target.value })
                                }
                                placeholder="Nombre completo"
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                placeholder="correo@ejemplo.com"
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <Label htmlFor="rol">Rol</Label>
                            <Select
                                value={formData.rol}
                                onValueChange={(value: Rol) =>
                                    setFormData({ ...formData, rol: value })
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecciona un rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALUMNO">Alumno</SelectItem>
                                    <SelectItem value="PROFESOR">Profesor</SelectItem>
                                    <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsCreateModalOpen(false);
                                setFormData(initialFormData);
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button onClick={handleCreate} disabled={submitting}>
                            {submitting ? "Creando..." : "Crear Usuario"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Usuario</DialogTitle>
                        <DialogDescription>
                            Modifica los datos del usuario.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-nombre">Nombre</Label>
                            <Input
                                id="edit-nombre"
                                value={formData.nombre}
                                onChange={(e) =>
                                    setFormData({ ...formData, nombre: e.target.value })
                                }
                                placeholder="Nombre completo"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                placeholder="correo@ejemplo.com"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-rol">Rol</Label>
                            <Select
                                value={formData.rol}
                                onValueChange={(value: Rol) =>
                                    setFormData({ ...formData, rol: value })
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecciona un rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALUMNO">Alumno</SelectItem>
                                    <SelectItem value="PROFESOR">Profesor</SelectItem>
                                    <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEditModalOpen(false);
                                setSelectedUsuario(null);
                                setFormData(initialFormData);
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button onClick={handleEdit} disabled={submitting}>
                            {submitting ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Eliminar Usuario</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas eliminar a{" "}
                            <strong>{selectedUsuario?.nombre}</strong>? Esta acción no se
                            puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDeleteModalOpen(false);
                                setSelectedUsuario(null);
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={submitting}
                        >
                            {submitting ? "Eliminando..." : "Eliminar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
