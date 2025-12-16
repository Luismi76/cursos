'use client'

import { useFetchData } from '@/hooks/useFetchData'
import { Curso } from '@/lib/types'
import { getMisCursos } from '@/services/alumnosService'
import { TituloSeccion } from '@/components/common/TituloSeccion'
import { TarjetaCurso } from '@/components/cursos/TarjetaCurso'

export default function MisCursosPage() {
  const { data: cursos, loading } = useFetchData<Curso[]>(getMisCursos)

  return (
    <div className="p-6 space-y-6">
      <TituloSeccion>Mis cursos</TituloSeccion>

      {loading ? (
        <p>Cargando cursos...</p>
      ) : !cursos || cursos.length === 0 ? (
        <p>No estás inscrito en ningún curso.</p>
      ) : (
        <ul className="space-y-4">
          {cursos.map(curso => (
            <TarjetaCurso
              key={curso.id}
              curso={curso}
              href={`/alumno/curso/${curso.id}`}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
