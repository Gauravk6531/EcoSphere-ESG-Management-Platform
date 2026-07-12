import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthLayout = () => {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Visual Branding Section (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-green-dark text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Background visual elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-green rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-blue rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-green flex items-center justify-center font-bold text-lg text-white">E</div>
            <span className="font-sans font-bold text-xl tracking-wider">EcoSphere</span>
          </div>
        </div>

        <div className="relative z-10 my-auto max-w-md">
          <h1 className="text-4xl font-extrabold leading-tight mb-4 font-sans">
            Drive Sustainability and Governance in your Organization
          </h1>
          <p className="text-brand-green-light opacity-90 text-lg leading-relaxed">
            Monitor environmental footprint, engage employees through social impact challenges, and track compliance metrics on a single, integrated platform.
          </p>
        </div>

        <div className="relative z-10 flex justify-between text-sm text-brand-green-light opacity-75">
          <span>&copy; {new Date().getFullYear()} EcoSphere ESG</span>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
          </div>
        </div>
      </div>

      {/* Forms Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100 relative overflow-hidden">
          {/* Subtle decoration for brand alignment */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-green to-brand-blue"></div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
