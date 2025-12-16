// src/components/eventos/FormularioEvento.tsx

"use client";
import { useState } from "react";
import { EventoCursoDTO, TipoEvento, VisibilidadEvento } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { crearEventoCurso } from "@/services/cursoService";
import { useParams } from "next/navigation";

export default function FormularioEvento({ onEventoCreado }: { onEventoCreado?: () => void }) {
  const { cursoId } = useParams();
const [evento, setEvento] = useState<EventoCursoDTO>({
  titulo: "",
  descripcion: "",
  tipo: TipoEvento.EVALUACION,
  visiblePara: VisibilidadEvento.ALUMNO,
  fecha: new Date().toISOString().substring(0, 10),
});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEvento({ ...evento, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!cursoId || typeof cursoId !== "string") return;
    await crearEventoCurso(cursoId, evento);
    onEventoCreado?.();
  };

  return (
    <div className="space-y-4 p-4 border rounded-xl shadow-md">
      <Input name="titulo" placeholder="Título del evento" value={evento.titulo} onChange={handleChange} />
      <Textarea name="descripcion" placeholder="Descripción" value={evento.descripcion} onChange={handleChange} />
      <select name="tipo" value={evento.tipo} onChange={handleChange} className="w-full p-2 border rounded-md">
        {Object.values(TipoEvento).map(tipo => (
          <option key={tipo} value={tipo}>{tipo}</option>
        ))}
      </select>
      <select name="visiblePara" value={evento.visiblePara} onChange={handleChange} className="w-full p-2 border rounded-md">
        {Object.values(VisibilidadEvento).map(v => (
          <option key={v} value={v}>{v}</option>
        ))}
      </select>
      <Input type="date" name="fecha" value={evento.fecha} onChange={handleChange} />
      <Button onClick={handleSubmit}>Crear evento</Button>
    </div>
  );
}
