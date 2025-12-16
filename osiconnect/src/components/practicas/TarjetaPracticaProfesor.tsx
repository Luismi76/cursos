import RenderEditorContent from "./RenderEditorContent";
import { Practica } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

interface Props {
  practica: Practica;
  onEditar: () => void;
  onEliminar: () => void;
}

export default function TarjetaPracticaProfesor({
  practica,
  onEditar,
  onEliminar,
}: Props) {
  const fechaEntrega = new Date(practica.fechaEntrega);

  return (
    <Card className="border-l-4 border-blue-500 shadow-sm">
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{practica.titulo}</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={onEditar}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="destructive" size="icon" onClick={onEliminar}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {typeof practica.descripcion === "string" && (
          <RenderEditorContent data={JSON.parse(practica.descripcion)} />
        )}

        <div className="text-sm flex items-center gap-2 text-gray-500">
          <CalendarDays className="w-4 h-4" />
          Entrega:{" "}
          <span className="text-blue-600">
            {fechaEntrega.toLocaleDateString()}
          </span>
        </div>

        <div className="pt-2">
          <Link href={`/profesor/practica/${practica.id}/entregas`}>
            <Button variant="secondary">Ver entregas</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
