"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { api } from "@/services/api";
import {
  Alumno,
  EntregaPractica,
  EntregasAgrupadas,
  CalificacionDTO,
} from "@/lib/types";

export default function VerEntregasPage() {
  const params = useParams();
  const practicaId =
    typeof params.practicaId === "string" ? params.practicaId : "";
  const [datos, setDatos] = useState<EntregasAgrupadas | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [entregaSeleccionada, setEntregaSeleccionada] =
    useState<EntregaPractica | null>(null);
  const [nota, setNota] = useState("");
  const [comentario, setComentario] = useState("");

  const cargarEntregas = async () => {
    try {
      const res = await api.get<EntregasAgrupadas>(
        `/profesor/practica/${practicaId}/entregas`
      );
      const data = res.data;
      console.log("Entregas recibidas:", data.entregadas)

      // Validación y fallback defensivo
      setDatos({
        entregadas: data.entregadas ?? [],
        pendientes: data.pendientes ?? [],
        fueraDePlazo: data.fueraDePlazo ?? [],
      });
    } catch {
      toast.error("Error al cargar entregas");
    }
  };

  useEffect(() => {
    if (practicaId) cargarEntregas();
  }, [practicaId]);

  const abrirModal = (entrega: EntregaPractica) => {
    setEntregaSeleccionada(entrega);
    setModalOpen(true);
  };

  const calificar = async () => {
    if (!entregaSeleccionada) return;
    const dto: CalificacionDTO = {
      nota: Number(nota),
      comentario,
    };
    try {
      await api.put(
        `/profesor/entrega/${entregaSeleccionada.id}/calificar`,
        dto
      );
      toast.success("Entrega calificada");
      setModalOpen(false);
      setNota("");
      setComentario("");
      cargarEntregas();
    } catch {
      toast.error("Error al calificar");
    }
  };

  if (!datos) return <p className="p-6">Cargando entregas...</p>;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Entregas de la práctica</h1>

      {/* ✅ Entregadas */}
      <section>
        <h2 className="text-xl font-semibold mb-2">✅ Entregadas</h2>
        {datos.entregadas.length === 0 ? (
          <p className="text-muted-foreground">Ninguna entrega aún.</p>
        ) : (
          datos.entregadas.map((entrega) => (
            <Card key={entrega.id} className="p-4 space-y-1">
              <p>
                <strong>Alumno:</strong> {entrega.alumno.nombre} (
                {entrega.alumno.email})
              </p>
              <p>
                <strong>Comentario:</strong> {entrega.comentario}
              </p>
              <p>
                <strong>Archivo:</strong>
                <a
                  href={entrega.archivoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Ver
                </a>
              </p>
              <p>
                <strong>Fecha de entrega:</strong>{" "}
                {new Date(entrega.fechaEntrega).toLocaleString()}
              </p>
              {entrega.nota !== null ? (
                <p>
                  <strong>Nota:</strong> {entrega.nota}
                </p>
              ) : (
                <Button onClick={() => abrirModal(entrega)}>Calificar</Button>
              )}
            </Card>
          ))
        )}
      </section>

      {/* ⏳ Pendientes */}
      <section>
        <h2 className="text-xl font-semibold mb-2">⏳ Pendientes</h2>
        {datos.pendientes.length === 0 ? (
          <p className="text-muted-foreground">Ningún alumno pendiente.</p>
        ) : (
          datos.pendientes.map((alumno) => (
            <Card key={alumno.id} className="p-4">
              <p>
                {alumno.titulo} ({alumno.fechaEntrega}) —{" "}
                <span className="text-yellow-600">Sin entregar</span>
              </p>
            </Card>
          ))
        )}
      </section>

      {/* ❌ Fuera de plazo */}
      <section>
        <h2 className="text-xl font-semibold mb-2">❌ Fuera de plazo</h2>
        {datos.fueraDePlazo.length === 0 ? (
          <p className="text-muted-foreground">Ningún alumno fuera de plazo.</p>
        ) : (
          datos.fueraDePlazo.map((alumno) => (
            <Card key={alumno.id} className="p-4">
              <p>
                {alumno.titulo} ({alumno.fechaEntrega}) —{" "}
                <span className="text-red-600">Fuera de plazo</span>
              </p>
            </Card>
          ))
        )}
      </section>

      {/* 📝 Modal de calificación */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Calificar entrega</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Nota</Label>
            <Input
              type="number"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              min={0}
              max={10}
            />
            <Label>Comentario</Label>
            <Textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
            <Button onClick={calificar}>Guardar calificación</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
