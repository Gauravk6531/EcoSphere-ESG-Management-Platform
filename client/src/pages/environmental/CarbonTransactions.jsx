import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Activity, Plus, Search, Calendar, Filter } from 'lucide-react';

const CarbonTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [factors, setFactors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedActivityType, setSelectedActivityType] = useState('');
  
  const [formData, setFormData] = useState({
    description: '',
    departmentId: user?.department?._id || '',
    emissionFactorId: '',
    activityQuantity: '',
    transactionDate: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [txnRes, deptRes, factorRes] = await Promise.all([
        API.get('/carbon'),
        API.get('/departments'),
        API.get('/emission-factors')
      ]);
      setTransactions(txnRes.data.data);
      setDepartments(deptRes.data.data);
      setFactors(factorRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleInputChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/carbon', formData);
      setShowModal(false);
      setFormData({ ...formData, description: '', activityQuantity: '', emissionFactorId: '' });
      setSelectedActivityType('');
      fetchData(); // refresh list
    } catch (err) {
      console.error('Failed to save transaction', err);
      alert(err.response?.data?.message || 'Error saving transaction');
    }
  };

  const filteredFactors = selectedActivityType 
    ? factors.filter(f => f.activityType === selectedActivityType)
    : factors;

  return (
    <div className="space-y-6 relative h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="text-emerald-600" /> Carbon Transactions
          </h1>
          <p className="text-slate-500 mt-1">Log and monitor day-to-day carbon emitting activities.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2">
          <Plus size={16} /> Log Activity
        </button>
      </div>

      {/* Filters (UI only for now) */}
      <div className="flex flex-wrap gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input type="text" placeholder="Search transactions..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <select className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 appearance-none">
            <option value="">All Departments</option>
            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input type="date" className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Activity Source</th>
                <th className="px-6 py-4 text-right">Qty</th>
                <th className="px-6 py-4 text-right">Emissions (tCO2e)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-400">Loading transactions...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-400">No transactions found. Log an activity to get started.</td></tr>
              ) : (
                transactions.map((txn) => (
                  <tr key={txn._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(txn.transactionDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium">{txn.description}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold">{txn.department?.name || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><Activity size={12}/></div>
                      <span className="truncate">{txn.emissionFactor?.name} <span className="text-xs text-slate-400">({txn.emissionFactor?.activityType})</span></span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-600">{txn.activityQuantity} <span className="text-xs text-slate-400">{txn.emissionFactor?.unit}</span></td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">{txn.carbonEmission}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">Log New Activity</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description / Note</label>
                <input type="text" name="description" required value={formData.description} onChange={handleInputChange} placeholder="e.g. Monthly HQ Electricity Bill" className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Department</label>
                  <select name="departmentId" required value={formData.departmentId} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white">
                    <option value="">Select Dept</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date</label>
                  <input type="date" name="transactionDate" required value={formData.transactionDate} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Activity Type (Category)</label>
                  <select 
                    value={selectedActivityType} 
                    onChange={(e) => {
                      setSelectedActivityType(e.target.value);
                      setFormData(p => ({ ...p, emissionFactorId: '' })); // reset source when category changes
                    }} 
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white"
                  >
                    <option value="">Select Activity Type</option>
                    <option value="Energy">Energy</option>
                    <option value="Fuel">Fuel</option>
                    <option value="Travel">Travel</option>
                    <option value="Waste">Waste</option>
                    <option value="Water">Water</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Emission Source</label>
                  <select name="emissionFactorId" required value={formData.emissionFactorId} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white">
                    <option value="">Select Emission Source</option>
                    {filteredFactors.map(f => <option key={f._id} value={f._id}>{f.name} ({f.factor} {f.unit})</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Activity Quantity {formData.emissionFactorId && <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded ml-1">in {factors.find(f => f._id === formData.emissionFactorId)?.unit}</span>}
                </label>
                <input type="number" step="0.01" name="activityQuantity" required min="0" value={formData.activityQuantity} onChange={handleInputChange} placeholder="0.00" className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
              </div>
              
              <div className="pt-4 mt-6 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl text-sm transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm">Save Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarbonTransactions;
