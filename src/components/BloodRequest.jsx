import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Phone, MapPin, User, Hotel as Hospital, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea'; 
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { db } from '@/lib/db';
import { trackEvent } from '@/lib/analytics';
import { BLOOD_GROUPS } from '@/lib/locations';

const BloodRequest = ({ onBack }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: '',
    hospital: '',
    contactDetails: '',
    urgencyLevel: 'normal',
    quantity: 1,
    location: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save to Supabase with correct snake_case column names
      await db.requests.create({
        patient_name: formData.patientName,
        blood_group: formData.bloodGroup,
        hospital: formData.hospital,
        contact_phone: formData.contactDetails,
        city: formData.location,
        urgency: formData.urgencyLevel,
        status: 'pending'
      });

      // Track Analytics
      await trackEvent('blood_request', {
        bloodGroup: formData.bloodGroup,
        location: formData.location || 'Unknown',
        urgencyLevel: formData.urgencyLevel,
        hospital: formData.hospital
      }, 'request_form');

      setIsSuccess(true);
      toast({
        title: "Request Submitted",
        description: "We have broadcasted your request to nearby donors."
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Request Broadcasted</h2>
        <p className="text-neutral-400 max-w-md mb-8">
          Your blood request has been sent to all available donors matching the blood group. You will be contacted directly.
        </p>
        <Button onClick={onBack} className="bg-neutral-800 hover:bg-neutral-700 text-white">
          Return Home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <Button variant="ghost" onClick={onBack} className="mb-4 pl-0 hover:pl-2 transition-all text-neutral-400 hover:text-white">
          ← {t('back')}
        </Button>
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <AlertCircle className="text-red-500" />
          {t('request_blood')}
        </h2>
        <p className="text-neutral-400">Fill out the details to notify donors immediately.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-neutral-900/50 p-8 rounded-2xl border border-neutral-800 backdrop-blur-sm">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="patientName" className="text-neutral-300">Patient Name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
              <Input 
                id="patientName" 
                name="patientName" 
                required
                className="pl-10 bg-neutral-950 border-neutral-800 focus:border-red-500/50" 
                placeholder="Patient Name"
                value={formData.patientName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bloodGroup" className="text-neutral-300">{t('blood_group')} *</Label>
            <Select name="bloodGroup" onValueChange={(val) => handleSelectChange('bloodGroup', val)} required>
              <SelectTrigger className="bg-neutral-950 border-neutral-800">
                <SelectValue placeholder={t('select_blood_group')} />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                {BLOOD_GROUPS.map(bg => (
                  <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hospital" className="text-neutral-300">Hospital Name</Label>
            <div className="relative">
              <Hospital className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
              <Input
                id="hospital"
                name="hospital"
                className="pl-10 bg-neutral-950 border-neutral-800 focus:border-red-500/50"
                placeholder="City Hospital (optional)"
                value={formData.hospital}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-neutral-300">Location/Area *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
              <Input 
                id="location" 
                name="location" 
                required
                className="pl-10 bg-neutral-950 border-neutral-800 focus:border-red-500/50" 
                placeholder="Dhanmondi, Dhaka"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactDetails" className="text-neutral-300">Contact Number *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
              <Input 
                id="contactDetails" 
                name="contactDetails" 
                required
                className="pl-10 bg-neutral-950 border-neutral-800 focus:border-red-500/50" 
                placeholder="+880 1XXX XXXXXX"
                value={formData.contactDetails}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgencyLevel" className="text-neutral-300">Urgency Level</Label>
            <Select name="urgencyLevel" onValueChange={(val) => handleSelectChange('urgencyLevel', val)} defaultValue="normal">
              <SelectTrigger className="bg-neutral-950 border-neutral-800">
                <SelectValue placeholder="Select Urgency" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                <SelectItem value="normal">Normal (Within 24h)</SelectItem>
                <SelectItem value="urgent">Urgent (Within 6h)</SelectItem>
                <SelectItem value="critical">Critical (Immediate)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className={`w-full font-bold py-6 text-lg shadow-lg transition-all duration-300 ${
            formData.urgencyLevel === 'critical' 
              ? 'bg-red-600 hover:bg-red-700 shadow-red-900/30 animate-pulse' 
              : 'bg-neutral-800 hover:bg-neutral-700 text-white'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Broadcasting...
            </>
          ) : (
            <>
              Broadcast Request <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default BloodRequest;