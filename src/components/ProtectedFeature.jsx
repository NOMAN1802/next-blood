
import React from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { isSuperAdmin } from '@/lib/roleUtils';
import { AlertCircle, Lock } from 'lucide-react';

const ProtectedFeature = ({ 
  children, 
  requiredPermission = null, 
  requiredRole = null,
  showError = true 
}) => {
  const { user } = useAuth();
  const { hasPermission } = useRolePermissions();

  if (!user) {
     return showError ? (
        <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 text-center text-neutral-400">
           <Lock className="w-6 h-6 mx-auto mb-2 text-neutral-500" />
           <p className="text-sm">Please log in to view this content.</p>
        </div>
     ) : null;
  }

  // Super Admin check using utility
  const isSuper = isSuperAdmin(user.role);

  // Role check
  const roleAllowed = isSuper || !requiredRole || user.role === requiredRole;
  
  // Permission check
  const permissionAllowed = isSuper || !requiredPermission || hasPermission(requiredPermission);

  if (roleAllowed && permissionAllowed) {
    return <>{children}</>;
  }

  return showError ? (
    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-center text-red-400">
       <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-500" />
       <p className="text-sm font-medium">Access Denied</p>
       <p className="text-xs opacity-80 mt-1">You do not have permission to view this section.</p>
    </div>
  ) : null;
};

export default ProtectedFeature;
