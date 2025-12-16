// src/components/common/TituloSeccion.tsx
'use client'

import { ReactNode } from "react"

interface TituloSeccionProps {
  children: ReactNode
  className?: string
}

export function TituloSeccion({ children, className = "" }: TituloSeccionProps) {
  return (
    <h1 className={`text-2xl font-bold mb-6 ${className}`}>
      {children}
    </h1>
  )
}
