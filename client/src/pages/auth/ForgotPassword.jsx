import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Mail } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call for forgot password
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1000);
  };

  return (
    <div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 rounded-2xl mb-4">
          <Leaf className="text-emerald-600" size={28} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Reset Password</h2>
        <p className="text-sm text-slate-500">Enter your email to receive a reset link</p>
      </div>

      {success ? (
        <div className="text-center">
          <div className="mb-6 px-4 py-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <h3 className="text-emerald-800 font-bold mb-1">Link Sent!</h3>
            <p className="text-sm text-emerald-700">
              If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
            </p>
          </div>
          <Link to="/auth/login" className="text-emerald-600 font-semibold hover:underline text-sm">
            ← Back to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ecosphere.com"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>

          <button
            type="submit" disabled={loading || !email}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send Reset Link'}
          </button>
          
          <div className="text-center mt-4">
            <Link to="/auth/login" className="text-slate-500 font-medium hover:text-slate-700 text-sm">
              ← Back to Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
