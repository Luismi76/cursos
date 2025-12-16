"use client";

import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login } from "@/hooks/authService";
import { useAuthStore } from "@/hooks/authStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "@/schemas/authSchema";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const user = await login(data.email, data.password);

      // ✅ Cookie se establece automáticamente en el backend
      // ❌ NO guardamos token en localStorage (seguridad)

      // ✅ Actualizamos el store
      setUser(user);

      // ✅ Redirigimos por rol
      if (user.rol === "ADMINISTRADOR") {
        router.push("/admin");
      } else if (user.rol === "PROFESOR") {
        router.push("/profesor");
      } else if (user.rol === "ALUMNO") {
        router.push("/alumno");
      } else {
        toast.error("Rol no reconocido");
      }
    } catch (e) {
      toast.error("Credenciales incorrectas");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Iniciar sesión</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            {...register("email")}
            placeholder="Email"
            type="email"
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-sm text-destructive mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <Input
            {...register("password")}
            type="password"
            placeholder="Contraseña"
            autoComplete="current-password"
          />
          {errors.password && (
            <p className="text-sm text-destructive mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Iniciando sesión..." : "Entrar"}
        </Button>
      </form>
    </div>
  );
}
