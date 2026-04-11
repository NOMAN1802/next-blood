
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, Phone, Search, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { supabase } from '@/lib/customSupabaseClient';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

const HospitalPage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { toast } = useToast();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchHospitals = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('hospitals')
          .select('*')
          .order('name');
        
        if (debouncedSearch) {
          query = query.or(`name.ilike.%${debouncedSearch}%,location.ilike.%${debouncedSearch}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        setHospitals(data || []);
      } catch (error) {
        console.error("Failed to load hospitals", error);
        toast({
          title: "Error",
          description: "Could not load hospitals list. Please check your connection.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchHospitals();
  }, [debouncedSearch, toast]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-24 pb-16">
      <SEO title="Hospitals | Next Blood" description="Find hospitals and medical centers near you." />
      
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            <span className="text-green-500">Find</span> Hospitals
          </h1>
          <p className="text-xl text-neutral-400 mb-8">
            Locate nearest medical centers and emergency services.
          </p>

          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5" />
            <Input 
              placeholder="Search by name or city..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-14 bg-neutral-900 border-neutral-800 rounded-full text-lg focus:border-green-500/50"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-neutral-900 rounded-xl p-6 border border-neutral-800 space-y-4">
                 <div className="flex items-center gap-4">
                    <Skeleton className="w-16 h-16 rounded-lg bg-neutral-800" />
                    <div className="space-y-2">
                       <Skeleton className="h-5 w-40 bg-neutral-800" />
                       <Skeleton className="h-4 w-24 bg-neutral-800" />
                    </div>
                 </div>
                 <Skeleton className="h-20 w-full bg-neutral-800" />
              </div>
            ))}
          </div>
        ) : hospitals.length === 0 ? (
          <div className="text-center py-20 bg-neutral-900/50 rounded-2xl border border-neutral-800">
             <Building2 className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
             <h3 className="text-2xl font-bold text-white mb-2">No Hospitals Found</h3>
             <p className="text-neutral-500">
               {debouncedSearch ? "Try adjusting your search terms." : "No hospitals registered yet."}
             </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hospitals.map((hosp, idx) => (
              <motion.div
                key={hosp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800 hover:border-green-500/50 transition-all hover:shadow-lg hover:shadow-green-900/10 group flex flex-col"
              >
                <div className="flex items-start gap-4 mb-4">
                   <div className="w-16 h-16 rounded-lg bg-neutral-800 overflow-hidden flex-shrink-0 border border-neutral-700 group-hover:border-green-500 transition-colors flex items-center justify-center">
                      {hosp.image_url ? (
                        <img 
                          src={hosp.image_url} 
                          alt={hosp.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                        />
                      ) : null}
                      <div className="w-full h-full flex items-center justify-center text-neutral-500 bg-neutral-800" style={{ display: hosp.image_url ? 'none' : 'flex' }}>
                        <Building2 className="w-8 h-8" />
                      </div>
                   </div>
                   <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors line-clamp-1">
                        {hosp.name || "Unknown Hospital"}
                      </h3>
                      <div className="flex flex-col gap-1">
                        <span className="text-green-500 text-sm font-medium">
                          {hosp.location || 'Unknown Location'}
                        </span>
                        <Badge variant="outline" className="w-fit text-xs border-neutral-700 text-neutral-400">
                            {hosp.category || 'General'}
                        </Badge>
                      </div>
                   </div>
                </div>

                <div className="mb-4">
                   <p className="text-sm text-neutral-500 line-clamp-2 min-h-[40px]">
                      {hosp.description || "No description available."}
                   </p>
                </div>

                <div className="space-y-3 mb-6 text-sm text-neutral-400 flex-grow">
                   {hosp.address && (
                     <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-neutral-600 mt-0.5" />
                        <span className="line-clamp-2">{hosp.address}</span>
                     </div>
                   )}
                   {hosp.phone && (
                     <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-neutral-600" />
                        <span>{hosp.phone}</span>
                     </div>
                   )}
                </div>

                <Link to={`/hospital/${hosp.id}`} className="mt-auto">
                   <Button className="w-full bg-neutral-800 hover:bg-green-600 text-white transition-colors">
                      View Profile
                   </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalPage;
