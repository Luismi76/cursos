// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PRIVATE = ["/alumno", "/profesor", "/admin"];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Sólo vigila rutas privadas
  if (!PRIVATE.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  if (!token) {
    // Redirige a /login y recuerda a dónde quería ir
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname + (search || ""));
    return NextResponse.redirect(url);
  }

  // (Opcional) Validación ligera: si usas JWT y quieres chequear expiración sin IO:
  // try { decode(token) } catch { redirect to /login ... }

  return NextResponse.next();
}

// Indica qué rutas observa el middleware (más preciso = más eficiente)
export const config = {
  matcher: ["/alumno/:path*", "/profesor/:path*", "/admin/:path*"],
};
