// EditorModulo.tsx
'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { UnidadFormativaDTO, ModuloDTO } from "@/lib/types"
import { Trash2 } from "lucide-react"

interface Props {
  modulo: ModuloDTO
  onUpdateModulo: (modificado: ModuloDTO) => void
  onDeleteModulo: (id: string) => void
  onUpdateUnidad: (unidad: UnidadFormativaDTO, moduloId: string) => void
  onDeleteUnidad: (unidadId: string) => void
}

export function EditorModulo({ modulo, onUpdateModulo, onDeleteModulo, onUpdateUnidad, onDeleteUnidad }: Props) {
  const [nombre, setNombre] = useState(modulo.nombre)
  const [fechaInicio, setFechaInicio] = useState<Date | undefined>(modulo.fechaInicio ? new Date(modulo.fechaInicio) : undefined)
  const [fechaFin, setFechaFin] = useState<Date | undefined>(modulo.fechaFin ? new Date(modulo.fechaFin) : undefined)

  const handleSaveModulo = () => {
    onUpdateModulo({
      ...modulo,
      nombre,
      fechaInicio: fechaInicio?.toISOString().split('T')[0] ?? '',
      fechaFin: fechaFin?.toISOString().split('T')[0] ?? '',
      unidades: modulo.unidades ?? []
    })
  }

  const unidades = modulo.unidades ?? []

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <Input value={nombre} onChange={e => setNombre(e.target.value)} className="font-bold text-lg" />
        <Button variant="ghost" onClick={() => onDeleteModulo(modulo.id!)}>
          <Trash2 className="w-5 h-5 text-red-600" />
        </Button>
      </div>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              {fechaInicio ? format(fechaInicio, "PPP", { locale: es }) : "Fecha de inicio"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={fechaInicio} onSelect={setFechaInicio} initialFocus />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              {fechaFin ? format(fechaFin, "PPP", { locale: es }) : "Fecha de fin"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={fechaFin} onSelect={setFechaFin} initialFocus />
          </PopoverContent>
        </Popover>
      </div>
      <Button onClick={handleSaveModulo} variant="default">Guardar módulo</Button>

      <div className="pt-4 space-y-4">
        {unidades.length === 0 && (
          <p className="text-sm text-muted-foreground">No hay unidades formativas añadidas.</p>
        )}
        {unidades.map(unidad => (
          <EditorUnidad
            key={unidad.id}
            unidad={unidad}
            moduloId={modulo.id!}
            onUpdate={onUpdateUnidad}
            onDelete={onDeleteUnidad}
          />
        ))}

        {/* Añadir nueva unidad */}
        <UnidadFormativaInput onAdd={(nuevaUF) => onUpdateUnidad(nuevaUF, modulo.id!)} />
      </div>
    </div>
  )
}

function EditorUnidad({ unidad, moduloId, onUpdate, onDelete }: {
  unidad: UnidadFormativaDTO
  moduloId: string
  onUpdate: (unidad: UnidadFormativaDTO, moduloId: string) => void
  onDelete: (id: string) => void
}) {
  const [nombre, setNombre] = useState(unidad.nombre)
  const [fechaInicio, setFechaInicio] = useState<Date | undefined>(unidad.fechaInicio ? new Date(unidad.fechaInicio) : undefined)
  const [fechaFin, setFechaFin] = useState<Date | undefined>(unidad.fechaFin ? new Date(unidad.fechaFin) : undefined)

  const handleSave = () => {
    onUpdate({
      ...unidad,
      nombre,
      fechaInicio: fechaInicio?.toISOString().split('T')[0] ?? '',
      fechaFin: fechaFin?.toISOString().split('T')[0] ?? '',
    }, moduloId)
  }

  return (
    <div className="border-l-2 pl-4 space-y-2">
      <div className="flex justify-between items-center">
        <Input value={nombre} onChange={e => setNombre(e.target.value)} className="text-base" />
        <Button variant="ghost" onClick={() => onDelete(unidad.id!)}>
          <Trash2 className="w-4 h-4 text-red-600" />
        </Button>
      </div>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              {fechaInicio ? format(fechaInicio, "PPP", { locale: es }) : "Fecha de inicio"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={fechaInicio} onSelect={setFechaInicio} initialFocus />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              {fechaFin ? format(fechaFin, "PPP", { locale: es }) : "Fecha de fin"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={fechaFin} onSelect={setFechaFin} initialFocus />
          </PopoverContent>
        </Popover>
      </div>
      <Button onClick={handleSave} variant="secondary">Guardar unidad</Button>
    </div>
  )
}

function UnidadFormativaInput({ onAdd }: { onAdd: (unidad: UnidadFormativaDTO) => void }) {
  const [uf, setUf] = useState<UnidadFormativaDTO>({ nombre: '', fechaInicio: '', fechaFin: '' })

  return (
    <div className="space-y-2 pt-4">
      <h4 className="text-sm font-medium">Añadir unidad formativa</h4>
      <Input
        placeholder="Nombre de la unidad"
        value={uf.nombre}
        onChange={(e) => setUf({ ...uf, nombre: e.target.value })}
      />
      <div className="flex gap-2">
        <Input
          type="date"
          value={uf.fechaInicio || ''}
          onChange={(e) => setUf({ ...uf, fechaInicio: e.target.value })}
        />
        <Input
          type="date"
          value={uf.fechaFin || ''}
          onChange={(e) => setUf({ ...uf, fechaFin: e.target.value })}
        />
      </div>
      <Button
        size="sm"
        onClick={() => {
          if (!uf.nombre || !uf.fechaInicio || !uf.fechaFin) return
          onAdd(uf)
          setUf({ nombre: '', fechaInicio: '', fechaFin: '' })
        }}
      >
        Añadir unidad
      </Button>
    </div>
  )
}
