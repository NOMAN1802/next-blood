
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, User, Calendar, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';

const DonorCard = ({ donor, onViewProfile }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const d = {
    id: donor.id,
    name: donor.full_name || donor.fullName || "Unknown Donor",
    bloodGroup: donor.blood_group || donor.bloodGroup || "?",
    phone: donor.phone,
    email: donor.email,
    city: donor.city || donor.location || "Unknown Location",
    status: donor.status || "active",
    gender: donor.gender, 
    medical: donor.health_conditions || donor.healthConditions || donor.medical_history,
    joined: donor.created_at || donor.registrationDate || donor.joined_at,
    photo: donor.profile_picture_url || donor.profilePhoto,
    available: donor.available !== undefined ? donor.available : true
  };

  const getSafeName = (name) => {
    if (!name) return "Unknown";
    const markers = ['Voter', 'NID', 'Reg.', 'Father', 'Mother'];
    let clean = name;
    for (const marker of markers) {
        const idx = clean.indexOf(marker);
        if (idx !== -1) clean = clean.substring(0, idx);
    }
    return clean.trim();
  };

  const safeName = getSafeName(d.name);
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const genderEmoji = 
    d.gender?.toLowerCase() === 'female' ? '👩' : 
    (d.gender?.toLowerCase() === 'male' ? '👨' : '👤');

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
        case 'approved': return 'bg-green-500/10 text-green-400 border-green-500/20';
        case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
        case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/20';
        default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group relative bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-red-500/30 transition-all duration-300 shadow-xl flex flex-col h-full"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-red-500 to-orange-500" />
      
      <div className="p-4 sm:p-5 flex flex-col h-full gap-4">
        
        {/* Header Section */}
        <div className="flex justify-between items-start gap-3">
            <div className="flex gap-3 sm:gap-4 min-w-0 flex-1">
                {/* Avatar */}
                <div className="relative shrink-0">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-neutral-800 border border-neutral-700 overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                        {d.photo ? (
                            <img src={d.photo} alt={safeName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-2xl sm:text-3xl bg-gradient-to-br from-neutral-800 to-neutral-900 w-full h-full flex items-center justify-center">
                                {genderEmoji}
                            </div>
                        )}
                    </div>
                     <div className={`absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 sm:border-4 border-neutral-900 flex items-center justify-center ${d.available ? 'bg-green-500' : 'bg-neutral-600'}`} title={d.available ? 'Available' : 'Unavailable'}>
                        {d.available && <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 bg-white rounded-full animate-pulse" />}
                    </div>
                </div>

                {/* Name & Info */}
                <div className="flex flex-col pt-0.5 space-y-1 min-w-0 flex-1">
                    <h3 className="font-bold text-white text-base sm:text-lg leading-tight truncate w-full" title={d.name}>
                        {safeName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                        <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500 shrink-0" />
                        <span className="truncate">{d.city}</span>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={`w-fit text-[10px] px-2 py-0 h-5 border font-medium tracking-wide ${getStatusColor(d.status)}`}>
                          {d.status.toUpperCase()}
                      </Badge>
                    </div>
                </div>
            </div>

            {/* Blood Group */}
            <div className="flex flex-col items-end shrink-0">
                <div className="relative group/blood">
                    <div className="w-10 h-12 sm:w-12 sm:h-14 bg-gradient-to-b from-neutral-800 to-neutral-900 rounded-xl border border-neutral-700 flex flex-col items-center justify-center shadow-lg group-hover/blood:border-red-500/50 transition-colors">
                        <span className="text-[9px] sm:text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Type</span>
                        <span className="text-lg sm:text-xl font-black text-red-500 drop-shadow-sm">{d.bloodGroup}</span>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 sm:w-8 h-1 bg-red-600/50 blur-md rounded-full opacity-0 group-hover/blood:opacity-100 transition-opacity" />
                </div>
            </div>
        </div>

        <div className="h-px w-full bg-white/5" />

        {/* Details Grid */}
        <div className="grid grid-cols-1 gap-y-2.5 sm:gap-y-3 gap-x-2 text-xs sm:text-sm text-neutral-300 flex-1">
            {d.email && (
                <div className="flex items-center gap-2 truncate text-xs" title={d.email}>
                   <span className="text-base leading-none">📧</span>
                   <span className="truncate opacity-80">{d.email}</span>
                </div>
            )}
            
            <div className="flex items-center gap-2 text-xs">
                <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-500 shrink-0" />
                <span className="font-mono opacity-80">{d.phone || 'N/A'}</span>
            </div>

            {d.joined && (
                 <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-400 shrink-0" />
                    <span className="opacity-80 text-xs">Joined: {formatDate(d.joined)}</span>
                </div>
            )}
        </div>

        {/* Actions Footer */}
        <div className="mt-auto grid grid-cols-2 gap-2 sm:gap-3 pt-2">
            <Button 
                variant="outline" 
                size="sm"
                className="bg-transparent border-neutral-700 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors text-xs h-9 sm:h-10 w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onViewProfile) {
                    onViewProfile(d.id);
                  } else {
                    navigate(`/donor/${d.id}`);
                  }
                }}
            >
                <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 sm:mr-2" />
                <span className="hidden xs:inline">{t('view_profile') || 'Profile'}</span>
                <span className="xs:hidden">View</span>
            </Button>
            
            <Button 
                size="sm"
                className={`${d.available ? 'bg-red-600 hover:bg-red-500' : 'bg-neutral-700 cursor-not-allowed'} text-white shadow-lg shadow-red-900/20 text-xs h-9 sm:h-10 w-full`}
                disabled={!d.available}
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `tel:${d.phone}`;
                }}
            >
                <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 sm:mr-2" />
                <span className="hidden xs:inline">{t('contact_donor') || 'Contact'}</span>
                <span className="xs:hidden">Call</span>
            </Button>
        </div>

      </div>
    </motion.div>
  );
};

export default DonorCard;
