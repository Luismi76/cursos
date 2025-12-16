// hooks/usePracticasCurso.ts
import { useEffect, useState } from 'react'
import { getPracticasCurso } from '@/services/profesorService'
import { Practica } from '@/lib/types'

export function usePracticasCurso(cursoId: string) {
  const [practicas, setPracticas] = useState<Practica[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPracticas = async () => {
    try {
      const data = await getPracticasCurso(cursoId)
      setPracticas(data)
    } catch (err) {
      setError('Error al cargar las prácticas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (cursoId) fetchPracticas()
  }, [cursoId])

  return { practicas, loading, error, refetch: fetchPracticas }
}
