import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="abstract-bg" />
      <div className="min-h-screen text-slate-800 relative z-0 flex flex-col md:flex-row h-screen overflow-hidden">
        {/* Mobile-only top bar */}
        <Navbar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        {/* Sidebar Container */}
        <div className="md:h-screen md:p-6 shrink-0 flex items-center z-50 relative">
          <Sidebar
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        </div>

        {/* Main Content Pane */}
        <main className="flex-1 overflow-y-auto w-full relative z-10 pt-20 md:pt-0">
          <div className="p-4 md:py-8 md:pr-8 md:pl-2 max-w-[1400px] mx-auto h-full">
            <Outlet />
          </div>
        </main>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-white/20 backdrop-blur-md z-40 md:hidden transition-all duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </div>
    </>
  );
}
