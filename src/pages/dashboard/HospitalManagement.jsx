
import React, { useState, useEffect } from 'react';
import { 
    Search, Plus, Edit, Trash2, Eye, RefreshCcw, Building2, Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { db } from '@/lib/db';
import HospitalForm from '@/components/HospitalForm';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const HospitalManagement = () => {
    const { toast } = useToast();
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingHospital, setEditingHospital] = useState(null);

    const loadHospitals = async () => {
        setLoading(true);
        try {
            const data = await db.hospitals.getAll();
            setHospitals(data || []);
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to load hospitals", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHospitals();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this hospital?")) return;
        try {
            await db.hospitals.delete(id);
            setHospitals(prev => prev.filter(h => h.id !== id));
            toast({ title: "Deleted", description: "Hospital removed successfully" });
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete hospital", variant: "destructive" });
        }
    };

    const handleEdit = (hosp) => {
        setEditingHospital(hosp);
        setIsFormOpen(true);
    };

    const handleCreate = () => {
        setEditingHospital(null);
        setIsFormOpen(true);
    };

    const handleSuccess = () => {
        setIsFormOpen(false);
        loadHospitals();
    };

    const handleSync = () => {
        toast({ title: "Sync Started", description: "Syncing hospital inventory..." });
        // Simulation of sync
        setTimeout(() => toast({ title: "Sync Complete", description: "Inventory data updated." }), 1500);
    };

    const filtered = hospitals.filter(h => 
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.location?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between gap-4 md:items-end border-b border-neutral-800 pb-6">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Hospital Management</h2>
                    <p className="text-neutral-400 mt-1">Manage partner hospitals and centers.</p>
                </div>
                <div className="flex gap-2">
                     <Button onClick={handleSync} variant="outline" className="border-neutral-700 text-neutral-300">
                        <Database className="w-4 h-4 mr-2" /> Sync Inventory
                     </Button>
                     <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700 text-white">
                        <Plus className="w-4 h-4 mr-2" /> Add Hospital
                     </Button>
                     <Button onClick={loadHospitals} variant="outline" size="icon">
                        <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                     </Button>
                </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center gap-4">
                <Search className="w-5 h-5 text-neutral-500" />
                <Input 
                    placeholder="Search hospitals..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="bg-transparent border-none focus-visible:ring-0 text-white placeholder:text-neutral-500"
                />
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-neutral-950 text-neutral-500 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Image</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800 text-sm text-neutral-300">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-neutral-500">Loading...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-neutral-500">No hospitals found</td></tr>
                            ) : (
                                filtered.map(hosp => (
                                    <tr key={hosp.id} className="hover:bg-neutral-800/50">
                                        <td className="px-6 py-4">
                                            <div className="w-10 h-10 rounded-md bg-neutral-800 overflow-hidden flex items-center justify-center border border-neutral-700">
                                                {hosp.image_url ? (
                                                    <img 
                                                        src={hosp.image_url} 
                                                        alt={hosp.name} 
                                                        className="w-full h-full object-cover" 
                                                        onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                    />
                                                ) : null}
                                                <div className="w-full h-full flex items-center justify-center text-neutral-500" style={{ display: hosp.image_url ? 'none' : 'flex' }}>
                                                    <Building2 className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-white">{hosp.name}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className="border-neutral-700 text-neutral-400">
                                                {hosp.category || 'General'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">{hosp.location || '-'}</td>
                                        <td className="px-6 py-4">{hosp.phone || hosp.email || '-'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link to={`/hospital/${hosp.id}`} target="_blank">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-white"><Eye className="w-4 h-4" /></Button>
                                                </Link>
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(hosp)} className="h-8 w-8 hover:text-green-400"><Edit className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(hosp.id)} className="h-8 w-8 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="bg-neutral-900 border-neutral-800 text-white sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingHospital ? 'Edit Hospital' : 'Add New Hospital'}</DialogTitle>
                    </DialogHeader>
                    <HospitalForm 
                        initialData={editingHospital} 
                        onSuccess={handleSuccess} 
                        onCancel={() => setIsFormOpen(false)} 
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default HospitalManagement;
