
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Mail, Phone, Calendar, Building2, Navigation, Edit, Trash2, ShieldCheck, Activity, Star, Users, Bed, Stethoscope, Bus as Ambulance, Check, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SEO from '@/components/SEO';
import { supabase } from '@/lib/customSupabaseClient';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { isSuperAdmin } from '@/lib/roleUtils';
import { useToast } from '@/components/ui/use-toast';
import { cn } from "@/lib/utils";

// Parse a comma-separated DB string into a trimmed array, filtering empty entries
const parseList = (str) =>
  str ? str.split(',').map(s => s.trim()).filter(Boolean) : [];

const HospitalProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [relatedHospitals, setRelatedHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Hospital Details
        const { data: hospitalData, error: hospitalError } = await supabase
          .from('hospitals')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (hospitalError) throw hospitalError;
        if (!hospitalData) throw new Error("Hospital not found");
        
        setHospital(hospitalData);

        // 2. Fetch Doctors (Limit 3, random or by logic)
        // In a real app, we would filter by hospital_id
        const { data: doctorsData } = await supabase
          .from('doctors')
          .select('*')
          .limit(3);
          
        setDoctors(doctorsData || []);

        // 3. Fetch Related Hospitals (Same location, exclude current)
        let relatedQuery = supabase
          .from('hospitals')
          .select('*')
          .neq('id', id)
          .limit(3);

        if (hospitalData.location) {
           // We can't do complex ORs easily on same column with Supabase plain client without raw SQL sometimes, 
           // but we can try simple filter.
           relatedQuery = relatedQuery.ilike('location', `%${hospitalData.location}%`);
        }
        
        const { data: relatedData } = await relatedQuery;
        setRelatedHospitals(relatedData || []);

      } catch (err) {
        console.error("Failed to load hospital data", err);
        setError("Hospital not found or connection failed.");
      } finally {
        setLoading(false);
      }
    };
    
    window.scrollTo(0, 0);
    if (id) fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this hospital profile? This action cannot be undone.")) return;
    try {
      const { error } = await supabase.from('hospitals').delete().eq('id', id);
      if (error) throw error;
      
      toast({ title: "Success", description: "Hospital profile deleted successfully" });
      navigate('/hospital');
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete hospital", variant: "destructive" });
    }
  };

  const canEdit = user && isSuperAdmin(user.role);

  if (loading) return <HospitalSkeleton />;

  if (error || !hospital) return (
    <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center text-white flex-col gap-6 p-4">
      <div className="bg-white/5 p-8 rounded-2xl border border-white/10 text-center max-w-md w-full">
        <Building2 className="w-16 h-16 text-red-500 mx-auto mb-4 opacity-80" />
        <h2 className="text-2xl font-bold mb-2">{error || "Hospital Not Found"}</h2>
        <p className="text-neutral-400 mb-6">The hospital profile you are looking for might have been removed or is temporarily unavailable.</p>
        <Link to="/hospital">
          <Button className="bg-red-600 hover:bg-red-700 w-full">Return to Directory</Button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-neutral-100 font-sans pb-20">
      <SEO title={`${hospital.name} | Next Blood`} description={`Full profile and medical services of ${hospital.name}`} />
      
      {/* 1. Hero Section */}
      <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-[#1a1a2e]/60 to-transparent z-10" />
        <img 
          src={hospital.image_url || "https://images.unsplash.com/photo-1538108149393-fbbd8189718c?auto=format&fit=crop&q=80&w=2000"} 
          alt={hospital.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-24 left-4 md:left-8 z-20">
          <Button 
            variant="secondary" 
            size="sm" 
            className="bg-black/40 hover:bg-black/60 text-white border border-white/20 backdrop-blur-md"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>
      </div>

      <div className="container px-4 mx-auto max-w-7xl relative z-20 -mt-24 md:-mt-32 space-y-8">
        
        {/* 2. Hospital Info Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-2xl p-6 md:p-8 text-neutral-900 grid md:grid-cols-3 gap-6 items-start"
        >
          <div className="md:col-span-2 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-sm rounded-full">
                {hospital.category || "General Hospital"}
              </Badge>
              {hospital.rating && (
                <div className="flex items-center gap-1 text-yellow-500">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`w-4 h-4 ${parseFloat(hospital.rating) >= i ? 'fill-current' : 'opacity-30'}`} />
                  ))}
                  <span className="text-neutral-500 text-sm ml-1 font-medium">({hospital.rating}/5)</span>
                </div>
              )}
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-[#1a1a2e] leading-tight">
              {hospital.name}
            </h1>
            
            <div className="space-y-2 text-neutral-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500 shrink-0" />
                <span>{hospital.address || hospital.location || "Location unavailable"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-red-500 shrink-0" />
                <span>{hospital.phone || "+880 1XXX-XXXXXX"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-red-500 shrink-0" />
                <span>{hospital.email || "info@hospital.com"}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full md:border-l md:border-neutral-100 md:pl-6">
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white h-12 text-lg shadow-lg shadow-red-200">
              <Phone className="w-5 h-5 mr-2" /> Call Now
            </Button>
            <Button variant="outline" className="w-full border-neutral-300 text-neutral-700 hover:bg-neutral-50 h-12">
              <ExternalLink className="w-5 h-5 mr-2" /> Visit Website
            </Button>
            <Button variant="outline" className="w-full border-neutral-300 text-neutral-700 hover:bg-neutral-50 h-12">
              <Navigation className="w-5 h-5 mr-2" /> Get Directions
            </Button>
            {canEdit && (
               <div className="flex gap-2 mt-2 pt-4 border-t border-neutral-100">
                 <Link to={`/dashboard/hospitals`} className="w-full">
                   <Button variant="secondary" className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900">
                     <Edit className="w-4 h-4 mr-2" /> Edit
                   </Button>
                 </Link>
                 <Button 
                   variant="destructive" 
                   className="w-full bg-neutral-100 text-red-600 hover:bg-red-50 hover:text-red-700 border border-transparent hover:border-red-100"
                   onClick={handleDelete}
                 >
                   <Trash2 className="w-4 h-4 mr-2" /> Delete
                 </Button>
               </div>
            )}
          </div>
        </motion.div>

        {/* 3. Hospital Details Grid */}
        {(hospital.total_beds || hospital.departments_count || hospital.established_year || hospital.doctors_count || hospital.ambulance || hospital.icu_beds) && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {hospital.total_beds        && <StatCard icon={Bed}        label="Total Beds"   value={hospital.total_beds} />}
            {hospital.departments_count && <StatCard icon={Building2}  label="Departments"  value={hospital.departments_count} />}
            {hospital.established_year  && <StatCard icon={Calendar}   label="Established"  value={hospital.established_year} />}
            {hospital.doctors_count     && <StatCard icon={Stethoscope} label="Doctors"     value={hospital.doctors_count} />}
            {hospital.ambulance         && <StatCard icon={Ambulance}  label="Ambulance"    value={hospital.ambulance} />}
            {hospital.icu_beds          && <StatCard icon={Activity}   label="ICU Beds"     value={hospital.icu_beds} />}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column (Content) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 4. About Section */}
            <Section title="About Hospital" icon={Building2}>
              <div className="prose max-w-none text-neutral-600">
                <p className={cn(
                  "leading-relaxed transition-all duration-300 overflow-hidden",
                  !isDescriptionExpanded && "line-clamp-3"
                )}>
                  {hospital.description || "This hospital is a state-of-the-art medical facility dedicated to providing comprehensive healthcare services. With a team of highly skilled professionals and advanced technology, we ensure the best possible care for our patients. Our mission is to deliver compassionate, high-quality, and affordable healthcare to the community. We specialize in various medical fields including cardiology, orthopedics, neurology, and more."}
                </p>
                <Button 
                  variant="link" 
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="p-0 h-auto font-semibold text-red-600 mt-2 hover:text-red-700"
                >
                  {isDescriptionExpanded ? (
                    <span className="flex items-center">Read Less <ChevronUp className="w-4 h-4 ml-1" /></span>
                  ) : (
                    <span className="flex items-center">Read More <ChevronDown className="w-4 h-4 ml-1" /></span>
                  )}
                </Button>
              </div>
            </Section>

            {/* 6. Departments */}
            {parseList(hospital.departments).length > 0 && (
              <Section title="Departments" icon={Building2}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {parseList(hospital.departments).map((dept, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 border border-neutral-100 hover:border-red-100 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                        <Activity className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-neutral-700 text-sm">{dept}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* 8. Doctors Section */}
            <Section title="Our Specialists" icon={Stethoscope}>
              {doctors.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {doctors.map(doc => (
                    <div key={doc.id} className="flex items-start gap-4 p-4 rounded-xl border border-neutral-100 bg-neutral-50 hover:shadow-lg transition-all group">
                      <div className="w-16 h-16 rounded-full bg-neutral-200 overflow-hidden shrink-0 border-2 border-white shadow-sm">
                        {doc.image_url ? (
                          <img src={doc.image_url} alt={doc.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-neutral-200 text-neutral-400">
                            <Users className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-neutral-900 truncate group-hover:text-red-600 transition-colors">{doc.name}</h4>
                        <p className="text-sm text-red-500 font-medium mb-1">{doc.specialty}</p>
                        <p className="text-xs text-neutral-500 truncate mb-3">{doc.email || "No email"}</p>
                        <Link to={`/doctor/${doc.id}`}>
                          <Button size="sm" variant="outline" className="h-7 text-xs w-full bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                 <div className="text-center py-8 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                    <Users className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                    <p className="text-neutral-500">No doctors listed yet.</p>
                 </div>
              )}
            </Section>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="space-y-8">
            
            {/* 7. Facilities */}
            {parseList(hospital.facilities).length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-neutral-100 overflow-hidden">
                 <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
                    <h3 className="text-white font-bold flex items-center gap-2">
                       <ShieldCheck className="w-5 h-5" /> Facilities
                    </h3>
                 </div>
                 <div className="p-6">
                    <div className="space-y-3">
                       {parseList(hospital.facilities).map((facility, i) => (
                          <div key={i} className="flex items-center gap-3 text-neutral-600 text-sm">
                             <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                                <Check className="w-3 h-3" />
                             </div>
                             {facility}
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
            )}

            {/* 9. Related Hospitals */}
            {relatedHospitals.length > 0 && (
               <div className="bg-white rounded-xl shadow-lg border border-neutral-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-neutral-100">
                     <h3 className="font-bold text-neutral-800">Nearby Hospitals</h3>
                  </div>
                  <div className="divide-y divide-neutral-100">
                     {relatedHospitals.map(h => (
                        <div key={h.id} className="p-4 hover:bg-neutral-50 transition-colors flex gap-4">
                           <div className="w-16 h-16 rounded-lg bg-neutral-100 overflow-hidden shrink-0">
                              <img src={h.image_url || "https://via.placeholder.com/100"} alt="" className="w-full h-full object-cover" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-neutral-900 text-sm mb-1 line-clamp-1">{h.name}</h4>
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-neutral-100 text-neutral-600 mb-2">
                                 {h.category || "Hospital"}
                              </Badge>
                              <Link to={`/hospital/${h.id}`}>
                                 <div className="text-xs font-medium text-red-600 flex items-center hover:underline">
                                    View Details <ArrowLeft className="w-3 h-3 ml-1 rotate-180" />
                                 </div>
                              </Link>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {/* Emergency Contact Widget */}
            <div className="bg-gradient-to-br from-red-600 to-rose-700 rounded-xl shadow-lg p-6 text-white text-center">
               <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <Phone className="w-6 h-6 text-white" />
               </div>
               <h3 className="font-bold text-lg mb-2">Emergency?</h3>
               <p className="text-white/80 text-sm mb-6">Immediate medical attention required? Call our emergency hotline now.</p>
               <Button className="w-full bg-white text-red-600 hover:bg-neutral-100 font-bold border-none">
                  Call {hospital.phone || "999"}
               </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Subcomponents for cleaner code
const StatCard = ({ icon: Icon, label, value }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-all hover:-translate-y-1">
    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-3">
      <Icon className="w-5 h-5" />
    </div>
    <div className="text-xl font-bold text-neutral-900 mb-1">{value}</div>
    <div className="text-xs text-neutral-500 uppercase tracking-wide font-medium">{label}</div>
  </div>
);

const Section = ({ title, icon: Icon, children, action }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-neutral-100">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-red-500" />}
        {title}
      </h3>
      {action}
    </div>
    {children}
  </div>
);

const HospitalSkeleton = () => (
  <div className="min-h-screen bg-[#1a1a2e] pb-20">
    <Skeleton className="h-[400px] w-full bg-neutral-800" />
    <div className="container px-4 mx-auto max-w-7xl -mt-24 relative z-20 space-y-8">
      <div className="bg-white rounded-xl p-8 h-64 shadow-xl" />
      <div className="grid grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32 bg-neutral-800 rounded-xl" />)}
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <Skeleton className="h-64 bg-white rounded-xl" />
           <Skeleton className="h-64 bg-white rounded-xl" />
        </div>
        <Skeleton className="h-96 bg-white rounded-xl" />
      </div>
    </div>
  </div>
);

export default HospitalProfilePage;
