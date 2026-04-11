
import { useState, useEffect, useCallback } from 'react';
import { supabase, supabaseAdmin } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { isSuperAdmin } from '@/lib/roleUtils';

export const PERMISSIONS = {
  VIEW_SETTINGS: 'can_view_settings',
  EDIT_SETTINGS: 'can_edit_settings',
  MANAGE_USERS: 'can_manage_users',
  VIEW_DONORS: 'can_view_donors',
  EDIT_DONORS: 'can_edit_donors',
  DELETE_DONORS: 'can_delete_donors',
  VIEW_REQUESTS: 'can_view_requests',
  EDIT_REQUESTS: 'can_edit_requests',
  VIEW_REPORTS: 'can_view_reports',
  ACCESS_ADMIN: 'can_access_admin',
  MANAGE_ROLES: 'can_manage_roles'
};

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  VIEWER: 'viewer',
  DONOR: 'donor',
  USER: 'user'
};

export const useRolePermissions = () => {
  const { user, isLoadingRole } = useAuth();
  const [userPermissions, setUserPermissions] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all roles metadata (for role management UI)
  const fetchAllRolesAndPermissions = useCallback(async () => {
    try {
      const { data: roles, error } = await supabaseAdmin.from('roles').select('*').order('hierarchy', { ascending: false });
      if (!error && roles) {
         setRolesList(roles);
      }
    } catch (error) {
      console.error('Error fetching RBAC metadata:', error);
    }
  }, []);

  // Calculate permissions for current user
  useEffect(() => {
    const fetchUserPermissions = async () => {
      // If auth is still loading user role, wait
      if (isLoadingRole) return;

      if (!user) {
        setUserPermissions([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // 1. Super Admin Bypass
        if (isSuperAdmin(user.role)) {
          setUserPermissions(Object.values(PERMISSIONS));
          return;
        }

        // 2. Fetch ALL roles from DB, then match client-side (avoids PostgREST syntax issues)
        const { data: allRoles, error } = await supabaseAdmin
          .from('roles')
          .select('name, slug, permissions');

        if (error) throw error;

        // Case-insensitive match by slug first, then name
        const userRoleLower = (user.role || '').toLowerCase().trim();
        const roleData = (allRoles || []).find(r =>
          (r.slug && r.slug.toLowerCase().trim() === userRoleLower) ||
          (r.name && r.name.toLowerCase().trim() === userRoleLower)
        );

        if (roleData?.permissions && Array.isArray(roleData.permissions)) {
          setUserPermissions(roleData.permissions);
        } else {
          // Role not found in DB — grant no permissions
          console.warn(`Role '${user.role}' not found in roles table. No permissions granted.`);
          setUserPermissions([]);
        }
      } catch (err) {
        console.error('Error fetching permissions:', err);
        setUserPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPermissions();
  }, [user?.role, isLoadingRole]);

  // Permission Check Function
  const hasPermission = (permission) => {
    if (!user) return false;
    
    // Super admin bypass
    if (isSuperAdmin(user.role)) return true;
    
    // Profile missing fallback (allow accessing dashboard to fix profile)
    if (user.isProfileMissing && permission === PERMISSIONS.ACCESS_ADMIN) {
        return user.role === 'admin' || user.role === 'super_admin';
    }

    return Array.isArray(userPermissions) && userPermissions.includes(permission);
  };

  // Route Access Check Function
  const canAccessPage = (pageRoute) => {
    if (!user) return false;
    if (isSuperAdmin(user.role)) return true;
    
    // Allow access to dashboard wrapper so they see the setup screen if profile missing
    if (user.isProfileMissing && pageRoute === '/dashboard') return true;

    if (!pageRoute) return false;

    // Map routes to permissions
    if (pageRoute.startsWith('/dashboard/users')) return hasPermission(PERMISSIONS.MANAGE_USERS);
    if (pageRoute.startsWith('/dashboard/roles')) return hasPermission(PERMISSIONS.MANAGE_ROLES);
    if (pageRoute.startsWith('/dashboard/settings')) return hasPermission(PERMISSIONS.VIEW_SETTINGS);
    if (pageRoute.startsWith('/dashboard/donors')) return hasPermission(PERMISSIONS.VIEW_DONORS);
    if (pageRoute.startsWith('/dashboard/requests')) return hasPermission(PERMISSIONS.VIEW_REQUESTS);
    if (pageRoute.startsWith('/dashboard/analytics')) return hasPermission(PERMISSIONS.VIEW_REPORTS);
    if (pageRoute.startsWith('/dashboard/visitor-analytics')) return hasPermission(PERMISSIONS.VIEW_REPORTS);
    
    // Base dashboard access
    if (pageRoute.startsWith('/dashboard')) return hasPermission(PERMISSIONS.ACCESS_ADMIN);
    
    return true; 
  };

  const getRolePermissions = (roleName) => {
    if (isSuperAdmin(roleName)) return Object.values(PERMISSIONS);
    const roleData = rolesList.find(r => r.name === roleName);
    return roleData?.permissions || [];
  };

  return {
    ROLES,
    PERMISSIONS,
    userPermissions,
    rolesList,
    loading, // This is loading state of PERMISSIONS fetch
    hasPermission,
    canAccessPage,
    fetchAllRolesAndPermissions,
    getAllRoles: () => rolesList,
    getRolePermissions
  };
};
