// src/components/practicas/ListaPracticasCurso.tsx

"use client";

import { Practica, EntregaPractica } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import TarjetaPractica from "./TarjetaPractica";
import { FileText } from "lucide-react";

interface ListaPracticasCursoProps {
  practicas: Practica[];
  rol: "profesor" | "alumno";
  cursoId: string;
  entregas?: EntregaPractica[];
  onEditar?: (id: string) => void;
  onEliminar?: (id: string) => void;
}

function extraerImagenPrincipal(json: string): string | null {
  try {
    const parsed = JSON.parse(json);
    const imageBlock = parsed.blocks?.find((b: any) => b.type === "image");
    return imageBlock?.data?.file?.url || null;
  } catch {
    return null;
  }
}

export default function ListaPracticasCurso({
  practicas,
  rol,
  cursoId,
  entregas = [],
  onEditar,
  onEliminar,
}: ListaPracticasCursoProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
      {practicas.map((p) => {
        const entrega = entregas.find((e) => e.practica.id === p.id);
        const imagen =
          typeof p.descripcion === "string"
            ? extraerImagenPrincipal(p.descripcion)
            : null;

        const ahora = new Date();
        const vencimiento = new Date(p.fechaEntrega);
        const diasRestantes = Math.ceil((vencimiento.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
        const entregada = !!entrega;
        const fueraDePlazo = !entregada && vencimiento < ahora;

        let estadoTexto = "";
        let estadoClase = "text-muted-foreground";

        if (entregada) {
          estadoTexto = "✅ Entregada";
          estadoClase = "text-green-600";
        } else if (fueraDePlazo) {
          estadoTexto = "❌ Fuera de plazo";
          estadoClase = "text-red-600";
        } else if (diasRestantes <= 2) {
          estadoTexto = `⚠️ Te quedan ${diasRestantes} día${diasRestantes === 1 ? "" : "s"}`;
          estadoClase = "text-yellow-600";
        } else {
          estadoTexto = `🕒 Entrega en ${diasRestantes} día${diasRestantes === 1 ? "" : "s"}`;
          estadoClase = "text-blue-600";
        }

        return (
          <Dialog key={p.id}>
            <DialogTrigger asChild>
              <div className="flex gap-3 items-center p-3 border rounded hover:bg-muted/50 cursor-pointer">
                {imagen ? (
                  <img
                    src={imagen}
                    alt="Imagen de la práctica"
                    className="w-12 h-12 rounded object-cover border"
                  />
                ) : (
                  <div className="w-12 h-12 rounded border flex items-center justify-center bg-muted text-muted-foreground">
                    <FileText className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium">{p.titulo}</p>
                  <p className={`text-xs font-medium ${estadoClase}`}>
                    {estadoTexto}
                  </p>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{p.titulo}</DialogTitle>
              </DialogHeader>
              <TarjetaPractica
                practica={p}
                rol={rol}
                cursoId={cursoId}
                entrega={entrega}
                onEditar={() => onEditar?.(p.id)}
                onEliminar={() => onEliminar?.(p.id)}
              />
            </DialogContent>
          </Dialog>
        );
      })}
    </div>
  );
}
