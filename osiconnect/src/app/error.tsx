'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground">
            <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
                    <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-500" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">¡Ups! Algo ha salido mal</h1>
                <p className="max-w-md text-muted-foreground">
                    Ha ocurrido un error inesperado. Hemos registrado el problema e intentaremos solucionarlo lo antes posible.
                </p>
                <div className="flex gap-4">
                    <Button onClick={() => reset()}>Intentar de nuevo</Button>
                    <Button variant="outline" onClick={() => window.location.href = '/'}>
                        Ir al inicio
                    </Button>
                </div>
            </div>
        </div>
    )
}
