import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Plus, Trash2, Edit2, ExternalLink, 
  Eye, EyeOff, Loader2, Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { db } from '@/lib/db';

const PageManagement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(null);
  const [formData, setFormData] = useState({
    title: '', slug: '', content: '', is_published: true, meta_description: ''
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const data = await db.pages.getAll();
      setPages(data || []);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load pages.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (page = null) => {
    setCurrentPage(page);
    if (page) {
      setFormData({
        title: page.title,
        slug: page.slug,
        content: page.content || '',
        is_published: page.is_published,
        meta_description: page.meta_description || ''
      });
    } else {
      setFormData({
        title: '', slug: '', content: '', is_published: true, meta_description: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Title and Slug are required.' });
      return;
    }

    try {
      if (currentPage) {
        await db.pages.update(currentPage.id, formData);
        toast({ title: 'Updated', description: 'Page updated successfully.' });
      } else {
        await db.pages.create(formData);
        toast({ title: 'Created', description: 'New page created successfully.' });
      }
      setIsDialogOpen(false);
      fetchPages();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this page?")) return;
    try {
      await db.pages.delete(id);
      setPages(pages.filter(p => p.id !== id));
      toast({ title: 'Deleted', description: 'Page removed.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  // Auto-generate slug from title
  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: !currentPage ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : prev.slug
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Page Management</h2>
          <p className="text-neutral-400">Create and manage dynamic pages.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-red-600 hover:bg-red-700">
          <Plus className="w-4 h-4 mr-2" /> Create Page
        </Button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-red-600" /></div>
        ) : pages.length === 0 ? (
          <div className="text-center py-12 text-neutral-500 bg-neutral-900/50 border border-neutral-800 rounded-xl border-dashed">
            No dynamic pages found. Create one to get started.
          </div>
        ) : (
          pages.map(page => (
            <div key={page.id} className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl flex flex-col md:flex-row justify-between gap-6 hover:border-neutral-700 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide border ${
                    page.is_published ? 'text-green-500 bg-green-500/10 border-green-500/20' : 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
                  }`}>
                    {page.is_published ? 'Published' : 'Draft'}
                  </span>
                  <span className="text-neutral-500 text-xs font-mono">/{page.slug}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{page.title}</h3>
                <p className="text-sm text-neutral-400 line-clamp-2">{page.meta_description || 'No description'}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open(`/p/${page.slug}`, '_blank')}
                  className="border-neutral-700 text-neutral-300 hover:text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-2" /> View
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleOpenDialog(page)}
                  className="border-neutral-700 text-blue-400 hover:text-blue-300 hover:bg-blue-950/30"
                >
                  <Edit2 className="w-4 h-4 mr-2" /> Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDelete(page.id)}
                  className="border-neutral-700 text-red-400 hover:text-red-300 hover:bg-red-950/30"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-neutral-900 border-neutral-800 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentPage ? 'Edit Page' : 'Create New Page'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Page Title</Label>
                <Input 
                  value={formData.title} 
                  onChange={handleTitleChange}
                  className="bg-neutral-950 border-neutral-800" 
                />
              </div>
              <div className="space-y-2">
                <Label>URL Slug</Label>
                <Input 
                  value={formData.slug} 
                  onChange={e => setFormData({...formData, slug: e.target.value})}
                  className="bg-neutral-950 border-neutral-800 font-mono" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Meta Description (SEO)</Label>
              <Input 
                value={formData.meta_description} 
                onChange={e => setFormData({...formData, meta_description: e.target.value})}
                className="bg-neutral-950 border-neutral-800" 
              />
            </div>

            <div className="space-y-2">
              <Label>Page Content (HTML supported)</Label>
              <Textarea 
                value={formData.content} 
                onChange={e => setFormData({...formData, content: e.target.value})}
                className="bg-neutral-950 border-neutral-800 min-h-[300px] font-mono text-sm" 
              />
            </div>

            <div className="flex items-center justify-between bg-neutral-950 p-4 rounded-lg border border-neutral-800">
              <div className="space-y-0.5">
                <Label>Publish Status</Label>
                <p className="text-xs text-neutral-500">Visible to public visitors</p>
              </div>
              <Switch 
                checked={formData.is_published}
                onCheckedChange={c => setFormData({...formData, is_published: c})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700">
              <Save className="w-4 h-4 mr-2" /> Save Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PageManagement;