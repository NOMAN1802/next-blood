
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Search, MapPin, Phone, Mail, FileSpreadsheet, User, 
    MoreHorizontal, CheckCircle, XCircle, RefreshCcw, 
    Loader2, Clock, Trash2, Edit, Save, Plus, UserPlus, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, 
    DialogDescription, DialogFooter, DialogTrigger
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { utils, writeFile } from 'xlsx';
import { db } from '@/lib/db';
import { districtsOfBangladesh, BLOOD_GROUPS } from '@/lib/locations';
import ManualDonorRegistrationForm from '@/components/ManualDonorRegistrationForm';
import { isStrictSuperAdmin } from '@/lib/roleUtils';

const DonorManagement = () => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    // Actions State
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [editingDonor, setEditingDonor] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    
    const [filterGroup, setFilterGroup] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        loadDonors();
    }, []);

    const loadDonors = async () => {
        setLoading(true);
        try {
            const data = await db.donors.getAll();
            setDonors(data || []);
        } catch (error) {
            console.error("Failed to load donors:", error);
            toast({
                title: "Load Error",
                description: "Failed to fetch donors from cloud database.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    // Calculate Statistics
    const stats = {
        total: donors.length,
        groups: donors.reduce((acc, curr) => {
            if (curr.blood_group) {
                acc[curr.blood_group] = (acc[curr.blood_group] || 0) + 1;
            }
            return acc;
        }, {}),
        pending: donors.filter(d => d.status === 'pending').length
    };

    const bloodGroupsOrder = BLOOD_GROUPS;

    const getSafeName = (name) => {
        if (!name) return "Unknown Donor";
        const markers = ['Voter', 'NID', 'Reg.', 'Father', 'Mother', 'Vill:', 'P.O:'];
        let clean = name;
        for (const marker of markers) {
            const idx = clean.indexOf(marker);
            const idxLower = clean.toLowerCase().indexOf(marker.toLowerCase());
            if (idx !== -1) clean = clean.substring(0, idx);
            else if (idxLower !== -1) clean = clean.substring(0, idxLower);
        }
        clean = clean.trim();
        return clean.length > 25 ? clean.substring(0, 25) + '...' : clean;
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        
        setIsDeleting(true);
        console.log("Initiating delete for donor ID:", deleteId);

        try {
            await db.donors.delete(deleteId);
            console.log("Delete operation successful for ID:", deleteId);
            
            setDonors(prev => prev.filter(d => d.id !== deleteId));
            setDeleteId(null);
            
            toast({ 
                title: 'Donor Removed', 
                description: 'The donor has been permanently deleted.',
                className: "bg-green-500 text-white border-green-600"
            });
        } catch (error) {
            console.error("Delete failed:", error);
            toast({ 
                title: 'Delete Failed', 
                description: error.message || 'Could not delete donor from cloud. Please check permissions.',
                variant: "destructive"
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        if (!editingDonor) return;
        
        setIsSaving(true);
        try {
            const { id, full_name, phone, blood_group, city, status, available } = editingDonor;
            
            // Optimistic update
            setDonors(prev => prev.map(d => d.id === id ? { ...d, full_name, phone, blood_group, city, status, available } : d));

            await db.donors.update(id, { 
                full_name, 
                phone, 
                blood_group, 
                city, 
                status,
                available
            });

            toast({ title: "Profile Updated", description: "Donor information saved successfully." });
            setEditingDonor(null);
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Update Failed", description: error.message });
            loadDonors(); // Revert on error
        } finally {
            setIsSaving(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
         try {
             setDonors(prev => prev.map(d => d.id === id ? { ...d, status: newStatus, available: newStatus === 'approved' } : d));
             await db.donors.update(id, { 
                 status: newStatus, 
                 available: newStatus === 'approved' 
             });
             toast({ 
                 title: 'Status Updated', 
                 description: `Donor marked as ${newStatus}.`,
                 className: newStatus === 'approved' ? 'bg-green-500/10 border-green-500/50 text-green-500' : ''
             });
         } catch (error) {
             loadDonors();
             toast({ title: 'Update Failed', description: 'Could not update status.', variant: "destructive" });
         }
    };

    const exportToExcel = () => {
        if (donors.length === 0) return;
        const ws = utils.json_to_sheet(donors.map(d => ({
            Name: getSafeName(d.full_name),
            BloodGroup: d.blood_group,
            Phone: d.phone,
            Email: d.email,
            City: d.city,
            Status: d.status,
            LastDonation: d.last_donation_date
        })));
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Donors");
        writeFile(wb, "Donors_Export.xlsx");
        toast({ title: 'Export Successful', description: 'Donor list exported to Excel.' });
    };

    const filteredDonors = donors.filter(d => {
        const safeName = getSafeName(d.full_name || '').toLowerCase();
        const searchLower = search.toLowerCase();
        const matchesSearch = 
            safeName.includes(searchLower) || 
            (d.blood_group && d.blood_group.toLowerCase().includes(searchLower)) ||
            (d.city && d.city.toLowerCase().includes(searchLower)) ||
            (d.phone && d.phone.includes(searchLower));
            
        const matchesGroup = filterGroup === 'All' || d.blood_group === filterGroup;
        const matchesStatus = statusFilter === 'All' || (d.status || 'pending') === statusFilter;
        
        return matchesSearch && matchesGroup && matchesStatus;
    });

    const StatusBadge = ({ status }) => {
        const styles = {
            approved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
            rejected: "bg-red-500/10 text-red-500 border-red-500/20",
            pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
        };
        const icons = {
            approved: CheckCircle,
            rejected: XCircle,
            pending: Clock
        };
        const Icon = icons[status] || Clock;
        
        return (
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
                <Icon className="w-3 h-3" />
                <span className="capitalize">{status || 'Pending'}</span>
            </span>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between gap-4 md:items-end border-b border-neutral-800 pb-6">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Donor Management</h2>
                    <p className="text-neutral-400 mt-1">View and manage registered blood donors.</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                     <Button 
                        onClick={() => setShowAddModal(true)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                     >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Donor Manually
                     </Button>
                     <Button 
                        onClick={loadDonors}
                        variant="outline"
                        size="icon"
                        className="border-neutral-700 text-neutral-300 hover:text-white"
                        title="Refresh Data"
                     >
                        <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                     </Button>
                     {isStrictSuperAdmin(user?.role) && (
                       <Button
                          onClick={exportToExcel}
                          variant="outline"
                          className="border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800"
                       >
                          <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-500" />
                          Export Data
                       </Button>
                     )}
                </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <div className="col-span-2 md:col-span-2 lg:col-span-1 bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex flex-col justify-center items-center">
                    <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-1">Total Donors</span>
                    <span className="text-3xl font-bold text-white">{stats.total}</span>
                </div>
                <div className="col-span-2 md:col-span-2 lg:col-span-1 bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex flex-col justify-center items-center">
                    <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-1">Pending Review</span>
                    <span className="text-3xl font-bold text-yellow-500">{stats.pending}</span>
                </div>
                <div className="col-span-4 lg:col-span-4 grid grid-cols-8 gap-2">
                    {bloodGroupsOrder.map(bg => (
                        <div key={bg} className="bg-neutral-900/50 border border-neutral-800/50 p-2 rounded-xl flex flex-col items-center justify-center">
                             <span className="text-xs font-bold text-red-400 mb-1">{bg}</span>
                             <span className="text-xl font-bold text-neutral-300">{stats.groups[bg] || 0}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Controls Section */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-neutral-900/50 p-4 rounded-xl border border-neutral-800 backdrop-blur-sm">
                <div className="relative w-full lg:w-96 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-red-500 transition-colors" />
                    <Input 
                        placeholder="Search donors..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-10 bg-neutral-950 border-neutral-800 text-white focus:border-red-500/50 transition-all"
                    />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    {/* Status Filter */}
                    <div className="flex bg-neutral-950 rounded-lg p-1 border border-neutral-800">
                        {['All', 'pending', 'approved', 'rejected'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                                    statusFilter === status 
                                    ? 'bg-neutral-800 text-white shadow' 
                                    : 'text-neutral-500 hover:text-neutral-300'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    {/* Blood Group Filter */}
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none max-w-full">
                        <Button 
                            variant={filterGroup === 'All' ? 'default' : 'outline'}
                            onClick={() => setFilterGroup('All')}
                            size="sm"
                            className={filterGroup === 'All' ? 'bg-neutral-800 hover:bg-neutral-700' : 'border-neutral-800 text-neutral-400'}
                        >
                            All
                        </Button>
                        {bloodGroupsOrder.map(bg => (
                            <button
                                key={bg}
                                onClick={() => setFilterGroup(bg)}
                                className={`px-2 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap min-w-[36px] ${
                                    filterGroup === bg 
                                        ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' 
                                        : 'bg-neutral-950 border border-neutral-800 text-neutral-500 hover:border-red-500/30 hover:text-red-400'
                                }`}
                            >
                                {bg}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Donors Grid/Table */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-800 bg-neutral-950/30 text-xs uppercase tracking-wider text-neutral-500">
                                <th className="px-6 py-4 font-medium">Donor Profile</th>
                                <th className="px-6 py-4 font-medium">Blood Group</th>
                                <th className="px-6 py-4 font-medium">Contact</th>
                                <th className="px-6 py-4 font-medium">Location</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-neutral-500">
                                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                            <p>Syncing with database...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredDonors.length > 0 ? (
                                filteredDonors.map((donor) => {
                                    const safeName = getSafeName(donor.full_name);
                                    return (
                                        <tr key={donor.id} className="group hover:bg-neutral-800/40 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-700 border border-neutral-600 overflow-hidden flex items-center justify-center">
                                                            {donor.profile_picture_url ? (
                                                                <img src={donor.profile_picture_url} alt={safeName} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="text-sm font-bold text-neutral-400">
                                                                    {safeName.substring(0, 2).toUpperCase()}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {donor.status === 'approved' && donor.available && (
                                                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-neutral-900 rounded-full"></span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white text-sm truncate max-w-[150px]" title={donor.full_name}>
                                                            {safeName}
                                                        </p>
                                                        <p className="text-xs text-neutral-500">ID: ...{String(donor.id).slice(-6)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <span className={`
                                                        inline-flex items-center justify-center w-9 h-9 rounded-lg font-bold text-sm
                                                        bg-neutral-950 border border-neutral-800 shadow-inner
                                                        ${['A+', 'A-', 'O+'].includes(donor.blood_group) ? 'text-red-500 shadow-red-900/10' : 'text-rose-400'}
                                                    `}>
                                                        {donor.blood_group}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-sm text-neutral-300">
                                                        <Phone className="w-3.5 h-3.5 text-neutral-500" />
                                                        <span className="font-mono">{donor.phone}</span>
                                                    </div>
                                                    {donor.email && (
                                                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                                                            <Mail className="w-3.5 h-3.5" />
                                                            <span className="truncate max-w-[150px]">{donor.email}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-neutral-400">
                                                    <MapPin className="w-3.5 h-3.5 text-neutral-600" />
                                                    <span className="truncate max-w-[120px]">
                                                        {donor.city || 'Unknown'}{donor.country ? `, ${donor.country}` : ''}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={donor.status} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800"
                                                        onClick={() => setEditingDonor(donor)}
                                                        title="Edit Donor"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8 text-neutral-400 hover:text-red-500 hover:bg-red-500/10"
                                                        onClick={() => setDeleteId(donor.id)}
                                                        title="Delete Donor"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-neutral-500">
                                            <div className="w-12 h-12 bg-neutral-900 rounded-full flex items-center justify-center mb-3 border border-neutral-800">
                                                <User className="w-6 h-6" />
                                            </div>
                                            <p className="text-base font-medium text-neutral-400">No donors found</p>
                                            <p className="text-sm">Try adjusting your search or filters</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="bg-neutral-900 border-t border-neutral-800 p-4 text-xs text-neutral-500 flex justify-between items-center">
                     <span>Showing {filteredDonors.length} of {donors.length} total donors</span>
                     <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block mr-1"></span>
                        Live Supabase
                     </div>
                </div>
            </div>

            {/* Manual Registration Modal */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogContent className="bg-neutral-900 border-neutral-800 text-white sm:max-w-xl max-h-[90vh] overflow-y-auto">
                     <ManualDonorRegistrationForm 
                        onSuccess={() => {
                            setShowAddModal(false);
                            loadDonors();
                        }}
                        onCancel={() => setShowAddModal(false)}
                        user={user}
                     />
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editingDonor} onOpenChange={(open) => !open && setEditingDonor(null)}>
                <DialogContent className="bg-neutral-900 border-neutral-800 text-white sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Edit Donor Profile</DialogTitle>
                        <DialogDescription className="text-neutral-400">
                            Update the donor's personal information and status.
                        </DialogDescription>
                    </DialogHeader>
                    {editingDonor && (
                        <form onSubmit={handleEditSave} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-name" className="text-right text-neutral-300">
                                    Name
                                </Label>
                                <Input
                                    id="edit-name"
                                    value={editingDonor.full_name}
                                    onChange={(e) => setEditingDonor({...editingDonor, full_name: e.target.value})}
                                    className="col-span-3 bg-neutral-950 border-neutral-800"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-phone" className="text-right text-neutral-300">
                                    Phone
                                </Label>
                                <Input
                                    id="edit-phone"
                                    value={editingDonor.phone}
                                    onChange={(e) => setEditingDonor({...editingDonor, phone: e.target.value})}
                                    className="col-span-3 bg-neutral-950 border-neutral-800"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-blood" className="text-right text-neutral-300">
                                    Blood Group
                                </Label>
                                <Select 
                                    value={editingDonor.blood_group} 
                                    onValueChange={(val) => setEditingDonor({...editingDonor, blood_group: val})}
                                >
                                    <SelectTrigger className="col-span-3 bg-neutral-950 border-neutral-800">
                                        <SelectValue placeholder="Select Blood Group" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                                        {BLOOD_GROUPS.map(bg => (
                                            <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-city" className="text-right text-neutral-300">
                                    City/District
                                </Label>
                                <Select 
                                    value={editingDonor.city} 
                                    onValueChange={(val) => setEditingDonor({...editingDonor, city: val})}
                                >
                                    <SelectTrigger className="col-span-3 bg-neutral-950 border-neutral-800">
                                        <SelectValue placeholder="Select District" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-neutral-900 border-neutral-800 text-white h-60">
                                        {districtsOfBangladesh.map(d => (
                                            <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-status" className="text-right text-neutral-300">
                                    Status
                                </Label>
                                <Select 
                                    value={editingDonor.status} 
                                    onValueChange={(val) => setEditingDonor({...editingDonor, status: val})}
                                >
                                    <SelectTrigger className="col-span-3 bg-neutral-950 border-neutral-800">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-avail" className="text-right text-neutral-300">
                                    Availability
                                </Label>
                                <Select 
                                    value={editingDonor.available ? "yes" : "no"} 
                                    onValueChange={(val) => setEditingDonor({...editingDonor, available: val === 'yes'})}
                                >
                                    <SelectTrigger className="col-span-3 bg-neutral-950 border-neutral-800">
                                        <SelectValue placeholder="Availability" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                                        <SelectItem value="yes">Available</SelectItem>
                                        <SelectItem value="no">Unavailable</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter className="mt-6">
                                <Button type="button" variant="ghost" onClick={() => setEditingDonor(null)} className="text-neutral-400 hover:text-white">Cancel</Button>
                                <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={isSaving}>
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteId} onOpenChange={(open) => !open && !isDeleting && setDeleteId(null)}>
                <DialogContent className="bg-neutral-900 border-neutral-800 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            Delete Donor?
                        </DialogTitle>
                        <DialogDescription className="text-neutral-400">
                            This action cannot be undone. This will permanently remove the donor record and their contact history from the Supabase database.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2 sm:gap-0">
                        <Button 
                            variant="ghost" 
                            onClick={() => setDeleteId(null)} 
                            className="hover:bg-neutral-800 text-neutral-300"
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleDelete} 
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete Donor"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DonorManagement;
