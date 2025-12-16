"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  getWikiCurso,
  getAportacionesWiki,
  crearAportacionWiki,
  actualizarWikiCurso,
} from "@/services/wikiServices";
import { getCursoById } from "@/services/cursoService";
import { useAuthStore } from "@/hooks/authStore";
import { AportacionWiki } from "@/lib/types";
import type { EditorWikiHandle } from "@/components/common/EditorWiki";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const EditorWiki = dynamic(() => import("@/components/common/EditorWiki"), {
  ssr: false,
});

const RenderEditorJS = dynamic(() => import("@/components/common/RenderEditor"), {
  ssr: false,
});

export default function WikiCursoPage() {
  const { cursoId } = useParams();
  const { usuario } = useAuthStore();

  const [nombreCurso, setNombreCurso] = useState("");
  const [descripcionCurso, setDescripcionCurso] = useState("");
  const [contenido, setContenido] = useState<any>(null);
  const [aportaciones, setAportaciones] = useState<AportacionWiki[]>([]);
  const [comentario, setComentario] = useState("");
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [editando, setEditando] = useState(false);

  const editorRef = useRef<EditorWikiHandle>(null);

  useEffect(() => {
    if (typeof cursoId !== "string") return;

    const fetchData = async () => {
      try {
        const curso = await getCursoById(cursoId);
        setNombreCurso(curso.nombre);
        setDescripcionCurso(curso.descripcion);

        const contenidoData = await getWikiCurso(cursoId);
        setContenido(contenidoData);

        const listaAportaciones = await getAportacionesWiki(cursoId);
        setAportaciones(listaAportaciones);
      } catch {
        toast.error("Error al cargar la wiki del curso");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cursoId]);

  const handleEnviarAportacion = async () => {
    if (!comentario.trim() || !usuario?.id) {
      toast.error("No se pudo identificar al autor.");
      return;
    }

    try {
      setEnviando(true);
      await crearAportacionWiki(cursoId as string, comentario);
      setComentario("");
      const actualizadas = await getAportacionesWiki(cursoId as string);
      setAportaciones(actualizadas);
      toast.success("Aportación enviada");
    } catch {
      toast.error("No se pudo enviar la aportación");
    } finally {
      setEnviando(false);
    }
  };

  const handleGuardarWiki = async () => {
    if (!editorRef.current) return;
    try {
      const data = await editorRef.current.getContent();
      await actualizarWikiCurso(cursoId as string, data);
      setContenido(data);
      setEditando(false);
      toast.success("Contenido actualizado");
    } catch {
      toast.error("Error al guardar el contenido");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 space-y-8">
        <Card className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </Card>
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-8">
      {/* Cabecera del curso */}
      <Card className="p-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-3xl">📚</span>
            <span>
              Wiki del curso:{" "}
              <span className="text-primary">{nombreCurso}</span>
            </span>
          </h1>
          {descripcionCurso && (
            <p className="text-muted-foreground text-sm">{descripcionCurso}</p>
          )}
        </div>
      </Card>

      {/* Contenido del profesor */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Contenido del profesor</h2>
          {usuario?.rol === "PROFESOR" && !editando && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditando(true)}
            >
              Editar
            </Button>
          )}
        </div>

        {editando ? (
          <>
            <EditorWiki ref={editorRef} initialData={contenido} />
            <div className="flex justify-end gap-2 mt-4">
              <Button onClick={handleGuardarWiki}>Guardar cambios</Button>
              <Button variant="ghost" onClick={() => setEditando(false)}>
                Cancelar
              </Button>
            </div>
          </>
        ) : contenido?.blocks ? (
          <RenderEditorJS htmlJson={contenido} />
        ) : (
          <p className="text-muted-foreground">Todavía no hay contenido.</p>
        )}
      </Card>

      {/* Aportaciones de alumnos */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Aportaciones de alumnos</h2>
        {aportaciones.length === 0 ? (
          <p className="text-muted-foreground">Todavía no hay aportaciones.</p>
        ) : (
          aportaciones.map((a) => (
            <div key={a.id} className="border-t pt-4">
              <p className="text-sm text-muted-foreground">
                {a.autor?.nombre || "Usuario desconocido"} ({new Date(a.fecha).toLocaleString()})
              </p>
              <p>{a.contenido}</p>
            </div>
          ))
        )}
      </Card>

      {/* Formulario de aportación */}
      {usuario?.rol === "ALUMNO" && (
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">¿Quieres aportar algo?</h2>
          <Textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Escribe tu aportación aquí..."
          />
          <Button onClick={handleEnviarAportacion} disabled={enviando}>
            {enviando ? "Enviando..." : "Enviar aportación"}
          </Button>
        </Card>
      )}
    </div>
  );
}
