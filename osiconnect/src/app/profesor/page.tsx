'use client'

import { useEffect, useState } from 'react'
import { getCursosProfesor } from '@/services/profesorService'
import { TarjetaCurso } from '@/components/cursos/TarjetaCurso'
import type { Curso } from '@/lib/types'

export default function PaginaInicioProfesor() {
  const [cursos, setCursos] = useState<Curso[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCursosProfesor()
      .then(setCursos)
      .catch(err => console.error('Error al cargar cursos', err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Mis cursos</h1>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 h-32 animate-pulse bg-muted/20">
              <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-muted rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : cursos.length === 0 ? (
        <p className="text-muted-foreground">No tienes cursos asignados.</p>
      ) : (
        <ul className="space-y-4">
          {cursos.map(curso => (
            <TarjetaCurso
              key={curso.id}
              curso={curso}
              href={`/profesor/curso/${curso.id}`}
              botonTexto="Ver curso"
            />
          ))}
        </ul>
      )}
    </div>
  )
}
