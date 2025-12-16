// src/app/chat/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/hooks/authStore';
import { obtenerUsuarios } from '@/services/chatService';
import ChatBox from '@/components/common/ChatBox';
import type { Usuario } from '@/lib/types';

export default function ChatPage() {
  const usuario = useAuthStore((state) => state.usuario);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [receptorId, setReceptorId] = useState<string | null>(null);

  useEffect(() => {
    if (!usuario) return;

    obtenerUsuarios().then(data => {
      const otrosUsuarios = data.filter(u => u.id !== usuario.id);
      setUsuarios(otrosUsuarios);
    });
  }, [usuario]);

  if (!usuario) return <div>Cargando usuario...</div>;

  return (
    <div className="flex gap-4 p-4">
      <div className="w-1/3 border p-2">
        <h2 className="font-bold mb-2">Usuarios</h2>
        <ul>
          {usuarios.map(u => (
            <li key={u.id}>
              <button onClick={() => setReceptorId(u.id)} className="text-blue-600 underline">
                {u.nombre}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="w-2/3">
        {receptorId ? (
          <ChatBox userId={usuario.id} receptorId={receptorId} />
        ) : (
          <p>Selecciona un usuario para iniciar el chat.</p>
        )}
      </div>
    </div>
  );
}
