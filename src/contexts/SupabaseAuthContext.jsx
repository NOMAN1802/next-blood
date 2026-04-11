
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase, supabaseAdmin } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // New states for role management
  const [isLoadingRole, setIsLoadingRole] = useState(true);
  const [roleError, setRoleError] = useState(null);

  const handleSession = useCallback(async (currentSession) => {
    setSession(currentSession);
    
    if (!currentSession?.user) {
      setUser(null);
      setIsLoadingRole(false);
      setLoading(false);
      return;
    }

    // Start loading profile data
    setIsLoadingRole(true);
    setRoleError(null);

    try {
      // 1. Get basic user info from session
      let currentUser = { ...currentSession.user };
      
      // 2. Fetch detailed profile from public.users table
      // Using supabaseAdmin to bypass RLS and always get the correct role
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('users')
        .select('role, full_name, avatar_url')
        .eq('id', currentSession.user.id)
        .single();

      if (profileError) {
        console.warn("Profile fetch warning:", profileError.message);
        
        // Fallback: Use metadata if DB profile is missing
        // This often happens for new users before the trigger runs or if trigger failed
        const metaRole = currentSession.user.user_metadata?.role;
        currentUser.role = metaRole || 'user';
        currentUser.isProfileMissing = true;
        
        // If it's a specific auth error, we might want to set roleError
        if (profileError.code !== 'PGRST116') { // PGRST116 is "Row not found"
             setRoleError("Could not load user profile permissions.");
        }
      } else if (profile) {
        // Merge DB profile data into user object
        currentUser = {
          ...currentUser,
          role: profile.role || 'user', // DB role takes precedence
          full_name: profile.full_name || currentUser.user_metadata?.full_name,
          avatar_url: profile.avatar_url || currentUser.user_metadata?.avatar_url,
          isProfileMissing: false
        };
      }

      // 3. Special handling for Super Admin by email (hardcoded safety)
      // This ensures the owner always has access even if DB is messed up
      if (currentUser.email === 'joydutta398878@gmail.com') {
        currentUser.role = 'super_admin';
      }

      setUser(currentUser);
    } catch (err) {
      console.error("Auth context error:", err);
      setRoleError(err.message);
      // Ensure we still set a user so the app doesn't crash, just with limited access
      setUser({ ...currentSession.user, role: 'user', error: err.message });
    } finally {
      setIsLoadingRole(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial session check
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        await handleSession(session);
      } catch (err) {
        console.error("Get session error:", err);
        setLoading(false);
        setIsLoadingRole(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
           await handleSession(session);
        } else if (event === 'SIGNED_OUT') {
           await handleSession(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [handleSession]);

  const signUp = useCallback(async (email, password, options) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options,
    });
    if (error) toast({ variant: "destructive", title: "Sign up Failed", description: error.message });
    return { error };
  }, [toast]);

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) toast({ variant: "destructive", title: "Sign in Failed", description: error.message });
    return { error };
  }, [toast]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast({ variant: "destructive", title: "Sign out Failed", description: error.message });
    return { error };
  }, [toast]);

  const value = useMemo(() => ({
    user,
    session,
    loading,        // Auth initialization loading
    isLoadingRole,  // Profile/Role fetching loading
    roleError,      // Errors during role fetch
    signUp,
    signIn,
    signOut,
  }), [user, session, loading, isLoadingRole, roleError, signUp, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
