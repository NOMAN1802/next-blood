import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase, supabaseAdmin } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AdminUserForm = ({ isOpen, onClose, userToEdit = null, onSuccess }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {
      const { data } = await supabaseAdmin.from('roles').select('name, slug').order('hierarchy', { ascending: false });
      if (data?.length) setRoles(data);
    };
    fetchRoles();
  }, []);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'user',
    status: 'active'
  });

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        email: userToEdit.email || '',
        password: '', // Password not editable directly for security, only reset
        name: userToEdit.name || userToEdit.full_name || '',
        role: userToEdit.role || 'user',
        status: userToEdit.status || 'active'
      });
    } else {
      setFormData({
        email: '',
        password: '',
        name: '',
        role: 'user',
        status: 'active'
      });
    }
    setError(null);
  }, [userToEdit, isOpen]);

  const validate = () => {
    if (!formData.email || !formData.email.includes('@')) {
      setError('Valid email is required');
      return false;
    }
    if (!userToEdit && (!formData.password || formData.password.length < 6)) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (!formData.name) {
      setError('Name is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Validate User Existence
    if (!user || !user.id) {
      setError("You must be logged in to perform this action.");
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Your session is invalid. Please log in again."
      });
      return;
    }

    if (!validate()) return;

    setIsLoading(true);
    setError(null);

    try {
      if (userToEdit) {
        // Update auth user metadata (name) via admin client
        const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
          userToEdit.id,
          { user_metadata: { full_name: formData.name, name: formData.name, role: formData.role } }
        );
        if (authUpdateError) console.warn('Auth metadata update warning:', authUpdateError.message);

        // Upsert into public users table (bypasses RLS, creates row if missing)
        const { error } = await supabaseAdmin
          .from('users')
          .upsert({
            id: userToEdit.id,
            email: userToEdit.email,
            full_name: formData.name,
            role: formData.role,
            status: formData.status,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });

        if (error) throw error;
        toast({ title: "Success", description: "User updated successfully" });
        onSuccess();
        onClose();
      } else {
        // Create new user directly via admin client (service role key)
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: formData.email,
          password: formData.password,
          email_confirm: true,
          user_metadata: { full_name: formData.name, name: formData.name, role: formData.role },
        });

        if (createError) {
          if (createError.message?.toLowerCase().includes('already registered') || createError.message?.toLowerCase().includes('already been registered')) {
            setError("This email is already registered. You cannot create a duplicate account.");
            toast({
              variant: "default",
              className: "bg-amber-500 border-amber-600 text-white",
              title: "User Exists",
              description: "This email is already registered. Please edit the existing user."
            });
            return;
          }
          throw createError;
        }

        // Insert profile row into public.users
        const { error: profileError } = await supabaseAdmin.from('users').upsert({
          id: newUser.user.id,
          email: formData.email,
          full_name: formData.name,
          role: formData.role || 'user',
          status: formData.status || 'active',
          created_at: new Date().toISOString(),
        });

        if (profileError) console.error('Profile insert warning:', profileError.message);

        toast({
          className: "bg-green-600 border-green-700 text-white",
          title: "User Created",
          description: "User account created successfully."
        });
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Operation failed");
      toast({
         variant: "destructive",
         title: "Error",
         description: err.message || "Operation failed"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-neutral-900 border-neutral-800 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{userToEdit ? 'Edit User' : 'Create New User'}</DialogTitle>
          <DialogDescription>
            {userToEdit ? 'Modify user details and access permissions.' : 'Add a new user to the system. They will receive a confirmation email.'}
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="bg-red-900/20 border-red-900/50 mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="bg-neutral-950 border-neutral-800" 
              placeholder="John Doe"
              disabled={isLoading}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="bg-neutral-950 border-neutral-800" 
              placeholder="john@example.com"
              disabled={!!userToEdit || isLoading} 
            />
          </div>

          {!userToEdit && (
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="bg-neutral-950 border-neutral-800" 
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                value={formData.role} 
                onValueChange={val => setFormData({...formData, role: val})}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-neutral-950 border-neutral-800">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                  {roles.map(role => (
                    <SelectItem key={role.slug} value={role.slug} className="capitalize">
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={val => setFormData({...formData, status: val})}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-neutral-950 border-neutral-800">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="text-neutral-400" disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {userToEdit ? 'Save Changes' : (isLoading ? 'Creating...' : 'Create User')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminUserForm;