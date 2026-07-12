import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { Leaf } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', roleName: 'Employee', departmentId: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    API.get('/departments').then(r => setDepartments(r.data.data || [])).catch(() => {});
  }, []);

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await register(formData);
    if (result.success) {
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/auth/login'), 1500);
    } else {
      setError(result.message);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 rounded-2xl mb-4">
          <Leaf className="text-emerald-600" size={28} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Create account</h2>
        <p className="text-sm text-slate-500">Join EcoSphere ESG Platform</p>
      </div>

      {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">⚠️ {error}</div>}
      {success && <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">✅ {success}</div>}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {[
          { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Jane Smith' },
          { label: 'Email Address', name: 'email', type: 'email', placeholder: 'jane@company.com' },
          { label: 'Password', name: 'password', type: 'password', placeholder: '••••••••' },
        ].map(({ label, name, type, placeholder }) => (
          <div key={name}>
            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">{label}</label>
            <input
              type={type} name={name} required value={formData[name]} onChange={handleChange} placeholder={placeholder}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
        ))}

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">Role</label>
          <select name="roleName" value={formData.roleName} onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white transition-all">
            <option value="Employee">Employee</option>
            <option value="Manager">Manager</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">Department</label>
          <select name="departmentId" value={formData.departmentId} onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white transition-all">
            <option value="">Select department (optional)</option>
            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 mt-1">
          {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Account'}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link to="/auth/login" className="text-emerald-600 font-semibold hover:underline">Sign in</Link>
      </p>
    </div>
  );
};

export default Register;
