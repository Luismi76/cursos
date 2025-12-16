import { useEffect, useState, useCallback } from 'react'
import { getAlumnosDisponibles } from '@/services/profesorService'
import { Alumno } from '@/lib/types'

export function useAlumnosDisponibles(cursoId: string) {
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAlumnos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAlumnosDisponibles(cursoId)
      setAlumnos(data)
    } catch (err) {
      console.error(err)
      setError('Error al cargar los alumnos disponibles')
    } finally {
      setLoading(false)
    }
  }, [cursoId])

  useEffect(() => {
    if (cursoId) fetchAlumnos()
  }, [cursoId, fetchAlumnos])

  return { alumnos, loading, error, refetch: fetchAlumnos }
}
