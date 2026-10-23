
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Heart, FileText, Settings, LogOut, 
  Menu, X, History, Calendar, BarChart2, Globe, Info, 
  UserCheck, ShieldCheck, File, AlertTriangle, Activity, UploadCloud, Eye,
  Stethoscope, Building2, Images
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useRolePermissions, PERMISSIONS } from '@/hooks/useRolePermissions';
import { isSuperAdmin } from '@/lib/roleUtils';
import FoundationLogo from '@/components/FoundationLogo';
import { Skeleton } from '@/components/ui/skeleton';

const DashboardLayout = () => {
  // Default to false so mobile menu is closed by default. 
  // On desktop, lg:translate-x-0 ensures it's always visible regardless of this state.
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut, user, loading: authLoading, isLoadingRole, roleError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { hasPermission, loading: permissionsLoading } = useRolePermissions();

  const handleLogout = async () => {
    setSidebarOpen(false);
    await signOut();
    navigate('/login');
  };

  // DEFINITION OF ALL MENU ITEMS
  const allNavItems = [
    { 
      label: "Dashboard", 
      path: '/dashboard',
      icon: LayoutDashboard, 
      permission: null 
    },
    { 
      label: "Visitor Analytics", 
      path: '/dashboard/visitor-analytics',
      icon: Eye, 
      permission: PERMISSIONS.VIEW_REPORTS
    },
    { 
      label: "Geospatial Analytics", 
      path: '/dashboard/analytics',
      icon: BarChart2, 
      permission: PERMISSIONS.VIEW_REPORTS
    },
    { 
      label: "Donor Management", 
      path: '/dashboard/donors',
      icon: Users, 
      permission: PERMISSIONS.VIEW_DONORS
    },
    { 
      label: "Doctor Mgmt", 
      path: '/dashboard/doctors',
      icon: Stethoscope, 
      permission: PERMISSIONS.ACCESS_ADMIN
    },
    { 
      label: "Hospital Mgmt", 
      path: '/dashboard/hospitals',
      icon: Building2, 
      permission: PERMISSIONS.ACCESS_ADMIN
    },
    { 
      label: "Donor Upload", 
      path: '/dashboard/upload-donors', 
      icon: UploadCloud, 
      permission: PERMISSIONS.EDIT_DONORS
    },
    { 
      label: "Blood Requests", 
      path: '/dashboard/requests',
      icon: Heart, 
      permission: PERMISSIONS.VIEW_REQUESTS
    },
    { 
      label: "User Management", 
      path: '/dashboard/users',
      icon: UserCheck, 
      permission: PERMISSIONS.MANAGE_USERS
    },
    { 
      label: "Role Management", 
      path: '/dashboard/roles',
      icon: ShieldCheck, 
      permission: PERMISSIONS.MANAGE_ROLES
    },
    { 
      label: "Settings", 
      path: '/dashboard/settings', 
      icon: Settings, 
      permission: PERMISSIONS.VIEW_SETTINGS
    },
    { 
      label: "Blog Management", 
      path: '/dashboard/blog',
      icon: FileText, 
      permission: PERMISSIONS.ACCESS_ADMIN
    },
    {
      label: "Hero Section",
      path: '/dashboard/hero-slider',
      icon: Images,
      permission: PERMISSIONS.ACCESS_ADMIN
    },
    {
      label: "SEO Management",
      path: '/dashboard/seo',
      icon: Globe, 
      permission: PERMISSIONS.ACCESS_ADMIN
    },
    { 
      label: "About Management", 
      path: '/dashboard/about',
      icon: Info, 
      permission: PERMISSIONS.ACCESS_ADMIN
    },
    { 
      label: "Volunteer Mgmt", 
      path: '/dashboard/volunteers',
      icon: UserCheck, 
      permission: PERMISSIONS.ACCESS_ADMIN
    },
    { 
      label: "Page Management", 
      path: '/dashboard/pages',
      icon: File, 
      permission: PERMISSIONS.ACCESS_ADMIN
    },
    { 
      label: "System Health", 
      path: '/dashboard/system-health',
      icon: Activity, 
      permission: PERMISSIONS.ACCESS_ADMIN
    },
    { 
      label: "Login History", 
      path: '/dashboard/login-history',
      icon: History, 
      permission: PERMISSIONS.ACCESS_ADMIN
    },
    { 
      label: "Race Stations", 
      path: '/dashboard/race-stations',
      icon: Calendar, 
      permission: PERMISSIONS.ACCESS_ADMIN
    }
  ];

  const navItems = allNavItems.filter(item => {
    if (isLoadingRole || permissionsLoading) return false;
    if (user && isSuperAdmin(user.role)) return true;
    if (user?.isProfileMissing) {
       return item.path === '/dashboard';
    }
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-neutral-400">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex text-white font-sans">
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-neutral-900 border-r border-neutral-800 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-20 flex items-center justify-center border-b border-neutral-800 px-4">
           <FoundationLogo />
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-5rem)] custom-scrollbar">
          {(isLoadingRole || permissionsLoading) ? (
             Array(6).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl animate-pulse">
                   <Skeleton className="w-5 h-5 rounded-md bg-neutral-800" />
                   <Skeleton className="h-4 bg-neutral-800 rounded w-32" />
                </div>
             ))
          ) : roleError ? (
             <div className="px-4 py-8 text-center bg-red-950/20 rounded-xl border border-red-900/50">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-xs text-red-400">Error loading menu</p>
                <p className="text-[10px] text-neutral-500 mt-1">{roleError}</p>
             </div>
          ) : (
             <>
               {navItems.map((item) => (
                 <NavLink
                   key={item.path}
                   to={item.path}
                   onClick={() => setSidebarOpen(false)}
                   end={item.path === '/dashboard'}
                   className={({ isActive }) => `
                     flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group/item
                     ${isActive 
                       ? 'bg-red-600 text-white shadow-lg shadow-red-900/20 font-medium' 
                       : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                     }
                   `}
                 >
                   <item.icon className={`w-5 h-5 flex-shrink-0`} />
                   <span className="whitespace-nowrap text-sm truncate">
                     {item.label}
                   </span>
                 </NavLink>
               ))}
               
               <div className="pt-6 mt-6 border-t border-neutral-800">
                 <button
                   onClick={handleLogout}
                   className={`
                     w-full flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:bg-red-900/20 hover:text-red-400 transition-all duration-200
                   `}
                 >
                   <LogOut className="w-5 h-5 flex-shrink-0" />
                   <span className="whitespace-nowrap text-sm">
                     {t('dash_logout') || 'Sign Out'}
                   </span>
                 </button>
               </div>
             </>
          )}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-neutral-900/50 backdrop-blur-md border-b border-neutral-800 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-white hover:bg-neutral-800"
            >
              {sidebarOpen ? <X /> : <Menu />}
            </Button>
            <h1 className="text-xl font-bold text-white hidden sm:block">
              {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-neutral-800 rounded-full border border-neutral-700">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium text-neutral-300">System Online</span>
             </div>
             
             <div className="h-8 w-8 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-red-900/20 border border-white/10 overflow-hidden">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{(user?.email || 'A')[0].toUpperCase()}</span>
                )}
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
          
          {user?.isProfileMissing && (
             <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/50 rounded-lg flex items-center gap-3 text-amber-500 animate-in fade-in slide-in-from-top-4">
                <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                <div>
                   <h3 className="font-bold">Admin profile not found</h3>
                   <p className="text-sm opacity-90">
                     Admin profile not found for this account. Contact SUPER ADMIN or use the setup form below to link your user record.
                     Most administrative features are disabled until your account is properly configured.
                   </p>
                </div>
             </div>
          )}

          {(isLoadingRole || permissionsLoading) ? (
             <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-neutral-400">Loading Dashboard...</p>
             </div>
          ) : roleError ? (
             <div className="max-w-md mx-auto mt-20 bg-neutral-900 border border-red-900/50 rounded-xl p-6 text-center">
                <ShieldCheck className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Access Error</h2>
                <p className="text-neutral-400 mb-6">
                  Unable to verify your permissions. Please try logging in again.
                </p>
                <div className="bg-red-950/30 text-red-400 text-xs font-mono p-2 rounded mb-4 break-words">
                   {roleError}
                </div>
                <div className="flex justify-center gap-2">
                   <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
                   <Button onClick={handleLogout} variant="destructive">Logout</Button>
                </div>
             </div>
          ) : (
             <div className="max-w-7xl mx-auto">
                <Outlet />
             </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
