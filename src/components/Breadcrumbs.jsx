import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = ({ items }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Default breadcrumb logic if no items provided
  const breadcrumbs = items || [
    { label: 'Home', path: '/' },
    ...pathnames.map((name, index) => {
      const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
      const isLast = index === pathnames.length - 1;
      return {
        label: name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' '),
        path: isLast ? null : routeTo,
      };
    }),
  ];

  // Schema for Breadcrumbs
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.label,
      "item": crumb.path ? `${window.location.origin}${crumb.path}` : undefined
    }))
  };

  return (
    <nav aria-label="Breadcrumb" className="py-4">
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
      <ol className="flex items-center space-x-2 text-sm text-neutral-400">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && <ChevronRight className="w-4 h-4 mx-2 text-neutral-600" />}
              {index === 0 && <Home className="w-4 h-4 mr-2" />}
              
              {crumb.path && !isLast ? (
                <Link 
                  to={crumb.path} 
                  className="hover:text-red-500 transition-colors font-medium"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className={`font-medium ${isLast ? 'text-white' : ''}`}>
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;