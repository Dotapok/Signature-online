'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Dashboard } from '@/components/dashboard';

function DashboardContent() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  console.log('=== DashboardPage ===');
  console.log('Statut de la session:', status);
  console.log('Données de session:', session);
  console.log('===================');

  useEffect(() => {
    console.log('useEffect - Statut de la session:', status);
    
    const checkAuth = async () => {
      try {
        // Vérifier d'abord la session côté client
        if (status === 'unauthenticated') {
          console.log('Non authentifié, vérification côté serveur...');
          
          // Essayer de rafraîchir la session
          const refreshedSession = await update();
          
          if (!refreshedSession) {
            console.log('Aucune session valide, redirection vers /auth/signin');
            router.replace('/auth/signin');
          } else {
            console.log('Session rafraîchie avec succès:', refreshedSession);
          }
        } else if (status === 'authenticated') {
          console.log('Authentifié avec succès, session:', session);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de la session:', error);
        router.replace('/auth/signin');
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkAuth();
  }, [status, router, session, update]);

  // Afficher un indicateur de chargement pendant la vérification de l'authentification
  if (status === 'loading' || isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas authentifié, ne rien afficher (la redirection est gérée dans le useEffect)
  if (status !== 'authenticated') {
    return null;
  }

  // Si l'utilisateur est authentifié, afficher le tableau de bord
  if (status === 'authenticated') {
    return <Dashboard />;
  }

  // Ne rien afficher par défaut (pendant la redirection)
  return null;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}