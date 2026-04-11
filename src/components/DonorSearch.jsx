
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, RefreshCw, Heart, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReceiverModal from '@/components/ReceiverModal';
import { supabaseAdmin } from '@/lib/customSupabaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BLOOD_GROUPS, districtsOfBangladesh } from '@/lib/locations';
import DonorCard from '@/components/DonorCard';
import DonorProfileModal from '@/components/DonorProfileModal';
import { Skeleton } from '@/components/ui/skeleton';

const DonorSearch = ({ onBack }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [donors, setDonors] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  
  // Modal State
  const [selectedDonorId, setSelectedDonorId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showReceiverModal, setShowReceiverModal] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  // Filters from URL
  const query = searchParams.get('q') || '';
  const group = searchParams.get('group') || 'all';
  const city = searchParams.get('city') || 'all';

  // Debounced query state
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
        setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const fetchDonors = async () => {
    setLoading(true);
    try {
      let queryBuilder = supabaseAdmin
        .from('donors')
        .select('*', { count: 'exact' });

      // Apply Filters
      if (group && group !== 'all') {
        queryBuilder = queryBuilder.eq('blood_group', group);
      }
      
      if (city && city !== 'all') {
        queryBuilder = queryBuilder.ilike('city', `%${city}%`);
      }

      if (debouncedQuery) {
        const term = debouncedQuery.trim();
        // Check if it looks like a phone number
        if (/^\d+$/.test(term.replace(/[+\-\s]/g, ''))) {
          queryBuilder = queryBuilder.ilike('phone', `%${term}%`);
        } else {
          // Name search: each word must appear in full_name
          const words = term.split(/\s+/).filter(Boolean);
          words.forEach(word => {
            queryBuilder = queryBuilder.ilike('full_name', `%${word}%`);
          });
        }
      }

      // Default sorting: Available first, then new ones
      queryBuilder = queryBuilder.order('available', { ascending: false }).order('created_at', { ascending: false });

      const { data, count, error } = await queryBuilder;

      if (error) throw error;
      
      setDonors(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching donors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [debouncedQuery, group, city]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleViewProfile = (id) => {
    setSelectedDonorId(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedDonorId(null), 300); // Clear ID after animation
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/10 via-neutral-950 to-neutral-950 text-white pb-20">
      {/* Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full bg-red-600 flex items-center justify-between px-6 py-4 shadow-lg mb-8"
          >
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-white" />
              <span className="text-white font-semibold text-sm md:text-base">
                Did you find the blood you requested?
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowBanner(false); setShowReceiverModal(true); }}
                className="flex items-center gap-1.5 bg-white text-red-600 font-bold text-sm px-4 py-1.5 rounded-full hover:bg-red-50 transition-colors"
              >
                <Check className="w-4 h-4" /> YES
              </button>
              <button
                onClick={() => setShowBanner(false)}
                className="flex items-center gap-1.5 bg-white/20 text-white font-bold text-sm px-4 py-1.5 rounded-full hover:bg-white/30 transition-colors border border-white/40"
              >
                <X className="w-4 h-4" /> NO
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-4">
      <div className="container max-w-7xl mx-auto">
        
        {/* Header & Controls */}
        <div className="mb-8 space-y-6">
           <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full hover:bg-white/10">
                 <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-3xl font-bold">Find Donors</h1>
              <div className="ml-auto flex items-center gap-4">
                <span className="text-sm text-neutral-400">
                  {loading ? 'Searching...' : `${totalCount} donors found`}
                </span>
                <Button
                  onClick={() => setShowReceiverModal(true)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Heart className="w-4 h-4 mr-2" /> Saved Life
                </Button>
              </div>
           </div>

           <div className="bg-neutral-900/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
                 <Input 
                   placeholder="Search by name, phone..." 
                   value={query}
                   onChange={(e) => updateFilter('q', e.target.value)}
                   className="pl-9 bg-black/40 border-white/10 text-white placeholder:text-neutral-500"
                 />
              </div>
              
              <div className="flex gap-4 w-full md:w-auto">
                 <Select value={group} onValueChange={(val) => updateFilter('group', val)}>
                    <SelectTrigger className="w-full md:w-[180px] bg-black/40 border-white/10 text-white">
                       <SelectValue placeholder="Blood Group" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                       <SelectItem value="all">All Groups</SelectItem>
                       {BLOOD_GROUPS.map(bg => (
                          <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                       ))}
                    </SelectContent>
                 </Select>

                 <Select value={city} onValueChange={(val) => updateFilter('city', val)}>
                    <SelectTrigger className="w-full md:w-[180px] bg-black/40 border-white/10 text-white">
                       <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-800 text-white max-h-[300px]">
                       <SelectItem value="all">All Locations</SelectItem>
                       {districtsOfBangladesh.map(d => (
                          <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
                       ))}
                    </SelectContent>
                 </Select>
                 
                 <Button variant="outline" size="icon" onClick={fetchDonors} className="shrink-0 border-white/10 hover:bg-white/10">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                 </Button>
              </div>
           </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {Array(8).fill(0).map((_, i) => (
                <div key={i} className="bg-neutral-900/50 rounded-2xl p-4 border border-white/5 space-y-4">
                   <div className="flex gap-4">
                      <Skeleton className="w-16 h-16 rounded-2xl bg-white/5" />
                      <div className="space-y-2 flex-1 pt-1">
                         <Skeleton className="h-5 w-3/4 bg-white/5" />
                         <Skeleton className="h-4 w-1/2 bg-white/5" />
                      </div>
                   </div>
                   <Skeleton className="h-20 w-full bg-white/5 rounded-xl" />
                   <div className="flex gap-2">
                      <Skeleton className="h-9 w-full bg-white/5 rounded-lg" />
                      <Skeleton className="h-9 w-full bg-white/5 rounded-lg" />
                   </div>
                </div>
             ))}
          </div>
        ) : donors.length > 0 ? (
           <motion.div 
             layout
             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
           >
             <AnimatePresence>
               {donors.map((donor) => (
                 <DonorCard 
                   key={donor.id} 
                   donor={donor} 
                   onViewProfile={handleViewProfile}
                 />
               ))}
             </AnimatePresence>
           </motion.div>
        ) : (
           <div className="text-center py-20">
              <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Search className="w-8 h-8 text-neutral-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No donors found</h3>
              <p className="text-neutral-400">Try adjusting your search filters to see more results.</p>
              <Button onClick={() => { updateFilter('q', ''); updateFilter('group', 'all'); updateFilter('city', 'all'); }} variant="link" className="text-red-500 mt-2">
                 Clear all filters
              </Button>
           </div>
        )}
      </div>
      </div>{/* closes pt-4 wrapper */}

      {/* Receiver Details Modal */}
      {showReceiverModal && <ReceiverModal onClose={() => setShowReceiverModal(false)} />}

      {/* Donor Profile Modal */}
      <DonorProfileModal
        donorId={selectedDonorId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default DonorSearch;
