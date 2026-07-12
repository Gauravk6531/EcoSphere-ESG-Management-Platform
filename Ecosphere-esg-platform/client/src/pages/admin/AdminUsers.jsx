import React, { useEffect, useState } from 'react';
import API from '../../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data } = await API.get('/auth/users');
        setUsers(data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load users.');
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500">View all registered users and their assigned roles.</p>
        </div>
        <button className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-all">
          Refresh list
        </button>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-500">Loading users...</div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div className="grid grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4 text-xs uppercase tracking-[0.3em] text-slate-500">
            <div className="col-span-4">Name</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-3">Department</div>
          </div>
          <div className="divide-y divide-slate-200">
            {users.map((user) => (
              <div key={user._id} className="grid grid-cols-12 gap-4 px-6 py-4 text-sm text-slate-700 items-center">
                <div className="col-span-4 font-medium">{user.name}</div>
                <div className="col-span-3 text-slate-500">{user.email}</div>
                <div className="col-span-2 text-slate-700">{user.role?.name || 'Unknown'}</div>
                <div className="col-span-3 text-slate-500">{user.department?.name || 'None'}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
