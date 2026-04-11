import React from 'react';
import { Check, X, Shield } from 'lucide-react';
import { ROLES, PERMISSIONS } from '@/hooks/useRolePermissions';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Visual component to show which roles have which permissions
const RolePermissionMatrix = ({ roles = [] }) => {
  // If no roles passed, we can't show dynamic data, but we can show structure
  const allPermissions = Object.values(PERMISSIONS);
  const displayRoles = roles.length > 0 ? roles : [
    { id: 'super_admin', name: 'Super Admin', permissions: allPermissions },
    { id: 'admin', name: 'Admin', permissions: allPermissions.filter(p => p !== PERMISSIONS.MANAGE_ROLES) },
    { id: 'manager', name: 'Manager', permissions: [PERMISSIONS.VIEW_DONORS, PERMISSIONS.VIEW_REQUESTS, PERMISSIONS.EDIT_REQUESTS] },
    { id: 'staff', name: 'Staff', permissions: [PERMISSIONS.VIEW_DONORS, PERMISSIONS.VIEW_REQUESTS] },
    { id: 'viewer', name: 'Viewer', permissions: [PERMISSIONS.VIEW_REPORTS] }
  ];

  return (
    <Card className="bg-neutral-900 border-neutral-800 text-white overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500" />
            Access Matrix
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full text-sm text-left">
            <thead className="bg-neutral-950 text-neutral-400 uppercase text-xs">
                <tr>
                    <th className="px-6 py-4 sticky left-0 bg-neutral-950 z-10 border-r border-neutral-800">Permission</th>
                    {displayRoles.map(role => (
                        <th key={role.id} className="px-6 py-4 text-center min-w-[100px]">
                            {role.name}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
                {allPermissions.map(permission => (
                    <tr key={permission} className="hover:bg-neutral-800/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-neutral-300 sticky left-0 bg-neutral-900 border-r border-neutral-800 z-10">
                            {permission.replace(/_/g, ' ')}
                        </td>
                        {displayRoles.map(role => {
                            const hasPerm = Array.isArray(role.permissions) && role.permissions.includes(permission);
                            return (
                                <td key={`${role.id}-${permission}`} className="px-6 py-4 text-center">
                                    {hasPerm ? (
                                        <div className="flex justify-center">
                                            <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-green-500 hover:bg-green-500/20">
                                                <Check className="w-3 h-3" />
                                            </Badge>
                                        </div>
                                    ) : (
                                        <div className="flex justify-center opacity-20">
                                            <X className="w-3 h-3 text-neutral-500" />
                                        </div>
                                    )}
                                </td>
                            );
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

export default RolePermissionMatrix;