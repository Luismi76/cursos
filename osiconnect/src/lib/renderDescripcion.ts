import { renderEditorJs } from './renderEditor'

export function renderDescripcion(descripcion: string | any): string {
  try {
    const parsed =
      typeof descripcion === 'string' ? JSON.parse(descripcion) : descripcion

    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.blocks)) {
      return renderEditorJs(parsed)
    }

    return `<p>${escapeHtml(descripcion)}</p>`
  } catch (e) {
    console.warn('❌ Error al parsear descripción:', e)
    return `<p>${escapeHtml(descripcion)}</p>`
  }
}

function escapeHtml(str: string): string {
  if (typeof str !== 'string') return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
