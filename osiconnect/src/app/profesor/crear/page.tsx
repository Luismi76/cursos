'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { crearCurso } from '@/services/profesorService'

export default function CrearCursoPage() {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCrear = async () => {
    if (!nombre.trim() || !descripcion.trim()) return
    setLoading(true)
    try {
      await crearCurso({ nombre, descripcion })
      router.push('/profesor')
    } catch (error) {
      alert('Error al crear el curso')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Crear nuevo curso</h1>
      <Input
        placeholder="Nombre del curso"
        value={nombre}
        onChange={e => setNombre(e.target.value)}
        className="mb-2"
      />
      <Input
        placeholder="Descripción"
        value={descripcion}
        onChange={e => setDescripcion(e.target.value)}
        className="mb-2"
      />
      <Button onClick={handleCrear} disabled={loading} className="mt-4 w-full">
        {loading ? 'Creando...' : 'Crear curso'}
      </Button>
    </div>
  )
}

