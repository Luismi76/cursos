// src/components/practicas/ResumenEntrega.tsx
'use client'

interface ResumenEntregaProps {
  archivoUrl: string
  comentario?: string
  fechaEntrega: string
}

export function ResumenEntrega({ archivoUrl, comentario, fechaEntrega }: ResumenEntregaProps) {
  return (
    <div className="space-y-2 border rounded p-4 shadow-sm max-w-md">
      <p className="text-sm text-gray-600">
        Entregado el: <span className="font-medium">{new Date(fechaEntrega).toLocaleDateString()}</span>
      </p>
      {comentario && (
        <p className="text-sm">
          <span className="font-semibold">Comentario:</span> {comentario}
        </p>
      )}
      <a
        href={archivoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline text-sm"
      >
        Ver archivo entregado
      </a>
    </div>
  )
}
