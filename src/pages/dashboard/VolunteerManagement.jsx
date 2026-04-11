import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Trash2, Edit2, Search, Mail, Phone, 
  Award, Link as LinkIcon, Loader2, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { db } from '@/lib/db';

const VolunteerManagement = () => {
  const { toast } = useToast();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentVolunteer, setCurrentVolunteer] = useState(null); // null = new
  const [formData, setFormData] = useState({
    full_name: '', role: '', bio: '', email: '', phone: '', location: '', avatar_url: ''
  });
  
  // Sub-data States for Edit Mode
  const [socials, setSocials] = useState([]);
  const [achievements, setAchievements] = useState([]);
  
  // File Upload State
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const data = await db.volunteers.getAll();
      setVolunteers(data || []);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load volunteers' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (volunteer = null) => {
    setCurrentVolunteer(volunteer);
    if (volunteer) {
      setFormData({
        full_name: volunteer.full_name || '',
        role: volunteer.role || '',
        bio: volunteer.bio || '',
        email: volunteer.email || '',
        phone: volunteer.phone || '',
        location: volunteer.location || '',
        avatar_url: volunteer.avatar_url || ''
      });
      setSocials(volunteer.volunteer_social_links || []);
      setAchievements(volunteer.volunteer_achievements || []);
    } else {
      setFormData({ full_name: '', role: '', bio: '', email: '', phone: '', location: '', avatar_url: '' });
      setSocials([]);
      setAchievements([]);
    }
    setIsDialogOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const { file_url } = await db.uploads.uploadFile(file, 'uploads');
      setFormData(prev => ({ ...prev, avatar_url: file_url }));
      toast({ title: 'Success', description: 'Image uploaded successfully' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Upload Failed', description: error.message });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveVolunteer = async () => {
    if (!formData.full_name || !formData.role) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Name and Role are required.' });
      return;
    }

    try {
      let volunteerId = currentVolunteer?.id;

      if (volunteerId) {
        await db.volunteers.update(volunteerId, formData);
        toast({ title: 'Updated', description: 'Volunteer profile updated.' });
      } else {
        const newVol = await db.volunteers.create(formData);
        volunteerId = newVol.id;
        toast({ title: 'Created', description: 'New volunteer added.' });
      }
      
      setIsDialogOpen(false);
      fetchVolunteers();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleDeleteVolunteer = async (id) => {
    if (!window.confirm("Are you sure? This will delete the volunteer and all associated data.")) return;
    try {
      await db.volunteers.delete(id);
      fetchVolunteers();
      toast({ title: 'Deleted', description: 'Volunteer removed successfully.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleAddSocial = async (e) => {
    e.preventDefault();
    if (!currentVolunteer?.id) {
       toast({ variant: 'destructive', title: 'Error', description: 'Please save basic info first.' });
       return;
    }
    const platform = e.target.platform.value;
    const url = e.target.url.value;
    
    try {
      const newLink = await db.volunteerSocials.create({
        volunteer_id: currentVolunteer.id,
        platform,
        url
      });
      setSocials([...socials, newLink]);
      e.target.reset();
      toast({ title: 'Added', description: 'Social link added.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleDeleteSocial = async (id) => {
    try {
      await db.volunteerSocials.delete(id);
      setSocials(socials.filter(s => s.id !== id));
      toast({ title: 'Removed', description: 'Link removed.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleAddAchievement = async (e) => {
    e.preventDefault();
    if (!currentVolunteer?.id) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please save basic info first.' });
      return;
    }
    const text = e.target.text.value;
    
    try {
      const newAch = await db.volunteerAchievements.create({
        volunteer_id: currentVolunteer.id,
        achievement_text: text
      });
      setAchievements([...achievements, newAch]);
      e.target.reset();
      toast({ title: 'Added', description: 'Achievement added.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleDeleteAchievement = async (id) => {
    try {
      await db.volunteerAchievements.delete(id);
      setAchievements(achievements.filter(a => a.id !== id));
      toast({ title: 'Removed', description: 'Achievement removed.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const filteredVolunteers = volunteers.filter(v =>
    (v.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Volunteer Management</h2>
          <p className="text-neutral-400">Manage leadership team and volunteers.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-red-600 hover:bg-red-500">
          <Plus className="w-4 h-4 mr-2" /> Add Volunteer
        </Button>
      </div>

      <div className="flex items-center space-x-2 bg-neutral-900 p-2 rounded-lg border border-neutral-800 max-w-md">
        <Search className="w-4 h-4 text-neutral-500" />
        <Input 
          placeholder="Search by name or role..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)}
          className="bg-transparent border-0 focus-visible:ring-0 text-white h-8"
        />
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
           <div className="col-span-full flex justify-center py-20"><Loader2 className="animate-spin text-red-600" /></div>
        ) : filteredVolunteers.length === 0 ? (
           <div className="col-span-full text-center text-neutral-500 py-20">No volunteers found.</div>
        ) : (
          filteredVolunteers.map(vol => (
            <Card key={vol.id} className="bg-neutral-900 border-neutral-800 text-white overflow-hidden group">
              <div className="flex p-4 gap-4">
                <div className="w-20 h-20 rounded-lg bg-neutral-800 flex-shrink-0 overflow-hidden">
                  {vol.avatar_url ? (
                    <img src={vol.avatar_url} alt={vol.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Users className="text-neutral-600" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate">{vol.full_name}</h3>
                  <p className="text-sm text-red-400 truncate mb-1">{vol.role}</p>
                  <p className="text-xs text-neutral-400 flex items-center gap-1 mb-1">
                    <Mail className="w-3 h-3" /> {vol.email || 'No email'}
                  </p>
                  <p className="text-xs text-neutral-400 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {vol.phone || 'No phone'}
                  </p>
                </div>
              </div>
              <div className="px-4 pb-4 flex justify-between items-center border-t border-neutral-800 pt-3">
                 <div className="flex gap-2">
                    <span className="text-xs bg-neutral-800 px-2 py-1 rounded text-neutral-400">
                      {vol.volunteer_achievements?.length || 0} Achievements
                    </span>
                 </div>
                 <div className="flex gap-2">
                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-neutral-800" onClick={() => handleOpenDialog(vol)}>
                      <Edit2 className="w-4 h-4 text-blue-400" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-neutral-800" onClick={() => handleDeleteVolunteer(vol.id)}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                 </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-neutral-900 border-neutral-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>{currentVolunteer ? 'Edit Profile' : 'New Volunteer'}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="basic" className="mt-4">
            <TabsList className="bg-neutral-950 border border-neutral-800 w-full justify-start">
              <TabsTrigger value="basic" className="data-[state=active]:bg-red-600">Basic Info</TabsTrigger>
              <TabsTrigger value="socials" disabled={!currentVolunteer} className="data-[state=active]:bg-red-600 disabled:opacity-50">Social Links</TabsTrigger>
              <TabsTrigger value="achievements" disabled={!currentVolunteer} className="data-[state=active]:bg-red-600 disabled:opacity-50">Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    value={formData.full_name}
                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                    className="bg-neutral-950 border-neutral-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role/Title *</Label>
                  <Input 
                    value={formData.role} 
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    className="bg-neutral-950 border-neutral-800" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="bg-neutral-950 border-neutral-800" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="bg-neutral-950 border-neutral-800" 
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Location</Label>
                  <Input 
                    value={formData.location} 
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    className="bg-neutral-950 border-neutral-800" 
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Profile Photo</Label>
                  <div className="flex gap-4 items-center">
                    <div className="h-16 w-16 bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0 border border-neutral-700">
                      {formData.avatar_url ? (
                        <img src={formData.avatar_url} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Users className="text-neutral-600" /></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        disabled={uploading}
                        className="bg-neutral-950 border-neutral-800 file:bg-neutral-800 file:text-white file:border-0" 
                      />
                      <p className="text-xs text-neutral-500 mt-1">{uploading ? 'Uploading...' : 'Or enter URL below'}</p>
                      <Input
                        placeholder="https://..."
                        value={formData.avatar_url}
                        onChange={e => setFormData({...formData, avatar_url: e.target.value})}
                        className="bg-neutral-950 border-neutral-800 mt-2"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Bio</Label>
                  <Textarea 
                    value={formData.bio} 
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                    className="bg-neutral-950 border-neutral-800 min-h-[100px]" 
                  />
                </div>
              </div>
              <Button onClick={handleSaveVolunteer} className="w-full bg-red-600 hover:bg-red-500 mt-4">
                {currentVolunteer ? 'Update Profile' : 'Create & Continue'}
              </Button>
            </TabsContent>

            <TabsContent value="socials" className="space-y-4 pt-4">
              <form onSubmit={handleAddSocial} className="flex gap-2 items-end bg-neutral-950 p-3 rounded-lg border border-neutral-800">
                <div className="w-1/3 space-y-1">
                   <Label className="text-xs">Platform</Label>
                   <Select name="platform" defaultValue="facebook">
                     <SelectTrigger className="bg-neutral-900 border-neutral-800 h-9">
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                        {['facebook', 'twitter', 'linkedin', 'instagram', 'github', 'website'].map(p => (
                          <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                        ))}
                     </SelectContent>
                   </Select>
                </div>
                <div className="flex-1 space-y-1">
                   <Label className="text-xs">URL</Label>
                   <Input name="url" required placeholder="https://..." className="bg-neutral-900 border-neutral-800 h-9" />
                </div>
                <Button type="submit" size="sm" className="bg-neutral-800 hover:bg-neutral-700 h-9 px-3">
                   <Plus className="w-4 h-4" />
                </Button>
              </form>
              
              <div className="space-y-2">
                {socials.map(link => (
                  <div key={link.id} className="flex items-center justify-between p-3 bg-neutral-950 rounded-lg border border-neutral-800">
                    <div className="flex items-center gap-3">
                       <LinkIcon className="w-4 h-4 text-blue-400" />
                       <div>
                         <p className="text-sm font-medium capitalize">{link.platform}</p>
                         <p className="text-xs text-neutral-500 truncate max-w-[200px]">{link.url}</p>
                       </div>
                    </div>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400" onClick={() => handleDeleteSocial(link.id)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                {socials.length === 0 && <p className="text-center text-neutral-500 text-sm py-4">No links added.</p>}
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4 pt-4">
               <form onSubmit={handleAddAchievement} className="flex gap-2 items-end bg-neutral-950 p-3 rounded-lg border border-neutral-800">
                <div className="flex-1 space-y-1">
                   <Label className="text-xs">Achievement Description</Label>
                   <Input name="text" required placeholder="e.g. Organized 50+ camps" className="bg-neutral-900 border-neutral-800 h-9" />
                </div>
                <Button type="submit" size="sm" className="bg-neutral-800 hover:bg-neutral-700 h-9 px-3">
                   <Plus className="w-4 h-4" />
                </Button>
              </form>

              <div className="space-y-2">
                {achievements.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-neutral-950 rounded-lg border border-neutral-800">
                    <div className="flex items-center gap-3">
                       <Award className="w-4 h-4 text-yellow-500" />
                       <p className="text-sm">{item.achievement_text}</p>
                    </div>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400" onClick={() => handleDeleteAchievement(item.id)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                {achievements.length === 0 && <p className="text-center text-neutral-500 text-sm py-4">No achievements listed.</p>}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VolunteerManagement;