import React, { useState, useEffect } from 'react';
import { Flag, MapPin, User, CheckCircle2, Clock, RefreshCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const RaceStationManagement = () => {
    const { toast } = useToast();
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadStations = async () => {
        setLoading(true);
        try {
            console.log("Loading race stations...");
            const data = await db.raceStations.getAll();
            setStations(data || []);
        } catch (error) {
            console.error("Failed to load race stations:", error);
            toast({
                title: "Sync Error",
                description: "Failed to fetch stations from Supabase. Check console for details.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStations();

        // Real-time subscription
        const channel = supabase
            .channel('race-stations-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'race_stations' }, (payload) => {
                console.log('Real-time update for Race Stations:', payload);
                loadStations();
            })
            .subscribe((status) => {
                 if (status === 'SUBSCRIBED') console.log("Race Stations: Live Sync Active");
                 if (status === 'CHANNEL_ERROR') console.error("Race Stations: Live Sync Error");
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const updateStatus = async (id, newStatus) => {
        try {
            // Optimistic update
            setStations(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
            await db.raceStations.updateStatus(id, newStatus);
            toast({ title: "Status Updated", description: `Station marked as ${newStatus}` });
        } catch (error) {
            loadStations(); // Revert
            toast({ variant: "destructive", title: "Update Failed", description: error.message });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Flag className="text-red-500" /> Race Stations
                    </h2>
                    <p className="text-neutral-400">Manage charity run stations in real-time.</p>
                </div>
                <Button variant="outline" size="icon" onClick={loadStations} className="border-neutral-800 text-neutral-400 hover:text-white">
                    <RefreshCcw className={loading ? "animate-spin" : ""} />
                </Button>
            </div>

            <div className="grid gap-4">
                {stations.length > 0 ? stations.map((station) => (
                    <div key={station.id} className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl flex flex-col md:flex-row justify-between gap-6 hover:border-neutral-700 transition-colors">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide border ${
                                    station.status === 'active' ? 'text-green-500 bg-green-500/10 border-green-500/20' : 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
                                }`}>
                                    {station.status}
                                </span>
                                <span className="text-neutral-500 text-xs flex items-center gap-1">
                                    <Clock size={12} /> {new Date(station.created_at).toLocaleString()}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">{station.station_name}</h3>
                            <div className="flex flex-col gap-1 text-sm text-neutral-400 mt-2">
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} /> {station.location}
                                </div>
                                <div className="flex items-center gap-2">
                                    <User size={14} /> {station.organizer_name} ({station.contact_number})
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {station.status !== 'active' && (
                                <Button onClick={() => updateStatus(station.id, 'active')} className="bg-green-600 hover:bg-green-700 text-white">
                                    <CheckCircle2 size={16} className="mr-2" /> Approve
                                </Button>
                            )}
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-12 text-neutral-500 bg-neutral-900/50 border border-neutral-800 rounded-xl border-dashed">
                        {loading ? <Loader2 className="animate-spin mx-auto" /> : "No race stations found."}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RaceStationManagement;