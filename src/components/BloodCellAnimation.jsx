import React, { useEffect, useState } from 'react';

const BloodCellAnimation = () => {
  const [isMobile, setIsMobile] = useState(true); // Default to true to prevent flash
  
  useEffect(() => {
    // Check if mobile device properly on mount
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    // Static CSS-only version for mobile - extremely lightweight
    // This prevents the "blank screen" caused by heavy canvas operations on mobile
    return (
      <div className="absolute inset-0 bg-neutral-950 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-32 h-32 rounded-full bg-red-600/5 blur-3xl" />
        <div className="absolute bottom-[20%] right-[10%] w-48 h-48 rounded-full bg-red-900/5 blur-3xl" />
        <div className="absolute top-[40%] right-[30%] w-24 h-24 rounded-full bg-rose-600/5 blur-2xl" />
      </div>
    );
  }

  // Desktop Animation
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none bg-neutral-950">
       {/* Floating Cells using CSS only - safer than Canvas */}
       {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20 animate-float"
            style={{
               background: `radial-gradient(circle at 30% 30%, rgba(220, 38, 38, 0.4), rgba(153, 27, 27, 0.8))`,
               width: `${Math.random() * 40 + 10}px`,
               height: `${Math.random() * 40 + 10}px`,
               left: `${Math.random() * 100}%`,
               top: `${Math.random() * 100}%`,
               animationDuration: `${Math.random() * 15 + 15}s`,
               animationDelay: `${Math.random() * 5}s`,
               filter: 'blur(1px)',
               willChange: 'transform', // Performance optimization
            }}
          />
       ))}
    </div>
  );
};

export default BloodCellAnimation;