'use client'

import dynamic from 'next/dynamic'

// Evita el error "Element is not defined"
const EditorPractica = dynamic(() => import('./EditorPractica'), {
  ssr: false,
  loading: () => <p className="text-muted-foreground">Cargando editor...</p>,
})

export default EditorPractica
