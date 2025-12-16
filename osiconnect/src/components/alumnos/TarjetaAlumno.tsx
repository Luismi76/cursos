// src/components/alumnos/TarjetaAlumno.tsx
'use client'

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface TarjetaAlumnoProps {
  id: string
  nombre: string
  email: string
  eliminando: boolean
  onEliminar: () => void
}

export function TarjetaAlumno({ id, nombre, email, eliminando, onEliminar }: TarjetaAlumnoProps) {
  return (
    <li className="flex justify-between items-center p-4 border rounded-md shadow-sm">
      <div>
        <p className="font-semibold">{nombre}</p>
        <p className="text-sm text-gray-500">{email}</p>
      </div>
      <Button
        variant="destructive"
        size="icon"
        disabled={eliminando}
        onClick={onEliminar}
        aria-label={`Eliminar a ${nombre}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </li>
  )
}
