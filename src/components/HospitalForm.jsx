
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { supabaseAdmin } from '@/lib/customSupabaseClient';
import { Loader2, Save, X, Image as ImageIcon, Trash2 } from 'lucide-react';
import { photoUpload } from '@/services/photoUpload';

const HospitalForm = ({ initialData, onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name:              initialData?.name              || '',
    email:             initialData?.email             || '',
    phone:             initialData?.phone             || '',
    address:           initialData?.address           || '',
    city:              initialData?.city              || '',
    category:          initialData?.category          || 'Private',
    description:       initialData?.description       || '',
    website:           initialData?.website           || '',
    image_url:         initialData?.image_url         || '',
    // Stats
    total_beds:        initialData?.total_beds        || '',
    established_year:  initialData?.established_year  || '',
    icu_beds:          initialData?.icu_beds          || '',
    doctors_count:     initialData?.doctors_count     || '',
    ambulance:         initialData?.ambulance         || '',
    departments_count: initialData?.departments_count || '',
    rating:            initialData?.rating            || '',
    // Lists (comma-separated)
    facilities:        initialData?.facilities        || '',
    departments:       initialData?.departments       || '',
  });

  const [previewUrl, setPreviewUrl] = useState(initialData?.image_url || '');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validation = photoUpload.validateFile(file);
    if (!validation.isValid) {
      toast({ title: "Invalid File", description: validation.error, variant: "destructive" });
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({ title: "Validation Error", description: "Hospital name is required", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      let finalImageUrl = formData.image_url;

      if (selectedFile) {
        setUploading(true);
        const { url, error } = await photoUpload.uploadHospitalPhoto(selectedFile);
        setUploading(false);
        if (error) throw new Error(error);
        finalImageUrl = url;
      }

      const dataToSave = { ...formData, image_url: finalImageUrl };

      if (initialData?.id) {
        const { error } = await supabaseAdmin.from('hospitals').update(dataToSave).eq('id', initialData.id);
        if (error) throw error;
        toast({ title: "Success", description: "Hospital updated successfully" });
      } else {
        const { error } = await supabaseAdmin.from('hospitals').insert([dataToSave]);
        if (error) throw error;
        toast({ title: "Success", description: "Hospital created successfully" });
      }
      onSuccess?.();
    } catch (error) {
      console.error(error);
      setUploading(false);
      toast({ title: "Error", description: error.message || "Failed to save hospital", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Photo Upload */}
      <div className="space-y-2">
        <Label>Hospital Image</Label>
        <div className="flex items-center gap-4 p-4 bg-neutral-950/50 rounded-lg border border-neutral-800">
          <div className="w-24 h-16 rounded-md border border-neutral-700 bg-neutral-800 overflow-hidden flex items-center justify-center relative shrink-0">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-8 h-8 text-neutral-500" />
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-neutral-800 file:text-white hover:file:bg-neutral-700 text-neutral-400 text-xs"
              />
              {previewUrl && (
                <Button type="button" variant="destructive" size="icon" onClick={handleRemovePhoto}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-neutral-500">Max 5MB. JPG, PNG, WebP supported.</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Hospital Name *</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="City General Hospital" required className="bg-neutral-800 border-neutral-700" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={formData.category} onValueChange={val => setFormData(prev => ({ ...prev, category: val }))}>
            <SelectTrigger className="bg-neutral-800 border-neutral-700">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
              <SelectItem value="Private">Private</SelectItem>
              <SelectItem value="Government">Government</SelectItem>
              <SelectItem value="Non-Profit">Non-Profit</SelectItem>
              <SelectItem value="Military">Military</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Location/City</Label>
          <Input id="city" name="city" value={formData.city} onChange={handleChange} placeholder="Dhaka" className="bg-neutral-800 border-neutral-700" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="contact@hospital.com" className="bg-neutral-800 border-neutral-700" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="01XXXXXXXXX" className="bg-neutral-800 border-neutral-700" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Full Address</Label>
        <Textarea id="address" name="address" value={formData.address} onChange={handleChange} placeholder="123 Hospital Road, Sector 7" className="bg-neutral-800 border-neutral-700" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input id="website" name="website" value={formData.website} onChange={handleChange} placeholder="https://hospital.com" className="bg-neutral-800 border-neutral-700" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Brief description of facilities and services..." className="bg-neutral-800 border-neutral-700 min-h-[100px]" maxLength={500} />
        <p className="text-xs text-neutral-500 text-right">{formData.description.length}/500</p>
      </div>

      {/* Stats */}
      <div className="pt-2">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Hospital Stats</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label htmlFor="total_beds" className="text-xs">Total Beds</Label>
            <Input id="total_beds" name="total_beds" value={formData.total_beds} onChange={handleChange} placeholder="250+" className="bg-neutral-800 border-neutral-700 h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="icu_beds" className="text-xs">ICU Beds</Label>
            <Input id="icu_beds" name="icu_beds" value={formData.icu_beds} onChange={handleChange} placeholder="45" className="bg-neutral-800 border-neutral-700 h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="doctors_count" className="text-xs">Doctors</Label>
            <Input id="doctors_count" name="doctors_count" value={formData.doctors_count} onChange={handleChange} placeholder="85+" className="bg-neutral-800 border-neutral-700 h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="departments_count" className="text-xs">Departments Count</Label>
            <Input id="departments_count" name="departments_count" value={formData.departments_count} onChange={handleChange} placeholder="12" className="bg-neutral-800 border-neutral-700 h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="established_year" className="text-xs">Established Year</Label>
            <Input id="established_year" name="established_year" value={formData.established_year} onChange={handleChange} placeholder="2005" className="bg-neutral-800 border-neutral-700 h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ambulance" className="text-xs">Ambulance</Label>
            <Input id="ambulance" name="ambulance" value={formData.ambulance} onChange={handleChange} placeholder="24/7" className="bg-neutral-800 border-neutral-700 h-9 text-sm" />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="rating">Rating (e.g. 4.8)</Label>
        <Input id="rating" name="rating" value={formData.rating} onChange={handleChange} placeholder="4.8" className="bg-neutral-800 border-neutral-700 w-1/3" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="facilities">Facilities (comma-separated)</Label>
        <Textarea
          id="facilities"
          name="facilities"
          value={formData.facilities}
          onChange={handleChange}
          placeholder="24/7 Emergency, ICU & CCU, Blood Bank, Pharmacy, Radiology, Ambulance Service"
          className="bg-neutral-800 border-neutral-700 min-h-[80px]"
        />
        <p className="text-xs text-neutral-500">Separate each facility with a comma.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="departments">Departments (comma-separated)</Label>
        <Textarea
          id="departments"
          name="departments"
          value={formData.departments}
          onChange={handleChange}
          placeholder="Cardiology, Neurology, Orthopedics, Pediatrics, Oncology, Emergency"
          className="bg-neutral-800 border-neutral-700 min-h-[80px]"
        />
        <p className="text-xs text-neutral-500">Separate each department with a comma.</p>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
        <Button type="button" variant="ghost" onClick={onCancel} className="hover:bg-neutral-800">
          <X className="w-4 h-4 mr-2" /> Cancel
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={loading || uploading}>
          {loading || uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {uploading ? 'Uploading...' : initialData ? 'Update Hospital' : 'Create Hospital'}
        </Button>
      </div>
    </form>
  );
};

export default HospitalForm;
