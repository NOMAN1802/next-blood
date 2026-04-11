import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  Users, 
  ShieldCheck, 
  Clock, 
  Siren, 
  Activity 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';

const MarketingSlideshow = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const slides = [
    {
      id: 1,
      title: t('slide_1_title'),
      description: t('slide_1_desc'),
      icon: Siren,
      cta: t('slide_1_cta'),
      link: "/search",
      gradient: "bg-gradient-to-br from-red-600 via-red-800 to-rose-950",
      accentColor: "text-red-200"
    },
    {
      id: 2,
      title: t('slide_2_title'),
      description: t('slide_2_desc'),
      icon: Users,
      cta: t('slide_2_cta'),
      link: "/register",
      gradient: "bg-gradient-to-br from-orange-600 via-red-700 to-red-900",
      accentColor: "text-orange-200"
    },
    {
      id: 3,
      title: t('slide_3_title'),
      description: t('slide_3_desc'),
      icon: ShieldCheck,
      cta: t('slide_3_cta'),
      link: "/about",
      gradient: "bg-gradient-to-br from-blue-600 via-indigo-800 to-indigo-950",
      accentColor: "text-blue-200"
    },
    {
      id: 4,
      title: t('slide_4_title'),
      description: t('slide_4_desc'),
      icon: Clock,
      cta: t('slide_4_cta'),
      link: "/register",
      gradient: "bg-gradient-to-br from-emerald-600 via-teal-800 to-teal-950",
      accentColor: "text-emerald-200"
    },
    {
      id: 5,
      title: t('slide_5_title'),
      description: t('slide_5_desc'),
      icon: Activity,
      cta: t('slide_5_cta'),
      link: "/request",
      gradient: "bg-gradient-to-br from-violet-600 via-purple-800 to-purple-950",
      accentColor: "text-violet-200"
    },
    {
      id: 6,
      title: t('slide_6_title'),
      description: t('slide_6_desc'),
      icon: Heart,
      cta: t('slide_6_cta'),
      link: "/about",
      gradient: "bg-gradient-to-br from-pink-600 via-rose-700 to-rose-900",
      accentColor: "text-pink-200"
    }
  ];

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95
    })
  };

  const currentSlide = slides[currentIndex];
  const Icon = currentSlide.icon;

  return (
    <div className="w-full bg-neutral-950 py-12 md:py-20 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div 
          className="relative h-[550px] md:h-[400px] w-full rounded-3xl overflow-hidden shadow-2xl border border-white/5 ring-1 ring-white/10 group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.4 }
              }}
              className={`absolute inset-0 w-full h-full ${currentSlide.gradient} flex items-center`}
            >
              {/* Animated Background Elements */}
              <motion.div 
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" 
              />
              <motion.div 
                animate={{ rotate: -360, scale: [1, 1.1, 1] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" 
              />

              <div className="w-full h-full flex flex-col md:flex-row items-center justify-between px-8 md:px-20 relative z-10 gap-8 md:gap-16">
                
                {/* Text Content */}
                <div className="flex-1 text-center md:text-left pt-12 md:pt-0 max-w-xl">
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 shadow-lg ${currentSlide.accentColor}`}>
                      <Icon size={16} className="animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-widest">Featured Story</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-4 md:mb-6 leading-tight drop-shadow-md">
                      {currentSlide.title}
                    </h2>
                    <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed font-light">
                      {currentSlide.description}
                    </p>
                    <Button 
                      onClick={() => navigate(currentSlide.link)}
                      className="bg-white text-neutral-900 hover:bg-neutral-100 font-bold px-8 py-6 rounded-full transition-all hover:scale-105 shadow-xl hover:shadow-2xl group/btn text-lg"
                    >
                      {currentSlide.cta}
                      <ArrowRight className="ml-2 w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                </div>

                {/* Icon/Visual Side */}
                <div className="hidden md:flex flex-1 justify-center items-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0, rotateY: 30 }}
                    animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
                    className="relative"
                    style={{ perspective: 1000 }}
                  >
                    <div className="absolute inset-0 bg-white/20 blur-[60px] rounded-full animate-pulse" />
                    <Icon size={220} className="text-white drop-shadow-2xl relative z-10 opacity-95 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" strokeWidth={1} />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="absolute inset-0 flex items-center justify-between px-2 md:px-6 pointer-events-none">
            <button
              onClick={handlePrev}
              className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center backdrop-blur-md transition-all pointer-events-auto border border-white/10 hover:scale-110 active:scale-95 group/arrow"
            >
              <ChevronLeft size={24} className="group-hover/arrow:-translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={handleNext}
              className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center backdrop-blur-md transition-all pointer-events-auto border border-white/10 hover:scale-110 active:scale-95 group/arrow"
            >
              <ChevronRight size={24} className="group-hover/arrow:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Dots */}
          <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm border border-white/5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                }}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentIndex 
                    ? 'w-8 h-2 bg-white shadow-glow' 
                    : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingSlideshow;