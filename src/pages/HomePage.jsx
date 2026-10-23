
import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Heart, Activity, Globe, Users, FileText, Search, MapPin, 
  Droplet, CheckCircle, Sparkles, Award, Shield, X, ChevronDown, Database, Stethoscope
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { db } from '@/lib/db';
import { supabase } from '@/lib/customSupabaseClient';
import { supabaseAdmin } from '@/lib/customSupabaseClient';
import { formatDate } from '@/lib/utils';
import SEO from '@/components/SEO';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useLanguage } from '@/context/LanguageContext';
import { districtsOfBangladesh, getLocalizedDistrictName, BLOOD_GROUPS } from '@/lib/locations';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import SimpleDonorRegistration from '@/components/SimpleDonorRegistration';
import VisitorStatsCard from '@/components/VisitorStatsCard';
import ErrorBoundary from '@/components/ErrorBoundary';
import HospitalSlide from '@/components/HospitalSlide';

// Lazy load heavy components to prevent circular dependencies and improve performance
const MarketingSlideshow = React.lazy(() => import('@/components/MarketingSlideshow'));
import HeroSlideshow, { HeroAmbient, useHeroSlides, slideHasText } from '@/components/HeroSlideshow';
import HeroSubBanner, { useHeroSubBanners } from '@/components/HeroSubBanner';

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLanguage();
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [donorStats, setDonorStats] = useState({ count: null, loading: true });
  const [livesSaved, setLivesSaved] = useState({ count: null, loading: true });
  const [hospitalCount, setHospitalCount] = useState({ count: null, loading: true });
  const [doctorCount, setDoctorCount] = useState({ count: null, loading: true });
  
  const heroSlider = useHeroSlides();
  const hasSlides = heroSlider.slides.length > 0;
  // Text slides need a taller frame on phones for their copy; all slides share
  // it so the banner doesn't jump in height between slides
  const slidesHaveText = heroSlider.slides.some(slideHasText);
  const subBanners = useHeroSubBanners();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState({
    bloodGroup: 'all',
    location: '',
    status: 'all'
  });
  
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationSearchTerm, setLocationSearchTerm] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchPosts = async () => {
      try {
        const allPosts = await db.blog.getAll(true).catch(() => []);
        if (!isMounted) return;

        const featured = allPosts.filter(p => p.featured).slice(0, 3);
        const recent = allPosts.filter(p => !p.featured).slice(0, 3);
        
        if (featured.length === 0) {
           setFeaturedPosts(allPosts.slice(0, 3));
           setRecentPosts(allPosts.slice(3, 6));
        } else {
           setFeaturedPosts(featured);
           setRecentPosts(recent);
        }
      } catch (err) {
        console.error("Failed to load blog posts on home", err);
      }
    };

    const fetchDonorCount = async () => {
      try {
        const { count, error } = await supabase
          .from('donors')
          .select('*', { count: 'exact', head: true });
        
        if (!isMounted) return;

        if (error) throw error;
        setDonorStats({ count, loading: false });
      } catch (err) {
        console.error("Failed to fetch donor count", err);
        if (isMounted) setDonorStats({ count: null, loading: false });
      }
    };

    const fetchLivesSaved = async () => {
      try {
        const { count, error } = await supabaseAdmin
          .from('blood_received_records')
          .select('*', { count: 'exact', head: true });
        if (!isMounted) return;
        if (error) throw error;
        setLivesSaved({ count, loading: false });
      } catch (err) {
        console.error("Failed to fetch lives saved count", err);
        if (isMounted) setLivesSaved({ count: null, loading: false });
      }
    };

    const fetchHospitalCount = async () => {
      try {
        const { count, error } = await supabaseAdmin
          .from('hospitals')
          .select('*', { count: 'exact', head: true });
        if (!isMounted) return;
        if (error) throw error;
        setHospitalCount({ count, loading: false });
      } catch (err) {
        console.error("Failed to fetch hospital count", err);
        if (isMounted) setHospitalCount({ count: null, loading: false });
      }
    };

    const fetchDoctorCount = async () => {
      try {
        const { count, error } = await supabaseAdmin
          .from('doctors')
          .select('*', { count: 'exact', head: true });
        if (!isMounted) return;
        if (error) throw error;
        setDoctorCount({ count, loading: false });
      } catch (err) {
        console.error("Failed to fetch doctor count", err);
        if (isMounted) setDoctorCount({ count: null, loading: false });
      }
    };

    fetchPosts();
    fetchDonorCount();
    fetchLivesSaved();
    fetchHospitalCount();
    fetchDoctorCount();
    return () => { isMounted = false; };
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (searchFilter.bloodGroup !== 'all') params.append('group', searchFilter.bloodGroup);
    if (searchFilter.location) params.append('city', searchFilter.location);
    navigate(`/search?${params.toString()}`);
  };

  const filteredDistricts = useMemo(() => {
    if (!locationSearchTerm) return districtsOfBangladesh;
    return districtsOfBangladesh.filter((district) => {
       const nameMatch = district.name.toLowerCase().includes(locationSearchTerm.toLowerCase());
       const bnMatch = district.bn && district.bn.includes(locationSearchTerm);
       return nameMatch || bnMatch;
    });
  }, [locationSearchTerm]);

  const faqData = [
    { question: t('faq_1_q'), answer: t('faq_1_a') },
    { question: t('faq_2_q'), answer: t('faq_2_a') },
    { question: t('faq_3_q'), answer: t('faq_3_a') },
    { question: t('faq_4_q'), answer: t('faq_4_a') }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  const Counter = ({ value, label, icon: Icon }) => (
    <div className="text-center group p-4 md:p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300">
      <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center text-white shadow-lg shadow-red-500/30">
        <Icon className="w-5 h-5 md:w-6 md:h-6" />
      </div>
      <div className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
        {value}
      </div>
      <div className="text-xs md:text-sm font-bold text-red-400 uppercase tracking-widest">{label}</div>
    </div>
  );

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className={`bg-neutral-950 text-white font-sans w-full overflow-x-hidden ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <SEO 
        title={`${t('hero_title_1')} ${t('hero_title_2')} | Next Blood`}
        description={t('hero_desc')}
        schema={faqSchema}
        keywords="Next Blood, Innovix Blood, Blood Donation, Bangladesh, Donate Blood"
      />

      <section className="relative overflow-hidden pt-4 sm:pt-6 md:pt-8 pb-16 md:pb-32">
        <div className="absolute inset-0 bg-neutral-950">
          <HeroAmbient current={heroSlider.current} />
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(220,38,38,0.25),transparent_60%)] animate-pulse-slow" />
          <div className="absolute top-[20%] right-[10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-rose-600/10 rounded-full blur-[80px] md:blur-[120px] mix-blend-screen" />
          <div className="absolute bottom-[10%] left-[10%] w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-purple-600/10 rounded-full blur-[60px] md:blur-[100px] mix-blend-screen" />
          <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
        </div>

        <div className="container relative z-10 px-4 lg:px-8 w-full max-w-[1600px]">
          {/* Main slider + two sub banners, all managed from Dashboard → Hero Slider */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className={cn(
              "grid grid-cols-1 gap-3 sm:gap-4 xl:gap-5",
              // Main banner 65%, side banners 35%
              hasSlides && "lg:grid-cols-[minmax(0,65fr)_minmax(0,35fr)]"
            )}
          >
            {hasSlides && (
              <HeroSlideshow
                {...heroSlider}
                // A wider-than-16:9 frame keeps the banner short (images are
                // centre-cropped); on desktop it stretches to the side column
                // so both bottoms line up
                className={cn(
                  slidesHaveText ? "aspect-[4/3]" : "aspect-[16/9]",
                  "sm:aspect-[15/8] lg:aspect-auto lg:h-full lg:min-h-[420px]"
                )}
              />
            )}
            <div className={cn(
              "grid gap-3 sm:gap-4 xl:gap-5 sm:grid-cols-2",
              hasSlides && "lg:grid-cols-1"
            )}>
              {subBanners.slice(0, 2).map(banner => (
                <HeroSubBanner key={banner.id} banner={banner} className="h-full sm:min-h-[160px]" />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="max-w-5xl mx-auto mt-12 md:mt-16 text-center space-y-4 md:space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 md:px-6 md:py-2 rounded-full bg-white/5 border border-white/10 text-red-400 text-xs md:text-sm font-bold tracking-wide backdrop-blur-md shadow-lg shadow-red-900/10">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" />
              <span>{t('hero_badge')}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight px-2">
              <span className="text-white drop-shadow-2xl">{t('hero_title_1')} </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 drop-shadow-sm pb-1 inline-block break-words">
                {t('hero_title_2')}
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-neutral-300 max-w-3xl mx-auto leading-relaxed font-light px-4">
              {t('hero_desc')}
            </p>

            <div className="max-w-4xl mx-auto mt-8 md:mt-12 p-2 md:p-3 rounded-2xl md:rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl ring-1 ring-white/10">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 p-2">
                <div className="md:col-span-3 relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                  <Input
                    placeholder={t('search_placeholder')}
                    className="pl-12 h-10 md:h-12 bg-black/20 border-transparent hover:bg-black/30 focus:bg-black/40 focus:border-red-500/50 rounded-xl text-sm transition-all w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>

                <div className="md:col-span-3">
                  <Select value={searchFilter.bloodGroup} onValueChange={(val) => setSearchFilter({...searchFilter, bloodGroup: val})}>
                    <SelectTrigger className="h-10 md:h-12 bg-black/20 border-transparent hover:bg-black/30 focus:border-red-500/50 rounded-xl text-sm w-full">
                      <div className="flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-red-500" />
                        <SelectValue placeholder={t('search_blood_group')} />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-800 text-white max-h-[300px]">
                      <SelectItem value="all">All Groups</SelectItem>
                      {BLOOD_GROUPS.map(bg => (
                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-3">
                   <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={locationOpen}
                        className={cn(
                          "w-full h-10 md:h-12 bg-black/20 border-transparent hover:bg-black/30 hover:text-white focus:border-red-500/50 rounded-xl text-sm justify-between font-normal",
                          !searchFilter.location && "text-muted-foreground"
                        )}
                      >
                         <div className="flex items-center gap-2 overflow-hidden">
                           <MapPin className={cn("w-4 h-4 shrink-0", searchFilter.location ? "text-red-500" : "text-neutral-400")} />
                           <span className="truncate">
                            {searchFilter.location
                              ? districtsOfBangladesh.find((district) => district.name === searchFilter.location)
                                ? getLocalizedDistrictName(districtsOfBangladesh.find((district) => district.name === searchFilter.location), language)
                                : searchFilter.location
                              : t('search_location')}
                           </span>
                         </div>
                        <div className="flex items-center">
                           {searchFilter.location && (
                              <div 
                                role="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSearchFilter({...searchFilter, location: ''});
                                }}
                                className="mr-2 hover:bg-white/10 rounded-full p-1"
                              >
                                <X className="h-3 w-3 opacity-50" />
                              </div>
                           )}
                           <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[85vw] md:w-[300px] p-0 bg-neutral-900 border-neutral-800 text-white max-h-[300px] overflow-hidden z-[60]">
                      <div className="flex items-center border-b border-neutral-800 px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <input
                          className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Search district..."
                          value={locationSearchTerm}
                          onChange={(e) => setLocationSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="max-h-[250px] overflow-y-auto custom-scrollbar p-1">
                          {filteredDistricts.length === 0 ? (
                             <div className="py-6 text-center text-sm text-neutral-500">No district found.</div>
                          ) : (
                            filteredDistricts.map((district) => (
                              <div
                                key={district.name}
                                className={cn(
                                  "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-white/10 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                                  searchFilter.location === district.name && "bg-white/10"
                                )}
                                onClick={() => {
                                  setSearchFilter({...searchFilter, location: district.name});
                                  setLocationOpen(false);
                                }}
                              >
                                <CheckCircle
                                  className={cn(
                                    "mr-2 h-4 w-4 text-red-500",
                                    searchFilter.location === district.name ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {getLocalizedDistrictName(district, language)}
                                <span className="ml-auto text-xs text-neutral-500 uppercase">{district.division}</span>
                              </div>
                            ))
                          )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="md:col-span-3">
                  <Button
                    onClick={handleSearch}
                    className="w-full h-10 md:h-12 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-900/30 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
                  >
                    {t('search_btn')}
                  </Button>
                </div>
              </div>
            </div>


            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2 md:pt-4 flex-wrap">
              <Link to="/search">
                <Button variant="link" className="text-neutral-400 hover:text-white transition-colors group">
                   {t('search_advanced')} <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative py-8 md:py-12 md:-mt-20 z-20">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 bg-neutral-900/50 backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-2xl">
            <Counter 
              value={donorStats.loading ? "..." : (donorStats.count !== null ? `${donorStats.count}+` : "350+")}
              label={t('stat_donors')} 
              icon={Users} 
            />
            <Counter value={livesSaved.loading ? "..." : (livesSaved.count !== null ? `${livesSaved.count}+` : "18+")} label={t('stat_lives')} icon={Heart} />
            <Counter value={hospitalCount.loading ? "..." : (hospitalCount.count !== null ? `${hospitalCount.count}+` : "1+")} label={t('stat_hospitals')} icon={Activity} />
            <Counter value={doctorCount.loading ? "..." : (doctorCount.count !== null ? `${doctorCount.count}+` : "0+")} label="DOCTORS" icon={Stethoscope} />
          </div>
        </div>
      </section>

      {/* Hospital Slider Section */}
      <ErrorBoundary>
        <HospitalSlide />
      </ErrorBoundary>

      {/* New Simple Registration Section */}
      <section id="register-section" className="py-16 md:py-24 relative overflow-hidden bg-neutral-950">
         <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 to-black pointer-events-none" />
         
         <div className="container relative z-10 px-4 mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
               
               <div className="space-y-8">
                  <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                  >
                    <h2 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4 md:mb-6">
                       Become a <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Hero</span> Today
                    </h2>
                    <p className="text-lg md:text-xl text-neutral-300 leading-relaxed font-light mb-8">
                       Registering as a donor takes less than a minute. Your information will be securely stored and only used when someone needs blood in your area.
                    </p>
                    
                    <div className="space-y-6">
                       <div className="flex items-start gap-6 p-4 rounded-xl hover:bg-white/5 transition-colors">
                          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mt-1 shrink-0 border border-green-500/20">
                             <Users className="w-6 h-6 text-green-500" />
                          </div>
                          <div>
                             <h4 className="text-xl font-bold text-white mb-2">No Account Required</h4>
                             <p className="text-neutral-400 text-sm md:text-base">Simply fill out the form to join our list. No passwords to remember.</p>
                          </div>
                       </div>
                       <div className="flex items-start gap-6 p-4 rounded-xl hover:bg-white/5 transition-colors">
                          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mt-1 shrink-0 border border-blue-500/20">
                             <Globe className="w-6 h-6 text-blue-500" />
                          </div>
                          <div>
                             <h4 className="text-xl font-bold text-white mb-2">Help Locals</h4>
                             <p className="text-neutral-400 text-sm md:text-base">We prioritize matching you with patients in your specific district.</p>
                          </div>
                       </div>
                    </div>
                  </motion.div>
               </div>

               <motion.div 
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  className="w-full"
               >
                  <SimpleDonorRegistration />
               </motion.div>
            </div>
         </div>
      </section>

      <section className="py-16 md:py-24 bg-neutral-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-600/5 rounded-full blur-[60px] md:blur-[100px]" />
        
        <div className="container px-4 mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <motion.h2 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-3xl md:text-5xl font-black mb-4 md:mb-6 text-white"
            >
              {t('why_title')}
            </motion.h2>
            <p className="text-neutral-400 text-lg md:text-xl font-light">{t('why_desc')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              { 
                icon: Globe, 
                title: t('feat_1_title'), 
                desc: t('feat_1_desc'),
                gradient: "from-blue-500 to-cyan-500",
                bg: "bg-blue-500/10"
              },
              { 
                icon: Activity, 
                title: t('feat_2_title'), 
                desc: t('feat_2_desc'),
                gradient: "from-red-500 to-orange-500",
                bg: "bg-red-500/10"
              },
              { 
                icon: Award, 
                title: t('feat_3_title'), 
                desc: t('feat_3_desc'),
                gradient: "from-green-500 to-emerald-500",
                bg: "bg-green-500/10"
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="p-6 md:p-8 rounded-3xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all shadow-xl group relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-5 rounded-bl-full transition-opacity group-hover:opacity-10`} />
                
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${feature.gradient} shadow-lg transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-4 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-neutral-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-neutral-400 text-base md:text-lg leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black relative">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 to-black pointer-events-none" />
        <div className="container px-4 mx-auto pt-16 md:pt-24 pb-8 md:pb-12 relative z-10">
          <div className="mb-8 md:mb-12 text-center md:text-left">
             <h2 className="text-3xl md:text-5xl font-black mb-4 text-white">{t('gallery_title')}</h2>
             <p className="text-neutral-400 text-lg md:text-xl">{t('gallery_desc')}</p>
          </div>
          <Suspense fallback={<div className="h-64 w-full bg-neutral-900 rounded-xl animate-pulse" />}>
            <MarketingSlideshow />
          </Suspense>
        </div>
      </section>

      {(featuredPosts.length > 0 || recentPosts.length > 0) && (
        <section className="py-16 md:py-24 bg-neutral-950 border-t border-neutral-900">
          <div className="container px-4 mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 md:mb-12 gap-4">
              <div>
                <h2 className="text-3xl md:text-5xl font-black mb-4 text-white">{t('news_title')}</h2>
                <p className="text-neutral-400 text-lg hidden md:block">{t('news_desc')}</p>
              </div>
              <Link to="/blog">
                <Button variant="outline" className="text-red-500 border-red-900/30 hover:bg-red-950 hover:text-red-400 w-full md:w-auto">
                  {t('news_view_all')} <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {[...featuredPosts, ...recentPosts].slice(0, 3).map((post, idx) => (
                <Link to={`/blog/${post.slug}`} key={post.id} className="group">
                  <motion.article 
                    initial="hidden"
                    whileInView="visible"
                    variants={fadeInUp}
                    className="bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 hover:border-red-900/50 transition-all h-full flex flex-col shadow-lg group-hover:shadow-red-900/20 group-hover:-translate-y-2 duration-300"
                  >
                    <div className="aspect-video relative overflow-hidden">
                      {post.cover_image ? (
                        <img 
                          src={post.cover_image} 
                          alt={post.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                      ) : (
                        <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-neutral-600">
                          <FileText className="w-12 h-12" />
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent opacity-80" />
                      
                      <div className="absolute top-4 left-4 flex gap-2">
                         <span className="px-3 py-1 bg-neutral-900/80 backdrop-blur-md rounded-full text-xs font-bold border border-white/10 text-white shadow-lg">
                           {post.category || 'News'}
                         </span>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center gap-3 text-xs text-neutral-500 mb-4 font-medium uppercase tracking-wider">
                         <span>{formatDate(post.published_at)}</span>
                         <span className="w-1 h-1 bg-neutral-700 rounded-full" />
                         <span>{post.tags?.[0] || 'Update'}</span>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-red-500 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      
                      <p className="text-neutral-400 text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">
                        {post.excerpt || post.content.replace(/<[^>]*>?/gm, '').substring(0, 100) + "..."}
                      </p>
                      
                      <div className="flex items-center text-red-500 text-sm font-bold group-hover:gap-3 transition-all">
                         {t('news_read')} <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    </div>
                  </motion.article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Visitor Stats Section */}
      <section className="bg-neutral-950 border-t border-neutral-900 py-8">
        <div className="container px-4 mx-auto max-w-4xl">
           <ErrorBoundary>
             <VisitorStatsCard />
           </ErrorBoundary>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-black border-t border-neutral-900">
        <div className="container px-4 mx-auto max-w-3xl">
           <div className="text-center mb-12 md:mb-16">
              <span className="text-red-500 font-bold tracking-widest uppercase text-sm mb-2 block">Support</span>
              <h2 className="text-3xl md:text-5xl font-black mb-4 text-white">{t('faq_title')}</h2>
              <p className="text-neutral-400 text-lg md:text-xl">{t('faq_desc')}</p>
           </div>
           
           <Accordion type="single" collapsible className="w-full space-y-4">
              {faqData.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-neutral-800 bg-neutral-900/50 rounded-xl px-2">
                  <AccordionTrigger className="text-white hover:text-red-400 text-left py-4 md:py-6 px-4 font-bold text-base md:text-lg">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-neutral-400 text-base leading-relaxed px-4 pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
           </Accordion>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
