import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Leaf } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(formData.email, formData.password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 rounded-2xl mb-4">
          <Leaf className="text-emerald-600" size={28} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome back</h2>
        <p className="text-sm text-slate-500">Sign in to your EcoSphere account</p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
          ⚠️ {typeof error === 'string' ? error : JSON.stringify(error)}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Email Address</label>
          <input
            type="email" name="email" required autoComplete="email"
            value={formData.email} onChange={handleChange}
            placeholder="admin@ecosphere.com"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Password</label>
            <Link to="/auth/forgot-password" className="text-xs text-emerald-600 font-medium hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'} name="password" required autoComplete="current-password"
              value={formData.password} onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 pr-11 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
            <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 mt-2"
        >
          {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sign In'}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-500">
        Don&apos;t have an account?{' '}
        <Link to="/auth/register" className="text-emerald-600 font-semibold hover:underline">Create account</Link>
      </p>
    </div>
  );
};

export default Login;
