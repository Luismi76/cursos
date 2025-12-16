import './globals.css';
import React from 'react';
import { Metadata } from 'next';
import ClientLayout from '@/components/layout/ClientLayout';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: 'SysConnect',
  description: 'Plataforma de gestión de cursos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background font-sans antialiased">
        <ErrorBoundary>
          <ClientLayout>
            {children}
          </ClientLayout>
        </ErrorBoundary>
      </body>
    </html>
  );
}
