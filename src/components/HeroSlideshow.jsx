import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import { BannerLink } from '@/components/HeroSubBanner';

const INTERVAL_MS = 10000;
const SWIPE_PX = 60;

// Slides for the home page hero, managed from Dashboard → Hero Slider.
// Shared by the main banner and the ambient background so both stay in sync.
export const useHeroSlides = () => {
  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    db.heroSlides.getAll()
      .then(setSlides)
      .catch(err => console.warn('Failed to load hero slides:', err));
  }, []);

  const count = slides.length;
  const active = count ? index % count : 0;

  // Preload the next image so a transition never reveals a half-loaded banner
  useEffect(() => {
    if (count < 2) return;
    const img = new Image();
    img.src = slides[(active + 1) % count].image_url;
  }, [active, slides, count]);

  const step = (d) => {
    setDirection(d);
    setIndex(i => (i + d + count) % count);
  };

  return {
    slides,
    active,
    current: slides[active],
    direction,
    next: () => step(1),
    prev: () => step(-1),
  };
};

export const slideHasText = (slide) => Boolean(slide?.eyebrow || slide?.title || slide?.subtitle || slide?.button_label);

// Soft blurred glow of the current slide behind the whole hero, for colour only,
// faded out at the bottom so the hero blends into the next section
export const HeroAmbient = ({ current }) => (
  <>
  <div aria-hidden="true" className="absolute inset-x-0 bottom-0 z-[1] h-48 bg-gradient-to-t from-neutral-950 to-transparent" />
  <AnimatePresence initial={false}>
    {current && (
      <motion.img
        key={current.id}
        src={current.image_url}
        alt=""
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2 }}
        className="absolute inset-0 w-full h-full object-cover scale-125 blur-3xl"
      />
    )}
  </AnimatePresence>
  </>
);

// One slide's content. Every image fills the 16:9 frame (centre-cropped if
// its ratio differs); slides with text also get a left-side scrim and copy.
export const SlideContent = ({ slide, index = 0 }) => {
  const textColor = slide.text_color || '#ffffff';
  const buttonColor = slide.button_color || '#dc2626';

  if (!slideHasText(slide)) {
    return (
      <>
        <img src={slide.image_url} alt={slide.alt || `Slide ${index + 1}`} draggable={false}
          className="absolute inset-0 w-full h-full object-cover object-center select-none" />
      </>
    );
  }

  return (
    <>
      <img src={slide.image_url} alt={slide.alt || ''} draggable={false}
        className="absolute inset-0 w-full h-full object-cover select-none" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent sm:via-black/35" />
      <div className="relative flex h-full max-w-[90%] sm:max-w-[72%] flex-col justify-center gap-2 sm:gap-3 p-5 sm:p-8 xl:p-10 text-left" style={{ color: textColor }}>
        {slide.eyebrow && (
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] opacity-75">{slide.eyebrow}</p>
        )}
        {slide.title && (
          <h2 className="text-2xl sm:text-4xl xl:text-[2.75rem] font-black leading-[1.05] tracking-tight line-clamp-3">{slide.title}</h2>
        )}
        {slide.subtitle && (
          <p className="text-sm sm:text-base xl:text-lg opacity-85 leading-relaxed line-clamp-2 sm:line-clamp-3">{slide.subtitle}</p>
        )}
        {slide.button_label && (
          <BannerLink
            to={slide.button_link}
            style={{ backgroundColor: buttonColor }}
            className="mt-1 sm:mt-3 inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 sm:px-6 sm:py-3 text-sm font-bold text-white shadow-lg shadow-black/30 transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            {slide.button_label}
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
              <ArrowRight className="h-3 w-3" />
            </span>
          </BannerLink>
        )}
      </div>
    </>
  );
};

const variants = {
  enter: ({ d, reduce }) => ({ opacity: 0, x: reduce ? 0 : `${d * 6}%`, scale: reduce ? 1 : 1.02 }),
  center: { opacity: 1, x: 0, scale: 1 },
  exit: ({ d, reduce }) => ({ opacity: 0, x: reduce ? 0 : `${d * -6}%` }),
};

// Main hero banner. Auto-advances every INTERVAL_MS, paused while hovered;
// arrows and swipe change slides manually.
const HeroSlideshow = ({ slides, active, current, direction, next, prev, className }) => {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const multiple = slides.length > 1;

  // Restarts on every slide change, so a manual change gets a full interval too
  useEffect(() => {
    if (!multiple || hovered) return;
    const id = setTimeout(next, INTERVAL_MS);
    return () => clearTimeout(id);
  }, [active, multiple, hovered]);

  if (!current) return null;
  const custom = { d: direction, reduce };

  const handleDragEnd = (_, { offset, velocity }) => {
    if (offset.x < -SWIPE_PX || velocity.x < -500) next();
    else if (offset.x > SWIPE_PX || velocity.x > 500) prev();
  };

  return (
    <div
      className={cn(
        'group/slider relative overflow-hidden rounded-2xl bg-neutral-900 border border-white/10 shadow-2xl shadow-black/50',
        className
      )}
      role="region"
      aria-roledescription="carousel"
      aria-label="Highlights"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AnimatePresence initial={false} custom={custom}>
        <motion.div
          key={current.id}
          custom={custom}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          drag={multiple ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={handleDragEnd}
          className={cn('absolute inset-0', multiple && 'cursor-grab active:cursor-grabbing')}
        >
          <SlideContent slide={current} index={active} />
        </motion.div>
      </AnimatePresence>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />

      {multiple && (
        <>
          <ArrowButton side="left" onClick={prev} label="Previous slide"><ChevronLeft className="h-5 w-5" /></ArrowButton>
          <ArrowButton side="right" onClick={next} label="Next slide"><ChevronRight className="h-5 w-5" /></ArrowButton>

        </>
      )}
    </div>
  );
};

// Visible on hover for mouse users, always visible on touch screens
const ArrowButton = ({ side, onClick, label, children }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className={cn(
      'absolute top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-10 w-10 items-center justify-center rounded-full',
      'bg-white/15 text-white backdrop-blur-md border border-white/25 shadow-lg shadow-black/20 hover:bg-white/30 transition-all duration-300',
      'opacity-0 group-hover/slider:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100',
      side === 'left' ? 'left-3 xl:left-4' : 'right-3 xl:right-4'
    )}
  >
    {children}
  </button>
);

export default HeroSlideshow;
