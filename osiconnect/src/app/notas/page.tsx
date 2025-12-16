'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const notas = [
  {
    id: 'n1',
    practica: 'Instalación de Ubuntu Server',
    nota: 8.5,
    feedback: 'Buen trabajo. Detallaste bien cada paso.'
  },
  {
    id: 'n2',
    practica: 'Gestión de procesos en Linux',
    nota: 9.0,
    feedback: 'Excelente uso de comandos y análisis del resultado.'
  },
  {
    id: 'n3',
    practica: 'Administración de usuarios en Windows',
    nota: 7.0,
    feedback: 'Correcto, aunque faltó capturar evidencia completa.'
  },
];

export default function NotasPage() {
  return (
    <div className="min-h-screen p-4 space-y-6">
      <h1 className="text-2xl font-bold">Mis Calificaciones</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notas.map((n) => (
          <Card key={n.id} className="bg-card text-card-foreground">
            <CardContent className="p-4 space-y-2">
              <h2 className="text-lg font-semibold">{n.practica}</h2>
              <p className="text-sm text-muted-foreground">{n.feedback}</p>
              <span className="text-base font-bold text-green-700">Nota: {n.nota}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
