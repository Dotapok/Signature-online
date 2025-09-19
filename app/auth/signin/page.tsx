'use client';

import { Suspense, useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const message = searchParams?.get('message');
    if (message === 'RegistrationSuccessful') {
      setSuccessMessage('Inscription réussie ! Vous pouvez maintenant vous connecter.');
      const url = new URL(window.location.href);
      url.searchParams.delete('message');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  const handleCredentialSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (typeof window === 'undefined') {
      setError('Erreur d\'initialisation. Veuillez rafraîchir la page.');
      setIsLoading(false);
      return;
    }

    if (!email || !password) {
      setError('Veuillez saisir votre email et votre mot de passe');
      setIsLoading(false);
      return;
    }

    try {
      const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard';

      console.log('Tentative de connexion avec:', { email });

      // Tenter de se connecter
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      console.log('Résultat de la connexion:', result);

      if (result?.error) {
        console.error('Erreur de connexion:', result.error);
        setError('Email ou mot de passe incorrect.');
        setIsLoading(false);
        return;
      }

      if (result?.url) {
        console.log(`Connexion réussie, redirection vers ${result.url}`);
        // Forcer une actualisation de la page pour s'assurer que la session est bien chargée
        window.location.href = result.url;
        return;
      }

    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setError('Une erreur est survenue lors de la connexion. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <FileText className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
          <CardDescription>Accédez à votre espace de signature numérique</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {successMessage && (
            <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm mb-4 border border-green-200">
              {successMessage}
            </div>
          )}
          
          <form onSubmit={handleCredentialSignIn} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm mb-4 border border-red-200">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-sm text-muted-foreground"
                  onClick={() => router.push('/auth/forgot-password')}
                >
                  Mot de passe oublié ?
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Pas encore de compte ?{' '}
            <Button
              variant="link"
              className="h-auto p-0 text-primary"
              onClick={() => router.push('/auth/signup')}
            >
              S'inscrire
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
