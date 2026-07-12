import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Mimic API delay before redirecting to dashboard overview
    setTimeout(() => {
      setLoading(false);
      navigate('/');
    }, 800);
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome back</h2>
        <p className="text-sm text-slate-500">Sign in to monitor your ESG metrics</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="admin@ecosphere.com"
            className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green/30 transition-premium"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Password
            </label>
            <a href="#" className="text-xs text-brand-green font-medium hover:underline">
              Forgot password?
            </a>
          </div>
          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green/30 transition-premium"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-brand-green hover:bg-brand-green-dark text-white rounded-lg text-sm font-semibold transition-premium flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500">
        Don't have an account yet?{' '}
        <Link to="/auth/register" className="text-brand-green font-semibold hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  );
};

export default Login;
