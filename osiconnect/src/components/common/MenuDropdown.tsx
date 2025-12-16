// components/common/MenuDropdown.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export function MenuDropdown() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
        <Menu className="h-5 w-5" />
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-md z-50">
          {['dashboard', 'wiki', 'practicas', 'notas', 'perfil'].map((ruta) => (
            <Link
              key={ruta}
              className="block px-4 py-2 hover:bg-gray-100"
              href={`/${ruta}`}
              onClick={() => setOpen(false)}
            >
              {ruta.charAt(0).toUpperCase() + ruta.slice(1)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
