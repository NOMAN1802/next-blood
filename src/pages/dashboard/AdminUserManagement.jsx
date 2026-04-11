import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, MoreVertical, Trash2, Edit, 
  CheckCircle, Ban, ChevronLeft, ChevronRight,
  TrendingUp, TrendingDown, ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { db } from '@/lib/db';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const AdminUserManagement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await db.users.getAll();
      setUsers(data || []);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!currentUser) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to perform this action." });
      return;
    }

    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

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

      if (error) throw new Error(error.message || "Network error");
      if (data && data.error) throw new Error(data.error);
      if (data && !data.ok) throw new Error("Failed to delete user");
      
      toast({ title: 'Success', description: 'User deleted successfully' });
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to delete user' });
    }
  };

  const handleStatusToggle = async (user) => {
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      await db.users.update(user.id, { status: newStatus });
      setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
      toast({ title: 'Status Updated', description: `User is now ${newStatus}` });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status' });
    }
  };

  const handlePromote = async (user, newRole) => {
    if (!window.confirm(`Are you sure you want to promote ${user.name} to ${newRole.replace(/_/g, ' ')}?`)) return;

    try {
      // Assuming db.users.update handles this, or we might need an edge function if roles are protected
      await db.users.update(user.id, { role: newRole });
      setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
      toast({ title: 'User Promoted', description: `${user.name} is now a ${newRole.replace(/_/g, ' ')}` });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Promotion failed' });
    }
  };

  const handleDemote = async (user) => {
    if (!window.confirm(`Are you sure you want to demote ${user.name} to Donor?`)) return;

    try {
        await db.users.update(user.id, { role: 'donor' });
        setUsers(users.map(u => u.id === user.id ? { ...u, role: 'donor' } : u));
        toast({ title: 'User Demoted', description: `${user.name} is now a Donor` });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Demotion failed' });
    }
  }

  // Filter and Search Logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            Users List
          </h2>
          <p className="text-neutral-400">Manage all user accounts in the system.</p>
        </div>
        <Button 
          onClick={() => navigate('/admin/users/add')}
          className="bg-blue-700 hover:bg-blue-600 text-white gap-2"
        >
          <Plus size={18} /> Add New User
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <Input 
            placeholder="Search by name, email, or role..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-neutral-800 border-neutral-700 text-white w-full"
          />
        </div>
        <div className="flex gap-2">
           <Button 
             variant={roleFilter === 'all' ? 'default' : 'outline'} 
             onClick={() => setRoleFilter('all')}
             className="border-neutral-700 text-white hover:bg-neutral-800"
           >
             All
           </Button>
           <Button 
             variant={roleFilter === 'admin' ? 'default' : 'outline'}
             onClick={() => setRoleFilter('admin')}
             className="border-neutral-700 text-white hover:bg-neutral-800"
           >
             Admins
           </Button>
           <Button 
             variant={roleFilter === 'blood_bank_staff' ? 'default' : 'outline'}
             onClick={() => setRoleFilter('blood_bank_staff')}
             className="border-neutral-700 text-white hover:bg-neutral-800"
           >
             Staff
           </Button>
           <Button 
             variant={roleFilter === 'donor' ? 'default' : 'outline'}
             onClick={() => setRoleFilter('donor')}
             className="border-neutral-700 text-white hover:bg-neutral-800"
           >
             Donors
           </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joining Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                   <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      Loading users...
                   </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                   <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No users found.
                   </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                           {user.avatar_url ? (
                             <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                           ) : (
                             <span className="text-gray-600 font-bold">{user.name?.charAt(0) || 'U'}</span>
                           )}
                        </div>
                        <span className="font-medium text-gray-900">{user.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`capitalize px-2 py-1 rounded text-xs font-medium border ${
                        user.role === 'super_admin' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                        user.role === 'admin' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        user.role === 'blood_bank_staff' ? 'bg-red-100 text-red-700 border-red-200' :
                        'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                        {user.role?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-900">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border-gray-200">
                          <DropdownMenuItem onClick={() => navigate(`/admin/users/edit/${user.id}`)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusToggle(user)}>
                            {user.status === 'active' ? (
                               <><Ban className="mr-2 h-4 w-4 text-orange-500" /> Deactivate</>
                            ) : (
                               <><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Activate</>
                            )}
                          </DropdownMenuItem>
                          
                          {/* Role Promotion/Demotion */}
                          {currentUser?.role === 'super_admin' && user.id !== currentUser.id && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Role Actions</DropdownMenuLabel>
                              {user.role === 'donor' ? (
                                <>
                                  <DropdownMenuItem onClick={() => handlePromote(user, 'blood_bank_staff')}>
                                    <TrendingUp className="mr-2 h-4 w-4 text-blue-600" /> Promote to Staff
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handlePromote(user, 'hospital_staff')}>
                                    <ShieldAlert className="mr-2 h-4 w-4 text-purple-600" /> Promote to Hospital
                                  </DropdownMenuItem>
                                </>
                              ) : user.role !== 'super_admin' && (
                                <DropdownMenuItem onClick={() => handleDemote(user)}>
                                   <TrendingDown className="mr-2 h-4 w-4 text-red-600" /> Demote to Donor
                                </DropdownMenuItem>
                              )}
                            </>
                          )}

                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-red-600 focus:text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
           <Button
             variant="outline"
             size="sm"
             onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
             disabled={currentPage === 1}
           >
             <ChevronLeft size={16} />
           </Button>
           <span className="flex items-center px-4 text-sm text-gray-400">
             Page {currentPage} of {totalPages}
           </span>
           <Button
             variant="outline"
             size="sm"
             onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
             disabled={currentPage === totalPages}
           >
             <ChevronRight size={16} />
           </Button>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;