import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { NextAuthOptions, getServerSession, User } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { compare } from 'bcryptjs';
import { randomBytes, randomUUID } from 'crypto';
import { config } from './config';

const prisma = new PrismaClient();

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email: string;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
    emailVerified?: Date | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    // Email/Password authentication
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email et mot de passe requis');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error('Aucun utilisateur trouvé avec cet email');
        }

        const isValid = await compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('Mot de passe incorrect');
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),

    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),

    // GitHub OAuth
    GitHubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
  ],

  // Database configuration
  adapter: PrismaAdapter(prisma),

  // Session configuration
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },

  // Cookies configuration
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
  
  // Use secure cookies in production
  useSecureCookies: process.env.NODE_ENV === 'production',
  
  // Force JWT session strategy
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // Debug mode
  debug: process.env.NODE_ENV === 'development',

  // Pages configuration
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user',
  },

  // Events
  events: {
    async signIn(message) {
      console.log(`User ${message.user.email} signed in`);
    },
    async signOut(message) {
      console.log(`User signed out`);
    },
    async createUser(message) {
      console.log(`User created: ${message.user.email}`);
    },
    async linkAccount(message) {
      console.log(`Account linked: ${message.account.provider}`);
    },
  },

  // Callbacks
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if (!user) {
        console.log('Tentative de connexion échouée: utilisateur non valide');
        return false;
      }
      console.log('Utilisateur autorisé à se connecter:', user.email);
      return true;
    },
    
    async jwt({ token, user, account, profile, isNewUser }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      return token;
    },
    
    async session({ session, token, user }) {
      console.log('Session callback - Token:', token);
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email as string;
        session.user.image = token.picture;
      }
      console.log('Session callback - Session mise à jour:', session);
      return session;
    },
    
    async redirect({ url, baseUrl }) {
      try {
        // Si pas d'URL fournie, rediriger vers /dashboard
        if (!url) return '/dashboard';
        
        // Si l'URL est relative, l'ajouter à la baseUrl
        if (url.startsWith('/')) {
          return `${baseUrl}${url}`;
        }
        
        // Si l'URL est absolue, vérifier qu'elle est sur la même origine
        try {
          const urlObj = new URL(url);
          const baseUrlObj = new URL(baseUrl);
          
          if (urlObj.origin === baseUrlObj.origin) {
            return url;
          }
        } catch (e) {
          console.warn('URL de redirection invalide:', url);
        }
        
        // Par défaut, rediriger vers /dashboard
        return '/dashboard';
      } catch (error) {
        console.error('Erreur dans le callback de redirection:', error);
        return '/';
      }
    },
  },

  // La configuration des cookies est maintenant gérée dans la configuration principale

  // Custom error handling
  logger: {
    error(code, metadata) {
      console.error(code, metadata);
    },
    warn(code) {
      console.warn(code);
    },
    debug(code, metadata) {
      console.debug(code, metadata);
    },
  },
};

// Helper to get server-side session
export const getServerAuthSession = (req: any, res: any) => {
  return getServerSession(req, res, authOptions);
};

// Type for authenticated user in Next.js API routes
export type NextApiRequestWithUser = Request & {
  user: User;
};

// Middleware to protect API routes
export const withAuth = (handler: any) => {
  return async (req: any, res: any) => {
    const session = await getServerAuthSession(req, res);

    if (!session) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    // Add user to request object
    req.user = session.user;

    return handler(req, res);
  };
};

// Middleware to protect pages
export const withPageAuth = (getServerSidePropsFunc?: any) => {
  return async (context: any) => {
    const session = await getServerAuthSession(context.req, context.res);

    if (!session) {
      return {
        redirect: {
          destination: '/auth/signin',
          permanent: false,
        },
      };
    }

    if (getServerSidePropsFunc) {
      return {
        props: {
          session,
          ...(await getServerSidePropsFunc(context)),
        },
      };
    }

    return {
      props: { session },
    };
  };
};
