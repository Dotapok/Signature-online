'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

export default function NotFoundContent() {
  // Ce composant utilise useSearchParams qui nécessite d'être dans un Client Component
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 text-center">
      <div className="mx-auto max-w-md space-y-6">
        <div className="flex justify-center">
          <FileText className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">404</h1>
        <h2 className="text-2xl font-semibold">Page non trouvée</h2>
        
        {error && (
          <p className="text-muted-foreground">
            {error}
          </p>
        )}
        
        <p className="text-muted-foreground">
          Désolé, nous n'avons pas trouvé la page que vous cherchez.
        </p>
        
        <div className="pt-6">
          <Button asChild>
            <Link href="/">
              Retour à l'accueil
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
