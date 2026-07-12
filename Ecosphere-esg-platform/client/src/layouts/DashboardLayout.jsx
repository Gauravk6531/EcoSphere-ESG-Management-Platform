import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';

const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation Links representing modules to be built by developers
  const navigationItems = [
    { name: 'Overview', path: '/', icon: '📊' },
    { name: 'Environmental', path: '/environmental', icon: '🌱', disabled: true },
    { name: 'Social', path: '/social', icon: '👥', disabled: true },
    { name: 'Governance', path: '/governance', icon: '⚖️', disabled: true },
    { name: 'Gamification', path: '/gamification', icon: '🏆', disabled: true },
    { name: 'Reports', path: '/reports', icon: '📄', disabled: true },
    { name: 'Settings', path: '/settings', icon: '⚙️', disabled: true }
  ];

  const handleLogout = () => {
    // Placeholder logout handler to be integrated with JWT auth hook
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 bg-white border-r border-slate-200 flex-col justify-between fixed h-full z-20">
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-green flex items-center justify-center font-bold text-lg text-white">E</div>
              <span className="font-sans font-bold text-lg tracking-wide text-slate-800">EcoSphere</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <div key={item.name} className="relative group">
                  <Link
                    to={item.disabled ? '#' : item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-premium ${
                      isActive
                        ? 'bg-brand-green-light text-brand-green-dark'
                        : item.disabled
                        ? 'text-slate-400 cursor-not-allowed'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                    {item.disabled && (
                      <span className="ml-auto text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-normal">
                        Placeholder
                      </span>
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-brand-green/20 text-brand-green-dark flex items-center justify-center font-bold">
              JD
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-semibold text-slate-800 truncate">John Doe</h4>
              <p className="text-[10px] text-slate-500 truncate">admin@ecosphere.com</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-slate-200 hover:border-red-200 rounded-lg text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50/20 transition-premium"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
          {/* Left: Hamburger menu for mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            ☰
          </button>

          {/* Center/Search Placeholder */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg w-64">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search platform..."
              className="bg-transparent text-xs border-none outline-none w-full text-slate-600"
              disabled
            />
          </div>

          {/* Right: Notifications & Profile */}
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-slate-100 relative text-lg" disabled>
              🔔
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-blue rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-brand-green/20 text-brand-green-dark flex items-center justify-center font-bold text-sm">
              JD
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-30 flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            ></div>

            {/* Menu container */}
            <nav className="relative w-64 max-w-xs bg-white h-full flex flex-col justify-between p-6">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-green flex items-center justify-center font-bold text-lg text-white">E</div>
                    <span className="font-sans font-bold text-lg text-slate-800">EcoSphere</span>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-500">
                    ✕
                  </button>
                </div>
                <div className="space-y-1">
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.name}
                        to={item.disabled ? '#' : item.path}
                        onClick={() => !item.disabled && setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-premium ${
                          isActive
                            ? 'bg-brand-green-light text-brand-green-dark'
                            : item.disabled
                            ? 'text-slate-400 cursor-not-allowed'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{item.icon}</span>
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600"
                >
                  Logout
                </button>
              </div>
            </nav>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-grow p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
