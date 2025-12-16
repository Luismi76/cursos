import { useAlumnosCurso } from '@/hooks/useAlumnosCurso'

interface Props {
  cursoId: string
}

export function ListaAlumnos({ cursoId }: Props) {
  const { alumnos, loading } = useAlumnosCurso(cursoId)

  if (loading) return <p>Cargando alumnos...</p>
  if (alumnos.length === 0) return <p>No hay alumnos inscritos en este curso.</p>

  return (
    <ul className="space-y-2">
      {alumnos.map(alumno => (
        <li key={alumno.id} className="border rounded p-2">
          <p className="font-semibold">{alumno.nombre}</p>
          <p className="text-sm text-gray-500">{alumno.email}</p>
        </li>
      ))}
    </ul>
  )
}
