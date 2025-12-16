"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { usePracticasCurso } from "@/hooks/usePracticasCurso";
import {
  crearPracticaCurso,
  eliminarPracticaCurso,
  editarPracticaCurso,
} from "@/services/profesorService";
import { TituloSeccion } from "@/components/common/TituloSeccion";
import TarjetaPractica from "@/components/practicas/TarjetaPractica";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import FormularioCrearPractica from "@/components/practicas/FormularioCrearPractica";
import { z } from "zod";

type PracticaFormValues = z.infer<
  z.ZodObject<{
    titulo: z.ZodString;
    descripcion: z.ZodString;
    fechaEntrega: z.ZodDate;
  }>
>;

export default function PracticasCursoPage() {
  const params = useParams();
  const cursoId = typeof params.cursoId === "string" ? params.cursoId : "";
  const { practicas, loading, error, refetch } = usePracticasCurso(cursoId);

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [loadingForm, setLoadingForm] = useState(false);

  const practicaEditando = editandoId
    ? practicas.find((p) => p.id === editandoId)
    : null;

  const handleCrear = async (values: PracticaFormValues) => {
    setLoadingForm(true);
    try {
      
      await crearPracticaCurso(cursoId, {
        titulo: values.titulo,
        descripcion: JSON.stringify(values.descripcion),
        fechaEntrega: values.fechaEntrega.toISOString(),
      });
      toast.success("Práctica creada");
      await refetch();
    } catch {
      toast.error("Error al crear práctica");
    } finally {
      setLoadingForm(false);
    }
  };

  return (
    <div className="space-y-6">
      <TituloSeccion>Gestión de prácticas del curso</TituloSeccion>

      <FormularioCrearPractica onSubmit={handleCrear} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {practicas.map((p) => (
          <TarjetaPractica key={p.id} practica={p} rol="profesor"/>
        ))}
      </div>
    </div>
  );
}
