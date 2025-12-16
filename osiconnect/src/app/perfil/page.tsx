"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  getPerfil,
  actualizarPerfil,
  subirAvatar,
} from "@/services/usuarioService";
import AvatarGallerySelector from "@/components/common/AvatarCustomizer";

export default function PerfilPage() {
  const [nombre, setNombre] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("");

  useEffect(() => {
    getPerfil().then((data) => {
      setNombre(data.nombre);
      setAvatarUrl(data.avatarUrl || "");
      setEmail(data.email);
      setRol(data.rol);
    });
  }, []);

  const handleActualizar = async () => {
    try {
      await actualizarPerfil({ nombre, avatarUrl });
      toast.success("Perfil actualizado correctamente");
    } catch (err) {
      console.error(err);
      toast.error("Error al actualizar el perfil");
    }
  };

  const handleSeleccionarArchivo = () => {
    fileInputRef.current?.click();
  };

  const handleArchivoSeleccionado = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const nuevaUrl = await subirAvatar(formData);
      setAvatarUrl(nuevaUrl);
      toast.success("Avatar actualizado");
    } catch (err) {
      console.error(err);
      toast.error("Error al subir el avatar");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarGenerado = (url: string) => {
    setAvatarUrl(url);
    toast.success("Avatar elegido");
  };

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Mi perfil</h1>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <img
            src={avatarUrl || "/placeholder-avatar.png"}
            alt="Avatar"
            className="w-20 h-20 rounded-full object-cover border"
          />
          <div>
            <Button
              type="button"
              onClick={handleSeleccionarArchivo}
              disabled={loading}
            >
              {loading ? "Subiendo..." : "Subir imagen"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleArchivoSeleccionado}
            />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold">Email:</span> {email}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold">Rol:</span>{" "}
            {rol === "PROFESOR" ? "Profesor" : "Alumno"}
          </p>
        </div>
        <Input
          placeholder="Tu nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <AvatarGallerySelector onSelect={handleAvatarGenerado} />

        <Button onClick={handleActualizar}>Guardar cambios</Button>
      </div>
    </div>
  );
}
