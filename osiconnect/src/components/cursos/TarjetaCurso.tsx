// src/components/cursos/TarjetaCurso.tsx
'use client'

import { Curso } from "@/lib/types"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface TarjetaCursoProps {
  curso: Curso
  href: string
  botonTexto?: string
}

export function TarjetaCurso({ curso, href, botonTexto = "Ver prácticas" }: TarjetaCursoProps) {
  return (
    <li className="p-4 border rounded shadow-sm">
      <h2 className="text-lg font-semibold">{curso.nombre}</h2>
      <p className="text-sm text-gray-600">{curso.descripcion}</p>
      <div className="mt-2 flex gap-2">
        <Link href={href}>
          <Button variant="outline">{botonTexto}</Button>
        </Link>
      </div>
    </li>
  )
}
