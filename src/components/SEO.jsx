import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';
import { db } from '@/lib/db';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  image, 
  article = false,
  publishedTime,
  modifiedTime,
  author,
  section,
  schema
}) => {
  const location = useLocation();
  const siteUrl = window.location.origin;
  const currentUrl = `${siteUrl}${location.pathname}`;
  
  // Default fallback values
  const defaultImage = `${siteUrl}/logo.svg`;
  const defaultTitle = "Find Blood Donors in Bangladesh | রক্তদাতা খুঁজুন | Next Blood BD";
  const defaultDescription = "Find verified blood donors across all 64 districts of Bangladesh, instantly. Search by blood group & location. Register as a donor in seconds. No account needed. | রক্তদাতা খুঁজুন বাংলাদেশে।";
  
  // Comprehensive list of localized and brand keywords
  const defaultKeywords = [
    "Next Blood", "Blood Jessore", "Innovix Blood", "Blood Jashore", 
    "رक्त", "পরবর্তী রক্ত", "রক্তলাগবে", 
    "blood donation Bangladesh", "blood donor Bangladesh", 
    "emergency blood donor", "find blood donor online"
  ];

  const [meta, setMeta] = useState({
    title: title || defaultTitle,
    description: description || defaultDescription,
    keywords: keywords ? (Array.isArray(keywords) ? keywords : keywords.split(',')) : defaultKeywords,
    image: image || defaultImage,
    schema: schema
  });

  // Fetch dynamic SEO data from DB
  useEffect(() => {
    const fetchSeoData = async () => {
      try {
        const data = await db.seo.getByRoute(location.pathname);
        if (data) {
          setMeta(prev => ({
            title: title || data.title || prev.title,
            description: description || data.description || prev.description,
            keywords: data.keywords && data.keywords.length > 0 ? data.keywords : prev.keywords,
            image: image || data.og_image || prev.image,
            schema: schema || data.schema_markup || prev.schema
          }));
        }
      } catch (error) {
        console.warn("Failed to fetch dynamic SEO data:", error);
      }
    };

    fetchSeoData();
  }, [location.pathname, title, description, keywords, image, schema]);

  const fullTitle = meta.title.includes('|') ? meta.title : `${meta.title} | Next Blood`;
  const fullKeywords = Array.isArray(meta.keywords) ? meta.keywords.join(', ') : meta.keywords;

  // Default Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Next Blood",
    "alternateName": ["Innovix Blood", "NextBlood", "পরবর্তী রক্ত"],
    "url": siteUrl,
    "logo": defaultImage,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+880-123-456-7890",
      "contactType": "emergency",
      "areaServed": "BD",
      "availableLanguage": ["en", "bn"]
    },
    "sameAs": [
      "https://www.facebook.com/nextblood",
      "https://twitter.com/nextblood"
    ]
  };

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={meta.description} />
      <meta name="keywords" content={fullKeywords} />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content={article ? "article" : "website"} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={meta.image} />
      <meta property="og:site_name" content="Next Blood" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content="@nextblood" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={meta.image} />

      {/* Article Specific Meta */}
      {article && publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {article && modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {article && author && <meta property="article:author" content={author} />}
      {article && section && <meta property="article:section" content={section} />}

      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify(meta.schema || organizationSchema)}
      </script>
    </Helmet>
  );
};

export default SEO;