import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ActionButton3D from '@/components/ActionButton3D';
import { Droplet, Search, Globe2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/context/LanguageContext';
import { BLOOD_GROUPS } from '@/lib/locations';

const HeroSection = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [messageVisible, setMessageVisible] = useState(true);

  // Search state
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const bloodGroups = BLOOD_GROUPS;
  const countries = ['Bangladesh', 'India', 'USA', 'UK', 'Canada', 'Australia', 'Nepal', 'Others'];

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessageVisible(false);
    }, 4000);
    const interval = setInterval(() => {
      setMessageVisible(true);
      setTimeout(() => setMessageVisible(false), 4000);
    }, 8000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (country && country !== 'all') params.append('country', country);
    if (city) params.append('city', city);
    if (bloodGroup && bloodGroup !== 'all') params.append('group', bloodGroup);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center px-4 py-16 md:py-20 min-h-[calc(100vh-64px)] w-full">
      <div className="text-center mb-8 md:mb-12 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }} 
          className="mb-6"
        >
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white mb-4 tracking-tight leading-[1.1] drop-shadow-2xl">
            Be the reason someone
            <span className="block text-red-500">survives today.</span>
          </h1>
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 mt-6">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-red-600/20 rounded-full flex items-center justify-center mb-2 md:mb-0">
               <Droplet className="w-5 h-5 md:w-6 md:h-6 text-red-500 fill-current" />
            </div>
            <span className="text-red-400 text-lg md:text-xl font-medium px-4">
              A Smarter Way to Donate. A Faster Way to Save Lives.
            </span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: messageVisible ? 1 : 0 }} 
          transition={{ duration: 1 }} 
          className="h-12 flex items-center justify-center"
        >
          <p className="text-lg md:text-2xl text-neutral-300 font-light italic">
            "One drop can save a life"
          </p>
        </motion.div>
      </div>

      {/* Main Actions - Stacked on Mobile */}
      <div className="flex flex-col sm:flex-row gap-4 md:gap-8 items-center justify-center mb-12 md:mb-16 w-full max-w-lg md:max-w-none">
        <ActionButton3D 
          label="Become a Donor" 
          icon={<Droplet className="w-5 h-5 md:w-6 md:h-6" />} 
          onClick={() => navigate('/register')} 
          variant="primary" 
        />
        <ActionButton3D 
          label="Need Blood" 
          icon={<Search className="w-5 h-5 md:w-6 md:h-6" />} 
          onClick={() => navigate('/request')} 
          variant="secondary" 
        />
      </div>

      {/* Quick Search Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.5, duration: 0.8 }} 
        className="w-full max-w-4xl bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6 shadow-2xl"
      >
        <div className="flex items-center gap-2 mb-4 text-white px-1">
          <Search className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold text-lg">{t('search_title')}</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-8 gap-3 md:gap-4">
           <div className="md:col-span-2 relative">
             <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="h-12 bg-neutral-800/50 border-neutral-700 text-white pl-9 rounded-xl focus:ring-red-500/50">
                  <Globe2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <SelectValue placeholder={t('select_country')} />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
          </div>

          <div className="md:col-span-2 relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 z-10" />
            <Input 
              placeholder={t('enter_city')} 
              className="pl-9 h-12 bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500 rounded-xl focus:border-red-500/50" 
              value={city} 
              onChange={e => setCity(e.target.value)} 
            />
          </div>

          <div className="md:col-span-2">
             <Select value={bloodGroup} onValueChange={setBloodGroup}>
                <SelectTrigger className="h-12 bg-neutral-800/50 border-neutral-700 text-white rounded-xl focus:ring-red-500/50">
                  <SelectValue placeholder={t('blood_group_placeholder')} />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                  <SelectItem value="all">All Groups</SelectItem>
                  {bloodGroups.map(group => <SelectItem key={group} value={group}>{group}</SelectItem>)}
                </SelectContent>
              </Select>
          </div>
          
          <div className="md:col-span-2 sm:col-span-2 md:col-start-auto">
            <Button 
              className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold text-base rounded-xl shadow-lg shadow-red-900/30 transition-transform active:scale-95" 
              onClick={handleSearch}
            >
              {t('search_btn')}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
export default HeroSection;