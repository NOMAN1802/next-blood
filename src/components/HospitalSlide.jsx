
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, ArrowRight, Building2, AlertCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/customSupabaseClient';

const HospitalSlide = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const { data, error } = await supabase
          .from('hospitals')
          .select('*')
          .not('image_url', 'is', null) // Filter out hospitals without images
          .order('created_at', { ascending: false })
          .limit(4);

        if (error) throw error;
        setHospitals(data || []);
      } catch (err) {
        console.error('Error fetching hospitals:', err);
        setError('Failed to load featured hospitals.');
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-4 md:px-8 bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
        <div className="container mx-auto">
          <div className="flex flex-col items-center mb-12">
             <Skeleton className="h-10 w-64 bg-white/10 mb-4" />
             <Skeleton className="h-6 w-96 bg-white/5" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden h-[450px] flex flex-col">
                <Skeleton className="h-[200px] w-full bg-neutral-200" />
                <div className="p-5 flex-1 space-y-4">
                  <Skeleton className="h-8 w-3/4 bg-neutral-200" />
                  <Skeleton className="h-4 w-1/2 bg-neutral-200" />
                  <div className="space-y-2 pt-4">
                    <Skeleton className="h-4 w-full bg-neutral-200" />
                    <Skeleton className="h-4 w-full bg-neutral-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="text-center p-8 bg-neutral-900/50 backdrop-blur-sm rounded-xl border border-red-900/30 text-red-400 max-w-lg mx-4">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h3 className="text-xl font-bold text-white mb-2">Something went wrong</h3>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  if (hospitals.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4 md:px-6 lg:px-8 bg-neutral-950 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto relative z-10">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-black text-white mb-3"
          >
            Featured Hospitals
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-neutral-400 text-lg max-w-2xl mx-auto"
          >
            Find world-class medical facilities and trusted healthcare partners near you
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {hospitals.map((hospital, index) => (
            <motion.div
              key={hospital.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.3)" }}
              className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 group h-full"
            >
              {/* Card Image */}
              <div className="h-[200px] w-full relative overflow-hidden">
                <img 
                  src={hospital.image_url} 
                  alt={hospital.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-red-600 hover:bg-red-700 text-white border-none shadow-md">
                    {hospital.category || 'General'}
                  </Badge>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-[#1a1a2e] mb-3 line-clamp-1 group-hover:text-red-600 transition-colors">
                  {hospital.name}
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-sm text-neutral-600">
                    <MapPin className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <span className="line-clamp-1">{hospital.location || hospital.address || "Location unavailable"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Phone className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="truncate">{hospital.phone || "Contact unavailable"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Mail className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="truncate">{hospital.email || "Email unavailable"}</span>
                  </div>
                </div>

                <p className="text-neutral-500 text-sm line-clamp-2 mb-6 leading-relaxed flex-grow">
                  {hospital.description || "Leading healthcare provider committed to excellence in patient care and medical services."}
                </p>

                <div className="mt-auto pt-4 border-t border-neutral-100">
                  <Link to={`/hospital/${hospital.id}`}>
                    <Button className="w-full bg-white text-[#1a1a2e] border-2 border-[#1a1a2e] hover:bg-[#1a1a2e] hover:text-white font-bold transition-all duration-300">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/hospital">
            <Button className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-6 rounded-xl shadow-lg shadow-red-900/20 hover:shadow-red-900/40 transition-all hover:-translate-y-1">
              View All Hospitals <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HospitalSlide;
