'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface FormularioPracticaProps {
  onSubmit: (data: { titulo: string; descripcion: string; fechaEntrega: string }) => void
  initialValues?: {
    titulo: string
    descripcion: string
    fechaEntrega: string
  }
  loading?: boolean
  editar?: boolean
  onCancel?: () => void
}

export function FormularioPractica({
  onSubmit,
  initialValues,
  loading = false,
  editar = false,
  onCancel,
}: FormularioPracticaProps) {
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fechaEntrega, setFechaEntrega] = useState('')

  useEffect(() => {
    if (initialValues) {
      setTitulo(initialValues.titulo)
      setDescripcion(initialValues.descripcion)
      setFechaEntrega(initialValues.fechaEntrega)
    }
  }, [initialValues])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ titulo, descripcion, fechaEntrega })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <Input
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        placeholder="Título de la práctica"
        required
      />
      <Textarea
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        placeholder="Descripción"
      />
      <Input
        type="date"
        value={fechaEntrega}
        onChange={(e) => setFechaEntrega(e.target.value)}
        required
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : editar ? 'Guardar cambios' : 'Crear práctica'}
        </Button>
        {editar && onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}
