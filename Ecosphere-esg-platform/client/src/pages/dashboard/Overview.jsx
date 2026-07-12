import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// Mock data representing overall monthly ESG scores
const chartData = [
  { month: 'Jan', score: 62 },
  { month: 'Feb', score: 65 },
  { month: 'Mar', score: 64 },
  { month: 'Apr', score: 71 },
  { month: 'May', score: 78 },
  { month: 'Jun', score: 82 }
];

const Overview = () => {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">ESG Overview</h1>
          <p className="text-slate-500 text-sm">Centralized performance tracking of sustainability and compliance goals.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white hover:bg-slate-50 font-semibold text-slate-700 transition-premium">
            Download PDF Report
          </button>
          <button className="px-4 py-2 bg-brand-green hover:bg-brand-green-dark text-white rounded-lg text-sm font-semibold transition-premium">
            Configure Metrics
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall ESG Score</span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">🌱</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-slate-800">82 / 100</h3>
            <p className="text-xs text-emerald-600 font-semibold mt-1">
              ▲ +4% <span className="text-slate-400 font-normal">from last quarter</span>
            </p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">CSR Participation</span>
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">👥</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-slate-800">64%</h3>
            <p className="text-xs text-blue-600 font-semibold mt-1">
              ▲ +12% <span className="text-slate-400 font-normal">from last month</span>
            </p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Governance Audits</span>
            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">⚖️</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-slate-800">3 / 4</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Next scheduled: <span className="text-indigo-600 font-semibold">July 28</span>
            </p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Challenges</span>
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">🏆</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-slate-800">8</h3>
            <p className="text-xs text-amber-600 font-semibold mt-1">
              128 <span className="text-slate-400 font-normal">employees competing</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Chart & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Area Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">ESG Performance Trend</h3>
              <p className="text-xs text-slate-400">Monthly composite progress chart (2026)</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">Composite Index</span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[50, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Items Box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Upcoming Tasks</h3>
            <p className="text-xs text-slate-400 mb-4">Pending requirements across organization</p>
            
            <div className="space-y-3.5">
              <div className="flex gap-3 items-start p-2.5 hover:bg-slate-50 rounded-xl transition-premium">
                <span className="text-lg mt-0.5">📄</span>
                <div>
                  <h4 className="text-xs font-semibold text-slate-800">Review carbon scope reports</h4>
                  <p className="text-[10px] text-slate-500">Environmental module • Due in 2 days</p>
                </div>
              </div>
              <div className="flex gap-3 items-start p-2.5 hover:bg-slate-50 rounded-xl transition-premium">
                <span className="text-lg mt-0.5">🔒</span>
                <div>
                  <h4 className="text-xs font-semibold text-slate-800">Distribute new anti-bribery policy</h4>
                  <p className="text-[10px] text-slate-500">Governance module • Due in 5 days</p>
                </div>
              </div>
              <div className="flex gap-3 items-start p-2.5 hover:bg-slate-50 rounded-xl transition-premium">
                <span className="text-lg mt-0.5">📢</span>
                <div>
                  <h4 className="text-xs font-semibold text-slate-800">Launch Q3 community clean-up CSR</h4>
                  <p className="text-[10px] text-slate-500">Social module • Due in 1 week</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 mt-6">
            <button className="w-full py-2 border border-brand-green/20 hover:border-brand-green text-brand-green hover:bg-brand-green/5 text-xs font-semibold rounded-lg transition-premium">
              Manage Workflow Task Board
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
