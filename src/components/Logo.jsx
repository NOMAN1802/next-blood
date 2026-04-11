import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
 return (
   <Link to="/" className="flex items-center gap-2 group">
     {/* Removed external image logo as requested */}
     <span className="font-black text-white text-lg md:text-xl leading-none tracking-tight">
       NEXT<span className="text-red-500">BLOOD</span>
     </span>
     <span className="text-[10px] text-neutral-400 font-medium tracking-widest hidden sm:block">SAVE LIFE</span>
   </Link>
 );
};

export default Logo;