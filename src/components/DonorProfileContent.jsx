
import React from 'react';
import { MapPin, Phone, Mail, Calendar, Heart, Shield, User, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

const InfoRow = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
      <div className="mt-0.5 p-1.5 rounded-full bg-white/5">
        <Icon className="w-4 h-4 text-neutral-400" />
      </div>
      <div>
        <p className="text-xs text-neutral-500 uppercase tracking-wider font-medium">{label}</p>
        <p className="text-sm md:text-base text-neutral-200 font-medium break-all">{value}</p>
      </div>
    </div>
  );
};

const DonorProfileContent = ({ donor }) => {
  if (!donor) return <div className="text-center py-8 text-neutral-500">No donor data available</div>;

  const isAvailable = donor.available !== false; // Default to true if undefined

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start text-center sm:text-left">
        <div className="relative">
          <div className="w-24 h-24 rounded-2xl bg-neutral-800 border-2 border-neutral-700 overflow-hidden flex items-center justify-center">
            {donor.profile_picture_url ? (
              <img src={donor.profile_picture_url} alt={donor.full_name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-neutral-500" />
            )}
          </div>
          <div className={`absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-xs font-bold border-2 border-neutral-900 ${isAvailable ? 'bg-green-500 text-white' : 'bg-neutral-600 text-neutral-300'}`}>
            {isAvailable ? 'Available' : 'Unavailable'}
          </div>
        </div>
        
        <div className="flex-1 space-y-2">
          <h2 className="text-2xl font-bold text-white leading-tight">{donor.full_name || 'Donor'}</h2>
          
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
             <Badge variant="outline" className="border-red-500/30 text-red-400 bg-red-500/5">
                <Heart className="w-3 h-3 mr-1" fill="currentColor" />
                {donor.blood_group || 'Unknown'} Blood
             </Badge>
             {donor.city && (
                <Badge variant="outline" className="border-white/10 text-neutral-300 bg-white/5">
                   <MapPin className="w-3 h-3 mr-1" />
                   {donor.city}
                </Badge>
             )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
         {/* Basic Info */}
         <div className="space-y-1 bg-neutral-950/50 p-4 rounded-xl border border-white/5">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
               <User className="w-4 h-4 text-red-500" /> Personal Details
            </h3>
            <InfoRow icon={User} label="Gender" value={donor.gender} />
            <InfoRow icon={Calendar} label="Age" value={donor.age ? `${donor.age} Years` : null} />
            <InfoRow icon={Clock} label="Member Since" value={formatDate(donor.created_at)} />
         </div>

         {/* Donation Info */}
         <div className="space-y-1 bg-neutral-950/50 p-4 rounded-xl border border-white/5">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
               <Activity className="w-4 h-4 text-red-500" /> Donation Status
            </h3>
            <InfoRow 
              icon={isAvailable ? CheckCircle : XCircle} 
              label="Availability" 
              value={isAvailable ? "Ready to Donate" : "Currently Unavailable"} 
            />
            <InfoRow 
               icon={Calendar} 
               label="Last Donation" 
               value={donor.last_donation_date ? formatDate(donor.last_donation_date) : 'No record'} 
            />
         </div>
      </div>
      
      {/* Contact Info */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 p-4 rounded-xl border border-white/10">
         <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
             <Phone className="w-4 h-4 text-red-500" /> Contact Information
         </h3>
         <div className="grid gap-3">
             <InfoRow icon={Phone} label="Phone Number" value={donor.phone} />
             <InfoRow icon={Mail} label="Email Address" value={donor.email} />
             <InfoRow icon={MapPin} label="Full Address" value={donor.address || donor.location || donor.city} />
         </div>
         <div className="mt-4 pt-3 border-t border-white/5">
            <a 
               href={`tel:${donor.phone}`} 
               className="flex items-center justify-center w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors"
            >
               <Phone className="w-4 h-4 mr-2" /> Call Donor
            </a>
         </div>
      </div>
    </div>
  );
};

// Helper icon component since Activity isn't imported from lucide
function Activity(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}

export default DonorProfileContent;
