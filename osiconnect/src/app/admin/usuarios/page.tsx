"use client";

import { useEffect, useState, useMemo } from "react";
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
import { Plus, Pencil, Trash2, Search, Users, GraduationCap, UserCog, Shield, X, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";

type Rol = "ALUMNO" | "PROFESOR" | "ADMINISTRADOR";
type FiltroRol = Rol | "TODOS";
type SortField = "nombre" | "email" | "rol";
type SortDirection = "asc" | "desc";

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
    const [filtroRol, setFiltroRol] = useState<FiltroRol>("TODOS");
    const [sortField, setSortField] = useState<SortField>("nombre");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

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

    // Filtrado y ordenación con useMemo para mejor rendimiento
    const filteredUsuarios = useMemo(() => {
        let result = usuarios.filter(
            (u) =>
                (u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    u.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
                (filtroRol === "TODOS" || u.rol === filtroRol)
        );

        // Ordenar
        result.sort((a, b) => {
            let comparison = 0;
            if (sortField === "nombre") {
                comparison = a.nombre.localeCompare(b.nombre);
            } else if (sortField === "email") {
                comparison = a.email.localeCompare(b.email);
            } else if (sortField === "rol") {
                const rolOrder = { ADMINISTRADOR: 0, PROFESOR: 1, ALUMNO: 2 };
                comparison = rolOrder[a.rol] - rolOrder[b.rol];
            }
            return sortDirection === "asc" ? comparison : -comparison;
        });

        return result;
    }, [usuarios, searchTerm, filtroRol, sortField, sortDirection]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const clearFilters = () => {
        setSearchTerm("");
        setFiltroRol("TODOS");
        setSortField("nombre");
        setSortDirection("asc");
    };

    const hasActiveFilters = searchTerm || filtroRol !== "TODOS";

    // Contadores por rol
    const contadores = useMemo(() => ({
        total: usuarios.length,
        alumnos: usuarios.filter(u => u.rol === "ALUMNO").length,
        profesores: usuarios.filter(u => u.rol === "PROFESOR").length,
        administradores: usuarios.filter(u => u.rol === "ADMINISTRADOR").length,
    }), [usuarios]);

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-30" />;
        return sortDirection === "asc"
            ? <ChevronUp className="w-4 h-4 ml-1" />
            : <ChevronDown className="w-4 h-4 ml-1" />;
    };

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

                {/* Filtros por rol */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <button
                        onClick={() => setFiltroRol("TODOS")}
                        className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                            filtroRol === "TODOS"
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-zinc-200 dark:border-zinc-700 hover:border-primary/50"
                        }`}
                    >
                        <Users className="w-5 h-5 text-zinc-500" />
                        <div className="text-left">
                            <div className="text-2xl font-bold">{contadores.total}</div>
                            <div className="text-xs text-muted-foreground">Todos</div>
                        </div>
                    </button>
                    <button
                        onClick={() => setFiltroRol("ALUMNO")}
                        className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                            filtroRol === "ALUMNO"
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-sm"
                                : "border-zinc-200 dark:border-zinc-700 hover:border-blue-500/50"
                        }`}
                    >
                        <GraduationCap className="w-5 h-5 text-blue-500" />
                        <div className="text-left">
                            <div className="text-2xl font-bold">{contadores.alumnos}</div>
                            <div className="text-xs text-muted-foreground">Alumnos</div>
                        </div>
                    </button>
                    <button
                        onClick={() => setFiltroRol("PROFESOR")}
                        className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                            filtroRol === "PROFESOR"
                                ? "border-green-500 bg-green-50 dark:bg-green-950 shadow-sm"
                                : "border-zinc-200 dark:border-zinc-700 hover:border-green-500/50"
                        }`}
                    >
                        <UserCog className="w-5 h-5 text-green-500" />
                        <div className="text-left">
                            <div className="text-2xl font-bold">{contadores.profesores}</div>
                            <div className="text-xs text-muted-foreground">Profesores</div>
                        </div>
                    </button>
                    <button
                        onClick={() => setFiltroRol("ADMINISTRADOR")}
                        className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                            filtroRol === "ADMINISTRADOR"
                                ? "border-red-500 bg-red-50 dark:bg-red-950 shadow-sm"
                                : "border-zinc-200 dark:border-zinc-700 hover:border-red-500/50"
                        }`}
                    >
                        <Shield className="w-5 h-5 text-red-500" />
                        <div className="text-left">
                            <div className="text-2xl font-bold">{contadores.administradores}</div>
                            <div className="text-xs text-muted-foreground">Admins</div>
                        </div>
                    </button>
                </div>

                {/* Búsqueda y limpiar filtros */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre o email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    {hasActiveFilters && (
                        <Button variant="outline" onClick={clearFilters} className="shrink-0">
                            <X className="w-4 h-4 mr-2" />
                            Limpiar filtros
                        </Button>
                    )}
                    <div className="text-sm text-muted-foreground self-center ml-auto">
                        {filteredUsuarios.length} de {usuarios.length} usuarios
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-zinc-50 dark:bg-zinc-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                    <button
                                        onClick={() => handleSort("nombre")}
                                        className="flex items-center hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                                    >
                                        Nombre
                                        <SortIcon field="nombre" />
                                    </button>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                    <button
                                        onClick={() => handleSort("email")}
                                        className="flex items-center hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                                    >
                                        Email
                                        <SortIcon field="email" />
                                    </button>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                    <button
                                        onClick={() => handleSort("rol")}
                                        className="flex items-center hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                                    >
                                        Rol
                                        <SortIcon field="rol" />
                                    </button>
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
