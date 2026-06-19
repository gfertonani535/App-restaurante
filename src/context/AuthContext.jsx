import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase.js';
import { getCurrentProfile } from '@/services/users.service.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => (supabase ? undefined : null));
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');

  const signOut = useCallback(async () => {
    if (!supabase) {
      setSession(null);
      setProfile(null);
      return;
    }

    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!supabase) {
      setProfile(null);
      return null;
    }

    setProfileLoading(true);
    setProfileError('');

    try {
      const currentProfile = await getCurrentProfile();
      setProfile(currentProfile);
      return currentProfile;
    } catch (error) {
      setProfile(null);
      setProfileError(error instanceof Error ? error.message : 'No se pudo cargar tu perfil.');
      return null;
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      return undefined;
    }

    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (session?.user) {
        refreshProfile();
        return;
      }

      if (session === null) {
        setProfile(null);
        setProfileError('');
        setProfileLoading(false);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refreshProfile, session]);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        role: profile?.role ?? null,
        loading: session === undefined,
        profileLoading,
        profileError,
        refreshProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
