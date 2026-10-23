import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';

// Colour themes offered in Dashboard → Hero Slider; any custom colours also work
export const BANNER_THEMES = [
  { name: 'Midnight', bg_color: '#171717', text_color: '#ffffff', accent_color: '#f87171' },
  { name: 'Blood Red', bg_color: '#7f1d1d', text_color: '#ffffff', accent_color: '#fecaca' },
  { name: 'Rose', bg_color: '#9f1239', text_color: '#ffffff', accent_color: '#fecdd3' },
  { name: 'Forest', bg_color: '#4a6b22', text_color: '#ffffff', accent_color: '#ffffff' },
  { name: 'Navy', bg_color: '#1e3a8a', text_color: '#ffffff', accent_color: '#bfdbfe' },
  { name: 'Light', bg_color: '#f5f5f4', text_color: '#171717', accent_color: '#b91c1c' },
];

// Shown until an admin saves their own banners
export const DEFAULT_SUB_BANNERS = [
  {
    id: 'sub-1',
    eyebrow: 'Become a Donor',
    title: 'One Donation Can Save Up To Three Lives',
    description: 'Register in seconds. No account needed.',
    link_label: 'Register Now',
    link_url: '/#register-section',
    image_url: '',
    ...BANNER_THEMES[0],
  },
  {
    id: 'sub-2',
    eyebrow: 'Emergency Request',
    title: 'Need Blood Urgently? Find Donors Near You',
    description: 'Search verified donors across all 64 districts.',
    link_label: 'Find Donors',
    link_url: '/search',
    image_url: '',
    ...BANNER_THEMES[1],
  },
].map(({ name, ...banner }) => banner);

export const useHeroSubBanners = () => {
  const [banners, setBanners] = useState(DEFAULT_SUB_BANNERS);

  useEffect(() => {
    db.heroSubBanners.getAll()
      .then(saved => { if (saved.length) setBanners(saved); })
      .catch(err => console.warn('Failed to load hero sub banners:', err));
  }, []);

  return banners;
};

// Internal routes use the router; hash links and external URLs use a plain anchor
export const BannerLink = ({ to, className, style, children, ...rest }) => {
  if (!to) return <div className={className} style={style} {...rest}>{children}</div>;
  if (/^https?:\/\//.test(to)) {
    return <a href={to} target="_blank" rel="noopener noreferrer" className={className} style={style} {...rest}>{children}</a>;
  }
  if (to.includes('#')) return <a href={to} className={className} style={style} {...rest}>{children}</a>;
  return <Link to={to} className={className} style={style} {...rest}>{children}</Link>;
};

// Text banner beside the hero slider; colours come from the admin panel.
// `preview` renders it inert for the dashboard editor.
const HeroSubBanner = ({ banner, preview = false, className }) => {
  const { eyebrow, title, description, link_label, link_url, image_url, bg_color, text_color, accent_color } = banner;

  return (
    <BannerLink
      to={preview ? null : link_url}
      style={{ backgroundColor: bg_color, color: text_color }}
      className={cn(
        'group relative isolate flex items-center gap-4 overflow-hidden rounded-2xl p-4 sm:p-6 lg:py-5 xl:px-7',
        'border border-white/10 shadow-xl shadow-black/30 transition-transform duration-300',
        !preview && link_url && 'hover:-translate-y-0.5',
        className
      )}
    >
      {/* Soft highlight so flat colours still feel dimensional */}
      <div aria-hidden="true" className="absolute -right-16 -top-16 -z-10 h-48 w-48 rounded-full bg-white/10 blur-3xl transition-opacity duration-500 group-hover:opacity-80" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-br from-white/[0.06] via-transparent to-black/10" />

      <div className="min-w-0 flex-1 space-y-1 sm:space-y-2">
        {eyebrow && (
          <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.25em] opacity-60">{eyebrow}</p>
        )}
        {title && (
          <h3 className="text-base sm:text-xl xl:text-[1.375rem] font-bold leading-snug line-clamp-2">{title}</h3>
        )}
        {description && (
          <p className="text-xs sm:text-sm opacity-75 leading-relaxed line-clamp-1 sm:line-clamp-2">{description}</p>
        )}
        {link_label && (
          <span className="inline-flex items-center gap-1.5 pt-0.5 sm:pt-1 text-sm font-semibold" style={{ color: accent_color }}>
            {link_label}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        )}
      </div>

      {image_url && (
        <img
          src={image_url}
          alt=""
          className="h-12 w-12 sm:h-20 sm:w-20 xl:h-24 xl:w-24 shrink-0 object-contain drop-shadow-lg transition-transform duration-500 group-hover:scale-105"
        />
      )}
    </BannerLink>
  );
};

export default HeroSubBanner;
