
/**
 * Utility functions for role-based access control
 * SINGLE SOURCE OF TRUTH for role normalization and checking
 */

/**
 * Normalizes and checks if a role is super admin.
 * Handles variations like "super admin", "super_admin", "SUPER_ADMIN", etc.
 * 
 * @param {string} role - The user role string
 * @returns {boolean} - True if role is super admin, false otherwise
 */
export const isSuperAdmin = (role) => {
  if (!role) return false;
  
  // Normalize: trim whitespace, lowercase, replace spaces with underscores
  const normalized = String(role).trim().toLowerCase().replace(/\s+/g, '_');
  
  // Check against allowed super admin identifiers
  // 'admin' is included here as legacy support, but strict super_admin is preferred
  const adminRoles = ['super_admin', 'superadmin', 'admin', 'administrator', 'master_admin'];
  
  return adminRoles.includes(normalized);
};

/**
 * Strict check — only true for super_admin, NOT for plain 'admin'.
 * Use this for actions only the platform owner should perform (e.g. data export).
 * @param {string} role
 * @returns {boolean}
 */
export const isStrictSuperAdmin = (role) => {
  if (!role) return false;
  const normalized = String(role).trim().toLowerCase().replace(/\s+/g, '_');
  return ['super_admin', 'superadmin', 'master_admin'].includes(normalized);
};

/**
 * Normalizes any role string to a standard format (lowercase, snake_case)
 * @param {string} role 
 * @returns {string}
 */
export const normalizeRole = (role) => {
  if (!role) return 'user';
  return String(role).trim().toLowerCase().replace(/\s+/g, '_');
};

/**
 * Helper to format role for display (e.g. "super_admin" -> "Super Admin")
 * @param {string} role 
 * @returns {string}
 */
export const formatRoleDisplay = (role) => {
  if (!role) return 'User';
  return role
    .split(/[_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
