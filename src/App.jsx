import React, { Suspense, lazy } from 'react';
import { Helmet } from 'react-helmet';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { SettingsProvider } from '@/context/SettingsContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';
import Layout from '@/components/Layout';
import { Toaster } from '@/components/ui/toaster';
import { PERMISSIONS } from '@/hooks/useRolePermissions';

// ── Eager (small, always needed) ──────────────────────────────────────────────
import AccessDenied from '@/pages/AccessDenied';
import LoginPage from '@/pages/LoginPage';

// ── Public pages (lazy) ───────────────────────────────────────────────────────
const HomePage           = lazy(() => import('@/pages/HomePage'));
const AboutPage          = lazy(() => import('@/pages/AboutPage'));
const VolunteersPage     = lazy(() => import('@/pages/VolunteersPage'));
const VolunteerProfilePage = lazy(() => import('@/pages/VolunteerProfilePage'));
const ContactPage        = lazy(() => import('@/pages/ContactPage'));
const TermsPage          = lazy(() => import('@/pages/TermsPage'));
const PrivacyPage        = lazy(() => import('@/pages/PrivacyPage'));
const FounderPage        = lazy(() => import('@/pages/FounderPage'));
const BlogPage           = lazy(() => import('@/pages/BlogPage'));
const BlogPostPage       = lazy(() => import('@/pages/BlogPostPage'));
const DynamicPage        = lazy(() => import('@/pages/DynamicPage'));
const BloodPage          = lazy(() => import('@/pages/Blood'));
const DoctorPage         = lazy(() => import('@/pages/Doctor'));
const HospitalPage       = lazy(() => import('@/pages/Hospital'));
const DoctorProfilePage  = lazy(() => import('@/pages/DoctorProfile'));
const HospitalProfilePage = lazy(() => import('@/pages/HospitalProfile'));

// ── Public tool components (lazy) ─────────────────────────────────────────────
const SimpleDonorRegistration = lazy(() => import('@/components/SimpleDonorRegistration'));
const BloodRequest            = lazy(() => import('@/components/BloodRequest'));
const DonorSearch             = lazy(() => import('@/components/DonorSearch'));
const RaceStationForm         = lazy(() => import('@/components/RaceStationForm'));

// ── Dashboard (lazy — heavy: xlsx, pdfjs, jsPDF, recharts, leaflet) ───────────
const DashboardLayout       = lazy(() => import('@/pages/dashboard/DashboardLayout'));
const DashboardOverview     = lazy(() => import('@/pages/dashboard/DashboardOverview'));
const LoginHistory          = lazy(() => import('@/pages/dashboard/LoginHistory'));
const DonorManagement       = lazy(() => import('@/pages/dashboard/DonorManagement'));
const RequestManagement     = lazy(() => import('@/pages/dashboard/RequestManagement'));
const RaceStationManagement = lazy(() => import('@/pages/dashboard/RaceStationManagement'));
const Settings              = lazy(() => import('@/pages/dashboard/Settings'));
const DonorUpload           = lazy(() => import('@/pages/dashboard/DonorUpload'));
const Analytics             = lazy(() => import('@/pages/dashboard/Analytics'));
const BlogManagement        = lazy(() => import('@/pages/dashboard/BlogManagement'));
const BlogPostForm          = lazy(() => import('@/pages/dashboard/BlogPostForm'));
const SeoManagement         = lazy(() => import('@/pages/dashboard/SeoManagement'));
const HeroSliderManagement  = lazy(() => import('@/pages/dashboard/HeroSliderManagement'));
const AboutManagement       = lazy(() => import('@/pages/dashboard/AboutManagement'));
const VolunteerManagement   = lazy(() => import('@/pages/dashboard/VolunteerManagement'));
const PageManagement        = lazy(() => import('@/pages/dashboard/PageManagement'));
const SystemHealth          = lazy(() => import('@/pages/dashboard/SystemHealth'));
const UserManagement        = lazy(() => import('@/pages/dashboard/UserManagement'));
const RoleManagement        = lazy(() => import('@/pages/dashboard/RoleManagement'));
const VisitorAnalytics      = lazy(() => import('@/pages/dashboard/VisitorAnalytics'));
const DoctorManagement      = lazy(() => import('@/pages/dashboard/DoctorManagement'));
const HospitalManagement    = lazy(() => import('@/pages/dashboard/HospitalManagement'));

// ── Loading fallback ──────────────────────────────────────────────────────────
const PageLoader = () => (
  <div style={{
    minHeight: '100vh',
    background: '#0a0a0a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <div style={{
      width: 40, height: 40,
      border: '3px solid #333',
      borderTop: '3px solid #dc2626',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ── Route wrappers ────────────────────────────────────────────────────────────
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
              <title>Find Blood Donors in Bangladesh | রক্তদাতা খুঁজুন | Next Blood BD</title>
              <meta name="description" content="Find verified blood donors across all 64 districts of Bangladesh, instantly. Search by blood group & location. Register as a donor in seconds. No account needed. | রক্তদাতা খুঁজুন বাংলাদেশে।" />
              <link rel="icon" href="/logo.svg" type="image/svg+xml" />
            </Helmet>

            <Suspense fallback={<PageLoader />}>
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
                  <Route path="/login" element={<LoginPage />} />

                  {/* Public Tools */}
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
                  <Route index element={<DashboardOverview />} />

                  <Route path="analytics" element={<AdminRoute requiredPermission={PERMISSIONS.VIEW_REPORTS}><Analytics /></AdminRoute>} />
                  <Route path="visitor-analytics" element={<AdminRoute requiredPermission={PERMISSIONS.VIEW_REPORTS}><VisitorAnalytics /></AdminRoute>} />
                  <Route path="system-health" element={<AdminRoute requiredPermission={PERMISSIONS.ACCESS_ADMIN}><SystemHealth /></AdminRoute>} />
                  <Route path="login-history" element={<AdminRoute requiredPermission={PERMISSIONS.ACCESS_ADMIN}><LoginHistory /></AdminRoute>} />

                  <Route path="donors" element={<AdminRoute requiredPermission={PERMISSIONS.VIEW_DONORS}><DonorManagement /></AdminRoute>} />
                  <Route path="upload-donors" element={<AdminRoute requiredPermission={PERMISSIONS.EDIT_DONORS}><DonorUpload /></AdminRoute>} />
                  <Route path="users" element={<AdminRoute requiredPermission={PERMISSIONS.MANAGE_USERS}><UserManagement /></AdminRoute>} />
                  <Route path="roles" element={<AdminRoute requiredPermission={PERMISSIONS.MANAGE_ROLES}><RoleManagement /></AdminRoute>} />

                  <Route path="requests" element={<AdminRoute requiredPermission={PERMISSIONS.VIEW_REQUESTS}><RequestManagement /></AdminRoute>} />
                  <Route path="race-stations" element={<AdminRoute requiredPermission={PERMISSIONS.ACCESS_ADMIN}><RaceStationManagement /></AdminRoute>} />

                  <Route path="doctors" element={<AdminRoute requiredPermission={PERMISSIONS.ACCESS_ADMIN}><DoctorManagement /></AdminRoute>} />
                  <Route path="hospitals" element={<AdminRoute requiredPermission={PERMISSIONS.ACCESS_ADMIN}><HospitalManagement /></AdminRoute>} />

                  <Route path="settings" element={<AdminRoute requiredPermission={PERMISSIONS.VIEW_SETTINGS}><Settings /></AdminRoute>} />

                  <Route path="pages" element={<AdminRoute requiredPermission={PERMISSIONS.ACCESS_ADMIN}><PageManagement /></AdminRoute>} />
                  <Route path="seo" element={<AdminRoute requiredPermission={PERMISSIONS.ACCESS_ADMIN}><SeoManagement /></AdminRoute>} />
                  <Route path="hero-slider" element={<AdminRoute requiredPermission={PERMISSIONS.ACCESS_ADMIN}><HeroSliderManagement /></AdminRoute>} />
                  <Route path="about" element={<AdminRoute requiredPermission={PERMISSIONS.ACCESS_ADMIN}><AboutManagement /></AdminRoute>} />
                  <Route path="volunteers" element={<AdminRoute requiredPermission={PERMISSIONS.ACCESS_ADMIN}><VolunteerManagement /></AdminRoute>} />
                  <Route path="blog" element={<AdminRoute requiredPermission={PERMISSIONS.ACCESS_ADMIN}><BlogManagement /></AdminRoute>} />
                  <Route path="blog/new" element={<AdminRoute requiredPermission={PERMISSIONS.ACCESS_ADMIN}><BlogPostForm /></AdminRoute>} />
                  <Route path="blog/edit/:id" element={<AdminRoute requiredPermission={PERMISSIONS.ACCESS_ADMIN}><BlogPostForm /></AdminRoute>} />
                </Route>
              </Routes>
            </Suspense>

            <Toaster />
          </Router>
        </LanguageProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
