import React, { useState, useEffect } from 'react';
import { 
    Save, Lock, Mail, MessageSquare, Shield, Globe, 
    Type, Image as ImageIcon, Plus, Trash2, Edit2, 
    RefreshCw, LayoutTemplate, Database, Users, Key
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { isStrictSuperAdmin } from '@/lib/roleUtils';
import { db } from '@/lib/db';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import UserManagement from '@/pages/dashboard/UserManagement';
import RoleManagement from '@/pages/dashboard/RoleManagement';
import ProtectedFeature from '@/components/ProtectedFeature';
import { useRolePermissions } from '@/hooks/useRolePermissions';

const Settings = () => {
    const { toast } = useToast();
    const { user } = useAuth();
    const { PERMISSIONS } = useRolePermissions();
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState([]);
    const [newSettingOpen, setNewSettingOpen] = useState(false);
    
    // New Setting Form Data
    const [newSetting, setNewSetting] = useState({
        category: 'general',
        key: '',
        value: '',
        description: '',
        type: 'text'
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const data = await db.settings.getAll();
            setSettings(data || []);
        } catch (error) {
            console.error("Error loading settings:", error);
            toast({ variant: 'destructive', title: "Error", description: "Failed to load system settings." });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (key, newValue) => {
        try {
            // Optimistic update
            setSettings(prev => prev.map(s => s.key === key ? { ...s, value: newValue } : s));
            
            await db.settings.update(key, newValue);
            toast({ title: "Saved", description: "Setting updated successfully." });
        } catch (error) {
            toast({ variant: 'destructive', title: "Error", description: "Failed to save setting." });
            fetchSettings(); // Revert on error
        }
    };

    const handleCreate = async () => {
        try {
            if (!newSetting.key || !newSetting.category) {
                 toast({ variant: 'destructive', title: "Validation Error", description: "Key and Category are required." });
                 return;
            }

            await db.settings.create(newSetting);
            setNewSettingOpen(false);
            setNewSetting({ category: 'general', key: '', value: '', description: '', type: 'text' });
            fetchSettings();
            toast({ title: "Created", description: "New system setting added." });
        } catch (error) {
            toast({ variant: 'destructive', title: "Error", description: error.message });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This effectively removes this configuration from the system.")) return;
        try {
            await db.settings.delete(id);
            setSettings(prev => prev.filter(s => s.id !== id));
            toast({ title: "Deleted", description: "Setting removed." });
        } catch (error) {
            toast({ variant: 'destructive', title: "Error", description: "Failed to delete setting." });
        }
    };

    // Helper to render input based on type
    const renderInput = (setting) => {
        if (setting.type === 'boolean') {
            return (
                <Switch 
                    checked={setting.value === 'true'}
                    onCheckedChange={(checked) => handleUpdate(setting.key, String(checked))}
                />
            );
        }
        if (setting.type === 'textarea') {
            return (
                <Textarea 
                    value={setting.value || ''}
                    onChange={(e) => setSettings(prev => prev.map(s => s.key === setting.key ? { ...s, value: e.target.value } : s))}
                    onBlur={(e) => handleUpdate(setting.key, e.target.value)}
                    className="bg-neutral-950 border-neutral-800 min-h-[100px]"
                />
            );
        }
        return (
            <Input 
                value={setting.value || ''}
                onChange={(e) => setSettings(prev => prev.map(s => s.key === setting.key ? { ...s, value: e.target.value } : s))}
                onBlur={(e) => handleUpdate(setting.key, e.target.value)}
                className="bg-neutral-950 border-neutral-800"
            />
        );
    };

    // Group settings by category
    const groupedSettings = settings.reduce((acc, curr) => {
        const cat = curr.category || 'general';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(curr);
        return acc;
    }, {});

    const CATEGORIES = ['general', 'header', 'footer', 'contact', 'social', 'features', 'security', 'notification'];

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">System Control Panel</h2>
                    <p className="text-neutral-400">Manage global configurations, content, and system variables.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={fetchSettings} className="border-neutral-800 text-neutral-300">
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Sync
                    </Button>
                    <Dialog open={newSettingOpen} onOpenChange={setNewSettingOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-red-600 hover:bg-red-700 text-white">
                                <Plus className="w-4 h-4 mr-2" /> Add Variable
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
                            <DialogHeader>
                                <DialogTitle>Add System Variable</DialogTitle>
                                <DialogDescription>Create a new dynamic setting key for the system.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <Select 
                                            value={newSetting.category} 
                                            onValueChange={(val) => setNewSetting({...newSetting, category: val})}
                                        >
                                            <SelectTrigger className="bg-neutral-950 border-neutral-800">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                                                {CATEGORIES.map(c => (
                                                    <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Type</Label>
                                        <Select 
                                            value={newSetting.type} 
                                            onValueChange={(val) => setNewSetting({...newSetting, type: val})}
                                        >
                                            <SelectTrigger className="bg-neutral-950 border-neutral-800">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                                                <SelectItem value="text">Text (String)</SelectItem>
                                                <SelectItem value="textarea">Long Text</SelectItem>
                                                <SelectItem value="boolean">Boolean (Switch)</SelectItem>
                                                <SelectItem value="image">Image URL</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Key Name (snake_case)</Label>
                                    <Input 
                                        value={newSetting.key}
                                        onChange={(e) => setNewSetting({...newSetting, key: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
                                        placeholder="e.g. site_tagline"
                                        className="bg-neutral-950 border-neutral-800 font-mono"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Initial Value</Label>
                                    <Input 
                                        value={newSetting.value}
                                        onChange={(e) => setNewSetting({...newSetting, value: e.target.value})}
                                        className="bg-neutral-950 border-neutral-800"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input 
                                        value={newSetting.description}
                                        onChange={(e) => setNewSetting({...newSetting, description: e.target.value})}
                                        placeholder="What does this control?"
                                        className="bg-neutral-950 border-neutral-800"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreate} className="bg-red-600 hover:bg-red-700">Create Variable</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="bg-neutral-900 border border-neutral-800 w-full justify-start h-auto flex-wrap gap-2 p-2">
                    <TabsTrigger value="general" className="data-[state=active]:bg-red-600 flex gap-2"><LayoutTemplate className="w-4 h-4" /> General Settings</TabsTrigger>
                    
                    <ProtectedFeature requiredPermission={PERMISSIONS.MANAGE_USERS} showError={false}>
                        <TabsTrigger value="users" className="data-[state=active]:bg-red-600 flex gap-2"><Users className="w-4 h-4" /> User Management</TabsTrigger>
                    </ProtectedFeature>

                    <ProtectedFeature requiredRole="super_admin" showError={false}>
                        <TabsTrigger value="roles" className="data-[state=active]:bg-red-600 flex gap-2"><Key className="w-4 h-4" /> Role Management</TabsTrigger>
                    </ProtectedFeature>

                    <TabsTrigger value="database" className="data-[state=active]:bg-red-600 flex gap-2"><Database className="w-4 h-4" /> Backup & Data</TabsTrigger>
                </TabsList>

                {/* General Settings Tab (Groups categories) */}
                <TabsContent value="general" className="space-y-6">
                   <div className="grid gap-6">
                       {Object.keys(groupedSettings).map(category => (
                         <div key={category} className="space-y-4">
                            <h3 className="text-lg font-semibold text-white capitalize flex items-center gap-2">
                               {category === 'security' && <Shield className="w-4 h-4" />}
                               {category === 'notification' && <MessageSquare className="w-4 h-4" />}
                               {category} Configs
                            </h3>
                            <div className="grid gap-4">
                                {groupedSettings[category].map(setting => (
                                    <Card key={setting.id} className="bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-colors">
                                        <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold text-white text-base capitalize">{setting.key.replace(/_/g, ' ')}</h4>
                                                    <span className="text-[10px] bg-neutral-800 text-neutral-500 px-1.5 py-0.5 rounded font-mono">{setting.type}</span>
                                                </div>
                                                <p className="text-sm text-neutral-400">{setting.description || 'No description provided.'}</p>
                                            </div>
                                            <div className="flex-1 w-full md:w-auto">
                                                {renderInput(setting)}
                                            </div>
                                            <Button 
                                                size="icon" 
                                                variant="ghost" 
                                                onClick={() => handleDelete(setting.id)}
                                                className="text-neutral-600 hover:text-red-500 hover:bg-neutral-950"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                         </div>
                       ))}
                   </div>
                </TabsContent>

                <TabsContent value="users">
                    <ProtectedFeature requiredPermission={PERMISSIONS.MANAGE_USERS}>
                        <UserManagement />
                    </ProtectedFeature>
                </TabsContent>

                <TabsContent value="roles">
                    <ProtectedFeature requiredRole="super_admin">
                        <RoleManagement />
                    </ProtectedFeature>
                </TabsContent>

                {/* Database Tab */}
                <TabsContent value="database">
                    <Card className="bg-neutral-900 border-neutral-800">
                        <CardHeader>
                            <CardTitle className="text-white">System Data & Backup</CardTitle>
                            <CardDescription>Manage database backups and system restoration points.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {isStrictSuperAdmin(user?.role) && (
                              <div className="flex items-center justify-between p-4 bg-neutral-950 rounded-lg border border-neutral-800">
                                  <div>
                                      <h4 className="text-white font-medium">Export System Data (JSON)</h4>
                                      <p className="text-sm text-neutral-500">Download a full copy of settings and content configuration.</p>
                                  </div>
                                  <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">
                                      Download JSON
                                  </Button>
                              </div>
                            )}
                             <div className="flex items-center justify-between p-4 bg-neutral-950 rounded-lg border border-neutral-800">
                                <div>
                                    <h4 className="text-white font-medium">Clear All Caches</h4>
                                    <p className="text-sm text-neutral-500">Force refresh of all static content and CDN caches.</p>
                                </div>
                                <Button variant="outline" className="border-neutral-700 text-yellow-500 hover:text-yellow-400 hover:bg-neutral-800">
                                    Purge Cache
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Settings;