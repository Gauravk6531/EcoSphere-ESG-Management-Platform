import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Settings, Plus, Factory, Building2 } from 'lucide-react';

const MasterData = () => {
  const [factors, setFactors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showFactorModal, setShowFactorModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  
  const [factorForm, setFactorForm] = useState({ name: '', activityType: 'Energy', factor: '', unit: '' });
  const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '' });

  const fetchData = async () => {
    try {
      const [fRes, dRes] = await Promise.all([API.get('/emission-factors'), API.get('/departments')]);
      setFactors(fRes.data.data);
      setDepartments(dRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddFactor = async (e) => {
    e.preventDefault();
    try {
      await API.post('/emission-factors', factorForm);
      setShowFactorModal(false);
      setFactorForm({ name: '', activityType: 'Energy', factor: '', unit: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding factor');
    }
  };

  const handleAddDept = async (e) => {
    e.preventDefault();
    try {
      await API.post('/departments', deptForm);
      setShowDeptModal(false);
      setDeptForm({ name: '', code: '', description: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding department');
    }
  };

  return (
    <div className="space-y-6 relative h-full">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Settings className="text-emerald-600" /> Master Data Management
        </h1>
        <p className="text-slate-500 mt-1">Manage global emission factors, departments, and system parameters.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Emission Factors */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Factory size={18} className="text-emerald-600"/> Emission Factors</h3>
            <button onClick={() => setShowFactorModal(true)} className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              <Plus size={16} /> Add New
            </button>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 text-slate-500 font-semibold text-xs border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Activity</th>
                  <th className="px-6 py-3">Factor</th>
                  <th className="px-6 py-3">Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? <tr><td colSpan="4" className="px-6 py-4 text-center">Loading...</td></tr> : 
                 factors.length === 0 ? <tr><td colSpan="4" className="px-6 py-4 text-center">No factors found. Click &apos;Add New&apos; to create one.</td></tr> :
                 factors.map(f => (
                  <tr key={f._id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-medium">{f.name}</td>
                    <td className="px-6 py-3"><span className="px-2 py-0.5 bg-slate-100 rounded text-xs">{f.activityType}</span></td>
                    <td className="px-6 py-3 font-mono">{f.factor}</td>
                    <td className="px-6 py-3 text-slate-500">{f.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Departments */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Building2 size={18} className="text-emerald-600"/> Departments</h3>
            <button onClick={() => setShowDeptModal(true)} className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              <Plus size={16} /> Add New
            </button>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 text-slate-500 font-semibold text-xs border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? <tr><td colSpan="3" className="px-6 py-4 text-center">Loading...</td></tr> : 
                 departments.length === 0 ? <tr><td colSpan="3" className="px-6 py-4 text-center">No departments found.</td></tr> :
                 departments.map(d => (
                  <tr key={d._id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-bold text-slate-500">{d.code}</td>
                    <td className="px-6 py-3 font-medium">{d.name}</td>
                    <td className="px-6 py-3 text-slate-500 truncate max-w-[200px]" title={d.description}>{d.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Factor Modal */}
      {showFactorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Add Emission Factor</h3>
              <button onClick={() => setShowFactorModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleAddFactor} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Name (e.g. Grid Electricity)</label>
                <input type="text" required value={factorForm.name} onChange={e => setFactorForm({...factorForm, name: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Activity Type</label>
                <select value={factorForm.activityType} onChange={e => setFactorForm({...factorForm, activityType: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white">
                  <option value="Energy">Energy</option>
                  <option value="Fuel">Fuel</option>
                  <option value="Travel">Travel</option>
                  <option value="Waste">Waste</option>
                  <option value="Water">Water</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Factor (Multiplier)</label>
                  <input type="number" step="0.0001" required value={factorForm.factor} onChange={e => setFactorForm({...factorForm, factor: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Unit (e.g. kWh, Liters)</label>
                  <input type="text" required value={factorForm.unit} onChange={e => setFactorForm({...factorForm, unit: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm" />
                </div>
              </div>
              <div className="pt-4 mt-6 border-t flex justify-end gap-3">
                <button type="button" onClick={() => setShowFactorModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl text-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dept Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Add Department</h3>
              <button onClick={() => setShowDeptModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleAddDept} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Department Name</label>
                <input type="text" required value={deptForm.name} onChange={e => setDeptForm({...deptForm, name: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Code (e.g. HR, IT, OPS)</label>
                <input type="text" required value={deptForm.code} onChange={e => setDeptForm({...deptForm, code: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm uppercase" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
                <textarea rows="3" value={deptForm.description} onChange={e => setDeptForm({...deptForm, description: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm"></textarea>
              </div>
              <div className="pt-4 mt-6 border-t flex justify-end gap-3">
                <button type="button" onClick={() => setShowDeptModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl text-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterData;
