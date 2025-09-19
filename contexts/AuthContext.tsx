import { createContext, useContext, useEffect, useState, Suspense } from 'react';
import { useSession, signIn, signOut, getSession } from 'next-auth/react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Session } from 'next-auth';

type User = {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
};

type AuthContextType = {
  user: User | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  signIn: (provider?: string, options?: any) => Promise<void>;
  signOut: () => Promise<void>;
  update: (data: any) => Promise<Session | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProviderInternal({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setUser(session.user);
    } else if (status === 'unauthenticated') {
      setUser(null);
    }
  }, [session, status]);

  // Handle sign in with provider or credentials
  const handleSignIn = async (provider?: string, options = {}) => {
    try {
      const callbackUrl = (searchParams && searchParams.get('callbackUrl')) || '/dashboard';
      if (provider) {
        await signIn(provider, { ...options, callbackUrl });
      } else {
        await signIn('credentials', { ...options, redirect: true, callbackUrl });
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      setUser(null);
      router.push('/auth/signin');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  // Handle session update
  const handleUpdate = async (data: any) => {
    try {
      const updatedSession = await update(data);
      if (updatedSession?.user) {
        setUser(updatedSession.user);
      }
      return updatedSession;
    } catch (error) {
      console.error('Update session error:', error);
      throw error;
    }
  };

  const value = {
    user,
    status,
    signIn: handleSignIn,
    signOut: handleSignOut,
    update: handleUpdate,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    }>
      <AuthProviderInternal>{children}</AuthProviderInternal>
    </Suspense>
  );
}


// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function WithAuthInternal({ Component, props }: { Component: React.ComponentType<any>, props: any }) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      setIsRedirecting(true);
      let callbackUrl = pathname || '/';
      const params = searchParams?.toString();
      if (params) {
        callbackUrl += `?${params}`;
      }
      // Utiliser replace au lieu de push pour éviter d'ajouter à l'historique
      router.replace(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    } else if (status === 'authenticated') {
      setIsRedirecting(false);
    }
  }, [status, router, pathname, searchParams]);

  // Afficher un écran de chargement pendant la vérification de l'authentification
  // ou pendant la redirection
  if (status === 'loading' || isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Ne rendre le composant que si l'utilisateur est authentifié
  if (status === 'authenticated') {
    return <Component {...props} />;
  }

  // Par défaut, ne rien afficher (en attendant la redirection)
  return null;
}


// Higher Order Component to protect pages that require authentication
export function withAuth(Component: React.ComponentType<any>) {
  return function WithAuth(props: any) {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      }>
        <WithAuthInternal Component={Component} props={props} />
      </Suspense>
    );
  };
}


// Higher Order Component to protect API routes
export function withApiAuth(handler: any) {
  return async (req: any, res: any) => {
    const session = await getSession({ req });

    if (!session) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    // Add user to request object
    req.user = session.user;

    return handler(req, res);
  };
}

// Helper function to get session on the server
export async function getServerSideAuth(context: any) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: `/auth/signin?callbackUrl=${encodeURIComponent(context.resolvedUrl)}`,
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}