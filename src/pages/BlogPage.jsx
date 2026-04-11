import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '@/lib/db';
import { blogPosts as staticPosts } from '@/lib/blogData';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Calendar, User, Tag, ArrowRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Breadcrumbs from '@/components/Breadcrumbs';

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const dbPosts = await db.blog.getAll(true);
        // Merge DB posts with our static SEO content, avoiding duplicates if IDs match
        const merged = [...dbPosts];
        
        staticPosts.forEach(staticPost => {
          if (!merged.find(p => p.slug === staticPost.slug)) {
            merged.push({
              ...staticPost,
              is_published: true, // normalize shape
              published_at: staticPost.publishedAt,
              cover_image: null // simplified
            });
          }
        });
        
        setPosts(merged);
      } catch (err) {
        console.error("Failed to load blog posts", err);
        // Fallback to static if DB fails
        setPosts(staticPosts.map(p => ({
            ...p, is_published: true, published_at: p.publishedAt
        })));
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);

  return (
    <div className="bg-neutral-950 min-h-screen text-white pt-20 pb-12">
      <SEO 
        title="Blog & Resources"
        description="Learn about blood donation, health tips, and donor stories in Bangladesh. Essential guides for donors and recipients."
        keywords="blood donation blog, health tips Bangladesh, donor guides, medical awareness"
      />
      
      <div className="container px-4 mx-auto">
        <Breadcrumbs />
        
        <div className="text-center max-w-3xl mx-auto mb-16">
           <h1 className="text-4xl md:text-5xl font-bold mb-6">Knowledge Center</h1>
           <p className="text-xl text-neutral-400">
             Stories that inspire, guides that help, and facts that save lives.
           </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link to={`/blog/${post.slug}`} key={post.id || post.slug} className="group h-full">
               <article className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden hover:border-red-900/50 transition-all h-full flex flex-col shadow-lg hover:shadow-red-900/10 hover:-translate-y-1 duration-300">
                  <div className="aspect-video bg-neutral-800 relative overflow-hidden">
                     {post.cover_image ? (
                        <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-neutral-600">
                           <span className="text-4xl font-bold opacity-20">NextBlood</span>
                        </div>
                     )}
                     <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-neutral-950/80 backdrop-blur text-white text-xs font-bold rounded-full border border-neutral-700">
                           {post.category || 'Article'}
                        </span>
                     </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow">
                     <div className="flex items-center gap-4 text-xs text-neutral-500 mb-4">
                        <div className="flex items-center gap-1">
                           <Calendar className="w-3 h-3" />
                           {formatDate(post.published_at)}
                        </div>
                        <div className="flex items-center gap-1">
                           <User className="w-3 h-3" />
                           {post.author || post.author_name || 'Team'}
                        </div>
                     </div>

                     <h2 className="text-xl font-bold text-white mb-3 group-hover:text-red-500 transition-colors line-clamp-2">
                        {post.title}
                     </h2>
                     
                     <p className="text-neutral-400 text-sm line-clamp-3 mb-6 flex-grow">
                        {post.excerpt || (post.content ? post.content.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...' : '')}
                     </p>
                     
                     <div className="flex items-center text-red-500 text-sm font-bold group-hover:gap-2 transition-all">
                        Read Full Article <ArrowRight className="w-4 h-4 ml-1" />
                     </div>
                  </div>
               </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;