import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const BlogManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await db.blog.getAll(false); // Fetch all, including drafts
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load blog posts." });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this post? This cannot be undone.")) {
      try {
        await db.blog.delete(id);
        toast({ title: "Success", description: "Post deleted successfully." });
        fetchPosts(); // Refresh list
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to delete post." });
      }
    }
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.author_name && post.author_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Blog Management</h2>
          <p className="text-neutral-400">Create, edit, and manage blog content.</p>
        </div>
        <Button onClick={() => navigate('/dashboard/blog/new')} className="bg-red-600 hover:bg-red-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Create New Post
        </Button>
      </div>

      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <Input 
              placeholder="Search posts..." 
              className="pl-9 bg-neutral-950 border-neutral-800 text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-neutral-400 uppercase bg-neutral-950/50 border-b border-neutral-800">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-neutral-500">Loading posts...</td>
                  </tr>
                ) : filteredPosts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-neutral-500">No posts found.</td>
                  </tr>
                ) : (
                  filteredPosts.map((post) => (
                    <tr key={post.id} className="border-b border-neutral-800 hover:bg-neutral-800/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-white max-w-xs truncate">{post.title}</td>
                      <td className="px-6 py-4 text-neutral-300">{post.author_name || 'Unknown'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          post.is_published 
                            ? 'bg-green-900/30 text-green-400 border border-green-900/50' 
                            : 'bg-yellow-900/30 text-yellow-400 border border-yellow-900/50'
                        }`}>
                          {post.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-neutral-400">{formatDate(post.published_at)}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => window.open(`/blog/${post.slug}`, '_blank')}>
                          <Eye className="w-4 h-4 text-blue-400" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/dashboard/blog/edit/${post.id}`)}>
                          <Edit className="w-4 h-4 text-yellow-400" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)}>
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogManagement;