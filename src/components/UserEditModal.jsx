import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Shield } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { Badge } from '@/components/ui/badge';

const UserEditModal = ({ isOpen, onClose, user = null, onSuccess }) => {
  const { toast } = useToast();
  const { getAllRoles, getRolePermissions } = useRolePermissions();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    status: 'active'
  });

  const roles = getAllRoles();
  const currentPermissions = getRolePermissions(formData.role);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'user',
        status: user.status || 'active'
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'user',
        status: 'active'
      });
    }
  }, [user, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.email || !formData.name) {
        throw new Error("Name and Email are required");
      }

      let error;
      
      if (user?.id) {
        // Update existing
        const { error: updateError } = await supabase
          .from('users')
          .update({
            name: formData.name,
            phone: formData.phone,
            role: formData.role,
            status: formData.status,
            updated_at: new Date()
          })
          .eq('id', user.id);
        error = updateError;
      } else {
        // Create new (Admin creating a user manually usually just creates the DB record, 
        // real auth user creation needs invite flow or Edge Function)
        // For this demo, we'll create the DB record assuming auth is handled separately or syncs
        const { error: insertError } = await supabase
          .from('users')
          .insert([{
            ...formData,
            created_at: new Date(),
            updated_at: new Date(),
            is_temp: true // Flag to indicate created by admin without auth link yet
          }]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `User ${user ? 'updated' : 'created'} successfully.`
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-neutral-900 border-neutral-800 text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {user ? 'Modify user details and permissions.' : 'Create a new user record.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-neutral-950 border-neutral-800"
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="bg-neutral-950 border-neutral-800"
                placeholder="john@example.com"
                disabled={!!user} // Often email isn't editable easily due to Auth linking
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label>Phone</Label>
              <Input 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="bg-neutral-950 border-neutral-800"
                placeholder="+1234567890"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(val) => setFormData({...formData, status: val})}
              >
                <SelectTrigger className="bg-neutral-950 border-neutral-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <Label className="flex items-center gap-2 text-yellow-500">
              <Shield className="w-4 h-4" /> Role & Permissions
            </Label>
            <Select 
              value={formData.role} 
              onValueChange={(val) => setFormData({...formData, role: val})}
            >
              <SelectTrigger className="bg-neutral-950 border-neutral-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                {roles.map(role => (
                  <SelectItem key={role.key} value={role.key}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {currentPermissions.length > 0 && (
              <div className="mt-3 p-3 bg-neutral-950 rounded-lg border border-neutral-800">
                <p className="text-xs text-neutral-500 mb-2 uppercase font-bold tracking-wider">Granted Permissions:</p>
                <div className="flex flex-wrap gap-1.5">
                  {currentPermissions.map(perm => (
                    <Badge key={perm} variant="secondary" className="text-[10px] bg-neutral-800 text-neutral-300 hover:bg-neutral-700">
                      {perm.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {user ? 'Save Changes' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserEditModal;