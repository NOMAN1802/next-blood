
import React from 'react';
import { Helmet } from 'react-helmet';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { SettingsProvider } from '@/context/SettingsContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute'; 
import Layout from '@/components/Layout';
import AccessDenied from '@/pages/AccessDenied';

// Dashboard Components
import DashboardLayout from '@/pages/dashboard/DashboardLayout';
import DashboardOverview from '@/pages/dashboard/DashboardOverview';
import LoginHistory from '@/pages/dashboard/LoginHistory';
import DonorManagement from '@/pages/dashboard/DonorManagement';
import RequestManagement from '@/pages/dashboard/RequestManagement';
import RaceStationManagement from '@/pages/dashboard/RaceStationManagement'; 
import Settings from '@/pages/dashboard/Settings';
import DonorUpload from '@/pages/dashboard/DonorUpload';
import Analytics from '@/pages/dashboard/Analytics';
import BlogManagement from '@/pages/dashboard/BlogManagement';
import BlogPostForm from '@/pages/dashboard/BlogPostForm';
import SeoManagement from '@/pages/dashboard/SeoManagement';
import AboutManagement from '@/pages/dashboard/AboutManagement';
import VolunteerManagement from '@/pages/dashboard/VolunteerManagement'; 
import PageManagement from '@/pages/dashboard/PageManagement'; 
import SystemHealth from '@/pages/dashboard/SystemHealth'; 
import UserManagement from '@/pages/dashboard/UserManagement';
import RoleManagement from '@/pages/dashboard/RoleManagement';
import VisitorAnalytics from '@/pages/dashboard/VisitorAnalytics';
import DoctorManagement from '@/pages/dashboard/DoctorManagement';
import HospitalManagement from '@/pages/dashboard/HospitalManagement';

// Public Page Components
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import VolunteersPage from '@/pages/VolunteersPage'; 
import VolunteerProfilePage from '@/pages/VolunteerProfilePage'; 
import ContactPage from '@/pages/ContactPage';
import TermsPage from '@/pages/TermsPage';
import PrivacyPage from '@/pages/PrivacyPage';
import FounderPage from '@/pages/FounderPage';
import BlogPage from '@/pages/BlogPage';
import BlogPostPage from '@/pages/BlogPostPage';
import LoginPage from '@/pages/LoginPage';
import DynamicPage from '@/pages/DynamicPage'; 
import SimpleDonorRegistration from '@/components/SimpleDonorRegistration'; 
import BloodRequest from '@/components/BloodRequest';
import DonorSearch from '@/components/DonorSearch';
import RaceStationForm from '@/components/RaceStationForm'; 
import BloodPage from '@/pages/Blood';
import DoctorPage from '@/pages/Doctor';
import HospitalPage from '@/pages/Hospital';
import DoctorProfilePage from '@/pages/DoctorProfile';
import HospitalProfilePage from '@/pages/HospitalProfile';

import { Toaster } from '@/components/ui/toaster';
import { PERMISSIONS } from '@/hooks/useRolePermissions';

const RegistrationWrapper = () => {
  const navigate = useNavigate();
  return <SimpleDonorRegistration onBack={() => navigate('/')} />;
};

const RequestWrapper = () => {
  const navigate = useNavigate();
  return <BloodRequest onBack={() => navigate('/')} />;
};

const SearchWrapper = () => {
  const navigate = useNavigate();
  return <DonorSearch onBack={() => navigate('/')} />;
};

const RaceStationWrapper = () => {
  const navigate = useNavigate();
  return <RaceStationForm onBack={() => navigate('/')} />;
};

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <LanguageProvider>
          <Router>
            <Helmet>
              <title>Innovix Next Blood</title>
              <meta name="description" content="A Smarter Way To Donate Blood" />
              <link rel="icon" href="https://horizons-cdn.hostinger.com/69fc4f7a-00ec-4d23-98f7-c4a90744a2cc/4d4ad041005e283ac95de579b39c14c3.jpg" />
            </Helmet>
            
            <Routes>
              {/* Public Routes */}
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/volunteers" element={<VolunteersPage />} /> 
                <Route path="/volunteer/:id" element={<VolunteerProfilePage />} /> 
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/founder" element={<FounderPage />} />
                <Route path="/access-denied" element={<AccessDenied />} />
                
                {/* Service Pages */}
                <Route path="/blood" element={<BloodPage />} />
                <Route path="/doctor" element={<DoctorPage />} />
                <Route path="/doctor/:id" element={<DoctorProfilePage />} />
                <Route path="/hospital" element={<HospitalPage />} />
                <Route path="/hospital/:id" element={<HospitalProfilePage />} />
                
                <Route path="/p/:slug" element={<DynamicPage />} />

                {/* Unified Login Route */}
                <Route path="/login" element={<LoginPage />} />

                {/* Public Tools - No Auth Required */}
                <Route path="/register" element={<RegistrationWrapper />} />
                <Route path="/request" element={<RequestWrapper />} />
                <Route path="/search" element={<SearchWrapper />} />
                <Route path="/race-stations/register" element={<RaceStationWrapper />} />
              </Route>

              {/* Protected Dashboard Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                {/* Overview - Available to all dashboard users */}
                <Route index element={<DashboardOverview />} />
                
                {/* Analytics & Reports */}
                <Route path="analytics" element={<AdminRoute requiredPermission={PERMISSIONS.VIEW_REPORTS}><Analytics /></AdminRoute>} />
                <Route path="visitor-analytics" element={<AdminRoute requiredPermission={PERMISSIONS.VIEW_REPORTS}><VisitorAnalytics /></AdminRoute>} />
                <Route path="system-health" element={<AdminRoute requiredPermission={PERMISSIONS.ACCESS_ADMIN}><SystemHealth /></AdminRoute>} /> 
                <Route path="login-history" element={<AdminRoute requiredPermission={PERMISSIONS.ACCESS_ADMIN}><LoginHistory /></AdminRoute>} />
                
                {/* User & Role Management */}
                <Route path="donors" element={<AdminRoute requiredPermission={PERMISSIONS.VIEW_DONORS}><DonorManagement /></AdminRoute>} />
                <Route path="upload-donors" element={<AdminRoute requiredPermission={PERMISSIONS.EDIT_DONORS}><DonorUpload /></AdminRoute>} />
                <Route path="users" element={<AdminRoute requiredPermission={PERMISSIONS.MANAGE_USERS}><UserManagement /></AdminRoute>} />
                <Route path="roles" element={<AdminRoute requiredPermission={PERMISSIONS.MANAGE_ROLES}><RoleManagement /></AdminRoute>} />
                
                {/* Content & System */}
                <Route path="requests" element={<AdminRoute requiredPermission={PERMISSIONS.VIEW_REQUESTS}><RequestManagement /></AdminRoute>} />
                <Route path="race-stations" element={<AdminRoute requiredPermission={PERMISSIONS.ACCESS_ADMIN}><RaceStationManagement /></AdminRoute>} />
                
                {/* Doctors & Hospitals Management */}
                <Route path="doctors" element={<AdminRoute requiredPermission={PERMISSIONS.ACCESS_ADMIN}><DoctorManagement /></AdminRoute>} />
                <Route path="hospitals" element={<AdminRoute requiredPermission={PERMISSIONS.ACCESS_ADMIN}><HospitalManagement /></AdminRoute>} />

                {/* Settings */}
                <Route path="settings" element={<AdminRoute requiredPermission={PERMISSIONS.VIEW_SETTINGS}><Settings /></AdminRoute>} />
                
                {/* CMS / Content Management */}
                <Route path="pages" element={<AdminRoute requiredPermission={PERMISSIONS.ACCESS_ADMIN}><PageManagement /></AdminRoute>} />
                <Route path="seo" element={<AdminRoute requiredPermission={PERMISSIONS.ACCESS_ADMIN}><SeoManagement /></AdminRoute>} /> 
                <Route path="about" element={<AdminRoute requiredPermission={PERMISSIONS.ACCESS_ADMIN}><AboutManagement /></AdminRoute>} />
                <Route path="volunteers" element={<AdminRoute requiredPermission={PERMISSIONS.ACCESS_ADMIN}><VolunteerManagement /></AdminRoute>} /> 
                <Route path="blog" element={<AdminRoute requiredPermission={PERMISSIONS.ACCESS_ADMIN}><BlogManagement /></AdminRoute>} />
                <Route path="blog/new" element={<AdminRoute requiredPermission={PERMISSIONS.ACCESS_ADMIN}><BlogPostForm /></AdminRoute>} />
                <Route path="blog/edit/:id" element={<AdminRoute requiredPermission={PERMISSIONS.ACCESS_ADMIN}><BlogPostForm /></AdminRoute>} />
              </Route>
            </Routes>
            
            <Toaster />
          </Router>
        </LanguageProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
