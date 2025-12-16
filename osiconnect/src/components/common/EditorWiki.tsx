'use client'

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import EditorJS from '@editorjs/editorjs'
import Header from '@editorjs/header'
import List from '@editorjs/list'
import ImageTool from '@editorjs/image'
import Quote from '@editorjs/quote'
import Table from '@editorjs/table'
import Checklist from '@editorjs/checklist'
import Code from '@editorjs/code'

import { api } from '@/services/api'

export interface EditorWikiHandle {
  getContent: () => Promise<any>
}

interface EditorWikiProps {
  initialData?: any
}

const EditorWiki = forwardRef<EditorWikiHandle, EditorWikiProps>(({ initialData }, ref) => {
  const editorRef = useRef<EditorJS | null>(null)
  const holderRef = useRef<HTMLDivElement | null>(null)
  const [isReady, setIsReady] = useState(false)

  useImperativeHandle(ref, () => ({
    getContent: async () => {
      return await editorRef.current?.save()
    },
  }))

  useEffect(() => {
    if (holderRef.current && !editorRef.current) {
      const editor = new EditorJS({
        holder: holderRef.current,
        placeholder: 'Escribe el contenido de la wiki del curso...',
        data:
          typeof initialData === 'string'
            ? isEditorJson(initialData)
              ? JSON.parse(initialData)
              : undefined
            : initialData,
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
          quote: Quote,
          table: Table,
          checklist: Checklist,
          code: Code,

        },
        onReady: () => setIsReady(true),
      })

      editorRef.current = editor
    }

    return () => {
      if (editorRef.current && typeof editorRef.current.destroy === 'function') {
        editorRef.current.destroy()
        editorRef.current = null
      }
    }
  }, [initialData])

  return (
    <div
      ref={holderRef}
      className="border p-4 rounded bg-white dark:bg-neutral-900 min-h-[300px]"
    >
      {!isReady && <p className="text-gray-500">Cargando editor...</p>}
    </div>
  )
})

export default EditorWiki

function isEditorJson(text: string): boolean {
  try {
    const json = JSON.parse(text)
    return typeof json === 'object' && json.blocks !== undefined
  } catch {
    return false
  }
}
