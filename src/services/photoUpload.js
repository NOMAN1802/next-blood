import { supabaseAdmin } from '@/lib/customSupabaseClient';

const BUCKET = 'uploads';

export const photoUpload = {
  validateFile: (file) => {
    if (!file) return { isValid: false, error: 'No file selected' };
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return { isValid: false, error: 'File must be JPG, PNG, or WebP' };
    }
    if (file.size > 5 * 1024 * 1024) {
      return { isValid: false, error: 'File size must be less than 5MB' };
    }
    return { isValid: true, error: null };
  },

  uploadDoctorPhoto:    (file) => photoUpload._uploadFile(file, 'doctors'),
  uploadHospitalPhoto:  (file) => photoUpload._uploadFile(file, 'hospitals'),
  uploadVolunteerPhoto: (file) => photoUpload._uploadFile(file, 'volunteers'),
  uploadHeroSlide:      (file) => photoUpload._uploadFile(file, 'hero'),

  _uploadFile: async (file, folder) => {
    const validation = photoUpload.validateFile(file);
    if (!validation.isValid) return { url: null, error: validation.error };

    try {
      const fileExt = file.name.split('.').pop().toLowerCase();
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(fileName);
      return { url: data.publicUrl, error: null };
    } catch (error) {
      console.error('Upload failed:', error);
      return { url: null, error: error.message || 'Upload failed' };
    }
  },

  deletePhoto: async (url) => {
    if (!url) return;
    try {
      const match = url.match(/\/uploads\/(.+)$/);
      if (!match) return;
      await supabaseAdmin.storage.from(BUCKET).remove([decodeURIComponent(match[1])]);
    } catch (e) {
      console.error('Delete error:', e);
    }
  }
};
