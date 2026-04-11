
import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, CheckCircle2, XCircle, RefreshCw, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabaseAdmin } from '@/lib/customSupabaseClient';

const RequestManagement = () => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const hasWritePermission = () => {
        const role = user?.role || user?.user_metadata?.role || user?.app_metadata?.role;
        return role === 'admin' || role === 'super_admin' || role === 'Super_admin';
    };

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabaseAdmin
                .from('blood_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRequests(data || []);
        } catch (error) {
            console.error('Error fetching blood requests:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to load blood requests.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const updateStatus = async (id, newStatus) => {
        if (!hasWritePermission()) {
            toast({ variant: 'destructive', title: 'Permission Denied' });
            return;
        }

        try {
            const { error } = await supabaseAdmin
                .from('blood_requests')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;

            setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
            toast({ title: 'Status Updated', description: `Request marked as ${newStatus}` });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':   return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            case 'active':    return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            case 'fulfilled': return 'text-green-500 bg-green-500/10 border-green-500/20';
            case 'cancelled': return 'text-neutral-500 bg-neutral-800 border-neutral-700';
            default:          return 'text-white border-neutral-700';
        }
    };

    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'critical': return 'text-red-500';
            case 'urgent':   return 'text-orange-500';
            default:         return 'text-neutral-400';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Blood Requests</h2>
                    <p className="text-neutral-400">Monitor and manage incoming blood requests.</p>
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={fetchRequests}
                    className="bg-neutral-900 border-neutral-800 hover:bg-neutral-800"
                    title="Refresh"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            {loading ? (
                <div className="grid gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl animate-pulse">
                            <div className="h-4 w-24 bg-neutral-800 rounded mb-3" />
                            <div className="h-6 w-64 bg-neutral-800 rounded mb-2" />
                            <div className="h-4 w-48 bg-neutral-800 rounded" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid gap-4">
                    {requests.map((req) => (
                        <div key={req.id} className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl flex flex-col md:flex-row justify-between gap-6 hover:border-neutral-700 transition-colors">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide border ${getStatusColor(req.status)}`}>
                                        {req.status || 'pending'}
                                    </span>
                                    {req.urgency === 'critical' && (
                                        <span className={`flex items-center gap-1 text-xs font-bold animate-pulse ${getUrgencyColor(req.urgency)}`}>
                                            <AlertCircle size={12} /> CRITICAL
                                        </span>
                                    )}
                                    {req.urgency === 'urgent' && (
                                        <span className={`flex items-center gap-1 text-xs font-bold ${getUrgencyColor(req.urgency)}`}>
                                            <AlertCircle size={12} /> URGENT
                                        </span>
                                    )}
                                    <span className="text-neutral-500 text-xs flex items-center gap-1">
                                        <Clock size={12} /> {new Date(req.created_at).toLocaleString()}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-1">
                                    <span className="text-red-500">{req.blood_group}</span> needed for {req.patient_name}
                                </h3>
                                <p className="text-neutral-400 text-sm mb-3">
                                    at <span className="text-white font-medium">{req.hospital}</span>
                                    {req.city && <span className="text-neutral-500"> · <MapPin size={12} className="inline" /> {req.city}</span>}
                                </p>

                                <div className="flex flex-wrap gap-3">
                                    {req.contact_phone && (
                                        <div className="flex items-center gap-2 text-sm text-neutral-400 bg-neutral-950 px-3 py-1.5 rounded border border-neutral-800">
                                            <Phone size={13} className="text-red-500" />
                                            {req.contact_phone}
                                        </div>
                                    )}
                                    {req.message && (
                                        <div className="text-sm text-neutral-500 bg-neutral-950 px-3 py-1.5 rounded border border-neutral-800 max-w-xs truncate">
                                            {req.message}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {hasWritePermission() && req.status !== 'fulfilled' && req.status !== 'cancelled' && (
                                <div className="flex flex-row md:flex-col gap-2 justify-center min-w-[140px]">
                                    <Button
                                        onClick={() => updateStatus(req.id, 'fulfilled')}
                                        className="bg-green-600 hover:bg-green-700 text-white flex-1"
                                    >
                                        <CheckCircle2 size={16} className="mr-2" /> Fulfilled
                                    </Button>
                                    <Button
                                        onClick={() => updateStatus(req.id, 'cancelled')}
                                        variant="outline"
                                        className="border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-800 flex-1"
                                    >
                                        <XCircle size={16} className="mr-2" /> Cancel
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}

                    {requests.length === 0 && (
                        <div className="text-center py-16 text-neutral-500 bg-neutral-900/50 border border-neutral-800 rounded-xl border-dashed">
                            No blood requests found in the system.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RequestManagement;
