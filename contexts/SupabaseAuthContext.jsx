// This file is deprecated and should not be used. 
// All imports should point to src/contexts/SupabaseAuthContext.jsx
// We are keeping this file as a redirect to prevent build errors if any legacy imports exist.

import { AuthProvider as SrcAuthProvider, useAuth as SrcUseAuth } from '@/contexts/SupabaseAuthContext';

export const AuthProvider = SrcAuthProvider;
export const useAuth = SrcUseAuth;