// components/practicas/TarjetaPracticaAlumno.tsx
import { Practica, EntregaPractica } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { renderEditorJs } from "@/lib/renderEditor";

interface Props {
  practica: Practica;
  entrega?: EntregaPractica;
  cursoId: string;
}

export default function TarjetaPracticaAlumno({ practica, entrega, cursoId }: Props) {
  const fechaEntrega = new Date(practica.fechaEntrega);
  const entregada = !!entrega;

  return (
    <Card
      className={clsx(
        "border-l-4 shadow-sm",
        entregada ? "border-green-500" : "border-yellow-400"
      )}
    >
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{practica.titulo}</h3>
          {entregada ? (
            <CheckCircle className="text-green-600" />
          ) : (
            <Clock className="text-yellow-600" />
          )}
        </div>
        <div
          className="prose text-sm text-muted-foreground max-w-none"
          dangerouslySetInnerHTML={{
            __html: renderEditorJs(practica.descripcion),
          }}
        />
        <div className="text-sm flex items-center gap-2 text-gray-500">
          <CalendarDays className="w-4 h-4" />
          Entrega: {fechaEntrega.toLocaleDateString()}
        </div>
        <div className="pt-2">
          <Link href={`/alumno/curso/${cursoId}/practica/${practica.id}`}>
            <Button variant={entregada ? "outline" : "default"}>
              {entregada ? "Ver entrega" : "Entregar ahora"}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
