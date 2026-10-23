import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Heart, Users, Globe, Activity, Shield, Zap, Building2, Smartphone, 
  BrainCircuit, Plane, Facebook, Twitter, Linkedin, Instagram, Youtube, Github, Mail, MapPin, Phone, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import SEO from '@/components/SEO';
import { db } from '@/lib/db';
import VisitorStatsCard from '@/components/VisitorStatsCard';
import ErrorBoundary from '@/components/ErrorBoundary';

// Helper component for dynamic icons
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

const AboutPage = () => {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [foundation, setFoundation] = useState(null);
  const [founders, setFounders] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [socials, setSocials] = useState([]);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const [fInfo, fList, cList, sList, vList] = await Promise.all([
          db.foundation.get(),
          db.founders.getAll(),
          db.companies.getAll(),
          db.socials.getAll(),
          db.volunteers.getAll()
        ]);
        
        if (fInfo) setFoundation(fInfo);
        if (fList) setFounders(fList);
        if (cList) setCompanies(cList);
        if (sList) setSocials(sList);
        if (vList) setVolunteers(vList.slice(0, 4)); // Get top 4 volunteers
      } catch (err) {
        console.error("Failed to load about data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAboutData();
  }, []);

  const getEntitySocials = (id) => socials.filter(s => s.entity_id === id);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const plans = [
    { title: t('plan_1_title'), desc: t('plan_1_desc'), date: t('plan_1_date'), icon: Smartphone, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { title: t('plan_2_title'), desc: t('plan_2_desc'), date: t('plan_2_date'), icon: BrainCircuit, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { title: t('plan_3_title'), desc: t('plan_3_desc'), date: t('plan_3_date'), icon: Building2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { title: t('plan_4_title'), desc: t('plan_4_desc'), date: t('plan_4_date'), icon: Plane, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" }
  ];

  if (loading) return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4">
        <Activity className="w-10 h-10 animate-spin text-red-600" />
        <span className="text-lg font-medium tracking-wide">Loading Next Blood...</span>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-neutral-950 text-white ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <SEO title={`${t('nav_about')} | Next Blood`} description={t('vision_desc')} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(220,38,38,0.15),transparent_70%)]" />
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="container relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold tracking-wide mb-6 md:mb-8">
              <Heart className="w-4 h-4 fill-red-500/50" />
              <span>Est. {foundation?.founding_year || '2025'}</span>
            </div>
            <h1 className="h1-responsive mb-6 md:mb-8 text-white">{t('about_hero_title')}</h1>
            <p className="p-responsive text-neutral-400 font-light mb-8 md:mb-12 max-w-2xl mx-auto">{t('about_hero_desc')}</p>
          </motion.div>
        </div>
      </section>

      {/* FOUNDATION INFO */}
      {foundation && (
        <section className="py-16 md:py-24 relative overflow-hidden bg-neutral-900/30 border-y border-white/5">
          <div className="absolute top-0 right-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-red-600/5 rounded-full blur-[80px] md:blur-[120px]" />
          <div className="container relative z-10">
            <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
              <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <div className="w-full aspect-square relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 group flex items-center justify-center bg-black/50 backdrop-blur-sm">
                   {foundation.logo_url ? (
                     <img src={foundation.logo_url} alt={foundation.name} className="w-2/3 object-contain" />
                   ) : (
                     <div className="text-center">
                       <Building2 className="w-24 h-24 text-red-600 mx-auto mb-4" />
                       <h3 className="text-2xl md:text-3xl font-bold">{foundation.name}</h3>
                     </div>
                   )}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6 md:space-y-8">
                <h2 className="h2-responsive text-white">{foundation.name}</h2>
                <p className="text-lg md:text-xl text-neutral-300 leading-relaxed font-light">{foundation.description}</p>
                <div className="p-6 bg-red-900/10 border-l-4 border-red-600 rounded-r-xl">
                  <h4 className="text-red-500 font-bold uppercase tracking-wider text-sm mb-2">Our Mission</h4>
                  <p className="text-base md:text-lg italic text-white/90">"{foundation.mission_statement}"</p>
                </div>
                
                {/* Foundation Details */}
                <div className="grid grid-cols-1 gap-4 pt-4 text-neutral-400 text-sm">
                  {foundation.email && (
                    <div className="flex items-center gap-3">
                       <Mail className="w-5 h-5 text-red-500 shrink-0" /> 
                       <span className="break-all">{foundation.email}</span>
                    </div>
                  )}
                  {foundation.phone && (
                    <div className="flex items-center gap-3">
                       <Phone className="w-5 h-5 text-red-500 shrink-0" /> 
                       <span>{foundation.phone}</span>
                    </div>
                  )}
                  {foundation.address && (
                    <div className="flex items-start gap-3">
                       <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5" /> 
                       <span>{foundation.address}</span>
                    </div>
                  )}
                </div>

                {/* Foundation Socials */}
                <div className="flex gap-4 pt-4 flex-wrap">
                  {getEntitySocials(foundation.id).map(link => (
                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 hover:bg-red-600 hover:text-white rounded-full transition-all duration-300 hover:scale-110 touch-target">
                      <SocialIcon platform={link.platform} className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* FOUNDERS SECTION */}
      {founders.length > 0 && (
        <section className="py-16 md:py-24 bg-neutral-950 relative">
          <div className="container">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="h2-responsive text-white mb-4">Leadership</h2>
              <p className="text-neutral-400">The visionaries behind the mission.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 justify-center">
              {founders.map((founder, idx) => (
                <motion.div 
                  key={founder.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 hover:border-red-900/50 transition-all group hover:shadow-2xl hover:shadow-red-900/10"
                >
                  <div className="aspect-[4/5] overflow-hidden relative">
                    {founder.image_url ? (
                      <img src={founder.image_url} alt={founder.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                        <Users className="w-20 h-20 text-neutral-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                    <div className="absolute bottom-0 left-0 w-full p-6">
                       <h3 className="text-2xl font-bold text-white mb-1">{founder.name}</h3>
                       <p className="text-red-500 font-medium mb-4">{founder.title}</p>
                       <div className="flex gap-3">
                         {getEntitySocials(founder.id).map(link => (
                           <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white hover:scale-110 transition-all bg-white/10 p-2 rounded-full backdrop-blur-sm touch-target">
                             <SocialIcon platform={link.platform} className="w-4 h-4" />
                           </a>
                         ))}
                       </div>
                    </div>
                  </div>
                  <div className="p-6 bg-neutral-900 border-t border-white/5">
                    <p className="text-neutral-400 text-sm leading-relaxed">{founder.bio}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* VOLUNTEERS SECTION */}
      {volunteers.length > 0 && (
        <section className="py-16 md:py-24 bg-neutral-900/20 border-y border-white/5 relative">
           <div className="container">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
               <div className="max-w-2xl">
                 <h2 className="h2-responsive text-white mb-4">Our Community Heroes</h2>
                 <p className="text-neutral-400 text-lg">Meet the passionate volunteers who make our mission possible every single day.</p>
               </div>
               <Link to="/volunteers" className="w-full md:w-auto">
                  <Button variant="outline" className="w-full md:w-auto border-red-600 text-red-500 hover:bg-red-600 hover:text-white">
                    View All Volunteers <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
               </Link>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                {volunteers.map((vol, idx) => (
                   <motion.div
                     key={vol.id}
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ delay: idx * 0.1 }}
                     viewport={{ once: true }}
                   >
                     <Link to={`/volunteer/${vol.id}`} className="block group">
                        <div className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-red-500/50 transition-all">
                           <div className="aspect-square bg-neutral-800 relative">
                              {vol.avatar_url ? (
                                <img src={vol.avatar_url} alt={vol.full_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-600"><Users className="w-12 h-12" /></div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                 <p className="text-white text-sm font-medium">View Profile</p>
                              </div>
                           </div>
                           <div className="p-4">
                              <h4 className="font-bold text-white truncate">{vol.full_name}</h4>
                              <p className="text-red-500 text-sm truncate">{vol.role}</p>
                           </div>
                        </div>
                     </Link>
                   </motion.div>
                ))}
             </div>
           </div>
        </section>
      )}

      {/* Visitor Stats */}
      <section className="bg-neutral-900/50 border-y border-neutral-800 py-12">
        <div className="container max-w-4xl mx-auto">
          <ErrorBoundary>
            <VisitorStatsCard />
          </ErrorBoundary>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-16 md:py-24 bg-neutral-950 relative">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center mb-16 md:mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="h2-responsive text-white mb-6">
                {t('mission_title')}
              </h2>
              <p className="text-xl text-neutral-400 leading-relaxed font-light">
                {t('mission_desc')}
              </p>
            </motion.div>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6 md:gap-8"
          >
            {[
              { 
                title: t('value_1_title'), 
                desc: t('value_1_desc'), 
                icon: BrainCircuit, 
                color: "text-cyan-400",
                gradient: "from-cyan-500/20 to-blue-500/5"
              },
              { 
                title: t('value_2_title'), 
                desc: t('value_2_desc'), 
                icon: Shield, 
                color: "text-emerald-400",
                gradient: "from-emerald-500/20 to-green-500/5"
              },
              { 
                title: t('value_3_title'), 
                desc: t('value_3_desc'), 
                icon: Heart, 
                color: "text-rose-400",
                gradient: "from-rose-500/20 to-red-500/5"
              }
            ].map((value, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className={`p-8 rounded-3xl bg-gradient-to-br ${value.gradient} border border-white/5 backdrop-blur-sm relative overflow-hidden group hover:border-white/10 transition-colors`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full transition-opacity group-hover:opacity-20" />
                <value.icon className={`w-12 h-12 mb-6 ${value.color}`} />
                <h3 className="text-2xl font-bold text-white mb-4">{value.title}</h3>
                <p className="text-neutral-400 text-lg leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* POWERED BY PARTNERS */}
      {companies.length > 0 && (
        <section className="py-16 md:py-20 bg-black border-t border-neutral-900">
          <div className="container">
            <div className="text-center mb-10 md:mb-12">
              <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-4">Powered By</p>
              <h2 className="text-2xl md:text-3xl font-bold text-white">Our Technology Partners</h2>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center">
              {companies.map((company, idx) => (
                <motion.a 
                  key={company.id}
                  href={company.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative w-32 md:w-48 h-20 md:h-24 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-500 opacity-60 hover:opacity-100"
                >
                  {company.logo_url ? (
                    <img src={company.logo_url} alt={company.name} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <span className="text-lg md:text-xl font-bold text-neutral-400 group-hover:text-white transition-colors text-center">{company.name}</span>
                  )}
                </motion.a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Future Roadmap */}
      <section className="py-16 md:py-24 bg-neutral-900/50 border-t border-neutral-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10 mix-blend-overlay" />
        
        <div className="container relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
            <span className="text-red-500 font-bold tracking-widest uppercase text-sm mb-4 block">Next Blood 2.0</span>
            <h2 className="h2-responsive text-white mb-6">
              {t('future_title')}
            </h2>
            <p className="text-xl text-neutral-400 font-light">
              {t('future_desc')}
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line (Desktop) */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-neutral-800 -translate-y-1/2 hidden lg:block" />
            
            {/* Timeline Line (Mobile) - Vertical */}
            <div className="absolute top-0 bottom-0 left-8 w-1 bg-neutral-800 lg:hidden" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {plans.map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="relative group pl-20 lg:pl-0"
                >
                  {/* Mobile Dot */}
                  <div className={`
                    absolute left-[29px] top-8 w-4 h-4 rounded-full bg-neutral-950 border-4 border-neutral-800 z-20 lg:hidden
                    group-hover:border-red-500 transition-colors duration-300
                  `} />

                  <div className={`
                    bg-neutral-950 p-6 md:p-8 rounded-2xl border ${plan.border} hover:bg-neutral-900 transition-all duration-300 relative z-10 h-full flex flex-col
                  `}>
                    <div className={`w-14 h-14 rounded-xl ${plan.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <plan.icon className={`w-7 h-7 ${plan.color}`} />
                    </div>
                    
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${plan.bg} ${plan.color} w-fit`}>
                      {plan.date}
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-neutral-400 transition-colors">
                      {plan.title}
                    </h3>
                    
                    <p className="text-neutral-400 text-sm leading-relaxed">
                      {plan.desc}
                    </p>
                  </div>
                  
                  {/* Connector Dot (Desktop) */}
                  <div className={`
                    absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-neutral-950 border-4 border-neutral-800 z-0 hidden lg:block
                    group-hover:border-red-500 transition-colors duration-300
                  `} style={{ top: '-30px' }} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-neutral-950 to-black text-center">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-gradient-to-r from-red-900/20 to-rose-900/20 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 border border-red-500/20 relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-[80px]" />
             
             <h2 className="text-3xl md:text-4xl font-black text-white mb-6 relative z-10">
               Ready to make a difference?
             </h2>
             <p className="text-lg md:text-xl text-neutral-300 mb-8 max-w-2xl mx-auto relative z-10 font-light">
               Join us in our mission to save lives. Whether as a donor, volunteer, or partner, your contribution matters.
             </p>
             <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white font-bold h-12 px-8 rounded-full text-lg shadow-lg shadow-red-900/30">
                    Become a Donor
                  </Button>
                </Link>
                <Link to="/contact" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto border-neutral-700 hover:bg-white/10 text-white font-bold h-12 px-8 rounded-full text-lg">
                    Contact Us
                  </Button>
                </Link>
             </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;