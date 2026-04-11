import React, { useState, useEffect } from 'react';
import {
  Building2, Users, Plus, Trash2, Edit2, Save, X, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { db } from '@/lib/db';
import ImageUploadField from '@/components/ImageUploadField';

const AboutManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [foundationInfo, setFoundationInfo] = useState({});
  const [founders, setFounders] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [socials, setSocials] = useState([]);

  // Editing States
  const [isEditingFoundation, setIsEditingFoundation] = useState(false);
  const [currentFounder, setCurrentFounder] = useState(null); // null = new, obj = edit
  const [currentCompany, setCurrentCompany] = useState(null);
  const [currentSocial, setCurrentSocial] = useState(null);

  // Image upload states
  const [founderImageUrl, setFounderImageUrl] = useState('');
  const [companyLogoUrl, setCompanyLogoUrl] = useState('');

  // Dialog Opens
  const [founderOpen, setFounderOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fInfo, fList, cList, sList] = await Promise.all([
        db.foundation.get(),
        db.founders.getAll(),
        db.companies.getAll(),
        db.socials.getAll()
      ]);

      if (fInfo) setFoundationInfo(fInfo);
      if (fList) setFounders(fList);
      if (cList) setCompanies(cList);
      if (sList) setSocials(sList);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load data.' });
    } finally {
      setLoading(false);
    }
  };

  // --- Foundation Handlers ---
  const handleFoundationSave = async () => {
    try {
      await db.foundation.upsert({ ...foundationInfo, updated_at: new Date() });
      toast({ title: 'Success', description: 'Foundation info updated.' });
      setIsEditingFoundation(false);
      fetchData();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  // --- Founder Handlers ---
  const handleFounderSave = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData(e.target);
      const data = {
        full_name: fd.get('name'),
        title: fd.get('title'),
        bio: fd.get('bio'),
        ...(founderImageUrl ? { image_url: founderImageUrl } : {}),
        display_order: parseInt(fd.get('display_order') || 0)
      };

      if (currentFounder?.id) {
        await db.founders.update(currentFounder.id, data);
      } else {
        await db.founders.create(data);
      }

      toast({ title: 'Success', description: `Founder ${currentFounder?.id ? 'updated' : 'added'}.` });
      setFounderOpen(false);
      fetchData();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const deleteFounder = async (id) => {
    if(!window.confirm("Are you sure? This will delete the founder.")) return;
    try {
      await db.founders.delete(id);
      fetchData();
      toast({ title: 'Deleted', description: 'Founder removed.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  // --- Company Handlers ---
  const handleCompanySave = async (e) => {
    e.preventDefault();
    try {
      const data = {
        name: e.target.name.value,
        logo_url: companyLogoUrl,
        website_url: e.target.website_url.value,
        description: e.target.description.value,
        display_order: parseInt(e.target.display_order.value || 0)
      };

      if (currentCompany?.id) {
        await db.companies.update(currentCompany.id, data);
      } else {
        await db.companies.create(data);
      }

      toast({ title: 'Success', description: `Company ${currentCompany?.id ? 'updated' : 'added'}.` });
      setCompanyOpen(false);
      fetchData();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const deleteCompany = async (id) => {
    if(!window.confirm("Are you sure?")) return;
    try {
      await db.companies.delete(id);
      fetchData();
      toast({ title: 'Deleted', description: 'Company removed.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  // --- Social Handlers ---
  const handleSocialSave = async (e) => {
    e.preventDefault();
    try {
      const data = {
        entity_type: e.target.entity_type.value,
        entity_id: e.target.entity_id.value,
        platform: e.target.platform.value,
        url: e.target.url.value,
        icon_name: e.target.platform.value 
      };

      if (currentSocial?.id) {
        await db.socials.update(currentSocial.id, data);
      } else {
        await db.socials.create(data);
      }

      toast({ title: 'Success', description: 'Link saved.' });
      setSocialOpen(false);
      fetchData();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const deleteSocial = async (id) => {
     try {
      await db.socials.delete(id);
      fetchData();
      toast({ title: 'Deleted', description: 'Link removed.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-red-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">About Page Management</h2>
          <p className="text-neutral-400">Manage founders, foundation details, and partners.</p>
        </div>
      </div>

      <Tabs defaultValue="foundation" className="space-y-4">
        <TabsList className="bg-neutral-900 border border-neutral-800 flex flex-wrap h-auto">
          <TabsTrigger value="foundation" className="data-[state=active]:bg-red-600">Foundation Info</TabsTrigger>
          <TabsTrigger value="founders" className="data-[state=active]:bg-red-600">Founders</TabsTrigger>
          <TabsTrigger value="companies" className="data-[state=active]:bg-red-600">Partners (Powered By)</TabsTrigger>
          <TabsTrigger value="socials" className="data-[state=active]:bg-red-600">Social Links</TabsTrigger>
        </TabsList>

        {/* --- FOUNDATION TAB --- */}
        <TabsContent value="foundation" className="space-y-4">
          <Card className="bg-neutral-900 border-neutral-800 text-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Foundation Details</CardTitle>
                <CardDescription>Core information about the organization.</CardDescription>
              </div>
              <Button 
                variant={isEditingFoundation ? "destructive" : "default"} 
                onClick={() => isEditingFoundation ? setIsEditingFoundation(false) : setIsEditingFoundation(true)}
                className={isEditingFoundation ? "" : "bg-neutral-800 hover:bg-neutral-700"}
              >
                {isEditingFoundation ? <X className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
                {isEditingFoundation ? "Cancel" : "Edit Details"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Row 1: Name + Founding Year */}
                <div className="space-y-2">
                  <Label>Foundation Name</Label>
                  <Input
                    disabled={!isEditingFoundation}
                    value={foundationInfo.name || ''}
                    onChange={e => setFoundationInfo({...foundationInfo, name: e.target.value})}
                    className="bg-neutral-950 border-neutral-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Founding Year</Label>
                  <Input
                    disabled={!isEditingFoundation}
                    value={foundationInfo.founding_year || ''}
                    onChange={e => setFoundationInfo({...foundationInfo, founding_year: e.target.value})}
                    className="bg-neutral-950 border-neutral-800"
                    placeholder="e.g. 2025"
                  />
                </div>

                {/* Row 2: Description (full width) */}
                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    disabled={!isEditingFoundation}
                    value={foundationInfo.description || ''}
                    onChange={e => setFoundationInfo({...foundationInfo, description: e.target.value})}
                    className="bg-neutral-950 border-neutral-800 min-h-[100px]"
                    placeholder="Brief description of the foundation..."
                  />
                </div>

                {/* Row 3: Mission Statement (full width) */}
                <div className="space-y-2 md:col-span-2">
                  <Label>Mission Statement</Label>
                  <Textarea
                    disabled={!isEditingFoundation}
                    value={foundationInfo.mission_statement || ''}
                    onChange={e => setFoundationInfo({...foundationInfo, mission_statement: e.target.value})}
                    className="bg-neutral-950 border-neutral-800 min-h-[100px]"
                    placeholder="The mission of the foundation..."
                  />
                </div>

                {/* Row 4: Email + Phone */}
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    disabled={!isEditingFoundation}
                    value={foundationInfo.email || ''}
                    onChange={e => setFoundationInfo({...foundationInfo, email: e.target.value})}
                    className="bg-neutral-950 border-neutral-800"
                    placeholder="contact@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    disabled={!isEditingFoundation}
                    value={foundationInfo.phone || ''}
                    onChange={e => setFoundationInfo({...foundationInfo, phone: e.target.value})}
                    className="bg-neutral-950 border-neutral-800"
                    placeholder="01XXXXXXXXX"
                  />
                </div>

                {/* Row 5: Address (full width) */}
                <div className="space-y-2 md:col-span-2">
                  <Label>Address</Label>
                  <Input
                    disabled={!isEditingFoundation}
                    value={foundationInfo.address || ''}
                    onChange={e => setFoundationInfo({...foundationInfo, address: e.target.value})}
                    className="bg-neutral-950 border-neutral-800"
                    placeholder="City, Postal Code"
                  />
                </div>

                {/* Row 6: Logo (full width) */}
                <div className="space-y-2 md:col-span-2">
                  <Label>Logo</Label>
                  <ImageUploadField
                    label="Logo"
                    value={foundationInfo.logo_url || ''}
                    onChange={url => setFoundationInfo({...foundationInfo, logo_url: url})}
                    disabled={!isEditingFoundation}
                  />
                </div>
              </div>
              {isEditingFoundation && (
                <div className="flex justify-end pt-4">
                  <Button onClick={handleFoundationSave} className="bg-red-600 hover:bg-red-500">
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
        </TabsContent>

        {/* --- FOUNDERS TAB --- */}
        <TabsContent value="founders" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Founders List</h3>
            <Dialog open={founderOpen} onOpenChange={setFounderOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setCurrentFounder(null); setFounderImageUrl(''); }} className="bg-red-600 hover:bg-red-500">
                  <Plus className="w-4 h-4 mr-2" /> Add Founder
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-neutral-900 border-neutral-800 text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{currentFounder ? 'Edit Founder' : 'Add New Founder'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleFounderSave} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input name="name" defaultValue={currentFounder?.full_name} required className="bg-neutral-950 border-neutral-800" />
                     </div>
                     <div className="space-y-2">
                        <Label>Title/Role</Label>
                        <Input name="title" defaultValue={currentFounder?.title} required className="bg-neutral-950 border-neutral-800" />
                     </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Photo</Label>
                    <ImageUploadField
                      label="Photo"
                      value={founderImageUrl}
                      onChange={setFounderImageUrl}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sort Order</Label>
                    <Input name="display_order" type="number" defaultValue={currentFounder?.display_order || 0} className="bg-neutral-950 border-neutral-800" />
                  </div>
                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea name="bio" defaultValue={currentFounder?.bio} className="bg-neutral-950 border-neutral-800 min-h-[100px]" />
                  </div>
                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-500">Save</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {founders.map(founder => (
              <Card key={founder.id} className="bg-neutral-900 border-neutral-800 text-white overflow-hidden group">
                 <div className="h-48 overflow-hidden bg-neutral-800">
                   {founder.image_url ? (
                     <img src={founder.image_url} alt={founder.full_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-neutral-600"><Users className="w-12 h-12" /></div>
                   )}
                 </div>
                 <CardContent className="p-5">
                   <h4 className="text-lg font-bold">{founder.full_name}</h4>
                   <p className="text-red-400 text-sm mb-2">{founder.title}</p>
                   <p className="text-neutral-400 text-xs line-clamp-2 mb-4">{founder.bio}</p>
                   <div className="flex justify-between items-center">
                     <div className="text-xs text-neutral-500">Order: {founder.display_order}</div>
                     <div className="flex gap-2">
                       <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-neutral-800" onClick={() => { setCurrentFounder({ ...founder, full_name: founder.full_name }); setFounderImageUrl(founder.image_url || ''); setFounderOpen(true); }}>
                         <Edit2 className="w-4 h-4 text-blue-400" />
                       </Button>
                       <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-neutral-800" onClick={() => deleteFounder(founder.id)}>
                         <Trash2 className="w-4 h-4 text-red-400" />
                       </Button>
                     </div>
                   </div>
                 </CardContent>
              </Card>
            ))}
          </div>

        </TabsContent>

        {/* --- COMPANIES TAB --- */}
        <TabsContent value="companies" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Powered By Companies</h3>
            <Dialog open={companyOpen} onOpenChange={setCompanyOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setCurrentCompany(null); setCompanyLogoUrl(''); }} className="bg-red-600 hover:bg-red-500">
                  <Plus className="w-4 h-4 mr-2" /> Add Partner
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-neutral-900 border-neutral-800 text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{currentCompany ? 'Edit Partner' : 'Add New Partner'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCompanySave} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input name="name" defaultValue={currentCompany?.name} required className="bg-neutral-950 border-neutral-800" />
                  </div>
                  <div className="space-y-2">
                    <Label>Logo</Label>
                    <ImageUploadField
                      label="Logo"
                      value={companyLogoUrl}
                      onChange={setCompanyLogoUrl}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Website URL</Label>
                    <Input name="website_url" defaultValue={currentCompany?.website_url} className="bg-neutral-950 border-neutral-800" />
                  </div>
                  <div className="space-y-2">
                    <Label>Sort Order</Label>
                    <Input name="display_order" type="number" defaultValue={currentCompany?.display_order || 0} className="bg-neutral-950 border-neutral-800" />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea name="description" defaultValue={currentCompany?.description} className="bg-neutral-950 border-neutral-800" />
                  </div>
                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-500">Save</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {companies.map(company => (
              <Card key={company.id} className="bg-neutral-900 border-neutral-800 text-white">
                 <div className="h-32 flex items-center justify-center bg-neutral-950 p-4 border-b border-neutral-800">
                   {company.logo_url ? (
                     <img src={company.logo_url} alt={company.name} className="max-h-full max-w-full object-contain" />
                   ) : (
                     <Building2 className="w-12 h-12 text-neutral-600" />
                   )}
                 </div>
                 <CardContent className="p-4">
                   <h4 className="font-bold mb-1">{company.name}</h4>
                   <a href={company.website_url} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline mb-2 block truncate">
                     {company.website_url}
                   </a>
                   <div className="flex justify-end gap-2 mt-4">
                     <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-neutral-800" onClick={() => { setCurrentCompany(company); setCompanyLogoUrl(company.logo_url || ''); setCompanyOpen(true); }}>
                       <Edit2 className="w-4 h-4 text-blue-400" />
                     </Button>
                     <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-neutral-800" onClick={() => deleteCompany(company.id)}>
                       <Trash2 className="w-4 h-4 text-red-400" />
                     </Button>
                   </div>
                 </CardContent>
              </Card>
            ))}
          </div>

        </TabsContent>

        {/* --- SOCIAL LINKS TAB --- */}
        <TabsContent value="socials" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Social Media Links</h3>
            <Dialog open={socialOpen} onOpenChange={setSocialOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setCurrentSocial(null)} className="bg-red-600 hover:bg-red-500">
                  <Plus className="w-4 h-4 mr-2" /> Add Link
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
                <DialogHeader>
                  <DialogTitle>{currentSocial ? 'Edit Link' : 'Add New Link'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSocialSave} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Link For</Label>
                    <Select name="entity_type" defaultValue={currentSocial?.entity_type || 'founder'}>
                      <SelectTrigger className="bg-neutral-950 border-neutral-800">
                         <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                        <SelectItem value="founder">Founder</SelectItem>
                        <SelectItem value="foundation">Foundation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Entity Name</Label>
                    <Select name="entity_id" defaultValue={currentSocial?.entity_id}>
                      <SelectTrigger className="bg-neutral-900 border-neutral-800 text-white">
                         <SelectValue placeholder="Select entity" />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                        <SelectItem value={foundationInfo.id || 'temp'}>Foundation: {foundationInfo.name}</SelectItem>
                        {founders.map(f => (
                          <SelectItem key={f.id} value={f.id}>Founder: {f.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Platform</Label>
                    <Select name="platform" defaultValue={currentSocial?.platform || 'facebook'}>
                      <SelectTrigger className="bg-neutral-900 border-neutral-800">
                         <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                        {['facebook', 'twitter', 'linkedin', 'instagram', 'youtube', 'github', 'whatsapp', 'email'].map(p => (
                          <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>URL</Label>
                    <Input name="url" defaultValue={currentSocial?.url} required className="bg-neutral-950 border-neutral-800" />
                  </div>
                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-500">Save Link</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-md border border-neutral-800 overflow-hidden mb-8">
            <table className="w-full text-sm text-left text-neutral-300">
              <thead className="text-xs text-neutral-400 uppercase bg-neutral-900 border-b border-neutral-800">
                <tr>
                  <th className="px-6 py-3">Platform</th>
                  <th className="px-6 py-3">Entity</th>
                  <th className="px-6 py-3">URL</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {socials.map(link => {
                  const entityName = link.entity_type === 'foundation' 
                    ? foundationInfo.name 
                    : founders.find(f => f.id === link.entity_id)?.name || 'Unknown';
                  
                  return (
                    <tr key={link.id} className="bg-neutral-950 border-b border-neutral-900 hover:bg-neutral-900/50">
                      <td className="px-6 py-4 capitalize font-medium text-white">{link.platform}</td>
                      <td className="px-6 py-4">{entityName} <span className="text-xs text-neutral-500 ml-1">({link.entity_type})</span></td>
                      <td className="px-6 py-4 truncate max-w-[200px] text-blue-400">{link.url}</td>
                      <td className="px-6 py-4 text-right">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:bg-neutral-800" onClick={() => deleteSocial(link.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {socials.length === 0 && (
                  <tr><td colSpan="4" className="px-6 py-8 text-center text-neutral-500">No social links added yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>

        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AboutManagement;