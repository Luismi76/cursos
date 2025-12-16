'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { useState } from 'react'
import EditorPractica from './EditorPractica.client'

const schema = z.object({
  titulo: z.string().min(1, 'El título es obligatorio'),
  descripcion: z.any(),
  fechaEntrega: z.date({ required_error: 'La fecha de entrega es obligatoria' }),
})

type PracticaFormValues = z.infer<typeof schema>

type FormularioCrearPracticaProps = {
  onSubmit: (values: PracticaFormValues & { descripcion: any }) => void
  initialValues?: Partial<PracticaFormValues & { descripcion: any }>
}


export default function FormularioCrearPractica({
  onSubmit,
  initialValues,
}: FormularioCrearPracticaProps) {
  // 👇 Usa los valores iniciales si están disponibles
  const [fecha, setFecha] = useState<Date | undefined>(
    initialValues?.fechaEntrega
      ? new Date(initialValues.fechaEntrega)
      : undefined
  )
  const [contenido, setContenido] = useState<any>(
    initialValues?.descripcion ?? null
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PracticaFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      titulo: initialValues?.titulo || '',
      fechaEntrega: initialValues?.fechaEntrega
        ? new Date(initialValues.fechaEntrega)
        : undefined,
    },
  })

  const onSubmitForm = (values: PracticaFormValues) => {
    if (!contenido) {
      alert('El contenido de la práctica es obligatorio.')
      return
    }

    onSubmit({
      ...values,
      descripcion: contenido,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <div>
        <label className="block mb-1 font-semibold">Título</label>
        <Input type="text" {...register('titulo')} />
        {errors.titulo && <p className="text-red-500 text-sm mt-1">{errors.titulo.message}</p>}
      </div>

      <div>
        <label className="block mb-1 font-semibold">Enunciado de la práctica</label>
        <EditorPractica onChange={setContenido} data={initialValues?.descripcion}/>
      </div>

      <div>
        <label className="block mb-1 font-semibold">Fecha de entrega</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left">
              {fecha ? format(fecha, 'dd/MM/yyyy') : 'Selecciona una fecha'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={fecha}
              onSelect={(selectedDate) => {
                if (selectedDate) {
                  setFecha(selectedDate)
                  setValue('fechaEntrega', selectedDate)
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.fechaEntrega && <p className="text-red-500 text-sm mt-1">{errors.fechaEntrega.message}</p>}
      </div>

      <Button type="submit" className="w-full">
        Crear práctica
      </Button>
    </form>
  )
}
