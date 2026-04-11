import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Save, Globe, BarChart2, CheckCircle, AlertTriangle, 
  Layout, Type, Image as ImageIcon, Code, RefreshCw, Plus, Trash2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { db } from '@/lib/db';

const SeoManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState('/');
  
  const [formData, setFormData] = useState({
    page_route: '/',
    title: '',
    description: '',
    keywords: '',
    og_image: '',
    schema_markup: '{}'
  });

  // Simulated Keyword Rankings
  const keywordRankings = [
    { keyword: 'Next Blood', position: 1, volume: '1.2K', trend: 'up' },
    { keyword: 'Blood Donor Bangladesh', position: 3, volume: '5.4K', trend: 'up' },
    { keyword: 'Blood Jessore', position: 1, volume: '800', trend: 'stable' },
    { keyword: 'রক্ত লাগবে', position: 5, volume: '12K', trend: 'down' },
    { keyword: 'Innovix Blood', position: 1, volume: '300', trend: 'up' }
  ];

  // Simulated Audit
  const auditItems = [
    { task: 'Meta Description Length', status: 'pass', msg: 'All pages have optimal description length' },
    { task: 'Missing Alt Tags', status: 'fail', msg: '3 images on Homepage missing alt tags' },
    { task: 'H1 Tag Usage', status: 'pass', msg: 'Correct H1 hierarchy detected' },
    { task: 'Mobile Friendliness', status: 'pass', msg: 'Pages are mobile responsive' }
  ];

  useEffect(() => {
    loadSeoData();
  }, []);

  useEffect(() => {
    if (selectedRoute) {
      loadPageData(selectedRoute);
    }
  }, [selectedRoute]);

  const loadSeoData = async () => {
    try {
      const data = await db.seo.getAll();
      setPages(data);
      // Ensure current route is in the list or defaulting to home
      if (data.length > 0 && !data.find(p => p.page_route === selectedRoute)) {
        // Just keep default
      }
    } catch (error) {
      console.error("Failed to load SEO pages:", error);
    }
  };

  const loadPageData = async (route) => {
    setLoading(true);
    try {
      const data = await db.seo.getByRoute(route);
      if (data) {
        setFormData({
          page_route: data.page_route,
          title: data.title || '',
          description: data.description || '',
          keywords: data.keywords ? data.keywords.join(', ') : '',
          og_image: data.og_image || '',
          schema_markup: JSON.stringify(data.schema_markup || {}, null, 2)
        });
      } else {
        // Reset if new route
        setFormData({
          page_route: route,
          title: '',
          description: '',
          keywords: '',
          og_image: '',
          schema_markup: '{}'
        });
      }
    } catch (error) {
      console.error("Error loading page data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Process keywords string to array
      const keywordsArray = formData.keywords.split(',').map(k => k.trim()).filter(k => k);
      
      // Parse JSON Schema
      let schemaJson = {};
      try {
        schemaJson = JSON.parse(formData.schema_markup);
      } catch (e) {
        throw new Error("Invalid JSON in Schema Markup field");
      }

      await db.seo.upsert({
        page_route: formData.page_route,
        title: formData.title,
        description: formData.description,
        keywords: keywordsArray,
        og_image: formData.og_image,
        schema_markup: schemaJson
      });

      toast({
        title: "SEO Updated",
        description: `Settings for ${formData.page_route} have been saved.`,
      });
      
      loadSeoData(); // Refresh list
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">SEO Management</h1>
          <p className="text-neutral-400">Optimize search engine visibility for Next Blood</p>
        </div>
        <Button onClick={() => window.open('/sitemap.xml', '_blank')} variant="outline" className="border-neutral-700">
          View Sitemap
        </Button>
      </div>

      <Tabs defaultValue="editor" className="space-y-4">
        <TabsList className="bg-neutral-900 border border-neutral-800">
          <TabsTrigger value="editor">Page Editor</TabsTrigger>
          <TabsTrigger value="keywords">Keyword Tracker</TabsTrigger>
          <TabsTrigger value="audit">SEO Audit</TabsTrigger>
        </TabsList>

        {/* Page Editor Tab */}
        <TabsContent value="editor" className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Page Selection Sidebar */}
            <Card className="bg-neutral-900 border-neutral-800 lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Select Page</CardTitle>
                <CardDescription>Choose a route to edit meta tags</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Common Routes</Label>
                  <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                    <SelectTrigger className="bg-neutral-950 border-neutral-800">
                      <SelectValue placeholder="Select a page" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-800">
                      <SelectItem value="/">Home Page (/)</SelectItem>
                      <SelectItem value="/about">About Us (/about)</SelectItem>
                      <SelectItem value="/search">Donor Search (/search)</SelectItem>
                      <SelectItem value="/blog">Blog Index (/blog)</SelectItem>
                      <SelectItem value="/register">Registration (/register)</SelectItem>
                      <SelectItem value="/contact">Contact (/contact)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-neutral-800" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-neutral-900 px-2 text-neutral-500">Or Custom Route</span>
                  </div>
                </div>

                <div className="flex gap-2">
                   <Input 
                      placeholder="/custom-page" 
                      className="bg-neutral-950 border-neutral-800"
                      onChange={(e) => setSelectedRoute(e.target.value)}
                   />
                   <Button size="icon" variant="ghost"><Plus className="w-4 h-4" /></Button>
                </div>

                <div className="pt-4">
                   <Label className="text-xs text-neutral-500 mb-2 block">Recently Edited</Label>
                   <div className="space-y-1">
                      {pages.slice(0, 5).map(p => (
                         <div 
                            key={p.id}
                            onClick={() => setSelectedRoute(p.page_route)}
                            className={`text-sm px-3 py-2 rounded-md cursor-pointer flex justify-between items-center ${selectedRoute === p.page_route ? 'bg-red-900/20 text-red-500' : 'hover:bg-neutral-800 text-neutral-400'}`}
                         >
                            <span className="truncate">{p.page_route}</span>
                            <span className="text-xs opacity-50">Edit</span>
                         </div>
                      ))}
                   </div>
                </div>
              </CardContent>
            </Card>

            {/* Editor Form */}
            <Card className="bg-neutral-900 border-neutral-800 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                   <Layout className="w-5 h-5 text-red-500" />
                   Edit Metadata: <span className="text-neutral-400 font-mono text-base">{selectedRoute}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                 <div className="space-y-2">
                    <Label>Meta Title</Label>
                    <div className="relative">
                       <Type className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
                       <Input 
                          name="title" 
                          value={formData.title} 
                          onChange={handleChange} 
                          className="pl-10 bg-neutral-950 border-neutral-800"
                          placeholder="Page Title | Next Blood" 
                       />
                    </div>
                    <p className="text-xs text-neutral-500 text-right">{formData.title.length}/60 chars</p>
                 </div>

                 <div className="space-y-2">
                    <Label>Meta Description</Label>
                    <Textarea 
                       name="description" 
                       value={formData.description} 
                       onChange={handleChange}
                       className="bg-neutral-950 border-neutral-800 min-h-[100px]" 
                       placeholder="A brief summary of the page content..."
                    />
                    <p className="text-xs text-neutral-500 text-right">{formData.description.length}/160 chars</p>
                 </div>

                 <div className="space-y-2">
                    <Label>Keywords (Comma Separated)</Label>
                    <div className="relative">
                       <Search className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
                       <Input 
                          name="keywords" 
                          value={formData.keywords} 
                          onChange={handleChange}
                          className="pl-10 bg-neutral-950 border-neutral-800" 
                          placeholder="blood, donation, dhaka, jessore..."
                       />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                       {['Next Blood', 'Blood Jessore', 'Innovix Blood', 'রক্ত', 'পরবর্তী রক্ত'].map(k => (
                          <span 
                             key={k} 
                             onClick={() => setFormData(p => ({...p, keywords: p.keywords ? `${p.keywords}, ${k}` : k}))}
                             className="text-xs bg-neutral-800 hover:bg-neutral-700 px-2 py-1 rounded cursor-pointer text-neutral-400 border border-neutral-700"
                          >
                             + {k}
                          </span>
                       ))}
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label>OG Image URL</Label>
                       <div className="relative">
                          <ImageIcon className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
                          <Input 
                             name="og_image" 
                             value={formData.og_image} 
                             onChange={handleChange}
                             className="pl-10 bg-neutral-950 border-neutral-800" 
                             placeholder="https://..."
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <Label>Schema Markup (JSON)</Label>
                       <div className="relative">
                          <Code className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
                          <Input 
                             name="schema_markup" 
                             value={formData.schema_markup} 
                             onChange={handleChange}
                             className="pl-10 bg-neutral-950 border-neutral-800 font-mono text-xs" 
                             placeholder="{ ... }"
                          />
                       </div>
                    </div>
                 </div>

                 <div className="pt-4 flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => loadPageData(selectedRoute)}>Reset</Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-red-600 hover:bg-red-700">
                       {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                       Save Changes
                    </Button>
                 </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Keywords Tab */}
        <TabsContent value="keywords">
           <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                 <CardTitle>Keyword Performance</CardTitle>
                 <CardDescription>Track ranking positions for core localized keywords</CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="rounded-md border border-neutral-800 overflow-hidden">
                    <table className="w-full text-sm text-left">
                       <thead className="bg-neutral-950 text-neutral-400 font-medium">
                          <tr>
                             <th className="p-4">Keyword</th>
                             <th className="p-4">Position</th>
                             <th className="p-4">Vol/Month</th>
                             <th className="p-4">Trend</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-neutral-800">
                          {keywordRankings.map((k, i) => (
                             <tr key={i} className="hover:bg-neutral-800/50">
                                <td className="p-4 font-medium text-white">{k.keyword}</td>
                                <td className="p-4">
                                   <span className={`px-2 py-1 rounded text-xs font-bold ${k.position <= 3 ? 'bg-green-500/20 text-green-500' : 'bg-neutral-800 text-neutral-400'}`}>
                                      #{k.position}
                                   </span>
                                </td>
                                <td className="p-4 text-neutral-400">{k.volume}</td>
                                <td className="p-4">
                                   {k.trend === 'up' && <span className="text-green-500 flex items-center gap-1">↑ Rising</span>}
                                   {k.trend === 'down' && <span className="text-red-500 flex items-center gap-1">↓ Falling</span>}
                                   {k.trend === 'stable' && <span className="text-neutral-500 flex items-center gap-1">− Stable</span>}
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </CardContent>
           </Card>
        </TabsContent>

        {/* Audit Tab */}
        <TabsContent value="audit">
           <div className="grid md:grid-cols-2 gap-6">
              {auditItems.map((item, i) => (
                 <Card key={i} className="bg-neutral-900 border-neutral-800">
                    <div className="p-6 flex items-start gap-4">
                       <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center ${item.status === 'pass' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {item.status === 'pass' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                       </div>
                       <div>
                          <h4 className="font-bold text-white mb-1">{item.task}</h4>
                          <p className="text-sm text-neutral-400">{item.msg}</p>
                          {item.status === 'fail' && (
                             <Button size="sm" variant="link" className="text-red-500 p-0 h-auto mt-2">Fix Issue →</Button>
                          )}
                       </div>
                    </div>
                 </Card>
              ))}
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SeoManagement;