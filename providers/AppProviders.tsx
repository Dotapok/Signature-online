'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/contexts/AuthContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider 
      // Forcer la vérification de session à chaque chargement de page
      refetchOnWindowFocus={true}
      // Désactiver le rechargement automatique de la session
      refetchInterval={0}
    >
      <AuthProvider>{children}</AuthProvider>
    </SessionProvider>
  );
}
