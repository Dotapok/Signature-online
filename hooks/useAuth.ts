import { useRouter } from 'next/router';
import { useSession, signIn, signOut, getSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { API_ROUTES } from '@/lib/constants';

interface UserProfile {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  role?: string;
  emailVerified?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}

interface SignInCredentials {
  email: string;
  password: string;
  redirect?: boolean;
}

interface SignUpData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface ResetPasswordData {
  email: string;
}

interface NewPasswordData {
  password: string;
  confirmPassword: string;
  token: string;
}

interface UpdateProfileData {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export function useAuth(redirectTo: string = '/dashboard') {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: status === 'loading',
    error: null,
  });
  
  // Update state when session changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      user: session?.user || null,
      loading: status === 'loading',
    }));
  }, [session, status]);
  
  // Email/Password Sign In
  const signInWithEmail = useCallback(async (credentials: SignInCredentials) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await signIn('credentials', {
        ...credentials,
        redirect: false,
      });
      
      if (result?.error) {
        throw new Error(result.error);
      }
      
      // Update the session
      await update();
      
      // Redirect if needed
      if (credentials.redirect !== false) {
        const redirectPath = router.query.callbackUrl || redirectTo;
        await router.push(redirectPath as string);
      }
      
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sign in';
      setState(prev => ({ ...prev, error: errorMessage }));
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [router, redirectTo, update]);
  
  // OAuth Sign In
  const signInWithOAuth = useCallback(async (provider: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await signIn(provider, { callbackUrl: redirectTo });
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sign in with OAuth';
      setState(prev => ({ ...prev, error: errorMessage }));
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [redirectTo]);
  
  // Sign Up
  const signUp = useCallback(async (data: SignUpData) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiClient.post(API_ROUTES.AUTH.SIGN_UP, data);
      
      // Sign in the user after successful registration
      if (response.success) {
        await signInWithEmail({
          email: data.email,
          password: data.password,
          redirect: true,
        });
      }
      
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create an account';
      setState(prev => ({ ...prev, error: errorMessage }));
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [signInWithEmail]);
  
  // Sign Out
  const signOutUser = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await signOut({ redirect: false });
      await router.push('/auth/signin');
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sign out';
      setState(prev => ({ ...prev, error: errorMessage }));
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [router]);
  
  // Request Password Reset
  const requestPasswordReset = useCallback(async (data: ResetPasswordData) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await apiClient.post(API_ROUTES.AUTH.FORGOT_PASSWORD, data);
      toast.success('Password reset link sent to your email');
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to request password reset';
      setState(prev => ({ ...prev, error: errorMessage }));
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);
  
  // Reset Password
  const resetPassword = useCallback(async (data: NewPasswordData) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await apiClient.post(API_ROUTES.AUTH.RESET_PASSWORD, data);
      toast.success('Password reset successfully');
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to reset password';
      setState(prev => ({ ...prev, error: errorMessage }));
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);
  
  // Update Profile
  const updateProfile = useCallback(async (data: UpdateProfileData) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiClient.put(API_ROUTES.USERS.ME, data);
      
      // Update the session
      await update();
      
      toast.success('Profile updated successfully');
      return { success: true, data: response.data };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update profile';
      setState(prev => ({ ...prev, error: errorMessage }));
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [update]);
  
  // Check if user is authenticated
  const isAuthenticated = status === 'authenticated';
  
  // Check if user has a specific role
  const hasRole = useCallback((role: string): boolean => {
    if (!session?.user) return false;
    return session.user.role === role;
  }, [session]);
  
  // Get the current user
  const user = state.user;
  
  return {
    // State
    user,
    loading: state.loading,
    error: state.error,
    isAuthenticated,
    
    // Actions
    signIn: signInWithEmail,
    signInWithOAuth,
    signUp,
    signOut: signOutUser,
    requestPasswordReset,
    resetPassword,
    updateProfile,
    hasRole,
    
    // Session
    session,
    updateSession: update,
    
    // Status
    status,
  };
}

// Server-side auth check
export async function requireAuth(context: any) {
  const session = await getSession(context);
  
  if (!session) {
    return {
      redirect: {
        destination: `/auth/signin?callbackUrl=${context.resolvedUrl}`,
        permanent: false,
      },
    };
  }
  
  return {
    props: { session },
  };
}

// Server-side admin check
export async function requireAdmin(context: any) {
  const session = await getSession(context);
  
  if (!session) {
    return {
      redirect: {
        destination: `/auth/signin?callbackUrl=${context.resolvedUrl}`,
        permanent: false,
      },
    };
  }
  
  // Check if user has admin role
  if (session.user?.role !== 'ADMIN') {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }
  
  return {
    props: { session },
  };
}

// Server-side guest check
export async function requireGuest(context: any) {
  const session = await getSession(context);
  
  if (session) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }
  
  return {
    props: {},
  };
}
