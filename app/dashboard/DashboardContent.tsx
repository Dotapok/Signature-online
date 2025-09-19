'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Dashboard } from '@/components/dashboard';

export default function DashboardContent() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  console.log('=== DashboardPage ===');
  console.log('Statut de la session:', status);
  console.log('Données de session:', session);
  console.log('===================');

  useEffect(() => {
    console.log('useEffect - Statut de la session:', status);
    console.log('useEffect - Données de session:', session);
    
    if (status === 'loading') {
      console.log('Chargement de la session...');
      return;
    }
    
    if (status === 'unauthenticated' || !session) {
      console.log('Utilisateur non authentifié, redirection vers /auth/signin');
      router.push('/auth/signin');
      return;
    }
    
    // Vérifier si le token est expiré
    const tokenExpires = session?.expires ? new Date(session.expires) : null;
    const now = new Date();
    
    if (tokenExpires && tokenExpires <= now) {
      console.log('Session expirée, déconnexion...');
      // Forcer une déconnexion et une reconnexion
      signOut({ callbackUrl: '/auth/signin' });
      return;
    }
    
    // Si nous sommes ici, l'utilisateur est authentifié
    console.log('Utilisateur authentifié, affichage du tableau de bord');
    setIsCheckingSession(false);
    
  }, [status, session, router]);

  // Pendant la vérification de la session
  if (isCheckingSession) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Si nous sommes ici, l'utilisateur est authentifié
  return (
    <div className="min-h-screen bg-background">
      <Dashboard />
    </div>
  );
}
