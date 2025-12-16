import { useEffect, useState, useCallback } from 'react'
import { getAlumnosCurso } from '@/services/profesorService'
import { Alumno } from '@/lib/types'

export function useAlumnosCurso(cursoId: string) {
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAlumnos = useCallback(async () => {
    if (!cursoId) return
    setLoading(true)
    setError(null)
    try {
      const data = await getAlumnosCurso(cursoId)
      setAlumnos(data)
    } catch (err) {
      console.error('Error cargando alumnos del curso:', err)
      setError('No se pudieron cargar los alumnos.')
    } finally {
      setLoading(false)
    }
  }, [cursoId])

  useEffect(() => {
    fetchAlumnos()
  }, [fetchAlumnos])

  return {
    alumnos,
    loading,
    error,
    refetch: fetchAlumnos
  }
}
