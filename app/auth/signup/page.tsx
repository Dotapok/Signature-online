'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  // Vérifier si l'inscription a réussi
  useEffect(() => {
    const message = searchParams?.get('message');
    if (message === 'RegistrationSuccessful') {
      setSuccessMessage('Inscription réussie ! Vous pouvez maintenant vous connecter.');
      // Nettoyer l'URL
      const url = new URL(window.location.href);
      url.searchParams.delete('message');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    // Validation côté client
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      setIsLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Veuillez entrer une adresse email valide.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Gestion des erreurs spécifiques
        if (response.status === 409) {
          setError('Un compte existe déjà avec cette adresse email.');
        } else if (response.status === 400) {
          setError(data.error || 'Veuillez vérifier les informations fournies.');
        } else {
          setError(data.message || 'Une erreur est survenue lors de l\'inscription.');
        }
        setIsLoading(false);
        return;
      }

      // Inscription réussie, rediriger vers la page de connexion avec message de succès
      setSuccessMessage('Inscription réussie ! Redirection...');
      
      // Attendre un peu avant la redirection pour que l'utilisateur puisse voir le message
      setTimeout(() => {
        router.push('/auth/signin?message=RegistrationSuccessful');
      }, 1500);
      
      return;
    } catch (err) {
      setError('Une erreur est survenue lors de l\'inscription.');
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
          <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
          <CardDescription>Rejoignez notre plateforme de signature numérique</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {successMessage && (
            <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm mb-4 border border-green-200">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                type="text"
                placeholder="Votre nom complet"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="Créez un mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-muted-foreground/50 border-t-muted-foreground rounded-full animate-spin mr-2" />
              ) : null}
              {isLoading ? 'Inscription en cours...' : 'S\'inscrire'}
            </Button>
            
            <p className="text-xs text-muted-foreground mt-2">
              En vous inscrivant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
            </p>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Vous avez déjà un compte ? {' '}
            <a href="/auth/signin" className="font-medium text-primary hover:underline">
              Connectez-vous
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
