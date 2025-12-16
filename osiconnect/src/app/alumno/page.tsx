"use client";

import { useEffect, useState } from "react";
import { getPerfil } from "@/services/usuarioService";
import {
  getMisCursos,
  listarMisEntregas,
  getMisNotificaciones,
} from "@/services/alumnosService";
import {
  Curso,
  EntregaPractica,
  Practica,
  Perfil,
  Notificacion,
} from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CalendarDays, FileText, Send, Bell } from "lucide-react";
import Link from "next/link";
import { NotificacionesAlumno } from "@/components/alumnos/NotificacionesAlumno";

interface PracticaConCurso extends Practica {
  cursoId: string;
}

export default function DashboardAlumnoPage() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [entregas, setEntregas] = useState<EntregaPractica[]>([]);
  const [pendientes, setPendientes] = useState<PracticaConCurso[]>([]);
  const [proximas, setProximas] = useState<PracticaConCurso[]>([]);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

  useEffect(() => {
    getPerfil().then(setPerfil);
  }, []);

  useEffect(() => {
    if (!perfil) return;

    const cargarDatos = async () => {
      const [cursos, entregas, notifs] = await Promise.all([
        getMisCursos(),
        listarMisEntregas(),
        getMisNotificaciones(),
      ]);

      const entregadasIds = new Set(entregas.map((e) => e.practica.id));
      const ahora = new Date();
      const pendientes: PracticaConCurso[] = [];
      const proximas: PracticaConCurso[] = [];

      cursos.forEach((curso) => {
        curso.practicas?.forEach((p) => {
          const vencimiento = new Date(p.fechaEntrega);
          const practicaExtendida: PracticaConCurso = {
            ...p,
            cursoId: curso.id,
          };

          if (!entregadasIds.has(p.id)) {
            pendientes.push(practicaExtendida);
            if (vencimiento > ahora) proximas.push(practicaExtendida);
          }
        });
      });

      setCursos(cursos);
      setEntregas(entregas);
      setPendientes(pendientes);
      setProximas(proximas);
      setNotificaciones(notifs);
    };

    cargarDatos();
  }, [perfil]);

  if (!perfil) return <p className="p-6 text-muted-foreground">Cargando...</p>;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={perfil.avatarUrl || ""} />
            <AvatarFallback>{perfil.nombre?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">Hola, {perfil.nombre}</h1>
            <p className="text-sm text-muted-foreground">{perfil.email}</p>
          </div>
        </div>
        <NotificacionesAlumno />
      </div>

      {/* Resumen general */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-muted-foreground text-sm">Cursos inscritos</p>
            <p className="text-2xl font-bold">{cursos.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-muted-foreground text-sm">
              Prácticas entregadas
            </p>
            <p className="text-2xl font-bold">{entregas.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-muted-foreground text-sm">Pendientes</p>
            <p className="text-2xl font-bold">{pendientes.length}</p>
          </CardContent>
        </Card>
      </section>
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Mis cursos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cursos.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No estás inscrito en ningún curso.
              </p>
            ) : (
              <ul className="space-y-2">
                {cursos.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/alumno/curso/${c.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {c.nombre}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Prácticas entregadas */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" /> Prácticas entregadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {entregas.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No has entregado ninguna práctica.
              </p>
            ) : (
              <ul className="space-y-2">
                {entregas.map((e) => (
                  <li key={e.id} className="space-y-1">
                    <p>
                      <Link
                        href={`/alumno/practica/${e.practica.id}`}
                        className="text-green-600 hover:underline font-medium"
                      >
                        {e.practica.titulo}
                      </Link>{" "}
                      – entregada el{" "}
                      {new Date(e.fechaEntrega).toLocaleDateString()}
                    </p>
                    {e.nota !== null ? (
                      <p className="text-sm">
                        ✅ <span className="font-medium">Nota:</span> {e.nota}
                      </p>
                    ) : (
                      <p className="text-sm text-yellow-600">
                        ⏳ Aún no calificada
                      </p>
                    )}
                    {e.comentarioProfesor && (
                      <p className="text-sm text-muted-foreground">
                        💬 <span className="font-medium">Comentario:</span>{" "}
                        {e.comentarioProfesor}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Prácticas pendientes */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" /> Prácticas pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendientes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No tienes prácticas pendientes.
              </p>
            ) : (
              <ul className="space-y-2">
                {pendientes.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/alumno/curso/${p.cursoId}/practica/${p.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {p.titulo}
                    </Link>{" "}
                    – entrega antes del{" "}
                    {new Date(p.fechaEntrega).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Próximas entregas */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" /> Próximas entregas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {proximas.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay entregas próximas.
              </p>
            ) : (
              <ul className="space-y-2">
                {proximas.map((p) => (
                  <li key={p.id}>
                    {p.titulo} – vence el{" "}
                    {new Date(p.fechaEntrega).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Notificaciones */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" /> Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            {notificaciones.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No tienes notificaciones nuevas.
              </p>
            ) : (
              <ul className="space-y-2">
                {notificaciones.map((n) => (
                  <li key={n.id}>
                    <p>{n.mensaje}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(n.fecha).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
