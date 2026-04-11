import React, { useContext } from 'react';
import { AuthContext as AuthContextBase } from '@/contexts/AuthContextBase';

// Compatibility layer for legacy imports.
// CRITICAL FIX: This file now imports from AuthContextBase, NOT SupabaseAuthContext.
// This breaks the circular dependency: SupabaseAuthContext -> AuthContext -> SupabaseAuthContext

export const useAuth = () => {
  // We use the base context directly. The Provider in App.jsx (from SupabaseAuthContext)
  // populates this context at runtime.
  const context = useContext(AuthContextBase);
  
  if (context === undefined) {
    // If this is hit, it means AuthProvider is missing in the tree
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return {
    ...context,
    // Map legacy method names to Supabase equivalents
    logout: context.signOut,
    login: context.signIn,
    // Basic permission compatibility helper
    hasPermission: (module, action) => {
        if (!context.user) return false;
        const role = context.user.role || context.user.user_metadata?.role;
        if (role === 'super_admin') return true;
        if (role === 'admin') return true;
        return false;
    }
  };
};

// No-op provider to prevent errors if legacy code tries to import it.
// The actual provider in App.jsx is from SupabaseAuthContext.
export const AuthProvider = ({ children }) => <>{children}</>;