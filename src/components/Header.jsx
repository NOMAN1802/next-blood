
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, ChevronDown, LayoutDashboard, LogOut, LogIn, 
  Info, Mail, FileText, Home, Heart, Stethoscope, Building2, Droplet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { isSuperAdmin } from '@/lib/roleUtils';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import FoundationLogo from '@/components/FoundationLogo'; 
import MobileMenu from './MobileMenu';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { t, language, changeLanguage, languages } = useLanguage();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  const permissions = useRolePermissions();
  const canAccessPage = permissions?.canAccessPage || (() => false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) throw error;
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate('/login');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sign out Failed",
        description: error.message || "Something went wrong",
      });
    }
  };

  const userRole = user?.role;
  const hasAdminAccess = user && (isSuperAdmin(userRole) || canAccessPage('/dashboard'));

  // Desktop Navigation Items
  const desktopLinks = [
    { name: t('nav_home') || 'Home', path: '/', icon: Home },
    { name: t('nav_about') || 'About', path: '/about', icon: Info },
    { name: t('nav_blog') || 'Blog', path: '/blog', icon: FileText },
    { name: t('nav_contact') || 'Contact', path: '/contact', icon: Mail },
  ];

  const currentFlag = languages.find(l => l.code === language)?.flag || '🇧🇩';

  return (
    <>
      <header 
        className={cn(
          "fixed top-0 left-0 w-full z-[40] transition-all duration-300",
          isScrolled 
            ? "bg-neutral-950/95 backdrop-blur-md border-b border-white/10 py-3 shadow-lg" 
            : "bg-transparent py-4"
        )}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 relative z-50">
             <FoundationLogo /> 
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {desktopLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  location.pathname === link.path 
                    ? "text-white bg-white/10" 
                    : "text-neutral-300 hover:text-white hover:bg-white/5"
                )}
              >
                {link.name}
              </Link>
            ))}

            {/* Service Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium hover:bg-white/5 hover:text-white gap-1",
                    ['/blood', '/doctor', '/hospital'].includes(location.pathname) ? "text-white bg-white/10" : "text-neutral-300"
                  )}
                >
                  Service <ChevronDown className="w-3 h-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-neutral-900 border-neutral-800 text-white min-w-[150px]">
                <DropdownMenuItem asChild className="focus:bg-white/10 cursor-pointer">
                  <Link to="/blood" className="flex items-center gap-2 w-full">
                    <Droplet className="w-4 h-4 text-red-500" /> Blood
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-white/10 cursor-pointer">
                  <Link to="/doctor" className="flex items-center gap-2 w-full">
                    <Stethoscope className="w-4 h-4 text-blue-500" /> Doctor
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-white/10 cursor-pointer">
                  <Link to="/hospital" className="flex items-center gap-2 w-full">
                    <Building2 className="w-4 h-4 text-green-500" /> Hospital
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/register">
               <Button 
                 variant="ghost" 
                 className="text-red-500 hover:text-red-400 font-bold hover:bg-red-500/10 ml-2"
               >
                  {t('nav_share_registration') || 'Donate Blood'}
               </Button>
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-neutral-300 hover:text-white gap-1.5 px-2 h-9">
                  <span className="text-lg">{currentFlag}</span>
                  <span className="uppercase text-xs font-bold">{language}</span>
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-800 text-white min-w-[150px] z-[50]">
                {languages.map((lang) => (
                  <DropdownMenuItem 
                    key={lang.code}
                    className={cn(
                      "flex items-center gap-3 cursor-pointer hover:bg-white/10",
                      language === lang.code && "bg-white/10 text-red-400"
                    )}
                    onClick={() => changeLanguage(lang.code)}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

             {user ? (
               <div className="flex items-center gap-2">
                  {(hasAdminAccess || user.isProfileMissing) && (
                    <Link to="/dashboard">
                      <Button size="sm" variant="outline" className="border-neutral-700 bg-neutral-900/50 hover:bg-neutral-800 text-white gap-2 h-9">
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        {t('nav_dashboard') || 'Dashboard'}
                      </Button>
                    </Link>
                  )}
                  <Button size="icon" variant="ghost" onClick={handleLogout} className="text-neutral-400 hover:text-red-400 hover:bg-red-950/20 w-9 h-9">
                     <LogOut className="w-4 h-4" />
                  </Button>
               </div>
             ) : (
               <Link to="/login">
                 <Button size="sm" className="bg-white text-black hover:bg-neutral-200 font-bold gap-2 shadow-lg shadow-white/10 h-9">
                   <LogIn className="w-3.5 h-3.5" />
                   {t('sign_in') || 'Sign In'}
                 </Button>
               </Link>
             )}
          </div>

          <button 
            className="md:hidden flex items-center justify-center w-11 h-11 text-white relative z-50 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        setIsOpen={setIsMobileMenuOpen} 
      />
    </>
  );
};

export default Header;
