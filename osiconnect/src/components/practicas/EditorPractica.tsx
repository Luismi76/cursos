// EditorPractica.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import EditorJS from '@editorjs/editorjs'
import Header from '@editorjs/header'
import List from '@editorjs/list'
import ImageTool from '@editorjs/image'
import { api } from '@/services/api'

export default function EditorPractica({
  data,
  onChange,
}: {
  data?: any // <-- aquí ya lo tienes bien
  onChange?: (data: any) => void
}) {
  const editorRef = useRef<EditorJS | null>(null)
  const holderRef = useRef<HTMLDivElement | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let editor: EditorJS

    const initEditor = async () => {
      if (holderRef.current && !editorRef.current) {
        editor = new EditorJS({
          holder: holderRef.current,
          placeholder: 'Escribe aquí el enunciado de la práctica...',
          data: typeof data === 'string' ? JSON.parse(data) : data, // ✅ Carga correcta
          tools: {
            header: Header,
            list: List,
            image: {
              class: ImageTool,
              config: {
                uploader: {
                  async uploadByFile(file: File) {
                    try {
                      const formData = new FormData()
                      formData.append('file', file)

                      const response = await api.post('/archivos/imagen', formData, {
                        headers: {
                          'Content-Type': 'multipart/form-data',
                        },
                      })

                      const { url } = response.data
                      return {
                        success: 1,
                        file: { url },
                      }
                    } catch (error) {
                      console.error('Error al subir imagen', error)
                      return { success: 0 }
                    }
                  },
                },
              },
            },
          },
          onReady: () => setIsReady(true),
          onChange: async () => {
            const outputData = await editor.save()
            onChange?.(outputData)
          },
        })

        editorRef.current = editor
      }
    }

    initEditor()

    return () => {
      if (editorRef.current && typeof editorRef.current.destroy === 'function') {
        editorRef.current.destroy()
        editorRef.current = null
      }
    }
  }, [data]) // ✅ importante: recargar si cambia la práctica al editar

  return (
    <div ref={holderRef} className="border p-4 rounded bg-white dark:bg-neutral-900 min-h-[300px]">
      {!isReady && <p className="text-gray-500">Cargando editor...</p>}
    </div>
  )
}
