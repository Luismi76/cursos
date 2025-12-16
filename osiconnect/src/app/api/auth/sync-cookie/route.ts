// src/app/api/auth/sync-cookie/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token, maxAge = 60 * 60 } = await req.json(); // token JWT existente
  if (!token) {
    return NextResponse.json({ ok: false, error: "Falta token" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: "token",
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge, // 1h por defecto
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: "token",
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
