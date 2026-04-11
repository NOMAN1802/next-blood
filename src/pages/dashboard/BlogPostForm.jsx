import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Image as ImageIcon, Link as LinkIcon, Bold, Italic, List, Star, Upload, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { db } from '@/lib/db';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BlogPostForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isEditing = !!id;
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    cover_image: '',
    author_name: '',
    tags: '',
    category: 'General',
    is_published: true,
    featured: false,
    seo_title: '',
    seo_description: '',
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  
  // Slug validation states
  const [slugStatus, setSlugStatus] = useState({ isValid: true, checking: false, message: '' });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const CATEGORIES = ['General', 'News', 'Stories', 'Health Tips', 'Events', 'Medical'];

  useEffect(() => {
    if (isEditing) {
      fetchPost();
      setSlugManuallyEdited(true); 
    } else if (user) {
      setFormData(prev => ({ ...prev, author_name: user.user_metadata?.name || user.email?.split('@')[0] || 'Admin' }));
    }
  }, [id, user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.slug && !isFetching) {
        checkSlugExists(formData.slug);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.slug, isFetching]);

  const generateSlug = (title) => {
    if (!title) return '';
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const timestamp = Date.now();
    return `${baseSlug}-${timestamp}`;
  };

  const fetchPost = async () => {
    try {
      setIsFetching(true);
      setLoading(true);
      
      const { data: post, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (post) {
        // Critical Fix: Ensure slug exists. If missing in DB, generate from title
        const existingSlug = post.slug || generateSlug(post.title);
        
        setFormData({
          ...post,
          slug: existingSlug,
          tags: post.tags && Array.isArray(post.tags) ? post.tags.join(', ') : '',
          category: post.category || 'General',
          featured: post.featured || false,
        });
        
        setSlugStatus({ isValid: true, checking: false, message: 'Current slug' });
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load post data." });
      navigate('/dashboard/blog');
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  const checkSlugExists = async (slugToCheck) => {
    if (!slugToCheck) return;
    
    setSlugStatus(prev => ({ ...prev, checking: true, message: 'Checking availability...' }));
    
    try {
      let query = supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', slugToCheck);

      if (isEditing) {
        query = query.neq('id', id);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data && data.length > 0) {
        setSlugStatus({ isValid: false, checking: false, message: 'Slug is already taken' });
      } else {
        setSlugStatus({ isValid: true, checking: false, message: 'Slug is available' });
      }
    } catch (error) {
      console.error("Slug check error:", error);
      setSlugStatus({ isValid: false, checking: false, message: 'Error checking slug availability' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'slug') {
      setSlugManuallyEdited(true);
      const cleanedSlug = value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      setFormData(prev => ({ ...prev, slug: cleanedSlug }));
      return;
    }

    setFormData(prev => {
      const updates = { [name]: value };
      
      if (name === 'title' && !slugManuallyEdited && !isEditing) {
        updates.slug = generateSlug(value);
        updates.seo_title = value;
        updates.seo_description = prev.excerpt || value.substring(0, 150);
      }
      
      return { ...prev, ...updates };
    });
  };

  const handleSwitchChange = (field, checked) => {
    setFormData(prev => ({ ...prev, [field]: checked }));
  };
  
  const handleCategoryChange = (value) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({ variant: "destructive", title: "Invalid file type", description: "Please upload a valid image (JPG, PNG, WEBP, GIF)." });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const maxSize = 5 * 1024 * 1024; 
    if (file.size > maxSize) {
      toast({ variant: "destructive", title: "File too large", description: "Image size must be less than 5MB." });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);

    try {
      const result = await db.uploads.uploadFile(file, 'uploads', 'blog-covers');
      
      setFormData(prev => ({
        ...prev,
        cover_image: result.file_url
      }));
      
      toast({ title: "Success", description: "Cover image uploaded successfully." });
    } catch (uploadError) {
      console.error("Upload failed", uploadError);
      toast({ variant: "destructive", title: "Upload Failed", description: uploadError.message || "Could not upload image." });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ''; 
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeCoverImage = () => {
    setFormData(prev => ({ ...prev, cover_image: '' }));
  };

  const insertTag = (tag) => {
    const textarea = document.getElementById('content-editor');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const selection = text.substring(start, end);
    
    let replacement = '';
    switch(tag) {
      case 'b': replacement = `<b>${selection || 'Bold'}</b>`; break;
      case 'i': replacement = `<i>${selection || 'Italic'}</i>`; break;
      case 'img': replacement = `<img src="URL" alt="Desc" class="w-full rounded-xl my-4" />`; break;
      case 'a': replacement = `<a href="URL" class="text-red-500 hover:underline">${selection || 'Link'}</a>`; break;
      case 'h2': replacement = `\n<h2 class="text-2xl font-bold text-white mt-8 mb-4">${selection || 'H2'}</h2>\n`; break;
      case 'p': replacement = `\n<p class="mb-4">${selection || 'Paragraph...'}</p>\n`; break;
      case 'ul': replacement = `\n<ul class="list-disc pl-6 mb-4">\n  <li>Item 1</li>\n</ul>\n`; break;
      default: replacement = selection;
    }

    const newContent = before + replacement + after;
    setFormData(prev => ({ ...prev, content: newContent }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.title.trim()) throw new Error("Title is required");
      if (!formData.content.trim()) throw new Error("Content is required");
      
      // Auto-generate slug if missing at submit time
      let finalSlug = formData.slug;
      if (!finalSlug || !finalSlug.trim()) {
         finalSlug = generateSlug(formData.title);
         setFormData(prev => ({ ...prev, slug: finalSlug }));
      }
      
      if (!slugStatus.isValid) {
         throw new Error(slugStatus.message || "Invalid slug.");
      }

      // Race condition check
      let query = supabase.from('blog_posts').select('id').eq('slug', finalSlug);
      if (isEditing) query = query.neq('id', id);
      
      const { data: existingSlug } = await query;
      if (existingSlug && existingSlug.length > 0) {
         setSlugStatus({ isValid: false, checking: false, message: 'Slug taken' });
         throw new Error("Slug is already taken.");
      }

      const payload = {
        ...formData,
        slug: finalSlug,
        tags: Array.isArray(formData.tags) ? formData.tags : formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        updated_at: new Date(),
      };

      if (isEditing) {
        const { error: updateError } = await supabase
          .from('blog_posts')
          .update(payload)
          .eq('id', id);
          
        if (updateError) throw updateError;
        toast({ title: "Success", description: "Post updated successfully." });
      } else {
        await db.blog.create({ ...payload, created_at: new Date() });
        toast({ title: "Success", description: "Post created successfully." });
      }
      navigate('/dashboard/blog');
    } catch (error) {
      console.error("Save error:", error);
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/blog')}>
               <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold text-white">{isEditing ? 'Edit Post' : 'Create New Post'}</h1>
         </div>
         <Button 
            onClick={handleSubmit} 
            disabled={loading || uploading} 
            className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]"
         >
           {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} 
           {loading ? 'Saving...' : 'Save Post'}
         </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 space-y-6">
            <Card className="bg-neutral-900 border-neutral-800">
               <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                     <Label className="text-white">Post Title</Label>
                     <Input 
                       name="title" 
                       value={formData.title} 
                       onChange={handleInputChange} 
                       placeholder="Enter an engaging title..." 
                       className="bg-neutral-950 border-neutral-800 text-white text-lg font-bold"
                     />
                  </div>
                  
                  <div className="space-y-2">
                     <Label className="text-white">Rich Content Editor</Label>
                     <div className="flex flex-wrap gap-2 p-2 bg-neutral-950 border border-neutral-800 rounded-md mb-2">
                        <Button type="button" size="sm" variant="ghost" onClick={() => insertTag('b')} className="h-8 w-8 p-0" title="Bold"><Bold className="w-4 h-4" /></Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => insertTag('i')} className="h-8 w-8 p-0" title="Italic"><Italic className="w-4 h-4" /></Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => insertTag('h2')} className="h-8 w-8 p-0 font-bold" title="H2">H2</Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => insertTag('p')} className="h-8 w-8 p-0" title="Paragraph">P</Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => insertTag('ul')} className="h-8 w-8 p-0" title="List"><List className="w-4 h-4" /></Button>
                        <div className="w-px h-6 bg-neutral-800 mx-1" />
                        <Button type="button" size="sm" variant="ghost" onClick={() => insertTag('link')} className="h-8 w-8 p-0" title="Link"><LinkIcon className="w-4 h-4" /></Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => insertTag('img')} className="h-8 w-8 p-0" title="Image"><ImageIcon className="w-4 h-4" /></Button>
                     </div>
                     <Textarea 
                       id="content-editor"
                       name="content" 
                       value={formData.content} 
                       onChange={handleInputChange} 
                       placeholder="Write your content here using HTML..." 
                       className="min-h-[400px] bg-neutral-950 border-neutral-800 text-white font-mono text-sm leading-relaxed"
                     />
                  </div>
               </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
               <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                     <Label className="text-white">Excerpt</Label>
                     <Textarea 
                       name="excerpt" 
                       value={formData.excerpt} 
                       onChange={handleInputChange} 
                       className="h-24 bg-neutral-950 border-neutral-800 text-white"
                     />
                  </div>
               </CardContent>
            </Card>
         </div>

         <div className="space-y-6">
            <Card className="bg-neutral-900 border-neutral-800">
               <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                     <Label className="text-white font-bold">Publish Status</Label>
                     <Switch 
                       checked={formData.is_published}
                       onCheckedChange={(c) => handleSwitchChange('is_published', c)}
                     />
                  </div>
                  <div className="flex items-center justify-between bg-yellow-900/10 p-3 rounded-lg border border-yellow-900/20">
                     <div className="flex items-center gap-2">
                        <Star className={`w-4 h-4 ${formData.featured ? 'fill-yellow-500 text-yellow-500' : 'text-neutral-500'}`} />
                        <Label className="text-white font-bold">Featured Post</Label>
                     </div>
                     <Switch 
                       checked={formData.featured}
                       onCheckedChange={(c) => handleSwitchChange('featured', c)}
                     />
                  </div>

                  <div className="space-y-2">
                     <Label className="text-white">Category</Label>
                     <Select value={formData.category} onValueChange={handleCategoryChange}>
                        <SelectTrigger className="w-full bg-neutral-950 border-neutral-800 text-white">
                           <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                           {CATEGORIES.map(cat => (
                              <SelectItem key={cat} value={cat} className="cursor-pointer">{cat}</SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>

                  <div className="space-y-2">
                     <Label className="text-white">URL Slug</Label>
                     <div className="relative">
                        <Input 
                          name="slug" 
                          value={formData.slug} 
                          onChange={handleInputChange} 
                          className={`bg-neutral-950 text-sm pr-8 ${
                             !slugStatus.isValid ? 'border-red-500' : 'border-neutral-800'
                          }`}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                           {slugStatus.checking ? (
                              <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                           ) : slugStatus.isValid ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                           ) : (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                           )}
                        </div>
                     </div>
                  </div>
                  
                  <div className="space-y-2">
                     <Label className="text-white">Cover Image</Label>
                     <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                     />
                     <div className="flex gap-2">
                         <Input 
                           name="cover_image" 
                           value={formData.cover_image} 
                           onChange={handleInputChange} 
                           className="bg-neutral-950 border-neutral-800 text-white flex-1"
                         />
                         <Button type="button" variant="outline" onClick={triggerFileInput} disabled={uploading}>
                            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                         </Button>
                     </div>
                     {formData.cover_image && (
                        <div className="relative mt-2 rounded-lg overflow-hidden border border-neutral-800 group">
                           <img src={formData.cover_image} className="w-full h-auto object-cover" style={{ aspectRatio: '16/9' }} alt="Cover" />
                           <button onClick={removeCoverImage} type="button" className="absolute top-2 right-2 p-1 bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                        </div>
                     )}
                  </div>
               </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
               <CardContent className="p-6 space-y-4">
                  <h3 className="font-bold text-white">Metadata & SEO</h3>
                  <div className="space-y-2">
                     <Label className="text-white">Author</Label>
                     <Input name="author_name" value={formData.author_name} onChange={handleInputChange} className="bg-neutral-950 border-neutral-800 text-white" />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-white">Tags</Label>
                     <Input name="tags" value={formData.tags} onChange={handleInputChange} className="bg-neutral-950 border-neutral-800 text-white" />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-white">SEO Title</Label>
                     <Input name="seo_title" value={formData.seo_title} onChange={handleInputChange} className="bg-neutral-950 border-neutral-800 text-white" />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-white">SEO Desc</Label>
                     <Textarea name="seo_description" value={formData.seo_description} onChange={handleInputChange} className="h-24 bg-neutral-950 border-neutral-800 text-white" />
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );
};

export default BlogPostForm;