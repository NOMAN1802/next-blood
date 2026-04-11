import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, MoreVertical, Edit, Trash2, 
  CheckCircle, XCircle, Loader2, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { supabase, supabaseAdmin } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { ROLES } from '@/hooks/useRolePermissions';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import AdminUserForm from '@/pages/dashboard/AdminUserForm';

const UserManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    // Only fetch if user is authenticated
    if (user && user.id) {
      fetchUsers();
    } else {
      // If not authenticated, stop loading but don't fetch
      setLoading(false);
    }
  }, [user]);

  const fetchUsers = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch all auth users via admin client (bypasses RLS, sees all auth.users)
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });

      // Fetch public users table for role/status metadata
      const { data: publicUsers } = await supabase.from('users').select('*');
      const publicMap = Object.fromEntries((publicUsers || []).map(u => [u.id, u]));

      if (authError) {
        console.error("Error fetching auth users:", authError);
        toast({ variant: "destructive", title: "Warning", description: "Failed to load users list." });
        setUsers([]);
        return;
      }

      // Merge auth users with public table metadata
      const merged = (authData?.users || []).map(authUser => {
        const pub = publicMap[authUser.id] || {};
        return {
          ...pub,
          id: authUser.id,
          email: authUser.email,
          created_at: authUser.created_at,
          last_sign_in_at: authUser.last_sign_in_at,
          name: pub.full_name || authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Unknown',
          role: pub.role || authUser.user_metadata?.role || authUser.app_metadata?.role || 'staff',
          status: pub.status || (authUser.banned_until ? 'suspended' : 'active'),
        };
      });

      // Sort by created_at descending
      merged.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setUsers(merged);
    } catch (error) {
      console.error("Critical error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (userToEdit) => {
    setSelectedUser(userToEdit);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (userId) => {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to perform this action." });
      return;
    }

    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    setIsDeleting(true);
    try {
      // Get session for auth header
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Session expired");

      // Use edge function for deletion to ensure Auth user is also deleted
      const { data, error } = await supabase.functions.invoke('admin-actions', {
        body: {
          action: 'delete_user',
          payload: { userId }
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) {
        throw new Error(error.message || "Network error during deletion");
      }

      if (data && data.error) {
        throw new Error(data.error);
      }

      if (data && !data.ok) {
        throw new Error("Failed to delete user on server");
      }
      
      // Update local state properly
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast({ title: "Success", description: "User deleted successfully." });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to delete user." });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetPassword = async (email) => {
    if (!email) return;
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password',
        });
        if (error) throw error;
        toast({ title: "Email Sent", description: `Password reset link sent to ${email}` });
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const toggleUserStatus = async (userToToggle) => {
      if (!user) return;
      
      const newStatus = userToToggle.status === 'active' ? 'suspended' : 'active';
      try {
          const { error } = await supabase.from('users').update({ status: newStatus }).eq('id', userToToggle.id);
          if (error) throw error;
          
          setUsers(users.map(u => u.id === userToToggle.id ? { ...u, status: newStatus } : u));
          toast({ title: "Updated", description: `User status set to ${newStatus}` });
      } catch (error) {
          toast({ variant: "destructive", title: "Error", description: "Failed to update status" });
      }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      (u.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (u.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (u.email?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active': return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">Active</Badge>;
      case 'inactive': return <Badge className="bg-neutral-500/10 text-neutral-500 hover:bg-neutral-500/20 border-neutral-500/20">Inactive</Badge>;
      case 'suspended': return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">Suspended</Badge>;
      default: return <Badge variant="outline" className="text-neutral-400">Unknown</Badge>;
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-400">
        Please log in to view user management.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
        <div>
           <h2 className="text-xl font-bold text-white">User Management</h2>
           <p className="text-neutral-400 text-sm">Create, edit, and manage system access.</p>
        </div>
        <Button onClick={handleCreate} className="bg-red-600 hover:bg-red-700 text-white w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Add New User
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-neutral-900/50 p-4 rounded-lg border border-neutral-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <Input 
            placeholder="Search by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-neutral-900 border-neutral-800 text-white"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {['all', ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF].map(role => (
             <Button
                key={role}
                variant={roleFilter === role ? "default" : "outline"}
                onClick={() => setRoleFilter(role)}
                size="sm"
                className={roleFilter === role ? "bg-neutral-800 text-white" : "text-neutral-400 border-neutral-800"}
             >
               {role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
             </Button>
          ))}
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={fetchUsers} 
          className="bg-neutral-900 border-neutral-800 hover:bg-neutral-800"
          title="Refresh List"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="rounded-md border border-neutral-800 bg-neutral-900 overflow-hidden shadow-lg shadow-black/20">
        <Table>
          <TableHeader className="bg-neutral-950">
            <TableRow className="border-neutral-800">
              <TableHead className="text-neutral-400">User</TableHead>
              <TableHead className="text-neutral-400">Role</TableHead>
              <TableHead className="text-neutral-400">Status</TableHead>
              <TableHead className="text-neutral-400">Joined</TableHead>
              <TableHead className="text-neutral-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i} className="border-neutral-800">
                  <TableCell><div className="h-10 w-32 bg-neutral-800 animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-6 w-20 bg-neutral-800 animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-6 w-16 bg-neutral-800 animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-24 bg-neutral-800 animate-pulse rounded" /></TableCell>
                  <TableCell className="text-right"><div className="h-8 w-8 bg-neutral-800 animate-pulse rounded ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredUsers.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={5} className="h-32 text-center text-neutral-500">
                    No users found matching your criteria.
                 </TableCell>
               </TableRow>
            ) : (
              filteredUsers.map((u) => (
                <TableRow key={u.id} className="border-neutral-800 hover:bg-neutral-950/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-400">
                            {(u.name || u.full_name || u.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium text-white">{u.name || u.full_name || 'Unnamed User'}</span>
                            <span className="text-xs text-neutral-500">{u.email}</span>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-neutral-300 border-neutral-700 bg-neutral-800/50 capitalize">
                        {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(u.status || 'active')}
                  </TableCell>
                  <TableCell className="text-neutral-400 text-sm">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-white" disabled={isDeleting}>
                          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-800 text-white z-50">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-neutral-800" />
                        <DropdownMenuItem onClick={() => handleEdit(u)} className="hover:bg-neutral-800 cursor-pointer">
                          <Edit className="w-4 h-4 mr-2" /> Edit Details
                        </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleResetPassword(u.email)} className="hover:bg-neutral-800 cursor-pointer">
                          <RefreshCw className="w-4 h-4 mr-2" /> Reset Password
                        </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => toggleUserStatus(u)} className="hover:bg-neutral-800 cursor-pointer">
                           {u.status === 'suspended' ? (
                               <><CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Activate User</>
                           ) : (
                               <><XCircle className="w-4 h-4 mr-2 text-yellow-500" /> Suspend User</>
                           )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-neutral-800" />
                        <DropdownMenuItem onClick={() => handleDelete(u.id)} className="hover:bg-red-900/20 text-red-500 hover:text-red-400 cursor-pointer">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AdminUserForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        userToEdit={selectedUser}
        onSuccess={fetchUsers}
      />
    </div>
  );
};

export default UserManagement;