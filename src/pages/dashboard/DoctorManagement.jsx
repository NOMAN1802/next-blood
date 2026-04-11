
import React, { useState, useEffect } from 'react';
import { 
    Search, Plus, Edit, Trash2, Eye, RefreshCcw, Stethoscope, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { db } from '@/lib/db';
import DoctorForm from '@/components/DoctorForm';
import { Link } from 'react-router-dom';

const DoctorManagement = () => {
    const { toast } = useToast();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState(null);

    const loadDoctors = async () => {
        setLoading(true);
        try {
            const data = await db.doctors.getAll();
            setDoctors(data || []);
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to load doctors", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDoctors();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this doctor?")) return;
        try {
            await db.doctors.delete(id);
            setDoctors(prev => prev.filter(d => d.id !== id));
            toast({ title: "Deleted", description: "Doctor removed successfully" });
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete doctor", variant: "destructive" });
        }
    };

    const handleEdit = (doc) => {
        setEditingDoctor(doc);
        setIsFormOpen(true);
    };

    const handleCreate = () => {
        setEditingDoctor(null);
        setIsFormOpen(true);
    };

    const handleSuccess = () => {
        setIsFormOpen(false);
        loadDoctors();
    };

    const filtered = doctors.filter(d =>
        (d.full_name || d.name || '').toLowerCase().includes(search.toLowerCase()) ||
        d.specialty?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between gap-4 md:items-end border-b border-neutral-800 pb-6">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Doctor Management</h2>
                    <p className="text-neutral-400 mt-1">Manage doctor profiles and specialties.</p>
                </div>
                <div className="flex gap-2">
                     <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="w-4 h-4 mr-2" /> Add Doctor
                     </Button>
                     <Button onClick={loadDoctors} variant="outline" size="icon">
                        <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                     </Button>
                </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center gap-4">
                <Search className="w-5 h-5 text-neutral-500" />
                <Input 
                    placeholder="Search doctors..." 
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
                                <th className="px-6 py-4">Specialty</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800 text-sm text-neutral-300">
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-neutral-500">Loading...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-neutral-500">No doctors found</td></tr>
                            ) : (
                                filtered.map(doc => (
                                    <tr key={doc.id} className="hover:bg-neutral-800/50">
                                        <td className="px-6 py-4">
                                            <div className="w-10 h-10 rounded-full bg-neutral-800 overflow-hidden flex items-center justify-center border border-neutral-700">
                                                {doc.avatar_url ? (
                                                    <img
                                                        src={doc.avatar_url}
                                                        alt={doc.full_name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                    />
                                                ) : null}
                                                <div className="w-full h-full flex items-center justify-center text-neutral-500" style={{ display: doc.avatar_url ? 'none' : 'flex' }}>
                                                    <User className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-white">{doc.full_name || doc.name}</td>
                                        <td className="px-6 py-4">{doc.specialty || '-'}</td>
                                        <td className="px-6 py-4">{doc.phone || doc.email || '-'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link to={`/doctor/${doc.id}`} target="_blank">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-white"><Eye className="w-4 h-4" /></Button>
                                                </Link>
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(doc)} className="h-8 w-8 hover:text-blue-400"><Edit className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(doc.id)} className="h-8 w-8 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
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
                        <DialogTitle>{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</DialogTitle>
                    </DialogHeader>
                    <DoctorForm 
                        initialData={editingDoctor} 
                        onSuccess={handleSuccess} 
                        onCancel={() => setIsFormOpen(false)} 
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DoctorManagement;
