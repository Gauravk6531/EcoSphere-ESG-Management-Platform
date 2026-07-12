import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', organization: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Mimic API delay before registration complete
    setTimeout(() => {
      setLoading(false);
      navigate('/auth/login');
    }, 800);
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Create an account</h2>
        <p className="text-sm text-slate-500">Get started with ESG platform tracking</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Jane Smith"
            className="w-full px-3.5 py-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green/30 transition-premium"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="jane@organization.com"
            className="w-full px-3.5 py-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green/30 transition-premium"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
            Organization Name
          </label>
          <input
            type="text"
            name="organization"
            required
            value={formData.organization}
            onChange={handleChange}
            placeholder="EcoCorp Industries"
            className="w-full px-3.5 py-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green/30 transition-premium"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
            Password
          </label>
          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full px-3.5 py-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green/30 transition-premium"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-brand-green hover:bg-brand-green-dark text-white rounded-lg text-sm font-semibold transition-premium flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            'Sign Up'
          )}
        </button>
      </form>

      <div className="mt-4 text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link to="/auth/login" className="text-brand-green font-semibold hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default Register;
