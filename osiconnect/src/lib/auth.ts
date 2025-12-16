// src/lib/auth.ts
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

type JwtPayload = {
  sub: string;
  role: "ALUMNO" | "PROFESOR" | "ADMIN";
  name?: string;
  exp?: number;
};

export function getUserFromCookie(): JwtPayload | null {
  const token = cookies().get("token")?.value;
  if (!token) return null;
  try {
    // Si tienes la clave pública, usa verify; si no, sólo decode:
    const payload = jwt.decode(token) as JwtPayload | null;
    if (!payload) return null;

    // (Opcional) comprobar expiración localmente si viene "exp"
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}
