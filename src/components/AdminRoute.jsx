
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useRolePermissions, PERMISSIONS } from '@/hooks/useRolePermissions';
import { isSuperAdmin } from '@/lib/roleUtils';
import { Loader2, ShieldAlert, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminRoute = ({ children, requiredPermission = PERMISSIONS.ACCESS_ADMIN }) => {
  const { user, loading, isLoadingRole, roleError } = useAuth();
  const { hasPermission } = useRolePermissions();
  const location = useLocation();

  // 1. Show loading state while authenticating or fetching permissions
  if (loading || isLoadingRole) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
          <p className="text-neutral-400 text-sm animate-pulse">
            {loading ? 'Authenticating...' : 'Verifying permissions...'}
          </p>
        </div>
      </div>
    );
  }

  // 2. Not logged in -> Redirect to login
  // Explicit null check for user object
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. SPECIAL: Allow access if profile is missing so the Layout can render the Warning Banner
  // This prevents the redirect loop or "access denied" when the user is technically admin but has no profile row
  // Safe access using optional chaining just in case
  if (user?.isProfileMissing) {
    // If they are strictly Super Admin (via metadata), allow access
    if (isSuperAdmin(user?.role)) {
       return children;
    }
    // Otherwise, we might still want to let them in to see the error banner in dashboard layout
    // Assuming they have basic auth, we let them proceed to Layout
    return children;
  }

  // 4. Error fetching role -> Show error component
  if (roleError) {
    return (
       <div className="flex flex-col items-center justify-center h-[60vh] p-4 text-center">
         <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
         <h2 className="text-xl font-bold text-white mb-2">Permission Check Failed</h2>
         <p className="text-neutral-400 mb-6">
           We couldn't verify your access level due to a connection error.
         </p>
         <Button variant="outline" onClick={() => window.location.reload()}>
           Try Again
         </Button>
      </div>
    );
  }

  // 5. Check permissions
  // Super Admin Bypass using normalized check
  // Ensure user.role exists before checking
  if (user?.role && isSuperAdmin(user.role)) {
    return children;
  }

  // Standard Permission Check
  const hasAccess = requiredPermission ? hasPermission(requiredPermission) : hasPermission(PERMISSIONS.ACCESS_ADMIN);

  if (!hasAccess) {
    // Show inline "Access Restricted" instead of redirecting
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] p-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="bg-red-500/10 p-4 rounded-full mb-4 ring-1 ring-red-500/20">
          <Lock className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
        <p className="text-neutral-400 max-w-md mb-6">
          You don't have permission to access the 
          <span className="text-white font-medium mx-1">
             {location.pathname.split('/').pop().replace(/-/g, ' ')}
          </span> 
          module.
        </p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
          <Button variant="default" onClick={() => window.location.href = '/dashboard'}>
            Dashboard Home
          </Button>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
