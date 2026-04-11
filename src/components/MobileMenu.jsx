
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  X, LogIn, LogOut, LayoutDashboard, Settings, User, 
  Home, Info, FileText, Mail, Search, Heart, AlertCircle, AlertTriangle,
  ChevronDown, ChevronUp, Droplet, Stethoscope, Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { isSuperAdmin } from '@/lib/roleUtils';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const MobileMenu = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { t, language, changeLanguage, languages } = useLanguage();
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  
  const permissions = useRolePermissions();
  const canAccessPage = permissions?.canAccessPage || (() => false);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [setIsOpen]);

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      handleNavigation('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Determine if user has any dashboard access safely
  const userRole = user?.role;
  const showDashboard = user && (isSuperAdmin(userRole) || canAccessPage('/dashboard') || user.isProfileMissing);

  const menuItems = [
    { label: t('nav_home') || 'Home', path: '/', icon: Home, show: true },
    { label: t('nav_about') || 'About', path: '/about', icon: Info, show: true },
    { label: t('nav_blog') || 'Blog', path: '/blog', icon: FileText, show: true },
    { label: t('nav_contact') || 'Contact', path: '/contact', icon: Mail, show: true },
    // Volunteers moved to be a standard link
    { label: 'Volunteers', path: '/volunteers', icon: User, show: true },
  ];

  const serviceItems = [
    { label: 'Blood Services', path: '/blood', icon: Droplet },
    { label: 'Find Doctors', path: '/doctor', icon: Stethoscope },
    { label: 'Find Hospitals', path: '/hospital', icon: Building2 },
  ];

  const toolItems = [
    { label: 'Find Donors', path: '/search', icon: Search, show: true },
    { label: 'Blood Requests', path: '/request', icon: AlertCircle, show: true },
    { label: 'Register as Donor', path: '/register', icon: Heart, show: true },
  ];

  const adminItems = [
    { 
      label: t('nav_dashboard') || 'Dashboard', 
      path: '/dashboard', 
      icon: LayoutDashboard, 
      show: showDashboard 
    },
    { 
      label: 'Settings', 
      path: '/dashboard/settings', 
      icon: Settings, 
      show: !!user && (isSuperAdmin(userRole) || canAccessPage('/dashboard/settings'))
    }
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 z-[9998] transition-opacity duration-300 backdrop-blur-sm",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Sliding Panel */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-[85%] max-w-[320px] bg-white z-[9999] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside menu
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="text-red-600 font-bold text-xl flex items-center gap-2">
            <span className="bg-red-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">NB</span>
            <span className="text-gray-900">Next Blood</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Info (if logged in) */}
        {user && (
          <div className="p-4 bg-gray-50 border-b border-gray-100">
            {user.isProfileMissing && (
               <div className="mb-3 p-2 bg-amber-50 text-amber-600 text-xs rounded border border-amber-200 flex items-start gap-2">
                 <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                 <span>Profile missing. Contact Super Admin.</span>
               </div>
            )}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg border border-red-200">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role || 'User'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
          <nav className="px-3 space-y-1">
            {menuItems.filter(item => item.show).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200",
                    isActive 
                      ? "bg-red-50 text-red-600 font-semibold" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-red-600" : "text-gray-400")} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}

            {/* Service Dropdown */}
            <div className="pt-1">
              <button
                onClick={() => setIsServiceOpen(!isServiceOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center">
                     <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  </div>
                  <span className="text-sm font-medium">Services</span>
                </div>
                {isServiceOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              
              <AnimatePresence>
                {isServiceOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden pl-4 pr-2"
                  >
                    <div className="border-l-2 border-gray-100 pl-2 py-1 space-y-1 my-1">
                      {serviceItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                          <button
                            key={item.path}
                            onClick={() => handleNavigation(item.path)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200",
                              isActive 
                                ? "bg-blue-50 text-blue-600 font-semibold" 
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            )}
                          >
                            <Icon className={cn("w-4 h-4", isActive ? "text-blue-600" : "text-gray-400")} />
                            <span className="text-sm">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="my-2 border-t border-gray-100" />
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider py-2">Tools</p>

            {toolItems.filter(item => item.show).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200",
                    isActive 
                      ? "bg-orange-50 text-orange-600 font-semibold" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-orange-600" : "text-gray-400")} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}

            {showDashboard && (
               <>
                <div className="my-2 border-t border-gray-100" />
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider py-2">Admin</p>
                {adminItems.filter(item => item.show).map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200",
                        isActive 
                          ? "bg-purple-50 text-purple-600 font-semibold" 
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <Icon className={cn("w-5 h-5", isActive ? "text-purple-600" : "text-gray-400")} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  );
                })}
               </>
            )}
          </nav>

          <div className="mt-6 px-6">
            <div className="h-px bg-gray-100 w-full mb-4" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Language
            </p>
            <div className="grid grid-cols-2 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={cn(
                    "flex items-center justify-center gap-2 py-1.5 rounded-lg border text-xs font-medium transition-colors",
                    language === lang.code 
                      ? "bg-red-600 text-white border-red-600" 
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  )}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          {user ? (
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="w-full justify-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-10"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          ) : (
            <Button 
              onClick={() => handleNavigation('/login')}
              className="w-full justify-center gap-2 bg-red-600 hover:bg-red-700 text-white h-10 shadow-lg shadow-red-200"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
