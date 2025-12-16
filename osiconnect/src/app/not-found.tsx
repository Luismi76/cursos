"use client";

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground">
            <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-muted p-4">
                    <FileQuestion className="h-12 w-12 text-muted-foreground" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">404</h1>
                <h2 className="text-xl font-semibold text-muted-foreground">Página no encontrada</h2>
                <p className="max-w-md text-muted-foreground">
                    Lo sentimos, no hemos podido encontrar la página que buscas. Puede que haya sido eliminada o que la URL sea incorrecta.
                </p>
                <div className="flex gap-4">
                    <Link href="/">
                        <Button>Volver al inicio</Button>
                    </Link>
                    <Button variant="outline" onClick={() => window.history.back()}>
                        Volver atrás
                    </Button>
                </div>
            </div>
        </div>
    )
}
