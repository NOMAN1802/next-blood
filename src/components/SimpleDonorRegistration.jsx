import React, { useState } from 'react';
import { User, Phone, MapPin, Heart, MessageSquare, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { districtsOfBangladesh, BLOOD_GROUPS } from '@/lib/locations';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const SimpleDonorRegistration = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    bloodGroup: '',
    district: '',
    note: '',
    gender: 'male',
    willing_to_donate: 'yes',
    status: 'active',
    availability: 'available',
    age: ''
  });

  const [errors, setErrors] = useState({});

  const normalizePhone = (raw) => {
    let phone = raw.replace(/[\s\-\(\)]/g, '');
    if (phone.startsWith('+880')) phone = '0' + phone.slice(4);
    else if (phone.startsWith('880') && phone.length === 13) phone = '0' + phone.slice(3);
    return phone;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    const phoneRegex = /^01[3-9]\d{8}$/;
    const rawPhone = formData.phone.trim();
    if (!rawPhone) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(normalizePhone(rawPhone))) {
      newErrors.phone = "Invalid format. Use 11 digits (e.g. 01712345678)";
    }

    if (!formData.bloodGroup) newErrors.bloodGroup = "Blood group is required";
    if (!formData.district) newErrors.district = "District is required";

    const ageNum = Number(formData.age);
    if (formData.age && (isNaN(ageNum) || ageNum < 18 || ageNum > 65)) {
        newErrors.age = "Valid age between 18-65 is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the errors in the form.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check for existing session to link user_id if logged in
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;

      // Build health_conditions from note + gender + willing_to_donate
      let healthConditions = formData.note || "";
      if (formData.gender) healthConditions += `${healthConditions ? "\n" : ""}Gender: ${formData.gender}`;
      if (formData.willing_to_donate) healthConditions += `\nWilling to donate: ${formData.willing_to_donate}`;

      const donorPayload = {
        user_id: userId,
        full_name: formData.fullName,
        phone: normalizePhone(formData.phone.trim()),
        blood_group: formData.bloodGroup,
        city: formData.district,
        health_conditions: healthConditions || null,
        available: formData.availability === 'available',
        status: 'approved',
        source: 'public_web_registration',
        country: 'Bangladesh',
        age: formData.age ? parseInt(formData.age) : null,
      };

      const { error } = await supabase
        .from('donors')
        .insert([donorPayload]);

      if (error) {
          if (error.code === '23505') {
              throw new Error("This phone number is already registered.");
          }
          throw error;
      }

      setIsSuccess(true);
      toast({
        title: "Registration Successful!",
        description: "Thank you for registering as a donor.",
        duration: 5000,
      });

      setFormData({
        fullName: '',
        phone: '',
        bloodGroup: '',
        district: '',
        note: '',
        gender: 'male',
        willing_to_donate: 'yes',
        status: 'active',
        availability: 'available',
        age: ''
      });
      setErrors({});

    } catch (error) {
      console.error("Registration Error:", error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "Something went wrong. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto py-12 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl p-8 text-center"
        >
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Registration Successful!</h3>
          <p className="text-neutral-400 mb-8">
            Thank you for joining our life-saving community. Your details have been registered successfully.
          </p>
          <Button 
            onClick={() => setIsSuccess(false)}
            className="bg-red-600 hover:bg-red-700 text-white w-full h-12 rounded-lg font-semibold text-base transition-colors"
          >
            Register Another Donor
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto py-8 px-4 sm:px-6">
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl p-6 md:p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Become a Donor</h2>
          <p className="text-neutral-400 text-sm">Join our life-saving community in seconds</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-white font-semibold">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative group">
              <User className={cn(
                "absolute left-3 top-3.5 h-5 w-5 transition-colors duration-200",
                errors.fullName ? "text-red-500" : "text-gray-500 group-focus-within:text-red-500"
              )} />
              <Input 
                id="fullName" 
                name="fullName" 
                placeholder="e.g. Rahim Uddin"
                value={formData.fullName}
                onChange={handleChange}
                className={cn(
                  "h-12 pl-10 bg-white text-black border-2 rounded-lg transition-all duration-200 text-base placeholder:text-gray-400",
                  "focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:ring-opacity-50",
                  errors.fullName ? "border-red-500 focus:ring-red-200" : "border-gray-200"
                )}
              />
            </div>
            {errors.fullName && (
              <div className="flex items-center gap-1.5 mt-1.5 text-red-500 text-sm font-medium animate-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.fullName}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-white font-semibold">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <div className="relative group">
              <Phone className={cn(
                "absolute left-3 top-3.5 h-5 w-5 transition-colors duration-200",
                errors.phone ? "text-red-500" : "text-gray-500 group-focus-within:text-red-500"
              )} />
              <Input 
                id="phone" 
                name="phone" 
                type="tel"
                placeholder="017 1234 5678"
                value={formData.phone}
                onChange={handleChange}
                className={cn(
                  "h-12 pl-10 bg-white text-black border-2 rounded-lg transition-all duration-200 text-base placeholder:text-gray-400",
                  "focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:ring-opacity-50",
                  errors.phone ? "border-red-500 focus:ring-red-200" : "border-gray-200"
                )}
              />
            </div>
            {errors.phone && (
              <div className="flex items-center gap-1.5 mt-1.5 text-red-500 text-sm font-medium animate-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.phone}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="bloodGroup" className="text-white font-semibold">
                Blood Group <span className="text-red-500">*</span>
              </Label>
              <Select 
                name="bloodGroup" 
                value={formData.bloodGroup} 
                onValueChange={(val) => handleSelectChange('bloodGroup', val)}
              >
                <SelectTrigger 
                  id="bloodGroup"
                  className={cn(
                    "h-12 pl-10 bg-white text-black border-2 rounded-lg relative transition-all duration-200",
                    "focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:ring-opacity-50",
                    errors.bloodGroup ? "border-red-500" : "border-gray-200"
                  )}
                >
                  <Heart className={cn(
                    "absolute left-3 top-3.5 h-5 w-5 transition-colors duration-200",
                    formData.bloodGroup ? "text-red-600 fill-red-600" : "text-gray-500"
                  )} />
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 text-black max-h-[300px]">
                  {BLOOD_GROUPS.map(bg => (
                    <SelectItem key={bg} value={bg} className="text-gray-900 hover:bg-red-50 focus:bg-red-50 focus:text-gray-900 cursor-pointer">
                      {bg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bloodGroup && (
                <div className="flex items-center gap-1.5 mt-1.5 text-red-500 text-sm font-medium animate-in slide-in-from-top-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.bloodGroup}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="district" className="text-white font-semibold">
                District <span className="text-red-500">*</span>
              </Label>
              <Select 
                name="district" 
                value={formData.district} 
                onValueChange={(val) => handleSelectChange('district', val)}
              >
                <SelectTrigger 
                  id="district"
                  className={cn(
                    "h-12 pl-10 bg-white text-black border-2 rounded-lg relative transition-all duration-200",
                    "focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:ring-opacity-50",
                    errors.district ? "border-red-500" : "border-gray-200"
                  )}
                >
                  <MapPin className={cn(
                    "absolute left-3 top-3.5 h-5 w-5 transition-colors duration-200",
                    formData.district ? "text-red-600" : "text-gray-500"
                  )} />
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 text-black max-h-[300px]">
                  {districtsOfBangladesh.map(dist => (
                    <SelectItem key={dist.name} value={dist.name} className="text-gray-900 hover:bg-red-50 focus:bg-red-50 focus:text-gray-900 cursor-pointer">
                      {dist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.district && (
                <div className="flex items-center gap-1.5 mt-1.5 text-red-500 text-sm font-medium animate-in slide-in-from-top-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.district}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
             <Label htmlFor="age" className="text-white font-semibold">Age</Label>
             <Input
                id="age"
                name="age"
                type="number"
                placeholder="e.g. 25"
                min="18"
                max="65"
                value={formData.age}
                onChange={handleChange}
                className={cn(
                  "h-12 bg-white text-black border-2 rounded-lg transition-all duration-200 text-base placeholder:text-gray-400",
                  "focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:ring-opacity-50",
                  errors.age ? "border-red-500" : "border-gray-200"
                )}
             />
             {errors.age && (
                <div className="flex items-center gap-1.5 mt-1.5 text-red-500 text-sm font-medium">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.age}</span>
                </div>
             )}
          </div>

          <div className="space-y-4 pt-2">
             <div className="space-y-2">
                <Label className="text-white font-semibold">Gender</Label>
                <RadioGroup 
                   defaultValue="male" 
                   value={formData.gender}
                   onValueChange={(val) => handleSelectChange('gender', val)}
                   className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="gender-male" className="bg-white" />
                    <Label htmlFor="gender-male" className="text-white">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="gender-female" className="bg-white" />
                    <Label htmlFor="gender-female" className="text-white">Female</Label>
                  </div>
                </RadioGroup>
             </div>

             <div className="space-y-2">
                <Label className="text-white font-semibold">Willing to Donate?</Label>
                <RadioGroup 
                   defaultValue="yes"
                   value={formData.willing_to_donate}
                   onValueChange={(val) => handleSelectChange('willing_to_donate', val)}
                   className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="willing-yes" className="bg-white" />
                    <Label htmlFor="willing-yes" className="text-white">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="willing-no" className="bg-white" />
                    <Label htmlFor="willing-no" className="text-white">No</Label>
                  </div>
                </RadioGroup>
             </div>

             <div className="space-y-2">
                <Label className="text-white font-semibold">Availability Status</Label>
                <RadioGroup 
                   defaultValue="available"
                   value={formData.availability}
                   onValueChange={(val) => handleSelectChange('availability', val)}
                   className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="available" id="status-available" className="bg-white" />
                    <Label htmlFor="status-available" className="text-white">Available</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unavailable" id="status-unavailable" className="bg-white" />
                    <Label htmlFor="status-unavailable" className="text-white">Unavailable</Label>
                  </div>
                </RadioGroup>
             </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note" className="text-white font-semibold">Note (Optional)</Label>
            <div className="relative group">
              <MessageSquare className="absolute left-3 top-3.5 h-5 w-5 text-gray-500 group-focus-within:text-red-500 transition-colors duration-200" />
              <Textarea 
                id="note" 
                name="note" 
                placeholder="Any message or availability note..."
                value={formData.note}
                onChange={handleChange}
                className={cn(
                  "h-24 pl-10 py-3 bg-white text-black border-2 rounded-lg transition-all duration-200 text-base placeholder:text-gray-400 resize-none",
                  "focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:ring-opacity-50 border-gray-200"
                )}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className={cn(
              "w-full h-12 rounded-lg text-white font-semibold text-lg shadow-lg shadow-red-900/20 mt-4",
              "bg-red-600 hover:bg-red-700 active:bg-red-800 transition-all duration-200",
              "disabled:opacity-70 disabled:cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Registering...
              </>
            ) : (
              'Register as Donor'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SimpleDonorRegistration;