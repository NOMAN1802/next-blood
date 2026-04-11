import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, MapPin, Search, Loader2, RefreshCw, MessageCircle } from 'lucide-react';
import { districtsOfBangladesh } from '@/lib/locations';
import { useToast } from '@/components/ui/use-toast';

const AdminDonorSearch = () => {
  const { toast } = useToast();
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [bloodGroup, setBloodGroup] = useState('all');
  const [district, setDistrict] = useState('all');
  const [availability, setAvailability] = useState('all');

  const fetchDonors = async () => {
    setLoading(true);
    try {
      let query = supabase.from('donors').select('*');

      if (bloodGroup !== 'all') {
        query = query.eq('blood_group', bloodGroup);
      }

      if (district !== 'all') {
        query = query.eq('city', district);
      }

      if (availability !== 'all') {
        // availability is a boolean in DB
        query = query.eq('available', availability === 'available');
      }

      // Latest first
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setDonors(data || []);
      
    } catch (error) {
      console.error("Error fetching donors:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load donors."
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchDonors();
  }, []); // Run once on mount

  // Refetch when filters change
  useEffect(() => {
    fetchDonors();
  }, [bloodGroup, district, availability]);

  return (
    <div className="min-h-screen bg-neutral-950 p-4 pb-20 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Search className="w-6 h-6 text-red-500" />
              Emergency Donor Search
            </h1>
            <p className="text-neutral-400 text-sm">Fast access to donor contacts</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchDonors} disabled={loading} className="border-neutral-700 text-neutral-300">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Filters Panel */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-4 shadow-lg">
          
          {/* Blood Group Radio Group */}
          <div>
            <label className="text-xs font-bold text-neutral-400 uppercase mb-2 block">Blood Group</label>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={bloodGroup === 'all' ? "default" : "outline"}
                size="sm"
                onClick={() => setBloodGroup('all')}
                className={bloodGroup === 'all' ? "bg-neutral-700 text-white" : "border-neutral-700 text-neutral-400 hover:text-white bg-transparent"}
              >
                All
              </Button>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                <Button
                  key={bg}
                  variant={bloodGroup === bg ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBloodGroup(bg)}
                  className={bloodGroup === bg 
                    ? "bg-red-600 hover:bg-red-500 text-white border-transparent" 
                    : "border-neutral-700 text-neutral-400 hover:text-white bg-transparent hover:border-red-500/50"
                  }
                >
                  {bg}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-neutral-400 uppercase mb-2 block">District</label>
              <Select value={district} onValueChange={setDistrict}>
                <SelectTrigger className="bg-neutral-950 border-neutral-700 text-white">
                  <SelectValue placeholder="All Districts" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-neutral-800 text-white max-h-[300px]">
                  <SelectItem value="all">All Districts</SelectItem>
                  {districtsOfBangladesh.map(d => (
                    <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-xs font-bold text-neutral-400 uppercase mb-2 block">Status</label>
              <Select value={availability} onValueChange={setAvailability}>
                <SelectTrigger className="bg-neutral-950 border-neutral-700 text-white">
                  <SelectValue placeholder="Any Status" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                  <SelectItem value="all">Any Status</SelectItem>
                  <SelectItem value="available">✅ Available</SelectItem>
                  <SelectItem value="unavailable">❌ Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-3">
          {loading ? (
             <div className="flex justify-center py-12">
               <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
             </div>
          ) : donors.length === 0 ? (
            <div className="text-center py-12 bg-neutral-900/50 rounded-xl border border-neutral-800">
              <p className="text-neutral-500">No donors found matching criteria.</p>
            </div>
          ) : (
            donors.map(donor => (
              <Card key={donor.id} className="bg-neutral-900 border-neutral-800 overflow-hidden hover:border-neutral-700 transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    
                    {/* Donor Info */}
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg shadow-inner shrink-0 ${
                        donor.blood_group.includes('+') ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                      }`}>
                        {donor.blood_group}
                      </div>
                      
                      <div>
                        <h3 className="font-bold text-white text-lg leading-tight">{donor.full_name}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-neutral-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> {donor.city || 'Unknown'}
                          </span>
                          {donor.available ? (
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] px-1.5 py-0 h-5">Available</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-neutral-800 text-neutral-500 border-neutral-700 text-[10px] px-1.5 py-0 h-5">Unavailable</Badge>
                          )}
                        </div>
                        {donor.notes && (
                           <p className="text-xs text-neutral-500 mt-2 italic border-l-2 border-neutral-700 pl-2 line-clamp-2">"{donor.notes}"</p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                      <a href={`tel:${donor.phone}`} className="flex-1 sm:flex-none">
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20">
                          <Phone className="w-4 h-4 mr-2" /> Call
                        </Button>
                      </a>
                      <a 
                        href={`https://wa.me/${donor.phone?.replace(/\D/g,'').replace(/^0+/, '880')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex-1 sm:flex-none"
                      >
                        <Button variant="outline" className="w-full border-green-600/30 text-green-500 hover:bg-green-500/10 hover:text-green-400">
                          <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                        </Button>
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          
          <div className="text-center text-xs text-neutral-600 pt-4">
             Showing {donors.length} results
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDonorSearch;