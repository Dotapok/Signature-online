'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function HomePageContent() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      // Rediriger vers la page de connexion uniquement si l'utilisateur n'est pas connecté
      router.replace('/auth/signin');
    } else if (status === 'authenticated') {
      // Si l'utilisateur est déjà connecté, rediriger vers le tableau de bord
      router.replace('/dashboard');
    }
    // Si status est 'loading', on ne fait rien et on attend
  }, [status, router]);

  // Afficher un indicateur de chargement pendant la vérification de l'authentification
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Ne rien afficher pendant la redirection
  return null;
}
