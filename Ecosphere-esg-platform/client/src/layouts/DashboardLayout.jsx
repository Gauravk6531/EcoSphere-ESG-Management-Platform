import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Leaf, Users, Building2, Zap, Package, Target,
  Activity, BarChart2, FileText, ChevronDown, ChevronRight,
  Bell, Menu, X, LogOut, Settings, User, ShieldCheck, Award
} from 'lucide-react';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [envOpen, setEnvOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin, isManager } = useAuth();

  const handleLogout = () => { logout(); navigate('/auth/login'); };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navItemClass = (path) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
      isActive(path) ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`;

  const subNavClass = (path) =>
    `flex items-center gap-3 pl-9 pr-3 py-2 rounded-xl text-sm transition-all cursor-pointer ${
      isActive(path) ? 'text-emerald-700 font-semibold bg-emerald-50/70' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
    }`;

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100 shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <Leaf size={16} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-slate-800 text-base leading-tight block">EcoSphere</span>
            <span className="text-[10px] text-slate-400 leading-none">ESG Platform</span>
          </div>
        </Link>
        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <Link to="/" className={navItemClass('/')} onClick={() => setSidebarOpen(false)}>
          <LayoutDashboard size={18} /> <span>Overview</span>
        </Link>

        {/* Environmental Module */}
        <div>
          <button
            onClick={() => setEnvOpen(p => !p)}
            className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              location.pathname.startsWith('/environmental') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3"><Leaf size={18} /> <span>Environmental</span></div>
            {envOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </button>
          {envOpen && (
            <div className="mt-1 space-y-0.5">
              <Link to="/environmental/dashboard" className={subNavClass('/environmental/dashboard')} onClick={() => setSidebarOpen(false)}>
                <BarChart2 size={14} /> Dashboard
              </Link>
              <Link to="/environmental/carbon-transactions" className={subNavClass('/environmental/carbon-transactions')} onClick={() => setSidebarOpen(false)}>
                <Activity size={14} /> Carbon Transactions
              </Link>
              <Link to="/environmental/goals" className={subNavClass('/environmental/goals')} onClick={() => setSidebarOpen(false)}>
                <Target size={14} /> Sustainability Goals
              </Link>
              <Link to="/environmental/reports" className={subNavClass('/environmental/reports')} onClick={() => setSidebarOpen(false)}>
                <FileText size={14} /> Reports
              </Link>
              {isManager() && (
                <Link to="/environmental/master-data" className={subNavClass('/environmental/master-data')} onClick={() => setSidebarOpen(false)}>
                  <Settings size={14} /> Master Data
                </Link>
              )}
            </div>
          )}
        </div>

        <Link to="/social" className={navItemClass('/social')} onClick={() => setSidebarOpen(false)}>
          <Users size={18} /> <span>Social</span>
        </Link>
        <Link to="/governance" className={navItemClass('/governance')} onClick={() => setSidebarOpen(false)}>
          <ShieldCheck size={18} /> <span>Governance</span>
        </Link>
        <Link to="/gamification" className={navItemClass('/gamification')} onClick={() => setSidebarOpen(false)}>
          <Award size={18} /> <span>Gamification</span>
        </Link>

        {/* Admin Section */}
        {isAdmin() && (
          <>
            <div className="pt-3 pb-1 px-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Administration</p>
            </div>
            <Link to="/admin/users" className={navItemClass('/admin/users')} onClick={() => setSidebarOpen(false)}>
              <Users size={18} /> <span>User Management</span>
            </Link>
            <Link to="/admin/departments" className={navItemClass('/admin/departments')} onClick={() => setSidebarOpen(false)}>
              <Building2 size={18} /> <span>Departments</span>
            </Link>
          </>
        )}
      </nav>

      {/* User Card */}
      <div className="p-3 border-t border-slate-100 shrink-0">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50">
          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.role?.name}</p>
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors p-1" title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 bg-white border-r border-slate-200 flex-col fixed h-full z-20">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 flex md:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 bg-white h-full flex flex-col shadow-2xl">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-slate-500 hover:text-slate-700">
            <Menu size={22} />
          </button>

          <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3.5 py-2 rounded-xl w-64">
            <span className="text-slate-400 text-xs">🔍</span>
            <input type="text" placeholder="Search platform..." className="bg-transparent text-sm outline-none w-full text-slate-500" disabled />
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button className="relative p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
            </button>
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
