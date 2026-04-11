import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, X, Check, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabaseAdmin } from '@/lib/customSupabaseClient';
import { BLOOD_GROUPS } from '@/lib/locations';

const ReceiverModal = ({ onClose }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    receiver_name: '',
    receiver_phone: '',
    blood_group: '',
    donor_name: '',
    received_date: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.receiver_name || !formData.receiver_phone || !formData.blood_group || !formData.received_date) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Please fill all required fields.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabaseAdmin.from('blood_received_records').insert({
        receiver_name: formData.receiver_name,
        receiver_phone: formData.receiver_phone,
        blood_group: formData.blood_group,
        donor_name: formData.donor_name || null,
        received_date: formData.received_date,
        created_at: new Date().toISOString()
      });
      if (error) throw error;
      setIsSuccess(true);
    } catch (err) {
      console.error('Record save error:', err.message);
      toast({ variant: 'destructive', title: 'Submission Failed', description: err.message || 'Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 z-10"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-500 mb-6">Your details have been recorded. We're glad you found the blood you needed.</p>
            <Button onClick={onClose} className="bg-red-600 hover:bg-red-700 text-white w-full">
              Close
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center mb-6">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-3">
                <Heart className="w-7 h-7 text-red-500" fill="currentColor" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Receiver Details</h2>
              <p className="text-sm text-gray-500 text-center mt-1">
                Please provide details to help us maintain accurate records of successful donations.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="receiver_name" className="text-gray-700 font-medium">
                  Receiver Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="receiver_name"
                  name="receiver_name"
                  placeholder="Receiver's name"
                  value={formData.receiver_name}
                  onChange={handleChange}
                  className="border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-red-400 focus:ring-red-400"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="receiver_phone" className="text-gray-700 font-medium">
                  Receiver Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="receiver_phone"
                  name="receiver_phone"
                  placeholder="01XXXXXXXXX or +8801XXXXXXXXX"
                  value={formData.receiver_phone}
                  onChange={handleChange}
                  className="border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-red-400 focus:ring-red-400"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-gray-700 font-medium">
                  Blood Group <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={(val) => setFormData(prev => ({ ...prev, blood_group: val }))}>
                  <SelectTrigger className="border-gray-200 bg-white text-gray-900">
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 text-gray-900">
                    {BLOOD_GROUPS.map(bg => (
                      <SelectItem key={bg} value={bg} className="text-gray-900 focus:bg-red-50 focus:text-gray-900">{bg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="donor_name" className="text-gray-700 font-medium">
                  Donor Name
                </Label>
                <Input
                  id="donor_name"
                  name="donor_name"
                  placeholder="Donor's name (optional)"
                  value={formData.donor_name}
                  onChange={handleChange}
                  className="border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-red-400 focus:ring-red-400"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="received_date" className="text-gray-700 font-medium">
                  Blood Received Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="received_date"
                  name="received_date"
                  type="date"
                  value={formData.received_date}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-red-400 focus:ring-red-400"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 mt-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4" /> Submit Details
                  </span>
                )}
              </Button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ReceiverModal;
