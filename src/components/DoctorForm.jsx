
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabaseAdmin } from '@/lib/customSupabaseClient';
import { Loader2, Save, X, Image as ImageIcon, Trash2 } from 'lucide-react';
import { photoUpload } from '@/services/photoUpload';

const DoctorForm = ({ initialData, onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: initialData?.full_name || initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    specialty: initialData?.specialty || '',
    hospital: initialData?.hospital || '',
    city: initialData?.city || '',
    available: initialData?.available ?? true,
    avatar_url: initialData?.avatar_url || initialData?.image_url || ''
  });

  const [previewUrl, setPreviewUrl] = useState(initialData?.avatar_url || initialData?.image_url || '');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validation = photoUpload.validateFile(file);
      if (!validation.isValid) {
        toast({ title: "Invalid File", description: validation.error, variant: "destructive" });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setFormData(prev => ({ ...prev, avatar_url: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name.trim()) {
      toast({ title: "Validation Error", description: "Name is required", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      let finalAvatarUrl = formData.avatar_url;

      if (selectedFile) {
        setUploading(true);
        const { url, error } = await photoUpload.uploadDoctorPhoto(selectedFile);
        setUploading(false);
        if (error) throw new Error(error);
        finalAvatarUrl = url;
      }

      const dataToSave = { ...formData, avatar_url: finalAvatarUrl };

      if (initialData?.id) {
        const { error } = await supabaseAdmin.from('doctors').update(dataToSave).eq('id', initialData.id);
        if (error) throw error;
        toast({ title: "Success", description: "Doctor updated successfully" });
      } else {
        const { error } = await supabaseAdmin.from('doctors').insert([dataToSave]);
        if (error) throw error;
        toast({ title: "Success", description: "Doctor added successfully" });
      }

      onSuccess?.();
    } catch (error) {
      console.error(error);
      setUploading(false);
      toast({ title: "Error", description: error.message || "Failed to save doctor", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Photo Upload */}
      <div className="space-y-2">
        <Label>Doctor Photo</Label>
        <div className="flex items-center gap-4 p-4 bg-neutral-950/50 rounded-lg border border-neutral-800">
          <div className="w-20 h-20 rounded-full border border-neutral-700 bg-neutral-800 overflow-hidden flex items-center justify-center relative shrink-0">
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
        <Label htmlFor="full_name">Full Name *</Label>
        <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Dr. John Doe" required className="bg-neutral-800 border-neutral-700" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="doctor@example.com" className="bg-neutral-800 border-neutral-700" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="01XXXXXXXXX" className="bg-neutral-800 border-neutral-700" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="specialty">Specialty</Label>
          <Input id="specialty" name="specialty" value={formData.specialty} onChange={handleChange} placeholder="Cardiologist, Neurologist..." className="bg-neutral-800 border-neutral-700" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" value={formData.city} onChange={handleChange} placeholder="Dhaka, Chittagong..." className="bg-neutral-800 border-neutral-700" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="hospital">Hospital / Chamber</Label>
        <Input id="hospital" name="hospital" value={formData.hospital} onChange={handleChange} placeholder="City Hospital, Dhaka Medical..." className="bg-neutral-800 border-neutral-700" />
      </div>

      <div className="space-y-2">
        <Label>Availability</Label>
        <Select value={formData.available ? 'true' : 'false'} onValueChange={val => setFormData(prev => ({ ...prev, available: val === 'true' }))}>
          <SelectTrigger className="bg-neutral-800 border-neutral-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
            <SelectItem value="true">Available</SelectItem>
            <SelectItem value="false">Unavailable</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
        <Button type="button" variant="ghost" onClick={onCancel} className="hover:bg-neutral-800">
          <X className="w-4 h-4 mr-2" /> Cancel
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading || uploading}>
          {loading || uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {uploading ? 'Uploading...' : initialData ? 'Update Doctor' : 'Add Doctor'}
        </Button>
      </div>
    </form>
  );
};

export default DoctorForm;
