import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BloodCellAnimation from '@/components/BloodCellAnimation';
import { useVisitorTracking } from '@/hooks/useVisitorTracking';

const Layout = () => {
  // Initialize tracking at Layout level to capture all route changes
  useVisitorTracking();

  return (
    <div className="flex flex-col min-h-screen bg-neutral-900 relative">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <BloodCellAnimation />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Header />
        <main className="flex-grow w-full pt-20">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;