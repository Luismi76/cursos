'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { crearCurso, listarCursos } from '@/services/adminService'
import { CursoDTO } from '@/lib/types'
import Link from 'next/link'
import { useAuthStore } from '@/hooks/authStore'

export default function AdminPage() {
  const router = useRouter()
  const usuario = useAuthStore((state) => state.usuario)
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [loading, setLoading] = useState(false)
  const [cursos, setCursos] = useState<CursoDTO[]>([])

  // Protect admin route
  useEffect(() => {
    if (usuario && usuario.rol !== 'ADMINISTRADOR') {
      const redirectTo = usuario.rol === 'PROFESOR' ? '/profesor' : '/alumno'
      router.replace(redirectTo)
    }
  }, [usuario, router])

  useEffect(() => {
    if (usuario?.rol === 'ADMINISTRADOR') {
      listarCursos()
        .then(setCursos)
        .catch(() => toast.error('Error al cargar los cursos'))
    }
  }, [usuario])

  const handleCrearCurso = async () => {
    if (!nombre.trim() || !descripcion.trim()) {
      toast.warning('Rellena todos los campos')
      return
    }

    try {
      setLoading(true)
      const nuevo = await crearCurso({ nombre, descripcion })
      toast.success('Curso creado correctamente')
      router.push(`/admin/curso/${nuevo.id}`)
    } catch {
      toast.error('Error al crear el curso')
    } finally {
      setLoading(false)
    }
  }

  // Don't render if not admin
  if (!usuario || usuario.rol !== 'ADMINISTRADOR') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-10">
      <section>
        <h1 className="text-2xl font-bold mb-4">Crear nuevo curso</h1>
        <div className="space-y-3">
          <Input placeholder="Nombre del curso" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <Textarea placeholder="Descripción del curso" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          <Button onClick={handleCrearCurso} disabled={loading}>
            {loading ? 'Creando...' : 'Crear curso'}
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Cursos existentes</h2>
        <div className="space-y-3">
          {cursos.map((curso) => (
            <div key={curso.id} className="p-4 border rounded-md shadow-sm flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{curso.nombre}</h3>
                <p className="text-sm text-gray-600">{curso.descripcion}</p>
              </div>
              <Link href={`/admin/curso/${curso.id}`}>
                <Button variant="secondary">Administrar</Button>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
