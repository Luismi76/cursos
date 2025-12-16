"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getPracticaAlumno,
  subirArchivoEntrega,
  entregarPractica,
  verMiEntrega,
} from "@/services/alumnosService";
import { Practica, EntregaPractica } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import dynamic from "next/dynamic";
/* import VistaPractica from "@/components/common/VistaPractica";*/

const VistaPractica = dynamic(
  () => import("@/components/common/VistaPractica"),
  {
    ssr: false,
  }
);

export default function DetallePracticaAlumnoPage() {
  const { cursoId, practicaId } = useParams();
  const [practica, setPractica] = useState<Practica | null>(null);
  const [comentario, setComentario] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [entrega, setEntrega] = useState<EntregaPractica | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (practicaId) {
      getPracticaAlumno(practicaId as string).then((p) => {
        console.log("🧪 DESCRIPCIÓN JSON:", p.descripcion);
        setPractica(p);
      });

      verMiEntrega(practicaId as string).then(setEntrega);
    }
  }, [practicaId]);

  const handleEntrega = async () => {
    if (!archivo) {
      toast.error("Debes seleccionar un archivo para entregar.");
      return;
    }

    setEnviando(true);
    try {
      const formData = new FormData();
      formData.append("file", archivo);

      const archivoUrl = await subirArchivoEntrega(
        practicaId as string,
        formData
      );

      await entregarPractica(practicaId as string, {
        archivoUrl,
        comentario,
      });

      toast.success("Práctica entregada correctamente.");
      const nuevaEntrega = await verMiEntrega(practicaId as string);
      setEntrega(nuevaEntrega);
      setComentario("");
      setArchivo(null);
    } catch (error) {
      toast.error("Error al entregar la práctica.");
    } finally {
      setEnviando(false);
    }
  };

  if (!practica) {
    return <p className="p-6 text-muted-foreground">Cargando práctica...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{practica.titulo}</CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          {practica && practica.descripcion && (
            <VistaPractica key={practica.id} json={practica.descripcion} />
          )}
          <p className="text-sm text-muted-foreground mt-4">
            Fecha de entrega:{" "}
            {new Date(practica.fechaEntrega).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>

      {entrega ? (
        <Card>
          <CardHeader>
            <CardTitle>Tu entrega</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              ✅ Entregada el:{" "}
              <strong>
                {new Date(entrega.fechaEntrega).toLocaleDateString()}
              </strong>
            </p>
            {entrega.nota !== null ? (
              <p className="text-sm">
                📝 <strong>Nota:</strong> {entrega.nota}
              </p>
            ) : (
              <p className="text-sm text-yellow-600">⏳ Aún no calificada</p>
            )}
            {entrega.comentarioProfesor && (
              <p className="text-sm text-muted-foreground">
                💬 <strong>Comentario del profesor:</strong>{" "}
                {entrega.comentarioProfesor}
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Entregar práctica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Comentario opcional para el profesor..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
            <Input
              type="file"
              accept=".pdf,.doc,.zip,.rar,.7z"
              onChange={(e) => setArchivo(e.target.files?.[0] || null)}
            />
            <Button onClick={handleEntrega} disabled={enviando}>
              {enviando ? "Enviando..." : "Entregar práctica"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
