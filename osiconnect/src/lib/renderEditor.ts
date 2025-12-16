// utils/renderEditor.ts

export function renderEditorJs(data: string | object): string {
  let parsed: any

  if (typeof data === 'string') {
    try {
      parsed = JSON.parse(data)
    } catch {
      return `<p>${escapeHtml(data)}</p>`
    }
  } else {
    parsed = data
  }

  if (!parsed.blocks || !Array.isArray(parsed.blocks)) return ''

  return parsed.blocks
    .map((block: any) => {
      switch (block.type) {
        case 'paragraph':
          return `<p>${escapeHtml(block.data.text)}</p>`
        case 'header':
          return `<h${block.data.level}>${escapeHtml(block.data.text)}</h${block.data.level}>`
        case 'list':
          const tag = block.data.style === 'ordered' ? 'ol' : 'ul'
          const items = block.data.items
            .map((item: string) => `<li>${escapeHtml(item)}</li>`)
            .join('')
          return `<${tag}>${items}</${tag}>`
        case 'image':
          return `<img src="${block.data.file.url}" alt="" />`
        default:
          return ''
      }
    })
    .join('')
}

function escapeHtml(str: any): string {
  if (typeof str !== 'string') {
    str = String(str ?? '') // convierte null/undefined a string vacío
  }
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

