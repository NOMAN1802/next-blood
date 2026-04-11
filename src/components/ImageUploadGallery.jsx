import React, { useState, useEffect } from 'react';
import { Upload, X, Trash2, Copy, Check, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const ImageUploadGallery = ({ category = 'general' }) => {
  const { toast } = useToast();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchImages();
  }, [category]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const data = await db.uploads.getAll(category);
      setImages(data || []);
    } catch (error) {
      console.error("Failed to load images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    if (!file.type.startsWith('image/')) {
      toast({ variant: "destructive", title: "Invalid File", description: "Please upload an image file." });
      return;
    }
    
    setUploading(true);
    try {
      await db.uploads.uploadFile(file, 'uploads', category);
      toast({ title: "Success", description: "Image uploaded successfully." });
      fetchImages();
    } catch (error) {
      console.error("Upload error:", error);
      toast({ variant: "destructive", title: "Upload Failed", description: "Could not upload image." });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (image) => {
    if (!window.confirm("Delete this image permanently?")) return;
    
    // We assume file_name is the path in bucket based on our db.js logic
    const path = image.file_name; 
    
    try {
      await db.uploads.delete(image.id, path);
      setImages(prev => prev.filter(img => img.id !== image.id));
      toast({ title: "Deleted", description: "Image removed from gallery." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete image." });
    }
  };

  const copyToClipboard = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast({ title: "Copied!", description: "Image URL copied to clipboard." });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div 
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-colors text-center cursor-pointer group",
          dragActive ? "border-red-500 bg-red-500/10" : "border-neutral-800 hover:border-neutral-700 bg-neutral-900/50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById(`file-upload-${category}`).click()}
      >
        <input 
          id={`file-upload-${category}`} 
          type="file" 
          className="hidden" 
          accept="image/*" 
          onChange={handleChange} 
        />
        
        <div className="flex flex-col items-center justify-center gap-2">
          {uploading ? (
            <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
          ) : (
            <Upload className="w-10 h-10 text-neutral-500 group-hover:text-red-500 transition-colors" />
          )}
          <div className="text-neutral-300 font-medium">
            {uploading ? "Uploading..." : "Click to upload or drag & drop"}
          </div>
          <p className="text-xs text-neutral-500">
            JPG, PNG, WEBP up to 5MB
          </p>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <AnimatePresence>
          {images.map((img) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              layout
              className="group relative aspect-square bg-neutral-900 rounded-lg border border-neutral-800 overflow-hidden shadow-sm"
            >
              <img 
                src={img.file_url} 
                alt="Uploaded asset" 
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="w-full text-xs h-8 bg-white/90 hover:bg-white text-black"
                  onClick={(e) => { e.stopPropagation(); copyToClipboard(img.file_url, img.id); }}
                >
                  {copiedId === img.id ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  {copiedId === img.id ? "Copied" : "Copy URL"}
                </Button>
                
                <Button 
                  size="icon" 
                  variant="destructive" 
                  className="h-8 w-8 rounded-full"
                  onClick={(e) => { e.stopPropagation(); handleDelete(img); }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Empty State */}
        {!loading && images.length === 0 && (
          <div className="col-span-full py-8 text-center text-neutral-500 bg-neutral-900/30 rounded-lg border border-dashed border-neutral-800">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No images uploaded yet for {category}.</p>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <>
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-square bg-neutral-900 animate-pulse rounded-lg" />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default ImageUploadGallery;