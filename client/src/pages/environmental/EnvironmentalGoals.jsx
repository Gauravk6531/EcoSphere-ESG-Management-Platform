import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Target, Plus, Flag, CheckCircle2, AlertCircle } from 'lucide-react';

const EnvironmentalGoals = () => {
  const { isManager } = useAuth();
  const [goals, setGoals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '', departmentId: '', targetValue: '', currentValue: '', unit: 'tCO2e', startDate: '', endDate: ''
  });

  const fetchData = async () => {
    try {
      const [gRes, dRes] = await Promise.all([API.get('/goals'), API.get('/departments')]);
      setGoals(gRes.data.data);
      setDepartments(dRes.data.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/goals', formData);
      setShowModal(false);
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="text-emerald-500" size={18} />;
      case 'Overdue': return <AlertCircle className="text-red-500" size={18} />;
      default: return <Flag className="text-blue-500" size={18} />;
    }
  };

  return (
    <div className="space-y-6 relative h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Target className="text-emerald-600" /> Sustainability Goals
          </h1>
          <p className="text-slate-500 mt-1">Track and manage departmental and corporate environmental targets.</p>
        </div>
        {isManager() && (
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2">
            <Plus size={16} /> New Goal
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-slate-500 col-span-full">Loading goals...</p>
        ) : goals.length === 0 ? (
          <p className="text-slate-500 col-span-full">No active goals found.</p>
        ) : (
          goals.map(goal => {
            const pct = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100)) || 0;
            return (
              <div key={goal._id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative group">
                <div className="flex justify-between items-start mb-4">
                  <div className="pr-6">
                    <h3 className="font-bold text-slate-800 line-clamp-1" title={goal.title}>{goal.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{goal.department?.name || 'Company Wide'}</p>
                  </div>
                  <div className="shrink-0">{getStatusIcon(goal.status)}</div>
                </div>
                
                <div className="mb-2 flex justify-between items-end">
                  <div>
                    <span className="text-2xl font-bold text-slate-800">{goal.currentValue}</span>
                    <span className="text-xs text-slate-500 ml-1">/ {goal.targetValue} {goal.unit}</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">{pct}%</span>
                </div>
                
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
                  <div className={`h-full rounded-full transition-all duration-500 ${pct >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${pct}%` }} />
                </div>

                <div className="flex justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-t border-slate-50 pt-3">
                  <span>Start: {new Date(goal.startDate).toLocaleDateString()}</span>
                  <span>End: {new Date(goal.endDate).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">Create Goal</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Goal Title</label>
                <input type="text" name="title" required onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Target Value</label>
                  <input type="number" name="targetValue" required onChange={(e) => setFormData({...formData, targetValue: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Department</label>
                  <select name="departmentId" onChange={(e) => setFormData({...formData, departmentId: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white">
                    <option value="">Company Wide</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Start Date</label>
                  <input type="date" name="startDate" required onChange={(e) => setFormData({...formData, startDate: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">End Date</label>
                  <input type="date" name="endDate" required onChange={(e) => setFormData({...formData, endDate: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm" />
                </div>
              </div>
              <div className="pt-4 mt-6 border-t flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl text-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700">Save Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvironmentalGoals;
