import React, { useEffect, useState } from 'react';
import API from '../../services/api';

const AdminDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ name: '', code: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const { data } = await API.get('/departments');
        setDepartments(data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load departments.');
      } finally {
        setLoading(false);
      }
    };
    loadDepartments();
  }, []);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const createDepartment = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { data } = await API.post('/departments', form);
      setDepartments((prev) => [data.data, ...prev]);
      setForm({ name: '', code: '', description: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create department.');
    } finally {
      setSaving(false);
    }
  };

  const deleteDepartment = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    try {
      await API.delete(`/departments/${id}`);
      setDepartments((prev) => prev.filter((dept) => dept._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete department.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Departments</h1>
          <p className="text-sm text-slate-500">Manage department codes and descriptions for the organization.</p>
        </div>
        <button className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-all">Refresh</button>
      </div>

      {error && <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-3xl bg-white border border-slate-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Create Department</h2>
          <form onSubmit={createDepartment} className="space-y-4">
            <label className="block text-sm text-slate-700">
              Name
              <input
                type="text" name="name" value={form.name} onChange={handleChange} required
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </label>
            <label className="block text-sm text-slate-700">
              Code
              <input
                type="text" name="code" value={form.code} onChange={handleChange} required
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </label>
            <label className="block text-sm text-slate-700">
              Description
              <textarea
                name="description" value={form.description} onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                rows="4"
              />
            </label>
            <button type="submit" disabled={saving}
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400 transition-all"
            >
              {saving ? 'Saving...' : 'Create Department'}
            </button>
          </form>
        </section>

        <section className="rounded-3xl bg-white border border-slate-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Department List</h2>
          {loading ? (
            <p className="text-slate-500">Loading departments...</p>
          ) : departments.length === 0 ? (
            <p className="text-slate-500">No departments found.</p>
          ) : (
            <div className="space-y-3">
              {departments.map((dept) => (
                <div key={dept._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{dept.name} ({dept.code})</p>
                      <p className="text-sm text-slate-500 mt-1">{dept.description || 'No description provided.'}</p>
                    </div>
                    <button onClick={() => deleteDepartment(dept._id)} className="text-sm text-red-600 hover:text-red-700">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminDepartments;
