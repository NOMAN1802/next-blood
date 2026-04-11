import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ActionButton3D = ({ label, icon, onClick, variant = 'primary' }) => {
  const [isHovered, setIsHovered] = useState(false);

  const colors = {
    primary: {
      top: 'bg-red-500',
      side: 'bg-red-700',
      hover: 'bg-red-400'
    },
    secondary: {
      top: 'bg-neutral-100',
      side: 'bg-neutral-300',
      hover: 'bg-white'
    }
  };

  const textColor = variant === 'primary' ? 'text-white' : 'text-neutral-900';

  return (
    <motion.button
      className="relative cursor-pointer select-none outline-none tap-highlight-transparent w-full md:w-auto min-w-[200px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative w-full h-14 md:h-auto" style={{ perspective: '1000px' }}>
        <motion.div
          animate={{
            rotateX: isHovered ? -5 : 0,
            y: isHovered ? -4 : 0
          }}
          transition={{ duration: 0.3 }}
          className="relative w-full h-full"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Top Face */}
          <div
            className={`${isHovered ? colors[variant].hover : colors[variant].top} ${textColor} w-full h-full px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl transition-colors duration-300 border-b-4 border-black/10`}
            style={{ transform: 'translateZ(0px)' }}
          >
            {icon}
            <span>{label}</span>
          </div>

          {/* Side/Bottom Depth Effect (Pseudo-3D) */}
          <div
            className={`absolute top-2 left-0 w-full h-full ${colors[variant].side} rounded-xl -z-10`}
            style={{ transform: 'translateY(4px)' }}
          />
        </motion.div>
      </div>
    </motion.button>
  );
};

export default ActionButton3D;