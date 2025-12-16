// src/components/practicas/FormularioEntrega.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface FormularioEntregaProps {
  practicaId: string
  onSubmit: (archivoUrl: string, comentario: string) => Promise<void>
}

export function FormularioEntrega({ practicaId, onSubmit }: FormularioEntregaProps) {
  const [comentario, setComentario] = useState('')
  const [archivo, setArchivo] = useState<File | null>(null)
  const [subiendo, setSubiendo] = useState(false)

  const handleSubmit = async () => {
    if (!archivo) {
      toast.error('Selecciona un archivo')
      return
    }

    const formData = new FormData()
    formData.append('archivo', archivo)

    try {
      setSubiendo(true)
      const res = await fetch(`/api/entregas/${practicaId}/archivo`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Error al subir archivo')

      const { archivoUrl } = await res.json()
      await onSubmit(archivoUrl, comentario)
      toast.success('Entrega realizada')
      setComentario('')
      setArchivo(null)
    } catch (err) {
      console.error(err)
      toast.error('Error al entregar')
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <div className="space-y-4 max-w-md">
      <Input type="file" onChange={(e) => setArchivo(e.target.files?.[0] || null)} />
      <Textarea
        placeholder="Comentario (opcional)"
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
      />
      <Button onClick={handleSubmit} disabled={subiendo}>
        {subiendo ? 'Enviando...' : 'Entregar'}
      </Button>
    </div>
  )
}
