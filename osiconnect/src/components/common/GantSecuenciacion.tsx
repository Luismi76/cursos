'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { ModuloDTO, UnidadFormativaDTO } from '@/lib/types'
import { CalendarIcon, Trash2 } from 'lucide-react'
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css'
import { v4 as uuidv4 } from 'uuid'

interface Props {
  cursoId: string
  modulos: ModuloDTO[]
  onUpdateModulo: (modulo: ModuloDTO) => void
  onDeleteModulo: (id: string) => void
  onAddModulo: (modulo: ModuloDTO) => void
  onUpdateUnidad: (unidad: UnidadFormativaDTO, moduloId: string) => void
  onDeleteUnidad: (unidadId: string) => void
  onAddUnidad: (unidad: UnidadFormativaDTO, moduloId: string) => void
}

export function GanttSecuenciacion({
  cursoId,
  modulos,
  onUpdateModulo,
  onDeleteModulo,
  onAddModulo,
  onUpdateUnidad,
  onDeleteUnidad,
  onAddUnidad,
}: Props) {
  const [nuevoModulo, setNuevoModulo] = useState({ nombre: '', fechaInicio: '', fechaFin: '' })
  const [nuevasUnidades, setNuevasUnidades] = useState<Record<string, UnidadFormativaDTO>>({})

  const handleCrearModulo = () => {
    if (!nuevoModulo.nombre || !nuevoModulo.fechaInicio || !nuevoModulo.fechaFin) return
    const nuevo: ModuloDTO = {
      id: uuidv4(),
      nombre: nuevoModulo.nombre,
      fechaInicio: nuevoModulo.fechaInicio,
      fechaFin: nuevoModulo.fechaFin,
      unidades: [],
    }
    onAddModulo(nuevo)
    setNuevoModulo({ nombre: '', fechaInicio: '', fechaFin: '' })
  }

  const handleCrearUnidad = (moduloId: string) => {
    const unidad = nuevasUnidades[moduloId]
    if (!unidad?.nombre || !unidad?.fechaInicio || !unidad?.fechaFin) return
    const nueva: UnidadFormativaDTO = {
      id: uuidv4(),
      nombre: unidad.nombre,
      fechaInicio: unidad.fechaInicio,
      fechaFin: unidad.fechaFin,
    }
    onAddUnidad(nueva, moduloId)
    setNuevasUnidades(prev => ({ ...prev, [moduloId]: { nombre: '', fechaInicio: '', fechaFin: '' } }))
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Diagrama de Gantt: Módulos y Unidades Formativas</h2>

      <div className="border p-4 rounded-lg space-y-2">
        <h3 className="font-semibold">Crear nuevo módulo</h3>
        <Input placeholder="Nombre" value={nuevoModulo.nombre} onChange={e => setNuevoModulo({ ...nuevoModulo, nombre: e.target.value })} />
        <div className="flex gap-2">
          <Input type="date" value={nuevoModulo.fechaInicio} onChange={e => setNuevoModulo({ ...nuevoModulo, fechaInicio: e.target.value })} />
          <Input type="date" value={nuevoModulo.fechaFin} onChange={e => setNuevoModulo({ ...nuevoModulo, fechaFin: e.target.value })} />
        </div>
        <Button onClick={handleCrearModulo}>Añadir módulo</Button>
      </div>

      {modulos.map(mod => (
        <div key={mod.id} className="border rounded p-4">
          <div className="flex justify-between">
            <h4 className="font-semibold">{mod.nombre}</h4>
            <Button variant="ghost" onClick={() => onDeleteModulo(mod.id!)}><Trash2 className="text-red-600 w-4 h-4" /></Button>
          </div>
          <ul className="list-disc ml-4">
            {mod.unidades?.map(uf => (
              <li key={uf.id} className="flex justify-between">
                <span>{uf.nombre} ({uf.fechaInicio} → {uf.fechaFin})</span>
                <Button variant="ghost" onClick={() => onDeleteUnidad(uf.id!)}><Trash2 className="text-red-600 w-4 h-4" /></Button>
              </li>
            ))}
          </ul>

          <div className="mt-4">
            <h5 className="font-medium text-sm">Añadir unidad</h5>
            <Input placeholder="Nombre" value={nuevasUnidades[mod.id!]?.nombre || ''} onChange={e => setNuevasUnidades(prev => ({ ...prev, [mod.id!]: { ...prev[mod.id!], nombre: e.target.value } }))} />
            <div className="flex gap-2">
              <Input type="date" value={nuevasUnidades[mod.id!]?.fechaInicio || ''} onChange={e => setNuevasUnidades(prev => ({ ...prev, [mod.id!]: { ...prev[mod.id!], fechaInicio: e.target.value } }))} />
              <Input type="date" value={nuevasUnidades[mod.id!]?.fechaFin || ''} onChange={e => setNuevasUnidades(prev => ({ ...prev, [mod.id!]: { ...prev[mod.id!], fechaFin: e.target.value } }))} />
            </div>
            <Button size="sm" onClick={() => handleCrearUnidad(mod.id!)}>Añadir unidad</Button>
          </div>
        </div>
      ))}
    </div>
  )
}
