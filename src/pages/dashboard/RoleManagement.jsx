import React, { useState, useEffect } from 'react';
import { 
  Shield, Plus, RefreshCw, Loader2, Save, X, Edit, Trash2, CheckSquare, Square
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { db } from '@/lib/db';
import { ROLES, PERMISSIONS } from '@/hooks/useRolePermissions';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import RolePermissionMatrix from '@/components/RolePermissionMatrix';

const RoleManagement = () => {
    const { toast } = useToast();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Edit/Create State
    const [editingRole, setEditingRole] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const data = await db.roles.getAll();
            setRoles(data || []);
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to load roles.' });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (role) => {
        setEditingRole({ 
            ...role, 
            permissions: Array.isArray(role.permissions) ? role.permissions : [] 
        });
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setEditingRole({
            id: '', 
            name: '',
            description: '',
            permissions: [],
            hierarchy: 10
        });
        setIsDialogOpen(true);
    };

    const togglePermission = (perm) => {
        if (!editingRole) return;
        const currentPerms = new Set(editingRole.permissions);
        if (currentPerms.has(perm)) {
            currentPerms.delete(perm);
        } else {
            currentPerms.add(perm);
        }
        setEditingRole({ ...editingRole, permissions: Array.from(currentPerms) });
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            
            // Basic validation
            if (!editingRole.id || !editingRole.name) {
                throw new Error("Role ID and Name are required.");
            }

            // Check if creating new or updating (match by UUID id for existing roles)
            const existingRole = roles.find(r => r.id === editingRole.id);
            const isNew = !existingRole;

            if (isNew) {
                await db.roles.create(editingRole);
                toast({ title: "Role Created", description: `${editingRole.name} has been created.` });
            } else {
                await db.roles.update(existingRole.id, {
                    name: editingRole.name,
                    description: editingRole.description,
                    permissions: editingRole.permissions,
                    hierarchy: editingRole.hierarchy
                });
                toast({ title: "Role Updated", description: "Permissions saved successfully." });
            }

            setIsDialogOpen(false);
            fetchRoles();
        } catch (error) {
            toast({ variant: 'destructive', title: "Error", description: error.message });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This will remove the role and might affect users assigned to it.")) return;
        try {
            await db.roles.delete(id);
            setRoles(roles.filter(r => r.id !== id));
            toast({ title: "Deleted", description: "Role removed." });
        } catch (error) {
            toast({ variant: 'destructive', title: "Error", description: "Failed to delete role." });
        }
    };

    const allPermissions = Object.values(PERMISSIONS);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Role Management</h2>
                    <p className="text-neutral-400">Configure Role-Based Access Control (RBAC) and permissions.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchRoles} className="border-neutral-800 text-neutral-300">
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                    <Button onClick={handleCreate} className="bg-red-600 hover:bg-red-700 text-white">
                        <Plus className="w-4 h-4 mr-2" /> Create Role
                    </Button>
                </div>
            </div>

            {/* Matrix View */}
            <RolePermissionMatrix roles={roles} />

            {/* List View for Editing */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {roles.map(role => (
                    <div key={role.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col hover:border-neutral-700 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">{role.name}</h3>
                                <Badge variant="outline" className="mt-1 bg-neutral-950 text-neutral-400 border-neutral-800 font-mono text-xs">
                                    {role.slug || role.name}
                                </Badge>
                            </div>
                            <div className="bg-neutral-950 px-2 py-1 rounded text-xs text-neutral-500 font-mono">
                                Lvl {role.hierarchy}
                            </div>
                        </div>
                        
                        <p className="text-neutral-400 text-sm mb-6 flex-grow">{role.description || 'No description provided.'}</p>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-800">
                            <span className="text-xs text-neutral-500">
                                {Array.isArray(role.permissions) ? role.permissions.length : 0} Permissions
                            </span>
                            <div className="flex gap-2">
                                <Button size="sm" variant="ghost" onClick={() => handleEdit(role)} className="h-8 w-8 p-0 text-neutral-400 hover:text-white">
                                    <Edit className="w-4 h-4" />
                                </Button>
                                {(role.slug || role.name) !== 'super_admin' && (
                                    <Button size="sm" variant="ghost" onClick={() => handleDelete(role.id)} className="h-8 w-8 p-0 text-neutral-400 hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit/Create Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-neutral-900 border-neutral-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingRole?.id && roles.find(r => r.id === editingRole.id) ? 'Edit Role' : 'Create New Role'}</DialogTitle>
                        <DialogDescription>
                            Define permissions and access levels for this role.
                        </DialogDescription>
                    </DialogHeader>

                    {editingRole && (
                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Role ID (Slug)</Label>
                                    <Input 
                                        value={editingRole.id}
                                        onChange={(e) => setEditingRole({...editingRole, id: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
                                        disabled={!!roles.find(r => r.id === editingRole.id)} // Disable ID edit for existing
                                        className="bg-neutral-950 border-neutral-800 font-mono"
                                        placeholder="e.g. content_manager"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Display Name</Label>
                                    <Input 
                                        value={editingRole.name}
                                        onChange={(e) => setEditingRole({...editingRole, name: e.target.value})}
                                        className="bg-neutral-950 border-neutral-800"
                                        placeholder="e.g. Content Manager"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea 
                                    value={editingRole.description}
                                    onChange={(e) => setEditingRole({...editingRole, description: e.target.value})}
                                    className="bg-neutral-950 border-neutral-800 min-h-[80px]"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label>Permissions</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-neutral-950 p-4 rounded-lg border border-neutral-800 max-h-[300px] overflow-y-auto">
                                    {allPermissions.map(perm => {
                                        const isSelected = editingRole.permissions.includes(perm);
                                        return (
                                            <div 
                                                key={perm}
                                                onClick={() => togglePermission(perm)}
                                                className={`
                                                    flex items-center gap-3 p-2 rounded cursor-pointer transition-colors
                                                    ${isSelected ? 'bg-red-900/20 text-white' : 'hover:bg-neutral-900 text-neutral-400'}
                                                `}
                                            >
                                                {isSelected ? (
                                                    <CheckSquare className="w-4 h-4 text-red-500 shrink-0" />
                                                ) : (
                                                    <Square className="w-4 h-4 text-neutral-600 shrink-0" />
                                                )}
                                                <span className="text-sm">{perm.replace(/_/g, ' ')}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-neutral-400">Cancel</Button>
                        <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700 text-white" disabled={isSaving}>
                            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Save Role
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default RoleManagement;