'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const wikiArticulos = [
  {
    id: '1',
    titulo: 'Comandos básicos de Linux',
    resumen: 'Aprende los comandos esenciales para operar un sistema Linux desde la terminal.',
  },
  {
    id: '2',
    titulo: 'Gestión de usuarios en Windows',
    resumen: 'Cómo crear, modificar y eliminar cuentas de usuario en sistemas Windows.',
  },
  {
    id: '3',
    titulo: 'Redes TCP/IP: conceptos clave',
    resumen: 'Una introducción sencilla a los fundamentos de redes TCP/IP y configuración básica.',
  },
];

export default function WikiPage() {
  const [busqueda, setBusqueda] = useState('');

  const resultados = wikiArticulos.filter((articulo) =>
    articulo.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    articulo.resumen.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 space-y-6">
      <h1 className="text-2xl font-bold">Wiki Técnica del Curso</h1>

      <Input
        type="text"
        placeholder="Buscar artículo..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="max-w-md"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {resultados.map((articulo) => (
          <Card key={articulo.id} className="bg-card text-card-foreground">
            <CardContent className="p-4 space-y-2">
              <h2 className="text-lg font-semibold">{articulo.titulo}</h2>
              <p className="text-sm text-muted-foreground">{articulo.resumen}</p>
              <Link href={`/wiki/${articulo.id}`}>
                <Button variant="outline" size="sm">Ver más</Button>
              </Link>
            </CardContent>
          </Card>
        ))}

        {resultados.length === 0 && (
          <p className="text-muted-foreground col-span-full">No se encontraron artículos con ese término.</p>
        )}
      </div>
    </div>
  );
}
