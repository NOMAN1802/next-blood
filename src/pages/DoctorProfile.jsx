
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Mail, Phone, Calendar, User, Stethoscope, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';
import { db } from '@/lib/db';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { isSuperAdmin } from '@/lib/roleUtils';
import { useToast } from '@/components/ui/use-toast';

const DoctorProfilePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const data = await db.doctors.getById(id);
        setDoctor(data);
      } catch (err) {
        console.error("Failed to load doctor", err);
        setError("Doctor not found or failed to load.");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this doctor profile?")) return;
    try {
      await db.doctors.delete(id);
      toast({ title: "Success", description: "Doctor profile deleted" });
      window.location.href = '/doctor';
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete doctor", variant: "destructive" });
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-neutral-950 pt-24 pb-16 px-4">
       <div className="container max-w-4xl mx-auto space-y-8">
          <Skeleton className="h-10 w-32 bg-neutral-900" />
          <div className="grid md:grid-cols-3 gap-8">
             <Skeleton className="h-64 bg-neutral-900 rounded-2xl" />
             <div className="md:col-span-2 space-y-4">
                <Skeleton className="h-12 w-3/4 bg-neutral-900" />
                <Skeleton className="h-6 w-1/2 bg-neutral-900" />
                <Skeleton className="h-32 w-full bg-neutral-900" />
             </div>
          </div>
       </div>
    </div>
  );

  if (error || !doctor) return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white flex-col gap-4">
      <p className="text-xl font-bold text-neutral-400">{error || "Doctor not found"}</p>
      <Link to="/doctor">
        <Button variant="outline">Back to Doctors</Button>
      </Link>
    </div>
  );

  const canEdit = user && isSuperAdmin(user.role);

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-24 pb-16">
      <SEO title={`${doctor.full_name} | Next Blood`} description={`Profile of Dr. ${doctor.full_name}, ${doctor.specialty}`} />
      
      <div className="container px-4 mx-auto max-w-5xl">
        <div className="flex justify-between items-center mb-8">
           <Link to="/doctor" className="inline-flex items-center text-neutral-400 hover:text-white transition-colors">
             <ArrowLeft className="w-4 h-4 mr-2" /> Back to Doctors
           </Link>
           {canEdit && (
             <div className="flex gap-2">
                <Link to="/dashboard/doctors">
                  <Button variant="outline" size="sm" className="border-neutral-700 hover:bg-neutral-800">
                    <Edit className="w-4 h-4 mr-2" /> Manage
                  </Button>
                </Link>
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
             </div>
           )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-1"
          >
            <div className="bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 sticky top-24">
              <div className="aspect-square bg-neutral-800 relative">
                {doctor.avatar_url ? (
                  <img
                    src={doctor.avatar_url}
                    alt={doctor.full_name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600 bg-neutral-800" style={{ display: doctor.avatar_url ? 'none' : 'flex' }}>
                    <User className="w-20 h-20 mb-2" />
                    <span className="text-sm text-neutral-500">No photo available</span>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">{doctor.full_name}</h1>
                  <p className="text-blue-500 font-medium flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" /> {doctor.specialty || "General Practitioner"}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-neutral-800">
                  <div className="flex items-start gap-3 text-sm text-neutral-300">
                    <MapPin className="w-4 h-4 text-neutral-500 mt-0.5" />
                    <span>{doctor.city || doctor.hospital || "Address not available"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-300">
                    <Mail className="w-4 h-4 text-neutral-500" /> 
                    <span>{doctor.email || "Email not available"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-300">
                    <Phone className="w-4 h-4 text-neutral-500" /> 
                    <span>{doctor.phone || "Phone not available"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-300">
                    <Calendar className="w-4 h-4 text-neutral-500" /> 
                    <span>Joined {new Date(doctor.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => window.location.href=`tel:${doctor.phone}`}>
                   Book Appointment
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-2 space-y-8"
          >
            <div className="bg-neutral-900/50 rounded-2xl p-8 border border-neutral-800">
              <h2 className="text-2xl font-bold text-white mb-6">About Doctor</h2>
              <div className="space-y-4 text-neutral-300">
                 <p className="leading-relaxed text-lg font-light">
                    Dr. {doctor.full_name} is a specialist in {doctor.specialty || "general medicine"}.
                 </p>
                 {/* Placeholder for dynamic bio if we add a bio field later */}
                 <p>
                   Dedicated to providing the best medical care with years of experience in the field. 
                   Committed to patient well-being and applying the latest medical advancements.
                 </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
               <div className="bg-neutral-900/30 p-6 rounded-xl border border-neutral-800">
                  <h3 className="font-semibold text-white mb-2">Qualifications</h3>
                  <p className="text-neutral-400">MBBS, FCPS (Medicine)</p>
               </div>
               <div className="bg-neutral-900/30 p-6 rounded-xl border border-neutral-800">
                  <h3 className="font-semibold text-white mb-2">Experience</h3>
                  <p className="text-neutral-400">5+ Years of Experience</p>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfilePage;
