import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '@/lib/db';
import { blogPosts as staticPosts } from '@/lib/blogData';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowLeft, Tag, Share2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Breadcrumbs from '@/components/Breadcrumbs';

const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      // 1. Try static first (for the SEO articles)
      const staticPost = staticPosts.find(p => p.slug === slug);
      if (staticPost) {
        setPost({
          ...staticPost,
          is_published: true,
          published_at: staticPost.publishedAt
        });
        setLoading(false);
        return;
      }

      // 2. Try DB
      try {
        const dbPost = await db.blog.getBySlug(slug);
        setPost(dbPost);
      } catch (err) {
        console.error("Failed to load blog post", err);
      } finally {
        setLoading(false);
      }
    };
    loadPost();
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Loading...</div>;
  if (!post) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Post not found</div>;

  // Normalize tags: DB stores as string or JSON array, static posts use arrays
  const tagsArray = (() => {
    if (!post.tags) return [];
    if (Array.isArray(post.tags)) return post.tags;
    try { const parsed = JSON.parse(post.tags); return Array.isArray(parsed) ? parsed : []; }
    catch { return post.tags.split(',').map(t => t.trim()).filter(Boolean); }
  })();

  return (
    <div className="bg-neutral-950 min-h-screen text-white pt-20 pb-12">
      <SEO 
        title={post.seo_title || post.title}
        description={post.seo_description || post.excerpt}
        article={true}
        publishedTime={post.published_at}
        author={post.author || post.author_name}
        image={post.cover_image}
        keywords={tagsArray.join(', ')}
      />
      
      <article className="container px-4 mx-auto max-w-4xl">
        <Breadcrumbs items={[
           { label: 'Home', path: '/' },
           { label: 'Blog', path: '/blog' },
           { label: post.title, path: null } 
        ]} />

        <header className="mb-8 text-center">
           <div className="flex items-center justify-center gap-2 mb-6">
              <span className="px-3 py-1 bg-red-900/20 text-red-500 border border-red-900/30 rounded-full text-xs font-bold uppercase tracking-wider">
                 {post.category || 'Article'}
              </span>
           </div>
           
           <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">{post.title}</h1>
           
           <div className="flex items-center justify-center gap-6 text-sm text-neutral-400 border-b border-neutral-800 pb-8 mb-8">
              <div className="flex items-center gap-2">
                 <User className="w-4 h-4" />
                 {post.author || post.author_name || 'NextBlood Team'}
              </div>
              <div className="flex items-center gap-2">
                 <Calendar className="w-4 h-4" />
                 {formatDate(post.published_at)}
              </div>
           </div>
        </header>

        {post.cover_image && (
           <div className="mb-10 rounded-2xl overflow-hidden shadow-2xl">
              <img src={post.cover_image} alt={post.title} className="w-full h-auto object-cover" />
           </div>
        )}

        <div className="prose prose-invert prose-red max-w-none mb-12">
           <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* Tags */}
        {tagsArray.length > 0 && (
           <div className="flex flex-wrap gap-2 mb-12 pt-6 border-t border-neutral-800">
              {tagsArray.map(tag => (
                 <span key={tag} className="flex items-center gap-1 text-sm bg-neutral-900 px-3 py-1.5 rounded-md text-neutral-400">
                    <Tag className="w-3 h-3" /> {tag}
                 </span>
              ))}
           </div>
        )}

        {/* CTA Box */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center">
           <h3 className="text-2xl font-bold mb-3">Ready to make a difference?</h3>
           <p className="text-neutral-400 mb-6">Join thousands of donors in Bangladesh helping save lives every day.</p>
           <div className="flex justify-center gap-4">
              <Link to="/register">
                 <Button className="bg-red-600 hover:bg-red-700">Register as Donor</Button>
              </Link>
              <Link to="/search">
                 <Button variant="outline" className="border-neutral-700">Find Donors</Button>
              </Link>
           </div>
        </div>
      </article>
    </div>
  );
};

export default BlogPostPage;