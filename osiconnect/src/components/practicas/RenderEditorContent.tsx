'use client'

import { useEffect, useState } from 'react'

type EditorData = {
  blocks: { type: string; data: any }[]
}

export default function RenderEditorContent({ data }: { data: EditorData }) {
  const [html, setHtml] = useState<string>('')

  useEffect(() => {
    if (!data?.blocks) return

    const rendered = data.blocks.map((block, index) => {
      switch (block.type) {
        case 'paragraph':
          return `<p>${block.data.text}</p>`

        case 'header':
          return `<h${block.data.level}>${block.data.text}</h${block.data.level}>`

        case 'list':
          if (block.data.style === 'checklist') {
            return `
              <ul data-checklist style="list-style: none; padding-left: 0;">
                ${block.data.items.map((item: any, i: number) => `
                  <li style="margin: 4px 0;">
                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                      <input type="checkbox" data-index="${index}-${i}" ${item.meta?.checked ? 'checked' : ''} />
                      <span>${item.content}</span>
                    </label>
                  </li>
                `).join('')}
              </ul>
            `
          } else {
            const tag = block.data.style === 'ordered' ? 'ol' : 'ul'
            return `<${tag}>${block.data.items.map((item: string) => `<li>${item}</li>`).join('')}</${tag}>`
          }

        case 'image':
          return `<img src="${block.data.file?.url}" alt="${block.data.caption || ''}" style="max-width:100%"/>`

        case 'quote':
          return `<blockquote><p>${block.data.text}</p><footer>– ${block.data.caption || ''}</footer></blockquote>`

        case 'code':
          return `<pre style="background:#1e1e1e;color:#fff;padding:0.75rem;border-radius:0.5rem;overflow-x:auto;"><code>${block.data.code}</code></pre>`

        case 'table':
          const rows = block.data.content.map((row: string[]) =>
            `<tr>${row.map(cell => `<td style="border:1px solid #ccc;padding:4px;">${cell}</td>`).join('')}</tr>`
          ).join('')
          return `<table style="border-collapse: collapse;">${rows}</table>`

        default:
          return `<pre style="color:red;">[Bloque no soportado: ${block.type}]</pre>`
      }
    }).join('')

    setHtml(rendered)
  }, [data])

  // Manejo de interactividad local para checklists
  useEffect(() => {
    const checklist = document.querySelectorAll('ul[data-checklist] input[type="checkbox"]')

    checklist.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        // Opcional: podrías guardar el estado localmente
        console.log(`Checkbox ${checkbox.getAttribute('data-index')} marcado:`)
      })
    })

    return () => {
      checklist.forEach(checkbox => {
        checkbox.removeEventListener('change', () => {})
      })
    }
  }, [html])

  return (
    <div
      className="prose dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
