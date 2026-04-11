import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, User, Phone, Radio, Loader2, CheckCircle, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { db } from '@/lib/db';
import { Country, City } from 'country-state-city';
import { useLanguage } from '@/context/LanguageContext';

const RaceStationForm = ({ onBack }) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Location State
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  
  const [formData, setFormData] = useState({
    stationName: '',
    location: '',
    city: '',
    country: '',
    organizerName: '',
    contactNumber: ''
  });

  useEffect(() => {
    // Load countries on mount
    const allCountries = Country.getAllCountries();
    // Format for select: label is name, value is isoCode
    setCountries(allCountries.map(c => ({
      label: c.name,
      value: c.isoCode,
      flag: c.flag
    })));
  }, []);

  const handleCountryChange = (isoCode) => {
    const countryData = Country.getCountryByCode(isoCode);
    setSelectedCountry(isoCode);
    setFormData(prev => ({ ...prev, country: countryData.name, city: '' })); // Reset city
    
    // Load cities for this country
    const countryCities = City.getCitiesOfCountry(isoCode);
    setCities(countryCities.map(c => ({
      label: c.name,
      value: c.name // We use name for storage as city codes aren't standard globally unique in this context
    })));
  };

  const handleCityChange = (cityName) => {
    setFormData(prev => ({ ...prev, city: cityName }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.country || !formData.city) {
      toast({ variant: "destructive", title: "Error", description: "Please select both country and city." });
      setLoading(false);
      return;
    }

    try {
      const fullLocation = `${formData.location ? formData.location + ', ' : ''}${formData.city}, ${formData.country}`;
      
      await db.raceStations.create({
        ...formData,
        location: fullLocation
      });
      
      setSuccess(true);
      toast({
        title: "Registration Successful",
        description: "Your race station has been registered and is pending approval."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "Please try again later."
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{t('success')}</h2>
          <p className="text-neutral-400 mb-8">
            Thank you for registering a Race Station. Our team will review your application and contact you shortly.
          </p>
          <Button onClick={onBack} className="w-full bg-neutral-800 hover:bg-neutral-700">
            Return to Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-8 text-neutral-400 hover:text-white pl-0"
        >
          ← Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
            <Radio className="text-red-600" /> 
            {t('register_station')}
          </h1>
          <p className="text-neutral-400">
            Register a new station node to help coordinate blood logistics in your area.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
          <div className="space-y-2">
            <Label htmlFor="stationName">{t('station_name')}</Label>
            <div className="relative">
              <Radio className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
              <Input
                id="stationName"
                name="stationName"
                required
                placeholder="e.g., Central Park Station"
                className="pl-9 bg-neutral-950 border-neutral-800 focus:border-red-600"
                value={formData.stationName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label>{t('select_country')}</Label>
                <Select value={selectedCountry} onValueChange={handleCountryChange}>
                  <SelectTrigger className="bg-neutral-950 border-neutral-800">
                    <SelectValue placeholder={t('select_country')} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                     {countries.map((c) => (
                       <SelectItem key={c.value} value={c.value}>
                         <span className="mr-2">{c.flag}</span> {c.label}
                       </SelectItem>
                     ))}
                  </SelectContent>
                </Select>
             </div>

             <div className="space-y-2">
                <Label>{t('select_city')}</Label>
                <Select 
                  value={formData.city} 
                  onValueChange={handleCityChange} 
                  disabled={!selectedCountry}
                >
                  <SelectTrigger className="bg-neutral-950 border-neutral-800">
                    <SelectValue placeholder={!selectedCountry ? "Select country first" : t('select_city')} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                     {cities.map((c) => (
                       <SelectItem key={c.value} value={c.value}>
                         {c.label}
                       </SelectItem>
                     ))}
                  </SelectContent>
                </Select>
             </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{t('location')} (Specific Address)</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
              <Input
                id="location"
                name="location"
                required
                placeholder="Street Address, Building, etc."
                className="pl-9 bg-neutral-950 border-neutral-800 focus:border-red-600"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="organizerName">{t('organizer')}</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                <Input
                  id="organizerName"
                  name="organizerName"
                  required
                  placeholder="Full Name"
                  className="pl-9 bg-neutral-950 border-neutral-800 focus:border-red-600"
                  value={formData.organizerName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNumber">{t('contact')}</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                <Input
                  id="contactNumber"
                  name="contactNumber"
                  required
                  placeholder="+1 234 567 890"
                  className="pl-9 bg-neutral-950 border-neutral-800 focus:border-red-600"
                  value={formData.contactNumber}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 text-lg"
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Globe className="mr-2 h-5 w-5" />}
            {loading ? 'Registering...' : t('register_station')}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default RaceStationForm;