import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { db } from '@/lib/db';
import { Loader2 } from 'lucide-react';

const DynamicPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const data = await db.pages.getBySlug(slug);
        if (!data || (!data.is_published && !localStorage.getItem('admin_preview'))) {
          // Redirect to 404 or home if not found/published
          // For now, just show not found state
          setPage(null);
        } else {
          setPage(data);
        }
      } catch (error) {
        console.error("Page fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-900 text-white">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-neutral-400 mb-8">Page not found.</p>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 pt-20 pb-12">
      <Helmet>
        <title>{page.title} | Innovix Next Blood</title>
        <meta name="description" content={page.meta_description || page.title} />
      </Helmet>

      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">{page.title}</h1>
        
        <div 
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  );
};

export default DynamicPage;