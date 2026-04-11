import React, { useState } from 'react';
import { Loader2, Save, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { districtsOfBangladesh, BLOOD_GROUPS } from '@/lib/locations';

const ManualDonorRegistrationForm = ({ onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    blood_group: '',
    city: '',
    country: 'Bangladesh',
    age: '',
    health_conditions: '',
    last_donation_date: ''
  });

  const validate = () => {
    const newErrors = {};
    if (!formData.full_name.trim()) newErrors.full_name = "Full name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.blood_group) newErrors.blood_group = "Blood group is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.age || isNaN(formData.age) || parseInt(formData.age) < 18) {
      newErrors.age = "Valid age (18+) is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // Prepare payload
      const payload = {
        ...formData,
        user_id: null, // Manual registration by admin does not link to a user account initially
        age: parseInt(formData.age),
        source: 'manual_admin',
        status: 'approved',
        available: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (!payload.last_donation_date) delete payload.last_donation_date;

      const { error } = await supabase.from('donors').insert([payload]);

      if (error) throw error;

      toast({
        title: "Donor Registered",
        description: "New donor has been successfully added to the database.",
        className: "bg-green-500/10 border-green-500/50 text-green-500"
      });

      setFormData({
        full_name: '', phone: '', blood_group: '', city: '',
        country: 'Bangladesh', age: '', health_conditions: '', last_donation_date: ''
      });
      
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error("Registration Error:", error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "Could not save donor details."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
           <h3 className="text-lg font-semibold text-white">Manual Registration</h3>
           <p className="text-sm text-neutral-400">Add a new donor directly to the system.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input 
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="e.g. Rahim Uddin"
              className={`bg-neutral-950 border-white/10 ${errors.full_name ? 'border-red-500' : ''}`}
            />
            {errors.full_name && <p className="text-xs text-red-500">{errors.full_name}</p>}
          </div>

          <div className="space-y-2">
            <Label>Phone Number *</Label>
            <Input 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. 017XXXXXXXX"
              className={`bg-neutral-950 border-white/10 ${errors.phone ? 'border-red-500' : ''}`}
            />
            {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <Label>Blood Group *</Label>
            <Select 
              value={formData.blood_group} 
              onValueChange={(val) => handleSelectChange('blood_group', val)}
            >
              <SelectTrigger className={`bg-neutral-950 border-white/10 ${errors.blood_group ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Select Group" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                {BLOOD_GROUPS.map(bg => (
                  <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.blood_group && <p className="text-xs text-red-500">{errors.blood_group}</p>}
          </div>

          <div className="space-y-2">
            <Label>Age *</Label>
            <Input 
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              placeholder="e.g. 25"
              className={`bg-neutral-950 border-white/10 ${errors.age ? 'border-red-500' : ''}`}
            />
            {errors.age && <p className="text-xs text-red-500">{errors.age}</p>}
          </div>

          <div className="space-y-2">
            <Label>City/District *</Label>
            <Select 
              value={formData.city} 
              onValueChange={(val) => handleSelectChange('city', val)}
            >
              <SelectTrigger className={`bg-neutral-950 border-white/10 ${errors.city ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Select District" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-800 text-white h-60">
                {districtsOfBangladesh.map(d => (
                  <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
          </div>

          <div className="space-y-2">
            <Label>Last Donation Date</Label>
            <Input 
              name="last_donation_date"
              type="date"
              value={formData.last_donation_date}
              onChange={handleChange}
              className="bg-neutral-950 border-white/10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Health Conditions</Label>
          <Textarea 
            name="health_conditions"
            value={formData.health_conditions}
            onChange={handleChange}
            placeholder="Any medical conditions..."
            className="bg-neutral-950 border-white/10 resize-none h-20"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="border-neutral-700 text-neutral-300">
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Register Donor
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ManualDonorRegistrationForm;