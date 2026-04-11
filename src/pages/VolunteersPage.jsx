import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Users, Search, Filter, Facebook, Twitter, 
  Linkedin, Instagram, Youtube, Github, Mail, Globe, ArrowRight, MapPin, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/context/LanguageContext';
import SEO from '@/components/SEO';
import { db } from '@/lib/db';

const SocialIcon = ({ platform, className }) => {
  const icons = {
    facebook: Facebook,
    twitter: Twitter,
    linkedin: Linkedin,
    instagram: Instagram,
    youtube: Youtube,
    github: Github,
    email: Mail
  };
  const Icon = icons[platform?.toLowerCase()] || Globe;
  return <Icon className={className} />;
};

const VolunteersPage = () => {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [volunteers, setVolunteers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const data = await db.volunteers.getAll();
      setVolunteers(data || []);
    } catch (error) {
      console.error("Failed to load volunteers", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVolunteers = volunteers.filter(vol => {
    const matchesSearch = vol.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          vol.role?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || vol.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roles = ['All', ...new Set(volunteers.map(v => v.role))];

  return (
    <div className={`min-h-screen bg-neutral-950 text-white ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <SEO title="Volunteers & Leadership | Next Blood" description="Meet the dedicated team and volunteers behind Next Blood." />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-neutral-900/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-900/20 via-neutral-900/0 to-transparent" />
        <div className="container px-4 mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-6xl font-black mb-6">Meet Our <span className="text-red-600">Heroes</span></h1>
            <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-8 font-light">
              The passionate individuals working tirelessly to bridge the gap between donors and patients.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-8 sticky top-0 z-30 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800">
        <div className="container px-4 mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <Input 
              placeholder="Search volunteers..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto custom-scrollbar">
            {roles.map(role => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  roleFilter === role 
                    ? 'bg-red-600 text-white' 
                    : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Volunteers Grid */}
      <section className="py-20 min-h-[50vh]">
        <div className="container px-4 mx-auto">
          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
               {[1,2,3,4].map(i => (
                 <div key={i} className="h-96 bg-neutral-900 rounded-2xl animate-pulse" />
               ))}
             </div>
          ) : filteredVolunteers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredVolunteers.map((vol, idx) => (
                <motion.div
                  key={vol.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Link to={`/volunteer/${vol.id}`} className="block group h-full">
                    <div className="bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 hover:border-red-600/50 transition-all duration-300 h-full flex flex-col hover:shadow-2xl hover:shadow-red-900/10">
                      <div className="aspect-[4/4] overflow-hidden relative bg-neutral-800">
                        {vol.avatar_url ? (
                          <img src={vol.avatar_url} alt={vol.full_name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Users className="w-20 h-20 text-neutral-700" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                           <span className="text-white font-medium flex items-center gap-2">
                             View Profile <ArrowRight className="w-4 h-4" />
                           </span>
                        </div>
                      </div>
                      
                      <div className="p-6 flex flex-col flex-1">
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-white group-hover:text-red-500 transition-colors mb-1">{vol.full_name}</h3>
                          <p className="text-red-400 text-sm font-medium uppercase tracking-wide">{vol.role}</p>
                        </div>
                        
                        <p className="text-neutral-400 text-sm line-clamp-3 mb-6 flex-1">
                          {vol.bio}
                        </p>
                        
                        <div className="flex items-center justify-between border-t border-neutral-800 pt-4 mt-auto">
                          <div className="flex items-center gap-2 text-neutral-500 text-xs">
                             <MapPin className="w-3 h-3" /> {vol.location || 'Bangladesh'}
                          </div>
                          <div className="flex gap-2">
                            {vol.volunteer_social_links?.slice(0, 3).map(link => (
                              <div key={link.id} className="text-neutral-400 hover:text-white p-1">
                                <SocialIcon platform={link.platform} className="w-4 h-4" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
               <div className="inline-block p-4 rounded-full bg-neutral-900 mb-4">
                 <Search className="w-8 h-8 text-neutral-500" />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">No volunteers found</h3>
               <p className="text-neutral-400">Try adjusting your search or filter.</p>
               <Button variant="link" onClick={() => { setSearchTerm(''); setRoleFilter('All'); }} className="text-red-500 mt-2">
                 Clear all filters
               </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default VolunteersPage;