import React, { useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabaseAdmin } from '@/lib/customSupabaseClient';

const ImageUploadField = ({ value, onChange, disabled = false, label = 'Image' }) => {
  const { toast } = useToast();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file) => {
    if (!file.type.startsWith('image/')) {
      toast({ variant: 'destructive', title: 'Invalid File', description: 'Please select an image file.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'File Too Large', description: 'Max file size is 5MB.' });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from('uploads')
        .upload(fileName, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('uploads')
        .getPublicUrl(fileName);

      onChange(publicUrl);
      toast({ title: 'Uploaded', description: 'Image uploaded successfully.' });
    } catch (err) {
      console.error('Upload error:', err);
      toast({ variant: 'destructive', title: 'Upload Failed', description: err.message || 'Could not upload image.' });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {value ? (
        <div className="relative w-full rounded-lg border border-neutral-700 overflow-hidden bg-neutral-950">
          <img
            src={value}
            alt={label}
            className="w-full h-40 object-contain p-2"
          />
          {!disabled && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 hover:opacity-100 transition-opacity">
              <Button
                type="button"
                size="sm"
                className="bg-white text-black hover:bg-gray-100"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Upload className="w-4 h-4 mr-1" />}
                Change
              </Button>
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="h-8 w-8 rounded-full"
                onClick={() => onChange('')}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-neutral-700 rounded-lg p-6 text-neutral-400 hover:border-red-500 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-neutral-950"
        >
          {uploading
            ? <Loader2 className="w-8 h-8 animate-spin" />
            : <Upload className="w-8 h-8" />
          }
          <span className="text-sm font-medium">
            {uploading ? 'Uploading...' : `Click to upload ${label}`}
          </span>
          <span className="text-xs text-neutral-600">JPG, PNG, WEBP up to 5MB</span>
        </button>
      )}
    </div>
  );
};

export default ImageUploadField;
